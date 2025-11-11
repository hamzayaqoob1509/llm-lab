## LLM Lab

A polished, full-stack Next.js app to explore how LLM parameters like `temperature` and `top_p` affect outputs. Generate multiple responses across parameter grids, evaluate custom, programmatic quality metrics, compare results, and export experiments.

### Tech Stack
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- Backend: Next.js API routes, Prisma (SQLite)
- Metrics: custom heuristics (readability, coverage, structure, redundancy, coherence, length)
- LLM: OpenAI (with mock fallback if no API key)

### Getting Started
1. Install:
   ```bash
   npm install
   ```
2. Configure env:
   - Create `.env` with:
     ```
     DATABASE_URL="file:./dev.db"
     OPENAI_API_KEY= # optional; app uses mock if not set
     ```
3. Setup DB:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
4. Run:
   ```bash
   npm run dev
   ```

### Architecture
- `src/app/api/experiments`:
  - `POST /api/experiments`: creates an experiment, runs grid generation, computes metrics, persists
  - `GET /api/experiments`: list experiments
  - `GET /api/experiments/[id]`: fetch details
  - `GET /api/experiments/[id]/export`: download full JSON
- `src/lib/llmProvider.ts`: OpenAI client + deterministic mock fallback
- `src/lib/metrics.ts`: quality metrics (no additional LLM calls)
- `prisma/schema.prisma`: `Experiment`, `Response`, `Metrics`

### Metrics (0..1)
- Readability: normalized Flesch Reading Ease
- Coverage: prompt keyword coverage ratio
- Structure: headings/lists/code/paragraphs presence
- Redundancy: penalizes repeated bigrams
- Coherence: discourse markers + sentence length variability
- Length: distance from inferred target word count
- Aggregate: weighted blend

### Export
Use the Export button on an experiment page to download JSON for offline analysis.

### Deployment
Deploy on Vercel using Neon (Postgres):
1) Create a Neon Postgres database and copy the connection string into `DATABASE_URL`.
2) In Vercel Project Settings → Environment Variables, set:
   - `DATABASE_URL` = your Neon connection string
   - `OPENAI_API_KEY` (optional)
3) The app uses Prisma WASM engine for portability. Build runs `prisma migrate deploy` automatically.
4) Push your repo and deploy. API routes run in Node runtime.

### Time Estimates
See `time-estimates.csv` for initial vs. actual tracked time.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
