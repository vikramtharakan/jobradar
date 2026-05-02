import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return NextResponse.json({ error: "RAPIDAPI_KEY not configured in Vercel environment variables." }, { status: 500 });

  // Balanced queries: DE, ML, FDE/hybrid, big tech — 1 page each = 5 API calls/rescan
  const queries = [
    "senior data engineer remote Python Spark Databricks",
    "senior data engineer remote Kafka streaming AWS",
    "senior machine learning engineer remote Python NLP",
    "forward deployed engineer remote data ML",
    "senior ML engineer data platform remote fintech startup",
  ];

  const allJobs = [];
  const seen = new Set();
  const errors = [];

  // Companies to exclude
  const blockedCompanies = ["capital one", "booz allen", "leidos", "saic", "mitre corporation", "raytheon", "general dynamics", "northrop grumman", "l3harris", "caci"];

  const govKeywords = ["clearance required","secret clearance","top secret","dod","department of defense","intelligence community","cia","nsa","dhs","federal agency"];
  const techKeywords = ["Python","Spark","Kafka","NLP","LLM","Transformers","PyTorch","TensorFlow","Elasticsearch","AWS","GCP","Azure","Databricks","Kubernetes","Docker","dbt","Airflow","Flink","Neo4j","NER","MLOps","Hugging Face","RAG","Snowflake","Scala","Redis","Pinecone","Trino","Iceberg","Redshift","BigQuery","FastAPI","Pydantic","Pandas","NumPy"];
  const skipTitles = ["intern","junior","jr.","associate engineer","manager","director","vp ","vice president","recruiter","sales","marketing","designer","product manager","analyst"];

  for (const q of queries) {
    try {
      const url = new URL("https://jsearch.p.rapidapi.com/search");
      url.searchParams.set("query", q);
      url.searchParams.set("page", "1");
      url.searchParams.set("num_pages", "1");
      url.searchParams.set("date_posted", "month");
      url.searchParams.set("remote_jobs_only", "true");

      const res = await fetch(url.toString(), {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      });

      const data = await res.json();
      if (data.message) { errors.push(data.message); continue; }
      if (!data.data?.length) continue;

      for (const j of data.data) {
        if (seen.has(j.job_id)) continue;
        seen.add(j.job_id);

        const applyUrl = j.job_apply_link || j.job_google_link;
        if (!applyUrl) continue;

        const titleLower = (j.job_title || "").toLowerCase();
        const descLower = (j.job_description || "").toLowerCase();
        const companyLower = (j.employer_name || "").toLowerCase();
        const fullText = titleLower + " " + descLower + " " + companyLower;

        // Skip blocked companies
        if (blockedCompanies.some(c => companyLower.includes(c))) continue;

        // Skip irrelevant titles
        if (skipTitles.some(s => titleLower.includes(s))) continue;

        // Flag gov roles (don't skip — let scorer penalize)
        const isGov = govKeywords.some(k => fullText.includes(k));

        // Salary
        let salary = "Not listed";
        if (j.job_min_salary && j.job_max_salary) {
          const fmt = v => `$${Math.round(v / 1000)}K`;
          salary = `${fmt(j.job_min_salary)}–${fmt(j.job_max_salary)}`;
        } else if (j.job_min_salary) {
          salary = `$${Math.round(j.job_min_salary / 1000)}K+`;
        }

        // Role type label
        const isDE = titleLower.includes("data engineer") || ["spark","kafka","dbt","airflow","databricks","etl","pipeline"].some(k => fullText.includes(k));
        const isML = titleLower.includes("machine learning") || titleLower.includes("ml engineer") || ["pytorch","tensorflow","llm","nlp","model training"].some(k => fullText.includes(k));
        const isFDE = titleLower.includes("forward deployed") || titleLower.includes("solutions engineer") || titleLower.includes("field engineer");
        const roleType = isFDE ? "FDE / Applied Eng" : isDE && isML ? "DE + ML" : isDE ? "Data Eng" : isML ? "ML Eng" : "Engineer";

        const tags = techKeywords.filter(k => fullText.includes(k.toLowerCase())).slice(0, 7);
        if (!tags.length) tags.push("Python", "SQL");

        let posted = "";
        if (j.job_posted_at_datetime_utc) {
          const days = Math.floor((Date.now() - new Date(j.job_posted_at_datetime_utc)) / 86400000);
          posted = days === 0 ? "Today" : days === 1 ? "1d ago" : `${days}d ago`;
        }

        allJobs.push({
          id: j.job_id,
          title: j.job_title || "Engineer",
          company: j.employer_name || "Unknown",
          board: j.job_publisher || "Job Board",
          url: applyUrl,
          salary,
          remote: true,
          tags,
          description: (j.job_description || "").replace(/\s+/g, " ").trim().slice(0, 500),
          industry: roleType,
          stage: "",
          gov_flag: isGov,
          posted,
        });
      }
    } catch (e) {
      errors.push(`Fetch error: ${e.message}`);
    }
  }

  // Dedupe by company+title
  const deduped = [];
  const seen2 = new Set();
  for (const j of allJobs) {
    const key = `${j.company.toLowerCase()}::${j.title.toLowerCase()}`;
    if (!seen2.has(key)) { seen2.add(key); deduped.push(j); }
  }

  if (!deduped.length) {
    return NextResponse.json({
      jobs: [],
      error: errors.length ? errors.join("; ") : "No jobs returned — you may have hit the RapidAPI free tier limit (200 req/month).",
      errors,
    });
  }

  return NextResponse.json({ jobs: deduped, fetchedAt: new Date().toISOString() });
}
