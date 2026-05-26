"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export default function HomeHero({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative max-w-4xl mx-auto text-center z-10">
      {/* Premium Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider mb-8 bg-slate-900/5 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-slate-800 dark:text-slate-200"
      >
        <Sparkles size={12} className="text-amber-500" />
        <span>Now Live in Major Pincodes</span>
      </motion.div>
      
      {/* Title */}
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-950 dark:text-white tracking-tight leading-[1.05] mb-8"
      >
        Build smarter with <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-550 via-amber-500 to-amber-400 dark:from-amber-400 dark:via-amber-300 dark:to-amber-500">
          hyperlocal pricing.
        </span>
      </motion.h1>
      
      {/* Subtitle */}
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-base sm:text-xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium"
      >
        Multiplying Brics connects you directly with verified construction material vendors. No middlemen, no hidden costs.
      </motion.p>

      {/* Searchbar wrapper */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="max-w-3xl mx-auto"
      >
        {children}
      </motion.div>
    </div>
  )
}
