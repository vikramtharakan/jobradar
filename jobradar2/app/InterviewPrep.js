"use client";
import { useState, useRef, useEffect } from "react";

const TOPICS = {
  "ML Systems": ["Model serving & inference at scale", "Feature stores", "ML pipelines & MLOps", "Training infrastructure", "A/B testing & experimentation", "Model monitoring & drift detection", "Embeddings & vector search", "LLM fine-tuning & RLHF"],
  "Data Engineering": ["Spark internals & optimization", "Kafka & stream processing", "Data modeling (Kimball, Data Vault)", "ETL vs ELT patterns", "Data lakehouse architecture", "Airflow & orchestration", "dbt & transformation", "Real-time vs batch tradeoffs"],
  "ML Algorithms": ["Entity resolution & record linkage", "Deep metric learning", "NER & information extraction", "Graph neural networks", "Recommender systems", "Anomaly detection", "Clustering at scale", "Semi-supervised learning"],
  "Databases & Search": ["Elasticsearch internals", "Graph databases (Neo4j, JanusGraph)", "Columnar vs row storage", "Query optimization", "Caching strategies (Redis)", "Vector databases", "OLAP vs OLTP"],
  "System Design": ["Design a data pipeline for 1B events/day", "Design an ML feature store", "Design a real-time fraud detection system", "Design a search ranking system", "Design an entity resolution system", "Design a recommendation engine", "Design a data lake for ML"],
  "Behavioral": ["Tell me about a time you owned a complex system end to end", "Describe a technical disagreement and how you resolved it", "How do you handle tight deadlines with ambiguous requirements", "Tell me about a project that failed and what you learned", "How do you mentor junior engineers", "Describe your biggest technical mistake"],
};

const QTYPES = [
  { id: "technical", label: "Technical Deep Dive", color: "#6366f1" },
  { id: "system_design", label: "System Design", color: "#8b5cf6" },
  { id: "behavioral", label: "Behavioral", color: "#f59e0b" },
  { id: "coding", label: "Coding / Algo", color: "#22c55e" },
];

