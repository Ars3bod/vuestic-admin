<template>
  <VaForm ref="form" @submit.prevent="submit">
    <h1 class="font-semibold text-4xl mb-4">Log in</h1>
    <p class="text-base mb-4 leading-5">
      New to Experience Edge Admin?
      <RouterLink :to="{ name: 'signup' }" class="font-semibold text-primary">Sign up</RouterLink>
    </p>

    <VaInput
      v-model="formData.email"
      :rules="[validators.required, validators.email]"
      class="mb-4"
      label="Email"
      type="email"
    />

    <VaValue v-slot="isPasswordVisible" :default-value="false">
      <VaInput
        v-model="formData.password"
        :rules="[validators.required]"
        :type="isPasswordVisible.value ? 'text' : 'password'"
        class="mb-4"
        label="Password"
        @clickAppendInner.stop="isPasswordVisible.value = !isPasswordVisible.value"
      >
        <template #appendInner>
          <VaIcon
            :name="isPasswordVisible.value ? 'mso-visibility_off' : 'mso-visibility'"
            class="cursor-pointer"
            color="secondary"
          />
        </template>
      </VaInput>
    </VaValue>

    <div class="auth-layout__options flex flex-col sm:flex-row items-start sm:items-center justify-between">
      <VaCheckbox v-model="formData.keepLoggedIn" class="mb-2 sm:mb-0" label="Keep me signed in on this device" />
      <RouterLink :to="{ name: 'recover-password' }" class="mt-2 sm:mt-0 sm:ml-1 font-semibold text-primary">
        Forgot password?
      </RouterLink>
    </div>

    <div class="flex justify-center mt-4">
      <VaButton class="w-full" :disabled="loading" @click="submit">
        {{ loading ? 'Logging in...' : 'Login' }}
      </VaButton>
    </div>

    <p v-if="errorMessage" class="text-red-500 mt-2">{{ errorMessage }}</p>
  </VaForm>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'
import { validators } from '../../services/utils'
import axios from 'axios'
import { useAuthStore } from '../../stores/auth'
import { useUserStore } from '../../stores/user-store'

const userStore = useUserStore()

const { validate } = useForm('form')
const { push } = useRouter()
const { init } = useToast()
const authStore = useAuthStore()

const formData = reactive({
  email: '',
  password: '',
  keepLoggedIn: false,
})

const loading = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      await axios.post('/api/logout') // Call logout API
    } catch (error) {
      console.error('Logout failed:', error)
    }

    authStore.logout() // Clear auth state
  }
})

const submit = async () => {
  if (!validate()) return

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.post('http://localhost:5001/api/auth/login', {
      email: formData.email,
      password: formData.password,
    })

    const { token, user } = response.data

    // Save authentication details in Pinia store
    authStore.setAuth(token, user)
    if (response.data.user) {
      userStore.setUser(response.data.user)
    }

    // Show success message
    init({ message: "You've successfully logged in", color: 'success' })

    // Redirect to dashboard
    push({ name: 'dashboard' })
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>
