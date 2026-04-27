import OpenAI from 'openai'

// Anchor extraction is text-only. Defaults to DeepSeek (cheapest Chinese-fluent text model),
// but the endpoint is fully overridable so a single Zhipu key can power both routes.
const client = new OpenAI({
  apiKey: process.env.TEXT_API_KEY ?? process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.TEXT_BASE_URL ?? 'https://api.deepseek.com',
})
const MODEL = process.env.TEXT_MODEL ?? 'deepseek-chat'

export async function POST(req: Request) {
  try {
    const { description, references = '' } = await req.json()
    if (!description?.trim()) {
      return new Response('Missing description', { status: 400 })
    }

    // The 5 dimensions are stable on purpose: they survive across portrait, landscape, product,
    // and lifestyle scenes, and they let the export schema and the disagreement detector both
    // rely on a known shape rather than whatever keys the model invents this run.
    const prompt = `你是图像美学评估师。用户用自然语言描述了一种他们想要校准的"理想图像调性"，可能还附带了少量参考说明。
你的任务是把这种调性凝练成一份 5 维评分锚点（rubric anchor），后续会被视觉模型用来打分。

输出严格的 JSON，不要任何其他文字。结构如下：
{
  "name": "30 字以内的风格标签，例如：清晨胶片冷调",
  "summary": "80 字以内的整体调性概述",
  "dimensions": [
    {
      "key": "composition",
      "label": "构图",
      "ideal": "理想态在这一维上的画面特征，1-2 句话",
      "five_star": "5 星级别的画面应该是什么样，给评分者明确的视觉锚点",
      "one_star": "1 星级别的反例，方便区分"
    },
    {"key":"color","label":"色彩", ...},
    {"key":"light","label":"光线", ...},
    {"key":"subject","label":"主体", ...},
    {"key":"mood","label":"氛围", ...}
  ],
  "antipatterns": ["明确不要的画面元素，3-5 条短句"]
}

要点：
- 每条 ideal/five_star/one_star 都必须是具体可感的描述，不要泛泛
- 严格保持 5 个维度的 key 名称：composition / color / light / subject / mood
- 中文必须自然通顺，避免把语义相反的形容词直接并列（不要写"清晰杂乱""安静喧闹"这种自相矛盾的描述）。需要并列两个特征时用顿号或"且/又"连接，意思上必须相容
- 不要使用 em dash (—)

用户描述：
"""
${description}
"""

参考补充（可能为空）：
"""
${references}
"""`

    const r = await client.chat.completions.create({
      model: MODEL,
      max_tokens: 2000,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: prompt }],
    })

    const text = r.choices[0].message.content ?? '{}'
    const cleaned = text.replace(/^```(?:json)?\n?/, '').replace(/```\s*$/, '').trim()
    const parsed = JSON.parse(cleaned)
    return Response.json(parsed)
  } catch (e: any) {
    return new Response(e.message ?? 'extract failed', { status: 500 })
  }
}
