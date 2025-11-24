import { ordersApiClient as apiClient } from './ordersApiClient';

// Types based on the Order Service API
export interface Order {
  orderId: string;
  userId: string;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingAddress?: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderStatus {
  status: string;
  displayName: string;
  description: string;
  availableActions: string[];
}

export interface OrderStatusesResponse {
  statuses: OrderStatus[];
  success: boolean;
  message?: string;
}

export interface OrderResponse {
  order: Order;
  success: boolean;
  message?: string;
}

export interface OrdersListResponse {
  orders: Order[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  success: boolean;
  message?: string;
}

export interface GetOrdersParams {
  page?: number;
  pageSize?: number;
  status?: string;
  userId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface AdvanceOrderStatusRequest {
  action?: string;
  tag?: string;
  notes?: string;
}

export interface AdvanceOrderStatusResponse {
  success: boolean;
  message?: string;
  newStatus?: string;
  order?: Order;
}

/**
 * Order API Service
 * Implements the order-related endpoints from the Order Service API
 */
export class OrderApiService {
  
  /**
   * Get all orders with pagination and optional filtering
   * GET /api/order
   */
  static async getOrders(params: GetOrdersParams = {}): Promise<OrdersListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.pageSize) queryParams.append('pageSize', params.pageSize.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.userId) queryParams.append('userId', params.userId);
      if (params.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params.toDate) queryParams.append('toDate', params.toDate);

      const url = queryParams.toString() ? `api/order?${queryParams.toString()}` : 'api/order';
      const response = await apiClient.get(url);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Get all available order statuses and actions
   * GET /api/order/statuses
   */
  static async getOrderStatuses(): Promise<OrderStatusesResponse> {
    try {
      const response = await apiClient.get('api/order/statuses');
      return response.data;
    } catch (error) {
      console.error('Error fetching order statuses:', error);
      throw error;
    }
  }

  /**
   * Get order by ID
   * GET /api/order/{orderId}
   */
  static async getOrderById(orderId: string): Promise<OrderResponse> {
    try {
      const response = await apiClient.get(`api/order/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Advance order status automatically to the next logical step
   * PUT /api/order/{orderId}/advance
   */
  static async advanceOrderStatus(
    orderId: string, 
    request: AdvanceOrderStatusRequest = {}
  ): Promise<AdvanceOrderStatusResponse> {
    try {
      const response = await apiClient.put(`api/order/${orderId}/advance`, request);
      return response.data;
    } catch (error) {
      console.error(`Error advancing order status for ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Get all orders for a specific user
   * Convenience method that filters orders by userId
   */
  static async getUserOrders(userId: string, params: Omit<GetOrdersParams, 'userId'> = {}): Promise<OrdersListResponse> {
    return this.getOrders({ ...params, userId });
  }

  /**
   * Get orders by status
   * Convenience method that filters orders by status
   */
  static async getOrdersByStatus(status: string, params: Omit<GetOrdersParams, 'status'> = {}): Promise<OrdersListResponse> {
    return this.getOrders({ ...params, status });
  }

  /**
   * Get orders within date range
   * Convenience method for date-based filtering
   */
  static async getOrdersByDateRange(
    fromDate: string, 
    toDate: string, 
    params: Omit<GetOrdersParams, 'fromDate' | 'toDate'> = {}
  ): Promise<OrdersListResponse> {
    return this.getOrders({ ...params, fromDate, toDate });
  }
}

// Export individual functions for easier importing
export const {
  getOrders,
  getOrderStatuses,
  getOrderById,
  advanceOrderStatus,
  getUserOrders,
  getOrdersByStatus,
  getOrdersByDateRange
} = OrderApiService;

// Default export
export default OrderApiService;
