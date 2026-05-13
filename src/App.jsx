import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ClearLogsButton from './components/ClearLogsButton';

const supabase = createClient(
  "https://csxkoyobaztseyknjz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzeGtveW9iYXp0c2V5a25qeiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ2NzE5MjAwLCJleHAiOjIwNjIyOTUyMDB9"
);

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // null, "admin", "tech"
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
  const laborCost = hours * Number(laborRate || 0);
  const modifiedTotal = Number(modifiedPartCost || 0) + laborCost + Number(suppliesCost || 0);
  const directTotal = Number(directFitPartCost || 0);
  const savings = directTotal - modifiedTotal;

  useEffect(() => {
    const localLogs = JSON.parse(localStorage.getItem("localPartLogs") || "[]");
    setLogs(localLogs);
  }, []);

  function startEdit(log) {
    if (role !== "admin") return;
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
    setSaveStatus("Saving...");
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
      clock_in: clockIn || null,
      clock_out: clockOut || null,
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
    if (role !== "admin") return;
    if (!window.confirm("Delete this log?")) return;
    const localLogs = JSON.parse(localStorage.getItem("localPartLogs") || "[]");
    localStorage.setItem("localPartLogs", JSON.stringify(localLogs.filter(l => l.id !== id)));
    setLogs(localLogs.filter(l => l.id !== id));
  }

  function exportCSV() {
    const header = "Date,Bus,Part,Modified #,Direct #,Mod Cost,Direct Cost,Labor Hours,Labor $,Supplies,Materials,Total $,Comments\n";
    const rows = logs.map(l => {
      const h = ((new Date(l.clock_out || 0) - new Date(l.clock_in || 0)) / 3600000).toFixed(2);
      const ld = (Number(l.labor_rate || 0) * Number(h)).toFixed(2);
      const total = (Number(l.modified_part_cost || 0) + Number(l.supplies_cost || 0) + Number(ld)).toFixed(2);
      return [
        new Date(l.created_at).toLocaleDateString(),
        l.bus_number || "", l.part_name || "", l.modified_part_number || "", l.direct_fit_part_number || "",
        l.modified_part_cost || 0, l.direct_fit_part_cost || 0, h, ld, l.supplies_cost || 0, l.materials_used || "",
        total, `"${(l.comments || "").replace(/"/g, '""')}"`
      ].join(",");
    }).join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Metro-Part-Logs-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }

  const filteredLogs = logs.filter(log =>
    [log.bus_number, log.part_name, log.modified_part_number]
      .some(f => f?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const bypassLogin = (selectedRole) => {
    setUser({ email: "gary.bronson@go-metro.com" });
    setRole(selectedRole);
  };

  if (!user) {
    return (
      <div style={{ 
        padding: 40, 
        maxWidth: 520, 
        margin: "140px auto", 
        textAlign: "center", 
        fontFamily: "Arial" 
      }}>
        <img src="/metro-logo.png" alt="Metro" style={{ height: "110px", marginBottom: 30 }} />
        
        <h1 style={{ 
          color: "#003087", 
          fontSize: "2.8rem", 
          margin: "0 0 10px 0", 
          lineHeight: 1.1 
        }}>
          Part Modification Cost Tracker
        </h1>
        
        <p style={{ 
          margin: "0 0 50px 0", 
          fontSize: "1.35rem", 
          color: "#555" 
        }}>
          Fleet Maintenance • Metro
        </p>

        <p style={{ marginBottom: 30, fontSize: "1.2rem" }}>Select your role</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <button 
            onClick={() => bypassLogin("admin")} 
            style={{ 
              padding: "18px", 
              fontSize: "18px", 
              background: "#003087", 
              color: "white", 
              border: "none", 
              borderRadius: 12,
              cursor: "pointer"
            }}
          >
            Admin (Full Access)
          </button>
          <button 
            onClick={() => bypassLogin("tech")} 
            style={{ 
              padding: "18px", 
              fontSize: "18px", 
              background: "#1976d2", 
              color: "white", 
              border: "none", 
              borderRadius: 12,
              cursor: "pointer"
            }}
          >
            Technician (Input Only)
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = role === "admin";

  return (
    <div style={{ padding: 20, fontFamily: "Arial", maxWidth: 1600, margin: "0 auto", background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 50, paddingBottom: 30, borderBottom: "6px solid #003087", gap: "40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "25px", flex: 1 }}>
          <img src="/metro-logo.png" alt="Metro Logo" style={{ height: "90px", width: "auto" }} />
          <div>
            <h1 style={{ margin: 0, fontSize: "2.8rem", color: "#003087", fontWeight: "bold", lineHeight: 1.05 }}>
              Part Modification Cost Tracker
            </h1>
            <p style={{ margin: 5, color: "#555", fontSize: "1.35rem" }}>
              Fleet Maintenance • Metro
            </p>
          </div>
        </div>
        <div>
          <span style={{ marginRight: 20 }}>Role: <strong>{isAdmin ? "Admin" : "Technician"}</strong></span>
          <button onClick={() => setUser(null)} style={{ padding: "12px 28px", background: "#555", color: "white", border: "none", borderRadius: 8 }}>Sign Out</button>
        </div>
      </div>

      {/* Form - Visible to Everyone */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 35, marginBottom: 40, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}>
        <h2 style={{ marginTop: 0, color: "#003087" }}>{editingLog ? "Edit Log" : "New Part Modification"}</h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "22px" }}>
          <div><label>Bus Number</label><input value={busNumber} onChange={e => setBusNumber(e.target.value)} style={{ width: "100%", padding: 14, marginTop: 8, borderRadius: 8 }} /></div>
          <div><label>Part Being Replaced</label><input value={partName} onChange={e => setPartName(e.target.value)} style={{ width: "100%", padding: 14, marginTop: 8, borderRadius: 8 }} /></div>
          <div><label>Modified Part Number</label><input value={modifiedPartNumber} onChange={e => setModifiedPartNumber(e.target.value)} style={{ width: "100%", padding: 14, marginTop: 8, borderRadius: 8 }} /></div>

          {isAdmin && (
            <>
              <div><label>Direct Fit Part Number</label><input value={directFitPartNumber} onChange={e => setDirectFitPartNumber(e.target.value)} style={{ width: "100%", padding: 14, marginTop: 8, borderRadius: 8 }} /></div>
              <div><label>Modified Part Cost ($)</label><input value={modifiedPartCost} onChange={e => setModifiedPartCost(e.target.value)} type="number" style={{ width: "100%", padding: 14, marginTop: 8, borderRadius: 8 }} /></div>
              <div><label>Direct Fit Part Cost ($)</label><input value={directFitPartCost} onChange={e => setDirectFitPartCost(e.target.value)} type="number" style={{ width: "100%", padding: 14, marginTop: 8, borderRadius: 8 }} /></div>
              <div><label>Labor Rate ($/hr)</label><input value={laborRate} onChange={e => setLaborRate(e.target.value)} style={{ width: "100%", padding: 14, marginTop: 8, borderRadius: 8 }} /></div>
              <div><label>Supplies Cost ($)</label><input value={suppliesCost} onChange={e => setSuppliesCost(e.target.value)} type="number" style={{ width: "100%", padding: 14, marginTop: 8, borderRadius: 8 }} /></div>
            </>
          )}

          <div style={{ gridColumn: "span 2", display: "flex", gap: 20, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}><label>Clock In</label><input type="datetime-local" value={clockIn} onChange={e => setClockIn(e.target.value)} style={{ width: "100%", padding: 14, marginTop: 8, borderRadius: 8 }} /></div>
            <button onClick={() => setClockIn(new Date().toISOString().slice(0,16))} style={{ padding: "14px 28px", background: "#4caf50", color: "white", border: "none", borderRadius: 8, height: "52px" }}>Start Job</button>
            <div style={{ flex: 1 }}><label>Clock Out</label><input type="datetime-local" value={clockOut} onChange={e => setClockOut(e.target.value)} style={{ width: "100%", padding: 14, marginTop: 8, borderRadius: 8 }} /></div>
            <button onClick={() => setClockOut(new Date().toISOString().slice(0,16))} style={{ padding: "14px 28px", background: "#f44336", color: "white", border: "none", borderRadius: 8, height: "52px" }}>Finish Job</button>
          </div>

          <div style={{ gridColumn: "span 2" }}><label>Comments</label><input value={comments} onChange={e => setComments(e.target.value)} style={{ width: "100%", padding: 14, marginTop: 8, borderRadius: 8 }} /></div>
          <div style={{ gridColumn: "span 2" }}>
            <label>Materials Used</label>
            <textarea value={materialsUsed} onChange={e => setMaterialsUsed(e.target.value)} placeholder="List materials used here..." style={{ width: "100%", padding: 14, marginTop: 8, minHeight: "90px", borderRadius: 8, resize: "vertical" }} />
          </div>
        </div>

        <div style={{ marginTop: 30, display: "flex", gap: 15, alignItems: "center" }}>
          <button onClick={saveLog} style={{ padding: "16px 40px", background: "#1976d2", color: "white", border: "none", borderRadius: 10, fontSize: "17px", fontWeight: "bold" }}>
            {editingLog ? "Update Log" : "Save Log"}
          </button>
          {saveStatus && <span>{saveStatus}</span>}
        </div>
      </div>

      {/* ADMIN ONLY - Full Saved Logs */}
      {isAdmin && (
        <div style={{ background: "#fff", borderRadius: 16, padding: 30, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2>Saved Logs</h2>
            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: "10px 16px", width: "320px", borderRadius: 8, border: "1px solid #ddd" }} />
          </div>

          <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
            <button onClick={() => window.location.reload()}>Refresh</button>
            <button onClick={exportCSV} style={{ background: "#4caf50", color: "white" }}>Export CSV</button>
            <ClearLogsButton />
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ padding: 12, textAlign: "left" }}>Bus</th>
                <th style={{ padding: 12, textAlign: "left" }}>Part</th>
                <th style={{ padding: 12, textAlign: "left" }}>Modified Total</th>
                <th style={{ padding: 12, textAlign: "left" }}>Direct Cost</th>
                <th style={{ padding: 12, textAlign: "left" }}>Difference</th>
                <th style={{ padding: 12, textAlign: "left" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => {
                const modTotal = Number(log.modified_part_cost || 0) + Number(log.supplies_cost || 0) + 
                  (Number(log.labor_rate || 0) * ((new Date(log.clock_out || 0) - new Date(log.clock_in || 0)) / 3600000));
                const dirTotal = Number(log.direct_fit_part_cost || 0);
                const diff = dirTotal - modTotal;
                return (
                  <tr key={log.id} style={{ borderTop: "1px solid #eee" }}>
                    <td style={{ padding: 12 }}>{log.bus_number}</td>
                    <td style={{ padding: 12 }}>{log.part_name}</td>
                    <td style={{ padding: 12 }}>${modTotal.toFixed(2)}</td>
                    <td style={{ padding: 12 }}>${dirTotal.toFixed(2)}</td>
                    <td style={{ padding: 12, color: diff >= 0 ? "green" : "red", fontWeight: "bold" }}>
                      {diff >= 0 ? "Save $" : "+$"}{Math.abs(diff).toFixed(2)}
                    </td>
                    <td style={{ padding: 12 }}>
                      <button onClick={() => startEdit(log)} style={{ marginRight: 12, color: "#1976d2", fontSize: "18px" }}>✏️</button>
                      <button onClick={() => deleteLog(log.id)} style={{ color: "red", fontSize: "22px" }}>🗑️</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}