import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Category } from '@/lib/types'
import SearchBar from '@/components/buyer/SearchBar'

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
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative pt-[clamp(64px,12vw,120px)] pb-[clamp(48px,10vw,80px)] px-[clamp(16px,5vw,48px)] bg-slate-50 border-b border-slate-200">
        <div className="max-w-[clamp(320px,95vw,1000px)] mx-auto text-center">
          <h1 className="text-[clamp(32px,6vw,64px)] font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            Construction materials, <br />
            <span className="text-slate-400">delivered locally.</span>
          </h1>
          <p className="text-[clamp(16px,2vw,20px)] text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Multiplying Brics helps you find the best prices for building materials in your pincode. Verified vendors, instant quotes.
          </p>

          <div className="max-w-[800px] mx-auto">
            <SearchBar materials={materials} />
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-[clamp(48px,10vw,96px)] px-[clamp(16px,5vw,48px)]">
        <div className="max-w-[clamp(320px,95vw,1200px)] mx-auto">
          <header className="flex justify-between items-end mb-[clamp(24px,4vw,48px)]">
            <div>
              <h2 className="text-[clamp(24px,3vw,32px)] font-black text-slate-900 tracking-tight">Browse Categories</h2>
              <p className="text-slate-500 text-[clamp(14px,1.5vw,16px)]">Find exactly what you need for your project</p>
            </div>
            <Link href="/categories" className="hidden sm:block text-slate-900 font-bold text-sm hover:underline">
              View All Categories →
            </Link>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[clamp(12px,2vw,24px)]">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                href={`/category/${category.slug}`}
                className="group relative aspect-square bg-slate-50 border border-slate-200 rounded-[clamp(16px,2vw,24px)] p-[clamp(16px,3vw,32px)] flex flex-col justify-end overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all hover:-translate-y-1"
              >
                <div className="absolute top-[clamp(16px,3vw,32px)] right-[clamp(16px,3vw,32px)] opacity-10 group-hover:opacity-20 transition-opacity">
                  <span className="text-[clamp(40px,5vw,64px)]">🏗️</span>
                </div>
                <div>
                  <h3 className="text-[clamp(16px,2vw,20px)] font-black text-slate-900 leading-tight mb-1">
                    {category.name}
                  </h3>
                  <p className="text-[clamp(12px,1.2vw,13px)] text-slate-400 font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore items
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-[clamp(320px,95vw,1200px)] mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
            For Construction Professionals
          </div>
          <h2 className="text-[clamp(24px,4vw,48px)] font-black mb-12 tracking-tight">
            Why builders choose <br /> Multiplying Brics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <Feature title="Hyperlocal Pricing" desc="Prices vary by pincode. We show you exactly what vendors in your area are charging today." />
            <Feature title="Verified Vendors" desc="Every vendor undergoes a strict document verification process before they can list on our platform." />
            <Feature title="Zero Commissions" desc="We don't take a cut. You get direct access to vendor pricing and contact details for transparent business." />
          </div>
        </div>
      </section>
    </main>
  )
}

function Feature({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="space-y-4">
      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl">
        ✨
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{desc}</p>
    </div>
  )
}
