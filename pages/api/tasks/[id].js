// pages/api/tasks/[id].js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  switch (method) {
    case 'GET':
      if (!id) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      try {
        const task = await prisma.task.findUnique({
          where: { id: parseInt(id, 10) }, // Ensure id is an integer
        });

        if (!task) {
          return res.status(404).json({ error: 'Task not found' });
        }

        res.status(200).json(task);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    // Handle other HTTP methods if needed
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
