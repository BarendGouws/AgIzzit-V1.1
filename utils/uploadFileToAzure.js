import axios from 'axios';
import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';


export const uploadFileToAzurePublic = async (publicUrl, azureContainerName) => {
 try {
   const response = await axios.get(publicUrl, { responseType: 'arraybuffer' });
   const fileBuffer = Buffer.from(response.data);

   // Get original extension
   const ext = path.extname(publicUrl.split('/').pop());
   // Generate new filename with UUID
   const filename = `${uuidv4()}${ext}`;

   const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_PUBLIC_URI);
   const containerClient = blobServiceClient.getContainerClient(azureContainerName);
   const blockBlobClient = containerClient.getBlockBlobClient(filename);
   await blockBlobClient.uploadData(fileBuffer);

   return blockBlobClient.url;
 } catch (error) {
   console.error('Error uploading file to Azure:', error.message);
   return null;
 }
};



