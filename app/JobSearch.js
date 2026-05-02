"use client";
import { useState, useEffect } from "react";

// ── constants ──────────────────────────────────────────────────────────────────

const JOB_BOARDS = [
  { name: "LinkedIn", url: "https://www.linkedin.com/jobs/search/?keywords=senior%20data%20engineer%20OR%20senior%20ML%20engineer&f_WT=2&f_E=4%2C5&sortBy=DD", label: "Biggest volume — big tech, finance, mid-stage startups", hot: true },
  { name: "Wellfound", url: "https://wellfound.com/jobs?role=machine-learning-engineer&remote=true", label: "Best for startups — direct founder access", hot: true },
  { name: "YC Jobs", url: "https://www.workatastartup.com/jobs?role=ml&remote=true", label: "YC-backed startups, highest signal-to-noise", hot: true },
  { name: "ai-jobs.net", url: "https://ai-jobs.net/", label: "Curated AI/ML roles, no fluff", hot: false },
  { name: "Levels.fyi Jobs", url: "https://www.levels.fyi/jobs?jobFamily=Software+Engineer&country=254", label: "Salary-transparent with comp data", hot: false },
  { name: "Greenhouse Job Board", url: "https://boards.greenhouse.io/", label: "Direct company boards, less noise", hot: false },
  { name: "Built In Remote", url: "https://builtin.com/jobs/remote/data-analytics-engineering", label: "Tech companies with remote DE/ML roles", hot: false },
  { name: "Remotive", url: "https://remotive.com/remote-jobs/software-dev", label: "Every post vetted, remote-only", hot: false },
];

const DEFAULT_JOBS = [
  {
    id: "1", title: "Machine Learning Engineer – NLP", company: "Quora", board: "Wellfound",
    url: "https://wellfound.com/role/r/machine-learning-engineer",
    salary: "$120K–$275K", remote: true,
    tags: ["NLP", "Python", "ML Systems", "Data Pipelines", "Feature Engineering"],
    description: "Take end-to-end ownership of ML systems — data pipelines, feature engineering, candidate extraction, model training, and production integration. Work on NLP and language modeling across Quora and Poe platforms. Remote-first company, coordination hours Mon-Fri 9am-3pm PT.",
    industry: "Consumer / Knowledge", stage: "Late Stage Private"
  },
  {
    id: "2", title: "Senior ML Engineer – NLP & Search", company: "Chartbeat / Metadata Team", board: "Greenhouse",
    url: "https://job-boards.greenhouse.io/chartbeatinc/jobs/5031517007",
    salary: "Not listed", remote: true,
    tags: ["Spark", "Elasticsearch", "Kafka", "Python", "NLP", "GraphQL"],
    description: "Work on video metadata, API infrastructure, and MCP (Model Context Protocol). Core stack: Python, Spark, Elasticsearch, Kafka for big data processing. End-to-end feature implementation, big-data infrastructure, and API systems. Cross-functional team with engineers, designers, and data scientists.",
    industry: "Media Analytics / SaaS", stage: "Growth"
  },
  {
    id: "3", title: "Senior Data Engineer – Kafka Streaming & Spark", company: "Massive Rocket", board: "Himalayas",
    url: "https://himalayas.app/companies/massive-rocket/jobs/senior-data-engineer-kafka",
    salary: "Not listed", remote: true,
    tags: ["Kafka", "Spark", "Flink", "Kubernetes", "Terraform", "Streaming"],
    description: "Architect Kafka topics, partitions, and compaction. Build ingestion with Kafka Connect/Debezium. Implement stream processing (Kafka Streams/ksqlDB/Flink/Spark). Enforce schemas via Schema Registry (Avro/Protobuf). Manage CI/CD, IaC (Terraform/Helm). 6+ years DE experience, 3+ years Kafka in production required.",
    industry: "Data / Consulting", stage: "Growth"
  },
  {
    id: "4", title: "Sr. Machine Learning Engineer (LLM)", company: "Collinear AI", board: "Wellfound",
    url: "https://wellfound.com/role/r/machine-learning-engineer",
    salary: "Competitive + equity", remote: true,
    tags: ["LLMs", "RLHF", "NLP", "Python", "PyTorch", "Transformers"],
    description: "Well-funded stealth AI startup (team from Stanford, Hugging Face, Salesforce) focused on AI Alignment and customization. Fine-tune open-source LLMs for enterprise use cases. Work on SFT and RLHF pipelines. Primarily in-person in Mountain View with remote flexibility — verify remote policy before applying.",
    industry: "AI Alignment / LLMs", stage: "Early Stage"
  },
  {
    id: "5", title: "Senior ML Engineer – Search & Relevance", company: "Zeals", board: "Greenhouse",
    url: "https://job-boards.greenhouse.io/zeals/jobs/5337392004",
    salary: "Not listed", remote: true,
    tags: ["Elasticsearch", "NLP", "Python", "ML", "GCP", "Kubernetes", "Qdrant"],
    description: "Design and optimize search algorithms using Elasticsearch/Solr/Lucene. Integrate AI/ML models for semantic search and NLP-based relevance improvements. Build high-performance indexing and query processing systems. Stack: GCP, Kubernetes, MongoDB, Elasticsearch, Qdrant. 5+ years search engineering required. Note: Japanese proficiency a plus but not required.",
    industry: "Conversational AI / SaaS", stage: "Growth"
  },
  {
    id: "6", title: "Senior Software Engineer – Data (Elasticsearch + Spark)", company: "Vannevar Labs", board: "Greenhouse",
    url: "https://job-boards.greenhouse.io/vannevarlabs/jobs/4890769007",
    salary: "$160K–$210K + equity", remote: true,
    tags: ["Elasticsearch", "Python", "AWS", "Postgres", "Data Engineering"],
    description: "Work on search infrastructure and data engineering at a well-funded defense-adjacent tech company. Stack: Elasticsearch/OpenSearch, Postgres, AWS, Python. Note: requires active security clearance or ability to obtain one — flagged as gov-adjacent, score adjusted accordingly.",
    industry: "Defense Tech", stage: "Series C"
  },
];

const STATUSES = [
  "Saved", "Applied", "Phone Screen", "Interview", "Coding Interview", "Final Round",
  "Offer", "Offer Declined",
  "Rejected - No Response", "Rejected - Pre-Interview", "Rejected - After Phone Screen",
  "Rejected - After Coding", "Rejected - After Final Round",
  "Pass"
];
const STATUS_COLORS = {
  "Saved": "#6366f1",
  "Applied": "#3b82f6",
  "Phone Screen": "#f59e0b",
  "Interview": "#8b5cf6",
  "Coding Interview": "#a855f7",
  "Final Round": "#ec4899",
  "Offer": "#22c55e",
  "Offer Declined": "#84cc16",
  "Rejected - No Response": "#ef4444",
  "Rejected - Pre-Interview": "#ef4444",
  "Rejected - After Phone Screen": "#ef4444",
  "Rejected - After Coding": "#ef4444",
  "Rejected - After Final Round": "#ef4444",
  "Pass": "#64748b",
};

const PASS_REASONS = [
  "Salary too low", "Not remote enough", "Gov/defense adjacent",
  "Too much travel", "Wrong tech stack", "Company too small",
  "Company too large", "Wrong industry", "Role too junior", "Role too senior", "Other",
];

// ── storage ────────────────────────────────────────────────────────────────────

function ls(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } }
function lsSave(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

// ── sub-components ─────────────────────────────────────────────────────────────

function ScoreRing({ score }) {
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#f59e0b" : "#ef4444";
  const r = 22, circ = 2 * Math.PI * r, dash = (score / 100) * circ;
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: 60, height: 60, flexShrink: 0 }}>
      <svg width="60" height="60" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="30" cy="30" r={r} fill="none" stroke="#1e293b" strokeWidth="5" />
        <circle cx="30" cy="30" r={r} fill="none" stroke={color} strokeWidth="5" strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <span style={{ position: "absolute", fontSize: 13, fontWeight: 700, color, fontFamily: "monospace" }}>{score}</span>
    </div>
  );
}

const STATUS_GROUPS = [
  { label: "IN PROGRESS", statuses: ["Saved", "Applied", "Phone Screen", "Interview", "Coding Interview", "Final Round"] },
  { label: "OUTCOME", statuses: ["Offer", "Offer Declined", "Pass"] },
  { label: "REJECTED", statuses: ["Rejected - No Response", "Rejected - Pre-Interview", "Rejected - After Phone Screen", "Rejected - After Coding", "Rejected - After Final Round"] },
];

