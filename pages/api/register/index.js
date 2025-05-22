import Organization from '@/models/Organization';
import db from '@/utils/db';

export default async function handler(req, res) {
    
    if (req.method === 'POST') {
        try {
            const {
                registeredName,
                tradingName,
                registrationNumber,
                registrationDate,
                isVatRegistered,
                vatNumber,
                websiteUrl,
                landlineNr,
                consent
            } = req.body;

            await db.connect();

            // Check if the organization already exists
            const existingOrg = await Organization.findOne({ registrationNumber });

            if (existingOrg) {
                return res.status(400).json({ success: false, message: "Organization already registered." });
            }

            // Create a new organization
            const newOrg = new Organization({
                registeredName,
                tradingName,
                registrationNumber,
                registrationDate: new Date(registrationDate),
                isVatRegistered,
                vatNumber: isVatRegistered ? vatNumber : undefined,
                websiteUrl,
                landlineNr,
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

            res.status(200).json({ 
                success: true, 
                message: "Organization registered successfully.",
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