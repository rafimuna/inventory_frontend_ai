import { boot } from 'quasar/wrappers'
import axios from 'axios'

// API এর বেস URL সেট করো
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api', // ← তোমার ব্যাকএন্ডের ঠিকানা
  headers: {
    'Content-Type': 'application/json',
  },
})

// টোকেন auto-add করার জন্য interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default boot(({ app }) => {
  app.config.globalProperties.$api = api
})

export { api }
