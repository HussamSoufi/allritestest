// Dashboard.js
"use client";
import { SessionProvider, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import "../styles/globals.css";
import styles from "../styles/Dashboard.module.css"; // Import the CSS module

// Main Application component
export default function App() { 
  return (
    <SessionProvider> 
      <Dashboard /> 
    </SessionProvider>
  );
}

// Function to handle server-side authentication
export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  // Redirect to the login page if the user is not authenticated
  if (!session) {
    return {
      redirect: {
        destination: "/auth/signin",
        permanent: false,
      },
    };
  }

  const sanitizedSession = {
    ...session,
    user: {
      ...session.user,
      image: session.user.image || null,
    },
  };

  return {
    props: { session: sanitizedSession },
  };
}

// Dashboard component containing the task management functionality
function Dashboard() {
  const { data: session } = useSession();
  const [newTask, setNewTask] = useState({ title: "", description: "", status: "pending" });
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [filter, setFilter] = useState("all"); // State for filtering tasks

  // Fetch tasks when the session is available
  useEffect(() => {
    if (session?.userId) {
      fetch(`/api/tasks/${session.userId}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setTasks(data);
          } else {
            setTasks([]);
          }
        })
        .catch((error) => {
          console.error('Failed to fetch tasks:', error);
          setTasks([]);
        });
    }
  }, [session]);

  // Function to create a new task
  const handleCreateTask = async () => {
    const res = await fetch(`/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, userId: session?.userId }),
    });
    const task = await res.json();
    setTasks((prevTasks) => Array.isArray(prevTasks) ? [...prevTasks, task] : [task]);
    setNewTask({ title: "", description: "", status: "pending" }); 
  };

  // Function to update the status of a task
  const handleUpdateStatus = async (taskId, newStatus) => {
    const res = await fetch(`/api/tasks/${taskId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const updatedTask = await res.json();
    setTasks((prevTasks) => prevTasks.map(task => 
      task.id === taskId ? updatedTask : task
    ));
  };

  // Function to delete a task
  const handleDeleteTask = async (taskId) => {
    const res = await fetch(`/api/tasks/${taskId}/delete`, {
      method: "DELETE",
    });
    if (res.ok) {
      setTasks((prevTasks) => prevTasks.filter(task => task.id !== taskId));
    } else {
      console.error('Failed to delete task');
    }
  };

  // Function to handle task editing
  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true); 
  };

  // Function to update an edited task
  const handleUpdateTask = async () => {
    if (!editingTask) return;

    const res = await fetch(`/api/tasks/${editingTask.id}`, { 
      method: "PUT", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        title: editingTask.title, 
        description: editingTask.description 
      }), 
    });

    if (res.ok) {
      const updatedTask = await res.json();
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );
      setEditingTask(null);
      setIsModalOpen(false);
    } else {
      console.error('Failed to update task');
    }
  };

  // Filter tasks based on the selected filter status
  const filteredTasks = tasks.filter((task) => 
    filter === "all" || task.status === filter
  );

  return (
    <div className={styles.container}> 
      <div className={styles.card}> 

        {/* User Info and Logout Section */}
        {session && ( 
          <div>
            <div>
              <p className={styles.taskDescription}>Logged in as: {session.user.name || session.user.email}</p> 
            </div>
          </div>
        )}

        {/* Create Task Section */}
        <div className={styles.section}>
          <h2 className={styles.heading}>Create a New Task</h2>
          <input
            className={styles.input}
            type="text"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <textarea
            className={styles.textarea}
            placeholder="Task description"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <button
            className={styles.button}
            onClick={handleCreateTask}
          >
            Create Task
          </button>
        </div>

        {/* Filter Tasks Section */}
        <div className={styles.section}>
          <h2 className={styles.heading}>Filter Tasks</h2>
          <select
                className={styles.select} // Apply styles from Dashboard.module.css
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="inprogress">In Progress</option>
            <option value="finished">Finished</option>
          </select>
        </div>

        {/* Your Tasks Section */}
        <div>
          <h2 className={styles.heading}>Your Tasks</h2>
          <ul>
            {Array.isArray(filteredTasks) ? (
              filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <li key={task.id} className={styles.taskItem}>
                    <div className={styles.taskContent}> 
                      <h3 className={styles.taskTitle}>{task.title}</h3>
                      <p className={styles.taskDescription}>{task.description}</p>
                      <p className={`${styles.taskStatus} ${styles[task.status]}`}> 
                        Status: {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </p>
                    </div>
                    <div className={styles.buttonGroup}>
                      <button
                        className={`${styles.statusButton} ${task.status === 'pending' ? styles.disabled : styles.active}`}
                        onClick={() => handleUpdateStatus(task.id, 'pending')}
                        disabled={task.status === 'pending'}
                      >
                        Pending
                      </button>
                      <button
                        className={`${styles.statusButton} ${task.status === 'inprogress' ? styles.disabled : styles.active}`}
                        onClick={() => handleUpdateStatus(task.id, 'inprogress')}
                        disabled={task.status === 'inprogress'}
                      >
                        In Progress
                      </button>
                      <button
                        className={`${styles.statusButton} ${task.status === 'finished' ? styles.disabled : styles.active}`}
                        onClick={() => handleUpdateStatus(task.id, 'finished')}
                        disabled={task.status === 'finished'}
                      >
                        Finished
                      </button>

                      {/* Add the Edit button here */}
                      <button
                        className={styles.editButton} 
                        onClick={() => handleEditTask(task)}
                      >
                        Edit
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-gray-500">No tasks found.</p>
              )
            ) : (
              <p className="text-red-500">Tasks is not an array. Actual value: {JSON.stringify(tasks)}</p>
            )}
          </ul>
        </div>

        {/* Edit Task Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className={styles.heading}>Edit Task</h2>
              <input
                className={styles.input}
                type="text"
                placeholder="Task title"
                value={editingTask.title}
                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
              />
              <textarea
                className={styles.textarea}
                placeholder="Task description"
                value={editingTask.description}
                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
              />

              <div className="flex justify-between mt-4">
                <button
                  className={styles.button}
                  onClick={handleUpdateTask}
                >
                  Save
                </button>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    setIsModalOpen(false); 
                    setEditingTask(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
