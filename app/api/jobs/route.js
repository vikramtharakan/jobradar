import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return NextResponse.json({ error: "RAPIDAPI_KEY not configured in Vercel environment variables." }, { status: 500 });

  const queries = [
    "senior machine learning engineer NLP remote",
    "senior data engineer Spark Kafka remote",
    "senior ML engineer LLM Python remote",
  ];

  const allJobs = [];
  const seen = new Set();

  const govKeywords = ["clearance", "secret clearance", "dod", "department of defense", "federal government", "booz allen", "leidos", "saic", "mitre", "intelligence community", "cia", "nsa", "dhs"];
  const techKeywords = ["Python","Spark","Kafka","NLP","LLM","Transformers","PyTorch","TensorFlow","Elasticsearch","AWS","Databricks","Kubernetes","Docker","dbt","Airflow","Flink","Neo4j","Graph","NER","MLOps","Hugging Face","RAG","Vector","Snowflake","Scala","Java","Redis","Pinecone"];

  for (const q of queries) {
    try {
      const url = new URL("https://jsearch.p.rapidapi.com/search");
      url.searchParams.set("query", q);
      url.searchParams.set("page", "1");
      url.searchParams.set("num_pages", "2");
      url.searchParams.set("date_posted", "month");
      url.searchParams.set("remote_jobs_only", "true");

      const res = await fetch(url.toString(), {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      });

      const data = await res.json();
      if (data.message) {
        console.error("JSearch error:", data.message);
        continue;
      }
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

        const isGov = govKeywords.some(k => fullText.includes(k));

        // Salary
        let salary = "Not listed";
        if (j.job_min_salary && j.job_max_salary) {
          const fmt = v => v >= 1000 ? `$${Math.round(v / 1000)}K` : `$${v}`;
          salary = `${fmt(j.job_min_salary)}–${fmt(j.job_max_salary)}`;
        } else if (j.job_salary_currency === "USD" && j.job_min_salary) {
          salary = `$${Math.round(j.job_min_salary / 1000)}K+`;
        }

        const tags = techKeywords.filter(k => fullText.includes(k.toLowerCase())).slice(0, 7);
        if (!tags.length) tags.push("ML", "Python");

        // Clean description
        const desc = (j.job_description || "")
          .replace(/\n+/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 500);

        // Posted date
        let posted = "";
        if (j.job_posted_at_datetime_utc) {
          const d = new Date(j.job_posted_at_datetime_utc);
          const days = Math.floor((Date.now() - d) / 86400000);
          posted = days === 0 ? "Today" : days === 1 ? "1 day ago" : `${days} days ago`;
        }

        allJobs.push({
          id: j.job_id,
          title: j.job_title || "ML Engineer",
          company: j.employer_name || "Unknown",
          board: j.job_publisher || "Job Board",
          url: applyUrl,
          salary,
          remote: true,
          tags,
          description: desc,
          industry: "",
          stage: "",
          gov_flag: isGov,
          posted,
        });
      }
    } catch (e) {
      console.error("JSearch fetch error:", q, e.message);
    }
  }

  // Dedupe by company+title in case same job appears across queries
  const deduped = [];
  const titleCompany = new Set();
  for (const j of allJobs) {
    const key = `${j.company.toLowerCase()}::${j.title.toLowerCase()}`;
    if (!titleCompany.has(key)) {
      titleCompany.add(key);
      deduped.push(j);
    }
  }

  return NextResponse.json({ jobs: deduped.slice(0, 25), fetchedAt: new Date().toISOString() });
}
