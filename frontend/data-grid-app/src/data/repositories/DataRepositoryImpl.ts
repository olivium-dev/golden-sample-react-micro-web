/**
 * Data Repository Implementation
 * Concrete implementation of IDataRepository using API
 */

import { IDataRepository, DataFilters } from '../../domain/repositories/IDataRepository';
import { DataRow, CreateDataRowInput, UpdateDataRowInput } from '../../domain/entities/DataRow';
import { dataClient } from '../api/dataClient';
import { mapDTOToEntity, DataRowDTO } from '../mappers/dataMapper';

export class DataRepositoryImpl implements IDataRepository {
  async getAll(filters?: DataFilters): Promise<DataRow[]> {
    const params: any = {};
    if (filters?.category) params.category = filters.category;
    if (filters?.status) params.status = filters.status;
    if (filters?.skip !== undefined) params.skip = filters.skip;
    if (filters?.limit !== undefined) params.limit = filters.limit;

    const response = await dataClient.get<DataRowDTO[]>('/data', { params });
    return response.data.map(mapDTOToEntity);
  }

  async getById(id: number): Promise<DataRow> {
    const response = await dataClient.get<DataRowDTO>(`/data/${id}`);
    return mapDTOToEntity(response.data);
  }

  async create(data: CreateDataRowInput): Promise<DataRow> {
    const response = await dataClient.post<DataRowDTO>('/data', {
      name: data.name,
      category: data.category,
      value: data.value,
      status: data.status,
      description: data.description,
    });
    return mapDTOToEntity(response.data);
  }

  async update(id: number, data: UpdateDataRowInput): Promise<DataRow> {
    const response = await dataClient.put<DataRowDTO>(`/data/${id}`, {
      name: data.name,
      category: data.category,
      value: data.value,
      status: data.status,
      description: data.description,
    });
    return mapDTOToEntity(response.data);
  }

  async delete(id: number): Promise<void> {
    await dataClient.delete(`/data/${id}`);
  }
}

