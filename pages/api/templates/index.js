import { generateDocumentName, generateDocumentEmbedding } from '@/utils/openai';
import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import formidable from 'formidable';
import mammoth from 'mammoth';
import db from '@/utils/db';
import Templates from '@/models/Templates';
import { userKeysMap } from '@/utils/config';

export const config = {
    api: {
      bodyParser: false,
    },
}; 

export default async function handler(req, res) {
    
    await db.connect();

    switch (req.method) {
        case 'GET':
            return handleGet(req, res);
        case 'POST':
            return handlePost(req, res);
        default:
            return res.status(405).json({ message: 'Method not allowed' });
    }
}

async function handleGet(req, res) {
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search;

    let query = {};
    let sortOption = {};
    let totalCount;
    let templates;
    let debugInfo = {};
    let profilePlaceholders = [];

    if (search) {
        query = { $text: { $search: search } };
        sortOption = { score: { $meta: "textScore" } };
        debugInfo.searchTerm = search;
        debugInfo.pipelineUsed = 'Full-Text Search Across All Fields';
    } else {
        // Assuming you have an 'updatedAt' field for last edited time
        // If you're using a different field name, replace 'updatedAt' with your field name
        sortOption = { updatedAt: -1 };
        debugInfo.pipelineUsed = 'No Search Query, Sorted by Last Edited';
    }

    try {

        profilePlaceholders = Object.keys(userKeysMap).map(key => ({ tag: key, text: userKeysMap[key] }))  

        totalCount = await Templates.countDocuments(query);
        templates = await Templates.find(query)
            .select('-vector')
            .sort(sortOption)
            .skip(skip)
            .limit(limit)
            .lean();

        if (search) {
            // If it's a search query, we want to include the text score
            templates = templates.map(template => ({
                ...template,
                score: template._score
            }));
        }
        
    } catch (error) {
        console.error('Query error:', error);
        return res.status(500).json({ message: error.message || 'Error querying the database.' });        
    }

    const totalPages = Math.ceil(totalCount / limit);    

    return res.status(200).json({
        templates,
        pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1
        },
        profilePlaceholders
    });
}

async function handlePost(req, res) {
    
    const form = formidable();

    let fields, files;
    try {
        // Wrap form.parse in a Promise and await it
        ({ fields, files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ fields, files });
                }
            });
        }));
    } catch (err) {
        console.error('Error parsing the form:', err);
        return res.status(500).json({ error: 'Error parsing the file.' });
    }

    const file = files.file;
    const docFile = Array.isArray(file) ? file[0] : file;

    if (!docFile || docFile.mimetype !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return res.status(400).json({ error: 'Only .docx files are allowed.' });
    }

    try {
        const fileBuffer = await fs.readFile(docFile.filepath);
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        const fileContent = result.value;

        // Extract and validate placeholders
        const placeholders = extractAndFormatPlaceholders(fileContent);
        const profilePlaceholders = placeholders.filter((field) => field.schema === 'User');
        const nonProfilePlaceholders = placeholders.filter((field) => !field.schema);

        const availableProfileFields = Object.keys(userKeysMap).map(key => ({
            tag: key,
            text: userKeysMap[key],
            isPresent: profilePlaceholders.some(field => field.tag === key)
        }));

        if (profilePlaceholders.length === 0 && nonProfilePlaceholders.length === 0) {
            return res.status(400).json({ error: 'No placeholders found in the file.' });
        }

        console.log('Converting to PDF using Gotenberg...');
        try {
            // Create a Blob from the file buffer
            const blob = new Blob([fileBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            });

            // Use the built-in FormData
            const formData = new FormData();
            formData.append('files', blob, docFile.originalFilename);

            const response = await fetch('http://localhost:3000/forms/libreoffice/convert', {
                method: 'POST',
                body: formData,
                // Do not set 'Content-Type' header manually
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`Error response from Gotenberg: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const arrayBuffer = await response.arrayBuffer();
            var pdfBuffer = Buffer.from(arrayBuffer);
        } catch (conversionError) {
            console.error('PDF conversion error:', conversionError);
            return res.status(500).json({ error: 'Failed to convert DOCX to PDF' });
        }

        const generatedName = await generateDocumentName(fileContent);
        const embeddingVector = await generateDocumentEmbedding(fileContent);

        const filename = `${uuidv4()}.docx`;
        const pdfFilename = `${uuidv4()}.pdf`; 

        console.log('Uploading files to Azure Storage...');

        // Upload the file to Azure Storage
        const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_DOCUMENT_URI);
        const containerClient = blobServiceClient.getContainerClient(process.env.DOCUMENT_TEMPLATE_CONTAINER); 

        const pdfBlockBlobClient = containerClient.getBlockBlobClient(pdfFilename); 
        await pdfBlockBlobClient.uploadData(pdfBuffer);

        const blockBlobClient = containerClient.getBlockBlobClient(filename);
        await blockBlobClient.uploadData(fileBuffer);

        const pdfUrl = pdfBlockBlobClient.url; console.log(pdfUrl);
        const templateUrl = blockBlobClient.url;

        const template = await Templates.create({
            templateUrl: templateUrl,
            fileUrl: pdfUrl,
            name: generatedName,
            fields: [...profilePlaceholders, ...nonProfilePlaceholders],
            vector: embeddingVector,
        });

        return res.status(200).json({
            template,
            placeholderInfo: {
                profilePlaceholders: availableProfileFields,
                nonProfilePlaceholders: nonProfilePlaceholders          
            }
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Error uploading file to Azure Storage.' });
    }
}

const extractAndFormatPlaceholders = (content) => {
    // Find all placeholders in the format {text}
    const placeholderPattern = /{([^}]+)}/g;
    const placeholdersSet = new Set();
    let match;
  
    while ((match = placeholderPattern.exec(content)) !== null) {
      const tag = match[0]; // Full placeholder e.g., {email}
      const tagName = match[1]; // Extracted name inside curly braces e.g., email
  
      let placeholder;
      if (userKeysMap.hasOwnProperty(tag)) {
        // It's a profile placeholder
        placeholder = {
          tag,
          text: userKeysMap[tag], // Use predefined text
          schema: 'User',
          dbKey: tagName // Use the key from the user schema
        };
      } else {
        // It's a custom placeholder not in the schema
        placeholder = {
          tag,
          text: tagName
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
        };
      }
  
      // Convert the placeholder object to a string for Set comparison
      placeholdersSet.add(JSON.stringify(placeholder));
    }
  
    // Convert the Set back to an array of objects
    return Array.from(placeholdersSet).map(JSON.parse);
};