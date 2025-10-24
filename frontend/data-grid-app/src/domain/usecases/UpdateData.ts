/**
 * Use Case: Update Data
 * Business logic for updating existing data row
 */

import { IDataRepository } from '../repositories/IDataRepository';
import { DataRow, UpdateDataRowInput } from '../entities/DataRow';

export class UpdateDataUseCase {
  constructor(private repository: IDataRepository) {}

  async execute(id: number, input: UpdateDataRowInput): Promise<DataRow> {
    // Validate input
    if (input.name !== undefined && input.name.trim().length === 0) {
      throw new Error('Name cannot be empty');
    }
    if (input.category !== undefined && input.category.trim().length === 0) {
      throw new Error('Category cannot be empty');
    }
    if (input.value !== undefined && input.value < 0) {
      throw new Error('Value must be positive');
    }

    try {
      return await this.repository.update(id, input);
    } catch (error) {
      throw new Error(`Failed to update data: ${error}`);
    }
  }
}





