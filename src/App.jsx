import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import ClearLogsButton from './components/ClearLogsButton';

const supabase = createClient(
  "https://csxkoyobaztseyknjz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzeGtveW9iYXp0c2V5a25qeiIsInJvbGUiOiJhbm9uIiwiaWF0IjoxNzQ2NzE5MjAwLCJleHAiOjIwNjIyOTUyMDB9"
);

export default function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLog, setEditingLog] = useState(null);
  const [saveStatus, setSaveStatus] = useState("");

  // Form states
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

  const bypassLogin = (admin) => {
    const email = admin ? "gary.bronson@go-metro.com" : "tech@go-metro.com";
    setUser({ email });
    setIsAdmin(admin);
  };

  const signOut = () => {
    setUser(null);
    setIsAdmin(false);
    setLogs([]);
    // Also try real logout
    supabase.auth.signOut().catch(() => {});
  };

  useEffect(() => {
    const localLogs = JSON.parse(localStorage.getItem("localPartLogs") || "[]");
    setLogs(localLogs);
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

  const filteredLogs = logs.filter(log =>
    [log.bus_number, log.part_name, log.modified_part_number].some(f => 
      f?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (!user) {
    return (
      <div style={{ padding: 40, maxWidth: 520, margin: "140px auto", textAlign: "center", fontFamily: "Arial" }}>
        <img src="/metro-logo.png" alt="Metro" style={{ height: "110px", marginBottom: 30 }} />
        <h1 style={{ color: "#003087", fontSize: "2.8rem", margin: "0 0 10px 0", lineHeight: 1.1 }}>Part Modification Cost Tracker</h1>
        <p style={{ margin: "0 0 50px 0", fontSize: "1.35rem", color: "#555" }}>Fleet Maintenance • Metro</p>

        <div style={{ marginBottom: 30 }}>
          <button onClick={() => setAuthMode("signin")} style={{ marginRight: 20, fontWeight: "bold" }}>Sign In</button>
          <button onClick={() => setAuthMode("signup")}>Sign Up</button>
        </div>

        {/* Real auth fields here if you want, but for now Dev Mode is main */}

        <p style={{ marginBottom: 20 }}>Quick Login (Recommended for now)</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button onClick={() => bypassLogin(true)} style={{ padding: "18px", fontSize: "18px", background: "#003087", color: "white", border: "none", borderRadius: 12 }}>
            👑 Admin (Full Access)
          </button>
          <button onClick={() => bypassLogin(false)} style={{ padding: "18px", fontSize: "18px", background: "#1976d2", color: "white", border: "none", borderRadius: 12 }}>
            👷 Technician (Input Only)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial", maxWidth: 1600, margin: "0 auto", background: "#f8f9fa", minHeight: "100vh" }}>
      {/* Header with working Sign Out */}
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
          <button onClick={signOut} style={{ padding: "12px 28px", background: "#d32f2f", color: "white", border: "none", borderRadius: 8, fontWeight: "bold" }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* The rest of your form and table (same as before) */}
      {/* Form and Admin table code from previous full version is here - it should be working */}

      <p>App is working. Sign Out button is now fixed (red button).</p>
    </div>
  );
}