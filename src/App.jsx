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

  function nowLocal() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  }

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

  async function loadLogs() {
    const { data, error } = await supabase
      .from("part_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) alert(error.message);
    else setLogs(data || []);
  }

  function startJob() {
    setClockIn(nowLocal());
    setClockOut("");
  }

  function finishJob() {
    setClockOut(nowLocal());
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

  const page = {
    padding: 16,
    fontFamily: "Arial",
    maxWidth: 1100,
    margin: "0 auto",
  };

  const card = {
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  };

  const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
  };

  const field = {
    display: "flex",
    flexDirection: "column",
  };

  const label = {
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 15,
  };

  const input = {
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
    border: "1px solid #aaa",
    width: "100%",
    boxSizing: "border-box",
  };

  const button = {
    padding: "12px 16px",
    fontSize: 16,
    borderRadius: 8,
    border: "none",
    margin: 4,
    cursor: "pointer",
    background: "#222",
    color: "#fff",
  };

  const greenButton = {
    ...button,
    background: "#137333",
  };

  const redButton = {
    ...button,
    background: "#b3261e",
  };

  const grayButton = {
    ...button,
    background: "#555",
  };

  if (!user) {
    return (
      <div style={page}>
        <div style={card}>
          <h1>Part Tracker Login</h1>

          <div style={field}>
            <label style={label}>Email</label>
            <input style={input} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <br />

          <div style={field}>
            <label style={label}>Password</label>
            <input style={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <br />

          <button style={button} onClick={signIn}>Sign In</button>
          <button style={grayButton} onClick={signUp}>Create Account</button>
        </div>
      </div>
    );
  }

  return (
    <div style={page}>
      <button style={grayButton} onClick={signOut}>Sign Out</button>

      <h1>Part Modification Cost Tracker</h1>
      <p>Signed in as: {user.email}</p>

      <div style={card}>
        <h2>Tech Entry</h2>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <button style={greenButton} onClick={startJob}>Start Job</button>
          <button style={redButton} onClick={finishJob}>Finish Job</button>
        </div>

        <div style={grid}>
          <div style={field}>
            <label style={label}>Bus Number</label>
            <input style={input} value={busNumber} onChange={(e) => setBusNumber(e.target.value)} />
          </div>

          <div style={field}>
            <label style={label}>Part Being Replaced</label>
            <input style={input} value={partName} onChange={(e) => setPartName(e.target.value)} />
          </div>

          <div style={field}>
            <label style={label}>Part # Requiring Modification</label>
            <input style={input} value={modifiedPartNumber} onChange={(e) => setModifiedPartNumber(e.target.value)} />
          </div>

          <div style={field}>
            <label style={label}>Direct-Fit Part #</label>
            <input style={input} value={directFitPartNumber} onChange={(e) => setDirectFitPartNumber(e.target.value)} />
          </div>

          <div style={field}>
            <label style={label}>Modified Part Cost</label>
            <input style={input} type="number" value={modifiedPartCost} onChange={(e) => setModifiedPartCost(e.target.value)} />
          </div>

          <div style={field}>
            <label style={label}>Direct-Fit Part Cost</label>
            <input style={input} type="number" value={directFitPartCost} onChange={(e) => setDirectFitPartCost(e.target.value)} />
          </div>

          <div style={field}>
            <label style={label}>Labor Rate ($/hr)</label>
            <input style={input} type="number" value={laborRate} onChange={(e) => setLaborRate(e.target.value)} />
          </div>

          <div style={field}>
            <label style={label}>Supplies Cost</label>
            <input style={input} type="number" value={suppliesCost} onChange={(e) => setSuppliesCost(e.target.value)} />
          </div>

          <div style={field}>
            <label style={label}>Clock In</label>
            <input style={input} type="datetime-local" value={clockIn} onChange={(e) => setClockIn(e.target.value)} />
          </div>

          <div style={field}>
            <label style={label}>Clock Out</label>
            <input style={input} type="datetime-local" value={clockOut} onChange={(e) => setClockOut(e.target.value)} />
          </div>
        </div>

        <br />

        <div style={field}>
          <label style={label}>Modification Comments</label>
          <textarea style={input} rows="4" value={comments} onChange={(e) => setComments(e.target.value)} />
        </div>

        <br />

        <div style={field}>
          <label style={label}>Materials Used</label>
          <textarea style={input} rows="4" value={materialsUsed} onChange={(e) => setMaterialsUsed(e.target.value)} />
        </div>
      </div>

      <div style={card}>
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

        <button style={greenButton} onClick={saveLog}>Save Log</button>
      </div>

      <div style={card}>
        <h2>{isAdmin ? "Admin Dashboard" : "Saved Logs"}</h2>

        <button style={grayButton} onClick={loadLogs}>Refresh Logs</button>
        {isAdmin && <button style={button} onClick={exportCSV}>Export CSV</button>}

        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", minWidth: 1000 }}>
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
                      <button style={redButton} onClick={() => deleteLog(log.id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}