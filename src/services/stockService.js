import { api } from 'src/boot/axios'

export const stockService = {
  // POST /api/inventory/adjust/
  adjustStock(data) {
    return api.post('/inventory/adjust/', data)
  },

  // GET /api/inventory/logs/
  getLogs(params = {}) {
    return api.get('/inventory/logs/', { params })
  },
}
