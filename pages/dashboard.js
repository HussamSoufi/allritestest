//pages\dashboard.js
"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useState, useEffect, useMemo } from "react";
import { format, isBefore, isAfter } from 'date-fns';
// dashboard.js
import { getSession } from "next-auth/react";
// Main App component (or a suitable higher-level component)
export default function App() { 
  return (
    <SessionProvider> 
      <Dashboard /> 
    </SessionProvider>
  );
}
export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
}


function Dashboard() {
  const { data: session } = useSession();
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "pending" });
const [tasks, setTasks] = useState([]); // Initialize as an empty array

useEffect(() => {
  if (session?.userId) {
    fetch(`/api/tasks/${session.userId}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched tasks:', data); // Log the fetched data
        if (Array.isArray(data)) {
          setTasks(data);
        } else {
          console.error("Expected an array but got:", data);
          setTasks([]);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch tasks:', error);
        setTasks([]);
      });
  }
}, [session]);


const handleCreateTask = async () => {
  const res = await fetch(`/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...newTask, userId: session?.userId }),
  });
  const task = await res.json();
  // Ensure tasks is an array before spreading
  setTasks((prevTasks) => Array.isArray(prevTasks) ? [...prevTasks, task] : [task]);
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
  {Array.isArray(tasks) ? (
    tasks.length > 0 ? (
      tasks.map((task) => (
        <li key={task.id}>
          <h2>{task.title}</h2>
          <p>{task.description}</p>
          <p>Status: {task.status}</p>
        </li>
      ))
    ) : (
      <p>No tasks found. Array length is {tasks.length}</p>
    )
  ) : (
    <p>Tasks is not an array. Actual value: {JSON.stringify(tasks)}</p>
  )}
</ul>

    </div>
  );
}