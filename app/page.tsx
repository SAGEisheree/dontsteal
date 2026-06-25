"use client"
import React, { useState } from 'react'
import Encoder from './components/Encoder'
import Decoder from './components/Decoder'

export default function Home() {
  const [tab, setTab] = useState<'encoder'|'decoder'>('encoder')
  return (
    <div className="page-shell relative min-h-screen overflow-hidden">
      <div className="background-grid" aria-hidden="true" />
      <main className="relative z-10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <section className="glass-panel p-8 sm:p-10 mb-8">
            <div className="flex flex-col gap-6 lg:gap-8">
              <div className="flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <p className="text-3xl font-bold uppercase tracking-[0.24em] text-purple-700">Art sheriff</p>
                  <h1 className="text-3xl sm:text-5xl font-semibold leading-tight">Secure your images with invisible watermark</h1>
                  <p className="mt-3 text-base sm:text-lg text-slate-700/85">Add an invisible watermark on main image.select black and white picture of watermark. Resizing,compression will reduce effectiveness of watermark.</p>
                </div>
                <div className="rounded-3xl border border-white/60 bg-white/90 p-4 shadow-xl shadow-slate-900/10 sm:w-auto">
                  <p className="text-sm text-slate-600">Local-first privacy</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">No uploads • No servers</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid w-full sm:w-auto grid-cols-2 gap-2">
                </div>
                <div className="flex w-full sm:w-auto gap-2">
                  <button onClick={() => setTab('encoder')} className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-medium transition ${tab==='encoder' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'}`}>Embed Watermark</button>
                  <button onClick={() => setTab('decoder')} className={`w-full sm:w-auto px-5 py-3 rounded-2xl font-medium transition ${tab==='decoder' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'bg-slate-800 text-slate-100 hover:bg-slate-700'}`}>Extract & Verify</button>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-panel p-6 sm:p-8">
            <div className="grid gap-6">
              <div className="card p-6">
                {tab === 'encoder' ? <Encoder /> : <Decoder />}
              </div>
              <footer className="text-sm text-slate-700/70">All processing happens locally and no data is sent anywhere.</footer>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
