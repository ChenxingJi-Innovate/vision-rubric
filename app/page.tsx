'use client'

import { useMemo, useRef, useState } from 'react'
import {
  Sparkles, Image as ImageIcon, Star, Upload, ChevronRight, Download, RefreshCw,
  Wand2, ScanLine, GitCompare, Trophy, AlertCircle, Languages, Plus, X, Check,
  Lightbulb, Layers, Target,
} from 'lucide-react'

/* ---------- i18n ---------- */
type Lang = 'zh' | 'en'
type Dict = {
  brand: string
  hero1: string
  hero2: string
  heroSub: string
  step1: string
  step2: string
  step3: string
  anchorPlaceholder: string
  refsPlaceholder: string
  refsLabel: string
  extractCta: string
  extracting: string
  rubricTitle: string
  rubricSummary: string
  antipatterns: string
  modeSingle: string
  modeSingleDesc: string
  modePair: string
  modePairDesc: string
  uploadOne: string
  uploadAB: string
  scoreCta: string
  scoring: string
  compareCta: string
  comparing: string
  aiScore: string
  humanScore: string
  divergence: string
  divergenceHint: string
  critique: string
  rationale: string
  winner: string
  margin: string
  exportSft: string
  exportDpo: string
  exportEmpty: string
  resetAll: string
  noImageYet: string
  awaitingScore: string
  loadAnother: string
  composition: string
  color: string
  light: string
  subject: string
  mood: string
  overall: string
  small: string
  medium: string
  large: string
  pickA: string
  pickB: string
  pickedA: string
  pickedB: string
  approved: string
  hold: string
  approveBtn: string
  holdBtn: string
  jdAlign: string
  jdAlignBody: string
  pipelineTitle: string
  pipelineNodes: string[]
  fillSample: string
  trySampleImage: string
  trySamplePair: string
  loadingSample: string
  sampleDescription: string
  sampleReferences: string
  batchScore: string
  batchCompare: string
  batchRunning: string
  blindHintPair: string
  blindHintSingle: string
  aiHidden: string
  yourPickFirst: string
}
const DICT: Record<Lang, Dict> = {
  zh: {
    brand: 'AestheticForge',
    hero1: '把"什么算好看"',
    hero2: '变成可校准的',
    heroSub: '面向视觉模型的 SFT / DPO 数据生产工作台。先把模糊的"调性"凝练成 5 维评分锚点，再让视觉模型与人共同打分，把分歧点直接喂回训练。',
    step1: '锚点',
    step2: '打分 / 比较',
    step3: '导出',
    anchorPlaceholder: '描述你想训练的图像调性，越具体越好。例：清晨自然光、低饱和、暖色偏胶片感的咖啡馆生活照，主体偏左下三分点构图，避免高对比和强 HDR。',
    refsPlaceholder: '可选：粘贴几条参考图的文字标注或链接说明，用换行分隔',
    refsLabel: '参考补充（可选）',
    extractCta: '提炼锚点',
    extracting: '正在提炼…',
    rubricTitle: '评分锚点',
    rubricSummary: '整体调性',
    antipatterns: '反样本',
    modeSingle: '单图打分',
    modeSingleDesc: '上传 1 张图，AI 给 5 维评分，你校准 → 导出 SFT 训练数据',
    modePair: '两两对比',
    modePairDesc: '上传 A / B 两张图，AI 选一张更接近理想态，你校准 → 导出 DPO 偏好数据',
    uploadOne: '上传图片',
    uploadAB: '上传 A / B',
    scoreCta: 'AI 打分',
    scoring: '正在打分…',
    compareCta: 'AI 对比',
    comparing: '正在对比…',
    aiScore: 'AI 评分',
    humanScore: '人工校准',
    divergence: '分歧度',
    divergenceHint: '红圈标出 AI 与人类差距 ≥ 1 星的维度。这是 rubric 需要被改写的地方。',
    critique: '讲评',
    rationale: '判分理由',
    winner: '胜出',
    margin: '差距',
    exportSft: '导出 SFT JSONL',
    exportDpo: '导出 DPO JSONL',
    exportEmpty: '至少打分 1 张才能导出',
    resetAll: '清空全部',
    noImageYet: '还没上传',
    awaitingScore: '点左侧"AI 打分"开始评分',
    loadAnother: '换一张',
    composition: '构图',
    color: '色彩',
    light: '光线',
    subject: '主体',
    mood: '氛围',
    overall: '整体',
    small: '微弱',
    medium: '明显',
    large: '显著',
    pickA: '我选 A',
    pickB: '我选 B',
    pickedA: '已选 A',
    pickedB: '已选 B',
    approved: '通过',
    hold: '保留',
    approveBtn: '采纳',
    holdBtn: '存疑',
    jdAlign: '为什么需要这条流水线',
    jdAlignBody: '训练一个懂"美感"的视觉模型，难点不在打分，而在把"美感"写得足够明确，让模型和标注员对同一张图给出近似的判断。本工具把三件事拼成同一条流水线：rubric 锚点把"美感"显式化为 5 维评分坐标，单图打分产出 SFT 样本，A/B 对比产出 DPO 偏好对。AI 与人工分歧度直接告诉你：rubric 的哪一条还没说清，需要回头改。',
    pipelineTitle: '工作流',
    pipelineNodes: ['描述调性', '提炼锚点', '上传图片', 'AI 与人工双评', '分歧标记', '导出 JSONL'],
    fillSample: '一键填入范例样本',
    trySampleImage: '试用范例图',
    trySamplePair: '试用范例对比',
    loadingSample: '加载中…',
    sampleDescription: '清晨自然光的咖啡馆生活照，低饱和暖色，胶片颗粒感明显。主体（人或杯子）放在画面左下三分点，背景虚化，留白克制。整体氛围安静、慵懒、克制，避免高对比 HDR、过曝高光、过度滤镜化的网红色调。',
    sampleReferences: '参考：王家卫《花样年华》室内光线\n参考：Kinfolk 杂志的早餐场景排版\n参考：富士 Pro 400H 的暖调质感',
    batchScore: '一键全部 AI 打分',
    batchCompare: '一键全部 AI 对比',
    batchRunning: '批量运行中…',
    blindHintPair: '建议先盲选 A 或 B，再揭晓 AI 判分（避免被 AI 的说辞误导）',
    blindHintSingle: '建议先自己打分，再让 AI 评分（人工分数不会被 AI 预填）',
    aiHidden: 'AI 结果已隐藏 · 请先做出你的选择',
    yourPickFirst: '你的盲选',
  },
  en: {
    brand: 'AestheticForge',
    hero1: 'Turn "what looks good"',
    hero2: 'into a calibrated',
    heroSub: 'An SFT / DPO data forge for image-aesthetic training. Distill a vague vibe into a 5-dimension rubric, score with AI and human side by side, and feed the disagreements back into the data.',
    step1: 'Anchor',
    step2: 'Score / Compare',
    step3: 'Export',
    anchorPlaceholder: 'Describe the look you want to train. Example: morning natural light, low saturation, warm film-leaning cafe lifestyle shots; subject in lower-left rule of thirds; avoid high-contrast HDR.',
    refsPlaceholder: 'Optional: paste a few reference captions or link descriptions, one per line',
    refsLabel: 'References (optional)',
    extractCta: 'Extract anchor',
    extracting: 'Extracting...',
    rubricTitle: 'Rubric anchor',
    rubricSummary: 'Overall vibe',
    antipatterns: 'Anti-patterns',
    modeSingle: 'Single-image scoring',
    modeSingleDesc: 'Upload 1 image, AI gives 5-dim scores, you calibrate, export SFT data',
    modePair: 'Pairwise A/B',
    modePairDesc: 'Upload A and B, AI picks the closer one, you calibrate, export DPO preferences',
    uploadOne: 'Upload image',
    uploadAB: 'Upload A / B',
    scoreCta: 'AI score',
    scoring: 'Scoring...',
    compareCta: 'AI compare',
    comparing: 'Comparing...',
    aiScore: 'AI score',
    humanScore: 'Human calibration',
    divergence: 'Divergence',
    divergenceHint: 'Red rings flag dimensions where AI and human differ by 1 star or more. Those are the rubric lines to rewrite.',
    critique: 'Critique',
    rationale: 'Rationale',
    winner: 'Winner',
    margin: 'Margin',
    exportSft: 'Export SFT JSONL',
    exportDpo: 'Export DPO JSONL',
    exportEmpty: 'Score at least 1 image to export',
    resetAll: 'Reset all',
    noImageYet: 'No image yet',
    awaitingScore: 'Click "AI score" on the left to begin',
    loadAnother: 'Swap',
    composition: 'Composition',
    color: 'Color',
    light: 'Light',
    subject: 'Subject',
    mood: 'Mood',
    overall: 'Overall',
    small: 'small',
    medium: 'medium',
    large: 'large',
    pickA: 'Pick A',
    pickB: 'Pick B',
    pickedA: 'Picked A',
    pickedB: 'Picked B',
    approved: 'Approved',
    hold: 'Held',
    approveBtn: 'Approve',
    holdBtn: 'Hold',
    jdAlign: 'Why this pipeline',
    jdAlignBody: 'Training a vision model that understands "good taste" is hard not because scoring is hard, but because writing "good taste" precisely enough that model and annotator land on the same call is hard. This tool stitches three things into one pipeline: the rubric anchor makes "good" explicit as a 5-dim coordinate, single scoring yields SFT samples, and A/B yields DPO preferences. The AI-vs-human disagreement view tells you exactly which rubric line is still ambiguous and needs to be rewritten.',
    pipelineTitle: 'Pipeline',
    pipelineNodes: ['Describe vibe', 'Extract anchor', 'Upload', 'AI + human score', 'Flag disagreement', 'Export JSONL'],
    fillSample: 'Try a sample',
    trySampleImage: 'Try a sample image',
    trySamplePair: 'Try a sample pair',
    loadingSample: 'Loading...',
    sampleDescription: 'Morning natural-light cafe lifestyle, low saturation warm tones, visible film grain. Subject (person or cup) sits on the lower-left rule of thirds with restrained negative space. Quiet, languid, restrained mood. Avoid high-contrast HDR, blown highlights, oversaturated influencer filters.',
    sampleReferences: 'Ref: interior light from In the Mood for Love\nRef: Kinfolk magazine breakfast composition\nRef: Fujifilm Pro 400H warm tonality',
    batchScore: 'Score all (AI)',
    batchCompare: 'Compare all (AI)',
    batchRunning: 'Batch running...',
    blindHintPair: 'Pick A or B blind first; then reveal the AI verdict (avoid being anchored by the AI rationale).',
    blindHintSingle: 'Score yourself first; the AI score will not pre-fill your inputs.',
    aiHidden: 'AI verdict hidden until you make your blind pick',
    yourPickFirst: 'Your blind pick',
  },
}

