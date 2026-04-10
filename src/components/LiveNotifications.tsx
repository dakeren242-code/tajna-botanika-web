import { useEffect, useState, useRef } from 'react';
import { ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';

const cities = ['Prahy', 'Brna', 'Ostravy', 'Plzně', 'Liberce', 'Olomouce', 'Hradce Králové', 'Českých Budějovic', 'Pardubic', 'Zlína'];
const names = ['Jan', 'Petr', 'Martin', 'Tomáš', 'Jakub', 'Marie', 'Jana', 'Eva', 'Kateřina', 'Tereza', 'Ondřej', 'Adam'];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export default function LiveNotifications() {
  const [message, setMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [productNames, setProductNames] = useState<string[]>([]);
  const showCount = useRef(0);

  useEffect(() => {
    supabase.from('products').select('name').limit(10).then(({ data }) => {
      if (data) setProductNames(data.map(p => p.name));
    });
  }, []);

  useEffect(() => {
    if (productNames.length === 0) return;

    const show = () => {
      if (showCount.current >= 3) return; // max 3 per session
      showCount.current += 1;
      setMessage(`${pick(names)} z ${pick(cities)} objednal/a ${pick(productNames)}`);
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 5000);
    };

    // First after 2 minutes, then every 3-5 minutes
    const first = setTimeout(() => {
      show();
      const next = () => setTimeout(() => { show(); timer = next(); }, 180000 + Math.random() * 120000);
      timer = next();
    }, 120000);

    let timer: ReturnType<typeof setTimeout>;
    return () => { clearTimeout(first); clearTimeout(timer); };
  }, [productNames]);

  if (!message) return null;

  return (
    <div className={`hidden md:block fixed bottom-6 right-6 z-50 max-w-xs transition-all duration-500 ease-out ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%+2rem)] opacity-0'
    }`}>
      <div className="p-3.5 rounded-2xl backdrop-blur-xl border border-white/10 bg-black/85 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <p className="text-sm text-gray-200 leading-snug">{message}</p>
        </div>
      </div>
    </div>
  );
}
