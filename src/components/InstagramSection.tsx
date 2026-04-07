import { Instagram, ExternalLink, Heart, MessageCircle } from 'lucide-react';

// Static Instagram-style grid with curated content
// Uses product images as placeholders for a branded IG feed look
const posts = [
  { id: 1, image: 'https://qgwdvktfoscmscjzdrbe.supabase.co/storage/v1/object/public/product-images/gelato.png', likes: 142, comments: 18 },
  { id: 2, image: 'https://qgwdvktfoscmscjzdrbe.supabase.co/storage/v1/object/public/product-images/wedding-cake.png', likes: 198, comments: 24 },
  { id: 3, image: 'https://qgwdvktfoscmscjzdrbe.supabase.co/storage/v1/object/public/product-images/lemon-cherry-gelato.png', likes: 167, comments: 21 },
  { id: 4, image: 'https://qgwdvktfoscmscjzdrbe.supabase.co/storage/v1/object/public/product-images/forbidden-fruit.png', likes: 231, comments: 32 },
  { id: 5, image: 'https://qgwdvktfoscmscjzdrbe.supabase.co/storage/v1/object/public/product-images/amnesia.png', likes: 189, comments: 27 },
  { id: 6, image: 'https://qgwdvktfoscmscjzdrbe.supabase.co/storage/v1/object/public/product-images/golden-nugget.png', likes: 156, comments: 19 },
];

export default function InstagramSection() {
  return (
    <section className="relative py-20 px-6 overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <a
            href="https://www.instagram.com/tajnabotanika"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 mb-5 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-400/20 hover:border-pink-400/40 transition-all group"
          >
            <Instagram className="w-4 h-4 text-pink-400 group-hover:rotate-12 transition-transform" />
            <span className="text-pink-300/90 text-sm font-semibold tracking-wider">
              @TAJNABOTANIKA
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-pink-400/50" />
          </a>
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
            Sledujte nás na{' '}
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Instagramu
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Novinky, zákulisí a exkluzivní nabídky — buďte první, kdo se dozví o nových odrůdách
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {posts.map((post) => (
            <a
              key={post.id}
              href="https://www.instagram.com/tajnabotanika"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-xl overflow-hidden bg-white/[0.03] border border-white/[0.06]"
            >
              <img
                src={post.image}
                alt="Instagram post"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5 text-white text-sm font-bold">
                  <Heart className="w-4 h-4" fill="white" />
                  {post.likes}
                </div>
                <div className="flex items-center gap-1.5 text-white text-sm font-bold">
                  <MessageCircle className="w-4 h-4" fill="white" />
                  {post.comments}
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <a
            href="https://www.instagram.com/tajnabotanika"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-400/20 text-pink-300 hover:text-white hover:border-pink-400/40 hover:scale-105 transition-all duration-300 font-semibold text-sm"
          >
            <Instagram className="w-4 h-4" />
            Sledovat na Instagramu
          </a>
        </div>
      </div>
    </section>
  );
}
