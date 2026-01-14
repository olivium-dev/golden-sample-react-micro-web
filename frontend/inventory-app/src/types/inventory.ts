// UOM (Unit of Measure) types
export interface UOM {
  id?: string;
  code: string;
  name: string;
  description?: string;
}

export interface CreateUOMRequest {
  code: string;
  name: string;
}

export interface CreateUOMResponse {
  id: string;
  code: string;
  name: string;
}

// Inventory Stock types
export interface InventoryStockRequest {
  locationId: string;
  itemId: string;
  uomCode: string;
  quantity: number;
  clientRef: string;
  reason: string;
}

// API Error response
export interface ApiErrorResponse {
  detail?: string;
  title?: string;
  message?: string;
}
