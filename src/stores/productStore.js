import { defineStore } from 'pinia'
import { productService } from 'src/services/productService'

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    totalCount: 0,
    loading: false,
    error: null,
    currentPage: 1,
    pageSize: 10,
    searchQuery: '',
    selectedCategory: null,
  }),

  getters: {
    hasProducts: (state) => state.products.length > 0,
    totalPages: (state) => Math.ceil(state.totalCount / state.pageSize),
  },

  actions: {
    async fetchProducts() {
      this.loading = true
      this.error = null

      try {
        const params = {
          page: this.currentPage,
          page_size: this.pageSize,
        }
        if (this.searchQuery) params.search = this.searchQuery
        if (this.selectedCategory) params.category = this.selectedCategory

        const response = await productService.getAll(params)
        this.products = response.data.results
        this.totalCount = response.data.count
      } catch (error) {
        this.error = error.response?.data?.detail || 'Failed to fetch products'
        console.error('Fetch products error:', error)
      } finally {
        this.loading = false
      }
    },

    async addProduct(data) {
      try {
        const response = await productService.create(data)
        await this.fetchProducts()
        return response
      } catch (error) {
        throw error
      }
    },

    async updateProduct(id, data) {
      try {
        const response = await productService.update(id, data)
        await this.fetchProducts()
        return response
      } catch (error) {
        throw error
      }
    },

    async deleteProduct(id) {
      try {
        await productService.delete(id)
        await this.fetchProducts()
      } catch (error) {
        throw error
      }
    },

    setPage(page) {
      this.currentPage = page
      this.fetchProducts()
    },

    setSearch(query) {
      this.searchQuery = query
      this.currentPage = 1
      this.fetchProducts()
    },

    setCategory(categoryId) {
      this.selectedCategory = categoryId
      this.currentPage = 1
      this.fetchProducts()
    },

    resetFilters() {
      this.searchQuery = ''
      this.selectedCategory = null
      this.currentPage = 1
      this.fetchProducts()
    },
  },
})
