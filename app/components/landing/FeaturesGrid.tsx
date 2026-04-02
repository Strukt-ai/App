"use client"

import { useEffect, useState } from "react"
import { Filter, Search, Sparkles, Box, SwatchBook, Layers3 } from "lucide-react"

export function FeaturesGrid() {
  const [warehouseLoaded, setWarehouseLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setWarehouseLoaded(true), 1400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="py-24 bg-[#090a0e] border-t border-white/5 relative" aria-labelledby="feature-title">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_30%,rgba(87,126,255,0.12),transparent_36%),radial-gradient(circle_at_90%_70%,rgba(255,194,71,0.1),transparent_34%)]" />

      <div className="container mx-auto px-6 md:px-10 relative z-10">
        <div className="text-center mb-16">
          <h2 id="feature-title" className="text-3xl md:text-5xl font-heading font-bold mb-4 tracking-tight text-white">
            Core Platform Systems
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto md:text-lg">
            Spatial intelligence, modular furniture AI, material realism, and a robust warehouse stack.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <article className="glass-card rounded-2xl p-7 border border-white/10 overflow-hidden">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#ffd18a]">
              <Box size={14} />
              Feature 1
            </div>
            <h3 className="mt-3 text-2xl font-heading font-bold text-white">2D to 3D Spatial Engine</h3>
            <p className="mt-2 text-zinc-400">Instant Spatial Intelligence: linework transforms into volumetric walls and openings in seconds.</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-zinc-950 p-4">
                <p className="text-xs text-zinc-500">2D Floorplan</p>
                <div className="mt-3 h-48 rounded-lg border border-white/15 landing-plan-lines" />
              </div>
              <div className="rounded-xl border border-[#ffc661]/30 bg-[#ffc247]/10 p-4">
                <p className="text-xs text-zinc-700">Extruded 3D</p>
                <div className="mt-3 h-48 rounded-lg border border-[#ffc661]/40 landing-extrude-box" />
              </div>
            </div>
          </article>

          <article className="glass-card rounded-2xl p-7 border border-white/10 overflow-hidden">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#ffd18a]">
              <Layers3 size={14} />
              Feature 2
            </div>
            <h3 className="mt-3 text-2xl font-heading font-bold text-white">Furn AI Bidirectional Editing</h3>
            <p className="mt-2 text-zinc-400">Explode any furniture object into cushion, legs, and frame. Swap parts and push updates back into the room graph.</p>

            <div className="mt-6 h-62 rounded-xl border border-white/10 bg-zinc-950 p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,194,71,0.15),transparent_52%)]" />
              <div className="relative h-full flex items-center justify-center">
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-16 rounded-xl bg-blue-200/70 border border-white/20 animate-[float_4s_ease-in-out_infinite]" />
                <div className="absolute top-28 left-1/2 -translate-x-1/2 w-44 h-24 rounded-2xl bg-zinc-300/90 border border-white/25" />
                <div className="absolute top-36 left-[30%] w-10 h-14 rounded-md bg-zinc-600 animate-[float_4.8s_ease-in-out_infinite]" />
                <div className="absolute top-36 right-[30%] w-10 h-14 rounded-md bg-zinc-600 animate-[float_4.4s_ease-in-out_infinite]" />
                <div className="absolute bottom-3 right-3 text-[11px] px-2 py-1 rounded border border-[#ffc661]/35 text-[#ffd188] bg-black/55">Hot-swap enabled</div>
              </div>
            </div>
          </article>

          <article className="glass-card rounded-2xl p-7 border border-white/10 overflow-hidden">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#ffd18a]">
              <SwatchBook size={14} />
              Feature 3
            </div>
            <h3 className="mt-3 text-2xl font-heading font-bold text-white">Texturize & Render</h3>
            <p className="mt-2 text-zinc-400">Click a finish such as Walnut Laminate and instantly update room surfaces and render output.</p>

            <div className="mt-6 rounded-xl border border-white/10 bg-zinc-950 p-4">
              <div className="h-52 rounded-lg bg-[linear-gradient(120deg,#9b7b5a_0%,#6c543f_45%,#3c3028_100%)] border border-white/15 relative overflow-hidden">
                <div className="absolute top-3 left-3 text-[11px] px-2 py-1 rounded bg-black/55 border border-white/20 text-zinc-200">Living Room Preview</div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {["Walnut Laminate", "Ivory Tile", "Charcoal Oak", "Concrete Matte"].map((label, i) => (
                  <button
                    suppressHydrationWarning
                    key={label}
                    className={`text-xs px-3 py-2 rounded-md border ${i === 0 ? "bg-[#ffc247] text-black border-[#ffc247]" : "bg-white/4 text-zinc-300 border-white/20 hover:border-white/40"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </article>

          <article id="warehouse" className="glass-card rounded-2xl p-7 border border-white/10 overflow-hidden">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#ffd18a]">
              <Filter size={14} />
              Feature 4
            </div>
            <h3 className="mt-3 text-2xl font-heading font-bold text-white">The Warehouse</h3>
            <p className="mt-2 text-zinc-400">A dense filter UI for brands, categories, and swatches inspired by commerce-scale catalogs.</p>

            <div className="mt-6 h-76.5 rounded-xl border border-white/10 bg-black/45 overflow-hidden grid grid-cols-[220px_1fr]">
              <aside className="border-r border-white/10 p-4 bg-zinc-950/90">
                <div className="text-xs text-zinc-400 uppercase tracking-[0.16em]">Filters</div>
                <div className="mt-3 flex items-center gap-2 px-2 py-2 rounded-lg border border-white/10 text-zinc-500 text-xs">
                  <Search size={13} />
                  Search materials
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  {[
                    "Brand: Greenlam",
                    "Brand: Kajaria",
                    "Category: Laminates",
                    "Category: Tiles",
                    "Finish: Matte",
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-2 text-zinc-300">
                      <input type="checkbox" className="accent-[#ffc247]" defaultChecked={item.includes("Category") || item.includes("Greenlam")} />
                      {item}
                    </label>
                  ))}
                </div>
              </aside>

              <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {!warehouseLoaded &&
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden">
                      <div className="h-20 bg-zinc-800 landing-skeleton" />
                      <div className="p-2">
                        <div className="h-2 w-2/3 bg-zinc-700 rounded landing-skeleton" />
                        <div className="h-2 w-1/2 bg-zinc-700 rounded mt-2 landing-skeleton" />
                      </div>
                    </div>
                  ))}

                {warehouseLoaded &&
                  [
                    ["Greenlam", "Rust Cedar", "#7e5e40"],
                    ["Kajaria", "Ivory Soft", "#ddd6c8"],
                    ["Asian Paints", "Slate Calm", "#6f7480"],
                    ["Berger", "Terracotta", "#9f5c43"],
                    ["Johnson", "Moss Grey", "#7a7b66"],
                    ["Action Tesa", "Dark Walnut", "#4a3528"],
                  ].map(([brand, name, color]) => (
                    <div key={name} className="rounded-lg border border-white/10 bg-zinc-900 overflow-hidden hover:border-[#ffc661]/45 transition-colors">
                      <div className="h-20" style={{ backgroundColor: color }} />
                      <div className="p-2">
                        <p className="text-[11px] text-zinc-500 uppercase tracking-wide">{brand}</p>
                        <p className="text-xs text-zinc-100">{name}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </article>
        </div>

        <article className="mt-8 rounded-2xl border border-white/10 bg-[rgba(17,17,20,0.86)] backdrop-blur-lg p-6 md:p-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_80%_50%,rgba(255,194,71,0.12),transparent_60%)]" />

          <div className="grid lg:grid-cols-2 gap-8 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#ffd18a]">
                <Sparkles size={14} />
                Natural Language AI
              </div>
              <h3 className="mt-3 text-2xl md:text-3xl font-heading font-bold text-white">Command the space, not the software</h3>
              <p className="mt-2 text-zinc-400 max-w-xl">
                Type: Change the flooring to oak and extend the living room. Strukt re-solves geometry and updates material maps with editable output.
              </p>
            </div>

            <div className="relative rounded-xl border border-white/10 bg-zinc-950 h-64 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(145deg,#2a2f3b_0%,#1a1f2b_45%,#101419_100%)]" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/20 bg-black/45 backdrop-blur-lg p-3">
                <div className="text-xs text-zinc-400">AI Chat</div>
                <p className="mt-1 text-sm text-zinc-100 landing-typing">Change the flooring to oak and extend the living room</p>
                <div className="mt-2 text-[11px] text-[#ffd188] uppercase tracking-[0.14em] inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#ffc247] animate-pulse" />
                  Regenerating 3D Space...
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
