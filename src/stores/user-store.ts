import { defineStore } from 'pinia'

// Define the User type
interface User {
  name?: string
  email?: string
  joining_date?: string
  image?: string
  is2FAEnabled?: boolean
  id?: number | null
  role?: string
  phone?: string
  category?: string
  date_of_birth?: string
}

export const useUserStore = defineStore('user', {
  state: () => ({
    userName: '',
    email: '',
    memberSince: '',
    pfp: '',
    is2FAEnabled: false,
    id: null as number | null,
    role: '',
    phone: '',
    category: '',
    date_of_birth: '',
    joining_date: '',
  }),

  actions: {
    setUser(user: User) {
      this.userName = user.name || 'Unknown User'
      this.email = user.email || ''
      this.memberSince = user.joining_date ? new Date(user.joining_date).toLocaleDateString() : ''
      this.pfp = user.image || 'https://picsum.photos/200/300'
      this.is2FAEnabled = user.is2FAEnabled || false
      this.id = user.id || null
      this.role = user.role || ''
      this.phone = user.phone || ''
      this.category = user.category || ''
      this.date_of_birth = user.date_of_birth || ''
      this.joining_date = user.joining_date || ''
    },

    clearUser() {
      this.$reset()
    },
  },
})
