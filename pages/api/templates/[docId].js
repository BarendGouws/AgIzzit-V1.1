import { BlobServiceClient, BlobSASPermissions, generateBlobSASQueryParameters, SASProtocol, StorageSharedKeyCredential } from '@azure/storage-blob';
import db from '@/utils/db';
import Templates from '@/models/Templates';

export default async function handler(req, res) { 
  const { docId } = req.query; 

  await db.connect();

  if (req.method === 'PUT') {
    const updatedTemplate = req.body; 

    const template = await Templates.findById(docId);

    if(!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    updatedTemplate.completed = true;

    await Templates.findByIdAndUpdate(docId, updatedTemplate);

    return res.status(200).json({
      message: 'Template updated successfully',
      data: updatedTemplate,
    });
  }

  if (req.method === 'GET') {

    const template = await Templates.findById(docId);

    if(!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    console.log(template.fileUrl);

    if(template.fileUrl.startsWith('https://agizzit.blob.core.windows.net')) {

    const accountName = process.env.AZURE_DOCUMENT_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_DOCUMENT_KEY;

    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);
    const blobServiceClient = new BlobServiceClient(`https://${accountName}.blob.core.windows.net`,sharedKeyCredential);

    const containerClient = blobServiceClient.getContainerClient(process.env.DOCUMENT_TEMPLATE_CONTAINER);

    const blobName = extractBlobNameFromUrl(template.fileUrl); // Implement this function
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    const startDate = new Date();
    startDate.setSeconds(startDate.getSeconds() - 30);

    const sasToken = generateBlobSASQueryParameters({
      containerName: containerClient.containerName,
      blobName: blobName,
      permissions: BlobSASPermissions.parse('r'),
      startsOn: startDate, // Set to 30 seconds in the past
      expiresOn: new Date(new Date().valueOf() + 3600 * 1000), // 1 hour expiry
      protocol: SASProtocol.Https,
  }, sharedKeyCredential).toString();

    const urlWithSAS = `${blockBlobClient.url}?${sasToken}`;

    template.fileUrl = urlWithSAS;

    }

    return res.status(200).json(template);  

  }

  if (req.method === 'DELETE') {

    const template = await Templates.findById(docId);

    if(!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
  
    try {

      const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_DOCUMENT_URI);

      //DELETE PDF FROM AZURE STORAGE

      const pathname = new URL(template.fileUrl).pathname;

      const pathParts = pathname.slice(1).split('/');
      const containerName = pathParts[0]; console.log(containerName);
      const blobName = pathParts.slice(1).join('/'); console.log(blobName);
      
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blobClient = containerClient.getBlobClient(blobName);

      await blobClient.delete();

      //DELETE TEMPLATE FROM AZURE STORAGE

      const templatePathname = new URL(template.templateUrl).pathname;

      const templatePathParts = templatePathname.slice(1).split('/');
      const templateContainerName = templatePathParts[0]; console.log(templateContainerName);
      const templateBlobName = templatePathParts.slice(1).join('/'); console.log(templateBlobName);

      const templateContainerClient = blobServiceClient.getContainerClient(templateContainerName);
      const templateBlobClient = templateContainerClient.getBlobClient(templateBlobName);

      await templateBlobClient.delete();      

    } catch (error) {
      console.error('Error deleting blob from Azure Storage:', error);
      return res.status(500).json({ message: 'Error deleting file from storage' });
    }

    await Templates.findByIdAndDelete(docId);

    return res.status(200).json({ message: 'Template deleted successfully' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

function extractBlobNameFromUrl(url) {
  const urlParts = url.split('/');
  // Assuming the blob name is the last part of the URL
  return urlParts[urlParts.length - 1].split('?')[0]; // Remove any query parameters
}