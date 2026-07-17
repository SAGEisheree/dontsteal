"use client"
import React, { useRef, useState } from 'react'

export default function Decoder() {
  const [fileName, setFileName] = useState('')
  const [status, setStatus] = useState('Idle')
  const [processing, setProcessing] = useState(false)
  const [warning, setWarning] = useState('')
  const imgRef = useRef<HTMLImageElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const outCanvasRef = useRef<HTMLCanvasElement | null>(null)

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

  async function handleDecode(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0]
    setWarning('')
    setStatus('')
    if (!f) return
    setFileName(f.name)

    if (f.type !== 'image/png') {
      setWarning('Warning: Decoder expects a PNG. Uploaded file may have lossy compression.')
    }

    setProcessing(true)
    setStatus('Scanning...')

    try {
      const img = await readImageFile(f)
      imgRef.current = img

      const width = img.naturalWidth
      const height = img.naturalHeight

      const canvas = canvasRef.current!
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data

      const out = outCanvasRef.current!
      out.width = width
      out.height = height
      const octx = out.getContext('2d')!
      const outImg = octx.createImageData(width, height)
      const outData = outImg.data

      const magicExpected = [1, 0, 1, 1, 0, 0, 1, 1, 1, 0]
      let headerMatches = 0
      for (let h = 0; h < 10; h++) {
        const idx = h * 4
        const bit = data[idx] & 1
        if (bit === magicExpected[h]) headerMatches++
      }

      let ones = 0
      const totalPixels = data.length / 4

      const chunkPixels = 32768
      for (let start = 0; start < totalPixels; start += chunkPixels) {
        const end = Math.min(start + chunkPixels, totalPixels)
        for (let p = start; p < end; p++) {
          const i = p * 4
          const bit = data[i] & 1
          if (bit) {
            ones++
            outData[i] = 255
            outData[i + 1] = 0
            outData[i + 2] = 127
            outData[i + 3] = 255
          } else {
            outData[i] = 0
            outData[i + 1] = 0
            outData[i + 2] = 0
            outData[i + 3] = 0
          }
        }
        await new Promise(r => setTimeout(r, 0))
      }

      octx.putImageData(outImg, 0, 0)

      const onesPct = (ones / totalPixels) * 100

      if (headerMatches >= 8 || onesPct > 0.5) {
        setStatus(`Watermark Detected! (${onesPct.toFixed(2)}% bits set)`)
      } else {
        setStatus(`No Watermark Found (${onesPct.toFixed(2)}% bits set)`)
      }

    } catch (err: any) {
      console.error(err)
      setStatus('Failed to decode: ' + (err?.message || err))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full text-black">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#ABF203] brutalist-border p-5 sm:p-6 flex flex-col justify-center items-center text-center">
          <div className="font-bold uppercase tracking-wider mb-4 text-sm sm:text-base">Upload Watermarked PNG</div>
          <button type="button" onClick={() => inputRef.current?.click()} className="w-full inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-white brutalist-button font-bold text-black uppercase hover:bg-slate-100 transition whitespace-normal sm:whitespace-nowrap text-sm sm:text-base">
            BROWSE WATERMARKED FILE
          </button>
          <input ref={inputRef} className="hidden" type="file" accept="image/png" onChange={handleDecode} />
          <div className="mt-4 text-xs sm:text-sm font-medium text-black/80">{fileName || 'Select the exported PNG to verify watermark'}</div>
          {warning && <div className="text-[#EF4444] font-bold bg-white mt-4 px-4 py-2 brutalist-border">{warning}</div>}

          <div className="mt-4 p-4 brutalist-border bg-white w-full uppercase">
            <span className="opacity-70 text-sm">Status:</span><br />
            <span className="font-black text-lg sm:text-xl text-[#1D4ED8] mt-1 inline-block">
              {processing ? 'Processing...' : status}
            </span>
          </div>
        </div>

        <div className="bg-white brutalist-border p-6">
          <div className="font-bold text-black mb-4 uppercase tracking-wider text-center">Preview / Highlight</div>
          <div className="flex flex-col gap-4">
            <div className="brutalist-border p-2 bg-[#F4F4F4] relative">
              <div className="absolute top-0 right-0 bg-[#ABF203] text-xs font-bold px-2 py-1 border-b-2 border-l-2 border-[#111111] z-10">ORIGINAL</div>
              <canvas ref={canvasRef} className="w-full h-auto block bg-white" style={{ maxWidth: '100%', minHeight: '60px' }} />
            </div>
            <div className="brutalist-border p-2 bg-[#F4F4F4] relative">
              <div className="absolute top-0 right-0 bg-[#FF483F] text-white text-xs font-bold px-2 py-1 border-b-2 border-l-2 border-[#111111] z-10">EXTRACTED</div>
              <canvas ref={outCanvasRef} className="w-full h-auto block bg-white" style={{ maxWidth: '100%', minHeight: '60px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
