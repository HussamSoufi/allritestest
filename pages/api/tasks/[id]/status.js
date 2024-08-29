// pages/api/tasks/[id]/status.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;
  
  if (method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }

  if (!id) {
    return res.status(400).json({ error: 'Task ID is required' });
  }

  const { status } = req.body;

  if (!['pending', 'inprogress', 'finished'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    const task = await prisma.task.update({
      where: { id: parseInt(id, 10) },
      data: { status },
    });

    res.status(200).json(task);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
