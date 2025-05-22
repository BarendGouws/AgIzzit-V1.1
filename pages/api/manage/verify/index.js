import Staff from "@/models/Staff";
import colors from "colors";
import timestamp from "console-timestamp";
import db from "@/utils/db";
import { getToken } from 'next-auth/jwt';

const handler = async (req, res) => {

  try {

    if (req.method === "POST") {

        const authToken = await getToken({ req, secret: process.env.JWT_SECRET }); 
        if (!authToken) return res.status(401).json({ message: 'Unauthorized' });

        await db.connect();

        const { token } = req.body;

        const user = await Staff.findOne({
            _id: authToken._id,
            $or: [
              { privateEmailVerifyToken: token },
              { privatePhoneNrVerifyToken: token },
              { emailVerifyToken: token }, 
              { phoneNrVerifyToken: token }
            ]
        });
           
        if (!user) return res.status(400).json({ message: "Invalid or expired token" });           
           
         // Update verification status based on token match
         if (user.privateEmailVerifyToken === token) {

            user.privateEmailVerified = true;
            user.privateEmailVerifiedAt = new Date();
            user.privateEmailVerifyToken = undefined;

         } else if (user.privatePhoneNrVerifyToken === token) {

            user.privatePhoneNrVerified = true;
            user.privatePhoneNrVerifiedAt = new Date();
            user.privatePhoneNrVerifyToken = undefined;

         } else if (user.emailVerifyToken === token) {

            user.emailVerified = true;
            user.emailVerifiedAt = new Date();
            user.emailVerifyToken = undefined;            

         } else if (user.phoneNrVerifyToken === token) {

            user.phoneVerified = true;
            user.phoneVerifiedAt = new Date();
            user.phoneNrVerifyToken = undefined;
         }
      
        await user.save();

        res.status(200).json({ message: "Successfully verified" });

    }else if (req.method === "PUT") {

      const authToken = await getToken({ req, secret: process.env.JWT_SECRET }); 
      if (!authToken) return res.status(401).json({ message: 'Unauthorized' });

      await db.connect();

      const user = await Staff.findById(authToken._id);
      if (!user) return res.status(404).json({ message: "Profile not found" });

      const { type } = req.body;
      const token = generateToken();
    
      // Update user verification token based on type
      switch(type) {
         case 'privateEmail':
           user.privateEmailVerifyToken = token;
           break;
         case 'email': 
           user.emailVerifyToken = token;
           break;
         case 'privatePhoneNr':
           user.privatePhoneNrVerifyToken = token;
           break;
         case 'phone':
           user.phoneNrVerifyToken = token;
           break;
      }
    
      await user.save();

      res.status(200).json({ message: 'Verification code resent successfully' });

    }else{

       res.status(405).send({ message: "Method not allowed" });
    }

  } catch (error) {
    console.error(`${colors.red("error")} - ${error.message}, ${colors.yellow(req.method + " /api/manage/verify")} @ ${colors.blue(timestamp("DD-MM-YY hh:mm:ss"))}`);
    res.status(500).send({ message: "Internal Server Error" });
  }

};

const generateToken = () => {
   const timestamp = Date.now().toString(36);
   const random = Math.random().toString(36).substring(2);
   return timestamp + random;
 }

export default handler;