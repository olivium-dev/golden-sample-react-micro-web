export interface ActionButtonConfig {
  id: string;
  label: string;
  icon: string;
  color: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  enabled: boolean;
  type: string;
}

export interface ActionButtonsConfig {
  actionButtons: ActionButtonConfig[];
}

export interface InventoryStockRequest {
  locationId: string;
  itemId: string;
  uomCode: string;
  quantity: number;
  clientRef: string;
  reason: string;
}

