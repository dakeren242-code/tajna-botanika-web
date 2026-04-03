import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found in environment variables. Check your .env file.')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          category: string | null
          stock_quantity: number | null
          thc_content: number | null
          cbd_content: number | null
          effects: string[] | null
          featured: boolean | null
          meta_catalog_id: string | null
          created_at: string | null
          updated_at: string | null
          flavor_profile: string | null
          color_accent: string | null
          glow_color: string | null
          stock: number | null
          thc_x_percent: number | null
          thc_percent: number | null
          cbd_percent: number | null
          cbg_percent: number | null
          gram_options: number[] | null
          thcx_content: number | null
          thc_percentage: number | null
          cbd_percentage: number | null
          cbg_percentage: number | null
          original_price: number | null
          is_popular: boolean | null
          is_subscription: boolean | null
          subscription_period: string | null
          discount_percentage: number | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category?: string | null
          stock_quantity?: number | null
          thc_content?: number | null
          cbd_content?: number | null
          effects?: string[] | null
          featured?: boolean | null
          meta_catalog_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          flavor_profile?: string | null
          color_accent?: string | null
          glow_color?: string | null
          stock?: number | null
          thc_x_percent?: number | null
          thc_percent?: number | null
          cbd_percent?: number | null
          cbg_percent?: number | null
          gram_options?: number[] | null
          thcx_content?: number | null
          thc_percentage?: number | null
          cbd_percentage?: number | null
          cbg_percentage?: number | null
          original_price?: number | null
          is_popular?: boolean | null
          is_subscription?: boolean | null
          subscription_period?: string | null
          discount_percentage?: number | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category?: string | null
          stock_quantity?: number | null
          thc_content?: number | null
          cbd_content?: number | null
          effects?: string[] | null
          featured?: boolean | null
          meta_catalog_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          flavor_profile?: string | null
          color_accent?: string | null
          glow_color?: string | null
          stock?: number | null
          thc_x_percent?: number | null
          thc_percent?: number | null
          cbd_percent?: number | null
          cbg_percent?: number | null
          gram_options?: number[] | null
          thcx_content?: number | null
          thc_percentage?: number | null
          cbd_percentage?: number | null
          cbg_percentage?: number | null
          original_price?: number | null
          is_popular?: boolean | null
          is_subscription?: boolean | null
          subscription_period?: string | null
          discount_percentage?: number | null
        }
      }
      stripe_user_subscriptions: {
        Row: {
          customer_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          price_id: string | null
          current_period_start: number | null
          current_period_end: number | null
          cancel_at_period_end: boolean | null
          payment_method_brand: string | null
          payment_method_last4: string | null
        }
      }
    }
    Views: {
      stripe_user_subscriptions: {
        Row: {
          customer_id: string | null
          subscription_id: string | null
          subscription_status: string | null
          price_id: string | null
          current_period_start: number | null
          current_period_end: number | null
          cancel_at_period_end: boolean | null
          payment_method_brand: string | null
          payment_method_last4: string | null
        }
      }
    }
  }
}

export type Product = Database['public']['Tables']['products']['Row'];

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  user_id: string;
  type: 'billing' | 'delivery';
  full_name: string;
  street: string;
  city: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  total_amount: number;
  currency: string;
  delivery_address_id: string | null;
  billing_address_id: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_checkout_session_id?: string | null;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  gram_amount?: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  gramAmount: string;
}