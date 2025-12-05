// Types based on delivery-gate.json API specification

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  email?: string;
  phone?: string;
}

export interface Destination {
  city: string;
  country: string;
  postalCode: string;
  region?: string;
}

export interface Item {
  sku: string;
  qty: number;
  weightKg: number;
  volumeDm3: number;
  category?: string;
  value?: number;
}

export interface Customer {
  id?: string;
  segment?: string;
  tier?: string;
}

export interface CarrierSelection {
  carrier: string;
  service: string;
}

export interface WorkflowSelection {
  name: string;
  version: number;
}

export interface SLATimer {
  id: string;
  stage: string;
  status: string;
  dueAt: string;
}

export interface ShipmentHistory {
  id: string;
  fromStage?: string;
  toStage: string;
  at: string;
  actor: string;
  reason: string;
  payload?: Record<string, any>;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrierName: string;
  carrierTrackingId?: string;
  currentStage: string;
  stageEnteredAt: string;
  createdAt: string;
  updatedAt: string;
  tenantId?: string;
  workflowId: string;
  workflowVersion: number;
  metadata?: Record<string, any>;
  history?: ShipmentHistory[];
  slaTimers?: SLATimer[];
}

export interface ShipmentDetail extends Shipment {
  history: ShipmentHistory[];
  slaTimers: SLATimer[];
}

export interface CreateShipmentRequest {
  orderId: string;
  address: ShippingAddress;
  selection: CarrierSelection;
  workflow: WorkflowSelection;
  tenantId?: string;
  metadata?: Record<string, any>;
}

export interface QuoteRequest {
  cartId: string;
  dest: Destination;
  items: Item[];
  customer?: Customer;
  preferences?: Record<string, any>;
}

export interface RuleExplanation {
  ruleId: string;
  matched: boolean;
  contribution: number;
  description: string;
}

export interface ScoredOption {
  carrier: string;
  service: string;
  price: number;
  eta: string;
  score: number;
  explain?: RuleExplanation[];
  metadata?: Record<string, any>;
}

export interface QuoteResponse {
  options: ScoredOption[];
}

export interface AdvanceShipmentRequest {
  event: string;
  reason: string;
  payload?: Record<string, any>;
}

export interface TransitionResult {
  success: boolean;
  fromStage: string;
  toStage: string;
  message?: string;
  actions?: string[];
  nextTimeout?: string;
  metadata?: Record<string, any>;
}

export interface WebhookSubscription {
  id: string;
  url: string;
  topics: string[];
  status: string;
  createdAt: string;
}

export interface CreateWebhookRequest {
  url: string;
  topics: string[];
  secret?: string;
  headers?: Record<string, string>;
  retryPolicy?: {
    maxAttempts: number;
    schedule: string[];
  };
}

export interface WorkflowStage {
  id: string;
  allowedTransitions?: string[];
  enterActions?: string[];
  exitActions?: string[];
  guards?: string[];
  terminal?: boolean;
  timeout?: string;
  onTimeout?: string;
}

export interface Workflow {
  id: string;
  name: string;
  version: number;
  isActive: boolean;
  createdAt: string;
  stages?: WorkflowStage[];
  policies?: Record<string, any>;
}

export interface CreateWorkflowRequest {
  name: string;
  version: number;
  stages: WorkflowStage[];
  policies?: Record<string, any>;
}

export interface ErrorResponse {
  error: string;
  details: string;
  status: number;
}

export interface HealthResponse {
  status: string;
  time: string;
}

// Legacy interface updated for 3-stage workflow
export interface Parcelet {
  id: number;
  order_id: number;
  customer_name: string;
  customer_email: string;
  product_name: string;
  quantity: number;
  shipping_address: string;
  tracking_number: string;
  status: 'pending' | 'ready_for_pickup' | 'delivered';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Mapping between workflow stages and UI status (3-stage workflow)
export const STAGE_STATUS_MAP: Record<string, 'pending' | 'ready_for_pickup' | 'delivered'> = {
  'CREATED': 'pending',
  'READY_FOR_PICKUP': 'ready_for_pickup',
  'DELIVERED': 'delivered',
  // Fallback mappings for other possible stages
  'PENDING': 'pending',
  'PROCESSING': 'pending',
  'IN_TRANSIT': 'ready_for_pickup',
  'OUT_FOR_DELIVERY': 'ready_for_pickup',
  'COMPLETED': 'delivered',
  'EXCEPTION': 'pending',
  'CANCELLED': 'pending'
};

// Reverse mapping for advancement
export const STATUS_STAGE_MAP: Record<'pending' | 'ready_for_pickup' | 'delivered', string> = {
  'pending': 'CREATED',
  'ready_for_pickup': 'READY_FOR_PICKUP',
  'delivered': 'DELIVERED'
};

// Workflow advancement events
export const ADVANCEMENT_EVENTS: Record<string, { event: string; reason: string; payload?: Record<string, any> }> = {
  'CREATED_TO_READY_FOR_PICKUP': {
    event: 'ready_for_pickup',
    reason: 'Package ready for pickup',
    payload: {}
  },
  'READY_FOR_PICKUP_TO_DELIVERED': {
    event: 'delivered',
    reason: 'Package delivered to recipient',
    payload: {
      signature: 'Customer Name',
      delivery_time: new Date().toISOString()
    }
  }
};



