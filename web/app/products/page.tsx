import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search, Package } from 'lucide-react'

// Defining a type for the joined material data
interface ProductMaterial {
  id: string
  category_id: string
  name: string
  slug: string
  unit: string
  description: string | null
  category: { name: string; slug: string } | null
}

async function getProducts(): Promise<ProductMaterial[]> {
  const supabase = createClient()
  
  // We fetch materials and join with categories to get the category name and slug
  const { data, error } = await supabase
    .from('materials')
    .select('*, category:categories(name, slug)')
    .order('name')
    
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  
  return data as ProductMaterial[]
}

const categoryImages: Record<string, string> = {
  'cement-concrete': '/images/cement.png',
  'steel-metal': '/images/steel.png',
  'bricks-blocks': '/images/bricks.png',
  'sand-aggregates': '/images/sand.png'
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <main className="min-h-screen bg-white dark:bg-[#030712] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-0 right-0 h-[400px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-100px] right-[20%] w-[350px] h-[350px] rounded-full bg-amber-500/10 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-950 dark:text-white tracking-tight mb-4 leading-tight">
            Our Products
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg sm:text-xl font-medium leading-relaxed">
            Browse our comprehensive catalog of construction materials. From foundational essentials to finishing touches, find everything you need for your project.
          </p>
        </header>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {products.map((product) => {
              const imageUrl = (product.category?.slug && categoryImages[product.category.slug]) 
                ? categoryImages[product.category.slug] 
                : 'https://images.unsplash.com/photo-1541913056074-43f380017cf3?q=80&w=2070&auto=format&fit=crop'

              return (
                <div 
                  key={product.id}
                  className="group relative flex flex-col justify-end min-h-[380px] bg-slate-950 rounded-[32px] overflow-hidden shadow-md hover:shadow-[0_0_24px_rgba(245,158,11,0.15)] transition-all duration-300 border border-slate-200/60 dark:border-slate-800/80 hover:border-amber-500/40 dark:hover:border-amber-500/40"
                >
                  {/* Product Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-90 dark:opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                  />
                  
                  {/* Overlay Gradient for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/20 group-hover:from-slate-950/90 transition-all duration-350" />

                  {/* Product Info */}
                  <div className="relative z-10 flex flex-col flex-grow p-6 justify-end">
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-500/20 backdrop-blur-md">
                        {product.category?.name || 'Uncategorized'}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-slate-950/50 px-2 py-1 rounded-full backdrop-blur-md">
                        per {product.unit}
                      </span>
                    </div>
                    
                    <h2 className="text-xl font-black text-white mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors">
                      {product.name}
                    </h2>
                    
                    <p className="text-sm text-slate-300 mb-6 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                      {product.description || `High-quality ${product.name.toLowerCase()} for all your construction needs. Procure directly from verified local vendors.`}
                    </p>

                    <Link
                      href={`/?material_id=${product.id}&material_name=${encodeURIComponent(product.name)}`}
                      className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]"
                    >
                      <Search size={16} />
                      <span>Find Vendors</span>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-32 bg-slate-50 dark:bg-slate-900/20 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Package size={48} className="mx-auto text-slate-400 mb-6" />
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No products available</h3>
            <p className="text-slate-500">We're currently updating our catalog. Please check back later.</p>
          </div>
        )}

      </div>
    </main>
  )
}
