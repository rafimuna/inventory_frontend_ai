import { defineStore } from 'pinia'
import { dashboardService } from 'src/services/dashboardService'

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    stats: {
      total_products: 0,
      low_stock_products: 0,
      total_stock_value: 0,
      recent_activities: [],
    },
    loading: false,
    error: null,
  }),

  getters: {
    formattedTotalValue: (state) => {
      if (!state.stats.total_stock_value) return '৳0'
      return new Intl.NumberFormat('bn-BD', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(state.stats.total_stock_value)
    },
  },

  actions: {
    async fetchStats() {
      this.loading = true
      this.error = null

      try {
        const response = await dashboardService.getStats()
        this.stats = response.data
      } catch (error) {
        console.error('Dashboard stats error:', error)
        this.error = error.response?.data?.detail || 'Failed to fetch dashboard stats'

        // Set default values on error
        this.stats = {
          total_products: 0,
          low_stock_products: 0,
          total_stock_value: 0,
          recent_activities: [],
        }
      } finally {
        this.loading = false
      }
    },
  },
})
