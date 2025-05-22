import db from '@/utils/db';
import Templates from '@/models/Templates';

export default async function handler(req, res) {

  const { signId } = req.query;

  if (req.method === 'PUT') {

    const updatedTemplate = req.body;

    await db.connect();

    const template = await Templates.findById(signId);

    if(!template) {

      return res.status(404).json({ message: 'Template not found' });

    }

    updatedTemplate.completed = true;

    await Templates.findByIdAndUpdate(signId, updatedTemplate);

    return res.status(200).json({
      message: 'Template updated successfully',
      data: updatedTemplate,
    });

  }

  if (req.method === 'GET') {

    const { signId } = req.query;

    await db.connect();

    const template = await Templates.findById(signId);

    if(!template) {
      return res.status(404).json({ message: 'Template not found' });
    }

    

    return res.status(200).json(template);  
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
