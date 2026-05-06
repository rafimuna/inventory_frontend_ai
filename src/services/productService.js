import { api } from 'src/boot/axios'

export const productService = {
  // GET /api/products/?page=1&search=phone&category=1
  getAll(params = {}) {
    return api.get('/products/', { params })
  },

  getById(id) {
    return api.get(`/products/${id}/`)
  },

  create(data) {
    return api.post('/products/', data)
  },

  update(id, data) {
    return api.put(`/products/${id}/`, data)
  },

  delete(id) {
    return api.delete(`/products/${id}/`)
  },
}
