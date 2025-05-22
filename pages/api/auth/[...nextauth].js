// pages/api/auth/[...nextauth].js

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import User from '@/models/User';
import Staff from '@/models/Staff';
import Organization from '@/models/Organization';
import db from '@/utils/db';
import bcryptjs from 'bcryptjs';

// Define your authOptions
export const authOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) { console.log('credentials',credentials);
        await db.connect();

        if(credentials.callbackUrl.toString().includes('/manage')) {

          const user = await Staff.findOne({ email: credentials.email }); 

          if (credentials.isPasswordReset) { 
            // Check if we have the required password fields
            if (!credentials.currentPassword || !credentials.newPassword) throw new Error('Current and new password are required');
    
            // Verify current password
            if (!bcryptjs.compareSync(credentials.currentPassword, user.password)) throw new Error('Current password is incorrect');

            try {            
                // Hash and update the new password
                const hashedPassword = await bcryptjs.hash(credentials.newPassword, 10);
                user.password = hashedPassword;
                user.isTempPassword = false;
                user.passwordChangedAt = new Date();
                user?.loginHistory?.unshift({ loginDate: new Date(), loginMethod: 'password' });
                user?.timeline?.unshift({ timestamp: new Date(), description: 'Password changed', staff: user._id });
    
                await user.save();
    
                return {
                    _id: user._id,
                    name: user.knownAs,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    image: user.profileImage,
                    isStaffMember: true,
                    passwordChanged: true,
                    isDirector: user.isDirector 
                };

            } catch (error) {
                console.error('Password update error:', error);
                throw new Error('Failed to update password');
            }
          }

          if (user && bcryptjs.compareSync(credentials.password, user.password)) {

            //PASSWORD RECIEVED FROM PHONE NR, NOW VERIFIED
            if(user.isTempPassword){
                            
                user.phoneVerified = true;
                user.phoneVerifiedAt = new Date();

                //IF BOTH WORK AND PRIVATE THE SAME
                if(user.privatePhoneNr == user.phoneNr){
                  user.privatePhoneNrVerified = true;
                  user.privatePhoneNrVerifiedAt = new Date();
                }

                await user.save();

                return {
                  _id: user._id,
                  name: user.knownAs,
                  email: user.email,
                  emailVerified: user.emailVerified,
                  image: user.profileImage,
                  isStaffMember: true,
                  isTempPassword: true,
                  isDirector: user.isDirector 
                };

            }

            user.loginHistory.unshift({ loginDate: new Date(), loginMethod: 'password' });    
            await user.save();          

            return {
              _id: user._id,
              name: user.knownAs,
              email: user.email,
              emailVerified: user.emailVerified,
              image: user.profileImage,
              isStaffMember: true,
              isDirector: user.isDirector             
            };
          }

          throw new Error('Invalid email or password');

        }else{

          const user = await User.findOne({ email: credentials.email });
          if (user && bcryptjs.compareSync(credentials.password, user.password)) {
            return {
              _id: user._id,
              name: user.knownAs,
              email: user.email,
              emailVerified: user.emailVerified,
              image: user.profileImage,
            };
          }
          throw new Error('Invalid email or password');

        }        
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    // Uncomment and configure FacebookProvider if needed
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_ID,
    //   clientSecret: process.env.FACEBOOK_SECRET,
    // })
  ],
  callbacks: {    
    async signIn({ user, account, profile }) {
      try {
        await db.connect();
        let dbUser;

        if (account.provider === 'credentials') { console.log('Credentials:', user);

          if(user.isStaffMember) {
            dbUser = await Staff.findOne({ email: user.email }).populate({ path: 'organization', select: 'registeredName type' });
            dbUser.isStaffMember = true;
            if (!dbUser) return false;
            console.log('Staff:', dbUser);
          }else{
            dbUser = await User.findOne({ email: user.email });
            if (!dbUser) return false;           
          }

        } else if (account.provider === 'google' || account.provider === 'facebook') {
          dbUser = await User.findOne({ email: profile.email });

          const profileImageBase64 = profile.picture ? await convertImageToBase64(profile.picture) : '/images/user.png';
          console.log('Profile Image:', profileImageBase64);  

          if (!dbUser) {
            dbUser = new User({
              email: profile.email,
              emailVerified: account.provider === 'google' ? profile.email_verified : true,
              registrationMethodforEmail: account.provider,
              knownAs: profile.name,
              profileImage: profileImageBase64
            });
            await dbUser.save();
          } else {

            if (profile.picture && dbUser.profileImage !== profileImageBase64) { dbUser.profileImage = profileImageBase64;}
            dbUser.loginHistory.push({ loginDate: new Date(), loginMethod: account.provider });
            await dbUser.save();

          }
        }

        if (dbUser) {           
          user._id = dbUser._id;
          user.email = dbUser.email;
          user.emailVerified = dbUser.emailVerified;
          user.name = dbUser?.fullNames ? dbUser.fullNames : dbUser.knownAs;      
          user.image = dbUser.profileImage;
          user.isComplete = dbUser.isComplete;
          user.isVerified = dbUser.isVerified;
          user.isStaffMember = dbUser.isStaffMember || false 
          user.isDirector = dbUser.isDirector || false 
          if(user.isStaffMember){ 

            user.name = `${dbUser.initials} ${dbUser.surname}`
            user.organization = dbUser.organization              
          
          }
          if(dbUser.isTempPassword){ user.isTempPassword = dbUser.isTempPassword }
        }

        return true;
      } catch (error) {
        console.error("SignIn Error:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token._id = user._id;
        token.email = user.email;
        token.emailVerified = user.emailVerified
        token.name = user.name;
        token.image = user.image;
        token.isComplete = user.isComplete;
        token.isVerified = user.isVerified;
        token.isStaffMember = user.isStaffMember || false
        token.isDirector = user.isDirector || false
        if(user.isStaffMember){ token.organization = user.organization }
        if(user.isTempPassword){ token.isTempPassword = user.isTempPassword }
      }
      return token;
    },
    async session({ session, token }) {      
      if (token) {
        session.user._id = token._id;
        session.user.email = token.email;
        session.user.emailVerified = token.emailVerified
        session.user.name = token.name;
        session.user.image = token.image;
        session.user.isComplete = token.isComplete;
        session.user.isVerified = token.isVerified;
        session.user.isStaffMember = token.isStaffMember || false;
        session.user.isDirector = token.isDirector || false;
        if(token.isStaffMember){ session.user.organization = token.organization }
        if(token.isTempPassword){ session.user.isTempPassword = token.isTempPassword }

      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.JWT_SECRET,
};

// Export default NextAuth using authOptions
export default NextAuth(authOptions);

async function convertImageToBase64(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    const base64String = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type');
    return `data:${contentType};base64,${base64String}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    return '/images/user.png'; // fallback image
  }
}
