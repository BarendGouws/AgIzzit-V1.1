import { generateDocumentName } from '@/utils/openai';
import db from '@/utils/db';
import Templates from '@/models/Templates';
import Documents from '@/models/Documents';
import User from '@/models/User';
import requestIp from 'request-ip';
import emailValidator from 'deep-email-validator';
import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import FormData from 'form-data';
import axios from 'axios';
import { BlobServiceClient } from '@azure/storage-blob';
import { getToken } from 'next-auth/jwt';

export default async function handler(req, res) {
    try {
        await db.connect();

        switch (req.method) {
            case 'GET':
                return handleGet(req, res);
            case 'POST':
                return handlePost(req, res);
            default:
                return res.status(405).json({ message: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Unhandled error in API route:', error);
        return res.status(500).json({ error: 'An unexpected error occurred', details: error.message });
    }
}

async function handleGet(req, res) {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;
    const status = req.query.status;
    const sort = req.query.sort || '-updatedAt'; // Default sort by updatedAt in descending order

    let query = {};
    let sortOption = {};

    // Handle search
    if (search) {
        query.$text = { $search: search };
        sortOption.score = { $meta: "textScore" };
    }

    // Handle status filter
    if (status) {
        query.documentStatus = status;
    }

    // Handle sorting
    if (sort.startsWith('-')) {
        sortOption[sort.slice(1)] = -1;
    } else {
        sortOption[sort] = 1;
    }

    try {

        const templates = await Templates.find({ placeholders : { $exists: true, $not: {$size: 0} } })
            .select('-vector')
            .sort({ updatedAt: -1 })      
            .lean();

        const totalCount = await Documents.countDocuments(query);
        const signatures = await Documents.find(query)
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .lean();

        const processedSignatures = signatures.map(signature => ({
            ...signature,
            _id: signature._id.toString(),
            createdAt: signature.createdAt.toISOString(),
            updatedAt: signature.updatedAt.toISOString()
        }));

        const stats = {
            totalSignatures: await Documents.countDocuments({}),
            pendingSignatures: await Documents.countDocuments({ documentStatus: 'Draft' }),
            completedSignatures: await Documents.countDocuments({ documentStatus: 'Completed' }),
            inProgressSignatures: await Documents.countDocuments({ documentStatus: 'In Progress' }),
        };

        const totalPages = Math.ceil(totalCount / limit);    

        return res.status(200).json({
            templates: templates,
            documents: processedSignatures,
            pagination: {
                currentPage: page,
                totalPages,
                totalCount,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },
            stats
        });

    } catch (error) {
        console.error('Query error:', error);
        return res.status(500).json({ message: error.message });
    }
}

async function handlePost(req, res) {

    const token = await getToken({ req, secret: process.env.JWT_SECRET }); 

    if (!token) return res.status(401).json({ message: 'Unauthorized' }); 

    const { templateId, signerEmails, senderFields } = req.body;
    const userId = token._id;

    if (!templateId) {
        return res.status(400).json({ error: 'Invalid request. Template ID is required.' });
    }
    
    if (!signerEmails || typeof signerEmails !== 'object' || Object.keys(signerEmails).length === 0) {
        return res.status(400).json({ error: 'Invalid request. At least one signer email is required.' });
    }

    const clientIp = requestIp.getClientIp(req);
    if (!clientIp) {
        return res.status(400).json({ error: 'Invalid request. Client IP is required.' });
    }

    try {

        const template = await Templates.findById(templateId);
        
        if (!template) {
            return res.status(404).json({ error: 'Template not found.' });
        }

        const generatedDocumentName = await generateDocumentName(template.name);

        // Validate emails and get or create users, using userId for sender
        const signers = await validateAndGetSigners(signerEmails, userId); console.log('signers',signers);

        const { signatures, fields } = await processSignaturesAndFields(template, signerEmails, senderFields, userId);
        
        console.log('signatures', signatures);
        console.log('fields', fields);

        // Check if all fields are filled
        const allFieldsFilled = fields.every(field => field.value); console.log('allFieldsFilled',allFieldsFilled);

        let documentUrl = '';
        if (allFieldsFilled) {

            documentUrl = await fillAndGeneratePdfFromDocx(template.templateUrl, fields, generatedDocumentName);
        
        }

        const newSignature = new Documents({
            organization: template.organization,
            documentName: generatedDocumentName,
            documentUrl,
            documentStatus: allFieldsFilled ? 'In Progress' : 'Draft',
            restrictIP: template.restrictIP || false,
            facialVerification: template.facialVerification || false,
            signatures,
            fields,
            auditTrail: [{
                action: 'Document created',
                ipAddress: clientIp,
                user: userId,
            }],
        });

        await newSignature.save();
        
        // Increment the timesUsed counter for the template
        await Templates.findByIdAndUpdate(templateId, { $inc: { timesUsed: 1 } },{ timestamps: false });              

        return res.status(201).json({
            message: 'Signature request created successfully.',
            signatureId: newSignature._id,
            success: true
        });
  
    } catch (error) {
        console.error('Error generating signature request:', error);
        return res.status(500).json({ error: 'An error occurred while generating the signature request', details: error.message });
    }
}

async function validateAndGetSigners(signerEmails, userId) {

    const signers = { Sender: userId }; // Set sender to userId
    const roles = ['Recipient', 'Witness 1', 'Witness 2']; // Remove 'Sender' from this list

    for (const role of roles) {
        const email = signerEmails[role];
        if (email) {
            // Validate email
            const { valid } = await emailValidator({

                email,
                validateRegex: true,
                validateMx: true,
                validateTypo: true,
                validateDisposable: true,
                validateSMTP: false
              });

            if (!valid) {
                throw new Error(`Invalid email for ${role}: ${email}`);
            }

            // Get or create user
            let user = await User.findOne({ email });
            if (!user) {
                user = new User({
                    email,           
                    emailVerified: false,  
                    isActive: false,                  
                });
                await user.save();
            }
            signers[role] = user._id;
        }
    }

    return signers;
}

async function processSignaturesAndFields(template, signerEmails, senderFields, userId) {

    const now = new Date();
    const roleOrder = { Recipient: 1, Sender: 2, 'Witness 1': 3, 'Witness 2': 4 };

    // Combine placeholders and fields, sort them, and process
    const combinedElements = [...template.placeholders, ...template.fields]
        .sort((a, b) => {
            if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
            if (a.role !== b.role) return roleOrder[a.role] - roleOrder[b.role];
            return b.top - a.top;
        });

    const signatures = [];
    const fields = [];
    let order = 1;

    // Fetch all unique user emails
    const uniqueEmails = [...new Set(Object.values(signerEmails))]; console.log('uniqueEmails',uniqueEmails);
    const userMap = new Map();

    // Fetch all users in one query
    const users = await User.find({ email: { $in: uniqueEmails } });
    users.forEach(user => userMap.set(user.email, user));

    for (const element of combinedElements) {

        if (element.type) { // This is a placeholder (signature)

            if(element.role == 'Sender') {

              signatures.push({
                    user: userId,
                    completed: false,
                    role: element.role,
                    type: element.type,
                    order: order++,
                    top: element.top,
                    left: element.left,
                    width: element.width,
                    height: element.height,
                    pageNumber: element.pageNumber
                });

            }else {

            const signerEmail = signerEmails[element.role];
            const signer = userMap.get(signerEmail);
            const signerId = signer ? signer._id : null;            

            signatures.push({
                user: signerId,
                completed: false,
                role: element.role,
                type: element.type,
                order: order++,
                top: element.top,
                left: element.left,
                width: element.width,
                height: element.height,
                pageNumber: element.pageNumber
            });

            }
            
        } else { // This is a field
            let value = '';
            let filledBy = null;
            let filledAt = null;

            if (element.role === 'Sender') {
                value = formatText(senderFields[element.tag] || '', element.format);
                filledBy = userId;
                filledAt = now;
            } else if (element.schema === 'User' && element.dbKey) {
                const userEmail = signerEmails[element.role];
                const user = userMap.get(userEmail);
                if (user && user[element.dbKey]) {
                    value = formatText(user[element.dbKey], element.format);
                    filledBy = user._id;
                    filledAt = now;
                }
            }

            fields.push({
                tag: element.tag,
                text: element.text,
                value,
                schema: element.schema,
                dbKey: element.dbKey,
                format: element.format,
                role: element.role,
                filledBy,
                filledAt
            });
        }
    }

    return { signatures, fields };
}

function formatText(text, format) {
    switch (format) {
        case 'TitleCase':
            return text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        case 'UpperCase':
            return text.toUpperCase();
        case 'LowerCase':
            return text.toLowerCase();
        default:
            return text;
    }
}

async function fillAndGeneratePdfFromDocx(templateUrl, fields, generatedDocumentName) {
    console.log('Starting fillAndGeneratePdfFromDocx');
    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_DOCUMENT_URI);

    try {
        // 1. Fetch the DOCX template from Azure
        console.log('Fetching DOCX template from Azure');
        const templateBuffer = await fetchDocxFromAzure(templateUrl);
        console.log('Template fetched successfully');

        // 2. Replace fields in the DOCX
        console.log('Filling DOCX template');
        const filledDocxBuffer = await fillDocxTemplate(templateBuffer, fields);
        console.log('DOCX template filled successfully');

        // 3. Convert DOCX to PDF
        console.log('Starting DOCX to PDF conversion');
        const pdfBuffer = await convertDocxToPdf(filledDocxBuffer, `${generatedDocumentName}.docx`);
        console.log('DOCX converted to PDF successfully');

        // 4. Create container if it doesn't exist
        console.log('Checking if container exists');
        const containerClient = blobServiceClient.getContainerClient(process.env.DOCUMENT_INPROGRESS_CONTAINER);
        const containerExists = await containerClient.exists();
        if (!containerExists) {
            console.log('Container does not exist. Creating container...');
            await containerClient.create();
            console.log('Container created successfully');
        } else {
            console.log('Container already exists');
        }

        // 5. Save PDF to Azure and get URL
        console.log('Saving PDF to Azure');
        const blobName = `${generatedDocumentName}.pdf`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.upload(pdfBuffer, pdfBuffer.length);
        const documentUrl = blockBlobClient.url;
        console.log('PDF saved to Azure successfully');

        return documentUrl;
    } catch (error) {
        console.error('Error in fillAndGeneratePdfFromDocx:', error);
        if (error.name === 'RestError') {
            console.error('Azure Storage Error:', error.message);
            console.error('Error Code:', error.code);
            console.error('Request ID:', error.requestId);
        }
        throw new Error(`Failed to generate and save PDF: ${error.message}`);
    }
}

async function fetchDocxFromAzure(templateUrl) {
    const url = new URL(templateUrl);
    const containerName = url.pathname.split('/')[1];
    const blobName = url.pathname.split('/').slice(2).join('/');

    const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_DOCUMENT_URI);

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(blobName);

    const downloadResponse = await blobClient.download();
    return await streamToBuffer(downloadResponse.readableStreamBody);
}

async function streamToBuffer(readableStream) {

    return new Promise((resolve, reject) => {
        const chunks = [];
        readableStream.on("data", (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on("error", reject);
    });
}

async function fillDocxTemplate(templateBuffer, fields) {
    
    console.log('Starting to fill DOCX template');
    console.log('Fields received:', fields);

    try {
        const zip = new PizZip(templateBuffer);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const data = fields.reduce((acc, field) => {
            // Remove curly braces from the tag
            const key = field.tag.replace(/[{}]/g, '');
            acc[key] = field.value;
            return acc;
        }, {});

        console.log('Data to fill:', data);

        doc.setData(data);
        doc.render();

        console.log('DOCX template filled successfully');

        return doc.getZip().generate({ type: 'nodebuffer' });
    } catch (error) {
        console.error('Error filling DOCX template:', error);
        throw new Error(`Failed to fill DOCX template: ${error.message}`);
    }
}

async function convertDocxToPdf(fileBuffer, fileName = 'document.docx') {
    console.log('Converting to PDF using Gotenberg...');
    console.log('File name:', fileName);
    console.log('File buffer type:', typeof fileBuffer);
    console.log('Is file buffer a Buffer?', Buffer.isBuffer(fileBuffer));
    console.log('File buffer length:', fileBuffer.length);

    try {
        // Create a FormData instance
        const form = new FormData();

        // Append the file buffer to FormData
        form.append('files', fileBuffer, {
            filename: fileName,
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        console.log('FormData created, sending request to Gotenberg...');
        console.log('Form length:', form.getLengthSync());
        console.log('Form headers:', form.getHeaders());

        const response = await axios.post('http://localhost:3000/forms/libreoffice/convert', form, {
            headers: {
                ...form.getHeaders(),
            },
            responseType: 'arraybuffer',
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });

        console.log('Response received from Gotenberg. Status:', response.status);

        if (response.status !== 200) {
            console.error(`Error response from Gotenberg: ${response.data.toString()}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const pdfBuffer = Buffer.from(response.data);

        console.log('PDF converted successfully. PDF buffer length:', pdfBuffer.length);

        return pdfBuffer;
    } catch (conversionError) {
        console.error('PDF conversion error:', conversionError);
        if (conversionError.response) {
            console.error('Error response data:', conversionError.response.data.toString());
            console.error('Error response status:', conversionError.response.status);
            console.error('Error response headers:', conversionError.response.headers);
        }
        throw conversionError;
    }
}
