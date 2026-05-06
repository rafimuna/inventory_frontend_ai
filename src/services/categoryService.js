import { api } from 'src/boot/axios'

export const categoryService = {
  // GET /api/categories/ - সব ক্যাটাগরি আনা
  getAll() {
    return api.get('/categories/')
  },

  // GET /api/categories/{id}/ - একটি ক্যাটাগরি আনা
  getById(id) {
    return api.get(`/categories/${id}/`)
  },

  // POST /api/categories/ - নতুন ক্যাটাগরি তৈরি
  create(data) {
    return api.post('/categories/', data)
  },

  // PUT /api/categories/{id}/ - সম্পূর্ণ আপডেট
  update(id, data) {
    return api.put(`/categories/${id}/`, data)
  },

  // DELETE /api/categories/{id}/ - ডিলিট
  delete(id) {
    return api.delete(`/categories/${id}/`)
  },
}
