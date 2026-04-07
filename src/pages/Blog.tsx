import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock, Tag, ArrowLeft } from 'lucide-react';
import { blogPosts } from '../components/BlogSection';
import Header from '../components/Header';

export default function Blog() {
  const categories = ['Vše', ...Array.from(new Set(blogPosts.map(p => p.category)))];
  const featured = blogPosts[0];
  const rest = blogPosts.slice(1);

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="mb-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Zpět na hlavní stránku
          </Link>

          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-emerald-400/10 border border-emerald-400/20">
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-bold tracking-wider uppercase">
              Tajná Akademie
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-4 text-white">
            Vzdělání &{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              Průvodci
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Odborné články o THC-X, terpénech, kanabinoidech a botanickém světě.
          </p>
        </div>

        {/* Featured article */}
        <Link
          to={`/blog/${featured.slug}`}
          className="group block relative rounded-3xl overflow-hidden mb-12 transition-all duration-300 hover:scale-[1.01]"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.7))',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${featured.gradient} opacity-60`} />
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ border: `1px solid ${featured.accentColor}30`, borderRadius: 'inherit' }}
          />

          <div className="relative p-10 md:p-14">
            <div className="flex items-center gap-3 mb-6">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${featured.categoryColor}`}
              >
                <Tag className="w-3 h-3" />
                {featured.category}
              </span>
              <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white bg-white/10 border border-white/10">
                Doporučený článek
              </span>
              <div className="flex items-center gap-1.5 text-gray-400 text-sm ml-auto">
                <Clock className="w-4 h-4" />
                {featured.readTime} čtení
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 max-w-3xl leading-tight">
              {featured.title}
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mb-8 leading-relaxed">
              {featured.excerpt}
            </p>

            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">{featured.date}</span>
              <span
                className="flex items-center gap-2 font-bold text-lg transition-all duration-300 group-hover:gap-3"
                style={{ color: featured.accentColor }}
              >
                Číst článek
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
          </div>
        </Link>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group relative rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${post.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              <div className="relative p-6 flex flex-col min-h-[260px]">
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${post.categoryColor}`}>
                    <Tag className="w-3 h-3" />
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime}
                  </div>
                </div>

                <h3 className="text-lg font-black text-white mb-3 leading-snug flex-1">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-5">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-gray-600 text-xs">{post.date}</span>
                  <span
                    className="flex items-center gap-1.5 text-sm font-bold transition-all duration-300 group-hover:gap-2.5"
                    style={{ color: post.accentColor }}
                  >
                    Číst
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
