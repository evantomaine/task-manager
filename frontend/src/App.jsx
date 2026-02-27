import { useState } from "react";

export default function App() {
  const [msg, setMsg] = useState("");

  async function pingBackend() {
    setMsg("Pinging...");
    try {
      const res = await fetch("http://127.0.0.1:8000/health");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMsg(`Backend says: ${data.status}`);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    }
  }

  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Task Manager</h1>
      <button onClick={pingBackend}>Ping backend</button>
      <p>{msg}</p>
    </div>
  );
}
