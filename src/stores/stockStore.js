import { defineStore } from 'pinia'
import { stockService } from 'src/services/stockService'

export const useStockStore = defineStore('stock', {
  state: () => ({
    logs: [],
    totalCount: 0,
    loading: false,
    error: null,
    currentPage: 1,
  }),

  actions: {
    async fetchLogs() {
      this.loading = true
      this.error = null

      try {
        const response = await stockService.getLogs({ page: this.currentPage })
        this.logs = response.data.results
        this.totalCount = response.data.count
      } catch (error) {
        this.error = error.response?.data?.detail || 'Failed to fetch logs'
      } finally {
        this.loading = false
      }
    },

    async adjustStock(data) {
      try {
        const response = await stockService.adjustStock(data)
        await this.fetchLogs() // Refresh logs
        return response
      } catch (error) {
        throw error
      }
    },

    setPage(page) {
      this.currentPage = page
      this.fetchLogs()
    },
  },
})
