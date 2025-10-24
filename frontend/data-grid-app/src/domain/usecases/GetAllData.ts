/**
 * Use Case: Get All Data
 * Business logic for fetching data with optional filtering
 */

import { IDataRepository, DataFilters } from '../repositories/IDataRepository';
import { DataRow } from '../entities/DataRow';

export class GetAllDataUseCase {
  constructor(private repository: IDataRepository) {}

  async execute(filters?: DataFilters): Promise<DataRow[]> {
    try {
      const data = await this.repository.getAll(filters);
      // Add business logic here if needed (e.g., sorting, filtering)
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch data: ${error}`);
    }
  }
}





