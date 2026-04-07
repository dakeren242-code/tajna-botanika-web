import { memo } from 'react';
import { Award, TrendingUp } from 'lucide-react';
import { useLoyalty, TIER_INFO } from '../contexts/LoyaltyContext';

function LoyaltyBadge({ variant = 'compact' }: { variant?: 'compact' | 'full' }) {
  const { points, loading } = useLoyalty();

  if (!points || loading) return null;

  const tier = TIER_INFO[points.tier] || TIER_INFO.explorer;
  const currentPts = points.current_points;
  const lifetimePts = points.lifetime_points;

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${tier.bgColor} ${tier.color}`}>
        <Award className="w-3 h-3" />
        <span>{currentPts}</span>
      </div>
    );
  }

  // Full variant — shows progress to next tier
  const progress = tier.next
    ? Math.min(100, ((lifetimePts - tier.min) / (tier.next - tier.min)) * 100)
    : 100;

  const nextTierKey = tier.next
    ? Object.entries(TIER_INFO).find(([, v]) => v.min === tier.next)?.[1]
    : null;

  return (
    <div className={`p-4 rounded-xl border ${tier.bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Award className={`w-5 h-5 ${tier.color}`} />
          <span className={`font-bold ${tier.color}`}>{tier.name}</span>
          {tier.multiplier > 1 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">{tier.multiplier}x body</span>
          )}
        </div>
        <span className="text-gray-400 text-sm font-mono">{currentPts} bodů</span>
      </div>

      {nextTierKey && tier.next && (
        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Do úrovně {nextTierKey.name}
            </span>
            <span>{tier.next - lifetimePts} bodů</span>
          </div>
          <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {!nextTierKey && (
        <p className="text-purple-300 text-xs">Maximální úroveň — 2x body za každý nákup!</p>
      )}
    </div>
  );
}

export default memo(LoyaltyBadge);
