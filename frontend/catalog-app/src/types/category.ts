export interface CategoryDetailsRequest {
  name: string | null;
  language: string | null;
}

export interface CategoryCmsResponse {
  guid: string;
  name: string | null;
  mediaGuid?: string | null;
  details?: CategoryDetailsRequest[] | null;
}


// CMS-specific response type (same as CategoryResponse but explicitly for CMS operations)
export interface GetCategoryForCmsResponse extends CategoryCmsResponse {
  // This extends CategoryResponse but is specifically for CMS operations
  // The API returns the same structure but this helps distinguish the endpoint usage
}

export interface CmsCreateCategoryRequest {
  details: CategoryDetailsRequest[] | null;
  mediaGuid?: string | null;
}

export interface CreateCategoryResponse {
  guid: string;
}

export interface CmsUpdateCategoryRequest {
  guid: string;
  details: CategoryDetailsRequest[] | null;
  mediaGuid?: string | null;
}

export interface UpdateCategoryResponse {
  guid: string;
}

export interface DeleteCategoryResponse {
  success: boolean;
}

export interface GetAllCategoriesResponse {
  totalCount: number;
  categories: CategoryCmsResponse[] | null;
}

export interface PaginationParams {
  pageSize: number;
  pageNumber: number;
}

export interface ProblemDetails {
  type: string | null;
  title: string | null;
  status: number | null;
  detail: string | null;
  instance: string | null;
}
