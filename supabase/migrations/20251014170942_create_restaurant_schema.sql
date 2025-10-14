/*
  # Schéma complet pour système de caisse restaurant

  1. Nouvelles Tables
    - `users` - Utilisateurs du système (serveurs, caissiers, administrateurs)
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `role` (text) - 'admin', 'cashier', 'waiter'
      - `pin_code` (text) - Code PIN pour connexion rapide
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `categories` - Catégories de produits
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)

    - `products` - Produits du menu
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `price` (numeric)
      - `sizes` (jsonb) - Pour produits avec tailles multiples
      - `image` (text) - URL de l'image
      - `printer` (text) - Imprimante assignée
      - `is_active` (boolean)
      - `stock_quantity` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `tables` - Tables du restaurant
      - `id` (uuid, primary key)
      - `number` (integer, unique)
      - `capacity` (integer)
      - `section` (text)
      - `status` (text) - 'available', 'occupied', 'reserved'
      - `created_at` (timestamptz)

    - `orders` - Commandes
      - `id` (uuid, primary key)
      - `order_number` (text, unique)
      - `type` (text) - 'dine-in', 'takeaway', 'delivery', 'kiosk'
      - `status` (text) - 'pending', 'preparing', 'ready', 'served', 'paid', 'cancelled'
      - `table_id` (uuid, foreign key)
      - `customer_id` (uuid, foreign key)
      - `waiter_id` (uuid, foreign key)
      - `items` (jsonb) - Articles de la commande
      - `subtotal` (numeric)
      - `tax` (numeric)
      - `total` (numeric)
      - `payment_method` (text) - 'cash', 'card', 'digital'
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `customers` - Clients
      - `id` (uuid, primary key)
      - `name` (text)
      - `phone` (text)
      - `email` (text)
      - `address` (text)
      - `loyalty_points` (integer)
      - `created_at` (timestamptz)

    - `printers` - Configuration des imprimantes
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text) - 'cuisine', 'bar', 'caisse'
      - `ip_address` (text)
      - `port` (integer)
      - `model` (text)
      - `paper_size` (text)
      - `is_active` (boolean)
      - `is_online` (boolean)
      - `categories` (jsonb) - Catégories assignées
      - `created_at` (timestamptz)

    - `cash_sessions` - Sessions de caisse
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `opening_amount` (numeric)
      - `closing_amount` (numeric)
      - `expected_amount` (numeric)
      - `difference` (numeric)
      - `status` (text) - 'open', 'closed'
      - `opened_at` (timestamptz)
      - `closed_at` (timestamptz)

    - `expenses` - Dépenses
      - `id` (uuid, primary key)
      - `cash_session_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `amount` (numeric)
      - `category` (text)
      - `description` (text)
      - `created_at` (timestamptz)

    - `settings` - Paramètres du restaurant
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `value` (jsonb)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated access
*/

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'waiter',
  pin_code text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update users"
  ON users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  sizes jsonb,
  image text,
  printer text,
  is_active boolean DEFAULT true,
  stock_quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Tables table
CREATE TABLE IF NOT EXISTS tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer UNIQUE NOT NULL,
  capacity integer NOT NULL DEFAULT 2,
  section text NOT NULL,
  status text DEFAULT 'available',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read tables"
  ON tables FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can update tables"
  ON tables FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  address text,
  loyalty_points integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can manage customers"
  ON customers FOR ALL
  TO authenticated
  USING (true);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'pending',
  table_id uuid REFERENCES tables(id),
  customer_id uuid REFERENCES customers(id),
  waiter_id uuid REFERENCES users(id),
  items jsonb NOT NULL,
  subtotal numeric NOT NULL DEFAULT 0,
  tax numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Staff can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Printers table
CREATE TABLE IF NOT EXISTS printers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  ip_address text NOT NULL,
  port integer DEFAULT 0,
  model text NOT NULL,
  paper_size text DEFAULT '80mm',
  is_active boolean DEFAULT true,
  is_online boolean DEFAULT false,
  categories jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE printers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read printers"
  ON printers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage printers"
  ON printers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Cash sessions table
CREATE TABLE IF NOT EXISTS cash_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  opening_amount numeric NOT NULL DEFAULT 0,
  closing_amount numeric,
  expected_amount numeric,
  difference numeric,
  status text DEFAULT 'open',
  opened_at timestamptz DEFAULT now(),
  closed_at timestamptz
);

ALTER TABLE cash_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cash sessions"
  ON cash_sessions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own sessions"
  ON cash_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cash_session_id uuid REFERENCES cash_sessions(id),
  user_id uuid REFERENCES users(id) NOT NULL,
  amount numeric NOT NULL,
  category text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_user_id ON cash_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_cash_sessions_status ON cash_sessions(status);