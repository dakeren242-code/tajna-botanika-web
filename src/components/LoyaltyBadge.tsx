import { memo } from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Small loyalty tier badge shown in the header area or profile.
 * Points: 1 Kč = 1 bod. Tiers:
 *   0-499   → Seedling (Bronze)
 *   500-1999 → Grower (Silver)
 *   2000-4999 → Connoisseur (Gold)
 *   5000+    → VIP Collector (Platinum)
 *
 * Points are tracked locally for now (future: Supabase table).
 */

interface Tier {
  name: string;
  minPoints: number;
  color: string;
  bgColor: string;
  nextTier: string | null;
  nextPoints: number | null;
  discount: number; // percent
}

const tiers: Tier[] = [
  { name: 'Seedling', minPoints: 0, color: 'text-amber-600', bgColor: 'bg-amber-500/10 border-amber-500/20', nextTier: 'Grower', nextPoints: 500, discount: 0 },
  { name: 'Grower', minPoints: 500, color: 'text-gray-300', bgColor: 'bg-gray-400/10 border-gray-400/20', nextTier: 'Connoisseur', nextPoints: 2000, discount: 5 },
  { name: 'Connoisseur', minPoints: 2000, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10 border-yellow-400/20', nextTier: 'VIP Collector', nextPoints: 5000, discount: 10 },
  { name: 'VIP Collector', minPoints: 5000, color: 'text-purple-300', bgColor: 'bg-purple-400/10 border-purple-400/20', nextTier: null, nextPoints: null, discount: 15 },
];

function getTier(points: number): Tier {
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (points >= tiers[i].minPoints) return tiers[i];
  }
  return tiers[0];
}

function LoyaltyBadge({ variant = 'compact' }: { variant?: 'compact' | 'full' }) {
  const { user } = useAuth();

  if (!user) return null;

  // Get points from localStorage (will be migrated to Supabase later)
  const points = parseInt(localStorage.getItem(`loyalty_${user.id}`) || '0', 10);
  const tier = getTier(points);

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${tier.bgColor} ${tier.color}`}>
        <Award className="w-3 h-3" />
        {tier.name}
      </div>
    );
  }

  // Full variant — shows progress
  const progress = tier.nextPoints
    ? Math.min(100, ((points - tier.minPoints) / (tier.nextPoints - tier.minPoints)) * 100)
    : 100;

  return (
    <div className={`p-4 rounded-xl border ${tier.bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className={`w-5 h-5 ${tier.color}`} />
          <span className={`font-bold ${tier.color}`}>{tier.name}</span>
        </div>
        <span className="text-gray-400 text-sm font-mono">{points} bodů</span>
      </div>

      {tier.discount > 0 && (
        <p className="text-emerald-400 text-sm mb-2 font-medium">
          Máte trvalou slevu {tier.discount}% na všechny produkty
        </p>
      )}

      {tier.nextTier && (
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Do úrovně {tier.nextTier}
            </span>
            <span>{tier.nextPoints! - points} bodů</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(LoyaltyBadge);
export { getTier, tiers };
