// pages/api/tasks/[id].js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  switch (method) {
        case 'PUT':
      // Handle PUT request to update task details
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
      break;

    case 'DELETE':
      // Handle DELETE request to delete a task
      try {
        await prisma.task.delete({
          where: { id: parseInt(id, 10) },
        });
        res.status(204).end();
      } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
      break;
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
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
