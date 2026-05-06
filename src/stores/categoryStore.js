import { defineStore } from 'pinia'
import { categoryService } from 'src/services/categoryService'

export const useCategoryStore = defineStore('category', {
  state: () => ({
    categories: [],
    totalCount: 0,
    loading: false,
    error: null,
  }),

  getters: {
    categoryOptions: (state) => state.categories.map((cat) => ({ label: cat.name, value: cat.id })),
    getCategoryById: (state) => (id) => state.categories.find((cat) => cat.id === id),
  },

  actions: {
    async fetchCategories() {
      this.loading = true
      this.error = null

      try {
        const response = await categoryService.getAll()
        this.categories = response.data.results || response.data
        this.totalCount = response.data.count || this.categories.length
      } catch (error) {
        this.error = error.response?.data?.detail || 'Failed to fetch categories'
        console.error('Fetch categories error:', error)
      } finally {
        this.loading = false
      }
    },

    async addCategory(data) {
      try {
        const response = await categoryService.create(data)
        await this.fetchCategories() // Refresh list
        return response
      } catch (error) {
        throw error
      }
    },

    async updateCategory(id, data) {
      try {
        const response = await categoryService.update(id, data)
        await this.fetchCategories()
        return response
      } catch (error) {
        throw error
      }
    },

    async deleteCategory(id) {
      try {
        await categoryService.delete(id)
        await this.fetchCategories()
      } catch (error) {
        throw error
      }
    },
  },
})
