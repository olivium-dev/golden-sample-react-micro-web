const express = require('express');
const cors = require('cors');
const app = express();
const port = 8001;

// Enable CORS for all localhost origins
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow all localhost and 127.0.0.1 origins
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Deny other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Mock orders data
const mockOrders = [
  {
    orderId: 'order-001',
    total: 299.99,
    status: 'Pending Payment',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    items: [
      {
        itemId: 'item-001',
        itemName: 'Wireless Headphones',
        quantity: 1,
        unitPrice: 299.99,
        tag: 'Electronics order'
      }
    ]
  },
  {
    orderId: 'order-002',
    total: 159.98,
    status: 'Processing',
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    items: [
      {
        itemId: 'item-002',
        itemName: 'Phone Case',
        quantity: 2,
        unitPrice: 79.99,
        tag: 'Accessories order'
      }
    ]
  },
  {
    orderId: 'order-003',
    total: 89.99,
    status: 'Shipped',
    createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
    items: [
      {
        itemId: 'item-003',
        itemName: 'USB Cable',
        quantity: 3,
        unitPrice: 29.99,
        tag: 'Cable order'
      }
    ]
  }
];

// Mock categories data
const mockCategories = {
  categories: [
    {
      guid: 'cat-001',
      name: 'Electronics',
      description: 'Electronic devices and gadgets',
      isActive: true
    },
    {
      guid: 'cat-002', 
      name: 'Accessories',
      description: 'Phone and device accessories',
      isActive: true
    },
    {
      guid: 'cat-003',
      name: 'Cables',
      description: 'Various types of cables',
      isActive: true
    }
  ],
  totalCount: 3,
  pageNumber: 1,
  pageSize: 10
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Gateway Mock',
    cors: 'enabled'
  });
});

// Orders endpoints
app.get('/api/Order/User/:userId', (req, res) => {
  console.log(`📦 Orders request for user: ${req.params.userId}`);
  res.json(mockOrders);
});

app.post('/api/Order', (req, res) => {
  console.log('📦 Creating new order:', req.body);
  const newOrder = {
    orderId: `order-${Date.now()}`,
    total: req.body.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
    status: 'Pending Payment',
    createdAt: new Date().toISOString(),
    items: req.body.items
  };
  mockOrders.push(newOrder);
  res.status(201).json({ success: true, orderId: newOrder.orderId });
});

app.put('/api/Order/:orderId/Status', (req, res) => {
  console.log(`📦 Updating order ${req.params.orderId} status to: ${req.body.status}`);
  const order = mockOrders.find(o => o.orderId === req.params.orderId);
  if (order) {
    order.status = req.body.status;
    res.json({ success: true, status: req.body.status });
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// Catalog endpoints
app.get('/api/catalog/Category/All/:pageSize/:pageNumber', (req, res) => {
  console.log(`📁 Categories request - Page: ${req.params.pageNumber}, Size: ${req.params.pageSize}`);
  res.json(mockCategories);
});

app.get('/api/catalog/Category/:guid', (req, res) => {
  console.log(`📁 Category details request for: ${req.params.guid}`);
  const category = mockCategories.categories.find(c => c.guid === req.params.guid);
  if (category) {
    res.json(category);
  } else {
    res.status(404).json({ error: 'Category not found' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, () => {
  console.log('\n========================================');
  console.log('🚀 GATEWAY MOCK SERVER STARTED');
  console.log('========================================');
  console.log(`📡 Server running on: http://localhost:${port}`);
  console.log('🔧 CORS enabled for all localhost origins');
  console.log('📦 Mock endpoints available:');
  console.log('   - GET /api/Order/User/:userId');
  console.log('   - POST /api/Order');
  console.log('   - PUT /api/Order/:orderId/Status');
  console.log('   - GET /api/catalog/Category/All/:pageSize/:pageNumber');
  console.log('   - GET /api/catalog/Category/:guid');
  console.log('   - GET /api/health');
  console.log('\n✨ Ready to test frontend integration!');
  console.log('========================================\n');
});
