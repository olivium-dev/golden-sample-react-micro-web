// Mock API client for testing without backend
// Using a class to ensure proper state management
class MockDataStore {
  // Original data to use for resets
  private originalParcelets = [
    {
      id: 1,
      order_id: 1,
      customer_name: "John Doe",
      customer_email: "john.doe@example.com",
      product_name: "Wireless Headphones",
      quantity: 2,
      shipping_address: "123 Main St, New York, NY 10001",
      tracking_number: "TRK001234567",
      status: "pending" as const,
      notes: "Awaiting processing",
      created_at: "2024-10-15T10:30:00",
      updated_at: "2024-10-15T10:30:00"
    },
    {
      id: 2,
      order_id: 2,
      customer_name: "Jane Smith",
      customer_email: "jane.smith@example.com",
      product_name: "Laptop Stand",
      quantity: 1,
      shipping_address: "456 Oak Ave, Los Angeles, CA 90210",
      tracking_number: "TRK001234568",
      status: "pending" as const,
      notes: "Ready for shipment",
      created_at: "2024-10-20T14:15:00",
      updated_at: "2024-10-20T14:15:00"
    },
    {
      id: 3,
      order_id: 3,
      customer_name: "Mike Johnson",
      customer_email: "mike.johnson@example.com",
      product_name: "Bluetooth Speaker",
      quantity: 1,
      shipping_address: "789 Pine St, Chicago, IL 60601",
      tracking_number: "TRK001234569",
      status: "pending" as const,
      notes: "Awaiting pickup",
      created_at: "2024-10-25T09:45:00",
      updated_at: "2024-10-25T09:45:00"
    },
    {
      id: 4,
      order_id: 4,
      customer_name: "Sarah Wilson",
      customer_email: "sarah.wilson@example.com",
      product_name: "USB-C Cable",
      quantity: 3,
      shipping_address: "321 Elm St, Houston, TX 77001",
      tracking_number: "TRK001234570",
      status: "pending" as const,
      notes: "Priority delivery requested",
      created_at: "2024-11-01T16:20:00",
      updated_at: "2024-11-01T16:20:00"
    },
    {
      id: 5,
      order_id: 5,
      customer_name: "David Brown",
      customer_email: "david.brown@example.com",
      product_name: "Wireless Mouse",
      quantity: 1,
      shipping_address: "555 Cedar Rd, Miami, FL 33101",
      tracking_number: "TRK001234571",
      status: "pending" as const,
      notes: "Standard shipping",
      created_at: "2024-11-02T11:10:00",
      updated_at: "2024-11-02T11:10:00"
    }
  ];

  // Current working data
  private parcelets = [
    {
      id: 1,
      order_id: 1,
      customer_name: "John Doe",
      customer_email: "john.doe@example.com",
      product_name: "Wireless Headphones",
      quantity: 2,
      shipping_address: "123 Main St, New York, NY 10001",
      tracking_number: "TRK001234567",
      status: "delivered" as const,
      notes: "Delivered to front door",
      created_at: "2024-10-15T10:30:00",
      updated_at: "2024-10-18T14:20:00"
    },
    {
      id: 2,
      order_id: 2,
      customer_name: "Jane Smith",
      customer_email: "jane.smith@example.com",
      product_name: "Laptop Stand",
      quantity: 1,
      shipping_address: "456 Oak Ave, Los Angeles, CA 90210",
      tracking_number: "TRK001234568",
      status: "shipped" as const,
      notes: "Out for delivery",
      created_at: "2024-10-20T14:15:00",
      updated_at: "2024-10-22T09:30:00"
    },
    {
      id: 3,
      order_id: 3,
      customer_name: "Mike Johnson",
      customer_email: "mike.johnson@example.com",
      product_name: "Bluetooth Speaker",
      quantity: 1,
      shipping_address: "789 Pine St, Chicago, IL 60601",
      tracking_number: "TRK001234569",
      status: "pending" as const,
      notes: "Awaiting pickup",
      created_at: "2024-10-25T09:45:00",
      updated_at: "2024-10-25T09:45:00"
    },
    {
      id: 4,
      order_id: 4,
      customer_name: "Sarah Wilson",
      customer_email: "sarah.wilson@example.com",
      product_name: "USB-C Cable",
      quantity: 3,
      shipping_address: "321 Elm St, Houston, TX 77001",
      tracking_number: "TRK001234570",
      status: "pending" as const,
      notes: "Priority delivery requested",
      created_at: "2024-11-01T16:20:00",
      updated_at: "2024-11-01T16:20:00"
    },
    {
      id: 5,
      order_id: 5,
      customer_name: "David Brown",
      customer_email: "david.brown@example.com",
      product_name: "Wireless Mouse",
      quantity: 1,
      shipping_address: "555 Cedar Rd, Miami, FL 33101",
      tracking_number: "TRK001234571",
      status: "shipped" as const,
      notes: "In transit",
      created_at: "2024-11-02T11:10:00",
      updated_at: "2024-11-03T08:15:00"
    }
  ];

  getAllParcelets() {
    // Always return a fresh copy
    return JSON.parse(JSON.stringify(this.parcelets));
  }

  advanceParcelet(id: number) {
    const index = this.parcelets.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Parcelet with id ${id} not found`);
    }

    const parcelet = this.parcelets[index];
    const currentStatus = parcelet.status;

    let newStatus: 'pending' | 'shipped' | 'delivered';
    let newNotes: string;

    switch (currentStatus) {
      case 'pending':
        newStatus = 'shipped';
        newNotes = 'Parcelet has been shipped and is in transit';
        break;
      case 'shipped':
        newStatus = 'delivered';
        newNotes = 'Parcelet has been successfully delivered';
        break;
      case 'delivered':
        throw new Error('Parcelet is already delivered');
      default:
        throw new Error(`Invalid status: ${currentStatus}`);
    }

    // Create completely new parcelet object
    const updatedParcelet = {
      ...parcelet,
      status: newStatus,
      notes: newNotes,
      updated_at: new Date().toISOString()
    };

    // Replace in array
    this.parcelets[index] = updatedParcelet;
    
    return JSON.parse(JSON.stringify(updatedParcelet));
  }

  resetToOriginal() {
    // Reset to original pending state
    this.parcelets = JSON.parse(JSON.stringify(this.originalParcelets));
    return this.getAllParcelets();
  }
}

const mockStore = new MockDataStore();

export const mockApiClient = {
  get: (url: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (url === '/parcelets/') {
            const data = mockStore.getAllParcelets();
            resolve({ data });
          } else {
            resolve({ data: [] });
          }
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  },
  
  put: (url: string, data?: any) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const match = url.match(/\/parcelets\/(\d+)\/advance/);
          if (match) {
            const parceletId = parseInt(match[1]);
            const updatedParcelet = mockStore.advanceParcelet(parceletId);
            resolve({ data: updatedParcelet });
          } else if (url === '/parcelets/reset') {
            const resetData = mockStore.resetToOriginal();
            resolve({ data: resetData });
          } else {
            reject(new Error('Invalid endpoint'));
          }
        } catch (error) {
          reject(error);
        }
      }, 100);
    });
  }
};
