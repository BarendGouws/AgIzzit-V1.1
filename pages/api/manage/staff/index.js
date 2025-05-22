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

        if (!token) { return res.status(401).json({ message: 'Unauthorized' }); }

        await db.connect();

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sort = req.query.sort || '-updatedAt';
        const search = req.query.search || '';
        const status = req.query.status || '';

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Build query
        let query = {};
        
        // Add search functionality
        if (search) {
          query.$or = [
            { fullNames: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ];
        }

        // Add status filter
        if (status) {
          query.status = status;
        }

        // Get total count for pagination
        const totalCount = await Staff.countDocuments(query);

        // Execute query with pagination
        const staff = await Staff.find(query)
          .populate({ 
            path: 'organization', 
            select: 'registeredName websiteUrl payslip leave loans attendance' 
          })
          .populate({ 
            path: 'changes.user', 
            select: 'fullNames'
          })
          .populate({ 
            path: 'timeline.staff', 
            select: 'fullNames'
          })
          .select("-password -__v -createdAt -updatedAt")
          .sort(sort)
          .skip(skip)
          .limit(limit);

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return res.json({
          staff,
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage,
            hasPreviousPage
          }
        });

    }else if(req.method === "PUT") {

      const token = await getToken({ req, secret: process.env.JWT_SECRET });
      if (!token) return res.status(401).json({ msg: "Unauthorized" });
     
      await db.connect();

      const profile = await Staff.findById(token._id)
      .populate({ path: 'organization', select: 'registeredName websiteUrl payslip leave loans attendance' })
      .populate({ path: 'changes.user', select: 'fullNames'})
      .populate({ path: 'timeline.staff', select: 'fullNames'}).select("-password -__v -createdAt -updatedAt");

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
    console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/manage/staff")} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
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
