import { SignPdf } from '@signpdf/signpdf';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import { PDFDocument } from 'pdf-lib'; // pdf-lib is already imported
import fs from 'fs';
import path from 'path';
import { CryptographyClient, KeyClient } from "@azure/keyvault-keys";
import { DefaultAzureCredential } from "@azure/identity";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { signature, docId } = req.body;

  try {
    // Load the existing PDF to be signed
    const filePath = path.join(process.cwd(), 'exports', `test.pdf`); // Your test PDF
    const pdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Convert the base64 signature to a format usable by PDF-lib (PNG in this case)
    const signatureImageBytes = Buffer.from(signature.split(',')[1], 'base64'); // Split and decode the base64 data URL

    // Embed the signature image in the PDF
    const signatureImage = await pdfDoc.embedPng(signatureImageBytes);

    // Get the first page of the PDF
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Define the size and position for the signature
    const imageWidth = 150; // Adjust this based on your requirements
    const imageHeight = 50; // Adjust this based on your requirements
    const x = 50; // x-coordinate where the signature should be placed
    const y = 100; // y-coordinate where the signature should be placed

    // Draw the signature image on the PDF
    firstPage.drawImage(signatureImage, {
      x,
      y,
      width: imageWidth,
      height: imageHeight,
    });

    // Optionally, add signature metadata as a placeholder
    pdflibAddPlaceholder({
      pdfDoc,
      reason: 'Digitally signed by AgIzzit.',
      location: 'n/a',
      name: 'AgIzzit',
      contactInfo: 'info@agizzit.co.za',
      signatureLength: 15000,
      rect: [x, y, x + imageWidth, y + imageHeight]
    });

    const modifiedPdfBytes = await pdfDoc.save();

    // ======== Azure Key Vault Signing Starts Here ========

    // Azure Key Vault credentials and setup
    const keyVaultName = process.env.AZURE_KEY_VAULT_NAME; // Add Azure Key Vault name in environment variables
    const keyVaultUrl = `https://${keyVaultName}.vault.azure.net`;
    const credential = new DefaultAzureCredential();
    const keyClient = new KeyClient(keyVaultUrl, credential);

    // Retrieve the key stored in Azure Key Vault
    const keyName = process.env.AZURE_KEY_NAME; // Add key name in environment variables
    const key = await keyClient.getKey(keyName);

    // Initialize CryptographyClient to handle signing
    const cryptoClient = new CryptographyClient(key, credential);

    // Generate a SHA-256 hash of the modified PDF (before signing)
    const documentHash = require('crypto').createHash('sha256').update(modifiedPdfBytes).digest();

    // Sign the document hash with the key stored in Azure Key Vault
    const signatureResult = await cryptoClient.sign("RS256", documentHash);

    // Retrieve the signature in Base64 format
    const signedHash = signatureResult.result;

    // ======== Azure Key Vault Signing Ends Here ========

    // Save the signed PDF to a file
    const signedPdfPath = path.join(process.cwd(), 'exports', `signed_exported_file_${docId}.pdf`);
    fs.writeFileSync(signedPdfPath, modifiedPdfBytes); // Save modified PDF, but signature will be embedded here

    // Return the URL of the signed document (you can modify this to upload and return the URL)
    return res.status(200).json({
      message: 'Document signed successfully',
      signedUrl: `/exports/signed_exported_file_${docId}.pdf`, // You can modify this based on your setup
    });

  } catch (error) {
    console.error('Error signing the PDF:', error);
    return res.status(500).json({ message: 'Failed to sign the document' });
  }
}
