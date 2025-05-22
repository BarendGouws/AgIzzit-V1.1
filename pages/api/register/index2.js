import Organization from '@/models/Organization'; // Adjust the import path as needed
import db from '@/utils/db';
import axios from 'axios';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {

            const { registrationNumber } = req.body;
            const [reg1, reg2, reg3] = registrationNumber.split('/');

            await db.connect();

            // Check if the organization already exists
            const existingOrg = await Organization.findOne({ registrationNumber });

            if (existingOrg) {
                return res.status(400).json({ success: false, message: "Organization already registered." });
            }

            // Step 1: CIPC Company Match
            const matchResponse = await axios.post(`${process.env.CIPC_API_URL}/webservice/pbverify-cipc-company-match`, {
                memberkey: process.env.CIPC_MEMBER_KEY,
                password: process.env.CIPC_PASSWORD,
                company_details: {
                    yourReference: 'CompanyRegistration',
                    reg1,
                    reg2,
                    reg3,
                    businessName: ''
                }
            },{
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('Match response:', matchResponse.data);

            if (matchResponse.data.Status !== "Success") {
                return res.status(400).json({ success: false, message: "CIPC company match failed." });
            }

            const { EnquiryID, EnquiryResultID } = matchResponse.data.Companies;

            // Step 2: CIPC Company Search
            const searchResponse = await axios.post(`${process.env.CIPC_API_URL}/webservice/pbverify-cipc-company-search`, {
                memberkey: process.env.CIPC_MEMBER_KEY,
                password: process.env.CIPC_PASSWORD,
                company_details: {
                    EnquiryID,
                    EnquiryResultID,
                    yourReference: 'CompanyRegistration'
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            console.log('Search response:', JSON.stringify(searchResponse.data));

            if (searchResponse.data.Status !== "Success") {
                return res.status(400).json({ success: false, message: "CIPC company search failed." });
            }

            const companyInfo = searchResponse.data.CompanyInfo; console.log('Company Info:', companyInfo);
            const businessInfo = companyInfo.BusinessInformation; console.log('Business Info:', businessInfo);
            const directorInfo = companyInfo.DirectorInformation; console.log('Director Info:', directorInfo);

            const newOrg = new Organization({
                verifcation: searchResponse.data,
                registrationNumber: registrationNumber,
            });

            await newOrg.save();

            res.status(200).json({ 
                success: true, 
                message: "Organization verified and registered successfully.",
                organizationDetails: newOrg
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ success: false, message: "An error occurred during registration." });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}