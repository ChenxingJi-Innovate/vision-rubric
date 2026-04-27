# VisionRubric

Image-aesthetic SFT / DPO data tool. Distill a vague visual vibe into a calibrated 5-dimension rubric, score with AI and human side by side, and export training-ready JSONL.

```
Vibe (text)  →  5-dim rubric  →  AI + human dual-scoring  →  flag disagreement  →  export JSONL
```

## What it does

1. **Anchor extraction.** Describe the look you want to train ("morning natural light, low saturation, warm film-leaning cafe lifestyle"). The text model returns a 5-dimension rubric with `ideal / 5★ / 1★` anchors per dim, plus a list of anti-patterns.
2. **Single-image scoring.** Upload an image; the vision model scores all 5 dimensions plus an overall, and writes a 120-180 char critique. You adjust scores. Any dim where you and the model differ by 1 star is ringed red.
3. **Pairwise A/B.** Upload two images; the vision model picks the closer one to the rubric ideal and explains why with reference to specific dimensions. You override or confirm.
4. **Export JSONL.** Approved single-score samples export as multimodal-message SFT format. Approved pairs export as `prompt / chosen / rejected` DPO format.

## Why "calibration" not just "scoring"

A rubric designer's job isn't to score images, it's to find where the rubric is still ambiguous. VisionRubric makes that loop visible: every disagreement between AI and human is a sign that one of the rubric's anchor sentences needs to be rewritten. Fix the rubric, the next batch's disagreements drop.

## Stack

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS, Pinterest Gestalt + Apple HIG token system (see workspace `DESIGN.md`)
- `openai` SDK pointed at any OpenAI-compatible text endpoint (DeepSeek by default) and any OpenAI-compatible vision endpoint (Zhipu GLM-4V / Qwen-VL / OpenAI gpt-4o-mini)
- No image storage; everything stays in the browser as base64

## Run

```bash
npm install
cp .env.example .env.local
# fill in DEEPSEEK_API_KEY (text) and VISION_API_KEY / VISION_BASE_URL / VISION_MODEL (vision)
npm run dev
# http://localhost:3002
```

## Sister projects

- `../StyleForge` — written-voice SFT data tool (Pinterest design twin)
- `../SQLForge` — NL → SQL training pair tool
