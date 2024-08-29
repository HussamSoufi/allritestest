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
        const tasks = await prisma.task.findMany({
          where: { userId: parseInt(id, 10) }, // Fetch tasks based on userId
        });

        // Log the fetched tasks
        //console.log('Fetched tasks:', tasks);

        if (tasks.length === 0) {
          return res.status(404).json({ error: 'No tasks found' });
        }

        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.status(200).json(tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;

    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
