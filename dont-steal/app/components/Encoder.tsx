"use client"
import React, { useRef, useState } from 'react'

export default function Encoder() {
  const [mainFileName, setMainFileName] = useState('')
  const [markFileName, setMarkFileName] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const mainImgRef = useRef<HTMLImageElement | null>(null)
  const markImgRef = useRef<HTMLImageElement | null>(null)
  const mainInputRef = useRef<HTMLInputElement | null>(null)
  const markInputRef = useRef<HTMLInputElement | null>(null)
  const hiddenCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const markCanvasRef = useRef<HTMLCanvasElement | null>(null)

  function readImageFile(file: File) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const reader = new FileReader()
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.onload = () => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('Invalid image'))
        img.src = String(reader.result)
      }
      reader.readAsDataURL(file)
    })
  }

  async function handleEmbed() {
    setError('')
    if (!mainImgRef.current || !markImgRef.current) {
      setError('Please upload both main image and watermark (B/W).')
      return
    }
    setProcessing(true)

    try {
      const mainImg = mainImgRef.current
      const markImg = markImgRef.current
      const width = mainImg.naturalWidth
      const height = mainImg.naturalHeight

      const canvas = hiddenCanvasRef.current!
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(mainImg, 0, 0, width, height)

      const markCanvas = markCanvasRef.current!
      markCanvas.width = width
      markCanvas.height = height
      const mctx = markCanvas.getContext('2d')!
      mctx.clearRect(0,0,width,height)
      mctx.drawImage(markImg, 0, 0, width, height)

      const mainImageData = ctx.getImageData(0, 0, width, height)
      const markImageData = mctx.getImageData(0, 0, width, height)
      const mData = mainImageData.data
      const wData = markImageData.data

      // Embed a 10-pixel magic header pattern to aid detection (1011001110)
      const magic = [1,0,1,1,0,0,1,1,1,0]
      for (let h=0; h<10; h++) {
        const idx = h*4
        if (magic[h]) mData[idx] |= 1
        else mData[idx] &= ~1
      }

      const total = mData.length
      const chunk = 1024*4
      for (let start = 40; start < total; start += chunk) {
        const end = Math.min(start + chunk, total)
        for (let i = start; i < end; i += 4) {
          const rIdx = i
          const wr = wData[i]
          const wg = wData[i+1]
          const wb = wData[i+2]
          const brightness = (wr*0.299 + wg*0.587 + wb*0.114)
          if (brightness > 128) {
            mData[rIdx] |= 1
          } else {
            mData[rIdx] &= ~1
          }
        }
        await new Promise(r => setTimeout(r, 0))
      }

      ctx.putImageData(mainImageData, 0, 0)

      const png = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = png
      a.download = `watermarked_${mainFileName || 'image'}.png`
      document.body.appendChild(a)
      a.click()
      a.remove()

    } catch (err: any) {
      console.error(err)
      setError('Embedding failed: ' + (err?.message || err))
    } finally {
      setProcessing(false)
    }
  }

  async function handleMainChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    setMainFileName(f.name)
    try {
      const img = await readImageFile(f)
      mainImgRef.current = img
    } catch (err) {
      setError('Failed to load main image')
    }
  }

  async function handleMarkChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0]
    if (!f) return
    setMarkFileName(f.name)
    try {
      const img = await readImageFile(f)
      markImgRef.current = img
    } catch (err) {
      setError('Failed to load watermark image')
    }
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-3">Encoder — Embed Watermark</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card flex flex-col items-center justify-center p-4 w-full">
          <div className="text-sm text-muted mb-2">Main Photo (cover)</div>
          <button type="button" onClick={() => mainInputRef.current?.click()} className="w-full inline-flex items-center justify-center px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white hover:bg-slate-700 transition">
            Browse Main Image
          </button>
          <input ref={mainInputRef} className="hidden" type="file" accept="image/*" onChange={handleMainChange} />
          <div className="mt-3 text-xs text-center text-muted">{mainFileName || 'PNG/JPG recommended, max quality'}</div>
        </div>

        <div className="card flex flex-col items-center justify-center p-4 w-full">
          <div className="text-sm text-muted mb-2">Black & White Watermark</div>
          <button type="button" onClick={() => markInputRef.current?.click()} className="w-full inline-flex items-center justify-center px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white hover:bg-slate-700 transition">
            Browse Watermark Image
          </button>
          <input ref={markInputRef} className="hidden" type="file" accept="image/*" onChange={handleMarkChange} />
          <div className="mt-3 text-xs text-center text-muted">{markFileName || 'Use a black & white image for best results'}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center space-x-3">
        <button onClick={handleEmbed} disabled={processing} className="w-full sm:w-auto px-4 py-2 bg-purple-600 rounded disabled:opacity-60">{processing ? 'Embedding...' : 'Embed & Download'}</button>
        {error && <div className="text-red-400">{error}</div>}
      </div>

      <canvas ref={hiddenCanvasRef} style={{display:'none'}} />
      <canvas ref={markCanvasRef} style={{display:'none'}} />
    </div>
  )
}