/* ---------- types ---------- */
type DimKey = 'composition' | 'color' | 'light' | 'subject' | 'mood'
const DIM_KEYS: DimKey[] = ['composition', 'color', 'light', 'subject', 'mood']

type Dimension = {
  key: DimKey
  label: string
  ideal: string
  five_star: string
  one_star: string
}
type Rubric = {
  name: string
  summary: string
  dimensions: Dimension[]
  antipatterns: string[]
}
type Scores = Record<DimKey, number>
type ScoreResp = {
  scores: Scores
  overall: number
  critique: string
  tags?: string[]
}
type CompareResp = {
  winner: 'A' | 'B'
  margin: 'small' | 'medium' | 'large'
  rationale: string
  scores: { A: Scores; B: Scores }
}

/* ---------- helpers ---------- */
const blank = (): Scores => ({ composition: 0, color: 0, light: 0, subject: 0, mood: 0 })
const avg = (s: Scores) => DIM_KEYS.reduce((a, k) => a + (s[k] || 0), 0) / DIM_KEYS.length

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(String(r.result))
    r.onerror = reject
    r.readAsDataURL(file)
  })
}

// Pulls a stable seeded photo from picsum.photos (real curated images, supports CORS)
// and converts it to a data URL so the rest of the pipeline treats it like an upload.
async function loadSampleImage(seed: string): Promise<string> {
  const r = await fetch(`https://picsum.photos/seed/${seed}/800/1000`)
  const blob = await r.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/* ---------- root ---------- */
export default function Page() {
  const [lang, setLang] = useState<Lang>('zh')
  const t = DICT[lang]

  // Step 1: rubric
  const [description, setDescription] = useState('')
  const [references, setReferences] = useState('')
  const [rubric, setRubric] = useState<Rubric | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Step 2: mode + samples
  const [mode, setMode] = useState<'single' | 'pair'>('single')
  const [singles, setSingles] = useState<SingleSample[]>([])
  const [pairs, setPairs] = useState<PairSample[]>([])

  // Step labels
  const stepDone1 = !!rubric
  const stepDone2 =
    (mode === 'single' && singles.some((s) => s.aiScore)) ||
    (mode === 'pair' && pairs.some((p) => p.ai))
  const stepDone3 =
    (mode === 'single' && singles.some((s) => s.approved)) ||
    (mode === 'pair' && pairs.some((p) => p.approved))

  /* ----- step 1 actions ----- */
  async function extract() {
    if (!description.trim()) return
    setExtracting(true)
    setError(null)
    try {
      const r = await fetch('/api/extract-anchor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, references }),
      })
      if (!r.ok) throw new Error(await r.text())
      const data = (await r.json()) as Rubric
      setRubric(data)
    } catch (e: any) {
      setError(e.message ?? 'extract failed')
    } finally {
      setExtracting(false)
    }
  }

  function reset() {
    setDescription('')
    setReferences('')
    setRubric(null)
    setSingles([])
    setPairs([])
    setError(null)
  }

  return (
    <main className="min-h-screen pb-1600">
      {/* Sticky language toggle */}
      <button
        onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
        className="fixed top-500 right-500 z-50 inline-flex items-center gap-200 rounded-pill bg-mochimalist/80 backdrop-blur-xl px-400 py-200 text-200 font-semibold shadow-glass hover:shadow-raised transition-all duration-500 ease-apple"
      >
        <Languages className="w-4 h-4" strokeWidth={1.5} />
        {lang === 'zh' ? 'EN' : '中'}
      </button>

      {/* Hero */}
      <Hero t={t} stepDone1={stepDone1} stepDone2={stepDone2} stepDone3={stepDone3} />

      {/* Step 1: extract */}
      <section className="mx-auto max-w-[1200px] px-600 mt-1200">
        <SectionHeader
          step={1}
          icon={<Wand2 className="w-5 h-5" strokeWidth={1.5} />}
          title={lang === 'zh' ? '把调性写成评分锚点' : 'Distill the vibe into a rubric'}
          done={stepDone1}
        />

        <div className="mt-600 grid lg:grid-cols-[1.1fr_1fr] gap-600 animate-fadeUp">
          {/* description */}
          <div className="rounded-400 bg-mochimalist shadow-floating p-700 flex flex-col">
            <label className="text-200 font-semibold text-roboflow-600 mb-300">
              {lang === 'zh' ? '描述你想要的图像调性' : 'Describe the target aesthetic'}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.anchorPlaceholder}
              rows={6}
              className="rounded-400 bg-roboflow-50 px-400 py-300 text-300 leading-relaxed focus:outline-none focus:ring-2 focus:ring-pushpin-450/30 focus:bg-mochimalist transition-all duration-500 ease-apple resize-none"
            />
            {!description && (
              <button
                onClick={() => setDescription(t.sampleDescription)}
                className="mt-200 self-start inline-flex items-center gap-100 px-300 py-100 rounded-pill bg-pushpin-50 text-pushpin-450 text-100 font-bold transition-all duration-300 ease-apple hover:bg-pushpin-100 hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                {t.fillSample}
              </button>
            )}

            <label className="text-200 font-semibold text-roboflow-600 mt-500 mb-300">
              {t.refsLabel}
            </label>
            <textarea
              value={references}
              onChange={(e) => setReferences(e.target.value)}
              placeholder={t.refsPlaceholder}
              rows={3}
              className="rounded-400 bg-roboflow-50 px-400 py-300 text-200 leading-relaxed focus:outline-none focus:ring-2 focus:ring-pushpin-450/30 focus:bg-mochimalist transition-all duration-500 ease-apple resize-none"
            />
            {!references && (
              <button
                onClick={() => setReferences(t.sampleReferences)}
                className="mt-200 self-start inline-flex items-center gap-100 px-300 py-100 rounded-pill bg-pushpin-50 text-pushpin-450 text-100 font-bold transition-all duration-300 ease-apple hover:bg-pushpin-100 hover:scale-105 active:scale-95"
              >
                <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                {t.fillSample}
              </button>
            )}

            <div className="mt-500 flex items-center gap-300">
              <button
                onClick={extract}
                disabled={extracting || !description.trim()}
                className="inline-flex items-center gap-200 rounded-pill bg-cosmicore text-mochimalist px-500 py-300 text-200 font-semibold shadow-floating hover:-translate-y-0.5 hover:shadow-raised transition-all duration-500 ease-apple disabled:opacity-30 disabled:hover:translate-y-0"
              >
                <Sparkles className="w-4 h-4" strokeWidth={1.5} />
                {extracting ? t.extracting : t.extractCta}
              </button>
              {rubric && (
                <button
                  onClick={reset}
                  className="inline-flex items-center gap-200 rounded-pill px-400 py-300 text-200 text-roboflow-600 hover:text-cosmicore hover:bg-roboflow-100 transition-all duration-500 ease-apple"
                >
                  <RefreshCw className="w-4 h-4" strokeWidth={1.5} />
                  {t.resetAll}
                </button>
              )}
              {error && (
                <span className="text-200 text-pushpin-450 inline-flex items-center gap-100">
                  <AlertCircle className="w-4 h-4" strokeWidth={1.5} /> {error}
                </span>
              )}
            </div>
          </div>

          {/* rubric preview */}
          <div className="rounded-400 bg-mochimalist shadow-floating p-700 min-h-[440px]">
            {extracting ? (
              <RubricSkeleton />
            ) : rubric ? (
              <RubricView rubric={rubric} t={t} />
            ) : (
              <RubricEmpty lang={lang} />
            )}
          </div>
        </div>
      </section>

      {/* Step 2: mode + scoring */}
      {rubric && (
        <section className="mx-auto max-w-[1200px] px-600 mt-1200">
          <SectionHeader
            step={2}
            icon={<ScanLine className="w-5 h-5" strokeWidth={1.5} />}
            title={lang === 'zh' ? '上传图片，让 AI 与人共同打分' : 'Upload images, AI and human score together'}
            done={stepDone2}
          />

          {/* mode picker */}
          <div className="mt-600 grid md:grid-cols-2 gap-400 animate-fadeUp">
            <ModeCard
              icon={<Star className="w-5 h-5" strokeWidth={1.5} />}
              title={t.modeSingle}
              desc={t.modeSingleDesc}
              active={mode === 'single'}
              onClick={() => setMode('single')}
            />
            <ModeCard
              icon={<GitCompare className="w-5 h-5" strokeWidth={1.5} />}
              title={t.modePair}
              desc={t.modePairDesc}
              active={mode === 'pair'}
              onClick={() => setMode('pair')}
            />
          </div>

          {/* sample list */}
          <div className="mt-700">
            {mode === 'single' ? (
              <SingleSampleList
                rubric={rubric}
                samples={singles}
                setSamples={setSingles}
                t={t}
                lang={lang}
              />
            ) : (
              <PairSampleList
                rubric={rubric}
                samples={pairs}
                setSamples={setPairs}
                t={t}
                lang={lang}
              />
            )}
          </div>
        </section>
      )}

      {/* Step 3: export */}
      {rubric && (
        <section className="mx-auto max-w-[1200px] px-600 mt-1200">
          <SectionHeader
            step={3}
            icon={<Download className="w-5 h-5" strokeWidth={1.5} />}
            title={lang === 'zh' ? '导出可直接喂训练框架的 JSONL' : 'Export training-ready JSONL'}
            done={stepDone3}
          />
          <ExportPanel
            mode={mode}
            singles={singles}
            pairs={pairs}
            rubric={rubric}
            t={t}
            lang={lang}
          />
        </section>
      )}

      {/* Pipeline rationale footer */}
      <section className="mx-auto max-w-[1200px] px-600 mt-1200">
        <div className="rounded-400 bg-cosmicore text-mochimalist p-700 shadow-lift">
          <div className="inline-flex items-center gap-200 text-200 font-semibold uppercase tracking-[0.2em] text-pushpin-200">
            <Target className="w-4 h-4" strokeWidth={1.5} />
            {t.jdAlign}
          </div>
          <p className="mt-300 text-300 leading-relaxed text-mochimalist/85 max-w-[760px]">
            {t.jdAlignBody}
          </p>
          <div className="mt-600 flex flex-wrap gap-300">
            {t.pipelineNodes.map((node, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-200 rounded-pill bg-mochimalist/10 px-400 py-200 text-200 backdrop-blur-md"
              >
                <span className="w-100 h-100 rounded-pill bg-pushpin-450" />
                {node}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

/* ---------- hero ---------- */
function Hero({
  t,
  stepDone1,
  stepDone2,
  stepDone3,
}: {
  t: Dict
  stepDone1: boolean
  stepDone2: boolean
  stepDone3: boolean
}) {
  return (
    <section className="relative overflow-hidden pt-1500 pb-1200">
      <div className="mx-auto max-w-[1200px] px-600 grid lg:grid-cols-[1.2fr_1fr] gap-700 items-center">
        <div className="animate-fadeUp">
          <div className="inline-flex items-center gap-200 rounded-pill bg-mochimalist/80 backdrop-blur-xl px-400 py-200 text-200 font-semibold text-roboflow-600 shadow-glass">
            <Sparkles className="w-4 h-4 text-pushpin-450" strokeWidth={1.5} />
            {t.brand}
          </div>
          <h1
            className="mt-500 font-bold tracking-[-0.04em] leading-[1.02]"
            style={{ fontSize: 'clamp(48px, 7.5vw, 88px)' }}
          >
            {t.hero1}
            <br />
            {t.hero2}{' '}
            <span className="font-display italic text-pushpin-450">rubric.</span>
          </h1>
          <p className="mt-500 text-300 leading-relaxed text-roboflow-600 max-w-[560px]">
            {t.heroSub}
          </p>

          {/* progress pill row */}
          <div className="mt-600 inline-flex items-center gap-200 rounded-pill bg-mochimalist/60 backdrop-blur-xl p-200 shadow-glass">
            <ProgressPill label={t.step1} active done={stepDone1} index={1} />
            <ChevronRight className="w-4 h-4 text-roboflow-300" strokeWidth={1.5} />
            <ProgressPill
              label={t.step2}
              active={stepDone1}
              done={stepDone2}
              index={2}
            />
            <ChevronRight className="w-4 h-4 text-roboflow-300" strokeWidth={1.5} />
            <ProgressPill
              label={t.step3}
              active={stepDone2}
              done={stepDone3}
              index={3}
            />
          </div>
        </div>

        {/* floating preview cards */}
        <div className="relative h-[380px] hidden lg:block">
          <div className="absolute top-0 left-200 w-[220px] rounded-400 bg-mochimalist shadow-lift p-400 animate-floatA">
            <div className="aspect-[4/5] rounded-300 bg-gradient-to-br from-pushpin-100 via-pushpin-50 to-mochimalist" />
            <div className="mt-300 flex items-center gap-200">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${i <= 4 ? 'fill-current text-pushpin-450' : 'text-roboflow-300'}`}
                  strokeWidth={1.5}
                />
              ))}
            </div>
            <div className="mt-200 text-100 text-roboflow-500">{t.composition} 4.0</div>
          </div>
          <div className="absolute top-300 right-0 w-[200px] rounded-400 bg-mochimalist shadow-lift p-400 animate-floatB">
            <div className="aspect-[3/4] rounded-300 bg-gradient-to-tr from-roboflow-100 via-mochimalist to-pushpin-50" />
            <div className="mt-300 text-100 font-semibold text-roboflow-600">A vs B</div>
            <div className="mt-100 text-100 text-pushpin-450 font-semibold">A · {t.medium}</div>
          </div>
          <div className="absolute bottom-0 left-1000 w-[180px] rounded-400 bg-cosmicore text-mochimalist shadow-lift p-400 animate-floatC">
            <div className="text-100 uppercase tracking-[0.18em] text-pushpin-200 font-semibold">
              JSONL
            </div>
            <div className="mt-200 font-mono text-100 leading-relaxed opacity-90 break-all">
              {`{"messages":[…]}`}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProgressPill({
  label,
  index,
  active,
  done,
}: {
  label: string
  index: number
  active: boolean
  done: boolean
}) {
  const cls = done
    ? 'bg-pushpin-450 text-mochimalist'
    : active
    ? 'bg-cosmicore text-mochimalist'
    : 'bg-mochimalist/70 text-roboflow-500'
  return (
    <span
      className={`inline-flex items-center gap-200 rounded-pill px-400 py-200 text-200 font-semibold ${cls}`}
    >
      <span className="w-5 h-5 rounded-pill bg-mochimalist/20 inline-flex items-center justify-center text-100">
        {done ? <Check className="w-3 h-3" strokeWidth={2.5} /> : index}
      </span>
      {label}
    </span>
  )
}

/* ---------- section header ---------- */
function SectionHeader({
  step,
  icon,
  title,
  done,
}: {
  step: number
  icon: React.ReactNode
  title: string
  done: boolean
}) {
  return (
    <div className="flex items-end gap-400 border-b border-roboflow-100 pb-400">
      <div
        className={`w-1100 h-1100 rounded-pill inline-flex items-center justify-center ${
          done ? 'bg-pushpin-450 text-mochimalist' : 'bg-cosmicore text-mochimalist'
        }`}
      >
        {icon}
      </div>
      <div>
        <div className="text-100 uppercase tracking-[0.2em] text-roboflow-400 font-semibold">
          STEP {step.toString().padStart(2, '0')}
        </div>
        <h2 className="mt-100 text-500 font-semibold tracking-[-0.02em]">{title}</h2>
      </div>
    </div>
  )
}

/* ---------- rubric view ---------- */
function RubricEmpty({ lang }: { lang: Lang }) {
  return (
    <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center">
      <div className="w-1500 h-1500 rounded-pill bg-roboflow-100 inline-flex items-center justify-center">
        <Lightbulb className="w-7 h-7 text-roboflow-400" strokeWidth={1.5} />
      </div>
      <p className="mt-500 text-300 text-roboflow-500 max-w-[260px] leading-relaxed">
        {lang === 'zh'
          ? '左侧填好调性后，5 维评分锚点会出现在这里。'
          : 'Fill in the description on the left, and the 5-dim rubric will appear here.'}
      </p>
    </div>
  )
}

function RubricSkeleton() {
  return (
    <div className="space-y-400">
      <div className="h-400 w-1/2 rounded-300 bg-roboflow-100 animate-pulse" />
      <div className="h-300 w-3/4 rounded-300 bg-roboflow-100 animate-pulse" style={{ animationDelay: '120ms' }} />
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-1100 rounded-300 bg-roboflow-100 animate-pulse"
          style={{ animationDelay: `${200 + i * 80}ms` }}
        />
      ))}
    </div>
  )
}

function RubricView({ rubric, t }: { rubric: Rubric; t: Dict }) {
  return (
    <div className="space-y-500">
      <div>
        <div className="text-100 uppercase tracking-[0.2em] text-roboflow-400 font-semibold">
          {t.rubricTitle}
        </div>
        <div className="mt-200 text-500 font-semibold tracking-[-0.02em]">
          {rubric.name}
        </div>
        <p className="mt-200 text-200 text-roboflow-600 leading-relaxed">{rubric.summary}</p>
      </div>

      <div className="space-y-300">
        {rubric.dimensions.map((d) => (
          <div key={d.key} className="rounded-300 bg-roboflow-50 p-400">
            <div className="flex items-center justify-between">
              <div className="text-200 font-semibold">{d.label}</div>
              <div className="text-100 text-roboflow-400 uppercase tracking-[0.16em]">
                {d.key}
              </div>
            </div>
            <div className="mt-200 text-200 text-roboflow-600 leading-relaxed">
              <span className="font-semibold text-cosmicore">5★ </span>
              {d.five_star}
            </div>
            <div className="mt-100 text-200 text-roboflow-500 leading-relaxed">
              <span className="font-semibold text-roboflow-600">1★ </span>
              {d.one_star}
            </div>
          </div>
        ))}
      </div>

      {rubric.antipatterns?.length > 0 && (
        <div>
          <div className="text-100 uppercase tracking-[0.2em] text-pushpin-450 font-semibold">
            {t.antipatterns}
          </div>
          <div className="mt-300 flex flex-wrap gap-200">
            {rubric.antipatterns.map((a, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-pill bg-pushpin-50 px-400 py-200 text-100 text-pushpin-700"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- mode card ---------- */
function ModeCard({
  icon,
  title,
  desc,
  active,
  onClick,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left rounded-400 p-600 transition-all duration-500 ease-apple ${
        active
          ? 'bg-mochimalist shadow-raised ring-2 ring-pushpin-450/30 -translate-y-0.5'
          : 'bg-mochimalist shadow-floating hover:shadow-lift hover:-translate-y-0.5'
      }`}
    >
      <div
        className={`w-1100 h-1100 rounded-pill inline-flex items-center justify-center ${
          active ? 'bg-pushpin-450 text-mochimalist' : 'bg-roboflow-100 text-roboflow-600'
        }`}
      >
        {icon}
      </div>
      <div className="mt-400 text-400 font-semibold tracking-[-0.01em]">{title}</div>
      <p className="mt-200 text-200 text-roboflow-500 leading-relaxed">{desc}</p>
    </button>
  )
}

/* ---------- single sample ---------- */
type SingleSample = {
  id: string
  dataUrl: string
  aiScore?: ScoreResp
  humanScore?: Scores
  approved?: boolean
  scoring?: boolean
  error?: string
}

function SingleSampleList({
  rubric,
  samples,
  setSamples,
  t,
  lang,
}: {
  rubric: Rubric
  samples: SingleSample[]
  setSamples: (s: SingleSample[]) => void
  t: Dict
  lang: Lang
}) {
  const fileRef = useRef<HTMLInputElement | null>(null)

  const [loadingDemo, setLoadingDemo] = useState(false)

  async function onUpload(files: FileList | null) {
    if (!files) return
    const newOnes: SingleSample[] = []
    for (const f of Array.from(files)) {
      const url = await fileToDataUrl(f)
      newOnes.push({ id: crypto.randomUUID(), dataUrl: url })
    }
    setSamples([...samples, ...newOnes])
    if (fileRef.current) fileRef.current.value = ''
  }

  async function onAddSample() {
    setLoadingDemo(true)
    try {
      const seed = `aesthetic-${Date.now()}`
      const url = await loadSampleImage(seed)
      setSamples([...samples, { id: crypto.randomUUID(), dataUrl: url }])
    } finally {
      setLoadingDemo(false)
    }
  }

  function update(id: string, patch: Partial<SingleSample>) {
    setSamples(samples.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }
  function remove(id: string) {
    setSamples(samples.filter((s) => s.id !== id))
  }

  async function score(s: SingleSample) {
    update(s.id, { scoring: true, error: undefined })
    try {
      const r = await fetch('/api/score-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rubric, imageDataUrl: s.dataUrl }),
      })
      if (!r.ok) throw new Error(await r.text())
      const data = (await r.json()) as ScoreResp
      update(s.id, {
        scoring: false,
        aiScore: data,
        humanScore: { ...data.scores }, // seed human with AI then user adjusts
      })
    } catch (e: any) {
      update(s.id, { scoring: false, error: e.message ?? 'score failed' })
    }
  }

  return (
    <div>
      <div className="flex items-center gap-300">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onUpload(e.target.files)}
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-200 rounded-pill bg-cosmicore text-mochimalist px-500 py-300 text-200 font-semibold shadow-floating hover:-translate-y-0.5 hover:shadow-raised transition-all duration-500 ease-apple"
        >
          <Upload className="w-4 h-4" strokeWidth={1.5} />
          {t.uploadOne}
        </button>
        <button
          onClick={onAddSample}
          disabled={loadingDemo}
          className="inline-flex items-center gap-100 px-300 py-200 rounded-pill bg-pushpin-50 text-pushpin-450 text-100 font-bold transition-all duration-300 ease-apple hover:bg-pushpin-100 hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-3 h-3" strokeWidth={1.5} />
          {loadingDemo ? t.loadingSample : t.trySampleImage}
        </button>
        <span className="text-200 text-roboflow-500">
          {samples.length} {lang === 'zh' ? '张' : 'images'}
        </span>
      </div>

      <div className="mt-600 grid gap-500">
        {samples.map((s) => (
          <SingleSampleCard
            key={s.id}
            sample={s}
            rubric={rubric}
            t={t}
            lang={lang}
            onScore={() => score(s)}
            onUpdate={(p) => update(s.id, p)}
            onRemove={() => remove(s.id)}
          />
        ))}
      </div>
    </div>
  )
}

function SingleSampleCard({
  sample,
  rubric,
  t,
  lang,
  onScore,
  onUpdate,
  onRemove,
}: {
  sample: SingleSample
  rubric: Rubric
  t: Dict
  lang: Lang
  onScore: () => void
  onUpdate: (p: Partial<SingleSample>) => void
  onRemove: () => void
}) {
  const ai = sample.aiScore?.scores
  const human = sample.humanScore
  const divergent = useMemo(() => {
    if (!ai || !human) return new Set<DimKey>()
    const d = new Set<DimKey>()
    DIM_KEYS.forEach((k) => {
      if (Math.abs((ai[k] || 0) - (human[k] || 0)) >= 1) d.add(k)
    })
    return d
  }, [ai, human])

  return (
    <div className="rounded-400 bg-mochimalist shadow-floating p-500 grid lg:grid-cols-[260px_1fr] gap-500 animate-fadeUp">
      {/* image */}
      <div className="relative">
        <div className="rounded-300 bg-roboflow-50 overflow-hidden aspect-[4/5]">
          <img src={sample.dataUrl} alt="" className="w-full h-full object-cover" />
        </div>
        <button
          onClick={onRemove}
          className="absolute top-200 right-200 w-1000 h-1000 rounded-pill bg-mochimalist/90 backdrop-blur-md shadow-floating inline-flex items-center justify-center hover:bg-pushpin-450 hover:text-mochimalist transition-all duration-500 ease-apple"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
        {!sample.aiScore && (
          <button
            onClick={onScore}
            disabled={sample.scoring}
            className="absolute bottom-200 left-200 right-200 inline-flex items-center justify-center gap-200 rounded-pill bg-cosmicore text-mochimalist px-400 py-300 text-200 font-semibold shadow-raised disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" strokeWidth={1.5} />
            {sample.scoring ? t.scoring : t.scoreCta}
          </button>
        )}
      </div>

      {/* score detail */}
      <div className="min-h-[260px]">
        {sample.error && (
          <div className="text-200 text-pushpin-450 mb-300 inline-flex items-center gap-200">
            <AlertCircle className="w-4 h-4" strokeWidth={1.5} /> {sample.error}
          </div>
        )}
        {!sample.aiScore ? (
          <div className="h-full grid place-items-center text-200 text-roboflow-400">
            {sample.scoring ? <ScoreSkeleton /> : t.awaitingScore}
          </div>
        ) : (
          <>
            {/* dual score grid */}
            <div className="grid grid-cols-[120px_1fr_1fr] gap-300 items-center">
              <div />
              <div className="text-100 uppercase tracking-[0.16em] text-roboflow-400 font-semibold">
                {t.aiScore}
              </div>
              <div className="text-100 uppercase tracking-[0.16em] text-roboflow-400 font-semibold">
                {t.humanScore}
              </div>

              {DIM_KEYS.map((k) => (
                <DimRow
                  key={k}
                  label={t[k]}
                  ai={ai?.[k] ?? 0}
                  human={human?.[k] ?? 0}
                  divergent={divergent.has(k)}
                  onHuman={(v) =>
                    onUpdate({
                      humanScore: { ...(human || blank()), [k]: v },
                    })
                  }
                />
              ))}
              <div className="text-200 font-semibold text-roboflow-600">
                {t.overall}
              </div>
              <div className="text-300 font-semibold tabular-nums">
                {sample.aiScore.overall.toFixed(1)}
              </div>
              <div className="text-300 font-semibold tabular-nums">
                {avg(human || blank()).toFixed(1)}
              </div>
            </div>

            <div className="mt-500 rounded-300 bg-roboflow-50 p-400">
              <div className="text-100 uppercase tracking-[0.16em] text-roboflow-500 font-semibold">
                {t.critique}
              </div>
              <p className="mt-200 text-200 leading-relaxed text-roboflow-700">
                {sample.aiScore.critique}
              </p>
              {sample.aiScore.tags && sample.aiScore.tags.length > 0 && (
                <div className="mt-300 flex flex-wrap gap-200">
                  {sample.aiScore.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-pill bg-mochimalist px-300 py-100 text-100 text-roboflow-600 shadow-glass"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {divergent.size > 0 && (
              <div className="mt-400 rounded-300 bg-pushpin-0 border border-pushpin-100/0 p-400">
                <div className="inline-flex items-center gap-200 text-100 uppercase tracking-[0.16em] text-pushpin-450 font-semibold">
                  <AlertCircle className="w-4 h-4" strokeWidth={1.5} />
                  {t.divergence} · {divergent.size}
                </div>
                <p className="mt-200 text-100 text-pushpin-700 leading-relaxed">
                  {t.divergenceHint}
                </p>
              </div>
            )}

            <div className="mt-500 flex items-center gap-300">
              <button
                onClick={() => onUpdate({ approved: true })}
                className={`inline-flex items-center gap-200 rounded-pill px-500 py-300 text-200 font-semibold shadow-floating hover:-translate-y-0.5 hover:shadow-raised transition-all duration-500 ease-apple ${
                  sample.approved
                    ? 'bg-pushpin-450 text-mochimalist'
                    : 'bg-mochimalist text-cosmicore'
                }`}
              >
                <Check className="w-4 h-4" strokeWidth={1.5} />
                {sample.approved ? t.approved : t.approveBtn}
              </button>
              <button
                onClick={() => onUpdate({ approved: false })}
                className={`inline-flex items-center gap-200 rounded-pill px-500 py-300 text-200 font-semibold transition-all duration-500 ease-apple ${
                  sample.approved === false
                    ? 'bg-cosmicore text-mochimalist'
                    : 'text-roboflow-500 hover:bg-roboflow-100'
                }`}
              >
                {sample.approved === false ? t.hold : t.holdBtn}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function DimRow({
  label,
  ai,
  human,
  divergent,
  onHuman,
}: {
  label: string
  ai: number
  human: number
  divergent: boolean
  onHuman: (v: number) => void
}) {
  return (
    <>
      <div
        className={`text-200 ${divergent ? 'font-semibold text-pushpin-450' : 'text-roboflow-700'}`}
      >
        {label}
      </div>
      <StarRow value={ai} disabled />
      <div className={divergent ? 'rounded-300 ring-2 ring-pushpin-450/40 -m-200 p-200' : ''}>
        <StarRow value={human} onChange={onHuman} />
      </div>
    </>
  )
}

function StarRow({
  value,
  onChange,
  disabled,
}: {
  value: number
  onChange?: (v: number) => void
  disabled?: boolean
}) {
  return (
    <div className="inline-flex items-center gap-100">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= Math.round(value)
        return (
          <button
            key={i}
            disabled={disabled}
            onClick={() => onChange?.(i)}
            className={`transition-all duration-300 ease-apple ${disabled ? '' : 'hover:scale-110'}`}
          >
            <Star
              className={`w-5 h-5 ${
                filled ? 'fill-current text-pushpin-450' : 'text-roboflow-300'
              }`}
              strokeWidth={1.5}
            />
          </button>
        )
      })}
      <span className="ml-200 text-100 text-roboflow-500 tabular-nums w-1000 inline-block">
        {value ? value.toFixed(1) : '—'.replace('—', '·')}
      </span>
    </div>
  )
}

function ScoreSkeleton() {
  return (
    <div className="w-full space-y-300">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-700 rounded-300 bg-roboflow-100 animate-pulse"
          style={{ animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  )
}

/* ---------- pair sample ---------- */
type PairSample = {
  id: string
  imageA?: string
  imageB?: string
  ai?: CompareResp
  humanWinner?: 'A' | 'B'
  approved?: boolean
  comparing?: boolean
  error?: string
}

function PairSampleList({
  rubric,
  samples,
  setSamples,
  t,
  lang,
}: {
  rubric: Rubric
  samples: PairSample[]
  setSamples: (s: PairSample[]) => void
  t: Dict
  lang: Lang
}) {
  const [loadingDemo, setLoadingDemo] = useState(false)

  function addEmpty() {
    setSamples([...samples, { id: crypto.randomUUID() }])
  }
  async function addSamplePair() {
    setLoadingDemo(true)
    try {
      const ts = Date.now()
      const [a, b] = await Promise.all([
        loadSampleImage(`pair-a-${ts}`),
        loadSampleImage(`pair-b-${ts}`),
      ])
      setSamples([...samples, { id: crypto.randomUUID(), imageA: a, imageB: b }])
    } finally {
      setLoadingDemo(false)
    }
  }
  function update(id: string, patch: Partial<PairSample>) {
    setSamples(samples.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  }
  function remove(id: string) {
    setSamples(samples.filter((s) => s.id !== id))
  }

  async function compare(s: PairSample) {
    if (!s.imageA || !s.imageB) return
    update(s.id, { comparing: true, error: undefined })
    try {
      const r = await fetch('/api/compare-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rubric, imageA: s.imageA, imageB: s.imageB }),
      })
      if (!r.ok) throw new Error(await r.text())
      const data = (await r.json()) as CompareResp
      update(s.id, { comparing: false, ai: data, humanWinner: data.winner })
    } catch (e: any) {
      update(s.id, { comparing: false, error: e.message ?? 'compare failed' })
    }
  }

  return (
    <div>
      <div className="flex items-center gap-300">
        <button
          onClick={addEmpty}
          className="inline-flex items-center gap-200 rounded-pill bg-cosmicore text-mochimalist px-500 py-300 text-200 font-semibold shadow-floating hover:-translate-y-0.5 hover:shadow-raised transition-all duration-500 ease-apple"
        >
          <Plus className="w-4 h-4" strokeWidth={1.5} />
          {lang === 'zh' ? '新对比' : 'New pair'}
        </button>
        <button
          onClick={addSamplePair}
          disabled={loadingDemo}
          className="inline-flex items-center gap-100 px-300 py-200 rounded-pill bg-pushpin-50 text-pushpin-450 text-100 font-bold transition-all duration-300 ease-apple hover:bg-pushpin-100 hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          <Sparkles className="w-3 h-3" strokeWidth={1.5} />
          {loadingDemo ? t.loadingSample : t.trySamplePair}
        </button>
        <span className="text-200 text-roboflow-500">
          {samples.length} {lang === 'zh' ? '组' : 'pairs'}
        </span>
      </div>

      <div className="mt-600 grid gap-500">
        {samples.map((s) => (
          <PairSampleCard
            key={s.id}
            sample={s}
            t={t}
            lang={lang}
            onUpdate={(p) => update(s.id, p)}
            onRemove={() => remove(s.id)}
            onCompare={() => compare(s)}
          />
        ))}
      </div>
    </div>
  )
}

function PairSampleCard({
  sample,
  t,
  lang,
  onUpdate,
  onRemove,
  onCompare,
}: {
  sample: PairSample
  t: Dict
  lang: Lang
  onUpdate: (p: Partial<PairSample>) => void
  onRemove: () => void
  onCompare: () => void
}) {
  async function loadOne(side: 'A' | 'B', files: FileList | null) {
    if (!files?.[0]) return
    const url = await fileToDataUrl(files[0])
    onUpdate(side === 'A' ? { imageA: url } : { imageB: url })
  }

  return (
    <div className="rounded-400 bg-mochimalist shadow-floating p-500 animate-fadeUp">
      <div className="grid md:grid-cols-2 gap-400">
        <PairSlot
          side="A"
          dataUrl={sample.imageA}
          onLoad={(f) => loadOne('A', f)}
          isWinner={sample.ai?.winner === 'A'}
          humanPicked={sample.humanWinner === 'A'}
          aiScores={sample.ai?.scores.A}
          t={t}
          lang={lang}
        />
        <PairSlot
          side="B"
          dataUrl={sample.imageB}
          onLoad={(f) => loadOne('B', f)}
          isWinner={sample.ai?.winner === 'B'}
          humanPicked={sample.humanWinner === 'B'}
          aiScores={sample.ai?.scores.B}
          t={t}
          lang={lang}
        />
      </div>

      <div className="mt-500 flex flex-wrap items-center gap-300">
        <button
          onClick={onCompare}
          disabled={!sample.imageA || !sample.imageB || sample.comparing}
          className="inline-flex items-center gap-200 rounded-pill bg-cosmicore text-mochimalist px-500 py-300 text-200 font-semibold shadow-floating hover:-translate-y-0.5 hover:shadow-raised transition-all duration-500 ease-apple disabled:opacity-30 disabled:hover:translate-y-0"
        >
          <GitCompare className="w-4 h-4" strokeWidth={1.5} />
          {sample.comparing ? t.comparing : t.compareCta}
        </button>
        {sample.ai && (
          <>
            <button
              onClick={() => onUpdate({ humanWinner: 'A' })}
              className={`inline-flex items-center gap-200 rounded-pill px-500 py-300 text-200 font-semibold transition-all duration-500 ease-apple ${
                sample.humanWinner === 'A'
                  ? 'bg-pushpin-450 text-mochimalist shadow-raised'
                  : 'bg-mochimalist text-cosmicore shadow-floating hover:shadow-raised'
              }`}
            >
              {sample.humanWinner === 'A' ? t.pickedA : t.pickA}
            </button>
            <button
              onClick={() => onUpdate({ humanWinner: 'B' })}
              className={`inline-flex items-center gap-200 rounded-pill px-500 py-300 text-200 font-semibold transition-all duration-500 ease-apple ${
                sample.humanWinner === 'B'
                  ? 'bg-pushpin-450 text-mochimalist shadow-raised'
                  : 'bg-mochimalist text-cosmicore shadow-floating hover:shadow-raised'
              }`}
            >
              {sample.humanWinner === 'B' ? t.pickedB : t.pickB}
            </button>
            <button
              onClick={() => onUpdate({ approved: !sample.approved })}
              className={`ml-auto inline-flex items-center gap-200 rounded-pill px-500 py-300 text-200 font-semibold transition-all duration-500 ease-apple ${
                sample.approved
                  ? 'bg-cosmicore text-mochimalist shadow-raised'
                  : 'text-roboflow-500 hover:bg-roboflow-100'
              }`}
            >
              <Check className="w-4 h-4" strokeWidth={1.5} />
              {sample.approved ? t.approved : t.approveBtn}
            </button>
          </>
        )}
        <button
          onClick={onRemove}
          className="inline-flex items-center gap-200 rounded-pill px-400 py-300 text-200 text-roboflow-500 hover:text-pushpin-450 hover:bg-pushpin-50 transition-all duration-500 ease-apple"
        >
          <X className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>

      {sample.error && (
        <div className="mt-300 text-200 text-pushpin-450 inline-flex items-center gap-200">
          <AlertCircle className="w-4 h-4" strokeWidth={1.5} /> {sample.error}
        </div>
      )}

      {sample.ai && (
        <div className="mt-500 grid md:grid-cols-[1fr_280px] gap-400">
          <div className="rounded-300 bg-roboflow-50 p-400">
            <div className="text-100 uppercase tracking-[0.16em] text-roboflow-500 font-semibold">
              {t.rationale}
            </div>
            <p className="mt-200 text-200 leading-relaxed text-roboflow-700">
              {sample.ai.rationale}
            </p>
          </div>
          <div className="rounded-300 bg-cosmicore text-mochimalist p-400">
            <div className="text-100 uppercase tracking-[0.16em] text-pushpin-200 font-semibold inline-flex items-center gap-200">
              <Trophy className="w-4 h-4" strokeWidth={1.5} />
              {t.winner}
            </div>
            <div className="mt-200 text-500 font-semibold">
              {sample.ai.winner}
            </div>
            <div className="mt-200 text-100 text-mochimalist/70">
              {t.margin}: {t[sample.ai.margin]}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PairSlot({
  side,
  dataUrl,
  onLoad,
  isWinner,
  humanPicked,
  aiScores,
  t,
  lang,
}: {
  side: 'A' | 'B'
  dataUrl?: string
  onLoad: (f: FileList | null) => void
  isWinner?: boolean
  humanPicked?: boolean
  aiScores?: Scores
  t: Dict
  lang: Lang
}) {
  const ref = useRef<HTMLInputElement | null>(null)
  return (
    <div
      className={`rounded-300 p-400 transition-all duration-500 ease-apple ${
        humanPicked
          ? 'bg-pushpin-0 ring-2 ring-pushpin-450/40'
          : isWinner
          ? 'bg-roboflow-50 ring-2 ring-cosmicore/30'
          : 'bg-roboflow-50'
      }`}
    >
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onLoad(e.target.files)}
      />
      <div className="flex items-center justify-between">
        <div className="text-200 font-semibold">{side}</div>
        {isWinner && (
          <span className="inline-flex items-center gap-100 rounded-pill bg-cosmicore text-mochimalist px-300 py-100 text-100 font-semibold">
            <Trophy className="w-3 h-3" strokeWidth={1.5} />
            AI
          </span>
        )}
      </div>
      <div
        className="mt-300 rounded-300 overflow-hidden bg-mochimalist aspect-[4/5] cursor-pointer relative"
        onClick={() => ref.current?.click()}
      >
        {dataUrl ? (
          <img src={dataUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full grid place-items-center text-200 text-roboflow-400">
            <span className="inline-flex items-center gap-200">
              <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
              {t.uploadAB}
            </span>
          </div>
        )}
        {dataUrl && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              ref.current?.click()
            }}
            className="absolute bottom-200 right-200 inline-flex items-center gap-100 rounded-pill bg-mochimalist/90 backdrop-blur-md px-300 py-100 text-100 font-semibold shadow-floating"
          >
            <RefreshCw className="w-3 h-3" strokeWidth={1.5} />
            {t.loadAnother}
          </button>
        )}
      </div>
      {aiScores && (
        <div className="mt-300 grid grid-cols-5 gap-100">
          {DIM_KEYS.map((k) => (
            <div key={k} className="text-center">
              <div className="text-100 text-roboflow-400">{t[k]}</div>
              <div className="text-200 font-semibold tabular-nums">
                {aiScores[k]?.toFixed(1)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---------- export ---------- */
function ExportPanel({
  mode,
  singles,
  pairs,
  rubric,
  t,
  lang,
}: {
  mode: 'single' | 'pair'
  singles: SingleSample[]
  pairs: PairSample[]
  rubric: Rubric
  t: Dict
  lang: Lang
}) {
  const eligibleSingles = singles.filter((s) => s.aiScore && s.approved)
  const eligiblePairs = pairs.filter((p) => p.ai && p.humanWinner && p.approved)

  function rubricPrompt() {
    return [
      `请按照以下评分锚点对图像评分（5 维：构图/色彩/光线/主体/氛围，1-5 星，允许 0.5 步进）。`,
      `风格名：${rubric.name}`,
      `整体调性：${rubric.summary}`,
      ...rubric.dimensions.map(
        (d) => `${d.label}（${d.key}）理想：${d.ideal}；5★：${d.five_star}；1★：${d.one_star}`
      ),
      `反样本：${(rubric.antipatterns || []).join('；')}`,
    ].join('\n')
  }

  function exportSft() {
    const lines = eligibleSingles.map((s) => {
      const human = s.humanScore || s.aiScore!.scores
      const overall = avg(human)
      const userMsg = {
        role: 'user',
        content: [
          { type: 'text', text: rubricPrompt() },
          { type: 'image_url', image_url: { url: s.dataUrl } },
        ],
      }
      const assistantMsg = {
        role: 'assistant',
        content: JSON.stringify({
          scores: human,
          overall: Number(overall.toFixed(2)),
          critique: s.aiScore!.critique,
          tags: s.aiScore!.tags || [],
        }),
      }
      return JSON.stringify({ messages: [userMsg, assistantMsg] })
    })
    download('aestheticforge-sft.jsonl', lines.join('\n'))
  }

  function exportDpo() {
    const lines = eligiblePairs.map((p) => {
      const winner = p.humanWinner!
      const chosen = winner === 'A' ? p.imageA! : p.imageB!
      const rejected = winner === 'A' ? p.imageB! : p.imageA!
      const prompt = {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `${rubricPrompt()}\n请在下面 A、B 两张图中挑出更接近理想态的一张，并说明理由。`,
          },
          { type: 'text', text: '图 A：' },
          { type: 'image_url', image_url: { url: p.imageA! } },
          { type: 'text', text: '图 B：' },
          { type: 'image_url', image_url: { url: p.imageB! } },
        ],
      }
      const chosenMsg = {
        role: 'assistant',
        content: JSON.stringify({
          winner,
          margin: p.ai!.margin,
          rationale: p.ai!.rationale,
        }),
      }
      const rejectedMsg = {
        role: 'assistant',
        content: JSON.stringify({
          winner: winner === 'A' ? 'B' : 'A',
          margin: 'small',
          rationale: '（占位反例 / placeholder loser）',
        }),
      }
      return JSON.stringify({
        prompt: prompt,
        chosen: [chosenMsg],
        rejected: [rejectedMsg],
        meta: {
          chosen_image: chosen.slice(0, 64) + '...',
          rejected_image: rejected.slice(0, 64) + '...',
        },
      })
    })
    download('aestheticforge-dpo.jsonl', lines.join('\n'))
  }

  function download(name: string, body: string) {
    const blob = new Blob([body], { type: 'application/jsonl' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  const eligibleCount = mode === 'single' ? eligibleSingles.length : eligiblePairs.length
  const totalCount = mode === 'single' ? singles.length : pairs.length

  return (
    <div className="mt-600 grid lg:grid-cols-[1.2fr_1fr] gap-500 animate-fadeUp">
      <div className="rounded-400 bg-mochimalist shadow-floating p-700">
        <div className="grid grid-cols-3 gap-300">
          <StatCard
            label={lang === 'zh' ? '已采纳' : 'Approved'}
            value={eligibleCount}
            accent
          />
          <StatCard label={lang === 'zh' ? '总数' : 'Total'} value={totalCount} />
          <StatCard
            label={lang === 'zh' ? '模式' : 'Mode'}
            value={mode === 'single' ? 'SFT' : 'DPO'}
          />
        </div>

        <div className="mt-500 flex flex-wrap items-center gap-300">
          <button
            onClick={mode === 'single' ? exportSft : exportDpo}
            disabled={eligibleCount === 0}
            className="inline-flex items-center gap-200 rounded-pill bg-pushpin-450 text-mochimalist px-500 py-300 text-200 font-semibold shadow-raised hover:-translate-y-0.5 hover:shadow-lift transition-all duration-500 ease-apple disabled:opacity-30 disabled:hover:translate-y-0"
          >
            <Download className="w-4 h-4" strokeWidth={1.5} />
            {mode === 'single' ? t.exportSft : t.exportDpo}
          </button>
          {eligibleCount === 0 && (
            <span className="text-200 text-roboflow-500">{t.exportEmpty}</span>
          )}
        </div>
      </div>

      <div className="rounded-400 bg-cosmicore text-mochimalist p-700 shadow-lift">
        <div className="text-100 uppercase tracking-[0.2em] text-pushpin-200 font-semibold inline-flex items-center gap-200">
          <Layers className="w-4 h-4" strokeWidth={1.5} />
          schema preview
        </div>
        <pre className="mt-400 font-mono text-100 leading-relaxed text-mochimalist/85 overflow-x-auto">
{mode === 'single'
  ? `{
  "messages": [
    {"role":"user", "content": [
      {"type":"text", "text":"<rubric prompt>"},
      {"type":"image_url", "image_url":{"url":"data:image/..."}}
    ]},
    {"role":"assistant",
     "content": "{\\"scores\\":{...},\\"overall\\":4.2,\\"critique\\":\\"...\\"}"
    }
  ]
}`
  : `{
  "prompt":   {"role":"user","content":[<rubric>,A,B]},
  "chosen":   [{"role":"assistant","content":"{...winner=A...}"}],
  "rejected": [{"role":"assistant","content":"{...winner=B...}"}]
}`}
        </pre>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number | string
  accent?: boolean
}) {
  return (
    <div
      className={`rounded-300 p-400 ${
        accent ? 'bg-pushpin-450 text-mochimalist' : 'bg-roboflow-50 text-cosmicore'
      }`}
    >
      <div className="text-100 uppercase tracking-[0.16em] font-semibold opacity-80">
        {label}
      </div>
      <div className="mt-200 text-500 font-semibold tabular-nums">{value}</div>
    </div>
  )
}
