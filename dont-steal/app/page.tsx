"use client"
import React, { useState } from 'react'
import Nvbr from './navbar/nvbr'
import Encoder from './components/Encoder'
import Decoder from './components/Decoder'

export default function Home() {
  const [tab, setTab] = useState<'encoder'|'decoder'>('encoder')
  return (
    <div className="">
      <Nvbr />
      <main style={{ padding: 24 }}>
        <div className="min-h-screen p-8">
          <div className="container mx-auto">
            <header className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-semibold">Invisible LSB Steganography</h1>
              <nav className="space-x-2">
                <button onClick={() => setTab('encoder')} className={`px-3 py-1 rounded ${tab==='encoder' ? 'bg-purple-600' : 'bg-white/5'}`}>Tab 1: Embed Watermark</button>
                <button onClick={() => setTab('decoder')} className={`px-3 py-1 rounded ${tab==='decoder' ? 'bg-purple-600' : 'bg-white/5'}`}>Tab 2: Extract & Verify</button>
              </nav>
            </header>

            <main className="grid grid-cols-1 gap-6">
              <div className="card p-6">
                {tab === 'encoder' ? <Encoder /> : <Decoder />}
              </div>

              <footer className="text-sm text-muted">All processing happens client-side in the browser. Exports are lossless PNG.</footer>
            </main>
          </div>
        </div>
      </main>
    </div>
  )
}
