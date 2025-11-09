import axios, { InternalAxiosRequestConfig } from 'axios';
import { 
  CategoryCmsResponse,
  CmsCreateCategoryRequest, 
  CreateCategoryResponse,
  CmsUpdateCategoryRequest, 
  UpdateCategoryResponse,
  DeleteCategoryResponse,
  GetAllCategoriesResponse,
  GetCategoryForCmsResponse
} from '../types/category';
import {
  ItemResponse,
  CreateItemRequest,
  CreateItemResponse,
  UpdateItemRequest,
  UpdateItemResponse,
  DeleteItemResponse,
  SearchItemsRequest,
  SearchItemsResponse,
  GetItemRequest,
  ItemTagsRequest,
  ItemTagsResponse,
  GetAllTagsResponse,
  GetAllTagNamesResponse,
  GetItemForCmsResponse
} from '../types/item';
import {
  FileUploadResponse,
  MediaType,
  ImageUploadRequest,
  ImageFetchOptions,
  ImageUploadResult,
  ImageUploadProgress
} from '../types/cdn';

// Import API configuration
import { CATALOG_API_URL, CDN_API_URL, API_TIMEOUT } from '../config/apiConfig';

// Create axios instance with default config for catalog API
const apiClient = axios.create({
  baseURL: CATALOG_API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  // For browser environments, we can't use Node.js https module
  // We'll handle SSL certificate validation through the browser
});

