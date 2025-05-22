import colors from "colors";
import timestamp from "console-timestamp";
import db from "@/utils/db";
import banks from '@/components/backup/banks'
import Organization from "@/models/Organization";
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
 try {
   const token = await getToken({ req, secret: process.env.JWT_SECRET });
   if (!token?.organization?._id || !token?.isDirector) {
     return res.status(401).json({ message: 'Unauthorized' });
   }

   await db.connect();
   const org = await Organization.findById(token.organization._id);
   if (!org) {
     return res.status(404).json({ message: 'Organization not found' });
   }

   if (req.method === 'POST') {
    
     const { name, accountNr, accountType, branchCode } = req.body;

     if (!name || !accountNr || !accountType || !branchCode) {
       return res.status(400).json({ message: 'All fields are required' });
     }

     const bank = banks.find(b => b.name === name);
     if (!bank) {
       return res.status(400).json({ message: 'Invalid bank name' });
     }

     if (!bank?.accountRegex.test(accountNr)) {
       return res.status(400).json({
         message: bank?.accountMessage || 'Invalid account number format',
       });
     }

     const accountExists = org.bankAccounts.some(account => 
       String(account.accountNr) === String(accountNr)
     );
     if (accountExists) {
       return res.status(400).json({ message: 'Account number already exists' });
     }

     // VERIFY WITH API == SIMULATE SUCCESS
     const isVerified = false;
     const reasonVerificationFailed = 'Some verification error!!';

     // Track changes
     const changes = [{
       fieldId: 'bankAccounts',
       fieldName: 'Bank Accounts',
       from: 'None',
       to: `${name} - ${accountNr}`,
       timestamp: new Date(),
       changedBy: token._id
     }];

     // Add bank account
     org.bankAccounts.unshift({
       titleHolder: org.registeredName,
       name,
       accountNr,
       accountType,
       branchCode,
       bankLogo: bank.logo,
       isVerified,
       reasonVerificationFailed,
       addedBy: token._id
     });

     org.changes = [...(org.changes || []), ...changes];
     await org.save();

     const organization = await Organization.findById(token.organization._id)
       .populate({ path: 'locations' })
       .populate({ path: 'timeline.staff', select: 'fullNames profileImage' })
       .populate({ path: 'changes.changedBy', select: 'fullNames' });

     return res.status(200).json({
       message: 'Bank account added successfully',
       organization
     });

   } else if (req.method === 'DELETE') {
     const { accountId } = req.query;
     if (!accountId) {
       return res.status(400).json({ message: 'Account ID is required' });
     }

     const account = org.bankAccounts.find(a => a._id.toString() === accountId);
     if (!account) {
       return res.status(404).json({ message: 'Bank account not found' });
     }

     // Track changes
     const changes = [{
       fieldId: 'bankAccounts',
       fieldName: 'Bank Accounts',
       from: `${account.name} - ${account.accountNr}`,
       to: 'Deleted',
       timestamp: new Date(),
       changedBy: token._id
     }];

     org.bankAccounts = org.bankAccounts.filter(a => a._id.toString() !== accountId);
     org.changes = [...changes,...(org.changes || [])];
     
     await org.save();

     const organization = await Organization.findById(token.organization._id)
       .populate({ path: 'locations' })
       .populate({ path: 'timeline.staff', select: 'fullNames profileImage' })
       .populate({ path: 'changes.changedBy', select: 'fullNames' });

     return res.status(200).json({
       message: 'Bank account deleted successfully',
       organization
     });

   } else {
     return res.status(405).json({ message: 'Method not allowed' });
   }
 } catch (error) {
   console.error(`${colors.red('error')} - ${error.message}, ${colors.yellow(req.method + ' /api/manage/verify')} @ ${colors.blue(timestamp('DD-MM-YY hh:mm:ss'))}`);
   res.status(500).send({ message: 'Internal Server Error' });
 }
}