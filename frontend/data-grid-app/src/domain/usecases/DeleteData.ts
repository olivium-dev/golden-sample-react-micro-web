/**
 * Use Case: Delete Data
 * Business logic for deleting data row
 */

import { IDataRepository } from '../repositories/IDataRepository';

export class DeleteDataUseCase {
  constructor(private repository: IDataRepository) {}

  async execute(id: number): Promise<void> {
    if (!id || id <= 0) {
      throw new Error('Invalid ID');
    }

    try {
      await this.repository.delete(id);
    } catch (error) {
      throw new Error(`Failed to delete data: ${error}`);
    }
  }
}

