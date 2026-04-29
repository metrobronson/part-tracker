import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://csxokyoobaztsesykjnz.supabase.co",
  "PASTE_YOUR_PUBLISHABLE_KEY_HERE"
);

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);

  const [bus, setBus] = useState("");
  const [part, setPart] = useState("");
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");

  const isAdmin = email.includes("admin"); // simple admin check

  useEffect(() => {
    if (user) fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("part_logs")
      .select("*")
      .order("created_at", { ascending: false });
    setLogs(data || []);
  };

  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    else setUser(data.user);
  };

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) alert(error.message);
    else alert("Account created");
  };

  const saveLog = async () => {
    const { error } = await supabase.from("part_logs").insert({
      bus_number: bus,
      part_name: part,
      clock_in: clockIn || null,
      clock_out: clockOut || null,
      tech_email: user.email,
    });

    if (error) alert(error.message);
    else {
      alert("Saved!");
      fetchLogs();
    }
  };

  const deleteLog = async (id) => {
    await supabase.from("part_logs").delete().eq("id", id);
    fetchLogs();
  };

  const exportCSV = () => {
    let csv =
      "Bus,Part,Tech,Clock In,Clock Out\n" +
      logs
        .map(
          (l) =>
            `${l.bus_number},${l.part_name},${l.tech_email},${l.clock_in},${l.clock_out}`
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "logs.csv";
    a.click();
  };

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Login</h2>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <br />
        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button onClick={signIn}>Sign In</button>
        <button onClick={signUp}>Create Account</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Part Log</h2>
      <p>Signed in as: {user.email}</p>

      <input
        placeholder="Bus Number"
        onChange={(e) => setBus(e.target.value)}
      />
      <br />
      <input
        placeholder="Part Name"
        onChange={(e) => setPart(e.target.value)}
      />
      <br />
      <input
        type="datetime-local"
        onChange={(e) => setClockIn(e.target.value)}
      />
      <br />
      <input
        type="datetime-local"
        onChange={(e) => setClockOut(e.target.value)}
      />
      <br />
      <button onClick={saveLog}>Save Log</button>

      <hr />

      {isAdmin && (
        <>
          <h3>Admin Dashboard</h3>
          <button onClick={exportCSV}>Export CSV</button>

          {logs.map((log) => (
            <div
              key={log.id}
              style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}
            >
              <b>{log.bus_number}</b> - {log.part_name}
              <br />
              Tech: {log.tech_email}
              <br />
              In: {log.clock_in}
              <br />
              Out: {log.clock_out}
              <br />
              <button onClick={() => deleteLog(log.id)}>Delete</button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}