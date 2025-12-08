import { apiClient } from './apiClient';
import { API_CONFIG } from '../config/api';
import {
  Shipment,
  ShipmentDetail,
  CreateShipmentRequest,
  QuoteRequest,
  QuoteResponse,
  AdvanceShipmentRequest,
  TransitionResult,
  WebhookSubscription,
  CreateWebhookRequest,
  Workflow,
  CreateWorkflowRequest,
  HealthResponse,
  ErrorResponse,
  Parcelet,
  STAGE_STATUS_MAP,
  STATUS_STAGE_MAP,
  ADVANCEMENT_EVENTS
} from '../types/delivery';

class DeliveryGatewayClient {
  private baseURL: string;

  constructor(baseURL: string = API_CONFIG.DELIVERY_GATEWAY_URL) {
    this.baseURL = baseURL;
  }

  // Health check
  async healthCheck(): Promise<HealthResponse> {
    try {
      const response = await apiClient.get(`${this.baseURL.replace('/api/v1', '')}/health`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Shipment management
  async getShipments(params?: {
    orderId?: string;
    stage?: string;
    limit?: number;
  }): Promise<{ shipments: ShipmentDetail[]; count: number }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.orderId) queryParams.append('orderId', params.orderId);
      if (params?.stage) queryParams.append('stage', params.stage);
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await apiClient.get(`${this.baseURL}/shipments?${queryParams}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getShipmentById(id: string): Promise<ShipmentDetail> {
    try {
      const response = await apiClient.get(`${this.baseURL}/shipments/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createShipment(request: CreateShipmentRequest): Promise<Shipment> {
    try {
      const response = await apiClient.post(`${this.baseURL}/shipments`, request);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async advanceShipment(id: string, request: AdvanceShipmentRequest): Promise<TransitionResult> {
    try {
      const response = await apiClient.post(`${this.baseURL}/shipments/${id}/advance`, request);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Quote management
  async getQuotes(request: QuoteRequest): Promise<QuoteResponse> {
    try {
      const response = await apiClient.post(`${this.baseURL}/quotes`, request);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Webhook management
  async getWebhooks(): Promise<{ subscribers: WebhookSubscription[]; count: number }> {
    try {
      const response = await apiClient.get(`${this.baseURL}/webhooks`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createWebhook(request: CreateWebhookRequest): Promise<WebhookSubscription> {
    try {
      const response = await apiClient.post(`${this.baseURL}/webhooks`, request);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async replayWebhooks(subscriberId: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(`${this.baseURL}/webhooks/${subscriberId}/replay`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Workflow management
  async getWorkflows(): Promise<{ workflows: Workflow[]; count: number }> {
    try {
      const response = await apiClient.get(`${this.baseURL}/workflows`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getWorkflowById(id: string): Promise<Workflow> {
    try {
      const response = await apiClient.get(`${this.baseURL}/workflows/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createWorkflow(request: CreateWorkflowRequest): Promise<Workflow> {
    try {
      const response = await apiClient.post(`${this.baseURL}/workflows`, request);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Rules management
  async getRules(): Promise<Record<string, any>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/rules`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createRuleSet(request: Record<string, any>): Promise<Record<string, any>> {
    try {
      const response = await apiClient.post(`${this.baseURL}/rules`, request);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Bootstrap configuration
  async bootstrap(request: Record<string, any>): Promise<Record<string, string>> {
    try {
      const response = await apiClient.post(`${this.baseURL}/bootstrap`, request);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Admin endpoints
  async getOutboxStats(): Promise<Record<string, any>> {
    try {
      const response = await apiClient.get(`${this.baseURL}/admin/outbox`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getAllSubscribers(): Promise<{ subscribers: WebhookSubscription[]; count: number }> {
    try {
      const response = await apiClient.get(`${this.baseURL}/admin/subscribers`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get parcelets from gateway API only
  async getParcelets(): Promise<Parcelet[]> {
    const shipmentsResponse = await this.getShipments({ limit: 100 });
    return shipmentsResponse.shipments.map(this.shipmentToParcelet);
  }

  async advanceParcelet(id: number): Promise<Parcelet> {
    // Find the shipment by converting the legacy ID
    const shipments = await this.getShipments();
    const shipment = shipments.shipments.find(s =>
      parseInt(s.id.replace(/\D/g, '')) === id || s.orderId === `order_${id}`
    );

    if (!shipment) {
      throw new Error(`Shipment with legacy ID ${id} not found`);
    }

    // Determine advancement based on current stage (3-stage workflow)
    let advanceRequest: AdvanceShipmentRequest;

    switch (shipment.currentStage) {
      case 'CREATED':
        advanceRequest = ADVANCEMENT_EVENTS.CREATED_TO_READY_FOR_PICKUP;
        break;
      case 'READY_FOR_PICKUP':
        advanceRequest = {
          ...ADVANCEMENT_EVENTS.READY_FOR_PICKUP_TO_DELIVERED,
          payload: {
            signature: 'Customer Name',
            delivery_time: new Date().toISOString()
          }
        };
        break;
      case 'DELIVERED':
        throw new Error('Parcelet is already delivered');
      default:
        throw new Error(`Cannot advance from stage: ${shipment.currentStage}`);
    }

    // Advance the shipment
    await this.advanceShipment(shipment.id, advanceRequest);

    // Get updated shipment
    const updatedShipment = await this.getShipmentById(shipment.id);
    return this.shipmentToParcelet(updatedShipment);
  }

  async resetParcelets(): Promise<Parcelet[]> {
    // Gateway doesn't have a reset endpoint, just return current parcelets
    return this.getParcelets();
  }

  // Helper method to convert Shipment to legacy Parcelet format
  private shipmentToParcelet(shipment: ShipmentDetail): Parcelet {
    const status = STAGE_STATUS_MAP[shipment.currentStage] || 'pending';
    const legacyId = parseInt(shipment.id.replace(/\D/g, '')) || parseInt(shipment.orderId.replace(/\D/g, '')) || 1;

    // Handle both old flat metadata and new nested additionalProp1 structure
    const metadata = shipment.metadata?.additionalProp1 || shipment.metadata || {};

    return {
      id: legacyId,
      order_id: parseInt(shipment.orderId.replace(/\D/g, '')) || legacyId,
      customer_name: metadata?.customerName || 'Unknown Customer',
      customer_email: metadata?.customerEmail || 'unknown@example.com',
      product_name: metadata?.productName || 'Unknown Product',
      quantity: metadata?.quantity || 1,
      shipping_address: metadata?.shippingAddress || 'Unknown Address',
      tracking_number: shipment.carrierTrackingId || shipment.id,
      status: status as 'pending' | 'ready_for_pickup' | 'delivered',
      notes: shipment.history?.[shipment.history.length - 1]?.reason || 'No notes available',
      created_at: shipment.createdAt,
      updated_at: shipment.updatedAt
    };
  }

  // Helper method to create a shipment from legacy parcelet data
  async createShipmentFromParcelet(parcelet: Partial<Parcelet>): Promise<Shipment> {
    const createRequest: CreateShipmentRequest = {
      orderId: `order_${parcelet.order_id || Date.now()}`,
      address: {
        name: parcelet.customer_name || 'Unknown Customer',
        street: parcelet.shipping_address || 'Unknown Address',
        city: 'Unknown City',
        postalCode: '00000',
        country: 'US',
        email: parcelet.customer_email
      },
      selection: {
        carrier: 'PostNL',
        service: 'standard'
      },
      workflow: {
        name: 'default_eu',
        version: 1
      },
      tenantId: 'default',
      metadata: {
        additionalProp1: {
          customerName: parcelet.customer_name,
          customerEmail: parcelet.customer_email,
          productName: parcelet.product_name,
          quantity: parcelet.quantity,
          shippingAddress: parcelet.shipping_address,
          legacyId: parcelet.id
        }
      }
    };

    return this.createShipment(createRequest);
  }

  private handleError(error: any): Error {
    if (error.response?.data) {
      const errorData = error.response.data as ErrorResponse;
      return new Error(`${errorData.error}: ${errorData.details}`);
    }
    return error instanceof Error ? error : new Error('Unknown error occurred');
  }
}

// Export singleton instance
export const deliveryGatewayClient = new DeliveryGatewayClient();

// Export class for testing
export { DeliveryGatewayClient };
