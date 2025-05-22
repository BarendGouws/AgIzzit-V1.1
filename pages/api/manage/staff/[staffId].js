import Staff from "@/models/Staff";
import Organization from "@/models/Organization";
import colors from "colors";
import timestamp from "console-timestamp";
import db from "@/utils/db";
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {

    try {

    if (req.method == 'GET') {

        const token = await getToken({ req, secret: process.env.JWT_SECRET });  

        if (!token || !token.isStaffMember) { return res.status(401).json({ message: 'Unauthorized' }); }

        await db.connect();

        const { staffId } = req.query;

        const staffMember = await Staff.findById(staffId).populate({ path: 'organization', select: 'registeredName websiteUrl payslip leave loans attendance' }).populate({ path: 'changes.user', select: 'fullNames'}).select("-password -__v -createdAt -updatedAt");

        if(staffMember?.emailVerified) return res.json({ staffMember: staffMember });

        const message = "Your work email is not verified. Please verify your email to continue.";

        if (staffMember) return res.json({
          staffMember: staffMember,       
          message: message,
        });

        res.status(404).json({ msg: "Staff member not found." });       

    }else if(req.method == 'PUT'){ 

        const token = await getToken({ req, secret: process.env.JWT_SECRET });
        if (!token) return res.status(401).json({ msg: "Unauthorized" });
        
        await db.connect();

        const { staffId } = req.query;

        const staff = await Staff.findById(staffId).select("-password -__v -createdAt -updatedAt");
        if (!staff) return res.status(404).json({ msg: "Staff member not found." });
        
        const updates = req.body;
        const changes = [];
        
        const generateToken = () => {
            const timestamp = Date.now().toString(36);
            const random = Math.random().toString(36).substring(2);
            return timestamp + random;
        }
        
        // Check specific fields first
        const emailChanged = updates.privateEmail !== staff.privateEmail;
        const phoneChanged = updates.privatePhoneNr !== staff.privatePhoneNr || 
                            updates.phoneNrExt !== staff.phoneNrExt;

        const ignoreKeys = [
                                'organization',
                                'loginHistory', 
                                'identityVerification',
                                '__v',
                                'updatedAt',
                                'createdAt',
                                'documents',
                                'consents',
                                'bankAccountVerifications', 
                                'comissionStructure',
                                'targets',
                                'targetHistory',
                                'additionalFields',
                                'changes',
                                '_id',
                                'password',
                                'emailVerifyToken',
                                'phoneNrVerifyToken',
                                'privateEmailVerifyToken', 
                                'privatePhoneNrVerifyToken',
                                'identityVerifyToken'
                            ];
        
        Object.keys(updates).forEach((key) => {

            if (ignoreKeys.includes(key)) return;

            const oldValue = staff[key];
            const newValue = updates[key];
            const isEqual = JSON.stringify(oldValue) === JSON.stringify(newValue);
            
            if (!isEqual) {
            changes.push({
                timestamp: new Date(),
                fieldId: key,
                fieldName: getFieldName(key),
                from: oldValue?.toString() || '',
                to: newValue?.toString() || '',
                user: token._id
            });
        
            staff[key] = newValue;
            }
        });
        
        // Handle verification resets if needed
        if (emailChanged) {
            staff.privateEmailVerified = false;
            staff.privateEmailVerifiedAt = undefined;
            staff.privateEmailVerifyToken = generateToken();
        }
        
        if (phoneChanged) {
            staff.privatePhoneNrVerified = false;
            staff.privatePhoneNrVerifiedAt = undefined;
            staff.privatePhoneNrVerifyToken = generateToken();
        }

        if (!staff.changes) staff.changes = [];

        if (changes.length > 0) {
            staff.changes = [...changes, ...staff.changes]
        }

        staff.isComplete = true;
        
        await staff.save();

        let message = "Staff member updated successfully.";

        if (emailChanged && phoneChanged) {
        message = "Staff Profile updated. Please verify your email address and phone number.";
        } else if (emailChanged) {
        message = "Staff Profile updated. Please verify your email address.";
        } else if (phoneChanged) {
        message = "Staff Profile updated. Please verify your phone number.";
        }

        const staffMember = await Staff.findById(staffId)
        .populate({ 
            path: 'organization',
            select: 'registeredName websiteUrl payslip leave loans attendance' 
        })
        .populate({
            path: 'changes.user',
            select: 'fullNames'
        })
        .select("-password -__v -createdAt -updatedAt")  

        res.status(200).json({ staffMember, message });

    }
        
    } catch (error) {
        console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/manage/staff/:id")} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
        res.status(500).send({ message: "Internal Server Error" });
    }

}

//HELPER FUNCTIONS
const getFieldName = (text) => {

    const result = text.replace(/([A-Z])/g, " $1");
    const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
    return finalResult
  
}