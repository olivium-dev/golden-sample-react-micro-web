// UOM (Unit of Measure) types
export interface UOM {
  id?: string;
  code: string;
  name: string;
  baseQuantity: number;
}

export interface CreateUOMRequest {
  code: string;
  name: string;
  baseQuantity: number;
}

export interface UpdateUOMRequest {
  code: string;
  name: string;
  baseQuantity: number;
}

export interface CreateUOMResponse {
  id: string;
  code: string;
  name: string;
  baseQuantity: number;
}

// Inventory Stock types
export interface InventoryStockRequest {
  locationId: string;
  itemId: string;
  uomCode: string;
  quantity: number;
}

// Stock API interfaces
export interface StockLevelRequest {
  itemIds: string[];
  includeReserved: boolean;
}

export interface StockByUom {
  uomId: string;
  uomCode: string;
  uomName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface StockLevelApiItem {
  itemId: string;
  locationId: string;
  uomCode: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastUpdated: string;
  stockByUoms?: StockByUom[];
}

export type StockLevelsApiResponse = StockLevelApiItem[];

// API Error response
export interface ApiErrorResponse {
  detail?: string;
  title?: string;
  message?: string;
  success?: boolean;
  errorDetails?: string;
}
