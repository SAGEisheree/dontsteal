"use client"
import React, { useRef, useState } from 'react'

export default function Encoder() {
  const [mainFileName, setMainFileName] = useState('')
  const [markFileName, setMarkFileName] = useState('')
  const [mainImgSrc, setMainImgSrc] = useState('')
  const [markImgSrc, setMarkImgSrc] = useState('')
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
      mctx.clearRect(0, 0, width, height)
      mctx.drawImage(markImg, 0, 0, width, height)

      const mainImageData = ctx.getImageData(0, 0, width, height)
      const markImageData = mctx.getImageData(0, 0, width, height)
      const mData = mainImageData.data
      const wData = markImageData.data

      // Embed a 10-pixel magic header pattern to aid detection (1011001110)
      const magic = [1, 0, 1, 1, 0, 0, 1, 1, 1, 0]
      for (let h = 0; h < 10; h++) {
        const idx = h * 4
        if (magic[h]) mData[idx] |= 1
        else mData[idx] &= ~1
      }

      const total = mData.length
      const chunk = 1024 * 4
      for (let start = 40; start < total; start += chunk) {
        const end = Math.min(start + chunk, total)
        for (let i = start; i < end; i += 4) {
          const rIdx = i
          const wr = wData[i]
          const wg = wData[i + 1]
          const wb = wData[i + 2]
          const brightness = (wr * 0.299 + wg * 0.587 + wb * 0.114)
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
      setMainImgSrc(img.src)
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
      setMarkImgSrc(img.src)
    } catch (err) {
      setError('Failed to load watermark image')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#ABF203] brutalist-border p-5 sm:p-6 flex flex-col items-center justify-center text-center">
          <div className="font-bold text-black mb-4 uppercase tracking-wider text-sm sm:text-base">Main Photo (cover)</div>

          {mainImgSrc ? (
            <div className="mb-4 w-full aspect-video bg-white brutalist-border overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => mainInputRef.current?.click()}>
              <img src={mainImgSrc} alt="Main preview" className="object-contain w-full h-full" />
            </div>
          ) : (
            <button type="button" onClick={() => mainInputRef.current?.click()} className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-white brutalist-button font-bold text-black hover:bg-slate-100 transition whitespace-normal sm:whitespace-nowrap text-sm sm:text-base">
              BROWSE IMAGE
            </button>
          )}

          <input ref={mainInputRef} className="hidden" type="file" accept="image/*" onChange={handleMainChange} />
          <div className="mt-4 text-xs sm:text-sm font-medium text-black/80">{mainFileName || 'PNG/JPG recommended'}</div>
        </div>

        <div className="bg-[#ABF203] brutalist-border p-5 sm:p-6 flex flex-col items-center justify-center text-center">
          <div className="font-bold text-black mb-4 uppercase tracking-wider text-sm sm:text-base">B/W Watermark</div>

          {markImgSrc ? (
            <div className="mb-4 w-full aspect-video bg-white brutalist-border overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => markInputRef.current?.click()}>
              <img src={markImgSrc} alt="Watermark preview" className="object-contain w-full h-full" />
            </div>
          ) : (
            <button type="button" onClick={() => markInputRef.current?.click()} className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-white brutalist-button font-bold text-black hover:bg-slate-100 transition whitespace-normal sm:whitespace-nowrap text-sm sm:text-base">
              BROWSE WATERMARK
            </button>
          )}

          <input ref={markInputRef} className="hidden" type="file" accept="image/*" onChange={handleMarkChange} />
          <div className="mt-4 text-xs sm:text-sm font-medium text-black/80">{markFileName || 'Use black & white'}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
        <button onClick={handleEmbed} disabled={processing} className="w-full sm:w-auto px-8 py-4 bg-[#1D4ED8] brutalist-button text-white font-black text-xl disabled:opacity-60 uppercase">
          {processing ? 'Processing...' : 'Embed & Download'}
        </button>
        {error && <div className="text-[#EF4444] font-bold bg-white px-4 py-2 brutalist-border">{error}</div>}
      </div>

      <canvas ref={hiddenCanvasRef} style={{ display: 'none' }} />
      <canvas ref={markCanvasRef} style={{ display: 'none' }} />
    </div>
  )
}
