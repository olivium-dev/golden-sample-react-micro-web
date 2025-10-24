/**
 * Repository Interface
 * Defines contract for data access without implementation details
 */

import { DataRow, CreateDataRowInput, UpdateDataRowInput } from '../entities/DataRow';

export interface IDataRepository {
  getAll(filters?: DataFilters): Promise<DataRow[]>;
  getById(id: number): Promise<DataRow>;
  create(data: CreateDataRowInput): Promise<DataRow>;
  update(id: number, data: UpdateDataRowInput): Promise<DataRow>;
  delete(id: number): Promise<void>;
}

export interface DataFilters {
  category?: string;
  status?: string;
  skip?: number;
  limit?: number;
}





