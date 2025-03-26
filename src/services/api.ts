import axios from 'axios'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vuestic-ui'
import router from '../router'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
})

//Add Axios interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const authStore = useAuthStore()
      const { init: notify } = useToast()

      // Show a toast notification
      notify({
        message: 'Session expired. Please log in again.',
        color: 'danger',
      })

      // Perform logout
      authStore.logout()

      // Redirect to login page
      router.push('/login')
    }
    return Promise.reject(error)
  },
)

export default {
  allUsers: () => `${apiBaseUrl}/users`,
  user: (id: string) => `${apiBaseUrl}/users/${id}`,
  users: ({ page, pageSize }: { page: number; pageSize: number }) =>
    `${apiBaseUrl}/users/?page=${page}&pageSize=${pageSize}`,
  allProjects: () => `${apiBaseUrl}/projects`,
  project: (id: string) => `${apiBaseUrl}/projects/${id}`,
  projects: ({ page, pageSize }: { page: number; pageSize: number }) =>
    `${apiBaseUrl}/projects/?page=${page}&pageSize=${pageSize}`,
  avatars: () => `${apiBaseUrl}/avatars`,
}
