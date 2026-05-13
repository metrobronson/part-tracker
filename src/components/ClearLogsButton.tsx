import { useState } from 'react';

export default function ClearLogsButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleClear = () => {
    if (password !== "Luke06106") {
      setStatus("❌ Wrong password");
      return;
    }

    // Clear everything locally
    localStorage.removeItem("localPartLogs");
    setStatus("✅ All logs cleared!");
    
    setTimeout(() => {
      window.location.reload(); // Refresh to show empty table
    }, 800);
  };

  return (
    <>
      <button 
        onClick={() => { setIsOpen(true); setPassword(""); setStatus(""); }}
        style={{ background: "#d32f2f", color: "white", padding: "8px 16px", border: "none", borderRadius: 6 }}
      >
        Clear All Logs
      </button>

      {isOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.7)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 10000
        }}>
          <div style={{ background: "white", padding: 30, borderRadius: 12, width: 420, textAlign: "center" }}>
            <h3>🗑️ Clear ALL Logs</h3>
            <p style={{ color: "#d32f2f", margin: "15px 0" }}>
              This will permanently delete every record.<br />
              This cannot be undone.
            </p>

            <input 
              type="password" 
              placeholder="Enter password" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              style={{ width: "100%", padding: 12, margin: "15px 0", fontSize: "16px" }}
            />

            <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 20 }}>
              <button 
                onClick={() => { setIsOpen(false); setPassword(""); setStatus(""); }}
                style={{ padding: "12px 24px" }}
              >
                Cancel
              </button>
              <button 
                onClick={handleClear}
                style={{ padding: "12px 24px", background: "#d32f2f", color: "white", border: "none", borderRadius: 6 }}
              >
                Yes, Delete All Logs
              </button>
            </div>

            {status && <p style={{ marginTop: 15, fontWeight: "bold" }}>{status}</p>}
          </div>
        </div>
      )}
    </>
  );
}