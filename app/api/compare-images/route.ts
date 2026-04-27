import OpenAI from 'openai'

// Pairwise A/B comparison powers DPO training data export. The model is asked to pick the image
// closer to the rubric's ideal and explain why, in a single forward pass.
const VISION_MODEL = process.env.VISION_MODEL || 'gpt-4o-mini'

// Mirror score-image's tolerant JSON extractor (handles prose / fenced output from GLM-4V).
function extractJson(text: string): any {
  const stripped = text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim()
  try {
    return JSON.parse(stripped)
  } catch {
    const match = stripped.match(/\{[\s\S]*\}/)
    if (!match) throw new Error(`Model did not return JSON: ${stripped.slice(0, 200)}`)
    return JSON.parse(match[0])
  }
}

// Lazy-instantiated so `next build` doesn't try to validate the key at module-load time.
function getVisionClient() {
  return new OpenAI({
    apiKey: process.env.VISION_API_KEY,
    baseURL: process.env.VISION_BASE_URL || 'https://api.openai.com/v1',
  })
}

export async function POST(req: Request) {
  try {
    const { rubric, imageA, imageB } = await req.json()
    if (!rubric || !imageA || !imageB) {
      return new Response('Missing rubric or images', { status: 400 })
    }
    if (!process.env.VISION_API_KEY) {
      return new Response('VISION_API_KEY not configured', { status: 500 })
    }
    const visionClient = getVisionClient()

    const dimsBlock = (rubric.dimensions || [])
      .map((d: any) => `- ${d.label}: 理想 = ${d.ideal}`)
      .join('\n')

    const prompt = `你是图像美学偏好评判员。给定 A、B 两张图和一份评分锚点，请挑出更接近"理想态"的那张。

评分锚点：
风格名：${rubric.name}
整体调性：${rubric.summary}
反样本：${(rubric.antipatterns || []).join('；')}
5 维理想：
${dimsBlock}

输出严格 JSON，不要任何其他文字：
{
  "winner": "A" 或 "B",
  "margin": "small" / "medium" / "large",
  "rationale": "100-150 字解释，必须落到具体维度（构图/色彩/光线/主体/氛围中的至少 2 个），点出胜方的优势和败方的具体短板",
  "scores": {
    "A": {"composition": 4.0, "color": 3.5, "light": 4.0, "subject": 3.5, "mood": 4.0},
    "B": {"composition": 3.5, "color": 4.0, "light": 4.5, "subject": 4.0, "mood": 4.5}
  }
}

要点：
- 不要平局；如果实在难分，选 margin = "small" 并给出微弱偏好
- rationale 必须具体，不要空话
- 不要使用 em dash`

    // GLM-4V-Flash caps max_tokens at 1024 and rejects response_format. See score-image route.
    const r = await visionClient.chat.completions.create({
      model: VISION_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'text', text: '图 A：' },
            { type: 'image_url', image_url: { url: imageA } },
            { type: 'text', text: '图 B：' },
            { type: 'image_url', image_url: { url: imageB } },
          ] as any,
        },
      ],
    })

    const text = r.choices[0].message.content ?? '{}'
    const parsed = extractJson(text)
    return Response.json(parsed)
  } catch (e: any) {
    return new Response(e.message ?? 'compare failed', { status: 500 })
  }
}
