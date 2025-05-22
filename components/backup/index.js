import Organization from '@/models/Organization';
import Staff from '@/models/Staff';
import Location from '@/models/Locations';
import db from '@/utils/db';
import { getToken } from 'next-auth/jwt';
import { promises as fs } from 'fs';
import path from 'path';
import OpenAI from 'openai';
import bcrypt from 'bcryptjs';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const saltRounds = 10;

const validProvinces = [
    "Gauteng",
    "Western Cape",
    "Eastern Cape",
    "Free State",
    "Limpopo",
    "Mpumalanga",
    "Northern Cape",
    "North West",
    "KwaZulu-Natal"  // Added this as it was missing from your list but is a valid SA province
];
  
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}
  
function findClosestProvince(input) {
    const inputLower = input.toLowerCase();
    return validProvinces.find(province => inputLower.includes(province.toLowerCase())) || "Unknown";
}
  
async function extractAddressDetails(address) {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that extracts address details from a given address string."
        },
        {
          role: "user",
          content: `Extract the following details from this address: "${address}, addressLine2 is optional and must be undefined if optional:"\n\naddressLine1:\naddressLine2:\nsuburb:\ncity:\nzip:\nprovince:\ncountry:\nformattedAddress:`
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
});
  
    const extractedDetails = response.choices[0].message.content.split('\n').reduce((acc, line) => {
      const [key, value] = line.split(':');
      if (key && value) {
        acc[key.trim()] = toTitleCase(value.trim());
      }
      return acc;
    }, {});
  
    extractedDetails.province = findClosestProvince(extractedDetails.province || '');
  
    return extractedDetails;
}
  
function extractGenderFromID(idNumber) {
    const genderDigit = parseInt(idNumber.substr(6, 1));
    return genderDigit < 5 ? 'Female' : 'Male';
}
  
function extractDateOfBirthFromID(idNumber) {
    const year = parseInt(idNumber.substr(0, 2));
    const month = parseInt(idNumber.substr(2, 2));
    const day = parseInt(idNumber.substr(4, 2));
    const fullYear = year < 50 ? 2000 + year : 1900 + year;
    return new Date(fullYear, month - 1, day);
}

