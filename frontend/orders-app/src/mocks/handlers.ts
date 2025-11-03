/**
 * MSW Mock Handlers for User Management
 * Uses configuration to provide mock API responses
 */

import { http, HttpResponse } from 'msw';
import { UserManagementConfig } from '../config/schema';

// Default mock users (used if config doesn't provide mockUsers)
const defaultMockUsers = [
  {
    id: 1,
    email: 'admin@example.com',
    username: 'admin',
    full_name: 'Admin User',
    role: 'admin',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    email: 'user@example.com',
    username: 'user',
    full_name: 'Regular User',
    role: 'user',
    is_active: true,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    email: 'viewer@example.com',
    username: 'viewer',
    full_name: 'Viewer User',
    role: 'viewer',
    is_active: true,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
];

export function createUserMockHandlers(config: UserManagementConfig) {
  const baseUrl = config.api.services.users.baseUrl;
  const routes = config.api.services.users.routes;
  const delay = config.mock?.apiDelay ?? 500;
  const mockUsers = config.mock?.mockUsers ?? defaultMockUsers;

  // In-memory store for mutations
  let users = [...mockUsers];
  let nextId = Math.max(...users.map((u) => u.id)) + 1;

  return [
    // GET /users - List users
    http.get(`${baseUrl}${routes.list}`, async () => {
      console.log('[MSW] GET /users');
      await new Promise(r => setTimeout(r, delay));
      return HttpResponse.json(users);
    }),

    // POST /users - Create user
    http.post(`${baseUrl}${routes.create}`, async ({ request }) => {
      const body = await request.json() as any;
      console.log('[MSW] POST /users', body);

      const newUser = {
        id: nextId++,
        email: body.email,
        username: body.username,
        full_name: body.full_name,
        role: body.role || 'user',
        is_active: body.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      users.push(newUser);
      await new Promise(r => setTimeout(r, delay));
      return HttpResponse.json(newUser, { status: 201 });
    }),

    // PUT /users/:id - Update user
    http.put(`${baseUrl}${routes.update.replace(':id', ':userId')}`, async ({ request, params }) => {
      const userId = parseInt(params.userId as string, 10);
      const body = await request.json() as any;
      console.log(`[MSW] PUT /users/${userId}`, body);

      const index = users.findIndex((u) => u.id === userId);
      if (index === -1) {
        await new Promise(r => setTimeout(r, delay));
        return HttpResponse.json({ detail: 'User not found' }, { status: 404 });
      }

      users[index] = {
        ...users[index],
        ...body,
        updated_at: new Date().toISOString(),
      };

      await new Promise(r => setTimeout(r, delay));
      return HttpResponse.json(users[index]);
    }),

    // DELETE /users/:id - Delete user
    http.delete(`${baseUrl}${routes.delete.replace(':id', ':userId')}`, async ({ params }) => {
      const userId = parseInt(params.userId as string, 10);
      console.log(`[MSW] DELETE /users/${userId}`);

      const index = users.findIndex((u) => u.id === userId);
      if (index === -1) {
        await new Promise(r => setTimeout(r, delay));
        return HttpResponse.json({ detail: 'User not found' }, { status: 404 });
      }

      users.splice(index, 1);
      await new Promise(r => setTimeout(r, delay));
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}

