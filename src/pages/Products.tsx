import React, { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { CheckoutButton } from '../components/checkout/CheckoutButton'
import { stripeProducts } from '../stripe-config'
import { Leaf, Star } from 'lucide-react'
import { useMetaTracking } from '../hooks/useMetaTracking'

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string | null
  featured: boolean | null
  image_url: string | null
  thc_percentage: number | null
  cbd_percentage: number | null
  cbg_percentage: number | null
  effects: string | null
  flavor_profile: string | null
}

// ─────────────────────────────────────────
// PRODUCT CARD
// Fires ViewContent once when card enters viewport.
// ─────────────────────────────────────────

interface ProductCardProps {
  product: Product
  onVisible: (product: Product) => void
}

function ProductCard({ product, onVisible }: ProductCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const hasFired = useRef(false)

  const stripeProduct = stripeProducts.find(sp =>
    sp.name.toLowerCase().includes(product.name.toLowerCase().replace(/\s+/g, ' '))
  )

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !hasFired.current) {
            hasFired.current = true
            onVisible(product)
            observer.disconnect() // stop observing after first fire
          }
        })
      },
      { threshold: 0.5 } // card must be 50% visible before firing
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [product, onVisible])

  return (
    <div ref={cardRef} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
      {product.featured && (
        <div className="bg-green-600 text-white px-3 py-1 rounded-t-lg text-sm font-medium flex items-center gap-1">
          <Star className="w-4 h-4" />
          Featured
        </div>
      )}

      <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center rounded-t-lg">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover rounded-t-lg"
          />
        ) : (
          <Leaf className="w-16 h-16 text-green-600" />
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {product.name}
        </h3>

        <p className="text-gray-600 mb-4 text-sm">
          {product.description}
        </p>

        {/* Cannabinoid Info */}
        {(/*product.thc_percentage || product.cbd_percentage || product.cbg_percentage) && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-2 text-xs">
              {product.thc_percentage && (
                <div className="text-center">
                  <div className="font-medium text-gray-900">THC</div>
                  <div className="text-gray-600">{product.thc_percentage}%</div>
                </div>
              )}
              {product.cbd_percentage && (
                <div className="text-center">
                  <div className="font-medium text-gray-900">CBD</div>
                  <div className="text-gray-600">{product.cbd_percentage}%</div>
                </div>
              )}
              {product.cbg_percentage && (
                <div className="text-center">
                  <div className="font-medium text-gray-900">CBG</div>
                  <div className="text-gray-600">{product.cbg_percentage}%</div>
                </div>
              )}
            </div>
          </div>
        )*/}

        {/* Effects and Flavor */}
        {(product.effects || product.flavor_profile) && (
          <div className="mb-4 space-y-2 text-sm">
            {product.effects && (
              <div>
                <span className="font-medium text-gray-900">Effects:</span>
                <span className="text-gray-600 ml-1">{product.effects}</span>
              </div>
            )}
            {product.flavor_profile && (
              <div>
                <span className="font-medium text-gray-900">Flavor:</span>
                <span className="text-gray-600 ml-1">{product.flavor_profile}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            {product.price} Kč
          </div>

          {stripeProduct ? (
            <CheckoutButton
              priceId={stripeProduct.priceId}
              mode={stripeProduct.mode}
              className="text-sm"
            >
              Buy Now
            </CheckoutButton>
          ) : (
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────
// PRODUCTS PAGE
// ─────────────────────────────────────────

export function Products() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const { trackViewContent } = useMetaTracking()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('featured', { ascending: false })
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Stable callback so ProductCard's useEffect doesn't re-run on re-renders
  const handleProductVisible = useCallback((product: Product) => {
    trackViewContent({
      contentId: product.id,
      contentName: product.name,
      contentCategory: product.category || undefined,
      contentType: 'product',
      value: product.price,
      currency: 'CZK',
    })
  }, [trackViewContent])

  const filteredProducts = products.filter(product => {
    if (selectedCategory === 'all') return true
    return product.category === selectedCategory
  })

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'energizing', name: 'Energizing' },
    { id: 'relaxing', name: 'Relaxing' },
    { id: 'balanced', name: 'Balanced' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="p-6 space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Botanical Collectibles
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Premium collectible botanical items for decorative and educational purposes only.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-2">
            <div className="flex space-x-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-green-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onVisible={handleProductVisible}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Leaf className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600">
              Try selecting a different category or check back later.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}