import Organization from '@/models/Organization';
import Staff from '@/models/Staff';
import Location from '@/models/Locations';
import db from '@/utils/db';
import verifyWebsite from "@/utils/websiteVerify";
import { categories } from '@/utils/config';
import { uploadFileToAzurePublic } from "@/utils/uploadFileToAzure";
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
          content: `Extract the following details from this address: "${address}, addressLine2 is optional, dont return if not used:"\n\naddressLine1:\naddressLine2:\nsuburb:\ncity:\nzip:\nprovince:\ncountry:\nformattedAddress:`
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

async function formatOperatingHours(hours) {

  // Map day numbers to keys in your schema
  const daysMapping = {
    0: { opening: 'sundayOpening', closing: 'sundayClosing', isOpen: 'sundayIsOpen' },
    1: { opening: 'mondayOpening', closing: 'mondayClosing', isOpen: 'mondayIsOpen' },
    2: { opening: 'thuesdayOpening', closing: 'thuesdayClosing', isOpen: 'thuesdayIsOpen' },
    3: { opening: 'wednesdayOpening', closing: 'wednesdayClosing', isOpen: 'wednesdayIsOpen' },
    4: { opening: 'thursdayOpening', closing: 'thursdayClosing', isOpen: 'thursdayIsOpen' },
    5: { opening: 'fridayOpening', closing: 'fridayClosing', isOpen: 'fridayIsOpen' },
    6: { opening: 'saterdayOpening', closing: 'saterdayClosing', isOpen: 'saterdayIsOpen' },
  };

  // Prepare the operating hours object
  const operatingHours = {};

  for (const period of hours) {
    const { open, close } = period;

    if (open && close) {
      const day = open.day;
      const openTime = new Date();
      openTime.setHours(open.hour, open.minute, 0, 0);

      const closeTime = new Date();
      closeTime.setHours(close.hour, close.minute, 0, 0);

      const mapping = daysMapping[day];
      if (mapping) {
        operatingHours[mapping.opening] = openTime;
        operatingHours[mapping.closing] = closeTime;
        operatingHours[mapping.isOpen] = true;
      }
    }
  }

  return operatingHours;

}

