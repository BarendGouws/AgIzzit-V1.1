import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

import documentTypes from '../components/backup/documentTypes';

export async function generateDocumentType(content, orgType) {
  try {
    // Default to 'Dealership' type
    const relevantSamples = documentTypes[orgType] || [];
    
    // Force GPT to prioritize existing document names
    const namePrompt = `
      Identify the most relevant document type from the following list: 
      ${relevantSamples.join(', ')}.
      
      If one of these matches the document content, return it exactly as written.
      If none match, generate a short document name in a similar style.

      Document content (first 500 chars):
      ${content.slice(0, 500)}...

      Only return the document name, such as "Dekra Report" or "Other".
    `.trim();

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: "system", content: "You are a document classifier. Return only a document name, without explanations." },
        { role: "user", content: namePrompt }
      ],
      max_tokens: 10,
      temperature: 0.3  // Reduce randomness to increase accuracy
    });

    // Clean up quotes if GPT returns them
    const docName = response.choices[0].message.content
      .trim()
      .replace(/^"|"$/g, '');

    // If GPT doesn't return a usable name, fall back to 'Other'
    return relevantSamples.includes(docName) ? docName : 'Other';

  } catch (error) {
    console.error('Error generating document name:', error);
    return 'Other';
  }
}

export async function generateDocumentName(content) {

    try {
      const prompt = `Generate a concise and descriptive name for the following document content, without using any quotes around the name and also with no {}, the {firstName} is a placeholder, for fillable information, so replace it from {firstName} to First Name:\n\n${content.slice(0, 500)}...`;
  
      // Use gpt-3.5-turbo model as an alternative
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: "system", content: "You are a helpful assistant that generates document names without quotes." },
          { role: "user", content: prompt },
        ],
        max_tokens: 10, // Limit the response to a short title
        temperature: 0.7, // Control creativity
      });
  
      // Ensure response contains the expected data and clean any quotes
      return response.choices[0].message.content.trim().replace(/^"|"$/g, '');
    } catch (error) {
      console.error('Error generating document name:', error);
      return 'Untitled Document';
    }
}  

export async function generateDocumentEmbedding(content) {

    try { 

    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: content,
    });
  
    return response.data[0].embedding; // Returns the embedding vector

    } catch (error) {
        console.error('Error generating document embedding:', error);
        return [];
    }
}
