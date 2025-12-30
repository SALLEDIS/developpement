/*
  # Fix RLS policies for all tables

  1. Changes
    - Update policies for products, orders, tables, users, and other tables
    - Allow all operations since the app uses local authentication (localStorage)
    - This is a temporary solution until Supabase Auth is properly integrated

  2. Security Notes
    - These permissive policies allow all operations
    - In production, proper Supabase Auth integration should be implemented
    - RLS is still enabled, but policies are permissive
*/

-- Fix products table policies
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Anyone can read products" ON products;

CREATE POLICY "Allow all operations on products"
  ON products
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Fix orders table policies
DROP POLICY IF EXISTS "Anyone can read orders" ON orders;
DROP POLICY IF EXISTS "Staff can create orders" ON orders;
DROP POLICY IF EXISTS "Staff can update orders" ON orders;

CREATE POLICY "Allow all operations on orders"
  ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Fix tables table policies
DROP POLICY IF EXISTS "Anyone can read tables" ON tables;
DROP POLICY IF EXISTS "Staff can update tables" ON tables;

CREATE POLICY "Allow all operations on tables"
  ON tables
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Fix users table policies
DROP POLICY IF EXISTS "Admins can insert users" ON users;
DROP POLICY IF EXISTS "Admins can update users" ON users;
DROP POLICY IF EXISTS "Users can read all users" ON users;

CREATE POLICY "Allow all operations on users"
  ON users
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Fix customers table policies if any exist
DROP POLICY IF EXISTS "Allow all operations on customers" ON customers;
CREATE POLICY "Allow all operations on customers"
  ON customers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Fix printers table policies if any exist
DROP POLICY IF EXISTS "Allow all operations on printers" ON printers;
CREATE POLICY "Allow all operations on printers"
  ON printers
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Fix cash_sessions table policies if any exist
DROP POLICY IF EXISTS "Allow all operations on cash_sessions" ON cash_sessions;
CREATE POLICY "Allow all operations on cash_sessions"
  ON cash_sessions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Fix expenses table policies if any exist
DROP POLICY IF EXISTS "Allow all operations on expenses" ON expenses;
CREATE POLICY "Allow all operations on expenses"
  ON expenses
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Fix settings table policies if any exist
DROP POLICY IF EXISTS "Allow all operations on settings" ON settings;
CREATE POLICY "Allow all operations on settings"
  ON settings
  FOR ALL
  USING (true)
  WITH CHECK (true);
