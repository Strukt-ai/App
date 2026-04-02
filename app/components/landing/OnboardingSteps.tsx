"use client"

import { Upload, Box, Edit3, Image as ImageIcon } from "lucide-react"
import { motion } from "framer-motion"

const STEPS = [
  {
    id: "01",
    icon: Upload,
    title: "Upload 2D Plan",
    description: "Drop your PDF, CAD, or image floor plan. Our AI digitizes dimensions and wall boundaries instantly, repairing broken lines.",
  },
  {
    id: "02",
    icon: Box,
    title: "AI Generates Structure",
    description: "Spatial intelligence automatically extrudes lines into an editable, accurate 3D structural model with perfect room volumes.",
  },
  {
    id: "03",
    icon: Edit3,
    title: "Furn AI Breaks Down Assets",
    description: "Furniture is detected and decomposed into components for hot-swaps and catalog matching. Nothing is static baked geometry.",
  },
  {
    id: "04",
    icon: ImageIcon,
    title: "Texturize with Real PBR",
    description: "Apply laminates, tiles, paints, and lighting presets. Instantly render buyer-ready, photorealistic visuals mapped to real brands.",
  }
]

export function OnboardingSteps() {
  return (
    <section className="py-24 bg-[#050505] relative border-t border-white/5" id="features">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary border border-primary/20">
             Guided 4-Step Onboarding
          </div>
          <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6 text-white tracking-tight">
            From Flat to Fully Furnished.
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl">
            See how our spatial engine processes your 2D input and delivers a fully manipulable 3D environment in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                key={step.id} 
                className="flex flex-col rounded-2xl border border-white/10 bg-[rgba(17,17,20,0.86)] backdrop-blur-lg p-8 hover:border-[#ffc661]/45 transition-colors"
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 bg-zinc-900 border border-white/10 text-white mb-8 shadow-xl">
                  <Icon size={28} />
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-primary font-mono text-sm font-bold tracking-widest uppercase">Step {step.id}</span>
                  <div className="h-px w-12 bg-primary/30" />
                </div>
                
                <h3 className="text-2xl font-heading font-bold text-white mb-4 leading-tight">
                  {step.title}
                </h3>
                
                <p className="text-zinc-400 font-body text-base leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
