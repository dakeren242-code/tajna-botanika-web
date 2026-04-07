import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

/* ─── Types ─── */
export interface LoyaltyPoints {
  user_id: string;
  current_points: number;
  lifetime_points: number;
  tier: 'explorer' | 'connoisseur' | 'master' | 'legend';
  last_activity_at: string;
}

export interface LoyaltyTransaction {
  id: string;
  points: number;
  type: string;
  description: string | null;
  reference_id: string | null;
  created_at: string;
}

export interface LoyaltyReward {
  id: string;
  slug: string;
  name_cs: string;
  description_cs: string | null;
  points_cost: number;
  reward_type: 'discount' | 'shipping' | 'sample' | 'spin' | 'mystery_points';
  reward_value: any;
  sort_order: number;
}

export interface LoyaltyRedemption {
  id: string;
  reward_id: string;
  points_spent: number;
  status: 'active' | 'used' | 'expired';
  reward_data: any;
  used_order_id: string | null;
  expires_at: string;
  created_at: string;
  reward?: LoyaltyReward;
}

export const TIER_INFO: Record<string, { name: string; min: number; next: number | null; multiplier: number; color: string; bgColor: string }> = {
  explorer:     { name: 'Objevitel',  min: 0,     next: 1500,  multiplier: 1,    color: 'text-amber-500',  bgColor: 'bg-amber-500/10 border-amber-500/20' },
  connoisseur:  { name: 'Znalec',    min: 1500,  next: 5000,  multiplier: 1.25, color: 'text-gray-300',   bgColor: 'bg-gray-400/10 border-gray-400/20' },
  master:       { name: 'Mistr',     min: 5000,  next: 15000, multiplier: 1.5,  color: 'text-yellow-400', bgColor: 'bg-yellow-400/10 border-yellow-400/20' },
  legend:       { name: 'Legenda',   min: 15000, next: null,  multiplier: 2,    color: 'text-purple-300', bgColor: 'bg-purple-400/10 border-purple-400/20' },
};

/* ─── Spin wheel prizes ─── */
export const SPIN_PRIZES = [
  { label: '+50 bodů',         weight: 30, type: 'points' as const, value: 50,  color: '#10b981' },
  { label: '+100 bodů',        weight: 20, type: 'points' as const, value: 100, color: '#06b6d4' },
  { label: 'Doprava zdarma',   weight: 15, type: 'shipping' as const, value: 0, color: '#3b82f6' },
  { label: '10% sleva',        weight: 15, type: 'discount' as const, value: 10, color: '#f59e0b' },
  { label: 'Gratis 1g vzorek', weight: 10, type: 'sample' as const, value: 1,  color: '#a855f7' },
  { label: '+500 bodů!',       weight: 8,  type: 'points' as const, value: 500, color: '#ef4444' },
  { label: '20% sleva!',       weight: 2,  type: 'discount' as const, value: 20, color: '#ec4899' },
];

/* ─── Context ─── */
interface LoyaltyContextType {
  points: LoyaltyPoints | null;
  transactions: LoyaltyTransaction[];
  rewards: LoyaltyReward[];
  activeRedemptions: LoyaltyRedemption[];
  loading: boolean;
  refresh: () => Promise<void>;
  redeemReward: (rewardId: string) => Promise<{ success: boolean; error?: string; redemption?: LoyaltyRedemption }>;
  spinWheel: () => Promise<{ success: boolean; prizeIndex?: number; error?: string }>;
}

const LoyaltyContext = createContext<LoyaltyContextType>({
  points: null, transactions: [], rewards: [], activeRedemptions: [],
  loading: true, refresh: async () => {},
  redeemReward: async () => ({ success: false }),
  spinWheel: async () => ({ success: false }),
});

export function useLoyalty() { return useContext(LoyaltyContext); }

