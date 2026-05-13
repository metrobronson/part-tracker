import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ClearLogsButton from './components/ClearLogsButton';

const supabase = createClient(
  "https://csxkoyobaztseyknjz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzeGtveW9iYXp0c2V5a25qeiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ2NzE5MjAwLCJleHAiOjIwNjIyOTUyMDB9"
);

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState("signin"); // signin or signup
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
  const laborCost = hours * Number(laborRate || 0);
  const modifiedTotal = Number(modifiedPartCost || 0) + laborCost + Number(suppliesCost || 0);
  const directTotal = Number(directFitPartCost || 0);
  const savings = directTotal - modifiedTotal;

  const isAdmin = user?.email?.includes("admin") || user?.email === "gary.bronson@go-metro.com";

  // Dev Mode
  const bypassLogin = (admin) => {
    setUser({ email: admin ? "gary.bronson@go-metro.com" : "tech@go-metro.com" });
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
  }, []);

  useEffect(() => {
    if (user) loadLogs();
  }, [user]);

  async function loadLogs() {
    const { data } = await supabase.from("part_logs").select("*").order("created_at", { ascending: false });
    setLogs(data || []);
  }

  async function signUp() {
    setAuthError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setAuthError(error.message);
    else alert("✅ Check your email to confirm your account!");
  }

  async function signIn() {
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
  }

  function signOut() {
    supabase.auth.signOut();
  }

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

  async function saveLog() {
    setSaveStatus("Saving...");
    const payload = {
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

    const { error } = await supabase.from("part_logs").insert(payload);
    if (error) {
      const localLogs = JSON.parse(localStorage.getItem("localPartLogs") || "[]");
      localLogs.unshift({ ...payload, id: Date.now() });
      localStorage.setItem("localPartLogs", JSON.stringify(localLogs));
      setSaveStatus("💾 Saved locally");
    } else {
      setSaveStatus("✅ Saved!");
      loadLogs();
    }
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
    supabase.from("part_logs").delete().eq("id", id).then(() => loadLogs());
  }

  const filteredLogs = logs.filter(log =>
    [log.bus_number, log.part_name, log.modified_part_number]
      .some(f => f?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!user) {
    return (
      <div style={{ padding: 40, maxWidth: 520, margin: "120px auto", textAlign: "center", fontFamily: "Arial" }}>
        <img src="/metro-logo.png" alt="Metro" style={{ height: "110px", marginBottom: 30 }} />
        <h1 style={{ color: "#003087", fontSize: "2.8rem", marginBottom: 10, lineHeight: 1.1 }}>Part Modification Cost Tracker</h1>
        <p style={{ fontSize: "1.35rem", color: "#555", marginBottom: 40 }}>Fleet Maintenance • Metro</p>

        <div style={{ marginBottom: 25 }}>
          <button onClick={() => setAuthMode("signin")} style={{ marginRight: 20, fontWeight: authMode === "signin" ? "bold" : "normal" }}>Sign In</button>
          <button onClick={() => setAuthMode("signup")} style={{ fontWeight: authMode === "signup" ? "bold" : "normal" }}>Sign Up</button>
        </div>

        <input type="email" placeholder="Metro Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: "100%", padding: 14, marginBottom: 12, borderRadius: 8 }} />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: 14, marginBottom: 20, borderRadius: 8 }} />

        <button onClick={authMode === "signup" ? signUp : signIn} style={{ width: "100%", padding: "16px", background: "#003087", color: "white", border: "none", borderRadius: 12, fontSize: "18px" }}>
          {authMode === "signup" ? "Create Account" : "Sign In"}
        </button>

        {authError && <p style={{ color: "red", marginTop: 15 }}>{authError}</p>}

        <p style={{ marginTop: 40, color: "#666" }}>— OR — Quick Login</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 15, marginTop: 15 }}>
          <button onClick={() => bypassLogin(true)} style={{ padding: "16px", background: "#003087", color: "white", border: "none", borderRadius: 12 }}>👑 Admin (Full Access)</button>
          <button onClick={() => bypassLogin(false)} style={{ padding: "16px", background: "#1976d2", color: "white", border: "none", borderRadius: 12 }}>👷 Technician (Input Only)</button>
        </div>
      </div>
    );
  }

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
          <button onClick={signOut} style={{ padding: "12px 28px", background: "#555", color: "white", border: "none", borderRadius: 8 }}>Sign Out</button>
        </div>
      </div>

      {/* Form */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 35, marginBottom: 40, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}>
        <h2 style={{ color: "#003087" }}>{editingLog ? "Edit Log" : "New Part Modification"}</h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "22px" }}>
          <div><label>Bus Number</label><input value={busNumber} onChange={e => setBusNumber(e.target.value)} style={{width:"100%", padding:14, marginTop:8, borderRadius:8}} /></div>
          <div><label>Part Being Replaced</label><input value={partName} onChange={e => setPartName(e.target.value)} style={{width:"100%", padding:14, marginTop:8, borderRadius:8}} /></div>
          <div><label>Modified Part Number</label><input value={modifiedPartNumber} onChange={e => setModifiedPartNumber(e.target.value)} style={{width:"100%", padding:14, marginTop:8, borderRadius:8}} /></div>

          {isAdmin && (
            <>
              <div><label>Direct Fit Part Number</label><input value={directFitPartNumber} onChange={e => setDirectFitPartNumber(e.target.value)} style={{width:"100%", padding:14, marginTop:8, borderRadius:8}} /></div>
              <div><label>Modified Part Cost ($)</label><input type="number" value={modifiedPartCost} onChange={e => setModifiedPartCost(e.target.value)} style={{width:"100%", padding:14, marginTop:8, borderRadius:8}} /></div>
              <div><label>Direct Fit Part Cost ($)</label><input type="number" value={directFitPartCost} onChange={e => setDirectFitPartCost(e.target.value)} style={{width:"100%", padding:14, marginTop:8, borderRadius:8}} /></div>
              <div><label>Labor Rate ($/hr)</label><input value={laborRate} onChange={e => setLaborRate(e.target.value)} style={{width:"100%", padding:14, marginTop:8, borderRadius:8}} /></div>
              <div><label>Supplies Cost ($)</label><input type="number" value={suppliesCost} onChange={e => setSuppliesCost(e.target.value)} style={{width:"100%", padding:14, marginTop:8, borderRadius:8}} /></div>
            </>
          )}

          <div style={{ gridColumn: "span 2", display: "flex", gap: 20, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}><label>Clock In</label><input type="datetime-local" value={clockIn} onChange={e => setClockIn(e.target.value)} style={{ width: "100%", padding: 14, marginTop: 8, borderRadius: 8 }} /></div>
            <button onClick={() => setClockIn(new Date().toISOString().slice(0,16))} style={{ padding: "14px 28px", background: "#4caf50", color: "white", border: "none", borderRadius: 8 }}>Start Job</button>
            <div style={{ flex: 1 }}><label>Clock Out</label><input type="datetime-local" value={clockOut} onChange={e => setClockOut(e.target.value)} style={{ width: "100%", padding: 14, marginTop: 8, borderRadius: 8 }} /></div>
            <button onClick={() => setClockOut(new Date().toISOString().slice(0,16))} style={{ padding: "14px 28px", background: "#f44336", color: "white", border: "none", borderRadius: 8 }}>Finish Job</button>
          </div>

          <div style={{ gridColumn: "span 2" }}><label>Comments</label><input value={comments} onChange={e => setComments(e.target.value)} style={{ width: "100%", padding: 14, marginTop: 8, borderRadius: 8 }} /></div>
          <div style={{ gridColumn: "span 2" }}>
            <label>Materials Used</label>
            <textarea value={materialsUsed} onChange={e => setMaterialsUsed(e.target.value)} placeholder="List materials used..." style={{ width: "100%", padding: 14, marginTop: 8, minHeight: "100px", borderRadius: 8 }} />
          </div>
        </div>

        <div style={{ marginTop: 30 }}>
          <button onClick={saveLog} style={{ padding: "16px 40px", background: "#1976d2", color: "white", border: "none", borderRadius: 10, fontSize: "17px" }}>
            {editingLog ? "Update Log" : "Save Log"}
          </button>
          {saveStatus && <span style={{ marginLeft: 20 }}>{saveStatus}</span>}
        </div>
      </div>

      {/* ADMIN ONLY - Saved Logs */}
      {isAdmin && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 30, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2>Saved Logs</h2>
            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: "10px 16px", width: "320px", borderRadius: 8 }} />
          </div>

          <ClearLogsButton />

          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: 12, textAlign: "left" }}>Bus</th>
                <th style={{ padding: 12, textAlign: "left" }}>Part</th>
                <th style={{ padding: 12, textAlign: "left" }}>Modified Total</th>
                <th style={{ padding: 12, textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: 12 }}>{log.bus_number}</td>
                  <td style={{ padding: 12 }}>{log.part_name}</td>
                  <td style={{ padding: 12 }}>${(Number(log.modified_part_cost || 0) + Number(log.supplies_cost || 0) + (Number(log.labor_rate || 0) * hours)).toFixed(2)}</td>
                  <td style={{ padding: 12 }}>
                    <button onClick={() => startEdit(log)} style={{ marginRight: 15, fontSize: "18px" }}>✏️</button>
                    <button onClick={() => deleteLog(log.id)} style={{ color: "red", fontSize: "22px" }}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}