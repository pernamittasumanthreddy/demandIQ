export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  designation: string;
  is_verified: boolean;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  industry_type: string;
  gstin: string;
  currency: string;
  currency_symbol: string;
  timezone: string;
  fiscal_year_start: number;
  user_role?: string;
  branches?: Branch[];
}

export interface Branch {
  id: string;
  business: string;
  name: string;
  code: string;
  is_main: boolean;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  is_active: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  product_count: number;
}

export interface Product {
  id: string;
  business: string;
  category: string;
  category_name?: string;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  brand: string;
  unit: string;
  cost_price: string | number;
  selling_price: string | number;
  tax_rate: string | number;
  current_stock: string | number;
  min_threshold: string | number;
  max_target: string | number;
  lead_time_days: number;
  moq: string | number;
  order_multiple: string | number;
  is_perishable: boolean;
  shelf_life_days: number;
  is_active: boolean;
  gross_margin_percent: number;
  stock_status: 'OPTIMAL' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCKED';
}

export interface InventoryBalance {
  id: string;
  product: string;
  product_name: string;
  product_sku: string;
  product_unit: string;
  cost_price: string | number;
  branch: string;
  branch_name: string;
  quantity: string | number;
  reserved_quantity: string | number;
  incoming_quantity: string | number;
  available_quantity: number;
  inventory_position: number;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  gstin: string;
  typical_lead_time_days: number;
  min_order_amount: string | number;
  payment_terms: string;
  rating: string | number;
  product_count: number;
}

export interface ReorderRecommendation {
  id: string;
  product: string;
  product_name: string;
  product_sku: string;
  product_unit: string;
  cost_price: string | number;
  preferred_supplier: string | null;
  supplier_name?: string;
  current_stock: string | number;
  inventory_position: string | number;
  avg_daily_demand: string | number;
  lead_time_days: number;
  safety_stock: string | number;
  reorder_point: string | number;
  suggested_quantity: string | number;
  estimated_cost: string | number;
  estimated_stockout_days: number;
  urgency: 'CRITICAL' | 'WARNING' | 'OPTIMAL';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CONVERTED';
  reason_notes: string;
}

export interface DeadStockAnalysis {
  id: string;
  product: string;
  product_name: string;
  product_sku: string;
  category_name?: string;
  cost_price: string | number;
  classification: 'HEALTHY' | 'SLOW_MOVING' | 'POTENTIAL_EXCESS' | 'DEAD_STOCK' | 'NEAR_EXPIRY';
  days_without_sale: number;
  units_in_stock: string | number;
  capital_at_risk: string | number;
  turnover_ratio: string | number;
  recommended_action: string;
}

export interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier: string;
  supplier_name: string;
  branch_name: string;
  order_date: string;
  expected_delivery_date: string;
  status: 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  status_display: string;
  subtotal: string | number;
  tax_amount: string | number;
  total_amount: string | number;
  item_count: number;
  items?: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  product: string;
  product_name: string;
  product_sku: string;
  product_unit: string;
  quantity_ordered: string | number;
  quantity_received: string | number;
  unit_cost: string | number;
  line_total: string | number;
}

export interface ForecastResultItem {
  date: string;
  predicted_demand: number;
  lower_bound: number;
  upper_bound: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  demand_growth_pct: string | number;
  lead_time_delta_days: number;
  price_change_pct: string | number;
  cost_change_pct: string | number;
  safety_buffer_days: number;
  procurement_budget_limit: string | number;
  projected_revenue: string | number;
  projected_margin_pct: string | number;
  required_cash: string | number;
  stockout_risk_count: number;
  potential_lost_sales: string | number;
  simulation_breakdown: any;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  link_url: string;
  is_read: boolean;
  created_at: string;
}
