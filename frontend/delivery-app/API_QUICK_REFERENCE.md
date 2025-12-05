# Delivery Gateway API - Quick Reference

## 🌐 Base URL
```
https://dev-creamat.fds-1.com/gateway/api/Delivery
```

## 📡 Endpoints

### 1. List Shipments
```http
GET /shipments?orderId={orderId}&stage={stage}&limit={limit}
```
**Response:**
```json
{
  "shipments": [ShipmentDetail],
  "count": number
}
```

### 2. Get Shipment by ID
```http
GET /shipments/{id}
```
**Response:**
```json
{
  "id": "string",
  "orderId": "string",
  "currentStage": "CREATED | READY_FOR_PICKUP | DELIVERED",
  "carrierTrackingId": "string",
  "metadata": {},
  "history": [],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

### 3. Create Shipment
```http
POST /shipments
```
**Request Body:**
```json
{
  "orderId": "string",
  "address": {
    "name": "string",
    "street": "string",
    "city": "string",
    "postalCode": "string",
    "country": "string",
    "email": "string"
  },
  "selection": {
    "carrier": "PostNL",
    "service": "standard"
  },
  "workflow": {
    "name": "default_eu",
    "version": 1
  },
  "metadata": {}
}
```

### 4. Advance Shipment Status ⭐
```http
POST /shipments/{id}/advance
```
**Request Body:**
```json
{
  "event": "string",
  "payload": {}
}
```

**Example - Advance to Ready for Pickup:**
```json
{
  "event": "CARRIER_PICKED_UP"
}
```

**Example - Advance to Delivered:**
```json
{
  "event": "DELIVERED",
  "payload": {
    "signature": "Customer Name",
    "delivery_time": "2025-11-22T20:00:00Z"
  }
}
```

## 🔐 Authentication
All requests require JWT token in header:
```http
Authorization: Bearer {token}
```

## 📊 Status Flow
```
CREATED → READY_FOR_PICKUP → DELIVERED
```

## 🔄 Legacy Status Mapping
```javascript
CREATED          → pending
READY_FOR_PICKUP → ready_for_pickup
DELIVERED        → delivered
```

## 💡 Usage Examples

### JavaScript/TypeScript
```typescript
import { deliveryGatewayClient } from './services/deliveryGatewayClient';

// Get all shipments
const { shipments, count } = await deliveryGatewayClient.getShipments();

// Get specific shipment
const shipment = await deliveryGatewayClient.getShipmentById('ship_123');

// Create shipment
const newShipment = await deliveryGatewayClient.createShipment({
  orderId: 'order_456',
  address: { /* ... */ },
  selection: { carrier: 'PostNL', service: 'standard' },
  workflow: { name: 'default_eu', version: 1 }
});

// Advance shipment
const result = await deliveryGatewayClient.advanceShipment('ship_123', {
  event: 'CARRIER_PICKED_UP'
});
```

### cURL
```bash
# Get shipments
curl -X GET "https://dev-creamat.fds-1.com/gateway/api/Delivery/shipments" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create shipment
curl -X POST "https://dev-creamat.fds-1.com/gateway/api/Delivery/shipments" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "order_123",
    "address": {
      "name": "John Doe",
      "street": "123 Main St",
      "city": "Amsterdam",
      "postalCode": "1012AB",
      "country": "NL",
      "email": "john@example.com"
    },
    "selection": {
      "carrier": "PostNL",
      "service": "standard"
    },
    "workflow": {
      "name": "default_eu",
      "version": 1
    }
  }'

# Advance shipment
curl -X POST "https://dev-creamat.fds-1.com/gateway/api/Delivery/shipments/ship_123/advance" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "event": "CARRIER_PICKED_UP"
  }'
```

---

**Last Updated:** November 22, 2025
