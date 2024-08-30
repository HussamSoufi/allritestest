import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  if (method !== 'PUT') { // Only allow PUT requests for updates
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  if (!id) {
    return res.status(400).json({ error: 'Task ID is required' });
  }

  const { title, description } = req.body;

  try {
    const task = await prisma.task.update({
      where: { id: parseInt(id, 10) },
      data: { title, description },
    });

    res.status(200).json(task);
  } catch (error) {
    console.error('Error updating task details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}