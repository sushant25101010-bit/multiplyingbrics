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
      <section className="relative pt-[clamp(80px,15vw,160px)] pb-[clamp(64px,12vw,120px)] px-[clamp(16px,5vw,48px)] overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-slate-100 rounded-full blur-[120px] opacity-50 animate-pulse"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px] opacity-40"></div>
        </div>

        <div className="max-w-[clamp(320px,95vw,1100px)] mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span>🚀</span>
            <span>Now Live in Major Pincodes</span>
          </div>
          
          <h1 className="text-[clamp(36px,7vw,80px)] font-black text-slate-900 tracking-tight leading-[0.95] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Build smarter with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-400">hyperlocal pricing.</span>
          </h1>
          
          <p className="text-[clamp(16px,2vw,22px)] text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            Multiplying Brics connects you directly with verified construction material vendors. No middlemen, no hidden costs.
          </p>

          <div className="max-w-[800px] mx-auto shadow-2xl shadow-slate-200/50 rounded-[40px] animate-in fade-in zoom-in duration-1000 delay-300">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[clamp(16px,2vw,32px)]">
            {categories.map((category) => {
              const categoryImages: Record<string, string> = {
                'cement-concrete': '/images/cement.png',
                'steel-metal': '/images/steel.png',
                'bricks-blocks': '/images/bricks.png',
                'sand-aggregates': '/images/sand.png'
              }
              const imageUrl = categoryImages[category.slug] || 'https://images.unsplash.com/photo-1541913056074-43f380017cf3?q=80&w=2070&auto=format&fit=crop'

              return (
                <Link 
                  key={category.id} 
                  href={`/category/${category.slug}`}
                  className="group relative aspect-[4/5] bg-slate-900 rounded-[32px] overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2"
                >
                  {/* Category Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-end">
                    <h3 className="text-xl font-black text-white leading-tight mb-2 group-hover:text-amber-400 transition-colors">
                      {category.name}
                    </h3>
                    <div className="h-0 group-hover:h-8 opacity-0 group-hover:opacity-100 transition-all duration-300 overflow-hidden">
                      <p className="text-sm font-bold text-slate-300 flex items-center gap-2">
                        Browse items <span>→</span>
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
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
