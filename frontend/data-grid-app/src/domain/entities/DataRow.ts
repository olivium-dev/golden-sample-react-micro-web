/**
 * Domain Entity: DataRow
 * Pure business model independent of frameworks
 */

export interface DataRow {
  id: number;
  name: string;
  category: string;
  value: number;
  status: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDataRowInput {
  name: string;
  category: string;
  value: number;
  status: string;
  description?: string;
}

export interface UpdateDataRowInput {
  name?: string;
  category?: string;
  value?: number;
  status?: string;
  description?: string;
}

