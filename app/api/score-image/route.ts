import OpenAI from 'openai'

// Vision endpoint is intentionally configurable. DeepSeek's text endpoint does not yet do vision
// reliably for our use case, so we let the operator point this at any OpenAI-compatible vision
// model: OpenAI gpt-4o-mini, Qwen-VL via DashScope, GLM-4V via Zhipu, internal proxies, etc.
const VISION_MODEL = process.env.VISION_MODEL || 'gpt-4o-mini'

// Some endpoints (GLM-4V-Flash) wrap JSON in prose or markdown fences. Strip + match the first
// balanced object so the route stays resilient across vision providers.
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
    const { rubric, imageDataUrl } = await req.json()
    if (!rubric || !imageDataUrl) {
      return new Response('Missing rubric or image', { status: 400 })
    }
    if (!process.env.VISION_API_KEY) {
      return new Response('VISION_API_KEY not configured', { status: 500 })
    }
    const visionClient = getVisionClient()

    const dimsBlock = (rubric.dimensions || [])
      .map((d: any) => `- ${d.label} (${d.key}): 理想 = ${d.ideal} | 5 星 = ${d.five_star} | 1 星 = ${d.one_star}`)
      .join('\n')

    const prompt = `你是严格的图像美学评分员。给定一张图片和一份评分锚点，请按 5 个维度独立打分（1-5 星，允许 0.5 步进）。

评分锚点：
风格名：${rubric.name}
整体调性：${rubric.summary}
反样本：${(rubric.antipatterns || []).join('；')}

5 维：
${dimsBlock}

输出严格 JSON，不要任何其他文字：
{
  "scores": {
    "composition": 4.0,
    "color": 3.5,
    "light": 4.5,
    "subject": 3.0,
    "mood": 4.0
  },
  "overall": 3.8,
  "critique": "120-180 字的整体讲评，先讲符合处再讲短板，给出具体可执行的改进建议",
  "tags": ["3-5 个具体的画面关键词"]
}

要点：
- overall 是 5 维的加权平均，权重相等可
- critique 必须落到具体画面元素（前景/背景/光线方向/色温/主体姿态等），不要空话
- 不要使用 em dash`

    // GLM-4V-Flash caps max_tokens at 1024 (anything higher returns a 1210 "param error" 400),
    // and rejects response_format entirely. Both restrictions are quietly enforced server-side.
    const r = await visionClient.chat.completions.create({
      model: VISION_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ] as any,
        },
      ],
    })

    const text = r.choices[0].message.content ?? '{}'
    const parsed = extractJson(text)
    return Response.json(parsed)
  } catch (e: any) {
    return new Response(e.message ?? 'score failed', { status: 500 })
  }
}
