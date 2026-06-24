"use client"
import React, { useState } from 'react'
import Encoder from './components/Encoder'
import Decoder from './components/Decoder'

export default function Home() {
  const [tab, setTab] = useState<'encoder'|'decoder'>('encoder')
  return (
    <div className="">
      <main style={{ padding: 24 }}>
        <div className="min-h-screen p-8">
          <div className="container mx-auto">
            <header className="flex flex-col gap-4 sm:gap-6 mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-semibold">Art sheriff</h1>
                  <p className="mt-2 max-w-2xl text-sm text-muted">Add an invisible watermark on main image.select black and white picture of watermark. Resizing,compression will reduce effectiveness of watermark</p>
                </div>
                <div className="flex w-full sm:w-auto gap-2">
                  <button onClick={() => setTab('encoder')} className={`w-full sm:w-auto px-4 py-2 rounded ${tab==='encoder' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-100'}`}>Embed Watermark</button>
                  <button onClick={() => setTab('decoder')} className={`w-full sm:w-auto px-4 py-2 rounded ${tab==='decoder' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-100'}`}>Extract & Verify</button>
                </div>
              </div>
            </header>

            <main className="grid grid-cols-1 gap-6">
              <div className="card p-6">
                {tab === 'encoder' ? <Encoder /> : <Decoder />}
              </div>

              <footer className="text-sm text-muted">All processing happens locally and no data is sent anywhere.</footer>
            </main>
          </div>
        </div>
      </main>
    </div>
  )
}