// Create separate axios instance for CDN API
const cdnApiClient = axios.create({
  baseURL: CDN_API_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests for both API clients
const addAuthToken = (config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

apiClient.interceptors.request.use(addAuthToken);
cdnApiClient.interceptors.request.use(addAuthToken);

// Category API functions
export const categoryApi = {
  // Get all categories with pagination
  getCategories: async (pageSize: number, pageNumber: number): Promise<GetAllCategoriesResponse> => {
    const response = await apiClient.get(`/Category/All/${pageSize}/${pageNumber}`);
    return response.data;
  },

  // Get a single category by ID
  getCategory: async (guid: string): Promise<CategoryCmsResponse> => {
    const response = await apiClient.get(`/Category/${guid}`);
    return response.data;
  },

  // Get a single category by ID for CMS operations (includes full details)
  getCategoryForCms: async (guid: string): Promise<GetCategoryForCmsResponse> => {
    try {
      console.log('Fetching category for CMS with guid:', guid);
      const response = await apiClient.get(`/Category/cms/${guid}`);
      console.log('CMS category response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching category for CMS:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  },

  // Create a new category
  createCategory: async (category: CmsCreateCategoryRequest): Promise<CreateCategoryResponse> => {
    try {
      console.log('Creating category with data:', JSON.stringify(category));
      // Use the full endpoint path with leading slash
      const endpoint = '/Category/Cms';
      const response = await apiClient.post(endpoint, category);
      console.log('Create category response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Error creating category:', error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  },

  // Update an existing category
  updateCategory: async (category: CmsUpdateCategoryRequest): Promise<UpdateCategoryResponse> => {
    const response = await apiClient.put('/Category/Cms', category);
    return response.data;
  },

  // Delete a category
  deleteCategory: async (guid: string): Promise<DeleteCategoryResponse> => {
    const response = await apiClient.delete(`/Category/${guid}`);
    return response.data;
  },
};

// Item API functions
export const itemApi = {
  // Create a new item
  createItem: async (item: CreateItemRequest): Promise<CreateItemResponse> => {
    try {
      console.log('Creating item with data:', JSON.stringify(item));
      const response = await apiClient.post('/ItemExtended', item);
      console.log('Create item response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Error creating item:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  },

  // Update an existing item
  updateItem: async (item: UpdateItemRequest): Promise<UpdateItemResponse> => {
    const response = await apiClient.put('/ItemExtended', item);
    return response.data;
  },

  // Get a single item by ID
  getItem: async (guid: string): Promise<ItemResponse> => {
    const response = await apiClient.get(`/Item/${guid}`);
    return response.data;
  },

    // Get a single cms item by ID
    getItemForCms: async (guid: string): Promise<GetItemForCmsResponse> => {
      const response = await apiClient.get(`/ItemExtended/cms/${guid}`);
      return response.data;
    },

  // Delete an item
  deleteItem: async (guid: string): Promise<DeleteItemResponse> => {
    const response = await apiClient.delete(`/Item/${guid}`);
    return response.data;
  },

  // Search items with pagination and filters
  searchItems: async (searchRequest: SearchItemsRequest): Promise<SearchItemsResponse> => {
    const response = await apiClient.post('/Item/Search', searchRequest);
    return response.data;
  },

  // Get bulk items
  getBulkItems: async (requests: GetItemRequest[]): Promise<ItemResponse[]> => {
    const response = await apiClient.post('/Item/Bulk', requests);
    return response.data;
  },

  // Add tags to item
  addItemTags: async (request: ItemTagsRequest): Promise<ItemTagsResponse> => {
    const response = await apiClient.post('/Item/Tag/Add', request);
    return response.data;
  },

  // Remove tags from item
  removeItemTags: async (request: ItemTagsRequest): Promise<ItemTagsResponse> => {
    const response = await apiClient.post('/Item/Tag/Remove', request);
    return response.data;
  },
};

// Tag API functions
export const tagApi = {
  // Get all tags
  getAllTags: async (): Promise<GetAllTagsResponse> => {
    const response = await apiClient.get('/Tag/All');
    return response.data;
  },

  // Get all tag names
  getAllTagNames: async (): Promise<GetAllTagNamesResponse> => {
    const response = await apiClient.get('/Tag/All/Names');
    return response.data;
  },
};

// CDN API functions
export const cdnApi = {
  // Upload an image file
  uploadImage: async (
    file: File, 
    mediaTypeName?: string,
    onProgress?: (progress: ImageUploadProgress) => void
  ): Promise<ImageUploadResult> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Ensure mediaTypeName is provided (required by API)
      const finalMediaTypeName = mediaTypeName || 'default';

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: { mediaTypeName: finalMediaTypeName },
        onUploadProgress: (progressEvent: any) => {
          if (onProgress && progressEvent.total) {
            const progress: ImageUploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
            };
            onProgress(progress);
          }
        },
      };

      const response = await cdnApiClient.post<FileUploadResponse>(
        '/api/ImageUpload/upload',
        formData,
        config
      );

      return {
        success: true,
        fileName: response.data.fileName || undefined,
        url: response.data.fileName ? cdnApi.getImageUrl(response.data.fileName) : undefined,
      };
    } catch (error: any) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: error.response?.data?.detail || error.message || 'Upload failed',
      };
    }
  },

  // Fetch an image by filename
  fetchImage: async (fileName: string, resolution?: string): Promise<Blob> => {
    const endpoint = resolution 
      ? `/api/ImageUpload/fetch/${fileName}/res/${resolution}`
      : `/api/ImageUpload/fetch/${fileName}`;
    
    const response = await cdnApiClient.get(endpoint, {
      responseType: 'blob',
    });
    
    return response.data;
  },

  // Get image URL for display
  getImageUrl: (fileName: string, resolution?: string): string => {
    const endpoint = resolution 
      ? `/api/ImageUpload/fetch/${fileName}/res/${resolution}`
      : `/api/ImageUpload/fetch/${fileName}`;
    
    return `${CDN_API_URL}${endpoint}`;
  },

  // Delete an image
  deleteImage: async (fileName: string): Promise<boolean> => {
    try {
      await cdnApiClient.delete(`/api/ImageUpload/delete/${fileName}`);
      return true;
    } catch (error: any) {
      console.error('Error deleting image:', error);
      return false;
    }
  },

  // Get available media types
  getMediaTypes: async (): Promise<MediaType[]> => {
    const response = await cdnApiClient.get<MediaType[]>('/api/ImageUpload/mediaTypes');
    return response.data;
  },

  // Generate LQIP (Low Quality Image Placeholder)
  generateLqip: async (id: string): Promise<void> => {
    await cdnApiClient.get(`/api/ImageUpload/generate-lqip/${id}`);
  },

  // Get diagnostic configuration
  getDiagnosticConfig: async (): Promise<any> => {
    const response = await cdnApiClient.get('/api/ImageUpload/diagnose-config');
    return response.data;
  },
};

export default apiClient;
