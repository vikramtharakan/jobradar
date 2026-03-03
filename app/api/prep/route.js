import { NextResponse } from "next/server";

const CONTEXT = `The candidate is Vikram, a Senior ML/Data Engineer with 5+ years experience.
Skills: Python, Spark, Databricks, Kafka, NiFi, Elasticsearch, Neo4j, AWS, Docker, Hugging Face Transformers,
LLMs, NER, Entity Resolution, Deep Metric Learning, ETL pipelines, graph databases, NLP.
Background: large-scale data fusion, NLP pipelines, graph search, unstructured data.
Targeting: Senior ML Engineer or Senior Data Engineer roles at private sector product companies.
Style: Direct, technical, not patronizing. Senior-level depth. Real-world examples preferred.`;

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No API key" }, { status: 500 });

  const { type, topic, userAnswer, question, messages } = await req.json();

  let prompt = "";

  if (type === "learn") {
    prompt = `${CONTEXT}

Generate a focused learning session on: "${topic}"

Format your response as JSON:
{
  "title": "<topic title>",
  "tldr": "<2-3 sentence executive summary>",
  "sections": [
    {"heading": "<section title>", "content": "<explanation, 150-250 words, senior-level depth>"},
    {"heading": "<section title>", "content": "<include code snippets in backticks where relevant>"},
    {"heading": "Common Interview Angles", "content": "<how this topic shows up in senior ML/DE interviews>"}
  ],
  "key_facts": ["<memorable fact 1>", "<memorable fact 2>", "<memorable fact 3>"],
  "follow_up_topics": ["<related topic 1>", "<related topic 2>", "<related topic 3>"]
}`;
  } else if (type === "question") {
    prompt = `${CONTEXT}

Generate a single senior-level interview question for topic: "${topic}"
Type: ${question?.qtype || "technical"}

Return JSON:
{
  "question": "<the question>",
  "context": "<1-2 sentences on why interviewers ask this>",
  "what_they_want": "<what a strong answer looks like>",
  "hints": ["<hint 1>", "<hint 2>"],
  "qtype": "${question?.qtype || "technical"}"
}`;
  } else if (type === "evaluate") {
    prompt = `${CONTEXT}

Question asked: "${question}"
Candidate's answer: "${userAnswer}"

Evaluate this answer as a senior interviewer would. Return JSON:
{
  "score": <0-10>,
  "verdict": "<Strong|Good|Needs Work|Weak>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "gaps": ["<gap 1>"],
  "ideal_points": ["<key point that should have been mentioned 1>", "<key point 2>", "<key point 3>"],
  "sample_answer": "<a strong 3-5 sentence answer to this question>"
}`;
  } else if (type === "chat") {
    // Free-form chat with history
    const res2 = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514", max_tokens: 1000,
        system: `${CONTEXT}\nYou are an expert ML/DE interview coach. Be direct, technical, and senior-level. Answer questions, explain concepts, work through problems. When writing code use proper formatting.`,
        messages: messages || [{ role: "user", content: topic }]
      })
    });
    const d = await res2.json();
    const text = d.content?.map(i => i.text || "").join("") || "";
    return NextResponse.json({ text });
  }

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 1200,
      messages: [{ role: "user", content: prompt }]
    })
  });
  const data = await res.json();
  const text = data.content?.map(i => i.text || "").join("") || "{}";
  try {
    return NextResponse.json(JSON.parse(text.replace(/```json|```/g, "").trim()));
  } catch {
    return NextResponse.json({ error: "Parse failed", raw: text });
  }
}
