export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'waiter' | 'kitchen' | 'cashier';
  isActive: boolean;
  createdAt: Date;
  avatar?: string;
  permissions: string[];
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  sizes?: { name: string; price: number }[];
  image?: string;
  isActive: boolean;
  stock?: number;
  printer?: 'cuisine' | 'bar' | 'caisse';
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  printer?: 'cuisine' | 'bar' | 'caisse';
}

export interface Printer {
  id: string;
  name: string;
  type: 'cuisine' | 'bar' | 'caisse';
  ipAddress: string;
  port: number;
  model: string;
  paperSize: '58mm' | '80mm';
  isActive: boolean;
  isOnline: boolean;
  categories: string[];
  autoprint: boolean;
}

export interface Table {
  id: string;
  number: number;
  capacity: number;
  section: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  currentOrder?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  loyaltyPoints: number;
  totalOrders: number;
  lastVisit?: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  size?: string;
  notes?: string;
  category?: string;
  printer?: 'cuisine' | 'bar' | 'caisse';
}

export interface Order {
  id: string;
  orderNumber: string;
  type: 'dine-in' | 'takeaway' | 'delivery' | 'kiosk';
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  tableId?: string;
  customerId?: string;
  waiterId?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: 'cash' | 'card' | 'digital';
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  printedToPrinters?: string[];
}

export interface Sale {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'digital';
  timestamp: Date;
  cashierId: string;
}

export interface DashboardStats {
  todaysSales: number;
  todaysOrders: number;
  activeOrders: number;
  availableTables: number;
  popularProducts: Product[];
  recentOrders: Order[];
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: 'food' | 'supplies' | 'utilities' | 'maintenance' | 'staff' | 'other';
  date: Date;
  createdBy: string;
  receipt?: string;
}

export interface DailyReport {
  date: Date;
  sales: number;
  orders: number;
  expenses: number;
  profit: number;
  topProducts: { productId: string; quantity: number; revenue: number }[];
  paymentMethods: { method: string; amount: number }[];
}

export interface RestaurantSettings {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  logo?: string;
  taxRate: number;
  currency: string;
  timezone: string;
}

export interface CashSession {
  id: string;
  userId: string;
  userName: string;
  startTime: Date;
  endTime?: Date;
  startingCash: number;
  endingCash?: number;
  totalSales: number;
  totalExpenses: number;
  salesByCategory: { category: string; amount: number; count: number }[];
  salesByUser: { userId: string; userName: string; amount: number; count: number }[];
  salesByPaymentMethod: { method: string; amount: number; count: number }[];
  orders: string[];
  expenses: string[];
  status: 'open' | 'closed';
}