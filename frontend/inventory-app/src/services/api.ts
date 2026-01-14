import axios, { AxiosError } from 'axios';
import { UOM, CreateUOMRequest, CreateUOMResponse, ApiErrorResponse } from '../types/inventory';

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

  delete: async (code: string): Promise<void> => {
    try {
      await inventoryApiClient.delete(`/uoms/${code}`);
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Error deleting UOM:', axiosError.message);
      throw error;
    }
  },
};

export default inventoryApiClient;
