"use client"

import { motion } from "framer-motion"

const LOGOS = [
  "L&T Realty",
  "Godrej Properties",
  "Prestige",
  "Sobha",
  "DLF",
  "Asian Paints",
  "Kajaria",
  "Schneider Electric",
  "Berger",
  "Greenlam",
  "HomeLane",
  "Hafele",
  // Duplicate for infinite scroll 
  "L&T Realty",
  "Godrej Properties",
  "Prestige",
  "Sobha",
  "DLF",
  "Asian Paints",
  "Kajaria",
  "Schneider Electric",
  "Berger",
  "Greenlam",
  "HomeLane",
  "Hafele",
]

export function TrustMarquee() {
  return (
    <section className="py-12 border-y border-white/5 bg-[#090a0e] overflow-hidden relative" aria-label="Trusted brands">
      <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-linear-to-r from-[#090a0e] to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 md:w-40 bg-linear-to-l from-[#090a0e] to-transparent z-10" />
      
      <p className="text-center text-sm font-medium text-zinc-500 mb-8 uppercase tracking-widest">
        Trusted by Enterprise Builders & Studios
      </p>
      
      <div className="flex w-max no-scrollbar">
        <motion.div
          animate={{ x: [0, -1600] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            },
          }}
          className="flex whitespace-nowrap gap-4 md:gap-6 pr-6 items-center"
        >
          {LOGOS.map((logo, index) => (
            <div 
              key={index} 
              className="rounded-full border border-white/10 bg-white/3 px-4 md:px-6 py-3 text-xs md:text-sm font-heading font-semibold text-zinc-300/90 tracking-wide hover:border-[#ffc661]/40 hover:text-[#ffe2a9] transition-colors duration-300"
            >
              {logo}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
