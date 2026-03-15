import { useEffect, useState } from 'react';
import { ShoppingCart, Eye, CheckCircle, TrendingUp, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Notification {
  id: number;
  type: 'cart' | 'view' | 'order';
  message: string;
  icon: any;
  time: string;
}

const cities = ['Prahy', 'Brna', 'Ostravy', 'Plzně', 'Liberce', 'Olomouce', 'Hradce Králové', 'Českých Budějovic', 'Pardubic', 'Zlína'];
const names = ['Jan', 'Petr', 'Pavel', 'Martin', 'Tomáš', 'Jakub', 'Lukáš', 'David', 'Ondřej', 'Filip', 'Marie', 'Jana', 'Eva', 'Anna', 'Lenka', 'Kateřina', 'Tereza', 'Petra', 'Lucie', 'Hana'];

const getRandomName = () => names[Math.floor(Math.random() * names.length)];
const getRandomCity = () => cities[Math.floor(Math.random() * cities.length)];

const generateNotifications = (productNames: string[]): Notification[] => {
  const getRandomProduct = () => productNames.length > 0
    ? productNames[Math.floor(Math.random() * productNames.length)]
    : 'produkt';

  const notifications = [
    {
      id: 1,
      type: 'cart' as const,
      message: `${getRandomName()} z ${getRandomCity()} si právě přidal do košíku ${getRandomProduct()}`,
      icon: ShoppingCart,
      time: 'před chvílí',
    },
    {
      id: 2,
      type: 'view' as const,
      message: `${getRandomName()} z ${getRandomCity()} právě prohlíží ${getRandomProduct()}`,
      icon: Eye,
      time: 'před 1 min',
    },
    {
      id: 3,
      type: 'order' as const,
      message: `${getRandomName()} z ${getRandomCity()} právě dokončil objednávku`,
      icon: CheckCircle,
      time: 'před 2 min',
    },
    {
      id: 4,
      type: 'cart' as const,
      message: `${getRandomName()} z ${getRandomCity()} si právě přidal do košíku ${getRandomProduct()}`,
      icon: ShoppingCart,
      time: 'před 3 min',
    },
    {
      id: 5,
      type: 'view' as const,
      message: `${Math.floor(Math.random() * 8 + 3)} lidí právě prohlíží ${getRandomProduct()}`,
      icon: User,
      time: 'před 4 min',
    },
    {
      id: 6,
      type: 'order' as const,
      message: `${getRandomName()} z ${getRandomCity()} právě dokončil objednávku za ${Math.floor(Math.random() * 2000 + 500)} Kč`,
      icon: TrendingUp,
      time: 'před 5 min',
    },
  ];

  return notifications;
};

export default function LiveNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [productNames, setProductNames] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('name')
        .limit(10);

      if (data) {
        const names = data.map(p => p.name);
        setProductNames(names);
        setNotifications(generateNotifications(names));
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (notifications.length === 0 || productNames.length === 0) return;

    const showNotification = () => {
      const freshNotifications = generateNotifications(productNames);
      const randomNotif = freshNotifications[Math.floor(Math.random() * freshNotifications.length)];

      setCurrentNotification(randomNotif);
      setIsVisible(true);

      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    };

    const interval = setInterval(showNotification, 8000);
    showNotification();

    return () => clearInterval(interval);
  }, [notifications, productNames]);

  if (!currentNotification) return null;

  const Icon = currentNotification.icon;

  const getColorClasses = () => {
    switch (currentNotification.type) {
      case 'cart':
        return 'from-emerald-500/20 to-green-500/20 border-emerald-400/40';
      case 'view':
        return 'from-cyan-500/20 to-blue-500/20 border-cyan-400/40';
      case 'order':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-400/40';
      default:
        return 'from-emerald-500/20 to-green-500/20 border-emerald-400/40';
    }
  };

  const getIconColor = () => {
    switch (currentNotification.type) {
      case 'cart':
        return 'text-emerald-400';
      case 'view':
        return 'text-cyan-400';
      case 'order':
        return 'text-yellow-400';
      default:
        return 'text-emerald-400';
    }
  };

  return (
    /* Přidána třída hidden md:block - na mobilu se celé div skryje */
    <div
      className={`hidden md:block fixed bottom-6 right-6 z-50 max-w-sm transition-all duration-500 ease-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-[calc(100%+2rem)] opacity-0'
      }`}
    >
      <div
        className={`relative p-4 rounded-2xl backdrop-blur-xl border-2 bg-gradient-to-br ${getColorClasses()} shadow-2xl`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-notification rounded-2xl" />

        <div className="relative flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-black/30 border border-white/10 ${getIconColor()}`}>
            <Icon className="w-5 h-5 animate-pulse-gentle" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${getIconColor()} animate-pulse`} />
              <span className="text-xs text-gray-300 font-medium uppercase tracking-wide">
                {currentNotification.time}
              </span>
            </div>
            <p className="text-sm text-white font-medium leading-relaxed">
              {currentNotification.message}
            </p>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-2xl overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-yellow-400 animate-progress-bar" />
        </div>
      </div>

      <style>{`
        @keyframes shimmer-notification {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer-notification {
          animation: shimmer-notification 3s ease-in-out infinite;
        }
        @keyframes progress-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(0%); }
        }
        .animate-progress-bar {
          animation: progress-bar 5s linear forwards;
        }
        @keyframes pulse-gentle-notif {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        .animate-pulse-gentle {
          animation: pulse-gentle-notif 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}