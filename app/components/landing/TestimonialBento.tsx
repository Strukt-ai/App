import { Star, Play } from "lucide-react"

const TESTIMONIALS = [
  {
    name: "Eleanor Wright",
    role: "Principal Architect, L&T Design",
    quote: "Strukt AI replaced 3 days of manual SketchUp molding with a 2-minute processing wait. The fact that the assets are real and buyable is game-changing.",
    stars: 5,
    video: true,
  },
  {
    name: "Marcus Chen",
    role: "Lead Designer, Habitat Studios",
    quote: "Clients used to ask for changes and we'd groan because it meant hours of re-rendering. Now we just type the prompt in front of them and the room updates.",
    stars: 5,
    video: false,
  },
  {
    name: "Sarah Jenkins",
    role: "Independent Interior Designer",
    quote: "The spatial intelligence is uncanny. It reads my messy 2D PDFs and somehow knows exactly where the load-bearing walls are supposed to be.",
    stars: 4,
    video: true,
  },
  {
    name: "David Rossi",
    role: "Director, BuildCorp",
    quote: "We use it for our entire sales pipeline now. Buyers scan a QR, walk through their customized unit, and we lock the PBR material choices in the contract immediately.",
    stars: 5,
    video: false,
  }
]

export function TestimonialBento() {
  return (
    <section className="py-24 bg-[#0b0c11] relative overflow-hidden" aria-labelledby="testimonials-title">
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-primary/5 blur-100 rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <h2 id="testimonials-title" className="text-3xl md:text-5xl font-heading font-bold mb-4">
            Hear From The <span className="text-primary w-fit inline-block">Industry</span>
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto md:text-lg">
            Join thousands of designers and builders who have stopped rebuilding and started creating.
          </p>
        </div>

        <div className="md:hidden flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          {TESTIMONIALS.map((t, idx) => (
            <article key={idx} className="min-w-[86vw] rounded-2xl p-6 border border-white/10 bg-white/3">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < t.stars ? "fill-primary text-primary" : "text-zinc-600"} />
                ))}
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">\"{t.quote}\"</p>
              <p className="mt-3 text-zinc-100 font-semibold text-sm">{t.name}</p>
              <p className="text-zinc-500 text-xs">{t.role}</p>
            </article>
          ))}
        </div>

        <div className="hidden md:columns-2 lg:columns-3 gap-6 space-y-6 md:block">
          {TESTIMONIALS.map((t, idx) => (
            <article key={idx} className="break-inside-avoid glass-card rounded-2xl p-8 border border-white/8 hover:-translate-y-1.5 transition-transform duration-300 relative group">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className={i < t.stars ? "fill-primary text-primary" : "text-zinc-600"} />
                ))}
              </div>
              <p className="text-zinc-300 mb-6 font-body leading-relaxed">"{t.quote}"</p>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-sm text-zinc-300">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-white font-medium text-sm">{t.name}</div>
                  <div className="text-zinc-500 text-xs">{t.role}</div>
                </div>
              </div>

              {t.video && (
                <button suppressHydrationWarning className="absolute top-6 right-6 w-8 h-8 rounded-full bg-[#ff3030] flex items-center justify-center text-white hover:scale-105 transition-transform" aria-label="Play testimonial">
                  <Play size={12} className="ml-0.5 fill-current" />
                </button>
              )}
            </article>
          ))}
          
          {/* Bento callout */}
          <article className="break-inside-avoid rounded-2xl p-8 bg-primary text-black border border-primary/50 relative overflow-hidden flex flex-col justify-center h-full">
            <h3 className="text-2xl font-heading font-bold mb-2">90% Reduction</h3>
            <p className="font-medium opacity-90 mb-4">In average delivery time from concept floor plan to fully rendered 3D pitch.</p>
            <div className="w-full h-1 bg-black/20 rounded-full overflow-hidden">
               <div className="h-full bg-black w-11/12" />
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
