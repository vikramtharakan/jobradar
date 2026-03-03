"use client";
import { useState } from "react";
import JobSearch from "./JobSearch";
import InterviewPrep from "./InterviewPrep";

export default function App() {
  const [mode, setMode] = useState("jobs");
  return (
    <div style={{ minHeight: "100vh", background: "#020817" }}>
      <div style={{ background: "#020817", borderBottom: "1px solid #0f172a", padding: "0 28px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "Georgia,serif", color: "#f1f5f9", letterSpacing: "-0.02em" }}>JobRadar ⚡</span>
            <span style={{ fontSize: 10, color: "#475569", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 4, padding: "2px 8px", fontWeight: 600 }}>Vikram · ML/DE · $200K+</span>
          </div>
          <div style={{ display: "flex", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: 3, gap: 2 }}>
            {[["jobs", "🔍 Job Search"], ["prep", "🧠 Interview Prep"]].map(([id, label]) => (
              <button key={id} onClick={() => setMode(id)}
                style={{ background: mode === id ? "#1e293b" : "transparent", color: mode === id ? "#f1f5f9" : "#475569", border: "none", borderRadius: 6, padding: "5px 16px", fontSize: 13, fontWeight: mode === id ? 600 : 400, cursor: "pointer", transition: "all 0.2s" }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      {mode === "jobs" ? <JobSearch /> : <InterviewPrep />}
    </div>
  );
}
