import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          price: number
          thc_content: string | null
          cbd_content: string | null
          flavor_profile: string | null
          effects: string | null
          color_accent: string | null
          glow_color: string | null
          image_url: string | null
          featured: boolean | null
          stock: number | null
          created_at: string | null
          updated_at: string | null
          thc_x_percent: number | null
          thc_percent: number | null
          cbd_percent: number | null
          cbg_percent: number | null
          gram_options: number[] | null
          thcx_content: number | null
          thc_percentage: number | null
          cbd_percentage: number | null
          cbg_percentage: number | null
          category: string | null
          original_price: number | null
          is_popular: boolean | null
          is_subscription: boolean | null
          subscription_period: string | null
          discount_percentage: number | null
          meta_catalog_id: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description: string
          price?: number
          thc_content?: string | null
          cbd_content?: string | null
          flavor_profile?: string | null
          effects?: string | null
          color_accent?: string | null
          glow_color?: string | null
          image_url?: string | null
          featured?: boolean | null
          stock?: number | null
          created_at?: string | null
          updated_at?: string | null
          thc_x_percent?: number | null
          thc_percent?: number | null
          cbd_percent?: number | null
          cbg_percent?: number | null
          gram_options?: number[] | null
          thcx_content?: number | null
          thc_percentage?: number | null
          cbd_percentage?: number | null
          cbg_percentage?: number | null
          category?: string | null
          original_price?: number | null
          is_popular?: boolean | null
          is_subscription?: boolean | null
          subscription_period?: string | null
          discount_percentage?: number | null
          meta_catalog_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          price?: number
          thc_content?: string | null
          cbd_content?: string | null
          flavor_profile?: string | null
          effects?: string | null
          color_accent?: string | null
          glow_color?: string | null
          image_url?: string | null
          featured?: boolean | null
          stock?: number | null
          created_at?: string | null
          updated_at?: string | null
          thc_x_percent?: number | null
          thc_percent?: number | null
          cbd_percent?: number | null
          cbg_percent?: number | null
          gram_options?: number[] | null
          thcx_content?: number | null
          thc_percentage?: number | null
          cbd_percentage?: number | null
          cbg_percentage?: number | null
          category?: string | null
          original_price?: number | null
          is_popular?: boolean | null
          is_subscription?: boolean | null
          subscription_period?: string | null
          discount_percentage?: number | null
          meta_catalog_id?: string | null
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
  user_id: string | null;
  order_number: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'failed';
  payment_status: 'pending' | 'awaiting_confirmation' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
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
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  customer_first_name?: string | null;
  customer_last_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  payment_method?: string | null;
  shipping_method?: string | null;
  shipping_address?: { street?: string; city?: string; zip?: string } | null;
  billing_address?: any | null;
  packeta_point_id?: string | null;
  packeta_point_name?: string | null;
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