function StatusBadge({ status, onChange }) {
  const [open, setOpen] = useState(false);
  const isRejected = (status || "").startsWith("Rejected");
  const color = STATUS_COLORS[status] || "#64748b";
  const displayLabel = isRejected ? "✕ " + status.replace("Rejected - ", "") : status;
  return (
    <div style={{ position: "relative" }}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        style={{ background: color + "22", color, border: `1px solid ${color}55`, borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
        {displayLabel} ▾
      </button>
      {open && (
        <div style={{ position: "absolute", top: "110%", right: 0, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, zIndex: 200, minWidth: 220, overflow: "hidden", boxShadow: "0 8px 24px #00000099" }}>
          {STATUS_GROUPS.map(group => (
            <div key={group.label}>
              <div style={{ padding: "6px 14px 3px", fontSize: 9, color: "#475569", letterSpacing: "0.12em", fontWeight: 700, background: "#060d18", borderTop: "1px solid #1e293b" }}>
                {group.label}
              </div>
              {group.statuses.map(s => {
                const c = STATUS_COLORS[s] || "#64748b";
                const label = s.startsWith("Rejected") ? "✕ " + s.replace("Rejected - ", "") : s;
                return (
                  <div key={s} onClick={e => { e.stopPropagation(); onChange(s); setOpen(false); }}
                    style={{ padding: "7px 16px", fontSize: 12, color: c, cursor: "pointer", fontWeight: 600, background: s === status ? "#1e293b" : "transparent" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
                    onMouseLeave={e => e.currentTarget.style.background = s === status ? "#1e293b" : "transparent"}>
                    {label}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PassModal({ job, onConfirm, onClose }) {
  const [selected, setSelected] = useState([]);
  const [note, setNote] = useState("");
  const toggle = r => setSelected(s => s.includes(r) ? s.filter(x => x !== r) : [...s, r]);
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: "100%", maxWidth: 460 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", marginBottom: 6 }}>Why passing on {job.title}?</div>
        <div style={{ fontSize: 12, color: "#475569", marginBottom: 18 }}>This helps tune future recommendations. Select all that apply.</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
          {PASS_REASONS.map(r => (
            <button key={r} onClick={() => toggle(r)}
              style={{ background: selected.includes(r) ? "#6366f122" : "#0f172a", border: `1px solid ${selected.includes(r) ? "#6366f1" : "#334155"}`, color: selected.includes(r) ? "#818cf8" : "#64748b", borderRadius: 6, padding: "5px 11px", fontSize: 12, cursor: "pointer", fontWeight: selected.includes(r) ? 600 : 400 }}>
              {selected.includes(r) ? "✓ " : ""}{r}
            </button>
          ))}
        </div>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Any other thoughts? (optional)"
          style={{ width: "100%", background: "#020817", border: "1px solid #1e293b", borderRadius: 6, padding: "8px 12px", color: "#cbd5e1", fontSize: 12, resize: "none", height: 60, fontFamily: "inherit", marginBottom: 16 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => onConfirm(selected, note)}
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", borderRadius: 8, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", flex: 1 }}>
            Confirm Pass
          </button>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid #334155", color: "#64748b", borderRadius: 8, padding: "9px 16px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function AddJobModal({ onSave, onClose }) {
  const [form, setForm] = useState({ title: "", company: "", board: "", url: "", salary: "", remote: true, tags: "", description: "", industry: "", stage: "" });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const inp = (extra = {}) => ({ style: { width: "100%", background: "#020817", border: "1px solid #1e293b", borderRadius: 6, padding: "7px 11px", color: "#cbd5e1", fontSize: 13, fontFamily: "inherit" }, ...extra });
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000099", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, padding: 28, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 16, fontWeight: 700, fontFamily: "Georgia,serif", color: "#f1f5f9" }}>Add a Job</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748b", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["title","Job Title","Senior ML Engineer","1 / -1"],["company","Company","Cohere","auto"],["salary","Salary","$200K–$230K","auto"],["board","Job Board","Wellfound","auto"],["industry","Industry","AI / Dev Tools","auto"],["stage","Stage","Series C","auto"],["url","Job URL","https://...","1 / -1"]].map(([key, label, ph, col]) => (
            <div key={key} style={{ gridColumn: col }}>
              <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 5 }}>{label.toUpperCase()}</div>
              <input value={form[key]} onChange={e => set(key, e.target.value)} placeholder={ph} {...inp()} />
            </div>
          ))}
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 5 }}>TAGS (comma-separated)</div>
            <input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="Python, Spark, LLMs" {...inp()} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 5 }}>JOB DESCRIPTION <span style={{ color: "#334155", fontWeight: 400 }}>(paste full description for best scoring)</span></div>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Paste the full job description here..."
              style={{ ...inp().style, resize: "vertical", minHeight: 90 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={form.remote} onChange={e => set("remote", e.target.checked)} id="rem" />
            <label htmlFor="rem" style={{ color: "#94a3b8", fontSize: 13, cursor: "pointer" }}>Remote role</label>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={() => { onSave({ ...form, id: Date.now().toString(), tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) }); onClose(); }}
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer", flex: 1 }}>
            Add & Queue for Scoring
          </button>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid #334155", color: "#64748b", borderRadius: 8, padding: "10px 16px", fontSize: 14, cursor: "pointer" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function JobCard({ job, analysis, isLoading, tracked, likes, passes, onTrack, onStatusChange, onNoteChange, onLike, onPass, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [note, setNote] = useState(tracked?.note || "");
  const verdictColor = { "Strong Match": "#22c55e", "Good Match": "#86efac", "Partial Match": "#f59e0b", "Weak Match": "#ef4444" }[analysis?.verdict] || "#94a3b8";
  const isLiked = likes?.includes(job.id);
  const isPassed = passes?.find(p => p.id === job.id);
  const border = isPassed ? "#64748b33" : analysis?.gov_flag ? "#ef444433" : analysis ? verdictColor + "44" : "#1e293b";
  const tags = Array.isArray(job.tags) ? job.tags : (job.tags || "").split(",").map(t => t.trim()).filter(Boolean);

  return (
    <div style={{ background: isPassed ? "#0a0f1a" : "linear-gradient(135deg,#0f172a,#1e293b)", border: `1px solid ${border}`, borderRadius: 12, padding: "18px 22px", marginBottom: 12, transition: "all 0.4s", opacity: isPassed ? 0.5 : 1, animation: "fadeIn 0.4s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }} onClick={() => setExpanded(e => !e)}>
        {isLoading
          ? <div style={{ width: 60, height: 60, borderRadius: "50%", border: "5px solid #1e293b", borderTop: "5px solid #6366f1", animation: "spin 1s linear infinite", flexShrink: 0 }} />
          : analysis ? <ScoreRing score={analysis.score} />
          : <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#1e293b", flexShrink: 0 }} />}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", fontFamily: "Georgia,serif" }}>{job.title}</span>
            {analysis?.gov_flag && <span style={{ fontSize: 10, background: "#ef444422", color: "#ef4444", border: "1px solid #ef444455", borderRadius: 4, padding: "2px 7px", fontWeight: 700 }}>⚠ GOV</span>}
            {isLiked && <span style={{ fontSize: 10, background: "#22c55e22", color: "#22c55e", border: "1px solid #22c55e55", borderRadius: 4, padding: "2px 7px", fontWeight: 700 }}>👍 Liked</span>}
            {isPassed && <span style={{ fontSize: 10, background: "#64748b22", color: "#64748b", border: "1px solid #64748b55", borderRadius: 4, padding: "2px 7px", fontWeight: 700 }}>Passed</span>}
            {analysis && !analysis.gov_flag && !isPassed && <span style={{ fontSize: 11, fontWeight: 600, color: verdictColor, background: verdictColor + "18", borderRadius: 4, padding: "2px 8px" }}>{analysis.verdict}</span>}
            {tracked && <span style={{ fontSize: 10, background: STATUS_COLORS[tracked.status] + "22", color: STATUS_COLORS[tracked.status], border: `1px solid ${STATUS_COLORS[tracked.status]}44`, borderRadius: 4, padding: "2px 7px", fontWeight: 700 }}>● {tracked.status}</span>}
          </div>
          <div style={{ color: "#64748b", fontSize: 12, marginTop: 3 }}>
            {job.company}
            {job.industry && <><span style={{ color: "#334155", margin: "0 5px" }}>·</span>{job.industry}</>}
            {job.stage && <><span style={{ color: "#334155", margin: "0 5px" }}>·</span>{job.stage}</>}
            {job.salary && <span style={{ color: "#22c55e", marginLeft: 10, fontWeight: 600 }}>{job.salary}</span>}
            {job.remote && <span style={{ color: "#6366f1", marginLeft: 8, fontSize: 11 }}>● Remote</span>}
          </div>
          {analysis && !expanded && <div style={{ color: "#475569", fontSize: 12, marginTop: 4, fontStyle: "italic" }}>{analysis.one_liner}</div>}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end", maxWidth: 180 }}>
            {tags.slice(0, 3).map(t => <span key={t} style={{ fontSize: 10, background: "#1e3a5f", color: "#93c5fd", borderRadius: 4, padding: "2px 6px" }}>{t}</span>)}
          </div>
          {/* Quick like/pass buttons */}
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={e => { e.stopPropagation(); onLike(job.id); }}
              style={{ background: isLiked ? "#22c55e22" : "transparent", border: `1px solid ${isLiked ? "#22c55e" : "#334155"}`, color: isLiked ? "#22c55e" : "#64748b", borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>
              👍
            </button>
            <button onClick={e => { e.stopPropagation(); onPass(job); }}
              style={{ background: isPassed ? "#64748b22" : "transparent", border: `1px solid ${isPassed ? "#64748b" : "#334155"}`, color: isPassed ? "#64748b" : "#64748b", borderRadius: 5, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>
              👎
            </button>
          </div>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1e293b" }}>
          {job.description && <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>{job.description}</p>}
          {analysis && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ color: "#22c55e", fontSize: 10, fontWeight: 700, marginBottom: 8, letterSpacing: "0.1em" }}>WHY IT FITS</div>
                {analysis.reasons?.map((r, i) => <div key={i} style={{ color: "#cbd5e1", fontSize: 12, marginBottom: 5 }}>✓ {r}</div>)}
              </div>
              {analysis.gaps?.filter(Boolean).length > 0 && (
                <div>
                  <div style={{ color: "#f59e0b", fontSize: 10, fontWeight: 700, marginBottom: 8, letterSpacing: "0.1em" }}>GAPS TO NOTE</div>
                  {analysis.gaps.filter(Boolean).map((g, i) => <div key={i} style={{ color: "#cbd5e1", fontSize: 12, marginBottom: 5 }}>△ {g}</div>)}
                </div>
              )}
            </div>
          )}
          <div style={{ marginBottom: 14 }}>
            <div style={{ color: "#334155", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>NOTES</div>
            <textarea value={note} onChange={e => setNote(e.target.value)} onBlur={() => onNoteChange(job.id, note)} onClick={e => e.stopPropagation()}
              placeholder="Notes, contacts, follow-up dates..."
              style={{ width: "100%", background: "#020817", border: "1px solid #1e293b", borderRadius: 6, padding: "8px 12px", color: "#cbd5e1", fontSize: 12, resize: "vertical", minHeight: 52, fontFamily: "inherit" }} />
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {job.url && <a href={job.url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
              style={{ background: "#6366f1", color: "white", borderRadius: 6, padding: "8px 18px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              View on {job.board || "board"}{job.posted ? ` · ${job.posted}` : ""} →
            </a>}
            {!tracked
              ? <button onClick={e => { e.stopPropagation(); onTrack(job.id); }} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 6, padding: "8px 16px", fontSize: 12, cursor: "pointer" }}>+ Track this job</button>
              : <StatusBadge status={tracked.status} onChange={s => onStatusChange(job.id, s)} />}
            {onDelete && <button onClick={e => { e.stopPropagation(); onDelete(job.id); }} style={{ background: "transparent", border: "1px solid #1e293b", color: "#475569", borderRadius: 6, padding: "8px 14px", fontSize: 12, cursor: "pointer", marginLeft: "auto" }}>Remove</button>}
          </div>
        </div>
      )}
    </div>
  );
}

function SmartPicks({ jobs, analyses, likes, passes, tracked, onTrack, onStatusChange, onNoteChange, onLike, onPass }) {
  // Build signal-based recommendations
  const likedJobs = jobs.filter(j => likes.includes(j.id));
  const passedJobs = passes.map(p => jobs.find(j => j.id === p.id)).filter(Boolean);

  // Extract patterns from likes
  const likedTags = likedJobs.flatMap(j => Array.isArray(j.tags) ? j.tags : []);
  const likedIndustries = likedJobs.map(j => j.industry).filter(Boolean);
  const tagFreq = likedTags.reduce((a, t) => { a[t] = (a[t] || 0) + 1; return a; }, {});
  const topTags = Object.entries(tagFreq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);

  // Score jobs by similarity to liked ones
  const scored = jobs
    .filter(j => !passes.find(p => p.id === j.id))
    .map(j => {
      const jTags = Array.isArray(j.tags) ? j.tags : [];
      const tagOverlap = jTags.filter(t => topTags.includes(t)).length;
      const industryMatch = likedIndustries.includes(j.industry) ? 2 : 0;
      const baseScore = analyses[j.id]?.score || 0;
      const smartScore = Math.min(100, baseScore * 0.6 + tagOverlap * 8 + industryMatch * 5);
      return { ...j, smartScore: Math.round(smartScore) };
    })
    .sort((a, b) => b.smartScore - a.smartScore);

  if (!likedJobs.length && !passedJobs.length) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>👍</div>
        <div style={{ color: "#475569", fontSize: 15, fontWeight: 600 }}>No signals yet</div>
        <div style={{ color: "#334155", fontSize: 13, marginTop: 6 }}>Go to the Scanner and hit 👍 or 👎 on a few jobs. Smart Picks learns from your choices.</div>
      </div>
    );
  }

  return (
    <div>
      {/* What we learned */}
      {likedJobs.length > 0 && (
        <div style={{ background: "#0f172a", border: "1px solid #22c55e22", borderRadius: 12, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>WHAT I LEARNED FROM YOUR PICKS</div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 8 }}>
            Based on {likedJobs.length} liked job{likedJobs.length > 1 ? "s" : ""} and {passedJobs.length} passed, you seem to prefer:
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {topTags.map(t => <span key={t} style={{ fontSize: 11, background: "#1e3a5f", color: "#93c5fd", borderRadius: 4, padding: "3px 8px" }}>{t}</span>)}
            {[...new Set(likedIndustries)].map(i => <span key={i} style={{ fontSize: 11, background: "#22c55e11", color: "#22c55e", borderRadius: 4, padding: "3px 8px" }}>{i}</span>)}
          </div>
          {passedJobs.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#475569" }}>
              Filtering out patterns from passes: {[...new Set(passes.flatMap(p => p.reasons))].join(", ") || "noted"}
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>TOP PICKS FOR YOU ({scored.length})</div>
      {scored.map(job => (
        <div key={job.id} style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: 16, right: 22, zIndex: 10, fontSize: 11, color: "#8b5cf6", fontWeight: 700 }}>
            ★ Smart: {job.smartScore}
          </div>
          <JobCard job={job} analysis={analyses[job.id]} tracked={tracked[job.id]}
            likes={likes} passes={passes} onTrack={onTrack} onStatusChange={onStatusChange}
            onNoteChange={onNoteChange} onLike={onLike} onPass={onPass} />
        </div>
      ))}
    </div>
  );
}

function TrackerView({ jobs, tracked, onStatusChange, onNoteChange }) {
  const trackedJobs = jobs.filter(j => tracked[j.id]);
  const byStatus = STATUSES.reduce((acc, s) => { acc[s] = trackedJobs.filter(j => tracked[j.id]?.status === s); return acc; }, {});
  if (!trackedJobs.length) return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>📋</div>
      <div style={{ color: "#475569", fontSize: 15, fontWeight: 600 }}>No applications tracked yet</div>
      <div style={{ color: "#334155", fontSize: 13, marginTop: 6 }}>Expand any job in Scanner → "Track this job"</div>
    </div>
  );
  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
        {STATUSES.map(s => (
          <div key={s} style={{ background: "#0f172a", border: `1px solid ${STATUS_COLORS[s]}33`, borderRadius: 10, padding: "10px 16px", minWidth: 76, textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: STATUS_COLORS[s] }}>{byStatus[s].length}</div>
            <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, marginTop: 2, letterSpacing: "0.05em" }}>{s.toUpperCase()}</div>
          </div>
        ))}
      </div>
      {STATUSES.filter(s => byStatus[s].length > 0).map(s => (
        <div key={s} style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_COLORS[s] }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: STATUS_COLORS[s], letterSpacing: "0.1em" }}>{s.toUpperCase()} ({byStatus[s].length})</span>
          </div>
          {byStatus[s].map(job => (
            <div key={job.id} style={{ background: "#0f172a", border: `1px solid ${STATUS_COLORS[s]}33`, borderRadius: 10, padding: "14px 18px", marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 700, color: "#f1f5f9", fontSize: 14 }}>{job.title}</div>
                  <div style={{ color: "#64748b", fontSize: 12, marginTop: 2 }}>{job.company}{job.salary ? ` · ${job.salary}` : ""}</div>
                  {tracked[job.id]?.note && <div style={{ color: "#64748b", fontSize: 11, marginTop: 6, fontStyle: "italic" }}>"{tracked[job.id].note}"</div>}
                  {tracked[job.id]?.date && <div style={{ color: "#334155", fontSize: 10, marginTop: 4 }}>Tracked {new Date(tracked[job.id].date).toLocaleDateString()}</div>}
                </div>
                <StatusBadge status={tracked[job.id].status} onChange={st => onStatusChange(job.id, st)} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── main ───────────────────────────────────────────────────────────────────────


// ── Inline link helper ─────────────────────────────────────────────────────────
function TL({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      style={{ color: "#818cf8", textDecoration: "underline", textDecorationColor: "#818cf844", cursor: "pointer" }}>
      {children}
    </a>
  );
}

// ── Learning data ──────────────────────────────────────────────────────────────
const LEARN_TOPICS = [
  {
    id: "mlops",
    title: "MLOps & Model Deployment",
    icon: "🚀",
    tagline: "Getting ML models out of notebooks and into production",
    levels: [
      {
        level: 1,
        label: "The Basics",
        summary: "MLOps means the set of practices that get a machine learning model from your laptop into a real product that users interact with — and keep it working reliably over time. Think of it like DevOps (the practice of shipping software reliably) but with extra steps for the fact that ML models have data dependencies and can degrade silently.",
        concepts: [
          { term: "Model training", plain: "Teaching a model on historical data to learn patterns.", link: "https://developers.google.com/machine-learning/crash-course/descending-into-ml/training-and-loss" },
          { term: "Model serving / inference", plain: "Taking a trained model and using it to make predictions on new data in real time.", link: "https://www.seldon.io/what-is-model-serving" },
          { term: "CI/CD for ML", plain: "Automatically testing and deploying new model versions when you push code — same idea as software CI/CD.", link: "https://ml-ops.org/content/mlops-principles" },
          { term: "Model registry", plain: "A versioned store of trained models — like Git but for model artifacts. MLflow is the most common.", link: "https://mlflow.org/docs/latest/model-registry.html" },
        ],
        questions: ["What is the difference between model training and model inference?", "Why can't you just deploy a model as a Python script?"],
        resources: [
          { label: "Google ML Crash Course (free)", url: "https://developers.google.com/machine-learning/crash-course" },
          { label: "MLOps.org — principles overview", url: "https://ml-ops.org/content/mlops-principles" },
        ],
      },
      {
        level: 2,
        label: "Intermediate",
        summary: "At this level you understand the full lifecycle: data → training → evaluation → serving → monitoring → retraining. You know the tools (MLflow, Airflow, Docker, a model server like TorchServe or BentoML) and can talk about trade-offs between batch and real-time inference.",
        concepts: [
          { term: "Batch vs real-time inference", plain: "Batch: score thousands of records overnight (cheap, slow). Real-time: score one record in <100ms when a user takes an action (expensive, fast). Most production systems need both.", link: "https://huyenchip.com/2022/01/02/real-time-machine-learning-challenges-and-solutions.html" },
          { term: "Feature store", plain: "A shared database of pre-computed features (inputs to models) that both training pipelines and serving pipelines read from — so they never compute the same thing twice.", link: "https://www.tecton.ai/blog/what-is-a-feature-store/" },
          { term: "Model drift", plain: "When a model's real-world accuracy degrades because the world changed — new user behaviors, seasonal patterns, data quality issues. You detect it by monitoring prediction distributions.", link: "https://towardsdatascience.com/machine-learning-model-drift-9cc43ad530d6" },
          { term: "Canary deployment", plain: "Sending 5% of real traffic to a new model version before fully rolling out. If metrics look good, gradually increase. If something breaks, you only affected 5% of users.", link: "https://martinfowler.com/bliki/CanaryRelease.html" },
        ],
        questions: [
          "Design a real-time inference service for 10K requests per second. What are the bottlenecks?",
          "How do you A/B test two model versions without hurting revenue?",
          "Your model is accurate in testing but slow in production (500ms latency). What do you do?",
        ],
        resources: [
          { label: "Chip Huyen — Designing ML Systems (book)", url: "https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/" },
          { label: "Chip Huyen — Real-time ML blog post", url: "https://huyenchip.com/2022/01/02/real-time-machine-learning-challenges-and-solutions.html" },
          { label: "Full Stack Deep Learning — free course", url: "https://fullstackdeeplearning.com/course/2022/" },
        ],
      },
      {
        level: 3,
        label: "Senior / Interview Level",
        summary: "Senior interviews go deep on system design, cost optimization, and operational war stories. They want to see you've actually run models in production, dealt with failures, and made architectural decisions under constraints.",
        concepts: [
          { term: "GPU utilization & batching", plain: "GPUs are only fast when you feed them large batches. A model that processes 1 request at a time uses maybe 5% of GPU capacity. Request batching (grouping incoming requests before inference) is how you get to 80%+ utilization.", link: "https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/model_configuration.html" },
          { term: "Quantization", plain: "Compressing a model's weights from 32-bit floats to 8-bit integers. Makes the model 4x smaller and 2-4x faster with small accuracy loss. Common technique when a model is too slow.", link: "https://huggingface.co/docs/optimum/concept_guides/quantization" },
          { term: "Knowledge distillation", plain: "Training a small 'student' model to mimic a large 'teacher' model. The student is much faster and cheaper to serve, at the cost of some accuracy.", link: "https://neptune.ai/blog/knowledge-distillation" },
          { term: "Data drift vs model drift", plain: "Data drift: the inputs to your model changed distribution (e.g. users shifted age demographic). Model drift: your model's predictions are becoming less accurate. They require different responses — data drift might mean retraining, model drift might mean a bug in your pipeline.", link: "https://www.evidentlyai.com/ml-in-production/data-drift-vs-model-drift" },
          { term: "Cold start penalty (Lambda/serverless)", plain: "AWS Lambda spins up a new container from scratch when it hasn't been called recently. For ML models this takes 3-10 seconds. Fine for async/batch jobs, catastrophic for real-time APIs.", link: "https://aws.amazon.com/blogs/compute/operating-lambda-performance-optimization-part-1/" },
        ],
        questions: [
          "Design a system to detect model drift in production. How do you distinguish data drift from model drift?",
          "Your inference p99 latency is 800ms but your SLA is 200ms. Walk me through your optimization process.",
          "Should you use AWS Lambda for your ML inference endpoint? What are the trade-offs?",
          "How do you implement a canary rollout for a new model version with automatic rollback?",
        ],
        resources: [
          { label: "Triton Inference Server docs (NVIDIA)", url: "https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/index.html" },
          { label: "Evidently AI — monitoring guide", url: "https://www.evidentlyai.com/blog/machine-learning-monitoring-data-and-concept-drift" },
          { label: "HuggingFace — quantization guide", url: "https://huggingface.co/docs/optimum/concept_guides/quantization" },
        ],
      },
    ],
  },
  {
    id: "data_eng",
    title: "Data Engineering Fundamentals",
    icon: "⚙️",
    tagline: "Pipelines, warehouses, and making data actually usable",
    levels: [
      {
        level: 1,
        label: "The Basics",
        summary: "Data engineering is the work of building and maintaining the systems that move, transform, and store data so that analysts, data scientists, and ML models can actually use it. If data science is the car, data engineering is the road network.",
        concepts: [
          { term: "ETL / ELT", plain: "Extract-Transform-Load (or Extract-Load-Transform). Moving data from source systems (databases, APIs, files) into a data warehouse. ETL transforms data before loading; ELT loads raw first, transforms later in the warehouse (modern approach).", link: "https://www.fivetran.com/blog/etl-vs-elt" },
          { term: "Data warehouse", plain: "A database optimized for analytical queries (lots of reads, complex aggregations) rather than transactional writes. Examples: Snowflake, BigQuery, Redshift.", link: "https://www.snowflake.com/guides/data-warehouse/" },
          { term: "Data pipeline", plain: "A series of automated steps that move and transform data from point A to point B on a schedule.", link: "https://hazelcast.com/glossary/data-pipeline/" },
          { term: "Orchestration", plain: "Scheduling and managing dependencies between pipeline steps. Apache Airflow is the most common tool — you define a DAG (directed acyclic graph) of tasks.", link: "https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/index.html" },
        ],
        questions: ["What is the difference between a data warehouse and a database?", "What does ETL stand for and why does it exist?"],
        resources: [
          { label: "Fundamentals of Data Engineering (book)", url: "https://www.oreilly.com/library/view/fundamentals-of-data/9781098108298/" },
          { label: "dbt Learn — free intro course", url: "https://courses.getdbt.com/courses/fundamentals" },
        ],
      },
      {
        level: 2,
        label: "Intermediate",
        summary: "At this level you can design a pipeline from scratch, choose the right tool for batch vs streaming, and explain why data quality matters. You know Spark, have used Airflow or a similar orchestrator, and understand partitioning and schema design.",
        concepts: [
          { term: "Apache Spark", plain: "A distributed computing engine for processing massive datasets across many machines in parallel. You write code once and it runs on a cluster of hundreds of machines.", link: "https://spark.apache.org/docs/latest/rdd-programming-guide.html" },
          { term: "Partitioning", plain: "Dividing a large table or dataset into smaller chunks based on a column (e.g. date). Queries that filter by that column only scan the relevant chunk, making them much faster.", link: "https://docs.databricks.com/en/tables/partitions.html" },
          { term: "Streaming vs batch", plain: "Batch: process data in large chunks on a schedule (e.g. nightly). Streaming: process each record as soon as it arrives, in real-time (Kafka + Flink/Spark Streaming).", link: "https://www.confluent.io/learn/batch-vs-real-time-data-processing/" },
          { term: "Delta Lake / Iceberg", plain: "Table formats that add ACID transactions, time-travel, and schema evolution to data lake files (Parquet). Makes a data lake behave more like a database.", link: "https://delta.io/learn/what-is-delta-lake/" },
        ],
        questions: [
          "When would you use Spark vs a simple SQL query?",
          "Your pipeline fails halfway through. How do you make it idempotent so you can safely re-run it?",
          "What is data lineage and why does it matter?",
        ],
        resources: [
          { label: "Apache Spark — official quickstart", url: "https://spark.apache.org/docs/latest/quick-start.html" },
          { label: "Confluent — Kafka fundamentals (free)", url: "https://developer.confluent.io/courses/apache-kafka/events/" },
          { label: "Delta Lake — intro docs", url: "https://delta.io/learn/getting-started/" },
        ],
      },
      {
        level: 3,
        label: "Senior / Interview Level",
        summary: "Senior DE interviews focus on system design at scale, cost optimization, reliability, and handling data quality failures gracefully. They want architectural thinking, not just tool knowledge.",
        concepts: [
          { term: "Exactly-once semantics", plain: "A guarantee that each record in a streaming pipeline is processed exactly once — not skipped, not duplicated — even if machines fail. Hard to achieve; Kafka + Flink can provide this.", link: "https://www.confluent.io/blog/enabling-exactly-once-kafka-streams/" },
          { term: "Schema evolution", plain: "What happens when you need to add or change a column in a dataset that thousands of downstream jobs depend on. Handled by schema registries (Avro/Protobuf) and table format features.", link: "https://docs.confluent.io/platform/current/schema-registry/fundamentals/index.html" },
          { term: "SLA / data freshness", plain: "A Service Level Agreement — the commitment you make about how fresh and complete data will be. 'Dashboard updates within 30 minutes of an event' is an SLA. Missing it has business consequences.", link: "https://www.montecarlodata.com/blog-data-sla/" },
          { term: "Data contracts", plain: "A formal agreement between the team producing data and the team consuming it — specifying schema, freshness, and quality guarantees. Prevents silent breakages when producers change their data.", link: "https://datacontract.com/" },
        ],
        questions: [
          "Design a pipeline that ingests 10M events/day with exactly-once guarantees. What breaks first at scale?",
          "A critical dashboard goes stale at 3am every Tuesday. Walk me through your debugging process.",
          "How do you handle a schema change in a table that 50 downstream pipelines depend on?",
          "What are the trade-offs between a Lambda architecture and a Kappa architecture?",
        ],
        resources: [
          { label: "Data Engineering Design Patterns", url: "https://www.databricks.com/blog/2021/08/11/data-engineering-design-patterns.html" },
          { label: "Kafka — exactly-once semantics deep dive", url: "https://www.confluent.io/blog/enabling-exactly-once-kafka-streams/" },
          { label: "Data Contracts explainer", url: "https://datacontract.com/" },
        ],
      },
    ],
  },
  {
    id: "rag",
    title: "RAG & LLM Systems",
    icon: "🤖",
    tagline: "Building products on top of large language models",
    levels: [
      {
        level: 1,
        label: "The Basics",
        summary: "LLMs (Large Language Models) like GPT-4 or Claude are AI models trained on massive amounts of text. They can answer questions, write code, summarize documents, and more. RAG (Retrieval-Augmented Generation) is a pattern for making LLMs answer questions about your specific data by first finding relevant documents and feeding them to the model.",
        concepts: [
          { term: "LLM (Large Language Model)", plain: "A neural network trained on billions of text examples that can generate human-like text, answer questions, and reason about language. Examples: GPT-4, Claude, Llama.", link: "https://www.cloudflare.com/learning/ai/what-is-large-language-model/" },
          { term: "Prompt engineering", plain: "Writing instructions to an LLM carefully to get the output you want. Like giving clear directions to a very capable but literal assistant.", link: "https://www.promptingguide.ai/" },
          { term: "RAG (Retrieval-Augmented Generation)", plain: "A pattern: (1) turn a user's question into a search query, (2) find relevant documents from a database, (3) include those documents in the LLM prompt, (4) LLM answers based on those documents. Solves the problem of LLMs not knowing your private data.", link: "https://www.pinecone.io/learn/retrieval-augmented-generation/" },
          { term: "Embeddings / vector search", plain: "A way to convert text into a list of numbers (a vector) that captures its meaning. Similar texts get similar vectors. Vector databases (Pinecone, Weaviate, pgvector) let you search by meaning rather than exact keywords.", link: "https://www.pinecone.io/learn/vector-embeddings/" },
        ],
        questions: ["What is an LLM and what can it do?", "Why do you need RAG — why not just ask the LLM directly?"],
        resources: [
          { label: "Cloudflare — What is an LLM?", url: "https://www.cloudflare.com/learning/ai/what-is-large-language-model/" },
          { label: "Pinecone — RAG explained", url: "https://www.pinecone.io/learn/retrieval-augmented-generation/" },
          { label: "Prompting Guide (free)", url: "https://www.promptingguide.ai/" },
        ],
      },
      {
        level: 2,
        label: "Intermediate",
        summary: "At this level you can build a basic RAG system end-to-end: chunk documents, embed them, store in a vector DB, retrieve relevant chunks, and feed to an LLM. You understand the failure modes and know when RAG works vs. when you need fine-tuning.",
        concepts: [
          { term: "Chunking strategy", plain: "Documents are too long to fit in an LLM's context window, so you split them into chunks. How you chunk (fixed size? by sentence? by paragraph?) significantly affects retrieval quality.", link: "https://www.pinecone.io/learn/chunking-strategies/" },
          { term: "Context window", plain: "The maximum amount of text an LLM can 'see' at once. GPT-4 Turbo has 128K tokens (~100K words). If your retrieved documents exceed this, you need to filter more aggressively.", link: "https://help.openai.com/en/articles/7127966-what-is-the-difference-between-the-gpt-4-models" },
          { term: "Hallucination", plain: "When an LLM confidently states something that is false. RAG reduces this by giving the model ground-truth documents — but it doesn't eliminate it. Models can still misread or fabricate citations.", link: "https://www.ibm.com/topics/ai-hallucinations" },
          { term: "Fine-tuning vs RAG", plain: "Fine-tuning trains the model on new data (expensive, changes the weights). RAG gives the model new data at inference time (cheaper, more flexible, easier to update). Usually try RAG first.", link: "https://www.anyscale.com/blog/fine-tuning-is-for-form-not-facts" },
        ],
        questions: [
          "Build a system where users can ask questions about a company's internal documents. Walk me through your architecture.",
          "When does RAG fail? What are the main failure modes?",
          "Your RAG system retrieves the right documents but the LLM still gives wrong answers. What do you investigate?",
        ],
        resources: [
          { label: "LangChain — RAG tutorial", url: "https://python.langchain.com/docs/tutorials/rag/" },
          { label: "Pinecone — chunking strategies", url: "https://www.pinecone.io/learn/chunking-strategies/" },
          { label: "Anyscale — fine-tuning vs RAG", url: "https://www.anyscale.com/blog/fine-tuning-is-for-form-not-facts" },
        ],
      },
      {
        level: 3,
        label: "Senior / Interview Level",
        summary: "Senior interviews on RAG/LLM systems test your ability to evaluate quality rigorously, optimize cost at scale, and reason about what can go wrong in production. They want to see you think beyond the happy path.",
        concepts: [
          { term: "Evaluation (evals)", plain: "How you measure whether your RAG system is actually giving correct, useful answers. Common metrics: faithfulness (is the answer supported by retrieved docs?), answer relevance, retrieval recall. Building good evals is often harder than building the system.", link: "https://docs.ragas.io/en/latest/concepts/metrics/index.html" },
          { term: "Reranking", plain: "After vector search retrieves the top-20 candidates, a reranker model re-scores them more carefully and returns the best 3-5. Significantly improves precision at the cost of latency.", link: "https://www.cohere.com/blog/rerank" },
          { term: "Hybrid search", plain: "Combining keyword search (BM25) with vector search. Keyword search catches exact matches (names, codes, IDs); vector search catches semantic meaning. Together they outperform either alone.", link: "https://www.elastic.co/blog/rrf-in-elasticsearch" },
          { term: "Token cost optimization", plain: "LLM APIs charge per token. At scale (millions of queries/day) prompt costs dominate. Techniques: prompt compression, caching identical queries, using smaller models for simple tasks.", link: "https://www.anthropic.com/api" },
        ],
        questions: [
          "How do you evaluate whether your RAG system is improving? What metrics do you track?",
          "Your RAG system costs $50K/month in LLM API calls. How do you cut that by 80%?",
          "Design a RAG system that needs to answer questions across 10 million documents in under 500ms.",
          "What are the security risks of an LLM system with RAG? (Think: prompt injection, data leakage.)",
        ],
        resources: [
          { label: "RAGAS — RAG evaluation framework", url: "https://docs.ragas.io/en/latest/" },
          { label: "Cohere — reranking explained", url: "https://www.cohere.com/blog/rerank" },
          { label: "Elastic — hybrid search", url: "https://www.elastic.co/blog/rrf-in-elasticsearch" },
        ],
      },
    ],
  },
  {
    id: "fde",
    title: "Forward Deployed Engineering",
    icon: "🎯",
    tagline: "Client-facing technical delivery — your actual background",
    levels: [
      {
        level: 1,
        label: "What FDE Is",
        summary: "Forward Deployed Engineers (FDEs) embed directly with clients to build and deliver solutions fast — often in weeks, not months. Unlike traditional software engineers who work on a product in isolation, FDEs work directly with the customer, understand their messy real-world data, and ship working solutions in their environment. Companies like Palantir, Anduril, and Scale AI hire heavily for this. Your BAH and MITRE contracting background is directly relevant.",
        concepts: [
          { term: "FDE vs. traditional SWE", plain: "Traditional SWE builds a product for a theoretical user. FDE sits with a specific client, uses their data, deploys in their infrastructure, and often acts as the bridge between the client's domain experts and the technical solution.", link: "https://www.palantir.com/careers/teams/forward-deployed-software-engineering/" },
          { term: "Rapid prototyping", plain: "Building a working demo or MVP in days to validate an approach before full development. FDEs live in this mode — show don't tell.", link: "https://www.nngroup.com/articles/ux-prototype-hi-lo-fidelity/" },
          { term: "Client stakeholder management", plain: "Understanding who the decision-makers are, what they actually need (vs. what they say they need), and keeping them aligned as requirements inevitably change.", link: "https://hbr.org/2023/04/how-to-work-with-someone-who-has-very-different-political-views" },
        ],
        questions: ["Tell me about a time you delivered a technical solution directly to a non-technical stakeholder.", "How do you handle a client who keeps changing requirements mid-project?"],
        resources: [
          { label: "Palantir FDE — what the role involves", url: "https://www.palantir.com/careers/teams/forward-deployed-software-engineering/" },
          { label: "Scale AI deployment team overview", url: "https://scale.com/careers" },
        ],
      },
      {
        level: 2,
        label: "Technical Depth for FDE Roles",
        summary: "FDE roles at companies like Palantir, Anduril, or Hex require both breadth (you can work across the stack) and depth (you can go deep on data engineering, ML, or infrastructure when needed). They test your ability to adapt to a new codebase and data environment quickly.",
        concepts: [
          { term: "Data ingestion & normalization", plain: "The first thing you do at a client is ingest their messy data (CSVs, databases, APIs) and normalize it into a consistent schema. This is 80% of FDE work and your entity resolution background is a superpower here.", link: "https://www.stitchdata.com/resources/data-normalization/" },
          { term: "Ontology / data modeling", plain: "Designing the structure of objects and relationships in a system — what entities exist, what properties they have, how they connect. Palantir's core product (Foundry/AIP) is built around ontologies.", link: "https://www.palantir.com/platforms/foundry/" },
          { term: "Dashboarding & data products", plain: "Turning pipeline outputs into something stakeholders can actually use — dashboards, reports, operational tools. FDEs often build the full stack: pipeline → API → UI.", link: "https://www.metabase.com/learn/getting-started/getting-started.html" },
        ],
        questions: [
          "You arrive at a new client. They have 5 years of data in 3 different databases with no documentation. How do you start?",
          "Build a data model for tracking supply chain shipments across multiple vendors. Walk me through your design.",
          "A client's dashboard is showing wrong numbers. How do you debug it?",
        ],
        resources: [
          { label: "dbt — data transformation in practice", url: "https://courses.getdbt.com/courses/fundamentals" },
          { label: "Metabase — building data products", url: "https://www.metabase.com/learn/" },
        ],
      },
      {
        level: 3,
        label: "Positioning Yourself as FDE/ML Hybrid",
        summary: "Your strongest positioning is: 'I deliver ML/data solutions directly to clients, fast.' This is rare — most ML engineers can't work with clients, and most client-facing engineers can't build ML pipelines. Your entity resolution work, your Databricks/Spark stack, and your contracting background are all directly sellable as FDE strengths.",
        concepts: [
          { term: "Your entity resolution work as FDE story", plain: "Entity resolution (matching 5.8M records across 5 datasets using probabilistic methods) is exactly the kind of hard, messy, client-relevant data problem FDEs solve. Frame it as: 'I took fragmented government data sources and built a unified entity graph that enabled analysts to work across datasets they previously couldn't connect.'", link: "https://www.databricks.com/glossary/entity-resolution" },
          { term: "Speed of delivery", plain: "FDE interviews probe: how fast can you ship? Be ready with examples of 2-week sprints, demos built in a day, and MVP-first thinking. They don't want to hear about 6-month projects with committee approvals.", link: "https://www.atlassian.com/agile/scrum/sprints" },
        ],
        questions: [
          "Why do you want to be client-facing rather than on a product team? (Be honest — they'll detect a non-answer.)",
          "Describe the fastest you've ever shipped a working data product from scratch.",
          "How do you balance building the 'right' solution vs. building what the client asked for?",
        ],
        resources: [
          { label: "Palantir FDE interview prep Reddit thread", url: "https://www.reddit.com/r/cscareerquestions/search/?q=palantir+forward+deployed" },
          { label: "Databricks — entity resolution guide", url: "https://www.databricks.com/blog/2021/05/24/machine-learning-based-record-linkage-at-scale-with-splink.html" },
        ],
      },
    ],
  },
];

// ── Learning Tab Component ─────────────────────────────────────────────────────
function LearningTab() {
  const [activeTopic, setActiveTopic] = useState(LEARN_TOPICS[0].id);
  const [activeLevel, setActiveLevel] = useState(1);
  const topic = LEARN_TOPICS.find(t => t.id === activeTopic);
  const levelData = topic?.levels.find(l => l.level === activeLevel);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "Georgia,serif", color: "#f1f5f9", letterSpacing: "-0.02em" }}>Learning Lab</h1>
        <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Leveled study guides for the roles you're targeting — from first principles to senior interview depth</p>
      </div>

      {/* Topic selector */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        {LEARN_TOPICS.map(t => (
          <button key={t.id} onClick={() => { setActiveTopic(t.id); setActiveLevel(1); }}
            style={{ background: activeTopic === t.id ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#0f172a", border: `1px solid ${activeTopic === t.id ? "#6366f1" : "#1e293b"}`, color: activeTopic === t.id ? "white" : "#64748b", borderRadius: 10, padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 }}>
            <span>{t.icon}</span> {t.title}
          </button>
        ))}
      </div>

      {topic && (
        <div>
          {/* Tagline */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "14px 20px", marginBottom: 20 }}>
            <div style={{ fontSize: 13, color: "#94a3b8" }}>{topic.tagline}</div>
          </div>

          {/* Level selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: "0.1em", marginRight: 4 }}>LEVEL:</span>
            {topic.levels.map(l => (
              <button key={l.level} onClick={() => setActiveLevel(l.level)}
                style={{ background: activeLevel === l.level ? "#6366f133" : "transparent", border: `1px solid ${activeLevel === l.level ? "#6366f1" : "#1e293b"}`, color: activeLevel === l.level ? "#818cf8" : "#475569", borderRadius: 8, padding: "7px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {l.level} — {l.label}
              </button>
            ))}
          </div>

          {levelData && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Summary */}
              <div style={{ background: "#0f172a", border: "1px solid #6366f133", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10 }}>OVERVIEW</div>
                <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.7, margin: 0 }}>{levelData.summary}</p>
              </div>

              {/* Key concepts with links */}
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 11, color: "#f59e0b", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>KEY CONCEPTS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {levelData.concepts.map(c => (
                    <div key={c.term} style={{ borderLeft: "2px solid #6366f133", paddingLeft: 14 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{c.term}</span>
                        <a href={c.link} target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: 10, color: "#818cf8", border: "1px solid #6366f133", borderRadius: 4, padding: "1px 6px", textDecoration: "none", fontWeight: 600 }}>
                          read more →
                        </a>
                      </div>
                      <p style={{ color: "#64748b", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{c.plain}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practice questions */}
              <div style={{ background: "#0f172a", border: "1px solid #8b5cf633", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 11, color: "#8b5cf6", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>PRACTICE QUESTIONS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {levelData.questions.map((q, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ color: "#8b5cf6", fontWeight: 700, fontSize: 13, flexShrink: 0, marginTop: 1 }}>Q{i + 1}</span>
                      <span style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resources */}
              <div style={{ background: "#0f172a", border: "1px solid #22c55e22", borderRadius: 12, padding: "20px 24px" }}>
                <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 14 }}>GO DEEPER — RESOURCES</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {levelData.resources.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                      style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#060d18", border: "1px solid #1e293b", borderRadius: 8, textDecoration: "none", transition: "all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = "#22c55e55"; e.currentTarget.style.background = "#0f1f17"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#1e293b"; e.currentTarget.style.background = "#060d18"; }}>
                      <span style={{ fontSize: 14 }}>📖</span>
                      <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 500 }}>{r.label}</span>
                      <span style={{ marginLeft: "auto", color: "#22c55e", fontSize: 11, fontWeight: 700 }}>Open →</span>
                    </a>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function JobSearch() {
  const [tab, setTab] = useState("scanner");
  const [jobs, setJobs] = useState(DEFAULT_JOBS);
  const [analyses, setAnalyses] = useState({});
  const [loading, setLoading] = useState({});
  const [hasScanned, setHasScanned] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [filter, setFilter] = useState("All");
  const [scoreFilter, setScoreFilter] = useState(0);
  const [tracked, setTracked] = useState({});
  const [likes, setLikes] = useState([]); // job ids
  const [passes, setPasses] = useState([]); // [{id, reasons, note}]
  const [showAddJob, setShowAddJob] = useState(false);
  const [passTarget, setPassTarget] = useState(null);

  useEffect(() => {
    setTracked(ls("vt-tracked", {}));
    setLikes(ls("vt-likes", []));
    setPasses(ls("vt-passes", []));
    const savedJobs = ls("vt-jobs", null);
    if (savedJobs) setJobs(savedJobs);
    const savedA = ls("vt-analyses", {});
    if (Object.keys(savedA).length) { setAnalyses(savedA); setHasScanned(true); }
    const savedScan = ls("vt-last-scan", null);
    if (savedScan) setLastScan(new Date(savedScan));
  }, []);

  const getSignals = (currentJobs, currentLikes, currentPasses) => ({
    liked: currentJobs.filter(j => currentLikes.includes(j.id)).map(j => ({ title: j.title, company: j.company, tags: Array.isArray(j.tags) ? j.tags : [] })),
    passed: currentPasses.map(p => { const j = currentJobs.find(x => x.id === p.id); return j ? { title: j.title, company: j.company, reason: p.reasons?.join(", ") } : null; }).filter(Boolean),
  });

  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const scanJobs = async () => {
    setHasScanned(true);
    setFetchError(null);
    const now = new Date(); setLastScan(now); lsSave("vt-last-scan", now.toISOString());

    // Step 1: Fetch fresh jobs — snapshot manual jobs NOW before any async work
    const manualJobs = jobs.filter(j => j._manual);
    const currentPasses = passes; // snapshot to avoid stale closure issues
    setFetching(true);
    let jobsToScore = null;

    try {
      const res = await fetch("/api/jobs");
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch {
        setFetchError("API returned unexpected response. Check that RAPIDAPI_KEY is set in Vercel environment variables.");
        data = null;
      }
      if (data?.error) {
        setFetchError(data.error);
      } else if (data?.jobs?.length) {
        const passedIds = new Set(currentPasses.map(p => p.id));
        // Replace fetched jobs entirely — don't merge with stale state
        const freshJobs = data.jobs.filter(j => !passedIds.has(j.id));
        jobsToScore = [...manualJobs, ...freshJobs];
        setJobs(jobsToScore);
        lsSave("vt-jobs", jobsToScore);
      } else if (data && !data.jobs?.length) {
        setFetchError("No jobs returned from API. You may have hit the free tier limit (200 req/month) or the query returned no results.");
      }
    } catch (e) {
      setFetchError("Network error fetching jobs: " + e.message);
    }
    setFetching(false);

    // Fall back to whatever is currently saved if fetch failed
    if (!jobsToScore) {
      const saved = ls("vt-jobs", []);
      jobsToScore = saved.length ? saved : manualJobs;
    }

    if (!jobsToScore.length) {
      setLoading({});
      return;
    }

    // Step 2: Score each job with fresh analyses (don't reuse old analyses object)
    setAnalyses({});
    const initLoad = {}; jobsToScore.forEach(j => initLoad[j.id] = true); setLoading(initLoad);
    const signals = getSignals(jobsToScore, currentPasses, currentPasses);
    const newA = {};
    for (const job of jobsToScore) {
      try {
        const res = await fetch("/api/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ job, signals }) });
        newA[job.id] = await res.json();
      } catch { newA[job.id] = { score: 0, verdict: "Error", reasons: [], gaps: [], one_liner: "Score failed.", gov_flag: false }; }
      setAnalyses(prev => ({ ...prev, [job.id]: newA[job.id] }));
      setLoading(prev => ({ ...prev, [job.id]: false }));
    }
    lsSave("vt-analyses", newA);
    setLoading({});
  };

  const addJob = j => {
    const newJob = { ...j, _manual: true };
    const u = [...jobs, newJob];
    setJobs(u); lsSave("vt-jobs", u);
    // Auto-track as Applied — only reason to manually add a job
    const newTracked = { ...tracked, [newJob.id]: { status: "Applied", note: "", date: new Date().toISOString() } };
    setTracked(newTracked); lsSave("vt-tracked", newTracked);
  };
  const deleteJob = id => {
    const u = jobs.filter(j => j.id !== id); setJobs(u); lsSave("vt-jobs", u);
    const na = { ...analyses }; delete na[id]; setAnalyses(na); lsSave("vt-analyses", na);
    const nt = { ...tracked }; delete nt[id]; setTracked(nt); lsSave("vt-tracked", nt);
  };
  const handleTrack = id => { const u = { ...tracked, [id]: { status: "Saved", note: "", date: new Date().toISOString() } }; setTracked(u); lsSave("vt-tracked", u); };
  const handleStatus = (id, status) => { const u = { ...tracked, [id]: { ...tracked[id], status } }; setTracked(u); lsSave("vt-tracked", u); };
  const handleNote = (id, note) => { const u = { ...tracked, [id]: { ...tracked[id], note } }; setTracked(u); lsSave("vt-tracked", u); };
  const handleLike = id => { const u = likes.includes(id) ? likes.filter(x => x !== id) : [...likes, id]; setLikes(u); lsSave("vt-likes", u); };
  const handlePassStart = job => setPassTarget(job);
  const handlePassConfirm = (reasons, note) => {
    const u = [...passes.filter(p => p.id !== passTarget.id), { id: passTarget.id, reasons, note }];
    setPasses(u); lsSave("vt-passes", u); setPassTarget(null);
    const ul = likes.filter(x => x !== passTarget.id); setLikes(ul); lsSave("vt-likes", ul);
  };

  const scanning = fetching || Object.values(loading).some(Boolean);
  const trackedCount = Object.keys(tracked).length;
  const strongCount = Object.values(analyses).filter(a => ["Strong Match", "Good Match"].includes(a.verdict)).length;
  const govCount = Object.values(analyses).filter(a => a.gov_flag).length;

  const hiddenStatuses = ["Applied", "Phone Screen", "Interview", "Coding Interview", "Final Round", "Offer", "Offer Declined", "Rejected - No Response", "Rejected - Pre-Interview", "Rejected - After Phone Screen", "Rejected - After Coding", "Rejected - After Final Round", "Pass"];

  // Parse max salary from string like "$120K–$275K" or "$160K–$210K + equity"
  const parseMaxSalary = s => {
    if (!s || s === "Not listed") return null;
    const nums = s.replace(/[^0-9K]/gi, " ").trim().split(/\s+/).map(n => {
      if (n.toUpperCase().endsWith("K")) return parseInt(n) * 1000;
      return parseInt(n);
    }).filter(n => !isNaN(n) && n > 1000);
    return nums.length ? Math.max(...nums) : null;
  };

  const SALARY_FLOOR = 180000;

  const filtered = jobs
    .filter(j => !passes.find(p => p.id === j.id))
    .filter(j => !hiddenStatuses.includes(tracked[j.id]?.status))
    // Hard salary floor — hide jobs where we KNOW max pay is under $180K
    .filter(j => {
      const max = parseMaxSalary(j.salary);
      if (max === null) return true; // keep "Not listed" — can't confirm low
      return max >= SALARY_FLOOR;
    })
    .filter(j => filter === "All" || analyses[j.id]?.verdict === filter)
    .filter(j => (analyses[j.id]?.score || 0) >= scoreFilter)
    .sort((a, b) => (analyses[b.id]?.score || 0) - (analyses[a.id]?.score || 0));

  const tabs = [["scanner", "⚡ Scanner"], ["picks", `✨ Smart Picks${likes.length + passes.length > 0 ? ` (${likes.length}👍)` : ""}`], ["tracker", `📋 Tracker${trackedCount > 0 ? ` (${trackedCount})` : ""}`], ["boards", "🔗 Boards"], ["learn", "📚 Learn"]];

  return (
    <div>
      {passTarget && <PassModal job={passTarget} onConfirm={handlePassConfirm} onClose={() => setPassTarget(null)} />}
      {showAddJob && <AddJobModal onSave={addJob} onClose={() => setShowAddJob(false)} />}

      {/* Sub-nav */}
      <div style={{ borderBottom: "1px solid #0f172a", padding: "0 28px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", gap: 2 }}>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              style={{ background: "transparent", color: tab === id ? "#f1f5f9" : "#475569", border: "none", borderBottom: `2px solid ${tab === id ? "#6366f1" : "transparent"}`, padding: "12px 16px", fontSize: 13, fontWeight: tab === id ? 600 : 400, cursor: "pointer", transition: "all 0.2s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 24px" }}>

        {/* SCANNER */}
        {tab === "scanner" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: hasScanned ? "#22c55e" : "#334155", boxShadow: hasScanned ? "0 0 8px #22c55e" : "none" }} />
                <span style={{ fontSize: 10, color: "#475569", letterSpacing: "0.15em", fontWeight: 600 }}>
                  {hasScanned ? `LAST SCANNED ${lastScan?.toLocaleDateString()} ${lastScan?.toLocaleTimeString()}` : "READY TO SCAN"}
                </span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "Georgia,serif", color: "#f1f5f9", letterSpacing: "-0.02em" }}>Job Scanner</h1>
              <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Remote · Senior ML/DE/FDE · $180K+ hard floor · Private sector · 👍👎 to teach Smart Picks</p>
            </div>

            {hasScanned && (
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {[["Jobs", jobs.length, "#6366f1"], ["Strong", strongCount, "#22c55e"], ["Gov ⚠", govCount, "#ef4444"], ["Tracked", trackedCount, "#f59e0b"], ["Liked", likes.length, "#22c55e"], ["Passed", passes.length, "#64748b"]].map(([label, val, color]) => (
                  <div key={label} style={{ background: "#0f172a", border: `1px solid ${color}22`, borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color }}>{val}</div>
                    <div style={{ fontSize: 9, color: "#475569", fontWeight: 600, letterSpacing: "0.05em", marginTop: 1 }}>{label.toUpperCase()}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
              <button onClick={scanJobs} disabled={scanning}
                style={{ background: scanning ? "#1e293b" : "linear-gradient(135deg,#6366f1,#8b5cf6)", color: scanning ? "#475569" : "white", border: "none", borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: scanning ? "not-allowed" : "pointer" }}>
                {fetching ? "⟳ Fetching jobs..." : scanning ? "⟳ Scoring..." : hasScanned ? "↺ Fetch Fresh Jobs & Rescan" : "⚡ Fetch & Score Jobs"}
              </button>
              <button onClick={() => setShowAddJob(true)} style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 10, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                + Add Job
              </button>
              {fetchError && (
                <div style={{background:"#1a0a0a",border:"1px solid #ef444433",borderRadius:8,padding:"10px 16px",marginBottom:12,fontSize:12,color:"#ef4444"}}>
                  {fetchError.includes("RAPIDAPI_KEY") ? (
                    <span>RAPIDAPI_KEY not set. Add it in Vercel Settings → Environment Variables. <a href="https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch" target="_blank" style={{color:"#6366f1"}}>Get key at RapidAPI →</a></span>
                  ) : fetchError}
                </div>
              )}
              {hasScanned && (
                <>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {["All", "Strong Match", "Good Match", "Partial Match"].map(v => (
                      <button key={v} onClick={() => setFilter(v)} style={{ background: filter === v ? "#6366f1" : "#0f172a", border: `1px solid ${filter === v ? "#6366f1" : "#1e293b"}`, color: filter === v ? "white" : "#64748b", borderRadius: 6, padding: "5px 10px", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        {v}
                      </button>
                    ))}
                  </div>
                  <select value={scoreFilter} onChange={e => setScoreFilter(Number(e.target.value))} style={{ background: "#0f172a", border: "1px solid #1e293b", color: "#94a3b8", borderRadius: 6, padding: "5px 9px", fontSize: 11, cursor: "pointer" }}>
                    <option value={0}>All scores</option>
                    <option value={70}>70+</option>
                    <option value={80}>80+</option>
                  </select>
                </>
              )}
            </div>

            {!hasScanned && (
              <div style={{ textAlign: "center", padding: "50px 0" }}>
                <div style={{ fontSize: 38, marginBottom: 12 }}>⚡</div>
                <div style={{ color: "#475569", fontSize: 15, fontWeight: 600 }}>Score {jobs.length} curated listings against your resume</div>
                <div style={{ color: "#334155", fontSize: 13, marginTop: 6 }}>👍 / 👎 jobs to teach Smart Picks your preferences. Add your own jobs with +.</div>
              </div>
            )}

            {filtered.map(job => (
              <JobCard key={job.id} job={job} analysis={analyses[job.id]} isLoading={loading[job.id]}
                tracked={tracked[job.id]} likes={likes} passes={passes}
                onTrack={handleTrack} onStatusChange={handleStatus} onNoteChange={handleNote}
                onLike={handleLike} onPass={handlePassStart} onDelete={deleteJob} />
            ))}
            {hasScanned && !filtered.length && <div style={{ textAlign: "center", padding: "40px 0", color: "#334155" }}>No jobs match current filters.</div>}
          </div>
        )}

        {/* SMART PICKS */}
        {tab === "picks" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ marginBottom: 22 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "Georgia,serif", color: "#f1f5f9", letterSpacing: "-0.02em" }}>Smart Picks</h1>
              <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Ranked by what your 👍 and 👎 signals tell me you actually want — independent of the base score.</p>
            </div>
            <SmartPicks jobs={jobs} analyses={analyses} likes={likes} passes={passes}
              tracked={tracked} onTrack={handleTrack} onStatusChange={handleStatus}
              onNoteChange={handleNote} onLike={handleLike} onPass={handlePassStart} />
          </div>
        )}

        {/* TRACKER */}
        {tab === "tracker" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "Georgia,serif", color: "#f1f5f9", letterSpacing: "-0.02em" }}>Application Tracker</h1>
                <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Track every role from first save to offer</p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button onClick={() => {
                  const data = { jobs, tracked, likes, passes, exportedAt: new Date().toISOString() };
                  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a"); a.href = url;
                  a.download = `jobradar-backup-${new Date().toISOString().slice(0,10)}.json`;
                  a.click(); URL.revokeObjectURL(url);
                }} style={{ background: "#0f172a", border: "1px solid #22c55e44", color: "#22c55e", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  ↓ Export Backup
                </button>
                <label style={{ background: "#0f172a", border: "1px solid #6366f144", color: "#818cf8", borderRadius: 8, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  ↑ Import Backup
                  <input type="file" accept=".json" style={{ display: "none" }} onChange={e => {
                    const file = e.target.files[0]; if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => {
                      try {
                        const data = JSON.parse(ev.target.result);
                        if (data.jobs) { setJobs(data.jobs); lsSave("vt-jobs", data.jobs); }
                        if (data.tracked) { setTracked(data.tracked); lsSave("vt-tracked", data.tracked); }
                        if (data.likes) { setLikes(data.likes); lsSave("vt-likes", data.likes); }
                        if (data.passes) { setPasses(data.passes); lsSave("vt-passes", data.passes); }
                        alert("Backup restored successfully!");
                      } catch { alert("Invalid backup file."); }
                    };
                    reader.readAsText(file);
                    e.target.value = "";
                  }} />
                </label>
              </div>
            </div>
            <TrackerView jobs={jobs} tracked={tracked} onStatusChange={handleStatus} onNoteChange={handleNote} />
          </div>
        )}

        {/* LEARN */}
        {tab === "learn" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <LearningTab />
          </div>
        )}

        {/* BOARDS */}
        {tab === "boards" && (
          <div style={{ animation: "fadeIn 0.4s ease" }}>
            <div style={{ marginBottom: 22 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "Georgia,serif", color: "#f1f5f9", letterSpacing: "-0.02em" }}>Job Boards</h1>
              <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>The boards worth checking daily</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
              {JOB_BOARDS.map(b => (
                <a key={b.name} href={b.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: "block", background: "#0f172a", border: `1px solid ${b.hot ? "#6366f133" : "#1e293b"}`, borderRadius: 12, padding: "16px 18px", textDecoration: "none", transition: "all 0.2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = b.hot ? "#6366f133" : "#1e293b"; e.currentTarget.style.transform = "none"; }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#f1f5f9" }}>{b.name}</span>
                    {b.hot && <span style={{ fontSize: 10, background: "#6366f122", color: "#818cf8", border: "1px solid #6366f133", borderRadius: 4, padding: "2px 7px", fontWeight: 700 }}>TOP PICK</span>}
                  </div>
                  <div style={{ color: "#64748b", fontSize: 12, marginTop: 6 }}>{b.label}</div>
                  <div style={{ color: "#6366f1", fontSize: 12, marginTop: 10, fontWeight: 600 }}>Open →</div>
                </a>
              ))}
            </div>
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 12, padding: "18px 22px" }}>
              <div style={{ fontSize: 11, color: "#6366f1", fontWeight: 700, marginBottom: 10, letterSpacing: "0.1em" }}>DAILY ROUTINE</div>
              {[["Check Wellfound + YC Jobs", "new startup listings update most frequently"],["Paste interesting roles", "use + Add Job with the full description for best scoring"],["Hit Rescan", "re-scores everything including new jobs"],["👍👎 everything", "more signals = smarter Smart Picks"],["Update Tracker", "move roles that progressed or went cold"]].map(([t, d]) => (
                <div key={t} style={{ display: "flex", gap: 10, marginBottom: 9, alignItems: "flex-start" }}>
                  <span style={{ color: "#6366f1", fontSize: 14, marginTop: 1 }}>→</span>
                  <div><span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{t}</span><span style={{ color: "#475569", fontSize: 13 }}> — {d}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
