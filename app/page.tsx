"use client"

import { useState } from 'react'
import { toast, Toaster } from 'sonner'
import { Loader2, Scissors, Video, Wand2 } from 'lucide-react'
import { useReelStore } from '@/lib/store'
import { generateScript } from '@/lib/generate'
import { ReelEditor } from '@/components/ReelEditor'

export default function Page() {
  const [loading, setLoading] = useState(false)
  const [topic, setTopic] = useState('Top 5 productivity tips for developers')
  const { setScenes, reset } = useReelStore()

  const onGenerate = async () => {
    setLoading(true)
    try {
      const script = await generateScript(topic)
      setScenes(script.scenes)
      toast.success('Script generated. You can edit scenes now.')
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to generate script')
    } finally {
      setLoading(false)
    }
  }

  const onReset = () => {
    reset()
  }

  return (
    <main className="space-y-6">
      <Toaster richColors />
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Video className="w-6 h-6" /> Reel Maker AI
        </h1>
      </header>

      <section className="rounded-lg border border-white/10 p-4 space-y-3">
        <div className="grid md:grid-cols-[1fr,auto,auto] gap-3 items-center">
          <input
            className="input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter topic, product, or script idea"
          />
          <button className="btn" onClick={onGenerate} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            Generate Script
          </button>
          <button className="btn bg-secondary text-secondary-foreground" onClick={onReset}>
            <Scissors className="w-4 h-4" /> Reset
          </button>
        </div>
        <p className="text-sm text-white/70">AI will create a punchy hook, a sequence of scenes with captions, and timing optimized for a 9:16 reel.</p>
      </section>

      <ReelEditor />
    </main>
  )
}
