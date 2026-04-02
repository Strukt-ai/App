"use client"
import { ArrowRight } from "lucide-react"

export function FooterCTA() {
  return (
    <footer id="pricing" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#06070b] text-white">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,194,71,0.18),transparent_38%),radial-gradient(circle_at_80%_65%,rgba(98,119,255,0.15),transparent_40%)]" />
        <div className="absolute inset-0 landing-wireframe-house opacity-55" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10 text-center flex-1 flex flex-col justify-center max-w-5xl py-24">
        <h2 className="text-5xl md:text-7xl font-heading font-bold mb-8 leading-tight tracking-tighter">
          Ready to stop rebuilding floorplans?
        </h2>
        <p className="text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
          Join the waitlist of elite designers and builders accessing the future of spatial intelligence.
        </p>
        
        <form suppressHydrationWarning className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto w-full mb-16" onSubmit={(e) => e.preventDefault()}>
          <input 
            suppressHydrationWarning
            type="email" 
            placeholder="Enter your enterprise email..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-6 py-4 text-white focus:outline-none focus:border-primary placeholder:text-zinc-600 backdrop-blur-md"
            required
          />
          <button suppressHydrationWarning type="submit" className="bg-primary hover:bg-white text-black font-bold px-8 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-[0_0_20px_rgba(255,176,0,0.3)] flex items-center justify-center gap-2">
            Join Waitlist <ArrowRight size={18} />
          </button>
        </form>
      </div>

      <div className="w-full border-t border-white/10 py-8 relative z-10 bg-black/70 backdrop-blur-lg">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-zinc-600">
          <div className="flex items-center gap-2">
            <span className="text-white font-heading font-bold text-base">Strukt AI</span> © {new Date().getFullYear()}
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
