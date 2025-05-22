import db from '@/utils/db';
import Documents from '@/models/Documents';
import User from "@/models/User";

export default async function handler(req, res) {

    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { docId } = req.query;

    if (!docId) {
        return res.status(400).json({ message: 'Document ID is required' });
    }

    try {

        await db.connect();        

         const document = await Documents.findById(docId)
         .populate({
            path: 'signatures.user',
            model: User,
            select: '_id email phoneNr isComplete profileImage isVerified fullNames '
         }).populate({
            path: 'auditTrail.user',
            model: User,
            select: '_id email'               
         }).lean();   

        if (!document) {
          return res.status(404).json({ message: 'Document not found' });
        }   

        return res.status(200).json(document);     
        
    } catch (error) {
        console.error('Error fetching document details:', error);
        return res.status(500).json({ message: 'An error occurred while fetching document details' });
    }
}