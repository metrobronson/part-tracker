import { useEffect, useState } from "react";
import ClearLogsButton from './components/ClearLogsButton';

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [logs, setLogs] = useState([]);
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

  const loadLogs = () => {
    const saved = JSON.parse(localStorage.getItem("localPartLogs") || "[]");
    setLogs(saved);
  };

  useEffect(() => {
    loadLogs();
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

  function exportCSV() {
    if (logs.length === 0) {
      alert("No logs to export");
      return;
    }
    const headers = "Date,Bus Number,Part Name,Modified Part Number,Direct Fit Part Number,Modified Part Cost,Direct Fit Part Cost,Labor Rate,Supplies Cost,Materials Used,Clock In,Clock Out,Comments\n";
    const rows = logs.map(log => {
      return [
        new Date(log.created_at).toLocaleString(),
        log.bus_number || "",
        log.part_name || "",
        log.modified_part_number || "",
        log.direct_fit_part_number || "",
        log.modified_part_cost || 0,
        log.direct_fit_part_cost || 0,
        log.labor_rate || 0,
        log.supplies_cost || 0,
        `"${(log.materials_used || "").replace(/"/g, '""')}"`,
        log.clock_in || "",
        log.clock_out || "",
        `"${(log.comments || "").replace(/"/g, '""')}"`
      ].join(",");
    }).join("\n");

    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `part-logs-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }

  if (!user) {
    return (
      <div style={{ padding: 40, maxWidth: 520, margin: "100px auto", textAlign: "center", fontFamily: "Arial" }}>
        <img src="/metro-logo.png" alt="Metro" style={{ height: "110px", marginBottom: 30 }} />
        <h1 style={{ color: "#003087", fontSize: "2.8rem", marginBottom: 10, lineHeight: 1.1 }}>Part Modification Cost Tracker</h1>
        <p style={{ fontSize: "1.35rem", color: "#555", marginBottom: 40 }}>Fleet Maintenance • Metro</p>

        <h2 style={{ marginBottom: 20 }}>New User Sign Up</h2>
        <button onClick={() => alert("Sign Up coming soon - use Quick Login")} style={{ width: "100%", padding: "16px", background: "#003087", color: "white", border: "none", borderRadius: 12, fontSize: "18px", marginBottom: 40 }}>
          Create Account
        </button>

        <h3 style={{ marginBottom: 20 }}>Quick Login</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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

      {/* Form */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 35, marginBottom: 40, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}>
        <h2 style={{ color: "#003087" }}>{editingLog ? "Edit Log" : "New Part Modification"}</h2>
        {/* ... full form fields here (same as before) ... */}
        <div style={{marginTop:30}}>
          <button onClick={saveLog} style={{padding:"16px 40px", background:"#1976d2", color:"white", border:"none", borderRadius:10, fontSize:"17px", marginRight:15}}>
            {editingLog ? "Update Log" : "Save Log"}
          </button>
          {saveStatus && <span>{saveStatus}</span>}
        </div>
      </div>

      {isAdmin && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 30, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
            <h2>Saved Logs</h2>
            <div>
              <button onClick={loadLogs} style={{padding:"8px 16px", marginRight:10}}>Refresh</button>
              <button onClick={exportCSV} style={{padding:"8px 16px", background:"#28a745", color:"white", border:"none", borderRadius:8}}>
                📥 Export CSV
              </button>
            </div>
          </div>
          <ClearLogsButton />
          {/* Table with all data */}
          <table style={{width:"100%", marginTop:20, borderCollapse:"collapse"}}>
            <thead>
              <tr style={{background:"#f5f5f5"}}>
                <th style={{padding:12}}>Date</th>
                <th style={{padding:12}}>Bus</th>
                <th style={{padding:12}}>Part</th>
                <th style={{padding:12}}>Modified #</th>
                <th style={{padding:12}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{borderTop:"1px solid #eee"}}>
                  <td style={{padding:12}}>{new Date(log.created_at).toLocaleString()}</td>
                  <td style={{padding:12}}>{log.bus_number}</td>
                  <td style={{padding:12}}>{log.part_name}</td>
                  <td style={{padding:12}}>{log.modified_part_number}</td>
                  <td style={{padding:12}}>
                    <button onClick={() => startEdit(log)} style={{marginRight:12}}>✏️</button>
                    <button onClick={() => deleteLog(log.id)} style={{color:"red"}}>🗑️</button>
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