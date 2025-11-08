// CDN API Types based on the swagger specification

export interface FileUploadResponse {
  fileName: string | null;
}

export interface MediaType {
  name: string | null;
  resolution: string | null;
  aspectRatio: string | null;
  extensions: string[] | null;
  maxFileSize: string | null;
  videoLength: string | null;
  'img-lqip': string[] | null;
}

export interface ProblemDetails {
  type: string | null;
  title: string | null;
  status: number | null;
  detail: string | null;
  instance: string | null;
}

export interface ImageUploadRequest {
  file: File;
  mediaTypeName?: string;
}

export interface ImageFetchOptions {
  fileName: string;
  resolution?: string;
}

// Helper types for better type safety
export type ImageResolution = 'thumbnail' | 'small' | 'medium' | 'large' | 'original';

export interface ImageUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface ImageUploadResult {
  success: boolean;
  fileName?: string;
  error?: string;
  url?: string;
}
