import { ref, unref, watch, computed } from 'vue'
import axios from 'axios' // Import axios for API requests
import { v4 as uuid } from 'uuid'
import type { Filters, Pagination, Sorting } from '../../../data/pages/users'
import { User } from '../types'
import { useUsersStore } from '../../../stores/users'

const makePaginationRef = () => ref<Pagination>({ page: 1, perPage: 10, total: 0 })
const makeSortingRef = () => ref<Sorting>({ sortBy: 'fullname', sortingOrder: null })
const makeFiltersRef = () => ref<Partial<Filters>>({ isActive: true, search: '' })

export const useUsers = (options?: {
  pagination?: Ref<Pagination>
  sorting?: Ref<Sorting>
  filters?: Ref<Partial<Filters>>
}) => {
  const isLoading = ref(false)
  const error = ref()
  const usersStore = useUsersStore()

  const { filters = makeFiltersRef(), sorting = makeSortingRef(), pagination = makePaginationRef() } = options || {}

  const fetch = async () => {
    isLoading.value = true
    try {
      await usersStore.getAll({
        filters: unref(filters),
        sorting: unref(sorting),
        pagination: unref(pagination),
      })
      pagination.value = usersStore.pagination
    } finally {
      isLoading.value = false
    }
  }

  watch(
    filters,
    () => {
      pagination.value.page = 1
      fetch()
    },
    { deep: true },
  )

  fetch()

  const users = computed(() => {
    return usersStore.items.slice(
      (pagination.value.page - 1) * pagination.value.perPage,
      pagination.value.page * pagination.value.perPage,
    )
  })

  return {
    error,
    isLoading,
    filters,
    sorting,
    pagination,

    users,

    fetch,

    async add(user: User) {
      isLoading.value = true
      try {
        const response = await axios.post('http://localhost:5001/api/auth/register', {
          name: user.fullname,
          email: user.email,
          password: user.password,
          role: user.role,
          phone: user.phone,
          category: user.category,
          date_of_birth: user.date_of_birth,
          joining_date: new Date().toISOString(),
          update_date: new Date().toISOString(),
        })

        if (response.data && response.data.user) {
          const newUser = {
            id: response.data.user.id,
            customId: response.data.user.custom_id,
            fullname: response.data.user.name,
            email: response.data.user.email,
            role: response.data.user.role,
            phone: response.data.user.phone,
            category: response.data.user.category,
            date_of_birth: response.data.user.date_of_birth,
            joining_date: response.data.user.joining_date,
            update_date: response.data.user.update_date,
            avatar: response.data.user.image, // Store image URL if provided
          }

          usersStore.items.push(newUser) // Update local store with the new user
          pagination.value.total += 1 // Increment total users count
          return newUser
        }
      } catch (e) {
        error.value = e
      } finally {
        isLoading.value = false
      }
    },

    async update(user: User) {
      isLoading.value = true
      try {
        return await usersStore.update(user)
      } catch (e) {
        error.value = e
      } finally {
        isLoading.value = false
      }
    },

    async remove(user: User) {
      isLoading.value = true
      try {
        return await usersStore.remove(user)
      } catch (e) {
        error.value = e
      } finally {
        isLoading.value = false
      }
    },

    async uploadAvatar(avatar: Blob) {
      const formData = new FormData()
      formData.append('avatar', avatar)
      formData.append('id', uuid())

      return usersStore.uploadAvatar(formData)
    },
  }
}
