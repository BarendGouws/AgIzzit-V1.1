import Staff from "@/models/Staff";
import Organization from "@/models/Organization";
import colors from "colors";
import timestamp from "console-timestamp";
import db from "@/utils/db";
import { getToken } from 'next-auth/jwt';

const handler = async (req, res) => {

  try {

          if(req.method === "GET"){

        const token = await getToken({ req, secret: process.env.JWT_SECRET });  

        if (!token || !token.isStaffMember) { return res.status(401).json({ message: 'Unauthorized' }); }

        await db.connect();

        const profile = await Staff.findById(token._id).populate({ path: 'organization', select: 'registeredName websiteUrl payslip leave loans attendance' }).populate({ path: 'changes.user', select: 'fullNames'}).select("-password -__v -createdAt -updatedAt");

        if(profile?.emailVerified) return res.json({ profile: profile });

        const message = "Your work email is not verified. Please verify your email to continue.";

        if (profile) return res.json({
          profile: profile,       
          message: message,
        });

        res.status(404).json({ msg: "Profile not found." });

    }else if(req.method === "PUT") {

      const token = await getToken({ req, secret: process.env.JWT_SECRET });
      if (!token) return res.status(401).json({ msg: "Unauthorized" });
     
      await db.connect();
      const profile = await Staff.findById(token._id).select("-password -__v -createdAt -updatedAt");
      if (!profile) return res.status(404).json({ msg: "Profile not found." });
     
      const updates = req.body;
      const changes = [];
     
      const generateToken = () => {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2);
        return timestamp + random;
      }
     
      // Check specific fields first
      const emailChanged = updates.privateEmail !== profile.privateEmail;
      const phoneChanged = updates.privatePhoneNr !== profile.privatePhoneNr || 
                          updates.phoneNrExt !== profile.phoneNrExt;

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

        const oldValue = profile[key];
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
     
          profile[key] = newValue;
        }
      });
     
      // Handle verification resets if needed
      if (emailChanged) {
        profile.privateEmailVerified = false;
        profile.privateEmailVerifiedAt = undefined;
        profile.privateEmailVerifyToken = generateToken();
      }
     
      if (phoneChanged) {
        profile.privatePhoneNrVerified = false;
        profile.privatePhoneNrVerifiedAt = undefined;
        profile.privatePhoneNrVerifyToken = generateToken();
      }
     
      console.log(profile)

      if (!profile.changes) profile.changes = [];

      if (changes.length > 0) {
        profile.changes = [...changes, ...profile.changes]
      }

      profile.isComplete = true;
     
      await profile.save();

      let message = "Profile updated successfully.";

      if (emailChanged && phoneChanged) {
      message = "Profile updated. Please verify your email address and phone number.";
      } else if (emailChanged) {
      message = "Profile updated. Please verify your email address.";
      } else if (phoneChanged) {
      message = "Profile updated. Please verify your phone number.";
      }

      const updatedProfile = await Staff.findById(token._id)
      .populate({ 
        path: 'organization',
        select: 'registeredName websiteUrl payslip leave loans attendance' 
      })
      .populate({
        path: 'changes.user',
        select: 'fullNames'
      })
      .select("-password -__v -createdAt -updatedAt")  

      res.status(200).json({ profile: updatedProfile, message });

    }else{

       res.status(405).send({ message: "Method not allowed" });
    }

  } catch (error) {
    console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/manage/profile")} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
    res.status(500).send({ message: "Internal Server Error" });
  }

};

export default handler;

//HELPER FUNCTIONS
const getFieldName = (text) => {

  const result = text.replace(/([A-Z])/g, " $1");
  const finalResult = result.charAt(0).toUpperCase() + result.slice(1);
  return finalResult

}
