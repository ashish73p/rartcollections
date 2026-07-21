<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1dqZUqPYomGqgVhkzupNnvNuxrnCj0Q0H

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` and set your Gemini API key:
   `cp .env.example .env.local` (then edit `GEMINI_API_KEY`)
3. Run the app:
   `npm run dev`

## Security note: the Gemini API key is exposed to the browser

This is a client-side-only app. `vite.config.ts` inlines `GEMINI_API_KEY` into the
JavaScript bundle at build time (`define: { 'process.env.API_KEY': ... }`), and
`services/geminiService.ts` calls the Gemini API directly from the browser. That means
**anyone who loads a deployed build can read your API key** from the shipped JS or the
network requests. A build-time env var is NOT a secret on the client.

Do not ship a real key in a public deployment. To use Gemini safely in production, move
the call server-side: create a small backend/serverless proxy that holds the key and
forwards requests, and have the frontend call that proxy instead of embedding the key.

Never commit `.env.local` (it is git-ignored). Rotate any key that has already been
built into a public bundle.
