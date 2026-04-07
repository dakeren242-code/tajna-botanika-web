import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ArrowLeft, Clock, Tag, ArrowRight, BookOpen } from 'lucide-react';
import { blogPosts } from '../components/BlogSection';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const post = blogPosts.find(p => p.slug === slug);

  // SEO meta tags
  useEffect(() => {
    if (!post) return;
    document.title = `${post.title} | Tajná Botanika`;

    const setMeta = (name: string, content: string, property?: boolean) => {
      const attr = property ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    setMeta('description', post.excerpt);
    setMeta('og:title', post.title, true);
    setMeta('og:description', post.excerpt, true);
    setMeta('og:type', 'article', true);
    setMeta('og:url', `https://tajnabotanika.online/blog/${post.slug}`, true);
    setMeta('og:site_name', 'Tajná Botanika', true);
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', post.title);
    setMeta('twitter:description', post.excerpt);

    return () => {
      document.title = 'Tajná Botanika | Prémiové Květy a Sběratelské Produkty';
    };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">Článek nenalezen</h1>
          <Link to="/blog" className="text-emerald-400 hover:underline">Zpět na blog</Link>
        </div>
      </div>
    );
  }

  const otherPosts = blogPosts.filter(p => p.slug !== slug).slice(0, 3);

  const renderContent = (content: string) => {
    const paragraphs = content.trim().split('\n\n');
    return paragraphs.map((block, i) => {
      if (block.startsWith('## ')) {
        return (
          <h2 key={i} className="text-2xl font-black text-white mt-10 mb-4">
            {block.replace('## ', '')}
          </h2>
        );
      }
      if (block.startsWith('**') && block.endsWith('**')) {
        return (
          <p key={i} className="font-bold text-white mb-2">
            {block.replace(/\*\*/g, '')}
          </p>
        );
      }
      const lines = block.split('\n');
      return (
        <div key={i} className="mb-4">
          {lines.map((line, j) => {
            const parts = line.split(/(\*\*[^*]+\*\*)/g);
            return (
              <p key={j} className="text-gray-300 leading-relaxed mb-1">
                {parts.map((part, k) =>
                  part.startsWith('**') && part.endsWith('**')
                    ? <strong key={k} className="text-white font-bold">{part.replace(/\*\*/g, '')}</strong>
                    : part
                )}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="min-h-screen text-white">
      <div
        className="absolute top-0 left-0 right-0 h-96 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at top, ${post.accentColor}12, transparent 60%)`,
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-32 pb-24">
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Zpět na blog
        </Link>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${post.categoryColor}`}>
            <Tag className="w-3 h-3" />
            {post.category}
          </span>
          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            {post.readTime} čtení
          </div>
          <span className="text-gray-500 text-sm">{post.date}</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
          {post.title}
        </h1>

        <p
          className="text-xl leading-relaxed mb-12 pb-10 border-b border-white/10"
          style={{ color: '#9ca3af' }}
        >
          {post.excerpt}
        </p>

        <div className="prose prose-invert max-w-none">
          {renderContent(post.content)}
        </div>

        <div
          className="mt-16 p-8 rounded-2xl text-center"
          style={{
            background: `linear-gradient(135deg, ${post.accentColor}10, rgba(0,0,0,0.4))`,
            border: `1px solid ${post.accentColor}20`,
          }}
        >
          <h3 className="text-2xl font-black text-white mb-3">
            Připraveni vyzkoušet?
          </h3>
          <p className="text-gray-400 mb-6">
            Prohlédněte si naši kolekci prémiových produktů s plným botanickým profilem.
          </p>
          <Link
            to="/#products"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-black transition-all duration-300 hover:scale-105 hover:gap-3"
            style={{ backgroundColor: post.accentColor }}
          >
            Prohlédnout produkty
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {otherPosts.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center gap-2 mb-8">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <h3 className="text-xl font-black text-white">Další články</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {otherPosts.map((p) => (
                <Link
                  key={p.slug}
                  to={`/blog/${p.slug}`}
                  className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative p-5">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold text-white bg-gradient-to-r ${p.categoryColor} mb-3`}>
                      {p.category}
                    </span>
                    <h4 className="text-sm font-black text-white leading-snug mb-2 line-clamp-2">
                      {p.title}
                    </h4>
                    <span
                      className="flex items-center gap-1 text-xs font-bold mt-3 group-hover:gap-2 transition-all"
                      style={{ color: p.accentColor }}
                    >
                      Číst <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
