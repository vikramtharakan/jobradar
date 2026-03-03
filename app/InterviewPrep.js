"use client";
import { useState, useRef, useEffect } from "react";

const TOPICS = {
  "ML Systems": ["Model serving & inference at scale","Feature stores","ML pipelines & MLOps","Training infrastructure","A/B testing & experimentation","Model monitoring & drift detection","Embeddings & vector search","LLM fine-tuning & RLHF"],
  "Data Engineering": ["Spark internals & optimization","Kafka & stream processing","Data modeling (Kimball, Data Vault)","ETL vs ELT patterns","Data lakehouse architecture","Airflow & orchestration","dbt & transformation","Real-time vs batch tradeoffs"],
  "ML Algorithms": ["Entity resolution & record linkage","Deep metric learning","NER & information extraction","Graph neural networks","Recommender systems","Anomaly detection","Clustering at scale","Semi-supervised learning"],
  "Databases & Search": ["Elasticsearch internals","Graph databases (Neo4j, JanusGraph)","Columnar vs row storage","Query optimization","Caching strategies (Redis)","Vector databases","OLAP vs OLTP"],
  "System Design": ["Design a data pipeline for 1B events/day","Design an ML feature store","Design a real-time fraud detection system","Design a search ranking system","Design an entity resolution system","Design a recommendation engine","Design a data lake for ML"],
  "Behavioral": ["Tell me about a time you owned a complex system end to end","Describe a technical disagreement and how you resolved it","How do you handle tight deadlines with ambiguous requirements","Tell me about a project that failed and what you learned","How do you mentor junior engineers","Describe your biggest technical mistake"],
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
  return <div style={{width:18,height:18,borderRadius:"50%",border:"3px solid #1e293b",borderTop:"3px solid #6366f1",animation:"spin 0.8s linear infinite",display:"inline-block",flexShrink:0}} />;
}
function ErrorBox({ message }) {
  return (
    <div style={{background:"#1a0a0a",border:"1px solid #ef444433",borderRadius:10,padding:"14px 18px",color:"#ef4444",fontSize:13}}>
      {message || "Something went wrong. Check that ANTHROPIC_API_KEY is set in Vercel Settings > Environment Variables."}
    </div>
  );
}
function ContentRenderer({ text }) {
  if (!text) return null;
  const parts = text.split(/(```[\s\S]*?```)/g);
  return (
    <div>
      {parts.map((part, i) => {
        if (part.startsWith("```")) {
          const code = part.replace(/^```\w*\n?/, "").replace(/```$/, "");
          return <pre key={i} style={{background:"#020817",border:"1px solid #1e293b",borderRadius:6,padding:"12px 14px",fontSize:12,color:"#22c55e",overflowX:"auto",margin:"10px 0",fontFamily:"monospace",lineHeight:1.6,whiteSpace:"pre-wrap"}}>{code}</pre>;
        }
        return <span key={i} style={{whiteSpace:"pre-wrap"}}>{part}</span>;
      })}
    </div>
  );
}
function LearnView({ topic, completed, onToggleComplete }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const prevTopic = useRef(null);
  useEffect(() => {
    if (!topic || topic === prevTopic.current) return;
    prevTopic.current = topic;
    setContent(null); setError(null); setLoading(true);
    fetch("/api/prep", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({type:"learn", topic}) })
      .then(r => r.json())
      .then(d => { if (d.error) { setError(d.error); } else { setContent(d); } setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [topic]);
  if (!topic) return (
    <div style={{textAlign:"center",padding:"50px 0"}}>
      <div style={{fontSize:36,marginBottom:12}}>{"📖"}</div>
      <div style={{color:"#475569",fontSize:14,fontWeight:600}}>Pick a topic from the sidebar</div>
      <div style={{color:"#334155",fontSize:13,marginTop:6}}>Each lesson is tailored to senior ML/DE interview depth</div>
    </div>
  );
  if (loading) return (
    <div style={{textAlign:"center",padding:"50px 0"}}>
      <Spinner />
      <div style={{color:"#475569",fontSize:13,marginTop:14}}>Generating lesson...</div>
    </div>
  );
  if (error) return <ErrorBox message={error} />;
  if (!content) return null;
  const isDone = completed.includes(topic);
  return (
    <div style={{animation:"fadeIn 0.4s ease"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,gap:16}}>
        <h2 style={{fontSize:20,fontWeight:700,fontFamily:"Georgia,serif",color:"#f1f5f9",lineHeight:1.3}}>{content.title || topic}</h2>
        <button onClick={() => onToggleComplete(topic)}
          style={{flexShrink:0,background:isDone?"#22c55e22":"#0f172a",border:"1px solid "+(isDone?"#22c55e":"#334155"),color:isDone?"#22c55e":"#64748b",borderRadius:8,padding:"7px 14px",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
          {isDone ? "checkmark Completed" : "Mark complete"}
        </button>
      </div>
      <div style={{background:"#0f172a",border:"1px solid #6366f133",borderRadius:12,padding:"16px 20px",marginBottom:20}}>
        <div style={{fontSize:10,color:"#6366f1",fontWeight:700,letterSpacing:"0.1em",marginBottom:8}}>TL;DR</div>
        <div style={{color:"#cbd5e1",fontSize:14,lineHeight:1.7}}>{content.tldr}</div>
      </div>
      {(content.sections||[]).map((s, i) => (
        <div key={i} style={{marginBottom:22}}>
          <div style={{fontSize:13,fontWeight:700,color:"#f1f5f9",marginBottom:10,paddingBottom:6,borderBottom:"1px solid #1e293b"}}>{s.heading}</div>
          <div style={{color:"#94a3b8",fontSize:13,lineHeight:1.8}}><ContentRenderer text={s.content} /></div>
        </div>
      ))}
      {(content.key_facts||[]).length > 0 && (
        <div style={{background:"#0f172a",border:"1px solid #22c55e22",borderRadius:10,padding:"14px 18px",marginBottom:18}}>
          <div style={{fontSize:10,color:"#22c55e",fontWeight:700,letterSpacing:"0.1em",marginBottom:10}}>KEY FACTS</div>
          {content.key_facts.map((f, i) => <div key={i} style={{color:"#cbd5e1",fontSize:13,marginBottom:7}}>lightning {f}</div>)}
        </div>
      )}
      {(content.follow_up_topics||[]).length > 0 && (
        <div>
          <div style={{fontSize:10,color:"#475569",fontWeight:700,letterSpacing:"0.1em",marginBottom:8}}>EXPLORE NEXT</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {content.follow_up_topics.map(t => <span key={t} style={{fontSize:12,background:"#1e293b",color:"#94a3b8",borderRadius:6,padding:"5px 11px"}}>{t}</span>)}
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
  const [qError, setQError] = useState(null);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);
  const [loadingEval, setLoadingEval] = useState(false);
  const [evalError, setEvalError] = useState(null);
  const [showSample, setShowSample] = useState(false);
  const [mastery, setMastery] = useState(() => ls("vt-mastery", {}));
  const [history, setHistory] = useState(() => ls("vt-prep-history", []));
  const tm = mastery[topic] || { attempts:0, scores:[] };
  const avgScore = tm.scores.length ? Math.round(tm.scores.reduce((a,b)=>a+b,0)/tm.scores.length) : null;
  const isMastered = avgScore !== null && avgScore >= 8 && tm.attempts >= 3;
  const needsWork = avgScore !== null && avgScore < 6 && tm.attempts >= 2;
  const getQuestion = async () => {
    if (!topic) return;
    setQuestion(null); setAnswer(""); setEvaluation(null); setShowSample(false); setQError(null); setLoadingQ(true);
    try {
      const res = await fetch("/api/prep", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({type:"question", topic, question:{qtype}}) });
      const d = await res.json();
      if (d.error) setQError(d.error); else setQuestion(d);
    } catch(e) { setQError(e.message); }
    setLoadingQ(false);
  };
  const evaluate = async () => {
    if (!answer.trim() || !question) return;
    setEvalError(null); setLoadingEval(true);
    try {
      const res = await fetch("/api/prep", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({type:"evaluate", question:question.question, userAnswer:answer}) });
      const d = await res.json();
      if (d.error) { setEvalError(d.error); setLoadingEval(false); return; }
      setEvaluation(d);
      const newScores = [...(mastery[topic]?.scores||[]), d.score].slice(-10);
      const nm = {...mastery, [topic]:{attempts:(mastery[topic]?.attempts||0)+1, scores:newScores}};
      setMastery(nm); lsSave("vt-mastery", nm);
      const entry = {topic, question:question.question, score:d.score, verdict:d.verdict, date:new Date().toISOString()};
      const h = [entry,...history].slice(0,100); setHistory(h); lsSave("vt-prep-history", h);
    } catch(e) { setEvalError(e.message); }
    setLoadingEval(false);
  };
  const vc = {Strong:"#22c55e",Good:"#86efac","Needs Work":"#f59e0b",Weak:"#ef4444"};
  if (!topic) return <div style={{textAlign:"center",padding:"50px 0",color:"#475569",fontSize:14}}>Pick a topic from the sidebar</div>;
  return (
    <div style={{animation:"fadeIn 0.4s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18,flexWrap:"wrap"}}>
        <span style={{fontSize:14,fontWeight:700,color:"#f1f5f9",fontFamily:"Georgia,serif"}}>{topic}</span>
        {isMastered && <span style={{fontSize:11,background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e44",borderRadius:6,padding:"3px 10px",fontWeight:700}}>checkmark Mastered</span>}
        {needsWork && !isMastered && <span style={{fontSize:11,background:"#f59e0b22",color:"#f59e0b",border:"1px solid #f59e0b44",borderRadius:6,padding:"3px 10px",fontWeight:700}}>warning Needs more practice</span>}
        {avgScore !== null && <span style={{fontSize:11,color:"#64748b"}}>Avg: {avgScore}/10 over {tm.attempts} attempt{tm.attempts!==1?"s":""}</span>}
      </div>
      {needsWork && !isMastered && <div style={{background:"#1a0f00",border:"1px solid #f59e0b33",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#f59e0b"}}>Averaging below 6/10 here. Keep practicing until your scores improve.</div>}
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        {QTYPES.map(qt => (
          <button key={qt.id} onClick={() => setQtype(qt.id)}
            style={{background:qtype===qt.id?qt.color+"22":"#0f172a",border:"1px solid "+(qtype===qt.id?qt.color:"#1e293b"),color:qtype===qt.id?qt.color:"#64748b",borderRadius:7,padding:"6px 13px",fontSize:12,fontWeight:qtype===qt.id?700:400,cursor:"pointer"}}>
            {qt.label}
          </button>
        ))}
      </div>
      <button onClick={getQuestion} disabled={loadingQ}
        style={{background:loadingQ?"#1e293b":"linear-gradient(135deg,#6366f1,#8b5cf6)",color:loadingQ?"#475569":"white",border:"none",borderRadius:9,padding:"10px 22px",fontSize:13,fontWeight:700,cursor:loadingQ?"not-allowed":"pointer",marginBottom:22,display:"flex",alignItems:"center",gap:8}}>
        {loadingQ ? <span style={{display:"flex",alignItems:"center",gap:8}}><Spinner /> Generating...</span> : question ? "New Question" : "Generate Question"}
      </button>
      {qError && <ErrorBox message={qError} />}
      {question && !qError && (
        <div style={{animation:"fadeIn 0.4s ease"}}>
          <div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:12,padding:"18px 22px",marginBottom:18}}>
            <div style={{fontSize:10,color:"#6366f1",fontWeight:700,letterSpacing:"0.1em",marginBottom:10}}>QUESTION</div>
            <div style={{fontSize:15,color:"#f1f5f9",fontWeight:600,lineHeight:1.6,marginBottom:10}}>{question.question}</div>
            {question.context && <div style={{fontSize:12,color:"#475569",fontStyle:"italic",marginBottom:8}}>{question.context}</div>}
            {question.what_they_want && <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #1e293b"}}><div style={{fontSize:10,color:"#334155",fontWeight:700,marginBottom:5}}>WHAT THEY WANT</div><div style={{fontSize:12,color:"#475569"}}>{question.what_they_want}</div></div>}
            {(question.hints||[]).length > 0 && <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #1e293b"}}><div style={{fontSize:10,color:"#334155",fontWeight:700,marginBottom:6}}>HINTS (if stuck)</div>{question.hints.map((h,i)=><div key={i} style={{fontSize:12,color:"#475569",marginBottom:4}}>- {h}</div>)}</div>}
          </div>
          <div style={{marginBottom:14}}>
            <div style={{fontSize:11,color:"#475569",fontWeight:700,letterSpacing:"0.1em",marginBottom:8}}>YOUR ANSWER</div>
            <textarea value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="Type your answer here. Think out loud..." style={{width:"100%",background:"#0f172a",border:"1px solid #1e293b",borderRadius:8,padding:"12px 14px",color:"#cbd5e1",fontSize:13,resize:"vertical",minHeight:130,fontFamily:"inherit",lineHeight:1.6}} />
          </div>
          <button onClick={evaluate} disabled={!answer.trim()||loadingEval}
            style={{background:!answer.trim()||loadingEval?"#1e293b":"linear-gradient(135deg,#22c55e,#16a34a)",color:!answer.trim()||loadingEval?"#475569":"white",border:"none",borderRadius:9,padding:"10px 22px",fontSize:13,fontWeight:700,cursor:!answer.trim()||loadingEval?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:8}}>
            {loadingEval ? <span style={{display:"flex",alignItems:"center",gap:8}}><Spinner /> Evaluating...</span> : "Submit for Feedback"}
          </button>
          {evalError && <div style={{marginTop:14}}><ErrorBox message={evalError} /></div>}
        </div>
      )}
      {evaluation && (
        <div style={{marginTop:22,animation:"fadeIn 0.4s ease"}}>
          <div style={{background:"#0f172a",border:"1px solid "+(vc[evaluation.verdict]||"#334155")+"33",borderRadius:12,padding:"18px 22px"}}>
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:(vc[evaluation.verdict]||"#334155")+"18",border:"2px solid "+(vc[evaluation.verdict]||"#334155"),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:20,fontWeight:800,color:vc[evaluation.verdict]||"#f1f5f9"}}>{evaluation.score}</span>
              </div>
              <div><div style={{fontSize:16,fontWeight:700,color:vc[evaluation.verdict]||"#f1f5f9"}}>{evaluation.verdict}</div><div style={{fontSize:11,color:"#475569"}}>{evaluation.score}/10</div></div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              {(evaluation.strengths||[]).length > 0 && <div><div style={{fontSize:10,color:"#22c55e",fontWeight:700,letterSpacing:"0.1em",marginBottom:8}}>STRENGTHS</div>{evaluation.strengths.map((s,i)=><div key={i} style={{color:"#cbd5e1",fontSize:12,marginBottom:6,lineHeight:1.5}}>check {s}</div>)}</div>}
              {(evaluation.gaps||[]).length > 0 && <div><div style={{fontSize:10,color:"#f59e0b",fontWeight:700,letterSpacing:"0.1em",marginBottom:8}}>GAPS</div>{evaluation.gaps.map((g,i)=><div key={i} style={{color:"#cbd5e1",fontSize:12,marginBottom:6,lineHeight:1.5}}>triangle {g}</div>)}</div>}
            </div>
            {(evaluation.ideal_points||[]).length > 0 && <div style={{marginBottom:16}}><div style={{fontSize:10,color:"#6366f1",fontWeight:700,letterSpacing:"0.1em",marginBottom:8}}>KEY POINTS TO HIT</div>{evaluation.ideal_points.map((p,i)=><div key={i} style={{color:"#cbd5e1",fontSize:12,marginBottom:6,lineHeight:1.5}}>bolt {p}</div>)}</div>}
            <button onClick={()=>setShowSample(s=>!s)} style={{background:"transparent",border:"1px solid #334155",color:"#64748b",borderRadius:6,padding:"7px 14px",fontSize:12,cursor:"pointer"}}>{showSample?"Hide":"Show"} model answer</button>
            {showSample && evaluation.sample_answer && <div style={{background:"#020817",borderRadius:8,padding:"14px 16px",color:"#94a3b8",fontSize:13,lineHeight:1.75,marginTop:10}}>{evaluation.sample_answer}</div>}
          </div>
          {evaluation.score >= 6 && <button onClick={getQuestion} style={{marginTop:12,background:"transparent",border:"1px solid #334155",color:"#64748b",borderRadius:8,padding:"8px 16px",fontSize:12,cursor:"pointer"}}>Next question on this topic</button>}
        </div>
      )}
    </div>
  );
}
function ChatView() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [messages]);
  const send = async (overrideInput) => {
    const text = (overrideInput || input).trim();
    if (!text || loading) return;
    setError(null);
    const userMsg = {role:"user", content:text};
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs); setInput(""); setLoading(true);
    try {
      const res = await fetch("/api/prep", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({type:"chat", messages:newMsgs}) });
      const d = await res.json();
      if (d.error) setError(d.error); else setMessages([...newMsgs, {role:"assistant", content:d.text}]);
    } catch(e) { setError(e.message); }
    setLoading(false);
  };
  const STARTERS = ["Explain Fellegi-Sunter entity resolution like I am in an interview","What is the difference between a data lake and data lakehouse?","Walk me through designing a feature store from scratch","What are the most common Spark pitfalls at scale?","How do I talk about my entity resolution work at Booz Allen?"];
  return (
    <div style={{display:"flex",flexDirection:"column",height:560}}>
      <div style={{flex:1,overflowY:"auto",paddingBottom:8}}>
        {messages.length === 0 && (
          <div style={{padding:"30px 0"}}>
            <div style={{textAlign:"center",marginBottom:24}}>
              <div style={{fontSize:32,marginBottom:10}}>brain</div>
              <div style={{color:"#475569",fontSize:14,fontWeight:600}}>ML/DE interview coach - ask anything</div>
              <div style={{color:"#334155",fontSize:12,marginTop:5}}>Explain concepts, work through problems, review your answers</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {STARTERS.map(q => (
                <button key={q} onClick={()=>send(q)} style={{background:"#0f172a",border:"1px solid #1e293b",color:"#64748b",borderRadius:8,padding:"10px 14px",fontSize:12,cursor:"pointer",textAlign:"left"}}>{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m,i) => (
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:14}}>
            <div style={{maxWidth:"85%",background:m.role==="user"?"linear-gradient(135deg,#6366f1,#8b5cf6)":"#0f172a",border:m.role==="assistant"?"1px solid #1e293b":"none",borderRadius:m.role==="user"?"12px 12px 4px 12px":"12px 12px 12px 4px",padding:"12px 16px",color:m.role==="user"?"white":"#cbd5e1",fontSize:13,lineHeight:1.7}}>
              <ContentRenderer text={m.content} />
            </div>
          </div>
        ))}
        {loading && <div style={{display:"flex",justifyContent:"flex-start",marginBottom:14}}><div style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:"12px 12px 12px 4px",padding:"14px 16px"}}><Spinner /></div></div>}
        {error && <div style={{marginBottom:10}}><ErrorBox message={error} /></div>}
        <div ref={bottomRef} />
      </div>
      <div style={{display:"flex",gap:10,paddingTop:12,borderTop:"1px solid #0f172a"}}>
        <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="Ask anything... (Enter to send, Shift+Enter for new line)" style={{flex:1,background:"#0f172a",border:"1px solid #1e293b",borderRadius:8,padding:"10px 14px",color:"#cbd5e1",fontSize:13,resize:"none",height:56,fontFamily:"inherit"}} />
        <button onClick={()=>send()} disabled={!input.trim()||loading} style={{background:!input.trim()||loading?"#1e293b":"#6366f1",color:!input.trim()||loading?"#475569":"white",border:"none",borderRadius:8,padding:"0 20px",fontSize:16,fontWeight:700,cursor:!input.trim()||loading?"not-allowed":"pointer"}}>arrow</button>
      </div>
    </div>
  );
}
function HistoryView() {
  const history = ls("vt-prep-history", []);
  const mastery = ls("vt-mastery", {});
  const vc = {Strong:"#22c55e",Good:"#86efac","Needs Work":"#f59e0b",Weak:"#ef4444"};
  if (!history.length) return <div style={{textAlign:"center",padding:"50px 0",color:"#475569",fontSize:14}}>No practice history yet. Answer some questions in Practice to start tracking.</div>;
  const avg = Math.round(history.reduce((a,h)=>a+h.score,0)/history.length);
  const weakTopics = Object.entries(mastery).filter(([,m])=>m.attempts>=2&&(m.scores.reduce((a,b)=>a+b,0)/m.scores.length)<6).map(([t])=>t);
  const strongTopics = Object.entries(mastery).filter(([,m])=>m.attempts>=3&&(m.scores.reduce((a,b)=>a+b,0)/m.scores.length)>=8).map(([t])=>t);
  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:22,flexWrap:"wrap"}}>
        {[["Sessions",history.length,"#6366f1"],["Avg Score",avg+"/10","#22c55e"],["Strong",history.filter(h=>h.verdict==="Strong").length,"#22c55e"],["Needs Work",history.filter(h=>["Needs Work","Weak"].includes(h.verdict)).length,"#f59e0b"]].map(([l,v,c])=>(
          <div key={l} style={{background:"#0f172a",border:"1px solid "+c+"22",borderRadius:10,padding:"10px 16px",textAlign:"center"}}>
            <div style={{fontSize:20,fontWeight:700,color:c}}>{v}</div>
            <div style={{fontSize:9,color:"#475569",fontWeight:600,letterSpacing:"0.05em",marginTop:2}}>{l.toUpperCase()}</div>
          </div>
        ))}
      </div>
      {weakTopics.length > 0 && <div style={{background:"#1a0f00",border:"1px solid #f59e0b33",borderRadius:10,padding:"14px 18px",marginBottom:16}}><div style={{fontSize:10,color:"#f59e0b",fontWeight:700,marginBottom:8}}>FOCUS ON THESE</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{weakTopics.map(t=><span key={t} style={{fontSize:12,background:"#f59e0b11",color:"#f59e0b",border:"1px solid #f59e0b33",borderRadius:5,padding:"3px 9px"}}>{t}</span>)}</div></div>}
      {strongTopics.length > 0 && <div style={{background:"#0a1a0a",border:"1px solid #22c55e33",borderRadius:10,padding:"14px 18px",marginBottom:20}}><div style={{fontSize:10,color:"#22c55e",fontWeight:700,marginBottom:8}}>MASTERED</div><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{strongTopics.map(t=><span key={t} style={{fontSize:12,background:"#22c55e11",color:"#22c55e",border:"1px solid #22c55e33",borderRadius:5,padding:"3px 9px"}}>{t}</span>)}</div></div>}
      <div style={{fontSize:11,color:"#475569",fontWeight:700,letterSpacing:"0.1em",marginBottom:12}}>RECENT SESSIONS</div>
      {history.map((h,i)=>(
        <div key={i} style={{background:"#0f172a",border:"1px solid #1e293b",borderRadius:10,padding:"12px 16px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div style={{flex:1,minWidth:0,marginRight:16}}><div style={{fontSize:13,color:"#f1f5f9",fontWeight:600,marginBottom:4,lineHeight:1.4}}>{h.question}</div><div style={{fontSize:11,color:"#475569"}}>{h.topic} - {new Date(h.date).toLocaleDateString()}</div></div>
          <div style={{textAlign:"right",flexShrink:0}}><div style={{fontSize:16,fontWeight:700,color:vc[h.verdict]||"#f1f5f9"}}>{h.score}/10</div><div style={{fontSize:10,color:vc[h.verdict]||"#64748b",fontWeight:600}}>{h.verdict}</div></div>
        </div>
      ))}
    </div>
  );
}
export default function InterviewPrep() {
  const [prepTab, setPrepTab] = useState("learn");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [expandedCat, setExpandedCat] = useState("ML Systems");
  const [completed, setCompleted] = useState(() => ls("vt-completed", []));
  const [mastery] = useState(() => ls("vt-mastery", {}));
  const toggleComplete = (topic) => { const u = completed.includes(topic)?completed.filter(t=>t!==topic):[...completed,topic]; setCompleted(u); lsSave("vt-completed",u); };
  const totalTopics = Object.values(TOPICS).flat().length;
  const tabs = [["learn","Learn"],["practice","Practice"],["chat","Ask Claude"],["history","History"]];
  return (
    <div>
      <div style={{borderBottom:"1px solid #0f172a",padding:"0 28px"}}>
        <div style={{maxWidth:920,margin:"0 auto",display:"flex",gap:2,alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex"}}>
            {tabs.map(([id,label])=>(
              <button key={id} onClick={()=>setPrepTab(id)} style={{background:"transparent",color:prepTab===id?"#f1f5f9":"#475569",border:"none",borderBottom:"2px solid "+(prepTab===id?"#8b5cf6":"transparent"),padding:"12px 16px",fontSize:13,fontWeight:prepTab===id?600:400,cursor:"pointer",transition:"all 0.2s"}}>{label}</button>
            ))}
          </div>
          <div style={{fontSize:11,color:"#334155",paddingRight:4}}>{completed.length}/{totalTopics} topics read</div>
        </div>
      </div>
      <div style={{maxWidth:920,margin:"0 auto",padding:"28px 24px"}}>
        <div style={{display:"grid",gridTemplateColumns:prepTab==="chat"||prepTab==="history"?"1fr":"230px 1fr",gap:28}}>
          {prepTab!=="chat"&&prepTab!=="history"&&(
            <div>
              <div style={{fontSize:11,color:"#475569",fontWeight:700,letterSpacing:"0.1em",marginBottom:14}}>TOPICS</div>
              {Object.entries(TOPICS).map(([cat,topics])=>{
                const catDone=topics.filter(t=>completed.includes(t)).length;
                const catWeak=topics.filter(t=>{const m=mastery[t];return m&&m.attempts>=2&&(m.scores.reduce((a,b)=>a+b,0)/m.scores.length)<6;}).length;
                return (
                  <div key={cat} style={{marginBottom:6}}>
                    <button onClick={()=>setExpandedCat(expandedCat===cat?null:cat)} style={{width:"100%",background:expandedCat===cat?"#1e293b":"transparent",border:"1px solid #1e293b",borderRadius:7,padding:"8px 12px",color:expandedCat===cat?"#f1f5f9":"#64748b",fontSize:12,fontWeight:600,cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span>{cat}</span>
                      <span style={{fontSize:10,color:"#334155"}}>{catWeak>0&&<span style={{color:"#f59e0b",marginRight:4}}>w{catWeak}</span>}{catDone}/{topics.length}</span>
                    </button>
                    {expandedCat===cat&&(
                      <div style={{marginTop:4,paddingLeft:4}}>
                        {topics.map(t=>{
                          const isDone=completed.includes(t);
                          const m=mastery[t];
                          const tAvg=m?.scores?.length?Math.round(m.scores.reduce((a,b)=>a+b,0)/m.scores.length):null;
                          const isWeak=tAvg!==null&&tAvg<6&&m.attempts>=2;
                          const isMastered=tAvg!==null&&tAvg>=8&&m.attempts>=3;
                          return (
                            <button key={t} onClick={()=>setSelectedTopic(t)} style={{width:"100%",background:selectedTopic===t?"#6366f122":"transparent",border:"1px solid "+(selectedTopic===t?"#6366f155":"transparent"),borderRadius:6,padding:"6px 10px",color:selectedTopic===t?"#818cf8":"#64748b",fontSize:11,cursor:"pointer",textAlign:"left",marginBottom:2,lineHeight:1.4,display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:4}}>
                              <span style={{flex:1}}>{t}</span>
                              <span style={{flexShrink:0,fontSize:10}}>{isMastered?"v":isWeak?"w":isDone?".":""}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div>
            {prepTab==="learn"&&<LearnView topic={selectedTopic} completed={completed} onToggleComplete={toggleComplete} />}
            {prepTab==="practice"&&<PracticeView topic={selectedTopic} />}
            {prepTab==="chat"&&<ChatView />}
            {prepTab==="history"&&<HistoryView />}
          </div>
        </div>
      </div>
    </div>
  );
}
