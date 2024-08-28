import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "Medium",  // Default priority
    dueDate: "",
  });
  const [errors, setErrors] = useState({});
  const [sortType, setSortType] = useState("dueDate"); // Default sort by due date

  useEffect(() => {
    // Fetch tasks when the component mounts
    fetch(`/api/tasks/${session?.userId}`)
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, [session]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!newTask.title.trim()) errors.title = "Title is required.";
    if (!newTask.description.trim()) errors.description = "Description is required.";
    return errors;
  };

  // Handle task creation
  const handleCreateTask = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const res = await fetch(`/api/tasks/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newTask, userId: session?.userId }),
    });
    const task = await res.json();
    setTasks([...tasks, task]);

    // Reset the form
    setNewTask({
      title: "",
      description: "",
      status: "pending",
      priority: "Medium",
      dueDate: "",
    });
    setErrors({});
  };

  // Get notifications for overdue and upcoming tasks
  const getNotifications = () => {
    const now = new Date();
    const upcomingTasks = tasks.filter(task => task.dueDate && new Date(task.dueDate) > now);
    const overdueTasks = tasks.filter(task => task.dueDate && new Date(task.dueDate) < now);

    return { upcomingTasks, overdueTasks };
  };

  const { upcomingTasks, overdueTasks } = getNotifications();

  // Sorting tasks by priority or due date
  const sortedTasks = [...tasks].sort((a, b) => {
    if (sortType === "priority") {
      const priorities = { "High": 1, "Medium": 2, "Low": 3 };
      return priorities[a.priority] - priorities[b.priority];
    }
    if (sortType === "dueDate") {
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    return 0;
  });

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  // Handle task editing (basic inline editing for simplicity)
  const handleEditTask = async (taskId) => {
    const taskToEdit = tasks.find(task => task.id === taskId);
    const updatedTitle = prompt("Edit task title:", taskToEdit.title);
    const updatedDescription = prompt("Edit task description:", taskToEdit.description);
    const updatedTask = {
      ...taskToEdit,
      title: updatedTitle || taskToEdit.title,
      description: updatedDescription || taskToEdit.description,
    };

    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });

    const updatedTaskFromServer = await res.json();
    setTasks(tasks.map(task => (task.id === taskId ? updatedTaskFromServer : task)));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {/* Task Creation Form */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Create a New Task</h2>
        <input
          type="text"
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          className="border rounded-lg p-2 w-full mb-2"
        />
        {errors.title && <p className="text-red-500">{errors.title}</p>}

        <textarea
          placeholder="Task description"
          value={newTask.description}
          onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          className="border rounded-lg p-2 w-full mb-2"
        />
        {errors.description && <p className="text-red-500">{errors.description}</p>}

        <select
          value={newTask.priority}
          onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
          className="border rounded-lg p-2 w-full mb-2"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <input
          type="date"
          value={newTask.dueDate}
          onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          className="border rounded-lg p-2 w-full mb-4"
        />

        <button
          onClick={handleCreateTask}
          className="bg-blue-500 text-white rounded-lg px-4 py-2"
        >
          Create Task
        </button>
      </div>

      {/* Notifications Section */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Notifications</h2>
        {overdueTasks.length > 0 && (
          <div>
            <h3 className="text-xl text-red-500 mb-2">Overdue Tasks:</h3>
            <ul className="list-disc pl-5">
              {overdueTasks.map(task => (
                <li key={task.id}>
                  {task.title} was due on {new Date(task.dueDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        )}

        {upcomingTasks.length > 0 && (
          <div>
            <h3 className="text-xl text-yellow-500 mb-2">Upcoming Tasks:</h3>
            <ul className="list-disc pl-5">
              {upcomingTasks.map(task => (
                <li key={task.id}>
                  {task.title} is due on {new Date(task.dueDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sorting Options */}
      <div className="flex justify-between items-center mb-4">
        <label className="text-lg font-semibold">Sort by: </label>
        <select
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
          className="border rounded-lg p-2"
        >
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      {/* Task List */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-2xl font-semibold mb-4">Your Tasks</h2>
        <ul className="list-disc pl-5">
          {sortedTasks.map(task => (
            <li key={task.id} className="mb-4">
              <h3 className="text-xl font-semibold">
                {task.title} ({task.priority} Priority)
              </h3>
              <p className="text-gray-600">{task.description}</p>
              <p className="text-gray-600">Status: {task.status}</p>
              <p className="text-gray-600">
                Due Date: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
              </p>
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleEditTask(task.id)}
                  className="bg-yellow-500 text-white rounded-lg px-4 py-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="bg-red-500 text-white rounded-lg px-4 py-2"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
