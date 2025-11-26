/**
 * Service Authentication Configuration
 * Contains the API keys required for Order Service authentication
 */

export const SERVICE_AUTH_CONFIG = {
  // Order Service authentication keys
  ORDER_SERVICE: {
    API_KEY: 'order-service-api-key-2024-secure',
    TOKEN_KEY: 'order-service-token-key-def456',
  },
} as const;

export const getOrderServiceHeaders = () => ({
  'X-Service-API-Key': SERVICE_AUTH_CONFIG.ORDER_SERVICE.API_KEY,
  'X-Service-Token-Key': SERVICE_AUTH_CONFIG.ORDER_SERVICE.TOKEN_KEY,
});
