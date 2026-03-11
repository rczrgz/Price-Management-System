import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Customer {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  cost_price: number;
  default_selling_price: number;
  category: string;
  notes: string;
}

export interface CustomerPrice {
  id: number;
  customer_id: number;
  product_id: number;
  custom_price: number;
  product_name?: string;
  product_sku?: string;
  default_selling_price?: number;
}

export interface Transaction {
  id: number;
  customer_id: number;
  product_id: number;
  quantity: number;
  selling_price: number;
  cost_price_at_time: number;
  profit: number;
  date: string;
  customer_name?: string;
  product_name?: string;
}

export interface DashboardStats {
  totalSales: number;
  totalProfit: number;
  customerCount: number;
  productCount: number;
  topCustomers: { name: string; profit: number }[];
  topProducts: { name: string; profit: number }[];
  profitOverTime: { day: string; profit: number }[];
}
