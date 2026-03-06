import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API_BASE = "http://127.0.0.1:8000";

function formatDateTime(value) {
  if (!value) return null;

  const normalized = /Z|[+-]\d{2}:\d{2}$/.test(value) ? value : `${value}Z`;
  const date = new Date(normalized);

  return date.toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const today = useMemo(() => {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  async function fetchTasks() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/tasks/`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setMessage(`Error loading tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddTask(e) {
    e.preventDefault();

    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) {
      setMessage("Task title cannot be empty.");
      return;
    }

    try {
      setMessage("Adding task...");
      const res = await fetch(`${API_BASE}/tasks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: trimmedTitle }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const createdTask = await res.json();

      setTasks((prevTasks) => [...prevTasks, createdTask]);
      setNewTitle("");
      setMessage("Task added successfully.");
    } catch (err) {
      setMessage(`Error adding task: ${err.message}`);
    }
  }

  async function handleDeleteTask(id) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setTasks((prev) => prev.filter((task) => task.id !== id));
      setMessage("Task deleted successfully.");
    } catch (err) {
      setMessage(`Error deleting task: ${err.message}`);
    }
  }

  async function handleToggleTask(id) {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}/toggle`, {
        method: "PATCH",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const updatedTask = await res.json();

      setTasks((prev) =>
        prev.map((task) => (task.id === id ? updatedTask : task))
      );
      setMessage("Task updated successfully.");
    } catch (err) {
      setMessage(`Error toggling task: ${err.message}`);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <div className="page">
      <div className="app-shell">
        <header className="hero-card">
          <h1 className="hero-title">Evan’s To-Do List</h1>
          <p className="hero-date">
            <span className="date-label">Date:</span> {today}
          </p>
        </header>

        <section className="entry-section">
          <form className="task-form" onSubmit={handleAddTask}>
            <input
              className="task-input"
              type="text"
              placeholder="Write a task here..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <button className="add-btn" type="submit">
              Add Task
            </button>
          </form>

          {message && <p className="status-message">{message}</p>}
        </section>

        <section className="tasks-section">
          <h2 className="section-title">Tasks:</h2>

          {loading ? (
            <p className="empty-text">Loading tasks...</p>
          ) : tasks.length === 0 ? (
            <p className="empty-text">No tasks yet. Add your first one.</p>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`task-bubble ${task.is_completed ? "task-bubble-completed" : ""
                    }`}
                >
                  <div className="task-arrow" aria-hidden="true">
                    <svg
                      width="120"
                      height="44"
                      viewBox="0 0 120 44"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4 12 H78 V4 L116 22 L78 40 V32 H4 Z"
                        fill="var(--card-soft)"
                        stroke="var(--border)"
                        strokeWidth="4"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  <div className="task-content">
                    <div className="task-text-block">
                      <span
                        className={`task-title ${task.is_completed ? "task-title-completed" : ""
                          }`}
                      >
                        {task.title}
                      </span>

                      <div className="task-meta">
                        <span>Added: {formatDateTime(task.created_at)}</span>
                        <span>
                          Completed:{" "}
                          {task.completed_at
                            ? formatDateTime(task.completed_at)
                            : "Not completed yet"}
                        </span>
                      </div>
                    </div>

                    <div className="task-actions">
                      <button
                        className={`action-btn ${task.is_completed ? "undo-btn" : "complete-btn"
                          }`}
                        onClick={() => handleToggleTask(task.id)}
                      >
                        {task.is_completed ? "Undo" : "Complete"}
                      </button>

                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}