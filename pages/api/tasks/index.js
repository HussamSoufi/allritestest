// pages/api/tasks/index.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { title, description, status, userId } = req.body;
    const newTask = await prisma.task.create({
      data: { title, description, status, userId: parseInt(userId) },
    });
    res.json(newTask);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
