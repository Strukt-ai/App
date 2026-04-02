export function Badges() {
  return (
    <section className="py-12 bg-[#07080d] border-y border-white/5" aria-label="Institutional trust badges">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 opacity-80 grayscale">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded border border-white/30 flex items-center justify-center text-white text-xs font-extrabold">
              AWS
            </div>
            <div className="text-sm font-semibold text-white tracking-widest uppercase leading-tight">
              AWS Startup <br/><span className="text-zinc-400 text-xs">Program</span>
            </div>
          </div>
          
          <div className="hidden md:block w-px h-12 bg-white/10" />
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white text-xs font-bold">
              DPIIT
            </div>
            <div className="text-sm font-semibold text-white tracking-widest uppercase leading-tight">
              Startup India <br/><span className="text-zinc-400 text-xs">Recognized</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
