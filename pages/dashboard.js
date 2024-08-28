import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "pending" });

  useEffect(() => {
    fetch(`/api/tasks/${session?.userId}`)
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, [session]);

  const handleCreateTask = async () => {
    const res = await fetch(`/api/tasks/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, userId: session?.userId }),
    });
    const task = await res.json();
    setTasks([...tasks, task]);
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <div>
        <input
          type="text"
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
        />
        <textarea
          placeholder="Task description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
        />
        <button onClick={handleCreateTask}>Create Task</button>
      </div>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <h2>{task.title}</h2>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
