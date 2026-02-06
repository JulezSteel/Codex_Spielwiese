# 2050 Future Scenario Engine

A production-ready MVP built with Next.js 14, Tailwind CSS, and shadcn/ui-inspired components. The app lets users calibrate seven axes of a 2050 scenario, generates a narrative via an LLM, and produces audio via ElevenLabs TTS.

## Features
- Three-step flow: Intro → Calibrate → Results.
- Seven calibrated axes with live values and language toggle (EN/DE).
- LLM narrative generation with OpenAI or Gemini, plus a mock fallback.
- ElevenLabs TTS audio generation with a built-in audio player.
- LocalStorage persistence and shareable query-string links.

## Local Development
```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Environment Variables
Create a `.env.local` file:
```
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
GEMINI_API_KEY=...
ELEVENLABS_API_KEY=...
ELEVENLABS_VOICE_ID=...
```

### Notes
- `OPENAI_MODEL` is optional; defaults to `gpt-4o-mini`.
- If no OpenAI/Gemini keys are present, the app uses a deterministic mock narrative.
- `ELEVENLABS_API_KEY` is required for audio; if missing, the UI shows “TTS unavailable”.

## Vercel Deployment
1. Push the repository to GitHub.
2. Create a new Vercel project and import the repo.
3. Add the environment variables above in **Project Settings → Environment Variables**.
4. Deploy. The app runs on the default Next.js build command.

## Costs & Rate Limits
- OpenAI and Gemini APIs are billed per token; use the mock provider for demos without cost.
- ElevenLabs TTS is billed per character; audio length is truncated server-side to protect limits.
- Consider adding rate limiting or caching if exposing the app publicly.

## Guardrails
- Inputs are clamped to expected ranges.
- The LLM prompt enforces 180–280 words and a fixed bullet list.
- TTS truncation preserves sentence boundaries where possible.
