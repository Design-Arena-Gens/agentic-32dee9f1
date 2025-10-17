import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const system = `You are a short-form video scriptwriter. Create a tight hook and 4-7 short scenes. Each scene must include: caption (<= 12 words), optional subcaption (<= 14 words), durationMs (1000-2200), and bg as a hex color.`

export async function POST(req: NextRequest) {
  const { topic } = await req.json()
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    // deterministic fallback
    return NextResponse.json({
      hook: `Why ${topic} matters in 30 seconds`,
      cta: 'Follow for more tips',
      scenes: [
        { caption: 'Hook: Big promise', subcaption: 'What you will learn', durationMs: 1600, bg: '#1f2937' },
        { caption: 'Tip 1: Keep it simple', subcaption: 'Clarity beats cleverness', durationMs: 1600, bg: '#111827' },
        { caption: 'Tip 2: Batch tasks', subcaption: 'Reduce context switching', durationMs: 1600, bg: '#0b1020' },
        { caption: 'Tip 3: Automate routine', subcaption: 'Let scripts work', durationMs: 1600, bg: '#0f172a' },
        { caption: 'Tip 4: Use keyboard', subcaption: 'Faster navigation', durationMs: 1600, bg: '#1f2937' },
        { caption: 'Tip 5: Review daily', subcaption: 'Iterate relentlessly', durationMs: 1600, bg: '#111827' },
        { caption: 'CTA: Try one today', subcaption: 'Save and share your reel', durationMs: 1600, bg: '#0b1020' }
      ]
    })
  }

  const openai = new OpenAI({ apiKey })
  const prompt = `Topic: ${topic}\n${system}\nReturn ONLY JSON with keys hook, cta, scenes[].`
  const chat = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
  })
  const content = chat.choices[0]?.message?.content ?? ''
  let json
  try {
    json = JSON.parse(content)
  } catch {
    // attempt to extract JSON
    const match = content.match(/\{[\s\S]*\}/)
    if (!match) return NextResponse.json({ error: 'Malformed response' }, { status: 500 })
    json = JSON.parse(match[0])
  }
  return NextResponse.json(json)
}
