import { NextResponse } from "next/server";

const RESUME = `Senior ML/Data Engineer, 5+ years experience.
Skills: Python, Java, Scala, SQL, Apache Spark, Databricks, Apache NiFi, Kafka, AWS, Docker, Kubernetes,
Elasticsearch, Neo4j, JanusGraph, Redis, Hugging Face Transformers, Scikit-Learn, Keras/TensorFlow, LLMs,
NER, Entity Resolution (Fellegi-Sunter), Deep Metric Learning, ETL pipelines, geospatial ML.
Background: Large-scale data fusion platforms, NLP pipelines, graph databases, unstructured data at scale.
Current: ML Engineer at Booz Allen Hamilton (actively leaving government/defense sector).
Previous: Deep Learning Engineer at MITRE.
Education: B.S. Physics, UCSB. TS/SCI clearance (not using it).
Location: NYC. Wants: Remote-first. Hybrid only if exceptional fit + $200K+.
Target: Senior ML Engineer or Senior Data Engineer. Full-time only.
Salary floor: $200K base. Ideal: $225K+.
Open to: ANY industry except government contracting. Any stage.
Preference: Private sector, product companies, startups welcome.`;

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No API key" }, { status: 500 });

  const { job, signals } = await req.json();
  const tags = Array.isArray(job.tags) ? job.tags : (job.tags || "").split(",").map(t => t.trim()).filter(Boolean);

  let signalsBlock = "";
  if (signals && (signals.liked.length || signals.passed.length)) {
    signalsBlock = `\nLearned preferences from candidate's past ratings:
Liked jobs: ${signals.liked.map(j => `${j.title} at ${j.company} (${j.tags?.join(", ")})`).join("; ") || "none yet"}
Passed jobs: ${signals.passed.map(j => `${j.title} at ${j.company} — reason: ${j.reason || "not given"}`).join("; ") || "none yet"}
Adjust score based on these patterns.`;
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 800,
      messages: [{ role: "user", content: `Job-fit analyzer. Return ONLY valid JSON, no markdown.

Candidate: ${RESUME}
${signalsBlock}

Job:
Title: ${job.title}, Company: ${job.company} (${job.industry}, ${job.stage})
Salary: ${job.salary}, Remote: ${job.remote}, Tags: ${tags.join(", ")}
Description: ${job.description}

Rules: gov/defense → cap at 40, gov_flag=true. Private product co → boost. NLP/graph/LLMs/Spark/ES/ETL → boost. Salary <$200K → cap at 65. Remote → positive. Consulting model → mild negative.

Return: {"score":<0-100>,"verdict":"<Strong Match|Good Match|Partial Match|Weak Match>","reasons":["r1","r2","r3"],"gaps":["gap or empty"],"one_liner":"<punchy sentence>","gov_flag":<true|false>}` }]
    })
  });
  const data = await res.json();
  const text = data.content?.map(i => i.text || "").join("") || "{}";
  return NextResponse.json(JSON.parse(text.replace(/```json|```/g, "").trim()));
}
