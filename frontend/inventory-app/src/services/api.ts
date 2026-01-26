import axios, { AxiosError } from 'axios';
import { UOM, CreateUOMRequest, UpdateUOMRequest, CreateUOMResponse, ApiErrorResponse, StockLevelRequest, StockLevelsApiResponse } from '../types/inventory';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://dev-creamat.fds-1.com';
const INVENTORY_API_URL = `${API_BASE_URL}/gateway/api/Inventory`;

const inventoryApiClient = axios.create({
  baseURL: INVENTORY_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

inventoryApiClient.interceptors.request.use((config) => {
  if (config.headers) {
    config.headers['X-Service-Api-Key'] = 'inventory-service-api-key-2024-secure';
    config.headers['X-Service-Token-Key'] = 'inventory-service-token-key-jkl012';
  }
  return config;
});

export const uomApi = {
  getAll: async (): Promise<UOM[]> => {
    try {
      const response = await inventoryApiClient.get<UOM[]>('/uoms');
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      const responseObj = data as unknown as { data?: UOM[]; uoms?: UOM[] };
      return responseObj.data || responseObj.uoms || [];
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Error fetching UOMs:', axiosError.message);
      throw error;
    }
  },

  create: async (uom: CreateUOMRequest): Promise<CreateUOMResponse> => {
    try {
      const response = await inventoryApiClient.post<CreateUOMResponse>('/uoms', uom);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Error creating UOM:', axiosError.message);
      if (axiosError.response) {
        console.error('Response data:', axiosError.response.data);
        console.error('Response status:', axiosError.response.status);
      }
      throw error;
    }
  },

  update: async (id: string, uom: UpdateUOMRequest): Promise<CreateUOMResponse> => {
    try {
      const response = await inventoryApiClient.put<CreateUOMResponse>(`/uoms/${id}`, uom);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Error updating UOM:', axiosError.message);
      if (axiosError.response) {
        console.error('Response data:', axiosError.response.data);
        console.error('Response status:', axiosError.response.status);
      }
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await inventoryApiClient.delete(`/uoms/${id}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Error deleting UOM:', axiosError.message);
      throw error;
    }
  },
};

export const inventoryApi = {
  getStockLevels: async (itemIds: string[], includeReserved: boolean = true): Promise<StockLevelsApiResponse> => {
    try {
      const WAREHOUSE_ID = '00000000-0000-0000-0000-000000000001';
      const request: StockLevelRequest = {
        itemIds,
        includeReserved,
      };
      const response = await inventoryApiClient.post<StockLevelsApiResponse>(`/stock/${WAREHOUSE_ID}/levels`, request);
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Error fetching stock levels:', axiosError.message);
      throw error;
    }
  },
};

export default inventoryApiClient;
