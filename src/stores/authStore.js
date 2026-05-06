import { defineStore } from 'pinia'
import { authService } from 'src/services/authService'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('access_token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    userName: (state) => state.user?.username || '',
  },

  actions: {
    async login(username, password) {
      this.loading = true
      this.error = null

      try {
        const response = await authService.login(username, password)
        this.token = response.data.access
        this.user = response.data.user

        localStorage.setItem('access_token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))

        return true
      } catch (error) {
        this.error = error.response?.data?.error || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(userData) {
      this.loading = true
      this.error = null

      try {
        await authService.register(userData)
        return true
      } catch (error) {
        this.error = error.response?.data?.error || 'Registration failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    },

    loadUserFromStorage() {
      const storedUser = localStorage.getItem('user')
      if (storedUser && this.token) {
        this.user = JSON.parse(storedUser)
      }
    },
  },
})
