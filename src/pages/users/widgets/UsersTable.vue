<script setup lang="ts">
import { defineVaDataTableColumns, useModal } from 'vuestic-ui'
import { User, UserRole } from '../types'
import UserAvatar from './UserAvatar.vue'
import { PropType, computed } from 'vue'
import { Pagination, Sorting } from '../../../data/pages/users'
import { useVModel } from '@vueuse/core'
import { ref, onMounted } from 'vue'
import axios from 'axios'
//import { Project } from '../../projects/types'

// Reactive state for user data and loading state
const userList = ref<User[]>([])
const isLoading = ref(true)

const columns = defineVaDataTableColumns([
  { label: 'Full Name', key: 'fullname', sortable: true },
  { label: 'Email', key: 'email', sortable: true },
  { label: 'Username', key: 'username', sortable: true },
  { label: 'Role', key: 'role', sortable: true },
  // { label: 'Tasks', key: 'tasks', sortable: true },
  { label: ' ', key: 'actions', align: 'right' },
])

// Function to fetch users from the API
const fetchUsers = async () => {
  try {
    isLoading.value = true
    // Get token from localStorage (adjust if using Vuex/Pinia)
    const token = localStorage.getItem('token')

    if (!token) {
      console.error('No authentication token found')
      return
    }

    // Send request with Authorization header
    const response = await axios.get('http://localhost:5001/api/admin/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    userList.value = response.data.map((user) => ({
      id: user.id,
      fullname: user.name || 'N/A', // Handle empty names
      email: user.email || 'N/A',
      username: user.email ? user.email.split('@')[0] : 'N/A', // Extract username
      role: user.role || 'N/A',
      phone: user.phone || 'N/A',
      category: user.category || 'N/A',
      dateOfBirth: user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'N/A',
      updateDate: user.update_date ? new Date(user.update_date).toLocaleString() : 'N/A',
      createdAt: user.createdAt ? new Date(user.createdAt).toLocaleString() : 'N/A',
    }))
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    isLoading.value = false
  }
}

const deleteUser = async (user) => {
  if (!user.id) {
    console.error('User ID is missing')
    return
  }

  try {
    loading.value = true

    const token = localStorage.getItem('token')

    if (!token) {
      console.error('No authentication token found')
      return
    }

    await axios.delete(`http://localhost:5001/api/auth/${user.id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    // Remove user from local list after successful deletion
    users.value = users.value.filter((u) => u.id !== user.id)

    // Emit event if necessary (only if other parts of the app rely on it)
    emit('delete-user', user)
  } catch (error) {
    console.error('Error deleting user:', error)
  } finally {
    loading.value = false
  }
}

// Fetch users when the component is mounted
onMounted(fetchUsers)

const props = defineProps({
  users: {
    type: Array as PropType<User[]>,
    required: true,
  },
  loading: { type: Boolean, default: false },
  pagination: { type: Object as PropType<Pagination>, required: true },
  sortBy: { type: String as PropType<Sorting['sortBy']>, required: true },
  sortingOrder: { type: String as PropType<Sorting['sortingOrder']>, default: null },
})

const emit = defineEmits<{
  (event: 'edit-user', user: User): void
  (event: 'delete-user', user: User): void
  (event: 'update:sortBy', sortBy: Sorting['sortBy']): void
  (event: 'update:sortingOrder', sortingOrder: Sorting['sortingOrder']): void
}>()

//const users = toRef(props, 'users')
const sortByVModel = useVModel(props, 'sortBy', emit)
const sortingOrderVModel = useVModel(props, 'sortingOrder', emit)

const roleColors: Record<UserRole, string> = {
  admin: 'primary',
  business: 'success',
  freelancer: 'warning',
}

const totalPages = computed(() => Math.ceil(props.pagination.total / props.pagination.perPage))

const { confirm } = useModal()

const onUserDelete = async (user: User) => {
  const agreed = await confirm({
    title: 'Delete user',
    message: `Are you sure you want to delete ${user.fullname}?`,
    okText: 'Delete',
    cancelText: 'Cancel',
    size: 'small',
    maxWidth: '380px',
  })

  if (agreed) {
    deleteUser(user)
    //emit('delete-user', usxxer)
  }
}
</script>

<template>
  <VaDataTable
    v-model:sort-by="sortByVModel"
    v-model:sorting-order="sortingOrderVModel"
    :columns="columns"
    :items="userList"
    :loading="isLoading"
  >
    <template #cell(fullname)="{ rowData }">
      <div class="flex items-center gap-2 max-w-[230px] ellipsis">
        <UserAvatar :user="rowData as User" size="small" />
        {{ rowData.fullname }}
      </div>
    </template>

    <template #cell(username)="{ rowData }">
      <div class="max-w-[120px] ellipsis">
        {{ rowData.username }}
      </div>
    </template>

    <template #cell(email)="{ rowData }">
      <div class="ellipsis max-w-[230px]">
        {{ rowData.email }}
      </div>
    </template>

    <template #cell(role)="{ rowData }">
      <VaBadge :text="rowData.role" :color="roleColors[rowData.role as UserRole]" />
    </template>

    <template #cell(actions)="{ rowData }">
      <div class="flex gap-2 justify-end">
        <!-- <VaButton
          preset="primary"
          size="small"
          icon="mso-edit"
          aria-label="Edit user"
          @click="$emit('edit-user', rowData as User)"
        /> -->
        <VaButton
          preset="primary"
          size="small"
          icon="mso-delete"
          color="danger"
          aria-label="Delete user"
          @click="onUserDelete(rowData as User)"
        />
      </div>
    </template>
  </VaDataTable>

  <div class="flex flex-col-reverse md:flex-row gap-2 justify-between items-center py-2">
    <div>
      <b>{{ $props.pagination.total }} results.</b>
      Results per page
      <VaSelect v-model="$props.pagination.perPage" class="!w-20" :options="[10, 50, 100]" />
    </div>

    <div v-if="totalPages > 1" class="flex">
      <VaButton
        preset="secondary"
        icon="va-arrow-left"
        aria-label="Previous page"
        :disabled="$props.pagination.page === 1"
        @click="$props.pagination.page--"
      />
      <VaButton
        class="mr-2"
        preset="secondary"
        icon="va-arrow-right"
        aria-label="Next page"
        :disabled="$props.pagination.page === totalPages"
        @click="$props.pagination.page++"
      />
      <VaPagination
        v-model="$props.pagination.page"
        buttons-preset="secondary"
        :pages="totalPages"
        :visible-pages="5"
        :boundary-links="false"
        :direction-links="false"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.va-data-table {
  ::v-deep(.va-data-table__table-tr) {
    border-bottom: 1px solid var(--va-background-border);
  }
}
</style>
