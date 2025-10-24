/**
 * ViewModel: DataGrid
 * Manages presentation logic and state for DataGrid page
 * Implements MVVM pattern using React hooks
 */

import { useState, useEffect, useCallback } from 'react';
import { DataRow, CreateDataRowInput, UpdateDataRowInput } from '../../domain/entities/DataRow';
import { GetAllDataUseCase } from '../../domain/usecases/GetAllData';
import { CreateDataUseCase } from '../../domain/usecases/CreateData';
import { UpdateDataUseCase } from '../../domain/usecases/UpdateData';
import { DeleteDataUseCase } from '../../domain/usecases/DeleteData';
import { IDataRepository } from '../../domain/repositories/IDataRepository';
import { ErrorCapture } from '../../../../shared-ui-lib/src';

export interface DataGridViewModelState {
  data: DataRow[];
  loading: boolean;
  error: string | null;
  selectedRows: number[];
  editingRow: DataRow | null;
  dialogOpen: boolean;
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;
}

export interface DataGridViewModelActions {
  fetchData: () => Promise<void>;
  createRow: (input: CreateDataRowInput) => Promise<void>;
  updateRow: (id: number, input: UpdateDataRowInput) => Promise<void>;
  deleteRow: (id: number) => Promise<void>;
  openDialog: (row?: DataRow) => void;
  closeDialog: () => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setStatusFilter: (status: string) => void;
  setSelectedRows: (ids: number[]) => void;
}

export type DataGridViewModel = DataGridViewModelState & DataGridViewModelActions;

export const useDataGridViewModel = (repository: IDataRepository): DataGridViewModel => {
  const [state, setState] = useState<DataGridViewModelState>({
    data: [],
    loading: false,
    error: null,
    selectedRows: [],
    editingRow: null,
    dialogOpen: false,
    searchQuery: '',
    categoryFilter: '',
    statusFilter: '',
  });

  // Initialize use cases
  const getAllDataUseCase = new GetAllDataUseCase(repository);
  const createDataUseCase = new CreateDataUseCase(repository);
  const updateDataUseCase = new UpdateDataUseCase(repository);
  const deleteDataUseCase = new DeleteDataUseCase(repository);

  const fetchData = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const filters: any = {};
      if (state.categoryFilter) filters.category = state.categoryFilter;
      if (state.statusFilter) filters.status = state.statusFilter;

      const data = await getAllDataUseCase.execute(filters);
      setState((prev) => ({ ...prev, data, loading: false }));
    } catch (error) {
      ErrorCapture.captureApiError(error, '/api/data', 'GET');
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch data',
      }));
    }
  }, [state.categoryFilter, state.statusFilter]);

  const createRow = async (input: CreateDataRowInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await createDataUseCase.execute(input);
      await fetchData();
      setState((prev) => ({ ...prev, dialogOpen: false, loading: false }));
    } catch (error) {
      ErrorCapture.captureApiError(error, '/api/data', 'POST');
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create row',
      }));
      throw error;
    }
  };

  const updateRow = async (id: number, input: UpdateDataRowInput) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await updateDataUseCase.execute(id, input);
      await fetchData();
      setState((prev) => ({ ...prev, dialogOpen: false, editingRow: null, loading: false }));
    } catch (error) {
      ErrorCapture.captureApiError(error, `/api/data/${id}`, 'PUT');
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update row',
      }));
      throw error;
    }
  };

  const deleteRow = async (id: number) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      await deleteDataUseCase.execute(id);
      await fetchData();
      setState((prev) => ({ ...prev, loading: false }));
    } catch (error) {
      ErrorCapture.captureApiError(error, `/api/data/${id}`, 'DELETE');
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to delete row',
      }));
      throw error;
    }
  };

  const openDialog = (row?: DataRow) => {
    setState((prev) => ({
      ...prev,
      dialogOpen: true,
      editingRow: row || null,
    }));
  };

  const closeDialog = () => {
    setState((prev) => ({
      ...prev,
      dialogOpen: false,
      editingRow: null,
    }));
  };

  const setSearchQuery = (query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  };

  const setCategoryFilter = (category: string) => {
    setState((prev) => ({ ...prev, categoryFilter: category }));
  };

  const setStatusFilter = (status: string) => {
    setState((prev) => ({ ...prev, statusFilter: status }));
  };

  const setSelectedRows = (ids: number[]) => {
    setState((prev) => ({ ...prev, selectedRows: ids }));
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    fetchData();
  }, [state.categoryFilter, state.statusFilter]);

  return {
    ...state,
    fetchData,
    createRow,
    updateRow,
    deleteRow,
    openDialog,
    closeDialog,
    setSearchQuery,
    setCategoryFilter,
    setStatusFilter,
    setSelectedRows,
  };
};

