# Data Grid App - Clean Architecture Implementation

This application demonstrates clean architecture principles with MVVM pattern in a React micro-frontend.

## Architecture Overview

```
src/
├── app/                    # Application layer
│   ├── App.tsx            # Main app component with DI
│   └── providers/         # React context providers
├── presentation/          # Presentation layer (UI)
│   ├── components/        # Reusable MUI components
│   ├── pages/            # Page-level components
│   └── viewmodels/       # Presentation logic (MVVM)
├── domain/               # Domain layer (Business Logic)
│   ├── entities/         # Business models
│   ├── usecases/         # Business use cases
│   └── repositories/     # Repository interfaces
├── data/                 # Data layer (External data)
│   ├── api/             # API client configuration
│   ├── mappers/         # DTO to Entity mappers
│   └── repositories/    # Repository implementations
└── infra/               # Infrastructure layer
    ├── config/          # App configuration
    ├── adapters/        # External service adapters
    └── events/          # Event bus/messaging
```

## Layer Responsibilities

### Domain Layer (Core Business Logic)
**Independent of frameworks, UI, and external services**

- **Entities** (`domain/entities/`): Pure business objects
  - `DataRow.ts`: Data model with business rules
  
- **Use Cases** (`domain/usecases/`): Application-specific business rules
  - `GetAllData.ts`: Fetch all data with filtering
  - `CreateData.ts`: Create new data with validation
  - `UpdateData.ts`: Update existing data with validation
  - `DeleteData.ts`: Delete data with validation

- **Repository Interfaces** (`domain/repositories/`): Contracts for data access
  - `IDataRepository.ts`: Defines data access methods without implementation

### Data Layer (Data Access)
**Implements repository interfaces, handles external data**

- **API Client** (`data/api/`): HTTP client configuration
  - `dataClient.ts`: Axios instance with interceptors

- **Mappers** (`data/mappers/`): Transform between DTOs and Entities
  - `dataMapper.ts`: Converts API DTOs to Domain Entities

- **Repository Implementations** (`data/repositories/`): Concrete data access
  - `DataRepositoryImpl.ts`: Implements IDataRepository using API

### Presentation Layer (UI & ViewModel)
**MUI components and presentation logic**

- **ViewModels** (`presentation/viewmodels/`): Presentation logic using React hooks
  - `useDataGridViewModel.ts`: Manages state and actions for DataGrid

- **Components** (`presentation/components/`): Reusable UI components
  - `DataRowDialog.tsx`: Create/Edit dialog component

- **Pages** (`presentation/pages/`): Page-level components
  - `DataGridPage.tsx`: Main page with MUI X DataGrid

### Infrastructure Layer
**Configuration and adapters**

- **Config** (`infra/config/`): Application configuration
  - `appConfig.ts`: App-wide settings

## MVVM Pattern Implementation

### ViewModel (`useDataGridViewModel`)
```typescript
// ViewModel manages state and business logic
const viewModel = useDataGridViewModel(repository);

// State
viewModel.data            // Current data rows
viewModel.loading         // Loading indicator
viewModel.error           // Error message

// Actions
viewModel.fetchData()     // Fetch data
viewModel.createRow()     // Create new row
viewModel.updateRow()     // Update existing row
viewModel.deleteRow()     // Delete row
```

### View (React Component)
```typescript
// View consumes ViewModel and renders UI
<DataGridPage viewModel={viewModel} />
```

## Dependency Injection

Dependencies are injected at the app level:

```typescript
// App.tsx
const dataRepository = new DataRepositoryImpl();
const viewModel = useDataGridViewModel(dataRepository);
```

Benefits:
- Testable: Easy to mock dependencies
- Flexible: Easy to swap implementations
- Decoupled: Components don't depend on concrete implementations

## Data Flow

```
User Action → ViewModel → Use Case → Repository Interface
                ↓                           ↓
            View Update ← Mapper ← Repository Implementation → API
```

Example: Creating a new row
1. User clicks "Add Data" button
2. View calls `viewModel.createRow(formData)`
3. ViewModel calls `CreateDataUseCase.execute(input)`
4. Use Case validates input and calls `repository.create(input)`
5. Repository Implementation calls API via `dataClient`
6. API response is mapped from DTO to Entity via `dataMapper`
7. ViewModel updates state
8. View re-renders with new data

## Benefits of This Architecture

### 1. Separation of Concerns
- Each layer has a single responsibility
- Business logic is isolated from UI and data access

### 2. Testability
- Domain layer can be tested without UI or API
- ViewModels can be tested with mocked repositories
- Components can be tested with mocked ViewModels

### 3. Maintainability
- Changes in one layer don't affect others
- Easy to understand and modify

### 4. Flexibility
- Easy to swap implementations (e.g., different API, local storage)
- Can reuse business logic across different UIs

### 5. Scalability
- Clear structure for adding new features
- Easy to onboard new developers

## Testing Strategy

### Unit Tests
```typescript
// Test Use Cases
describe('CreateDataUseCase', () => {
  it('should validate input', async () => {
    const mockRepository = /* mock */;
    const useCase = new CreateDataUseCase(mockRepository);
    // Test validation logic
  });
});

// Test ViewModels
describe('useDataGridViewModel', () => {
  it('should fetch data on mount', async () => {
    const mockRepository = /* mock */;
    const { result } = renderHook(() => 
      useDataGridViewModel(mockRepository)
    );
    // Test behavior
  });
});
```

### Integration Tests
- Test full data flow from View to API
- Test error handling and edge cases

## Key Principles

1. **Dependency Inversion**: High-level modules don't depend on low-level modules
2. **Single Responsibility**: Each class/function has one reason to change
3. **Open/Closed**: Open for extension, closed for modification
4. **Interface Segregation**: Clients shouldn't depend on unused methods
5. **Liskov Substitution**: Subtypes must be substitutable for base types

## Module Federation Integration

The app is exposed via Module Federation:

```javascript
// webpack.config.js
exposes: {
  './DataGrid': './src/app/App.tsx',
}
```

Can be consumed by the container app:

```typescript
const DataGrid = React.lazy(() => import('dataApp/DataGrid'));
```

## Best Practices

1. **Keep Domain Layer Pure**: No framework dependencies
2. **Use Interfaces**: Define contracts, not implementations
3. **Validate in Use Cases**: Business rules live in domain layer
4. **Map at Boundaries**: Convert between DTOs and Entities
5. **Inject Dependencies**: Don't create dependencies inside components
6. **Handle Errors Gracefully**: Use try-catch and provide user feedback
7. **Keep ViewModels Thin**: Delegate to Use Cases for business logic

## Future Enhancements

- Add caching layer
- Implement optimistic updates
- Add real-time data synchronization
- Implement undo/redo functionality
- Add bulk operations
- Implement advanced filtering and sorting





