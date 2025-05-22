import { SignPdf } from '@signpdf/signpdf';
import { P12Signer } from '@signpdf/signer-p12';
import { pdflibAddPlaceholder } from '@signpdf/placeholder-pdf-lib';
import { PDFDocument } from 'pdf-lib'; // pdf-lib is already imported
import fs from 'fs';
import path from 'path';

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

    // Digitally sign the PDF with the P12 certificate
    const P12Buffer = Buffer.from(process.env.PFX_BASE64, 'base64');
    const p12Cert = new P12Signer(P12Buffer, { passphrase: process.env.PASS_PHRASE || null });

    const signPdf = new SignPdf();
    const signedPdfBytes = await signPdf.sign(modifiedPdfBytes, p12Cert);

    // Save the signed PDF to file
    const signedPdfPath = path.join(process.cwd(), 'exports', `signed_exported_file_${docId}.pdf`);
    fs.writeFileSync(signedPdfPath, signedPdfBytes);  

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

