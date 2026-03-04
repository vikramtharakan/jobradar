"use client";
import { useState, useEffect } from "react";

// ── constants ──────────────────────────────────────────────────────────────────

const JOB_BOARDS = [
  { name: "Wellfound", url: "https://wellfound.com/jobs?role=machine-learning-engineer&remote=true", label: "Best for startups — direct founder access", hot: true },
  { name: "YC Jobs", url: "https://www.workatastartup.com/jobs?role=ml&remote=true", label: "YC-backed startups, highest signal-to-noise", hot: true },
  { name: "ai-jobs.net", url: "https://ai-jobs.net/", label: "Curated AI/ML roles, no fluff", hot: false },
  { name: "Remotive", url: "https://remotive.com/remote-jobs/software-dev", label: "Every post vetted, remote-only", hot: false },
  { name: "Built In NYC", url: "https://builtin.com/jobs/remote/machine-learning", label: "NYC companies offering remote", hot: false },
  { name: "Levels.fyi Jobs", url: "https://www.levels.fyi/jobs?jobFamily=Software+Engineer&country=254", label: "Salary-transparent listings", hot: false },
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

const STATUSES = ["Saved", "Applied", "Phone Screen", "Interview", "Offer", "Pass"];
const STATUS_COLORS = { Saved: "#6366f1", Applied: "#3b82f6", "Phone Screen": "#f59e0b", Interview: "#8b5cf6", Offer: "#22c55e", Pass: "#64748b" };

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

function StatusBadge({ status, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
        style={{ background: STATUS_COLORS[status] + "22", color: STATUS_COLORS[status], border: `1px solid ${STATUS_COLORS[status]}55`, borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
        {status} ▾
      </button>
      {open && (
        <div style={{ position: "absolute", top: "110%", right: 0, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8, zIndex: 200, minWidth: 140, overflow: "hidden" }}>
          {STATUSES.map(s => (
            <div key={s} onClick={e => { e.stopPropagation(); onChange(s); setOpen(false); }}
              style={{ padding: "8px 14px", fontSize: 12, color: STATUS_COLORS[s], cursor: "pointer", fontWeight: 600, background: s === status ? "#1e293b" : "transparent" }}
              onMouseEnter={e => e.currentTarget.style.background = "#1e293b"}
              onMouseLeave={e => e.currentTarget.style.background = s === status ? "#1e293b" : "transparent"}>
              {s}
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

    // Step 1: Fetch fresh jobs from JSearch
    setFetching(true);
    let jobsToScore = jobs.filter(j => j._manual); // always keep manual jobs
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
        const passedIds = new Set(passes.map(p => p.id));
        const newFetched = data.jobs.filter(j => !passedIds.has(j.id));
        jobsToScore = [...jobs.filter(j => j._manual), ...newFetched];
        setJobs(jobsToScore);
        lsSave("vt-jobs", jobsToScore);
      } else if (data && !data.jobs?.length) {
        setFetchError("No jobs returned from API. You may have hit the free tier limit (200 req/month) or the query returned no results.");
      }
    } catch (e) {
      setFetchError("Network error fetching jobs: " + e.message);
    }
    setFetching(false);

    // If we still have no jobs at all, bail out early
    if (!jobsToScore.length) {
      setLoading({});
      return;
    }

    // Step 2: Score each job
    const initLoad = {}; jobsToScore.forEach(j => initLoad[j.id] = true); setLoading(initLoad);
    const signals = getSignals(jobsToScore, likes, passes);
    const newA = { ...analyses };
    for (const job of jobsToScore) {
      try {
        const res = await fetch("/api/score", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ job, signals }) });
        const scoreData = await res.json();
        newA[job.id] = scoreData;
      } catch { newA[job.id] = { score: 0, verdict: "Error", reasons: [], gaps: [], one_liner: "Score failed.", gov_flag: false }; }
      setAnalyses(prev => ({ ...prev, [job.id]: newA[job.id] }));
      setLoading(prev => ({ ...prev, [job.id]: false }));
    }
    lsSave("vt-analyses", newA);
  };

  const addJob = j => { const u = [...jobs, { ...j, _manual: true }]; setJobs(u); lsSave("vt-jobs", u); };
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

  const hiddenStatuses = ["Applied", "Phone Screen", "Interview", "Offer", "Pass"];
  const filtered = jobs
    .filter(j => !passes.find(p => p.id === j.id))
    .filter(j => !hiddenStatuses.includes(tracked[j.id]?.status))
    .filter(j => filter === "All" || analyses[j.id]?.verdict === filter)
    .filter(j => (analyses[j.id]?.score || 0) >= scoreFilter)
    .sort((a, b) => (analyses[b.id]?.score || 0) - (analyses[a.id]?.score || 0));

  const tabs = [["scanner", "⚡ Scanner"], ["picks", `✨ Smart Picks${likes.length + passes.length > 0 ? ` (${likes.length}👍)` : ""}`], ["tracker", `📋 Tracker${trackedCount > 0 ? ` (${trackedCount})` : ""}`], ["boards", "🔗 Boards"]];

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
              <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Remote · Senior ML/DE · $200K+ · Private sector · Any industry · 👍👎 to teach Smart Picks</p>
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
            <div style={{ marginBottom: 22 }}>
              <h1 style={{ fontSize: 26, fontWeight: 700, fontFamily: "Georgia,serif", color: "#f1f5f9", letterSpacing: "-0.02em" }}>Application Tracker</h1>
              <p style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Track every role from first save to offer</p>
            </div>
            <TrackerView jobs={jobs} tracked={tracked} onStatusChange={handleStatus} onNoteChange={handleNote} />
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
