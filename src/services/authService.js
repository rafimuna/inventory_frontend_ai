import { api } from 'src/boot/axios'

export const authService = {
  // Swagger এর register endpoint
  register(userData) {
    return api.post('/users/register/', userData)
  },

  // Swagger এর login endpoint
  login(username, password) {
    return api.post('/users/login/', { username, password })
  },
}
