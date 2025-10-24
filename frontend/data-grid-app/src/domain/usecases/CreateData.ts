/**
 * Use Case: Create Data
 * Business logic for creating new data row
 */

import { IDataRepository } from '../repositories/IDataRepository';
import { DataRow, CreateDataRowInput } from '../entities/DataRow';

export class CreateDataUseCase {
  constructor(private repository: IDataRepository) {}

  async execute(input: CreateDataRowInput): Promise<DataRow> {
    // Validate input
    if (!input.name || input.name.trim().length === 0) {
      throw new Error('Name is required');
    }
    if (!input.category || input.category.trim().length === 0) {
      throw new Error('Category is required');
    }
    if (input.value < 0) {
      throw new Error('Value must be positive');
    }

    try {
      return await this.repository.create(input);
    } catch (error) {
      throw new Error(`Failed to create data: ${error}`);
    }
  }
}





