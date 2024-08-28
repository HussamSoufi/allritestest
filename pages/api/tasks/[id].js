import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method === "GET") {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) },
    });
    res.json(task);
  } else if (req.method === "POST") {
    const { title, description, status, userId } = req.body;
    const newTask = await prisma.task.create({
      data: { title, description, status, userId: parseInt(userId) },
    });
    res.json(newTask);
  } else if (req.method === "PUT") {
    const { title, description, status } = req.body;
    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: { title, description, status },
    });
    res.json(updatedTask);
  } else if (req.method === "DELETE") {
    const deletedTask = await prisma.task.delete({
      where: { id: parseInt(id) },
    });
    res.json(deletedTask);
  }
}
