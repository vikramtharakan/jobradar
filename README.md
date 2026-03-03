# JobRadar ⚡

Job scanner, application tracker, and ML/DE interview prep — all in one.

---

## Step 1: Get your Anthropic API key
- Go to https://console.anthropic.com
- Sign up / log in → API Keys → Create Key
- Copy it (starts with sk-ant-...) — you only see it once, save it somewhere

---

## Step 2: Create a GitHub repo
- Go to https://github.com and sign in (create a free account if needed)
- Click the + icon top right → New repository
- Name it exactly: jobradar
- Leave it Public, don't add a README
- Click Create repository

---

## Step 3: Set up the project files
Unzip the jobradar.zip file you downloaded.
You should now have a folder called jobradar2 — rename it to jobradar.

Open Terminal (Mac: Spotlight → Terminal) and run these commands one at a time:

  cd ~/Desktop/jobradar

(adjust the path if you put it somewhere other than Desktop)

  cp .env.local.example .env.local

Open .env.local in any text editor and replace your_key_here with your actual API key.

---

## Step 4: Push to GitHub

Run these commands in Terminal, one at a time:

  git init
  git add .
  git commit -m "initial commit"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/jobradar.git
  git push -u origin main

Replace YOUR_USERNAME with your actual GitHub username.
GitHub will ask for your username and password — for the password, use a Personal Access Token, not your GitHub password:
- Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token
- Check the "repo" scope → Generate → copy the token
- Paste it as your password when prompted

---

## Step 5: Deploy on Vercel

- Go to https://vercel.com
- Click Sign Up → Continue with GitHub → authorize it
- Click Add New Project
- Find your jobradar repo and click Import
- IMPORTANT: Before clicking Deploy, scroll down to Environment Variables and add:
    Name:  ANTHROPIC_API_KEY
    Value: sk-ant-xxxxxxxxxx  (your actual key)
- Click Deploy

Vercel builds it (~60 seconds) and gives you a URL like:
  jobradar-yourname.vercel.app

Bookmark that. That's your daily tool.

---

## How to use it

Job Search tab:
1. Hit "Scan & Score Jobs" to score all listings against your resume
2. 👍 or 👎 jobs — Smart Picks learns your preferences over time
3. When you 👎 a job, pick your reasons — this tunes the algorithm
4. Use "+ Add Job" to paste in any real listings you find on job boards
5. Track applications and update statuses as things progress

Interview Prep tab:
1. Learn — pick a topic, get a tailored senior-level lesson
2. Practice — generate questions, write your answer, get evaluated
3. Ask Claude — free-form coaching, explain concepts, work through problems
4. History — track your practice scores over time

---

## Redeploying after any updates

If you get updated code files, replace the relevant files in your jobradar folder, then:

  git add .
  git commit -m "update"
  git push

Vercel auto-deploys within ~30 seconds.
