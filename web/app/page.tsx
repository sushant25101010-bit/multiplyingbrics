import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Category } from '@/lib/types'
import SearchBar from '@/components/buyer/SearchBar'
import HomeHero from '@/components/ui/HomeHero'
import CategoryGrid from '@/components/ui/CategoryGrid'
import TrustSection from '@/components/ui/TrustSection'
import { ArrowRight } from 'lucide-react'

async function getCategories(): Promise<Category[]> {
  const supabase = createClient()
  const { data } = await supabase.from('categories').select('*').order('name')
  return data || []
}

async function getMaterials() {
  const supabase = createClient()
  const { data } = await supabase.from('materials').select('*').order('name')
  return data || []
}

export default async function HomePage() {
  const categories = await getCategories()
  const materials = await getMaterials()

  return (
    <main className="min-h-screen bg-white dark:bg-[#030712] relative overflow-hidden radial-glow">
      {/* Background Glows */}
      <div className="absolute top-0 left-0 right-0 h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-150px] left-[15%] w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[100px]" />
        <div className="absolute top-[-100px] right-[20%] w-[450px] h-[450px] rounded-full bg-blue-500/5 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 sm:pt-32 sm:pb-32 px-4 sm:px-6 lg:px-8">
        <HomeHero>
          <SearchBar materials={materials} />
        </HomeHero>
      </section>

      {/* Categories Grid */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-100 dark:border-slate-900/60">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 dark:text-white tracking-tight">
              Browse Categories
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm sm:text-base font-medium">
              Find exactly what you need for your project
            </p>
          </div>
          <Link 
            href="/categories" 
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white hover:text-amber-500 dark:hover:text-amber-400 transition-colors"
          >
            <span>View All Categories</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <CategoryGrid categories={categories} />
      </section>

      {/* Trust Section */}
      <section className="py-20 sm:py-28 bg-slate-950 text-white relative overflow-hidden">
        {/* Subtle grid background on trust section */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="absolute bottom-[-150px] left-[50%] -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-block px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6 text-amber-400">
            For Construction Professionals
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-16 tracking-tight leading-tight max-w-2xl mx-auto">
            Why builders choose <br /> Multiplying Brics
          </h2>
          
          <TrustSection />
        </div>
      </section>
    </main>
  )
}
