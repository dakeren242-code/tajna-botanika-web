import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabase';
import { Beaker, Leaf, Wind, Star, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Terpen & flavor profiles for each product (curated data)
const productProfiles: Record<string, {
  type: string;
  thcx: string;
  dominantTerpene: string;
  flavor: string;
  effect: string;
  intensity: number; // 1-5
}> = {
  'amnesia': {
    type: 'Sativa',
    thcx: '< 0.3%',
    dominantTerpene: 'Myrcen, Limonen',
    flavor: 'Citrusová, zemitá',
    effect: 'Energizující, kreativní',
    intensity: 4,
  },
  'bubble-gum': {
    type: 'Indica',
    thcx: '< 0.3%',
    dominantTerpene: 'Karyofylen, Linalool',
    flavor: 'Sladká, ovocná',
    effect: 'Relaxační, uklidňující',
    intensity: 3,
  },
  'forbidden-fruit': {
    type: 'Indica',
    thcx: '< 0.3%',
    dominantTerpene: 'Myrcen, Karyofylen',
    flavor: 'Tropická, exotická',
    effect: 'Hluboký relax',
    intensity: 5,
  },
  'gelato': {
    type: 'Hybrid',
    thcx: '< 0.3%',
    dominantTerpene: 'Limonen, Karyofylen',
    flavor: 'Sladká, krémová',
    effect: 'Vyvážený, euforický',
    intensity: 4,
  },
  'golden-nugget': {
    type: 'Sativa',
    thcx: '< 0.3%',
    dominantTerpene: 'Terpinolen, Myrcen',
    flavor: 'Kořenitá, bylinková',
    effect: 'Stimulující, zaměřený',
    intensity: 4,
  },
  'lemon-cherry-gelato': {
    type: 'Hybrid',
    thcx: '< 0.3%',
    dominantTerpene: 'Limonen, Linalool',
    flavor: 'Citronová, višňová',
    effect: 'Povznášející, radostný',
    intensity: 5,
  },
  'pineapple-zkittlez': {
    type: 'Indica',
    thcx: '< 0.3%',
    dominantTerpene: 'Karyofylen, Humulen',
    flavor: 'Ananasová, sladká',
    effect: 'Klidný, meditativní',
    intensity: 3,
  },
  'blue-dream': { // tropical zushi slug
    type: 'Sativa',
    thcx: '< 0.3%',
    dominantTerpene: 'Myrcen, Pinen',
    flavor: 'Tropická, svěží',
    effect: 'Kreativní, motivující',
    intensity: 4,
  },
  'wedding-cake': {
    type: 'Hybrid',
    thcx: '< 0.3%',
    dominantTerpene: 'Linalool, Karyofylen',
    flavor: 'Vanilková, sladká',
    effect: 'Relaxační, euforický',
    intensity: 5,
  },
};

const typeColors: Record<string, string> = {
  'Sativa': 'text-yellow-400 bg-yellow-500/10',
  'Indica': 'text-purple-400 bg-purple-500/10',
  'Hybrid': 'text-emerald-400 bg-emerald-500/10',
};

const IntensityDots = ({ level }: { level: number }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className={`w-2 h-2 rounded-full transition-colors ${
          i <= level ? 'bg-emerald-400' : 'bg-white/10'
        }`}
      />
    ))}
  </div>
);

export default function ProductComparisonSection() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('name');
      if (data) setProducts(data);
    };
    fetchProducts();
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="relative py-20 px-6 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-5 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
            <Beaker className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-300/90 text-sm font-semibold tracking-wider">
              POROVNÁNÍ ODRŮD
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
            Najděte svou{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              ideální odrůdu
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Kompletní přehled terpenových profilů, chutí a efektů všech našich odrůd
          </p>
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left py-4 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Odrůda</th>
                <th className="text-left py-4 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Typ</th>
                <th className="text-left py-4 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Wind className="w-3.5 h-3.5" />
                    Terpen
                  </div>
                </th>
                <th className="text-left py-4 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5" />
                    Chuť
                  </div>
                </th>
                <th className="text-left py-4 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5" />
                    Efekt
                  </div>
                </th>
                <th className="text-center py-4 px-4 text-gray-500 text-xs font-semibold uppercase tracking-wider">Intenzita</th>
                <th className="py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const profile = productProfiles[product.slug];
                if (!profile) return null;
                return (
                  <tr key={product.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-4">
                      <span className="text-white font-semibold">{product.name}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-xs font-bold ${typeColors[profile.type]}`}>
                        {profile.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-sm">{profile.dominantTerpene}</td>
                    <td className="py-4 px-4 text-gray-300 text-sm">{profile.flavor}</td>
                    <td className="py-4 px-4 text-gray-300 text-sm">{profile.effect}</td>
                    <td className="py-4 px-4">
                      <div className="flex justify-center">
                        <IntensityDots level={profile.intensity} />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Link
                        to={`/product/${product.slug}`}
                        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-sm font-medium transition-colors"
                      >
                        Detail
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="lg:hidden space-y-3">
          {products.map((product) => {
            const profile = productProfiles[product.slug];
            if (!profile) return null;
            return (
              <Link
                key={product.id}
                to={`/product/${product.slug}`}
                className="block p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-bold">{product.name}</span>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${typeColors[profile.type]}`}>
                    {profile.type}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs">Chuť</span>
                    <p className="text-gray-300">{profile.flavor}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Efekt</span>
                    <p className="text-gray-300">{profile.effect}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <IntensityDots level={profile.intensity} />
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
