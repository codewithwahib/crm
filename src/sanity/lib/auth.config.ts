// lib/users.ts
export const users = [
  { id: '1', username: 'owner',        name: 'Owner',          password: 'owner123',        role: 'owner' },
  { id: '2', username: 'gmsales',      name: 'GM Sales',       password: 'gmsales123',      role: 'gmSales' },
  { id: '3', username: 'salesmanager', name: 'Sales Manager',  password: 'sales123',        role: 'salesManager' },
  { id: '4', username: 'execution',    name: 'Execution User', password: 'execution123',    role: 'execution' },
  { id: '5', username: 'inventory',    name: 'Inventory User', password: 'inventory123',    role: 'inventory' },
  { id: '6', username: 'mechanical',   name: 'Mechanical User',password: 'mechanical12345', role: 'mechanical' },
]

// dashboard route each role should land on after login
export const dashboardRoutes: Record<string, string> = {
  owner:        '/dashboard',
  gmSales:      '/Anas-Nayyar/dashboard',
  salesManager: '/Aziz-Ahmed/dashboard',
  execution:    '/Execution/quotation',
  inventory:    '/Inventory/dashboard',
  mechanical:   '/Mechanical/drawings',
}
