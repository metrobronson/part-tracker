import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://csxokyoobaztsesyknjz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzeG9reW9vYmF6dHNlc3lrbmp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MzgzMjcsImV4cCI6MjA5MzAxNDMyN30.198J49PGCuvmu52C2-LRAWye8nd6OyvSZvmYD8zNATM"
);

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busNumber, setBusNumber] = useState("");
  const [partName, setPartName] = useState("");
  const [modifiedPartNumber, setModifiedPartNumber] = useState("");
  const [directFitPartNumber, setDirectFitPartNumber] = useState("");
  const [modifiedPartCost, setModifiedPartCost] = useState("");
  const [directFitPartCost, setDirectFitPartCost] = useState("");
  const [laborRate, setLaborRate] = useState("75");
  const [suppliesCost, setSuppliesCost] = useState("");
  const [clockIn, setClockIn] = useState("");
  const [clockOut, setClockOut] = useState("");
  const [comments, setComments] = useState("");
  const [materialsUsed, setMaterialsUsed] = useState("");
  const [logs, setLogs] = useState([]);

  const isAdmin = user?.email?.includes("admin");

  const hours =
    clockIn && clockOut
      ? Math.max(0, (new Date(clockOut) - new Date(clockIn)) / 1000 / 60 / 60)
      : 0;

  const laborCost = hours * Number(laborRate || 0);
  const modifiedTotal =
    Number(modifiedPartCost || 0) + laborCost + Number(suppliesCost || 0);
  const directFitTotal = Number(directFitPartCost || 0);
  const difference = modifiedTotal - directFitTotal;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser(data.user);
        loadLogs();
      }
    });
  }, []);

  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else alert("Account created. Now sign in.");
  }

  async function signIn() {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) alert(error.message);
    else {
      setUser(data.user);
      loadLogs();
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
  }

  function nowLocal() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

  async function loadLogs() {
    const { data, error } = await supabase
      .from("part_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) alert(error.message);
    else setLogs(data || []);
  }

  async function saveLog() {
    const { error } = await supabase.from("part_logs").insert({
      tech_email: user.email,
      bus_number: busNumber,
      part_name: partName,
      modified_part_number: modifiedPartNumber,
      direct_fit_part_number: directFitPartNumber,
      modified_part_cost: Number(modifiedPartCost || 0),
      direct_fit_part_cost: Number(directFitPartCost || 0),
      labor_rate: Number(laborRate || 0),
      supplies_cost: Number(suppliesCost || 0),
      clock_in: clockIn || null,
      clock_out: clockOut || null,
      comments,
      materials_used: materialsUsed,
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Log saved!");
    setBusNumber("");
    setPartName("");
    setModifiedPartNumber("");
    setDirectFitPartNumber("");
    setModifiedPartCost("");
    setDirectFitPartCost("");
    setSuppliesCost("");
    setClockIn("");
    setClockOut("");
    setComments("");
    setMaterialsUsed("");
    loadLogs();
  }

  async function deleteLog(id) {
    const { error } = await supabase.from("part_logs").delete().eq("id", id);
    if (error) alert(error.message);
    else loadLogs();
  }

  function exportCSV() {
    const header =
      "Bus,Tech,Part,Modified Part #,Direct-Fit Part #,Modified Part Cost,Direct-Fit Part Cost,Labor Rate,Supplies Cost,Clock In,Clock Out,Comments,Materials\n";

    const rows = logs
      .map((l) =>
        [
          l.bus_number,
          l.tech_email,
          l.part_name,
          l.modified_part_number,
          l.direct_fit_part_number,
          l.modified_part_cost,
          l.direct_fit_part_cost,
          l.labor_rate,
          l.supplies_cost,
          l.clock_in,
          l.clock_out,
          l.comments,
          l.materials_used,
        ].join(",")
      )
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "part_logs.csv";
    a.click();
  }

  const fieldStyle = {
    display: "flex",
    flexDirection: "column",
    marginBottom: 14,
  };

  const inputStyle = {
    padding: 8,
    fontSize: 16,
    width: "100%",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontWeight: "bold",
    marginBottom: 4,
  };

  if (!user) {
    return (
      <div style={{ padding: 30, fontFamily: "Arial" }}>
        <h1>Part Tracker Login</h1>

        <div style={fieldStyle}>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <button onClick={signIn}>Sign In</button>
        <button onClick={signUp}>Create Account</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 30, fontFamily: "Arial", maxWidth: 1200 }}>
      <button onClick={signOut}>Sign Out</button>

      <h1>Part Modification Cost Tracker</h1>
      <p>Signed in as: {user.email}</p>

      <h2>Tech Entry</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Bus Number</label>
          <input style={inputStyle} value={busNumber} onChange={(e) => setBusNumber(e.target.value)} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Part Being Replaced</label>
          <input style={inputStyle} value={partName} onChange={(e) => setPartName(e.target.value)} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Part # Requiring Modification</label>
          <input style={inputStyle} value={modifiedPartNumber} onChange={(e) => setModifiedPartNumber(e.target.value)} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Direct-Fit Part #</label>
          <input style={inputStyle} value={directFitPartNumber} onChange={(e) => setDirectFitPartNumber(e.target.value)} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Modified Part Cost</label>
          <input style={inputStyle} type="number" value={modifiedPartCost} onChange={(e) => setModifiedPartCost(e.target.value)} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Direct-Fit Part Cost</label>
          <input style={inputStyle} type="number" value={directFitPartCost} onChange={(e) => setDirectFitPartCost(e.target.value)} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Labor Rate ($/hr)</label>
          <input style={inputStyle} type="number" value={laborRate} onChange={(e) => setLaborRate(e.target.value)} />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Supplies Cost</label>
          <input style={inputStyle} type="number" value={suppliesCost} onChange={(e) => setSuppliesCost(e.target.value)} />
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Clock In</label>
        <div>
          <input type="datetime-local" value={clockIn} onChange={(e) => setClockIn(e.target.value)} />
          <button onClick={() => setClockIn(nowLocal())}>Now</button>
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Clock Out</label>
        <div>
          <input type="datetime-local" value={clockOut} onChange={(e) => setClockOut(e.target.value)} />
          <button onClick={() => setClockOut(nowLocal())}>Now</button>
        </div>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Modification Comments</label>
        <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows="4" style={inputStyle} />
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Materials Used</label>
        <textarea value={materialsUsed} onChange={(e) => setMaterialsUsed(e.target.value)} rows="4" style={inputStyle} />
      </div>

      <h2>Live Cost Comparison</h2>
      <p>Labor Hours: {hours.toFixed(2)}</p>
      <p>Labor Cost: ${laborCost.toFixed(2)}</p>
      <p>Modified Part Total: ${modifiedTotal.toFixed(2)}</p>
      <p>Direct-Fit Part Total: ${directFitTotal.toFixed(2)}</p>

      <h3>
        {difference > 0
          ? `Modifying costs $${difference.toFixed(2)} more`
          : `Modifying saves $${Math.abs(difference).toFixed(2)}`}
      </h3>

      <button onClick={saveLog}>Save Log</button>

      <hr />

      <h2>{isAdmin ? "Admin Dashboard" : "Saved Logs"}</h2>

      <button onClick={loadLogs}>Refresh Logs</button>
      {isAdmin && <button onClick={exportCSV}>Export CSV</button>}

      <table border="1" cellPadding="6" style={{ marginTop: 15, borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Bus</th>
            <th>Tech</th>
            <th>Part</th>
            <th>Modified #</th>
            <th>Direct-Fit #</th>
            <th>Mod Cost</th>
            <th>Direct Cost</th>
            <th>Labor Rate</th>
            <th>Supplies</th>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Comments</th>
            <th>Materials</th>
            {isAdmin && <th>Delete</th>}
          </tr>
        </thead>

        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{log.bus_number}</td>
              <td>{log.tech_email}</td>
              <td>{log.part_name}</td>
              <td>{log.modified_part_number}</td>
              <td>{log.direct_fit_part_number}</td>
              <td>${Number(log.modified_part_cost || 0).toFixed(2)}</td>
              <td>${Number(log.direct_fit_part_cost || 0).toFixed(2)}</td>
              <td>${Number(log.labor_rate || 0).toFixed(2)}</td>
              <td>${Number(log.supplies_cost || 0).toFixed(2)}</td>
              <td>{log.clock_in}</td>
              <td>{log.clock_out}</td>
              <td>{log.comments}</td>
              <td>{log.materials_used}</td>
              {isAdmin && (
                <td>
                  <button onClick={() => deleteLog(log.id)}>Delete</button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}