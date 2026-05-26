"use client"

import { motion } from "framer-motion"
import { ShieldCheck, Compass, Coins } from "lucide-react"

export default function TrustSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.1 } }
  }

  const features = [
    {
      icon: <Compass size={24} className="text-amber-500" />,
      title: "Hyperlocal Pricing",
      desc: "Prices vary by pincode. We show you exactly what vendors in your area are charging today."
    },
    {
      icon: <ShieldCheck size={24} className="text-emerald-550" />,
      title: "Verified Vendors",
      desc: "Every vendor undergoes a strict document verification process before they can list on our platform."
    },
    {
      icon: <Coins size={24} className="text-blue-500" />,
      title: "Zero Commissions",
      desc: "We don't take a cut. You get direct access to vendor pricing and contact details for transparent business."
    }
  ]

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 text-left"
    >
      {features.map((feature, idx) => (
        <motion.div 
          key={idx} 
          variants={cardVariants}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          className="p-8 rounded-[24px] bg-slate-900/40 dark:bg-slate-900/60 border border-slate-800/60 hover:border-slate-700/80 transition-all duration-300 shadow-lg dark:shadow-slate-950/40"
        >
          <div className="w-12 h-12 bg-slate-950 border border-slate-800/80 rounded-2xl flex items-center justify-center mb-6 shadow-md">
            {feature.icon}
          </div>
          <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
          <p className="text-slate-400 leading-relaxed text-sm font-medium">{feature.desc}</p>
        </motion.div>
      ))}
    </motion.div>
  )
}
