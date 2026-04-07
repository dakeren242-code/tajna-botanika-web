import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useEffect } from 'react';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Stránka nenalezena | Tajná Botanika';
  }, []);

  return (
    <div className="min-h-screen text-white flex items-center justify-center px-6">
      <div className="text-center max-w-lg">
        <div className="text-[120px] font-black leading-none bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-3xl font-black text-white mb-4">
          Tato stránka neexistuje
        </h1>
        <p className="text-gray-400 mb-8 text-lg">
          Možná jste se překlepli v adrese, nebo byla stránka odstraněna.
          Nevadí — máme pro vás spoustu jiného obsahu!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-full hover:scale-105 transition-all"
          >
            <Home className="w-5 h-5" />
            Zpět na hlavní stránku
          </Link>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-all"
          >
            <Search className="w-5 h-5" />
            Procházet blog
          </Link>
        </div>
      </div>
    </div>
  );
}
