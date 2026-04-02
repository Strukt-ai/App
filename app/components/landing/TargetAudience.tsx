import { Building2, Home, Blocks } from "lucide-react"

export function TargetAudience() {
  const segments = [
    {
      icon: Blocks,
      title: "Enterprise Studios",
      desc: "Instantly convert client 2D PDFs directly into fully manipulable 3D projects. Scale your junior designer output to senior levels without the hiring overhead."
    },
    {
      icon: Building2,
      title: "Real Estate Builders",
      desc: "Stop mailing flat 2D brochures. Generate custom QR codes that let prospects walk through their actual flat layout with live rendering on their mobile devices."
    },
    {
      icon: Home,
      title: "Individual Homeowners",
      desc: "Remove the guesswork. Upload the plan the builder gave you, apply the exact laminate you found in the store, and see your future home today."
    }
  ]

  return (
    <section className="py-24 bg-[#0a0b10]" aria-labelledby="audience-title">
      <div className="container mx-auto px-6 md:px-12">
        <h2 id="audience-title" className="text-center text-3xl md:text-5xl font-heading font-bold text-white mb-12">
          Built For Every Stakeholder
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {segments.map((s, i) => {
            const Icon = s.icon
            return (
              <article key={i} className="glass-card rounded-2xl p-8 border border-white/8 hover:border-primary/30 transition-all group hover:-translate-y-1">
                <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center mb-6 text-zinc-400 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                  <Icon size={24} />
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-4">{s.title}</h3>
                <p className="text-zinc-500 group-hover:text-zinc-300 transition-colors">{s.desc}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
