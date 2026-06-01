import { useState } from 'react';

export default function ClearLogsButton() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [inputPassword, setInputPassword] = useState("");

  const handleClear = () => {
    if (inputPassword === "123456") {
      if (window.confirm("Are you sure you want to delete ALL logs? This cannot be undone!")) {
        localStorage.removeItem("localPartLogs");
        window.location.reload(); // Refresh to update logs
      }
      setShowPrompt(false);
      setInputPassword("");
    } else {
      alert("Incorrect password");
      setInputPassword("");
    }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <button 
        onClick={() => setShowPrompt(true)}
        style={{ padding: "10px 20px", background: "#d32f2f", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}
      >
        🗑️ Clear All Logs
      </button>

      {showPrompt && (
        <div style={{ marginTop: 15, padding: 15, background: "#fff", border: "1px solid #ddd", borderRadius: 8 }}>
          <p>Enter password to clear all logs:</p>
          <input 
            type="password" 
            value={inputPassword} 
            onChange={(e) => setInputPassword(e.target.value)}
            style={{ padding: 10, width: "200px", marginRight: 10 }}
          />
          <button onClick={handleClear} style={{ padding: "10px 20px", background: "#d32f2f", color: "white", border: "none", borderRadius: 8 }}>
            Confirm Clear
          </button>
          <button onClick={() => { setShowPrompt(false); setInputPassword(""); }} style={{ marginLeft: 10, padding: "10px 20px" }}>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}