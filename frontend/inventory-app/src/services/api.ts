import axios, { AxiosError } from 'axios';
import { UOM, CreateUOMRequest, CreateUOMResponse, ApiErrorResponse } from '../types/inventory';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://dev-creamat.fds-1.com';
const INVENTORY_API_URL = `${API_BASE_URL}/gateway/api/Inventory`;

// Create axios instance for Inventory API
const inventoryApiClient = axios.create({
  baseURL: INVENTORY_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Add service headers to all requests
inventoryApiClient.interceptors.request.use((config) => {
  if (config.headers) {
    config.headers['X-Service-Api-Key'] = 'inventory-service-api-key-2024-secure';
    config.headers['X-Service-Token-Key'] = 'inventory-service-token-key-jkl012';
  }
  return config;
});

// UOM API functions
export const uomApi = {
  // Get all UOMs
  getAll: async (): Promise<UOM[]> => {
    try {
      const response = await inventoryApiClient.get<UOM[]>('/uoms');
      // Handle different response formats
      const data = response.data;
      if (Array.isArray(data)) {
        return data;
      }
      // If response is wrapped in an object
      const responseObj = data as unknown as { data?: UOM[]; uoms?: UOM[] };
      return responseObj.data || responseObj.uoms || [];
    } catch (error) {
      const axiosError = error as AxiosError<ApiErrorResponse>;
      console.error('Error fetching UOMs:', axiosError.message);
      throw error;
    }
  },

  // Create a new UOM
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

  // Delete a UOM (if API supports it)
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