function formatPhoneNumber(phoneNumber) {
  if (!phoneNumber) return null; // Handle null or undefined input

  // Remove all non-numeric characters
  const cleanedNumber = phoneNumber.replace(/\D/g, '');

  // Ensure the number starts with '0'
  return cleanedNumber.startsWith('0') ? cleanedNumber : '0' + cleanedNumber;
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
			
            const {registeredName,tradingName,regNumber1,regNumber2,regNumber3,landlineNr,mobileNr,websiteUrl,isVatRegistered,vatNumber,consent} = req.body;

            const registrationNumber = `${regNumber1}/${regNumber2}/${regNumber3}`;

            await db.connect();
     
            const verifiedOrg = await Organization.findOne({ registrationNumber, companyVerified: true });

            if (verifiedOrg) return res.status(400).json({ success: false, message: "Organization already registered." });             

            const existingUserOrg = await Organization.findOne({ registrationNumber, registeredBy: token._id });

            if (existingUserOrg) return res.status(400).json({ success: false, message: "Organization already registered." }); 
    
            const newOrg = new Organization({
                registeredBy: token._id,
                registeredName: toTitleCase(registeredName),
                tradingName,
                regNumber1,
                regNumber2,
                regNumber3,
                registrationNumber,       
                isVatRegistered,
                vatNumber: isVatRegistered ? vatNumber : undefined,
                websiteUrl,
                landlineNr,
                mobileNr,
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
                }else if(category == 5){ type = 'Rentals'
                }

                organization.type = type;
                organization.registrationStatus = 'verification';
                organization.categories = categories[type]?.subcategories || [];

                await organization.save();

                return res.status(200).json(organization);

            }else if (verification && organization.registrationStatus === 'verification') {

                const filePath = path.join(process.cwd(), 'sample.json');
                const jsonData = await fs.readFile(filePath, 'utf8');
                const data = JSON.parse(jsonData);                
                //CIPC API                 

                const companyInfo = data.CompanyInfo; 
                const businessInfo = companyInfo.BusinessInformation; 
                const directorInfo = Array.isArray(companyInfo.DirectorInformation) ? companyInfo.DirectorInformation : [companyInfo.DirectorInformation];  
                const activeDirectors = directorInfo.filter(director => director.DirectorStatusCode === 'Active').sort((a, b) => new Date(a.AppointmentDate) - new Date(b.AppointmentDate));

                // Update organization details
                if (typeof businessInfo === 'object') {     
                  
                  organization.landlineNr = undefined; //STAGE 1 REGISTRATION ONLY
                  organization.mobileNr = undefined;   //STAGE 1 REGISTRATION ONLY          
                  organization.regNumber1 = businessInfo.RegistrationNo.split('/')[0];
                  organization.regNumber2 = businessInfo.RegistrationNo.split('/')[1];
                  organization.regNumber3 = businessInfo.RegistrationNo.split('/')[2];
                  organization.registrationStatus = 'complete';
                  organization.registeredName = toTitleCase(formatCompanyName(businessInfo.CommercialName));
                  organization.registrationNumber = businessInfo.RegistrationNo;
                  organization.registrationNumberConverted = businessInfo.RegistrationNoConverted;
                  organization.businessStartDate = new Date(businessInfo.BusinessStartDate);
                  organization.registrationDate = new Date(businessInfo.RegistrationDate);
                  organization.financialYearEnd = businessInfo.FinancialYearEnd;
                  organization.operatingStatus = toTitleCase(businessInfo.CommercialStatus);
                  organization.companyType = toTitleCase(businessInfo.CommercialType);
                  organization.taxNo = businessInfo.TaxNo; 
                  organization.description = toTitleCase(businessInfo.BusinessDesc);                  
                  organization.directorCount = businessInfo.DirectorCount;  
                  organization.companyVerified = true;
                  organization.isComplete = true;
                  
                }

                 //GOOGLE PLACES API
                const filePath2 = path.join(process.cwd(), 'sample_maps.json');
                const jsonData2 = await fs.readFile(filePath2, 'utf8');
                const placesData = JSON.parse(jsonData2);
                 
                const locations = placesData.places.filter(place => place.businessStatus === "OPERATIONAL").map(place => ({                  
             
                   displayName: place.displayName.text,  
                   formattedAddress: place.formattedAddress,    
                   phoneNr: place.nationalPhoneNumber.replace(/\s+/g, ''), 
                   latitude: place.location.latitude,
                   longitude: place.location.longitude,
                   ratingCount: place.userRatingCount,
                   rating: place.rating,
                   placesName: place.name,
                   placesId: place.id,                  
                   primaryTypeDisplayName: place.primaryTypeDisplayName.text,                   
                   directionsUrl: place.googleMapsLinks.directionsUri,
                   placeUrl: place.googleMapsLinks.placeUri,    
                   hours: place.regularOpeningHours?.periods || [],        
               
                })).sort((a, b) => b.ratingCount - a.ratingCount);   
                
                let headOfficeId = null

                for (const [index, location] of locations.entries()) {    
                  
                  const addressDetails = await extractAddressDetails(location.formattedAddress);

                  const createdLocation = await Location.create({

                    organization: organization._id,   
                    name: location.displayName,                 
                    isHeadOffice: index == 0 ? true : false,                
                    type: location.primaryTypeDisplayName,
                    formattedAddress: addressDetails.formattedAddress,
                    addressLine1: addressDetails.addressLine1,               
                    addressLine2: addressDetails.addressLine2,
                    suburb: addressDetails.suburb,
                    city: addressDetails.city,
                    zip: addressDetails.zip,
                    province: addressDetails.province,
                    country: addressDetails.country,                  
                    phoneNr: location.phoneNr,               
                    displaySortOrder: Number(index+1).toFixed(0),
                    latitude: location.latitude,
                    longitude: location.longitude,
                    ratingCount: location.ratingCount,
                    rating: location.rating,
                    placesName: location.placesName,
                    placesId: location.placesId,
                    directionsUrl: location.directionsUrl,
                    placeUrl: location.placeUrl,
                    operatingHours: await formatOperatingHours(location.hours),

                  });

                  organization.locations.push(createdLocation._id);

                  if (index == 0) headOfficeId = createdLocation._id;

                }        
         
                for (const [index, director] of activeDirectors.entries()) {

                    const addressDetails = await extractAddressDetails(director.PhysicalAddress);
                    
                    const names = director.Fullname.split(' ');
                    const firstName = toTitleCase(names[0]);
                    const surname = toTitleCase(names[names.length - 1]);
                    const middleName = names.slice(1, -1).map(toTitleCase).join(' ');
        
                    const isValidSAID = /^\d{13}$/.test(director.IDNo);
                    const dateOfBirth = isValidSAID ? extractDateOfBirthFromID(director.IDNo) : new Date(director.BirthDate);
                    const gender = isValidSAID ? extractGenderFromID(director.IDNo) : undefined;
                    const nasionality = isValidSAID ? 'South African' : undefined;
        
                    const randomPassword = generateRandomPassword();
                    const email = await generateUniqueEmail(firstName,surname,organization);

                    console.log(`Thank you for choosing AgIzzit.co.za, please find attached your login details: email: ${email} password: ${randomPassword}, Please login at https://www.agizzit.co.za/manage`);

                    const hashedPassword = await bcrypt.hash(randomPassword, saltRounds);

                    //EMPLOYEE NR TO BE GENERATED
                    const employeeNr = `EMP${Number(index+1).toFixed(0)}`;
                    const initials = await generateInitials(firstName, middleName);
              
                    const newStaff = new Staff({

                      email: email,
                      password: hashedPassword,
                      knownAs: toTitleCase(director.FirstName), 
                      isInfoVerified: true,    
                      employeeNr: employeeNr,     
                      department: 'Board of Directors',          
                      occupation: toTitleCase(director.PrincipalType),
                      initials: initials,
                      firstName: firstName,
                      middleName: middleName,
                      surname: surname,
                      fullNames: toTitleCase(director.Fullname),
                      idOrPassportNr: director.IDNo ? director.IDNo : undefined,
                      gender: gender,
                      dateOfBirth: dateOfBirth,
                      nasionality: nasionality,
                      phoneNr: director.CellularNo ? formatPhoneNumber(director.CellularNo) : undefined,
                      privatePhoneNr:  director.CellularNo ? formatPhoneNumber(director.CellularNo) : undefined,
                      addressLine1: addressDetails.addressLine1,
                      addressLine2: addressDetails.addressLine2,
                      suburb: addressDetails.suburb,
                      city: addressDetails.city,
                      zip: addressDetails.zip,
                      province: addressDetails.province,
                      country: addressDetails.country,
                      fullAddress: addressDetails.formattedAddress,
                      organization: organization._id,     
                      location: headOfficeId,           
                      isAdmin: true,
                      isDirector: true,
                      startDate: director.DirectorStatusDate ? new Date(director.DirectorStatusDate) : new Date(),
                      bankAccountHolderName: `${initials} ${surname}`,

                    });
        
                    await newStaff.save();

                    organization.directors.push(newStaff._id);
                  
                }         
                
                const websiteVerify = await verifyWebsite(organization?.websiteUrl);
                if(websiteVerify.success){      
                  
                  const azureUrl = await uploadFileToAzurePublic(websiteVerify?.logoUrl, process.env.PUBLIC_LOGO_CONTAINER);

                  organization.logoUrl = azureUrl;
                  organization.primaryColor = websiteVerify?.primaryColor;                  
                  organization.facebookPageUrl = websiteVerify?.facebookPageUrl;
                  organization.instagramPageUrl = websiteVerify?.instagramPageUrl;
                  organization.twitterPageUrl = websiteVerify?.twitterPageUrl;
                  organization.tiktokPageUrl = websiteVerify?.tiktokPageUrl;
                  organization.youtubePageUrl = websiteVerify?.youtubePageUrl;
                  organization.aboutUs = websiteVerify?.aboutUs;
                  organization.whyChooseUs = websiteVerify?.whyChooseUs;
                  organization.description = websiteVerify?.description;
                  organization.tradingName = websiteVerify?.tradingName;
                  organization.tradingNameVerified = true;
                  organization.tradingNameVerifiedAt = new Date();
                  organization.websiteUrlVerfied = true;
                  organization.websiteUrlVerifiedAt = new Date();               

                }
        
                await organization.save();
            
                const savedOrganization = await Organization.findOne({ registeredBy: token._id })
                .populate({
                    path: 'directors', // Path to the field storing director references
                    select: 'initials surname phoneNr loginHistory', // Fields to include from the staff schema
                })
                .populate({
                  path: 'locations', // Path to the field storing director references
                  select: 'formattedAddress phoneNr', // Fields to include from the staff schema
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