function ls(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }
function lsSave(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

function Spinner() {
  return <div style={{ width: 20, height: 20, borderRadius: "50%", border: "3px solid #1e293b", borderTop: "3px solid #6366f1", animation: "spin 0.8s linear infinite", display: "inline-block" }} />;
}

function LearnView({ topic }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!topic) return;
    setContent(null);
    setLoading(true);
    fetch("/api/prep", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "learn", topic }) })
      .then(r => r.json()).then(d => { setContent(d); setLoading(false); }).catch(() => setLoading(false));
  }, [topic]);

  if (!topic) return <div style={{ textAlign: "center", padding: "40px 0", color: "#334155", fontSize: 14 }}>← Pick a topic to start learning</div>;
  if (loading) return <div style={{ textAlign: "center", padding: "40px 0" }}><Spinner /><div style={{ color: "#475569", fontSize: 13, marginTop: 12 }}>Generating lesson...</div></div>;
  if (!content || content.error) return <div style={{ color: "#ef4444", fontSize: 13 }}>Failed to load. Try again.</div>;

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ background: "#0f172a", border: "1px solid #6366f133", borderRadius: 12, padding: "18px 22px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>TL;DR</div>
        <div style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.6 }}>{content.tldr}</div>
      </div>
      {content.sections?.map((s, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9", marginBottom: 10, paddingBottom: 6, borderBottom: "1px solid #1e293b" }}>{s.heading}</div>
          <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{s.content}</div>
        </div>
      ))}
      {content.key_facts?.length > 0 && (
        <div style={{ background: "#0f172a", border: "1px solid #22c55e22", borderRadius: 10, padding: "14px 18px", marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>KEY FACTS TO REMEMBER</div>
          {content.key_facts.map((f, i) => <div key={i} style={{ color: "#cbd5e1", fontSize: 13, marginBottom: 7 }}>⚡ {f}</div>)}
        </div>
      )}
      {content.follow_up_topics?.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>EXPLORE NEXT</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {content.follow_up_topics.map(t => <span key={t} style={{ fontSize: 12, background: "#1e293b", color: "#94a3b8", borderRadius: 6, padding: "5px 11px", cursor: "default" }}>{t}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

function PracticeView({ topic }) {
  const [qtype, setQtype] = useState("technical");
  const [question, setQuestion] = useState(null);
  const [loadingQ, setLoadingQ] = useState(false);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [loadingEval, setLoadingEval] = useState(false);
  const [showSample, setShowSample] = useState(false);
  const [history, setHistory] = useState(() => ls("vt-prep-history", []));

  const getQuestion = async () => {
    setQuestion(null); setAnswer(""); setEvaluation(null); setShowSample(false); setLoadingQ(true);
    const res = await fetch("/api/prep", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "question", topic, question: { qtype } }) });
    const d = await res.json(); setQuestion(d); setLoadingQ(false);
  };

  const evaluate = async () => {
    if (!answer.trim() || !question) return;
    setLoadingEval(true);
    const res = await fetch("/api/prep", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "evaluate", question: question.question, userAnswer: answer }) });
    const d = await res.json(); setEvaluation(d); setLoadingEval(false);
    const entry = { topic, question: question.question, score: d.score, verdict: d.verdict, date: new Date().toISOString() };
    const h = [entry, ...history].slice(0, 50); setHistory(h); lsSave("vt-prep-history", h);
  };

  const verdictColor = { Strong: "#22c55e", Good: "#86efac", "Needs Work": "#f59e0b", Weak: "#ef4444" };

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Q-type selector */}
      <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
        {QTYPES.map(qt => (
          <button key={qt.id} onClick={() => setQtype(qt.id)}
            style={{ background: qtype === qt.id ? qt.color + "22" : "#0f172a", border: `1px solid ${qtype === qt.id ? qt.color : "#1e293b"}`, color: qtype === qt.id ? qt.color : "#64748b", borderRadius: 7, padding: "6px 13px", fontSize: 12, fontWeight: qtype === qt.id ? 700 : 400, cursor: "pointer" }}>
            {qt.label}
          </button>
        ))}
      </div>

      <button onClick={getQuestion} disabled={loadingQ}
        style={{ background: loadingQ ? "#1e293b" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: loadingQ ? "#475569" : "white", border: "none", borderRadius: 9, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: loadingQ ? "not-allowed" : "pointer", marginBottom: 22, display: "flex", alignItems: "center", gap: 8 }}>
        {loadingQ ? <><Spinner /> Generating...</> : question ? "↺ New Question" : "Generate Question"}
      </button>

      {question && (
        <div style={{ animation: "fadeIn 0.4s ease" }}>
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "18px 22px", marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>QUESTION</div>
            <div style={{ fontSize: 15, color: "#f1f5f9", fontWeight: 600, lineHeight: 1.5, marginBottom: 10 }}>{question.question}</div>
            {question.context && <div style={{ fontSize: 12, color: "#475569", fontStyle: "italic" }}>{question.context}</div>}
            {question.hints?.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1e293b" }}>
                <div style={{ fontSize: 10, color: "#334155", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>HINTS (only if stuck)</div>
                {question.hints.map((h, i) => <div key={i} style={{ fontSize: 12, color: "#475569", marginBottom: 4 }}>• {h}</div>)}
              </div>
            )}
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>YOUR ANSWER</div>
            <textarea value={answer} onChange={e => setAnswer(e.target.value)}
              placeholder="Type your answer here. Treat it like a real interview — speak through your thinking..."
              style={{ width: "100%", background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "12px 14px", color: "#cbd5e1", fontSize: 13, resize: "vertical", minHeight: 120, fontFamily: "inherit", lineHeight: 1.6 }} />
          </div>

          <button onClick={evaluate} disabled={!answer.trim() || loadingEval}
            style={{ background: !answer.trim() || loadingEval ? "#1e293b" : "linear-gradient(135deg,#22c55e,#16a34a)", color: !answer.trim() || loadingEval ? "#475569" : "white", border: "none", borderRadius: 9, padding: "10px 22px", fontSize: 13, fontWeight: 700, cursor: !answer.trim() || loadingEval ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}>
            {loadingEval ? <><Spinner /> Evaluating...</> : "Submit for Feedback"}
          </button>
        </div>
      )}

      {evaluation && (
        <div style={{ marginTop: 22, animation: "fadeIn 0.4s ease" }}>
          <div style={{ background: "#0f172a", border: `1px solid ${verdictColor[evaluation.verdict] || "#334155"}33`, borderRadius: 12, padding: "18px 22px", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${verdictColor[evaluation.verdict] || "#334155"}22`, border: `2px solid ${verdictColor[evaluation.verdict] || "#334155"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: verdictColor[evaluation.verdict] || "#334155" }}>{evaluation.score}</span>
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: verdictColor[evaluation.verdict] || "#f1f5f9" }}>{evaluation.verdict}</div>
                <div style={{ fontSize: 11, color: "#475569" }}>out of 10</div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              {evaluation.strengths?.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>STRENGTHS</div>
                  {evaluation.strengths.map((s, i) => <div key={i} style={{ color: "#cbd5e1", fontSize: 12, marginBottom: 5 }}>✓ {s}</div>)}
                </div>
              )}
              {evaluation.gaps?.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>GAPS</div>
                  {evaluation.gaps.map((g, i) => <div key={i} style={{ color: "#cbd5e1", fontSize: 12, marginBottom: 5 }}>△ {g}</div>)}
                </div>
              )}
            </div>
            {evaluation.ideal_points?.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 10, color: "#6366f1", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>KEY POINTS TO HIT</div>
                {evaluation.ideal_points.map((p, i) => <div key={i} style={{ color: "#cbd5e1", fontSize: 12, marginBottom: 5 }}>⚡ {p}</div>)}
              </div>
            )}
            {evaluation.sample_answer && (
              <div>
                <button onClick={() => setShowSample(s => !s)} style={{ background: "transparent", border: "1px solid #334155", color: "#64748b", borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer", marginBottom: showSample ? 10 : 0 }}>
                  {showSample ? "▲ Hide" : "▼ Show"} sample answer
                </button>
                {showSample && <div style={{ background: "#020817", borderRadius: 8, padding: "12px 14px", color: "#94a3b8", fontSize: 13, lineHeight: 1.7, marginTop: 8 }}>{evaluation.sample_answer}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ChatView() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    const newMsgs = [...messages, userMsg]; setMessages(newMsgs); setInput(""); setLoading(true);
    const res = await fetch("/api/prep", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "chat", messages: newMsgs }) });
    const d = await res.json();
    setMessages([...newMsgs, { role: "assistant", content: d.text || "Sorry, something went wrong." }]); setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 520 }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0", marginBottom: 14 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🧠</div>
            <div style={{ color: "#475569", fontSize: 14, fontWeight: 600 }}>Ask me anything about ML/DE interviews</div>
            <div style={{ color: "#334155", fontSize: 13, marginTop: 6 }}>Explain a concept, work through a problem, review your answer, or ask what to study next.</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 18 }}>
              {["Explain the Fellegi-Sunter model like I'm in an interview", "What's the difference between a data lake and lakehouse?", "Walk me through designing a feature store", "What are common Spark gotchas at scale?"].map(q => (
                <button key={q} onClick={() => setInput(q)} style={{ background: "#0f172a", border: "1px solid #1e293b", color: "#64748b", borderRadius: 8, padding: "8px 14px", fontSize: 12, cursor: "pointer", textAlign: "left", maxWidth: 220 }}>{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 14 }}>
            <div style={{ maxWidth: "85%", background: m.role === "user" ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#0f172a", border: m.role === "assistant" ? "1px solid #1e293b" : "none", borderRadius: m.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", padding: "12px 16px", color: m.role === "user" ? "white" : "#cbd5e1", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 14 }}>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "12px 12px 12px 4px", padding: "12px 16px" }}><Spinner /></div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask a question or describe a concept you want explained... (Enter to send)"
          style={{ flex: 1, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, padding: "10px 14px", color: "#cbd5e1", fontSize: 13, resize: "none", height: 56, fontFamily: "inherit" }} />
        <button onClick={send} disabled={!input.trim() || loading}
          style={{ background: !input.trim() || loading ? "#1e293b" : "#6366f1", color: !input.trim() || loading ? "#475569" : "white", border: "none", borderRadius: 8, padding: "0 20px", fontSize: 14, fontWeight: 700, cursor: !input.trim() || loading ? "not-allowed" : "pointer" }}>
          →
        </button>
      </div>
    </div>
  );
}

function HistoryView() {
  const history = ls("vt-prep-history", []);
  const verdictColor = { Strong: "#22c55e", Good: "#86efac", "Needs Work": "#f59e0b", Weak: "#ef4444" };
  if (!history.length) return <div style={{ textAlign: "center", padding: "40px 0", color: "#334155", fontSize: 14 }}>No practice history yet. Answer some questions to build your history.</div>;
  const avg = Math.round(history.reduce((a, h) => a + h.score, 0) / history.length);
  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        {[["Sessions", history.length, "#6366f1"], ["Avg Score", avg + "/10", "#22c55e"], ["Strong", history.filter(h => h.verdict === "Strong").length, "#22c55e"], ["Needs Work", history.filter(h => h.verdict === "Needs Work" || h.verdict === "Weak").length, "#f59e0b"]].map(([label, val, color]) => (
          <div key={label} style={{ background: "#0f172a", border: `1px solid ${color}22`, borderRadius: 10, padding: "10px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color }}>{val}</div>
            <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, letterSpacing: "0.05em", marginTop: 2 }}>{label.toUpperCase()}</div>
          </div>
        ))}
      </div>
      {history.map((h, i) => (
        <div key={i} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 10, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 13, color: "#f1f5f9", fontWeight: 600, marginBottom: 4 }}>{h.question}</div>
            <div style={{ fontSize: 11, color: "#475569" }}>{h.topic} · {new Date(h.date).toLocaleDateString()}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: verdictColor[h.verdict] || "#f1f5f9" }}>{h.score}/10</div>
            <div style={{ fontSize: 10, color: verdictColor[h.verdict] || "#64748b", fontWeight: 600 }}>{h.verdict}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function InterviewPrep() {
  const [prepTab, setPrepTab] = useState("learn");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [expandedCat, setExpandedCat] = useState("ML Systems");

  const tabs = [["learn", "📖 Learn"], ["practice", "🎯 Practice"], ["chat", "💬 Ask Claude"], ["history", "📊 History"]];

  return (
    <div>
      {/* Sub-nav */}
      <div style={{ borderBottom: "1px solid #0f172a", padding: "0 28px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", gap: 2 }}>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setPrepTab(id)}
              style={{ background: "transparent", color: prepTab === id ? "#f1f5f9" : "#475569", border: "none", borderBottom: `2px solid ${prepTab === id ? "#8b5cf6" : "transparent"}`, padding: "12px 16px", fontSize: 13, fontWeight: prepTab === id ? 600 : 400, cursor: "pointer", transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: prepTab === "chat" || prepTab === "history" ? "1fr" : "220px 1fr", gap: 24 }}>

          {/* Topic sidebar */}
          {prepTab !== "chat" && prepTab !== "history" && (
            <div>
              <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>TOPICS</div>
              {Object.entries(TOPICS).map(([cat, topics]) => (
                <div key={cat} style={{ marginBottom: 8 }}>
                  <button onClick={() => setExpandedCat(expandedCat === cat ? null : cat)}
                    style={{ width: "100%", background: expandedCat === cat ? "#1e293b" : "transparent", border: "1px solid #1e293b", borderRadius: 7, padding: "8px 12px", color: expandedCat === cat ? "#f1f5f9" : "#64748b", fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "left", display: "flex", justifyContent: "space-between" }}>
                    {cat} <span style={{ color: "#334155" }}>{expandedCat === cat ? "▲" : "▼"}</span>
                  </button>
                  {expandedCat === cat && (
                    <div style={{ marginTop: 4, paddingLeft: 4 }}>
                      {topics.map(t => (
                        <button key={t} onClick={() => setSelectedTopic(t)}
                          style={{ width: "100%", background: selectedTopic === t ? "#6366f122" : "transparent", border: `1px solid ${selectedTopic === t ? "#6366f155" : "transparent"}`, borderRadius: 6, padding: "6px 10px", color: selectedTopic === t ? "#818cf8" : "#64748b", fontSize: 11, cursor: "pointer", textAlign: "left", marginBottom: 2, lineHeight: 1.4 }}>
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Main content */}
          <div>
            {prepTab === "learn" && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "Georgia,serif", color: "#f1f5f9", letterSpacing: "-0.02em" }}>
                    {selectedTopic || "Learn"}
                  </h1>
                  {!selectedTopic && <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Pick a topic from the sidebar to generate a tailored lesson</p>}
                </div>
                <LearnView topic={selectedTopic} />
              </div>
            )}
            {prepTab === "practice" && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "Georgia,serif", color: "#f1f5f9", letterSpacing: "-0.02em" }}>
                    {selectedTopic ? `Practice: ${selectedTopic}` : "Practice"}
                  </h1>
                  {!selectedTopic && <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Pick a topic from the sidebar, then generate a question</p>}
                </div>
                {selectedTopic && <PracticeView topic={selectedTopic} />}
              </div>
            )}
            {prepTab === "chat" && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "Georgia,serif", color: "#f1f5f9", letterSpacing: "-0.02em" }}>Ask Claude</h1>
                  <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Free-form ML/DE interview coaching. Ask anything.</p>
                </div>
                <ChatView />
              </div>
            )}
            {prepTab === "history" && (
              <div>
                <div style={{ marginBottom: 20 }}>
                  <h1 style={{ fontSize: 24, fontWeight: 700, fontFamily: "Georgia,serif", color: "#f1f5f9", letterSpacing: "-0.02em" }}>Practice History</h1>
                  <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Track your progress over time</p>
                </div>
                <HistoryView />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