/* ─── Provider ─── */
export function LoyaltyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [points, setPoints] = useState<LoyaltyPoints | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [activeRedemptions, setActiveRedemptions] = useState<LoyaltyRedemption[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setPoints(null);
      setTransactions([]);
      setActiveRedemptions([]);
      setLoading(false);
      return;
    }

    const [ptsRes, txRes, rwdRes, redRes] = await Promise.all([
      supabase.from('loyalty_points').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('loyalty_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('loyalty_rewards').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('loyalty_redemptions').select('*, reward:loyalty_rewards(*)').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }),
    ]);

    if (ptsRes.data) setPoints(ptsRes.data);
    if (txRes.data) setTransactions(txRes.data);
    if (rwdRes.data) setRewards(rwdRes.data);
    if (redRes.data) setActiveRedemptions(redRes.data as any);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const redeemReward = useCallback(async (rewardId: string): Promise<{ success: boolean; error?: string; redemption?: LoyaltyRedemption }> => {
    if (!user || !points) return { success: false, error: 'Nejste přihlášeni' };

    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return { success: false, error: 'Odměna nenalezena' };

    if (reward.reward_type === 'spin') {
      return { success: false, error: 'Pro kolo štěstí použijte spinWheel()' };
    }

    if (points.current_points < reward.points_cost) {
      return { success: false, error: `Nemáte dostatek bodů (potřeba ${reward.points_cost})` };
    }

    // Deduct points
    const { error: updateErr } = await supabase
      .from('loyalty_points')
      .update({
        current_points: points.current_points - reward.points_cost,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateErr) return { success: false, error: 'Chyba při odpočtu bodů' };

    // Log transaction
    const txType = reward.reward_type === 'discount' ? 'redeem_discount'
      : reward.reward_type === 'shipping' ? 'redeem_shipping'
      : 'redeem_sample';

    await supabase.from('loyalty_transactions').insert({
      user_id: user.id,
      points: -reward.points_cost,
      type: txType,
      description: `Výměna: ${reward.name_cs}`,
    });

    // Create redemption
    const { data: redemption, error: redErr } = await supabase
      .from('loyalty_redemptions')
      .insert({
        user_id: user.id,
        reward_id: reward.id,
        points_spent: reward.points_cost,
        reward_data: reward.reward_value,
      })
      .select()
      .single();

    if (redErr) return { success: false, error: 'Chyba při vytváření odměny' };

    await refresh();
    return { success: true, redemption };
  }, [user, points, rewards, refresh]);

  const spinWheel = useCallback(async (): Promise<{ success: boolean; prizeIndex?: number; error?: string }> => {
    if (!user || !points) return { success: false, error: 'Nejste přihlášeni' };

    const spinReward = rewards.find(r => r.reward_type === 'spin');
    if (!spinReward) return { success: false, error: 'Kolo štěstí není dostupné' };

    if (points.current_points < spinReward.points_cost) {
      return { success: false, error: `Potřebujete ${spinReward.points_cost} bodů` };
    }

    // Daily limit: max 3 spins
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('loyalty_transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', 'spin_cost')
      .gte('created_at', today);

    if ((count ?? 0) >= 3) {
      return { success: false, error: 'Dnes už jste točili 3×. Zkuste zítra!' };
    }

    // Deduct spin cost
    await supabase.from('loyalty_points').update({
      current_points: points.current_points - spinReward.points_cost,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id);

    await supabase.from('loyalty_transactions').insert({
      user_id: user.id,
      points: -spinReward.points_cost,
      type: 'spin_cost',
      description: 'Zatočení kolem štěstí',
    });

    // Weighted random prize
    const totalWeight = SPIN_PRIZES.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * totalWeight;
    let prizeIndex = 0;
    for (let i = 0; i < SPIN_PRIZES.length; i++) {
      r -= SPIN_PRIZES[i].weight;
      if (r <= 0) { prizeIndex = i; break; }
    }

    const prize = SPIN_PRIZES[prizeIndex];

    // Apply prize
    if (prize.type === 'points') {
      await supabase.from('loyalty_points').update({
        current_points: (points.current_points - spinReward.points_cost) + prize.value,
        lifetime_points: points.lifetime_points + prize.value,
        updated_at: new Date().toISOString(),
      }).eq('user_id', user.id);

      await supabase.from('loyalty_transactions').insert({
        user_id: user.id,
        points: prize.value,
        type: 'spin_win',
        description: `Výhra v kole: ${prize.label}`,
      });
    } else {
      // Create redemption for non-points prizes
      const rewardData = prize.type === 'discount'
        ? { discount_percent: prize.value }
        : prize.type === 'shipping'
        ? { free_shipping: true }
        : { sample_grams: prize.value };

      await supabase.from('loyalty_redemptions').insert({
        user_id: user.id,
        reward_id: spinReward.id,
        points_spent: 0,
        reward_data: rewardData,
      });

      await supabase.from('loyalty_transactions').insert({
        user_id: user.id,
        points: 0,
        type: 'spin_win',
        description: `Výhra v kole: ${prize.label}`,
      });
    }

    await refresh();
    return { success: true, prizeIndex };
  }, [user, points, rewards, refresh]);

  return (
    <LoyaltyContext.Provider value={{ points, transactions, rewards, activeRedemptions, loading, refresh, redeemReward, spinWheel }}>
      {children}
    </LoyaltyContext.Provider>
  );
}
