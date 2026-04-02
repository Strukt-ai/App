"use client"

import { useState, useEffect } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { scrollY } = useScroll()

  // Progress bar
  const scaleX = useTransform(scrollY, [0, 3000], [0, 1]) // rough estimate for scroll distance

  useEffect(() => {
    const updateScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", updateScroll)
    return () => window.removeEventListener("scroll", updateScroll)
  }, [])

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#ffb347] via-[#ffc847] to-[#ffe08a] origin-left z-70"
        style={{ scaleX }}
      />
      <header
        className={`fixed top-0 left-0 right-0 w-full z-60 transition-all duration-300 ${isScrolled
            ? "py-3 bg-[rgba(16,16,18,0.58)] backdrop-blur-xl border-b border-white/10"
            : "py-4 bg-[rgba(16,16,18,0.24)] backdrop-blur-md"
          }`}
      >
        <div className="container mx-auto px-5 md:px-10 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-[#ff8f4e] to-[#ffb347] flex items-center justify-center shadow-[0_0_18px_rgba(255,176,71,0.45)]">
              <div className="w-2 h-2 bg-black/70 rounded-full" />
            </div>
            <span className="font-heading font-bold text-xl tracking-tight text-white/95">
              Strukt <span className="text-[#ffc661]">AI</span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300/90">
            {[
              { href: "#features", label: "Features" },
              { href: "#warehouse", label: "Warehouse" },
              { href: "/pricing", label: "Pricing" },
            ].map((item) => (
              <a key={item.label} href={item.href} className="relative transition-colors duration-200 hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <motion.button
              whileHover={{ y: -1, scale: 1.02 }}
              onClick={() => window.location.href = '/login'}
              className="text-sm font-medium text-white border border-white/25 hover:border-white hover:bg-white/5 transition-colors duration-200 px-4 py-2 rounded-lg"
            >
              Log In
            </motion.button>
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-[#ffc247] hover:bg-[#ffd574] text-black font-semibold text-sm px-5 py-2.5 rounded-lg transition-all duration-300 shadow-[0_0_20px_rgba(255,194,71,0.45)]"
            >
              Book a Demo
            </motion.button>
          </div>

          <button
            className="md:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[rgba(8,8,10,0.9)] backdrop-blur-xl pt-24 px-6 flex flex-col gap-6 md:hidden">
            <a href="#features" className="text-2xl font-heading font-bold text-white" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#warehouse" className="text-2xl font-heading font-bold text-white" onClick={() => setMobileMenuOpen(false)}>Warehouse</a>
            <a href="/pricing" className="text-2xl font-heading font-bold text-white" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
            <div className="h-px bg-white/10 w-full my-4" />
            <button 
              className="text-left text-lg font-medium text-white mb-2 border border-white/20 rounded-lg py-3 px-4" 
              onClick={() => {
                setMobileMenuOpen(false);
                window.location.href = '/login';
              }}
            >
              Log In
            </button>
            <button className="bg-[#ffc247] text-black font-bold text-lg px-6 py-4 rounded-lg w-full" onClick={() => setMobileMenuOpen(false)}>
              Book a Demo
            </button>
        </div>
      )}
    </>
  )
}
