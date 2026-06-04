import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search, Package, MapPin } from 'lucide-react'

// Defining a type for the joined material data
interface ProductMaterial {
  id: string
  category_id: string
  name: string
  slug: string
  unit: string
  description: string | null
  category: { name: string } | null
}

async function getProducts(): Promise<ProductMaterial[]> {
  const supabase = createClient()
  
  // We fetch materials and join with categories to get the category name
  const { data, error } = await supabase
    .from('materials')
    .select('*, category:categories(name)')
    .order('name')
    
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  
  return data as ProductMaterial[]
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div 
                key={product.id}
                className="group flex flex-col bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[24px] overflow-hidden hover:shadow-2xl hover:shadow-amber-500/5 transition-all duration-300"
              >
                {/* Product Image (Placeholder since materials don't have images in DB) */}
                <div className="relative h-48 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-slate-900/10 dark:bg-black/20 z-10" />
                  {/* Clean SVG Placeholder to ensure professional appearance */}
                  <div className="z-0 w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 bg-slate-100 dark:bg-slate-800/80">
                    <Package size={48} className="mb-2 opacity-50" />
                    <span className="text-sm font-bold tracking-widest uppercase opacity-50">No Image</span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="flex flex-col flex-grow p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      per {product.unit}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {product.name}
                  </h2>
                  
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 flex-grow line-clamp-3 leading-relaxed">
                    {product.description || `High-quality ${product.name.toLowerCase()} for all your construction needs. Procure directly from verified local vendors.`}
                  </p>

                  <Link
                    href={`/?material_id=${product.id}&material_name=${encodeURIComponent(product.name)}`}
                    className="w-full py-3.5 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-950 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                  >
                    <Search size={16} />
                    <span>Find Vendors</span>
                  </Link>
                </div>
              </div>
            ))}
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
