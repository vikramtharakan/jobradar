import { NextResponse } from "next/server";

export async function POST(req) {
  const { job, signals } = await req.json();
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ score: 0, verdict: "Error", reasons: [], gaps: [], one_liner: "ANTHROPIC_API_KEY not set.", gov_flag: false });

  const govKeywords = ["clearance", "secret", "top secret", "dod", "department of defense", "intelligence", "cia", "nsa", "dhs", "federal agency", "booz allen", "leidos", "saic", "mitre", "raytheon"];
  const gov_flag = govKeywords.some(k => (job.title + " " + job.company + " " + job.description).toLowerCase().includes(k));

  const likedSummary = signals?.liked?.length
    ? signals.liked.map(j => `- ${j.title} at ${j.company} (tags: ${j.tags?.join(", ")})`).join("\n")
    : "None yet";
  const passedSummary = signals?.passed?.length
    ? signals.passed.map(j => `- ${j.title} at ${j.company} (reason: ${j.reason})`).join("\n")
    : "None yet";

  const prompt = `You are scoring a job listing for a senior ML/Data Engineer with the following profile:

CANDIDATE PROFILE:
- ~6 years experience: Deep Learning Engineer at MITRE, then ML/AI Engineer L3 at Booz Allen Hamilton
- Core stack: Python, Databricks, Spark, Kafka, NLP, AWS, Neo4j/JanusGraph, Elasticsearch, NiFi
- Specialized in: probabilistic entity resolution (Splink, Fellegi-Sunter), large-scale data pipelines, graph databases, ML infrastructure
- Background leans FDE (forward deployed engineering) — delivered solutions directly to clients, rapid prototyping, messy real-world data
- Learning: MLOps, RAG systems, LLM fine-tuning (not yet expert level)
- HARD REQUIREMENT: Total compensation must be $180,000+ (currently earning ~$200K). Any role clearly paying under $180K is a dealbreaker.
- HARD REQUIREMENT: Remote only. No relocation.
- HARD REQUIREMENT: Private sector only. No government contractors.

LIKED JOBS (what the candidate responded well to):
${likedSummary}

PASSED JOBS (what the candidate rejected):
${passedSummary}

JOB TO SCORE:
Title: ${job.title}
Company: ${job.company}
Salary: ${job.salary || "Not listed"}
Tags: ${Array.isArray(job.tags) ? job.tags.join(", ") : job.tags}
Description: ${job.description?.slice(0, 600)}
Gov flag: ${gov_flag}

SCORING RULES:
- If salary is clearly listed and under $180K: score must be 0-20, verdict "Weak Match", one_liner must mention the salary issue
- If gov contractor or requires clearance: score 0-30, gov_flag true
- If missing core stack entirely (no Python, no data engineering, no ML): score 0-40
- Strong Match (80-100): excellent salary, remote, strong stack overlap, private sector tech company
- Good Match (65-79): good fit with minor gaps
- Partial Match (40-64): relevant but missing key requirements
- Weak Match (0-39): dealbreakers present

Respond ONLY with valid JSON, no markdown:
{
  "score": <0-100>,
  "verdict": "<Strong Match|Good Match|Partial Match|Weak Match>",
  "reasons": ["<why it fits, 2-3 points>"],
  "gaps": ["<what's missing or concerning, 1-3 points>"],
  "one_liner": "<one punchy sentence summarizing fit>",
  "gov_flag": <true|false>
}`;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || "{}";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    return NextResponse.json({ ...parsed, gov_flag: parsed.gov_flag || gov_flag });
  } catch (e) {
    return NextResponse.json({ score: 0, verdict: "Error", reasons: [], gaps: [], one_liner: "Scoring failed: " + e.message, gov_flag });
  }
}
