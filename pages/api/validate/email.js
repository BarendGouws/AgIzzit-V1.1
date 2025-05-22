import emailValidator from 'deep-email-validator';

export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const result = await emailValidator({
      email,
      validateRegex: true,
      validateMx: true,
      validateTypo: true,
      validateDisposable: true,
      validateSMTP: false
    });
    const isValid = result.valid;

    return res.status(200).json({
      isValid,
      details: result.validators
    });
  } catch (error) {
    console.error('Email validation error:', error);
    return res.status(500).json({ message: 'Error validating email' });
  }
  
}