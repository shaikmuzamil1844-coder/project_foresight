import axios from 'axios';
import {
  DashboardSummary,
  SalesTrendItem,
  CategoryDemandItem,
  ForecastResponse,
  RiskItem,
  AIQueryResponse,
  Product,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export const api = {
  getProducts: async (): Promise<Product[]> => {
    const res = await axios.get(`${API_BASE_URL}/products`);
    return res.data;
  },

  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const res = await axios.get(`${API_BASE_URL}/dashboard/summary`);
    return res.data;
  },

  getSalesTrend: async (): Promise<SalesTrendItem[]> => {
    const res = await axios.get(`${API_BASE_URL}/dashboard/charts/sales-trend`);
    return res.data;
  },

  getCategoryDemand: async (): Promise<CategoryDemandItem[]> => {
    const res = await axios.get(`${API_BASE_URL}/dashboard/charts/category-demand`);
    return res.data;
  },

  getSKUForecast: async (skuId: string, days: number = 30): Promise<ForecastResponse> => {
    const res = await axios.get(`${API_BASE_URL}/forecast/${skuId}?days=${days}`);
    return res.data;
  },

  getRiskMatrix: async (): Promise<RiskItem[]> => {
    const res = await axios.get(`${API_BASE_URL}/inventory/risk-matrix`);
    return res.data;
  },

  getRecommendations: async (): Promise<RiskItem[]> => {
    const res = await axios.get(`${API_BASE_URL}/inventory/recommendations`);
    return res.data;
  },

  uploadCSV: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE_URL}/upload/csv`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  seedSampleData: async () => {
    const res = await axios.post(`${API_BASE_URL}/upload/seed`);
    return res.data;
  },

  askAI: async (prompt: string): Promise<AIQueryResponse> => {
    const res = await axios.post(`${API_BASE_URL}/assistant/query`, { prompt });
    return res.data;
  },
};
