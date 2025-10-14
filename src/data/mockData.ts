import { DashboardStats, Product, Order, Table, Customer, Category } from '../types';

export const mockCategories: Category[] = [
  { id: '1', name: 'Entrées', description: 'Apéritifs et entrées', icon: 'utensils', isActive: true },
  { id: '2', name: 'Plats', description: 'Plats principaux', icon: 'chef-hat', isActive: true },
  { id: '3', name: 'Desserts', description: 'Desserts et douceurs', icon: 'cake', isActive: true },
  { id: '4', name: 'Boissons', description: 'Boissons non alcoolisées', icon: 'glass-water', isActive: true },
  { id: '5', name: 'Alcools', description: 'Boissons alcoolisées', icon: 'wine', isActive: true },
];

export const mockProducts: Product[] = [];

export const mockOrders: Order[] = [];

export const mockTables: Table[] = [
  { id: '1', number: 1, capacity: 4, section: 'Main', status: 'available' },
  { id: '2', number: 2, capacity: 2, section: 'Main', status: 'available' },
  { id: '3', number: 3, capacity: 6, section: 'Main', status: 'available' },
  { id: '4', number: 4, capacity: 4, section: 'Terrace', status: 'available' },
  { id: '5', number: 5, capacity: 8, section: 'Private', status: 'available' },
  { id: '6', number: 6, capacity: 4, section: 'Main', status: 'available' },
  { id: '7', number: 7, capacity: 2, section: 'Main', status: 'available' },
  { id: '8', number: 8, capacity: 6, section: 'Terrace', status: 'available' },
  { id: '9', number: 9, capacity: 4, section: 'Terrace', status: 'available' },
  { id: '10', number: 10, capacity: 2, section: 'Terrace', status: 'available' },
  { id: '11', number: 11, capacity: 8, section: 'Private', status: 'available' },
  { id: '12', number: 12, capacity: 6, section: 'Private', status: 'available' },
  { id: '13', number: 13, capacity: 4, section: 'Main', status: 'available' },
  { id: '14', number: 14, capacity: 2, section: 'Main', status: 'available' },
  { id: '15', number: 15, capacity: 4, section: 'Main', status: 'available' },
  { id: '16', number: 16, capacity: 6, section: 'Terrace', status: 'available' },
  { id: '17', number: 17, capacity: 4, section: 'Terrace', status: 'available' },
  { id: '18', number: 18, capacity: 2, section: 'Terrace', status: 'available' },
  { id: '19', number: 19, capacity: 8, section: 'Private', status: 'available' },
  { id: '20', number: 20, capacity: 10, section: 'Private', status: 'available' },
];

export const mockCustomers: Customer[] = [];

export const mockDashboardStats: DashboardStats = {
  todaysSales: 0,
  todaysOrders: 0,
  activeOrders: 0,
  availableTables: 20,
  popularProducts: [],
  recentOrders: [],
};