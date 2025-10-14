import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'cashier' | 'waiter';
          pin_code: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['categories']['Insert']>;
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          price: number;
          sizes: any | null;
          image: string | null;
          printer: string | null;
          is_active: boolean;
          stock_quantity: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      tables: {
        Row: {
          id: string;
          number: number;
          capacity: number;
          section: string;
          status: 'available' | 'occupied' | 'reserved';
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['tables']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['tables']['Insert']>;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          type: 'dine-in' | 'takeaway' | 'delivery' | 'kiosk';
          status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
          table_id: string | null;
          customer_id: string | null;
          waiter_id: string | null;
          items: any;
          subtotal: number;
          tax: number;
          total: number;
          payment_method: 'cash' | 'card' | 'digital' | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Insert']>;
      };
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          email: string | null;
          address: string | null;
          loyalty_points: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['customers']['Insert']>;
      };
      printers: {
        Row: {
          id: string;
          name: string;
          type: 'cuisine' | 'bar' | 'caisse';
          ip_address: string;
          port: number;
          model: string;
          paper_size: string;
          is_active: boolean;
          is_online: boolean;
          categories: any;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['printers']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['printers']['Insert']>;
      };
      cash_sessions: {
        Row: {
          id: string;
          user_id: string;
          opening_amount: number;
          closing_amount: number | null;
          expected_amount: number | null;
          difference: number | null;
          status: 'open' | 'closed';
          opened_at: string;
          closed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['cash_sessions']['Row'], 'id' | 'opened_at'>;
        Update: Partial<Database['public']['Tables']['cash_sessions']['Insert']>;
      };
      expenses: {
        Row: {
          id: string;
          cash_session_id: string | null;
          user_id: string;
          amount: number;
          category: string;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>;
      };
      settings: {
        Row: {
          id: string;
          key: string;
          value: any;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['settings']['Insert']>;
      };
    };
  };
};
