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
      const imageData = ctx.getImageData(0,0,width,height)
      const data = imageData.data

      const out = outCanvasRef.current!
      out.width = width
      out.height = height
      const octx = out.getContext('2d')!
      const outImg = octx.createImageData(width, height)
      const outData = outImg.data

      const magicExpected = [1,0,1,1,0,0,1,1,1,0]
      let headerMatches = 0
      for (let h=0; h<10; h++) {
        const idx = h*4
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
            outData[i+1] = 0
            outData[i+2] = 127
            outData[i+3] = 255
          } else {
            outData[i] = 0
            outData[i+1] = 0
            outData[i+2] = 0
            outData[i+3] = 0
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
    <div>
      <h2 className="text-lg font-medium mb-3">Decoder — Extract & Verify</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="card">
          <div className="text-sm text-muted mb-2">Upload Watermarked PNG</div>
          <button type="button" onClick={() => inputRef.current?.click()} className="w-full inline-flex items-center justify-center px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white hover:bg-slate-700 transition">
            Browse Watermarked File
          </button>
          <input ref={inputRef} className="hidden" type="file" accept="image/png" onChange={handleDecode} />
          <div className="mt-2 text-xs text-muted">{fileName || 'Select the exported PNG to verify watermark'}</div>
          {warning && <div className="text-yellow-300 mt-2">{warning}</div>}
          <div className="mt-3">Status: <span className="font-medium">{processing ? 'Processing...' : status}</span></div>
        </div>

        <div className="card">
          <div className="text-sm text-muted mb-2">Preview / Highlight</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="border p-1">
              <canvas ref={canvasRef} className="w-full h-auto block" style={{maxWidth:'100%'}} />
            </div>
            <div className="border p-1">
              <canvas ref={outCanvasRef} className="w-full h-auto block" style={{maxWidth:'100%'}} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
