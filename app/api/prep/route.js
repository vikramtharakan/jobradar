import { NextResponse } from "next/server";

const CONTEXT = `The candidate is Vikram, a Senior ML/Data Engineer with 5+ years experience.
Skills: Python, Spark, Databricks, Kafka, NiFi, Elasticsearch, Neo4j, AWS, Docker, Hugging Face Transformers,
LLMs, NER, Entity Resolution, Deep Metric Learning, ETL pipelines, graph databases, NLP.
Background: large-scale data fusion, NLP pipelines, graph search, unstructured data.
Targeting: Senior ML Engineer or Senior Data Engineer roles at private sector product companies.
Style: Direct, technical, not patronizing. Senior-level depth. Real-world examples preferred.`;

function extractJSON(text) {
  // Try direct parse first
  try { return JSON.parse(text.trim()); } catch {}
  // Strip markdown fences
  const stripped = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  try { return JSON.parse(stripped); } catch {}
  // Find first { to last }
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch {}
  }
  return null;
}

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No API key configured" }, { status: 500 });

  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid request" }, { status: 400 }); }

  const { type, topic, userAnswer, question, messages } = body;

  // ── CHAT (handled separately, no JSON needed) ──────────────────────────────
  if (type === "chat") {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1500,
          system: `${CONTEXT}\nYou are an expert ML/DE interview coach. Be direct, technical, senior-level. Explain concepts clearly, work through problems step by step. Use code examples where helpful (use plain text code blocks with triple backticks).`,
          messages: messages || [{ role: "user", content: topic }]
        })
      });
      const d = await res.json();
      if (d.error) return NextResponse.json({ error: d.error.message }, { status: 500 });
      const text = d.content?.map(i => i.text || "").join("") || "";
      return NextResponse.json({ text });
    } catch (e) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  // ── STRUCTURED JSON RESPONSES ──────────────────────────────────────────────
  let prompt = "";

  if (type === "learn") {
    prompt = `${CONTEXT}

Generate a focused, senior-level learning session on this topic: "${topic}"

You MUST respond with ONLY valid JSON. No markdown, no preamble, no explanation outside the JSON.

{
  "title": "exact topic name",
  "tldr": "2-3 sentence executive summary of what this is and why it matters",
  "sections": [
    {
      "heading": "Core Concepts",
      "content": "Detailed explanation, 150-200 words. Senior-level depth. Include specifics, not generalities."
    },
    {
      "heading": "How It Works in Practice",
      "content": "Real-world application. Include a short code snippet or pseudocode if relevant, using plain backticks."
    },
    {
      "heading": "Common Interview Angles",
      "content": "How this topic typically appears in senior ML/DE interviews. What they actually ask. What traps people."
    }
  ],
  "key_facts": [
    "Specific memorable fact 1",
    "Specific memorable fact 2",
    "Specific memorable fact 3"
  ],
  "follow_up_topics": [
    "Related topic 1",
    "Related topic 2",
    "Related topic 3"
  ]
}`;

  } else if (type === "question") {
    const qtype = question?.qtype || "technical";
    prompt = `${CONTEXT}

Generate one senior-level interview question about: "${topic}"
Question type: ${qtype}

You MUST respond with ONLY valid JSON. No markdown, no preamble.

{
  "question": "The full interview question text",
  "context": "1-2 sentences on why interviewers ask this and what they are probing for",
  "what_they_want": "What a strong senior-level answer looks like",
  "hints": ["Hint 1 if stuck", "Hint 2 if stuck"],
  "qtype": "${qtype}"
}`;

  } else if (type === "evaluate") {
    prompt = `${CONTEXT}

Interview question: "${question}"
Candidate answer: "${userAnswer}"

Evaluate this as a senior hiring manager would. Be honest and specific.

You MUST respond with ONLY valid JSON. No markdown, no preamble.

{
  "score": 7,
  "verdict": "Good",
  "strengths": ["Specific strength 1", "Specific strength 2"],
  "gaps": ["Specific gap or missed point"],
  "ideal_points": ["Key point that should have been mentioned 1", "Key point 2", "Key point 3"],
  "sample_answer": "A strong 3-5 sentence model answer to this question"
}

verdict must be one of: Strong, Good, Needs Work, Weak`;

  } else {
    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await res.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });

    const text = data.content?.map(i => i.text || "").join("") || "";
    const parsed = extractJSON(text);

    if (!parsed) {
      console.error("JSON parse failed. Raw response:", text.slice(0, 500));
      return NextResponse.json({ error: "Failed to parse response", raw: text.slice(0, 200) }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
