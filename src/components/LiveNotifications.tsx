import { useEffect, useState, useRef } from 'react';
import { Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Notification {
  id: number;
  message: string;
  time: string;
}

const cities = ['Prahy', 'Brna', 'Ostravy', 'Plzně', 'Liberce', 'Olomouce', 'Hradce Králové', 'Českých Budějovic', 'Pardubic', 'Zlína', 'Ústí nad Labem', 'Karviné', 'Frýdku-Místku'];
const names = ['Jan', 'Petr', 'Martin', 'Tomáš', 'Jakub', 'Lukáš', 'David', 'Filip', 'Marie', 'Jana', 'Eva', 'Anna', 'Kateřina', 'Tereza', 'Lucie', 'Hana'];

const getRandomName = () => names[Math.floor(Math.random() * names.length)];
const getRandomCity = () => cities[Math.floor(Math.random() * cities.length)];
const getRandomTime = () => {
  const mins = Math.floor(Math.random() * 8 + 1);
  return `PŘED ${mins} MIN`;
};

export default function LiveNotifications() {
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [productNames, setProductNames] = useState<string[]>([]);
  const showCount = useRef(0);
  const MAX_NOTIFICATIONS = 4; // Max per session

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('name')
        .limit(10);
      if (data) {
        setProductNames(data.map(p => p.name));
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (productNames.length === 0) return;

    const showNotification = () => {
      if (showCount.current >= MAX_NOTIFICATIONS) return;
      showCount.current += 1;

      const product = productNames[Math.floor(Math.random() * productNames.length)];
      const notif: Notification = {
        id: Date.now(),
        message: `${getRandomName()} z ${getRandomCity()} právě prohlíží ${product}`,
        time: getRandomTime(),
      };

      setCurrentNotification(notif);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    // First notification after 45s, then random 60-120s intervals
    const initialDelay = setTimeout(() => {
      showNotification();
      const scheduleNext = () => {
        const delay = 60000 + Math.random() * 60000; // 60-120 seconds
        return setTimeout(() => {
          showNotification();
          timer = scheduleNext();
        }, delay);
      };
      timer = scheduleNext();
    }, 45000);

    let timer: ReturnType<typeof setTimeout>;

    return () => { clearTimeout(initialDelay); clearTimeout(timer); };
  }, [productNames]);

  if (!currentNotification) return null;

  return (
    <div
      className={`hidden md:block fixed bottom-6 right-6 z-50 max-w-sm transition-all duration-500 ease-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%+2rem)] opacity-0'
      }`}
    >
      <div className="relative p-4 rounded-2xl backdrop-blur-xl border border-white/10 bg-black/80 shadow-2xl">
        <div className="relative flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Eye className="w-4 h-4" />
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
