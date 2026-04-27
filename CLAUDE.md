# VisionRubric

> Image-aesthetic SFT / DPO data tool. Distill a vague visual vibe into a 5-dimension rubric, score images with AI and human side by side, surface disagreement, and export training-ready JSONL.

See parent workspace `../CLAUDE.md` for shared context, glossary, and house style (no em dashes, etc.). See `../DESIGN.md` for the workspace design language.

## Why this exists

Most "AI judge" tools either hardcode a vibe and just emit scores, or collect raw human preferences with no structure. Neither is what someone actually fine-tuning a vision model needs. VisionRubric makes the rubric itself a first-class, editable artifact, then runs AI and human scores against it side by side. Any dimension where the two diverge by 1 star or more gets ringed in red. That divergence is the signal: it tells you which line of the rubric is still ambiguous and needs to be rewritten. Disagreement is the product, not noise.

## Pipeline

```
1. User describes the target aesthetic in natural language (+ optional reference captions)
2. /api/extract-anchor (text)                 → 5-dim rubric anchor (composition / color / light / subject / mood)
3a. Single-score path:  upload image → /api/score-image (vision)   → AI scores + human calibration → SFT JSONL
3b. Pairwise path:      upload A & B → /api/compare-images (vision) → AI winner + human pick      → DPO JSONL
4. Disagreement view: any dim where AI and human differ by ≥ 1 star is ringed red, prompting rubric revision
5. Export approved samples as JSONL (multimodal-message schema for SFT, prompt/chosen/rejected for DPO)
```

## File layout

```
app/
├── layout.tsx                       root layout, loads globals.css
├── page.tsx                         single-page UI, all 3 steps + state machine
├── globals.css                      tailwind directives + body bg #FAFAF7
└── api/
    ├── extract-anchor/route.ts      rubric extraction, text-only, configurable endpoint
    ├── score-image/route.ts         5-dim scoring, vision, max_tokens 1024 (GLM-4V-Flash cap)
    └── compare-images/route.ts      pairwise A/B, vision, max_tokens 1024
```

## Tech notes

- **Two LLM endpoints, on purpose.** A text endpoint for rubric extraction (defaults to DeepSeek, fully overridable via `TEXT_*` env vars), and a separate vision endpoint for image work (defaults to OpenAI gpt-4o-mini, swappable to Qwen-VL / GLM-4V / internal proxies via `VISION_*` env vars).
- **Client-side base64**, no server uploads. The browser turns each File into `data:image/...;base64,...` and ships it inline in the request body. No storage, no S3, no leaks. Acceptable for demo scale (≤ 20 images / session).
- All LLM calls live server-side in `app/api/*/route.ts`. Never call from client.
- Page is a client component (`'use client'`). State machine: `step` is implicit via `if (rubric)` and per-sample `aiScore` gates.
- Bilingual zh/en toggle, sticky top-right, persists by re-rendering. UI strings 中文 first.
- Sample-fill buttons (text + image) under every user-input region, so reviewers can run the full pipeline end-to-end without typing or uploading.

## Prompt design notes

- The 5 dimensions (composition / color / light / subject / mood) are **fixed keys**, not LLM-discoverable. This keeps the export schema and the disagreement detector aligned on a known shape, and matches the lens that survives across portrait / landscape / product / lifestyle scenes.
- Each dimension has `ideal`, `five_star`, `one_star` anchors, so the scoring model has a calibrated reference instead of a vague Likert scale.
- The extraction prompt explicitly forbids self-contradictory adjective stacks (e.g. "清晰杂乱"); GLM-4-class models will otherwise produce them when asked for compact one-line anchors.
- `response_format: { type: 'json_object' }` is intentionally NOT set: GLM-4V-Flash and several other vision endpoints reject it. Both routes parse JSON defensively (markdown fence strip + first-balanced-object regex fallback).
- `antipatterns` is the rubric's "what we explicitly don't want" list, also surfaced in scoring prompts.

## Vision endpoint quirks (GLM-4V-Flash)

- `max_tokens` is capped at **1024** server-side. Anything higher returns `{"error":{"code":"1210","message":"API 调用参数有误"}}`.
- `response_format` is rejected outright (same 1210 error).
- Free tier, no rate-limit advertised, OpenAI-compatible at `https://open.bigmodel.cn/api/paas/v4`.
- Quality is acceptable for structured JSON scoring; descriptive free-text can degenerate into repetition loops if `max_tokens` is high.

## Export schema

### SFT (single-score mode)
Multimodal-messages format that Hugging Face TRL, Unsloth, and OpenAI fine-tuning all accept:
```json
{"messages": [
  {"role":"user","content":[
    {"type":"text","text":"<rubric prompt>"},
    {"type":"image_url","image_url":{"url":"data:image/jpeg;base64,..."}}
  ]},
  {"role":"assistant","content":"{\"scores\":{\"composition\":4.0,...},\"overall\":4.2,\"critique\":\"...\"}"}
]}
```

### DPO (pairwise mode)
Standard prompt / chosen / rejected triple:
```json
{"prompt":   {"role":"user","content":[<rubric>, image A, image B]},
 "chosen":   [{"role":"assistant","content":"{...winner:A...}"}],
 "rejected": [{"role":"assistant","content":"{...winner:B...}"}]}
```

## Iteration ideas (not yet built)

- **Inter-rater reliability dashboard**: Cohen's kappa between AI and human across N samples
- **Auto-rubric-edit suggestion**: when divergence on a dim repeats > k times, propose a prompt rewrite for that dim's anchor
- **Reference-image upload for the rubric step**: extract the anchor from sample images instead of just text
- **Style mixing**: blend two rubrics (e.g., 70% morning film + 30% editorial)
- **Critique consistency check**: separate LLM call grades whether the critique actually justifies the scores

## Run

```bash
npm install
cp .env.example .env.local
# fill in DEEPSEEK_API_KEY and VISION_API_KEY in .env.local
npm run dev
# http://localhost:3002
```
