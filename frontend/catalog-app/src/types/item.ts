export interface ItemDetailsRequest {
  name: string | null;
  description: string | null;
  language: string | null;
  additionalParams: { [key: string]: string | null } | null;
}

export interface ItemResponse {
  guid: string;
  parent: string | null;
  name: string | null;
  description: string | null;
  type: string | null;
  children: ItemResponse[] | null;
  tags: string[] | null;
  additionalParams: { [key: string]: string | null } | null;
  createdAt: string | null;
  categories: string[] | null;
}

export interface GetItemForCmsResponse {
  guid: string;
  parent: string | null;
  name: string | null;
  description: string | null;
  type: string | null;
  children: GetItemForCmsResponse[] | null;
  tags: string[] | null;
  additionalParams: { [key: string]: string | null } | null;
  createdAt: string | null;
  categories: string[] | null;
  details: ItemDetailsRequest[] | null;
  success: boolean | true;
}

export interface ItemDetailsForCms {
  name: string | null;
  description: string | null;
  language: string | null;
  additionalParams: { [key: string]: string | null } | null;
}

export interface CreateItemRequest {
  parent: string | null;
  tags: string[] | null;
  type: string | null;
  details: ItemDetailsRequest[] | null;
  additionalParams: { [key: string]: string | null } | null;
  categories: string[] | null;
}

export interface CreateItemResponse {
  guid: string;
}

export interface UpdateItemRequest {
  parent: string | null;
  tags: string[] | null;
  type: string | null;
  details: ItemDetailsRequest[] | null;
  additionalParams: { [key: string]: string | null } | null;
  categories: string[] | null;
  guid: string;
}

export interface UpdateItemResponse {
  guid: string;
}

export interface DeleteItemResponse {
  success: boolean;
}

export interface SearchItemsRequest {
  query: string | null;
  tags: string[] | null;
  type: string | null;
  pageSize: number;
  pageNumber: number;
  language: string | null;
  categories: string[] | null;
}

export interface SearchItemsResponse {
  totalCount: number;
  items: ItemResponse[] | null;
}

export interface GetItemRequest {
  guid: string;
  language: string | null;
}

export interface ItemTagsRequest {
  guid: string;
  tags: string[] | null;
}

export interface ItemTagsResponse {
  success: boolean;
}

export interface TagResponse {
  guid: string;
  name: string | null;
}

export interface GetAllTagsResponse {
  tags: TagResponse[] | null;
}

export interface GetAllTagNamesResponse {
  tags: string[] | null;
}

// Link Items API interfaces
export interface LinkItemsRequest {
  firstItemId: string;
  secondItemId: string;
}

export interface LinkItemsResponse {
  firstItemId: string;
  secondItemId: string;
  parentId: string;
  parentCreated: boolean;
  success: boolean;
}

// Unlink Item API interfaces
export interface UnlinkItemRequest {
  itemId: string;
}

export interface UnlinkItemResponse {
  itemId: string;
  success: boolean;
}

// Stock API interfaces
export interface StockLevelRequest {
  itemIds: string[];
  includeReserved: boolean;
}

// API response structure for a single stock item
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

export interface StockByUom {
  uomId: string;
  uomCode: string;
  uomName: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

// Simplified stock level for internal use
export interface StockLevel {
  itemId: string;
  availableQuantity: number;
  reservedQuantity: number;
  totalQuantity: number;
  stockByUoms?: StockByUom[];
}

// API returns an array directly
export type StockLevelsApiResponse = StockLevelApiItem[];