<template>
  <VaForm ref="form" @submit.prevent="submit">
    <h1 class="font-semibold text-4xl mb-4">Sign up</h1>
    <p class="text-base mb-4 leading-5">
      Have an account?
      <RouterLink :to="{ name: 'login' }" class="font-semibold text-primary">Login</RouterLink>
    </p>
    <VaInput
      v-model="formData.email"
      :rules="[(v) => !!v || 'Email field is required', (v) => /.+@.+\..+/.test(v) || 'Email should be valid']"
      class="mb-4"
      label="Email"
      type="email"
    />
    <VaInput
      v-model="formData.birthDate"
      :rules="[(v) => !!v || 'Birth date is required']"
      class="mb-4"
      label="Birth Date"
      type="date"
    />
    <VaInput
      v-model:model-value="formData.fullname"
      :rules="[(v) => !!v || 'Full name field is required']"
      class="mb-4"
      label="Full Name"
    />
    <VaInput v-model="formData.phone" :rules="[(v) => !!v || 'Phone field is required']" class="mb-4" label="Phone" />
    <VaValue v-slot="isPasswordVisible" :default-value="false">
      <VaInput
        ref="password1"
        v-model="formData.password"
        :rules="passwordRules"
        :type="isPasswordVisible.value ? 'text' : 'password'"
        class="mb-4"
        label="Password"
        messages="Password should be 8+ characters: letters, numbers, and special characters."
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
      <VaInput
        ref="password2"
        v-model="formData.repeatPassword"
        :rules="[
          (v) => !!v || 'Repeat Password field is required',
          (v) => v === formData.password || 'Passwords don\'t match',
        ]"
        :type="isPasswordVisible.value ? 'text' : 'password'"
        class="mb-4"
        label="Repeat Password"
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

    <div class="flex justify-center mt-4">
      <VaButton class="w-full" @click="submit"> Create account</VaButton>
    </div>
  </VaForm>
</template>

<script lang="ts" setup>
import axios from 'axios'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, useToast } from 'vuestic-ui'

const { validate } = useForm('form')
const { push } = useRouter()
const { init } = useToast()

const formData = reactive({
  email: '',
  password: '',
  repeatPassword: '',
  birthDate: '', // Add birth date field
  fullname: '',
  phone: '',
})

const submit = async () => {
  const isValid = validate()
  if (!isValid) return

  try {
    await axios.post('http://localhost:5001/api/auth/register', {
      email: formData.email,
      password: formData.password,
      date_of_birth: formData.birthDate,
      role: 'admin',
      name: formData.fullname,
      phone: formData.phone,
    })

    init({
      message: 'You have successfully signed up!',
      color: 'success',
    })

    push({ name: 'login' }) // Redirect to dashboard after successful registration
  } catch (error) {
    init({
      message: (error as any)?.response?.data?.message || 'Registration failed. Please try again.',
      color: 'danger',
    })
  }
}

const passwordRules: ((v: string) => boolean | string)[] = [
  (v) => !!v || 'Password field is required',
  (v) => (v && v.length >= 8) || 'Password must be at least 8 characters long',
  (v) => (v && /[A-Za-z]/.test(v)) || 'Password must contain at least one letter',
  (v) => (v && /\d/.test(v)) || 'Password must contain at least one number',
  (v) => (v && /[!@#$%^&*(),.?":{}|<>]/.test(v)) || 'Password must contain at least one special character',
]
</script>
