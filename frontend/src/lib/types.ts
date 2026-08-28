export interface Product {
  id: number;
  sku_id: string;
  product_name: string;
  category: string;
  price: number;
  supplier: string;
  lead_time: number;
  min_safety_stock: number;
}

export interface DashboardSummary {
  total_skus: number;
  total_inventory: number;
  total_sales_volume_30d: number;
  total_revenue_30d: number;
  high_risk_skus_count: number;
  medium_risk_skus_count: number;
  low_risk_skus_count: number;
  overstock_skus_count: number;
  recommended_purchase_value: number;
}

export interface SalesTrendItem {
  date: string;
  units_sold: number;
  revenue: number;
}

export interface CategoryDemandItem {
  category: string;
  units_sold: number;
  revenue: number;
}

export interface ForecastItem {
  date: string;
  actual_demand: number | null;
  predicted_demand: number;
  lower_bound: number;
  upper_bound: number;
}

export interface ForecastResponse {
  sku_id: string;
  product_name: string;
  category: string;
  forecast_days: number;
  mae: number;
  rmse: number;
  mape: number;
  predicted_total_demand: number;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'OVERSTOCK';
  recommended_order_quantity: number;
  forecast: ForecastItem[];
}

export interface RiskItem {
  id: number;
  sku_id: string;
  product_name: string;
  category: string;
  price: number;
  current_stock: number;
  avg_daily_demand: number;
  lead_time_days: number;
  lead_time_demand: number;
  safety_stock: number;
  reorder_point: number;
  recommended_quantity: number;
  recommended_purchase_cost: number;
  risk_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'OVERSTOCK';
  days_to_stockout: number;
}

export interface AIQueryResponse {
  answer: string;
  summary_data?: Record<string, any>;
}
