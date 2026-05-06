/**
 * App constants
 */
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  TIMEOUT: 30000,
}

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
}

export const STOCK_REASONS = [
  { label: 'Purchase (Increase)', value: 'purchase', type: 'increase' },
  { label: 'Sale (Decrease)', value: 'sale', type: 'decrease' },
  { label: 'Adjustment', value: 'adjustment', type: 'both' },
  { label: 'Return (Increase)', value: 'return', type: 'increase' },
]

export const USER_ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
}

export const STOCK_STATUS = {
  OUT_OF_STOCK: { min: 0, max: 0, label: 'Out of Stock', color: 'negative' },
  LOW_STOCK: { min: 1, max: 9, label: 'Low Stock', color: 'warning' },
  IN_STOCK: { min: 10, max: Infinity, label: 'In Stock', color: 'positive' },
}
