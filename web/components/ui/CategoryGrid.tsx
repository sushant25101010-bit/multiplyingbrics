"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Category } from "@/lib/types"
import { ArrowRight } from "lucide-react"

interface CategoryGridProps {
  categories: Category[]
}

export default function CategoryGrid({ categories }: CategoryGridProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", bounce: 0.15 } }
  }

  const categoryImages: Record<string, string> = {
    'cement-concrete': '/images/cement.png',
    'steel-metal': '/images/steel.png',
    'bricks-blocks': '/images/bricks.png',
    'sand-aggregates': '/images/sand.png'
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
    >
      {categories.map((category) => {
        const imageUrl = categoryImages[category.slug] || 'https://images.unsplash.com/photo-1541913056074-43f380017cf3?q=80&w=2070&auto=format&fit=crop'
        
        return (
          <motion.div 
            key={category.id} 
            variants={itemVariants}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="h-full"
          >
            <Link 
              href={`/category/${category.slug}`}
              className="group relative flex flex-col justify-end aspect-[4/5] bg-slate-950 rounded-[32px] overflow-hidden shadow-md hover:shadow-[0_0_24px_rgba(245,158,11,0.15)] transition-all duration-300 border border-slate-200/60 dark:border-slate-800/80 hover:border-amber-500/40 dark:hover:border-amber-500/40"
            >
              {/* Category Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-90 dark:opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent group-hover:from-slate-950/80 transition-all duration-350" />
              
              {/* Content */}
              <div className="relative p-6 sm:p-8 z-10">
                <h3 className="text-xl font-bold text-white leading-tight mb-2 group-hover:text-amber-400 transition-colors">
                  {category.name}
                </h3>
                <div className="h-0 group-hover:h-6 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
                  <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    Browse items <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
