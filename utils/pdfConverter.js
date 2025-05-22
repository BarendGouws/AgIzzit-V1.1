import fetch from 'node-fetch';
import FormData from 'form-data';

async function convertDocxToPdf(docxBuffer) {
    try {
        // Create a Blob from the file buffer
        const blob = new Blob([docxBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        // Use the built-in FormData
        const formData = new FormData();
        formData.append('files', blob, 'document.docx');

        const response = await fetch('http://localhost:3000/forms/libreoffice/convert', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error response from Gotenberg: ${errorText}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch (error) {
        console.error('PDF conversion error:', error);
        throw new Error('Failed to convert DOCX to PDF');
    }
}

async function generatePdf(templateUrl, fields) {
    try {
        
        const templateBuffer = await fetchTemplateFromAzure(templateUrl);
        const zip = new PizZip(templateBuffer);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        const data = fields.reduce((acc, field) => {
            acc[field.tag] = field.value;
            return acc;
        }, {});

        doc.setData(data);
        doc.render();

        const docxBuffer = doc.getZip().generate({ type: 'nodebuffer' });

        // Convert the rendered DOCX to PDF
        const pdfBuffer = await convertDocxToPdf(docxBuffer);

        return pdfBuffer;
    } catch (error) {
        console.error('PDF generation error:', error);
        throw error;
    }
}

// The rest of your code (handlePost, savePdfToAzureAndGetUrl, etc.) remains the same

export { convertDocxToPdf, generatePdf };