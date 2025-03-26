import axios from 'axios'
import store from '../store'
import router from '../router'

const api = axios.create({
  baseURL: process.env.VUE_APP_API_URL || 'http://localhost:5001/api',
})

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = store.getters['auth/token']
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response.status === 401) {
      store.dispatch('auth/logout')
      router.push('/login')
    }
    return Promise.reject(error)
  },
)

export default api
