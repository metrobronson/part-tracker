import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ClearLogsButton from './components/ClearLogsButton';

const supabase = createClient(
  "https://csxkoyobaztseyknjz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzeGtveW9iYXp0c2V5a25qeiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ2NzE5MjAwLCJleHAiOjIwNjIyOTUyMDB9"
);

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLog, setEditingLog] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");

  // Form fields
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

  const hours = clockIn && clockOut ? Math.max(0, (new Date(clockOut) - new Date(clockIn)) / 1000 / 60 / 60) : 0;
  const modifiedTotal = Number(modifiedPartCost || 0) + (hours * Number(laborRate || 0)) + Number(suppliesCost || 0);

  const isAdmin = user?.email?.includes("admin") || user?.email === "gary.bronson@go-metro.com";

  const bypassLogin = (admin) => {
    setUser({ email: admin ? "gary.bronson@go-metro.com" : "tech@go-metro.com" });
  };

  const signOut = () => setUser(null);

  useEffect(() => {
    const localLogs = JSON.parse(localStorage.getItem("localPartLogs") || "[]");
    setLogs(localLogs);
  }, []);

  async function handleSignUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setAuthError(error.message);
    else alert("✅ Check your email for confirmation link!");
  }

  // ... (startEdit, saveLog, resetForm, deleteLog same as before)

  function startEdit(log) {
    if (!isAdmin) return;
    setEditingLog(log);
    setBusNumber(log.bus_number || "");
    setPartName(log.part_name || "");
    setModifiedPartNumber(log.modified_part_number || "");
    setDirectFitPartNumber(log.direct_fit_part_number || "");
    setModifiedPartCost(log.modified_part_cost || "");
    setDirectFitPartCost(log.direct_fit_part_cost || "");
    setLaborRate(log.labor_rate || "75");
    setSuppliesCost(log.supplies_cost || "");
    setClockIn(log.clock_in || "");
    setClockOut(log.clock_out || "");
    setComments(log.comments || "");
    setMaterialsUsed(log.materials_used || "");
  }

  function saveLog() {
    const payload = {
      id: editingLog ? editingLog.id : Date.now(),
      bus_number: busNumber,
      part_name: partName,
      modified_part_number: modifiedPartNumber,
      direct_fit_part_number: directFitPartNumber,
      modified_part_cost: Number(modifiedPartCost || 0),
      direct_fit_part_cost: Number(directFitPartCost || 0),
      labor_rate: Number(laborRate),
      supplies_cost: Number(suppliesCost || 0),
      materials_used: materialsUsed,
      clock_in: clockIn,
      clock_out: clockOut,
      comments,
      created_at: new Date().toISOString()
    };

    const localLogs = JSON.parse(localStorage.getItem("localPartLogs") || "[]");
    if (editingLog) {
      const index = localLogs.findIndex(l => l.id === editingLog.id);
      if (index !== -1) localLogs[index] = payload;
    } else {
      localLogs.unshift(payload);
    }
    localStorage.setItem("localPartLogs", JSON.stringify(localLogs));
    setLogs(localLogs);
    setSaveStatus("💾 Saved locally");
    resetForm();
    setTimeout(() => setSaveStatus(""), 2000);
  }

  function resetForm() {
    setBusNumber(""); setPartName(""); setModifiedPartNumber(""); setDirectFitPartNumber("");
    setModifiedPartCost(""); setDirectFitPartCost(""); setSuppliesCost("");
    setClockIn(""); setClockOut(""); setComments(""); setMaterialsUsed("");
    setEditingLog(null);
  }

  function deleteLog(id) {
    if (!isAdmin) return;
    if (!window.confirm("Delete this log?")) return;
    const localLogs = JSON.parse(localStorage.getItem("localPartLogs") || "[]");
    localStorage.setItem("localPartLogs", JSON.stringify(localLogs.filter(l => l.id !== id)));
    setLogs(localLogs.filter(l => l.id !== id));
  }

  if (!user) {
    return (
      <div style={{ padding: 40, maxWidth: 520, margin: "100px auto", textAlign: "center", fontFamily: "Arial" }}>
        <img src="/metro-logo.png" alt="Metro" style={{ height: "110px", marginBottom: 30 }} />
        <h1 style={{ color: "#003087", fontSize: "2.8rem", marginBottom: 10, lineHeight: 1.1 }}>Part Modification Cost Tracker</h1>
        <p style={{ fontSize: "1.35rem", color: "#555", marginBottom: 40 }}>Fleet Maintenance • Metro</p>

        {/* New User Sign Up */}
        <h2 style={{ marginBottom: 20 }}>New User Sign Up</h2>
        <input type="email" placeholder="Your Metro Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: 14, marginBottom: 12, borderRadius: 8 }} />
        <input type="password" placeholder="Create Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: 14, marginBottom: 20, borderRadius: 8 }} />
        <button onClick={handleSignUp} style={{ width: "100%", padding: "16px", background: "#003087", color: "white", border: "none", borderRadius: 12, fontSize: "18px", marginBottom: 40 }}>
          Create Account
        </button>

        {authError && <p style={{ color: "red" }}>{authError}</p>}

        <p style={{ margin: "30px 0 20px 0", color: "#666", fontSize: "1.1rem" }}>— OR —</p>

        {/* Quick Login */}
        <h3 style={{ marginBottom: 15 }}>Quick Login (Recommended)</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button onClick={() => bypassLogin(true)} style={{ padding: "20px", fontSize: "19px", background: "#003087", color: "white", border: "none", borderRadius: 12 }}>
            👑 Admin - Gary (Full Access)
          </button>
          <button onClick={() => bypassLogin(false)} style={{ padding: "20px", fontSize: "19px", background: "#1976d2", color: "white", border: "none", borderRadius: 12 }}>
            👷 Technician (Input Only)
          </button>
        </div>
      </div>
    );
  }

  // Main App Content
  return (
    <div style={{ padding: 20, fontFamily: "Arial", maxWidth: 1600, margin: "0 auto", background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 50, paddingBottom: 30, borderBottom: "6px solid #003087", gap: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "25px", flex: 1 }}>
          <img src="/metro-logo.png" alt="Metro Logo" style={{ height: "90px" }} />
          <div>
            <h1 style={{ margin: 0, fontSize: "2.8rem", color: "#003087", fontWeight: "bold", lineHeight: 1.05 }}>Part Modification Cost Tracker</h1>
            <p style={{ margin: 5, color: "#555", fontSize: "1.35rem" }}>Fleet Maintenance • Metro</p>
          </div>
        </div>
        <div>
          <span style={{ marginRight: 20 }}>Signed in as: <strong>{user.email}</strong> ({isAdmin ? "Admin" : "Technician"})</span>
          <button onClick={signOut} style={{ padding: "12px 28px", background: "#d32f2f", color: "white", border: "none", borderRadius: 8 }}>Sign Out</button>
        </div>
      </div>

      {/* Form and Logs - Full content */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 35, marginBottom: 40, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}>
        <h2 style={{ color: "#003087" }}>{editingLog ? "Edit Log" : "New Part Modification"}</h2>
        {/* Form grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "22px" }}>
          {/* All fields here - same as before */}
          <div><label>Bus Number</label><input value={busNumber} onChange={e => setBusNumber(e.target.value)} style={{width:"100%", padding:14, marginTop:8, borderRadius:8}} /></div>
          <div><label>Part Being Replaced</label><input value={partName} onChange={e => setPartName(e.target.value)} style={{width:"100%", padding:14, marginTop:8, borderRadius:8}} /></div>
          <div><label>Modified Part Number</label><input value={modifiedPartNumber} onChange={e => setModifiedPartNumber(e.target.value)} style={{width:"100%", padding:14, marginTop:8, borderRadius:8}} /></div>
          {/* ... rest of form fields ... */}
        </div>
        <button onClick={saveLog} style={{ marginTop: 30, padding: "16px 40px", background: "#1976d2", color: "white", border: "none", borderRadius: 10, fontSize: "17px" }}>
          Save Log
        </button>
      </div>

      {isAdmin && <div style={{ background: "#fff", borderRadius: 16, padding: 30 }}><h2>Saved Logs</h2><ClearLogsButton /></div>}
    </div>
  );
}