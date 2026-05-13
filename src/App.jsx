import { useEffect, useState } from "react";
import ClearLogsButton from './components/ClearLogsButton';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLog, setEditingLog] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");

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

  const bypassLogin = (admin) => {
    setUser({ email: admin ? "gary.bronson@go-metro.com" : "tech@go-metro.com" });
    setIsAdmin(admin);
  };

  const signOut = () => setUser(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("localPartLogs") || "[]");
    setLogs(saved);
  }, []);

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
    setTimeout(() => setSaveStatus(""), 1500);
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

        <h2 style={{ marginBottom: 25 }}>Select Role</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <button onClick={() => bypassLogin(true)} style={{ padding: "22px", fontSize: "20px", background: "#003087", color: "white", border: "none", borderRadius: 12 }}>
            👑 Admin - Gary (Full Access)
          </button>
          <button onClick={() => bypassLogin(false)} style={{ padding: "22px", fontSize: "20px", background: "#1976d2", color: "white", border: "none", borderRadius: 12 }}>
            👷 Technician (Input Only)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial", maxWidth: 1600, margin: "0 auto", background: "#f8f9fa", minHeight: "100vh" }}>
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

      {/* Form - visible to both */}
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

          <div style={{gridColumn: "span 2", display: "flex", gap: 20, alignItems: "flex-end"}}>
            <div style={{flex:1}}><label>Clock In</label><input type="datetime-local" value={clockIn} onChange={e => setClockIn(e.target.value)} style={{width:"100%", padding:14, marginTop:8, borderRadius:8}} /></div>
            <button onClick={() => setClockIn(new Date().toISOString().slice(0,16))} style={{padding:"14px 28px", background:"#4caf50", color:"white", border:"none", borderRadius:8}}>Start Job</button>
            <div style={{flex:1}}><label>Clock Out</label><input type="datetime-local" value={clockOut} onChange={e => setClockOut(e.target.value)} style={{width:"100%", padding:14, marginTop:8, borderRadius:8}} /></div>
            <button onClick={() => setClockOut(new Date().toISOString().slice(0,16))} style={{padding:"14px 28px", background:"#f44336", color:"white", border:"none", borderRadius:8}}>Finish Job</button>
          </div>

          <div style={{gridColumn:"span 2"}}><label>Comments</label><input value={comments} onChange={e => setComments(e.target.value)} style={{width:"100%", padding:14, marginTop:8, borderRadius:8}} /></div>
          <div style={{gridColumn:"span 2"}}>
            <label>Materials Used</label>
            <textarea value={materialsUsed} onChange={e => setMaterialsUsed(e.target.value)} style={{width:"100%", padding:14, marginTop:8, minHeight:"110px", borderRadius:8}} />
          </div>
        </div>

        <div style={{marginTop:30}}>
          <button onClick={saveLog} style={{padding:"16px 40px", background:"#1976d2", color:"white", border:"none", borderRadius:10, fontSize:"17px"}}>
            {editingLog ? "Update Log" : "Save Log"}
          </button>
          {saveStatus && <span style={{marginLeft:20}}>{saveStatus}</span>}
        </div>
      </div>

      {isAdmin && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 30, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}>
          <h2>Saved Logs</h2>
          <ClearLogsButton />
        </div>
      )}
    </div>
  );
}