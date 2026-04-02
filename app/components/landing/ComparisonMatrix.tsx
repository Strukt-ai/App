"use client"

import { Check, X } from "lucide-react"

export function ComparisonMatrix() {
  return (
    <section className="py-24 bg-[#0a0b10] relative overflow-hidden" aria-labelledby="matrix-title">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-170 h-170 bg-[#ffc247]/10 blur-150 rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10 max-w-6xl">
        <div className="mb-12 text-center">
          <h2 id="matrix-title" className="text-3xl md:text-5xl font-heading font-bold mb-4 tracking-tight">
            The Old Way vs. <span className="text-[#ffc661]">Strukt AI</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto md:text-lg">
            Legacy tools are slow and expensive. Standard image Gen-AI is quick but not editable. Strukt AI combines speed with production-grade control.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 overflow-hidden bg-[rgba(14,14,18,0.78)] backdrop-blur-md">
          <div className="grid grid-cols-4 border-b border-white/10">
            <div className="px-4 py-4 text-xs uppercase tracking-[0.2em] text-zinc-500">Capability</div>
            <div className="px-4 py-4 text-sm font-semibold text-zinc-300">Legacy 3D</div>
            <div className="px-4 py-4 text-sm font-semibold text-zinc-300">Standard Gen-AI</div>
            <div className="px-4 py-4 text-sm font-semibold text-[#ffd58f] bg-[#ffc247]/8">Strukt AI</div>
          </div>

          {[
            ["Model turnaround", "Slow", "Fast", "Fast"],
            ["Editable geometry", "Yes", "No", "Yes"],
            ["Spatial intelligence", "Manual", "Generic", "Automatic"],
            ["Material fidelity", "Manual setup", "Hallucinated", "Real brands + PBR"],
            ["Cost profile", "Expensive", "Cheap but limited", "Production-efficient"],
          ].map((row, idx) => (
            <div key={row[0]} className={`grid grid-cols-4 border-b border-white/5 ${idx === 4 ? "border-b-0" : ""}`}>
              <div className="px-4 py-4 text-zinc-400 text-sm">{row[0]}</div>
              <div className="px-4 py-4 text-zinc-300 text-sm inline-flex items-center gap-2">
                {row[1] === "Yes" ? <Check size={14} className="text-emerald-400" /> : <X size={14} className="text-rose-400" />}
                {row[1]}
              </div>
              <div className="px-4 py-4 text-zinc-300 text-sm inline-flex items-center gap-2">
                {row[2] === "No" || row[2] === "Generic" ? <X size={14} className="text-rose-400" /> : <Check size={14} className="text-emerald-400" />}
                {row[2]}
              </div>
              <div className="px-4 py-4 text-white text-sm font-medium inline-flex items-center gap-2 bg-[#ffc247]/5">
                <Check size={14} className="text-[#ffd379]" />
                {row[3]}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
