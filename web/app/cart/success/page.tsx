"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, Inbox, ArrowRight, Home } from 'lucide-react'

export default function CartSuccessPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 bg-slate-50/50 dark:bg-[#030712] transition-colors duration-300 relative overflow-hidden radial-glow">
      <div className="absolute top-[-100px] left-[30%] w-[300px] h-[300px] rounded-full bg-emerald-500/5 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[500px] bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[32px] shadow-2xl dark:shadow-slate-950/80 border border-slate-200/60 dark:border-slate-800/80 relative z-10 text-center"
      >
        {/* Animated Checkmark Icon */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.15 }}
          className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle className="text-emerald-500" size={44} />
        </motion.div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-955 dark:text-white tracking-tight mb-4 leading-tight">
          Enquiries Dispatched!
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed mb-8 font-medium">
          Your construction material inquiries have been successfully sent to the respective verified local suppliers. 
          <br className="hidden sm:block" />
          Zero markup. Zero brokers. Total transparency.
        </p>

        <div className="bg-slate-50 dark:bg-slate-950 p-5 border border-slate-150 dark:border-slate-850 rounded-2xl mb-8 text-left space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            What Happens Next?
          </h3>
          <ul className="text-xs text-slate-600 dark:text-slate-450 space-y-2 leading-relaxed font-semibold">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-black">•</span>
              <span>Suppliers will review your requirements and check local inventory.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-black">•</span>
              <span>They will reply with their best wholesale rates and shipping/lead times.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 font-black">•</span>
              <span>You will receive real-time updates directly in your enquiries dashboard.</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            href="/account"
            className="flex-1 py-3.5 bg-slate-950 hover:bg-slate-850 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <Inbox size={16} />
            <span>Track Enquiries</span>
            <ArrowRight size={14} />
          </Link>
          
          <Link 
            href="/"
            className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-205 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
          >
            <Home size={16} />
            <span>Back to Home</span>
          </Link>
        </div>

      </motion.div>
    </main>
  )
}
