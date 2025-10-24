/**
 * Data Mapper
 * Maps between API DTOs and Domain Entities
 */

import { DataRow } from '../../domain/entities/DataRow';

// API DTO (Data Transfer Object)
export interface DataRowDTO {
  id: number;
  name: string;
  category: string;
  value: number;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Maps API DTO to Domain Entity
 */
export const mapDTOToEntity = (dto: DataRowDTO): DataRow => {
  return {
    id: dto.id,
    name: dto.name,
    category: dto.category,
    value: dto.value,
    status: dto.status,
    description: dto.description,
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
};

/**
 * Maps Domain Entity to API DTO
 */
export const mapEntityToDTO = (entity: Partial<DataRow>): Partial<DataRowDTO> => {
  const dto: Partial<DataRowDTO> = {
    name: entity.name,
    category: entity.category,
    value: entity.value,
    status: entity.status,
    description: entity.description,
  };

  // Only include createdAt/updatedAt if they exist
  if (entity.createdAt) {
    dto.created_at = entity.createdAt.toISOString();
  }
  if (entity.updatedAt) {
    dto.updated_at = entity.updatedAt.toISOString();
  }

  return dto;
};