const generateUniqueEmail = async (firstName, surname, organization) => {

    const domain = organization.websiteUrl
      .replace(/https?:\/\//, "") // Remove "http://" or "https://"
      .replace(/\//g, ""); // Remove any remaining slashes
  
    // Base email
    let email = `${firstName?.toLowerCase()}.${surname?.toLowerCase()}@${domain}`;
  
    // Check if the email exists in the database
    let count = 0;
    while (await Staff.findOne({ email })) {
      count++;
      email = `${firstName?.toLowerCase()}${count}.${surname?.toLowerCase()}@${domain}`;
    }
  
    return email;
};

const generateInitials = async (firstName, middleName) => {
    // Collect all the name components (excluding the surname) into an array
    const names = [firstName, middleName].filter(Boolean); // Filter out undefined or null values
  
    // Map over the names to get the first character of each, convert to uppercase, and concatenate them
    const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
  
    return initials;
};
  
const generateRandomPassword = (length = 12) => {

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&?';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
};

function formatCompanyName(str) {
    // Ensure there's a space before and after `(PTY)`
    const formatted = str.replace(/\(PTY\)/g, ' (PTY) ');
    
    // Remove any extra spaces added around `(PTY)` and trim the result
    return formatted.replace(/\s+/g, ' ').trim();
}

export default async function handler(req, res) {

            if(req.method === 'GET') {

            const token = await getToken({ req, secret: process.env.JWT_SECRET });

            if (!token) { return res.status(401).json({ message: 'Unauthorized' }); }

                try {	
        
                    await db.connect();
  
                    const organization = await Organization.findOne({ registeredBy: token._id }).populate({
                        path: 'directors', // Path to the field storing director references
                        select: 'initials surname phoneNr loginHistory', // Fields to include from the staff schema
                      });
        
                    if (!organization) {
                        return res.status(404).json({ success: false, message: "No organizations found." });
                    }
        
                    return res.status(200).json(organization);
        
                } catch (error) {
                    console.error('Registration error:', error);
                    res.status(500).json({ success: false, message: "An error occurred during registration." });
                }                        

    }else if (req.method === 'POST') {

        try {

            const token = await getToken({ req, secret: process.env.JWT_SECRET });  

            if (!token) { return res.status(401).json({ message: 'Unauthorized' });}
			
            const {
                registeredName,
                tradingName,
                regNumber1,
                regNumber2,
                regNumber3,    
                landlineNr,  
                mobileNr,   
                websiteUrl,    
                isVatRegistered,
                vatNumber,
                consent
            } = req.body;

            const registrationNumber = `${regNumber1}/${regNumber2}/${regNumber3}`;

            await db.connect();

            // Check if the organization already exists and is verified
            const verifiedOrg = await Organization.findOne({ registrationNumber, companyVerified: true });

            if (verifiedOrg) {
                return res.status(400).json({ success: false, message: "Organization already registered." });
            }    
            
            // Check if the organization already exists and is verified
            const existingUserOrg = await Organization.findOne({ registrationNumber, registeredBy: token._id });

            if (existingUserOrg) {
                return res.status(400).json({ success: false, message: "Organization already registered." });
            } 
            
            const newLandlineNr = landlineNr.startsWith('0') ? landlineNr.replace('0','27') : `27${landlineNr}`;
            const newMobileNr = mobileNr.startsWith('0') ? mobileNr.replace('0','27') : `27${mobileNr}`;

            // Create a new organization
            const newOrg = new Organization({
                registeredBy: token._id,
                registeredName,
                tradingName,
                regNumber1,
                regNumber2,
                regNumber3,
                registrationNumber,       
                isVatRegistered,
                vatNumber: isVatRegistered ? vatNumber : undefined,
                websiteUrl,
                landlineNr: newLandlineNr,
                mobileNr: newMobileNr,
                companyVerified: false,
                isActive: true,
                isComplete: false,
                consents: [{
                    name: "Company Representative",
                    description: "Confirmation of being a company representative with authority to register",
                    isAccepted: consent,
                    timestamp: new Date()
                }]
            });

            await newOrg.save();

            return res.status(200).json(newOrg);

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ success: false, message: "An error occurred during registration." });
        }

    }else if (req.method === 'PUT') {

        try {

            const token = await getToken({ req, secret: process.env.JWT_SECRET });  

            if (!token) { return res.status(401).json({ message: 'Unauthorized' });}

            console.log('req.body',req.body);         
			
            const  { category, verification, _id } = req.body;   

            await db.connect();

            const organization = await Organization.findOne({ _id });
            if (!organization) return res.status(404).json({ success: false, message: "No organizations found." });   

            if(category && organization.registrationStatus == "category"){

                let type

                      if(category == 1){ type = 'Dealership'
                }else if(category == 2){ type = 'Property'
                }else if(category == 3){ type = 'Goods'
                }else if(category == 4){ type = 'Services'
                }

                organization.type = type;
                organization.registrationStatus = 'verification';

                await organization.save();

                return res.status(200).json(organization);

            }else if (verification && organization.registrationStatus === 'verification') {

                const filePath = path.join(process.cwd(), 'sample.json');
                const jsonData = await fs.readFile(filePath, 'utf8');
                const data = JSON.parse(jsonData);
        
                const companyInfo = data.CompanyInfo; 
                const businessInfo = companyInfo.BusinessInformation; 
                const directorInfo = Array.isArray(companyInfo.DirectorInformation) ? companyInfo.DirectorInformation : [companyInfo.DirectorInformation];
        
                // Update organization details
                if (typeof businessInfo === 'object') {
                  organization.registeredName = toTitleCase(formatCompanyName(businessInfo.CommercialName));
                  organization.regNumber1 = businessInfo.RegistrationNo.split('/')[0];
                  organization.regNumber2 = businessInfo.RegistrationNo.split('/')[1];
                  organization.regNumber3 = businessInfo.RegistrationNo.split('/')[2];
                  organization.registrationNumber = businessInfo.RegistrationNo;
                  organization.businessStartDate = new Date(businessInfo.BusinessStartDate);
                  organization.registrationDate = new Date(businessInfo.RegistrationDate);
                  organization.financialYearEnd = businessInfo.FinancialYearEnd;
                  organization.operatingStatus = toTitleCase(businessInfo.CommercialStatus);
                  organization.companyType = toTitleCase(businessInfo.CommercialType);
                  organization.taxNo = businessInfo.TaxNo;                    
                  organization.refNo = businessInfo.ReferenceNo; 
                  organization.description = toTitleCase(businessInfo.BusinessDesc);
                  organization.registrationNumberConverted = businessInfo.RegistrationNoConverted;
                  organization.directorCount = businessInfo.DirectorCount;  
                  organization.companyVerified = true;
                  organization.isComplete = true;
                  organization.registrationStatus = 'complete';
                }

                const locationDetails = await extractAddressDetails(businessInfo.PhysicalAddress);

                const mapUrl = '';
                const lat = '';
                const lng = '';

                // Create organization location
                await Location.create({

                    organization: organization._id,
                    name: organization.tradingName,
                    isHeadOffice: true,
                    active: true,
                    activeDate: new Date(organization.registrationDate),
                    type: 'Head Office',
                    formattedAddress: addressDetails.formattedAddress,
                    addressLine1: addressDetails.addressLine1,               
                    addressLine2: addressDetails.addressLine2,
                    suburb: addressDetails.suburb,
                    city: addressDetails.city,
                    zip: addressDetails.zip,
                    province: addressDetails.province,
                    country: addressDetails.country,
                    mapUrl: mapUrl,
                    phoneNr: '',
                    alternativePhoneNr: '',
                    displaySortOrder: 1,

                });
        
                // Process directors and create staff entries
                for (const director of directorInfo) {
                  if (director.DirectorStatusCode === 'Active') {

                    const addressDetails = await extractAddressDetails(director.PhysicalAddress);
                    
                    const names = director.Fullname.split(' ');
                    const firstName = toTitleCase(names[0]);
                    const surname = toTitleCase(names[names.length - 1]);
                    const middleName = names.slice(1, -1).map(toTitleCase).join(' ');
        
                    const isValidSAID = /^\d{13}$/.test(director.IDNo);
                    const dateOfBirth = isValidSAID ? extractDateOfBirthFromID(director.IDNo) : new Date(director.BirthDate);
                    const gender = isValidSAID ? extractGenderFromID(director.IDNo) : undefined;
        
                    const randomPassword = generateRandomPassword();
                    const email = await generateUniqueEmail(firstName,surname,organization);

                    console.log(`Thank you for choosing AgIzzit.co.za, please find attached your login details: email: ${email} password: ${randomPassword}, Please login at https://www.agizzit.co.za/manage`);

                    const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

                    //EMPLOYEE NR TO BE GENERATED
                    const employeeNr = '';
              
                    const newStaff = new Staff({

                      email: email,
                      knownAs: toTitleCase(director.FirstName),
                      password: hashedPassword,
                      isActive: true,                   
                      isInfoVerified: true,    
                      employeeNr: employeeNr,     
                      department: 'Directors',          
                      occupation: toTitleCase(director.PrincipalType),
                      initials: await generateInitials(firstName, middleName),
                      firstName: firstName,
                      middleName: middleName,
                      surname: surname,
                      fullNames: toTitleCase(director.Fullname),
                      idOrPassportNr: director.IDNo,
                      gender: gender,
                      dateOfBirth: dateOfBirth,
                      nasionality: isValidSAID ? 'South African' : undefined,
                      phoneNr: director.CellularNo ? parseInt(director.CellularNo.replace(/\D/g, '')) : undefined,
                      privatePhoneNr:  director.CellularNo ? parseInt(director.CellularNo.replace(/\D/g, '')) : undefined,
                      addressLine1: addressDetails.addressLine1,
                      addressLine2: addressDetails.addressLine2,
                      suburb: addressDetails.suburb,
                      city: addressDetails.city,
                      zip: addressDetails.zip,
                      province: addressDetails.province,
                      country: addressDetails.country,
                      fullAddress: addressDetails.formattedAddress,
                      organization: organization._id,                
                      isAdmin: true,
                      isDirector: true,
                      startDate: director.DirectorStatusDate ? new Date(director.DirectorStatusDate) : new Date(),
                    });
        
                    await newStaff.save();

                    organization.directors.push(newStaff._id);

                  }
                }
        
                await organization.save();

                

                const savedOrganization = await Organization.findOne({ registeredBy: token._id }).populate({
                    path: 'directors', // Path to the field storing director references
                    select: 'initials surname phoneNr loginHistory', // Fields to include from the staff schema
                });
        
                return res.status(200).json(savedOrganization);

            }else{
              return res.status(400).json({ success: false, message: "Bad Request" });
            }

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ success: false, message: "An error occurred during registration." });
        }

    }else{
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}