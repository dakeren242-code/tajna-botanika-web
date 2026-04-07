import { useEffect, useState, useRef } from 'react';
import { Eye, ShoppingBag, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Notification {
  id: number;
  message: string;
  time: string;
  type: 'view' | 'purchase' | 'review';
}

const cities = ['Prahy', 'Brna', 'Ostravy', 'Plzně', 'Liberce', 'Olomouce', 'Hradce Králové', 'Českých Budějovic', 'Pardubic', 'Zlína', 'Ústí nad Labem', 'Karviné', 'Frýdku-Místku', 'Jihlavy', 'Tábora', 'Kladna', 'Mostu', 'Karlových Varů'];
const names = ['Jan', 'Petr', 'Martin', 'Tomáš', 'Jakub', 'Lukáš', 'David', 'Filip', 'Marie', 'Jana', 'Eva', 'Anna', 'Kateřina', 'Tereza', 'Lucie', 'Hana', 'Ondřej', 'Adam', 'Daniel', 'Marek'];
const weights = ['1g', '3g', '5g'];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getTime = () => `PŘED ${Math.floor(Math.random() * 12 + 1)} MIN`;

export default function LiveNotifications() {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [productNames, setProductNames] = useState<string[]>([]);
  const showCount = useRef(0);
  const MAX_NOTIFICATIONS = 6;

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase.from('products').select('name').limit(10);
      if (data) setProductNames(data.map(p => p.name));
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (productNames.length === 0) return;

    const generateNotification = (): Notification => {
      const name = pick(names);
      const city = pick(cities);
      const product = pick(productNames);
      const weight = pick(weights);

      // Weighted random: 40% purchase, 35% view, 25% review
      const rand = Math.random();
      if (rand < 0.4) {
        return {
          id: Date.now(),
          message: `${name} z ${city} právě objednal/a ${product} ${weight}`,
          time: getTime(),
          type: 'purchase',
        };
      } else if (rand < 0.75) {
        return {
          id: Date.now(),
          message: `${name} z ${city} právě prohlíží ${product}`,
          time: getTime(),
          type: 'view',
        };
      } else {
        const ratings = ['⭐⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];
        return {
          id: Date.now(),
          message: `${name} hodnotil/a ${product}: ${pick(ratings)}`,
          time: getTime(),
          type: 'review',
        };
      }
    };

    const showNotification = () => {
      if (showCount.current >= MAX_NOTIFICATIONS) return;
      showCount.current += 1;

      setCurrentNotification(generateNotification());
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 5500);
    };

    // First after 30s, then 45-90s intervals
    const initialDelay = setTimeout(() => {
      showNotification();
      const scheduleNext = () => {
        const delay = 45000 + Math.random() * 45000;
        return setTimeout(() => {
          showNotification();
          timer = scheduleNext();
        }, delay);
      };
      timer = scheduleNext();
    }, 30000);

    let timer: ReturnType<typeof setTimeout>;
    return () => { clearTimeout(initialDelay); clearTimeout(timer); };
  }, [productNames]);

  if (!currentNotification) return null;

  const iconMap = {
    view: <Eye className="w-4 h-4" />,
    purchase: <ShoppingBag className="w-4 h-4" />,
    review: <Star className="w-4 h-4" />,
  };

  const colorMap = {
    view: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    purchase: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    review: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  };

  return (
    <div
      className={`hidden md:block fixed bottom-6 right-6 z-50 max-w-sm transition-all duration-500 ease-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%+2rem)] opacity-0'
      }`}
    >
      <div className="relative p-4 rounded-2xl backdrop-blur-xl border border-white/10 bg-black/85 shadow-2xl">
        <div className="relative flex items-start gap-3">
          <div className={`p-2.5 rounded-xl border ${colorMap[currentNotification.type]}`}>
            {iconMap[currentNotification.type]}
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              {currentNotification.time}
            </span>
            <p className="text-sm text-gray-200 leading-relaxed mt-0.5">
              {currentNotification.message}
            </p>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-600 hover:text-white transition-colors mt-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
