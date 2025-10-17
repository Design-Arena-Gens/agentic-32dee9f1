"use client"

import { useMemo, useRef, useState } from 'react'
import { Play, Pause, Download, Mic, Music2, Film, Loader2 } from 'lucide-react'
import { useReelStore } from '@/lib/store'
import { useInterval } from 'usehooks-ts'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

const CORE_VERSION = '0.12.4'
const CORE_BASE = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist`

export function ReelEditor() {
  const { scenes } = useReelStore()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const totalMs = useMemo(() => scenes.reduce((acc, s) => acc + (s.durationMs ?? 1500), 0), [scenes])

  // Draw frames to canvas
  const [t, setT] = useState(0)
  useInterval(() => {
    if (!isPlaying || !canvasRef.current) return
    setT((prev) => {
      const next = prev + 33
      if (next >= totalMs) setIsPlaying(false)
      return next
    })

    const ctx = canvasRef.current.getContext('2d')!
    const width = 720
    const height = 1280
    canvasRef.current.width = width
    canvasRef.current.height = height
    ctx.fillStyle = '#0b0e1a'
    ctx.fillRect(0, 0, width, height)

    // determine scene
    let elapsed = 0
    for (const scene of scenes) {
      const dur = scene.durationMs ?? 1500
      if (t < elapsed + dur) {
        // background
        ctx.fillStyle = scene.bg ?? '#111827'
        ctx.fillRect(0, 0, width, height)
        // caption
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 48px ui-sans-serif, system-ui, -apple-system'
        ctx.textAlign = 'center'
        wrapText(ctx, scene.caption, width / 2, height * 0.2, width * 0.8, 56)
        // subtext
        if (scene.subcaption) {
          ctx.font = '28px ui-sans-serif, system-ui, -apple-system'
          wrapText(ctx, scene.subcaption, width / 2, height * 0.8, width * 0.8, 34)
        }
        break
      }
      elapsed += dur
    }
  }, 33)

  const handlePlay = () => {
    if (!scenes.length) return
    setT(0)
    setIsPlaying(true)
  }

  const handleRecord = async () => {
    if (!canvasRef.current) return
    setIsRecording(true)
    setLoading(true)

    const stream = (canvasRef.current as any).captureStream(30)
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' })
    const chunks: Blob[] = []
    recorder.ondataavailable = (e) => chunks.push(e.data)
    recorder.onstop = async () => {
      const webmBlob = new Blob(chunks, { type: 'video/webm' })
      const webmUrl = URL.createObjectURL(webmBlob)
      setVideoUrl(webmUrl)
      setIsRecording(false)
      setLoading(false)
    }
    recorder.start()
    setT(0)
    setIsPlaying(true)
    setTimeout(() => {
      recorder.stop()
      setIsPlaying(false)
    }, totalMs + 200)
  }

  const handleDownloadMp4 = async () => {
    if (!videoUrl) return
    setLoading(true)
    try {
      const ffmpeg = new FFmpeg()
      await ffmpeg.load({ coreURL: `${CORE_BASE}/ffmpeg-core.js`, wasmURL: `${CORE_BASE}/ffmpeg-core.wasm` })
      const data = await fetchFile(videoUrl)
      await ffmpeg.writeFile('input.webm', data)
      await ffmpeg.exec(['-i', 'input.webm', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'out.mp4'])
      const mp4 = await ffmpeg.readFile('out.mp4')
      const blob = new Blob([mp4], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'reel.mp4'
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="grid md:grid-cols-[360px,1fr] gap-6">
      <div className="space-y-3">
        <div className="rounded-lg border border-white/10 p-3">
          <h3 className="font-medium mb-2 flex items-center gap-2"><Film className="w-4 h-4"/> Scenes</h3>
          {!scenes.length ? (
            <p className="text-sm text-white/60">No scenes yet. Generate a script above.</p>
          ) : (
            <ol className="space-y-2">
              {scenes.map((s, idx) => (
                <li key={idx} className="text-sm p-2 rounded bg-muted/40 flex items-center justify-between">
                  <span>{s.caption}</span>
                  <span className="opacity-70">{Math.round((s.durationMs ?? 1500)/1000)}s</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={handlePlay}><Play className="w-4 h-4"/> Preview</button>
          <button className="btn" onClick={handleRecord} disabled={!scenes.length || isRecording}>
            {isRecording ? <Loader2 className="w-4 h-4 animate-spin"/> : <Mic className="w-4 h-4"/>}
            Record
          </button>
          <button className="btn" onClick={handleDownloadMp4} disabled={!videoUrl}>
            <Download className="w-4 h-4"/> MP4
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-white/10 p-3 flex items-center justify-center bg-black/30">
        <canvas ref={canvasRef} className="w-[270px] h-[480px] bg-black rounded" />
      </div>
    </section>
  )
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(' ')
  let line = ''
  let yy = y
  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' '
    const metrics = ctx.measureText(testLine)
    if (metrics.width > maxWidth && n > 0) {
      ctx.fillText(line, x, yy)
      line = words[n] + ' '
      yy += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, yy)
}
