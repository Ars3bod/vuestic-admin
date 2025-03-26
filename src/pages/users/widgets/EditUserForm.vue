<script setup lang="ts">
import { PropType, computed, ref, watch } from 'vue'
import { useForm } from 'vuestic-ui'
import { User, UserRole } from '../types'
import UserAvatar from './UserAvatar.vue'
import { validators } from '../../../services/utils'

const props = defineProps({
  user: {
    type: Object as PropType<User | null>,
    default: null,
  },
  saveButtonLabel: {
    type: String,
    default: 'Save',
  },
})

const defaultNewUser: Omit<User, 'id'> = {
  avatar: '',
  fullname: '',
  role: 'admin',
  username: '',
  date_of_birth: '',
  notes: '',
  email: '',
  active: true,
  password: '',
  phone: '',
  category: '',
  joining_date: '',
  update_date: '',
  projects: [],
}

const newUser = ref<User>({ ...defaultNewUser } as User)

const isFormHasUnsavedChanges = computed(() => {
  return Object.keys(newUser.value).some((key) => {
    if (key === 'avatar' || key === 'projects') {
      return false
    }

    return (
      newUser.value[key as keyof Omit<User, 'id'>] !== (props.user ?? defaultNewUser)?.[key as keyof Omit<User, 'id'>]
    )
  })
})

defineExpose({
  isFormHasUnsavedChanges,
})

// const { projects } = useProjects({ pagination: ref({ page: 1, perPage: 9999, total: 10 }) })

// watch(
//   [() => props.user, projects],
//   () => {
//     if (!props.user) {
//       return
//     }

//     newUser.value = {
//       ...props.user,
//       projects: props.user.projects.filter((projectId) => projects.value.find(({ id }) => id === projectId)),
//       avatar: props.user.avatar || '',
//     }
//   },
//   { immediate: true },
// )

const avatar = ref<File>()

const makeAvatarBlobUrl = (avatar: File) => {
  return URL.createObjectURL(avatar)
}

watch(avatar, (newAvatar) => {
  newUser.value.avatar = newAvatar ? makeAvatarBlobUrl(newAvatar) : ''
})

const form = useForm('add-user-form')

const emit = defineEmits(['close', 'save'])

const onSave = () => {
  if (form.validate()) {
    emit('save', newUser.value)
  }
}

const roleSelectOptions: { text: Capitalize<Lowercase<UserRole>>; value: UserRole }[] = [
  { text: 'Admin', value: 'admin' },
  { text: 'Business', value: 'business' },
  { text: 'Freelancer', value: 'freelancer' },
]
</script>

<template>
  <VaForm v-slot="{ isValid }" ref="add-user-form" class="flex-col justify-start items-start gap-4 inline-flex w-full">
    <UserAvatar :user="newUser" size="large" />

    <div class="self-stretch flex-col justify-start items-start gap-4 flex">
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newUser.fullname"
          label="Full name"
          class="w-full sm:w-full"
          :rules="[validators.required]"
          name="fullName"
        />
      </div>
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput
          v-model="newUser.email"
          label="Email"
          class="w-full sm:w-1/2"
          :rules="[validators.required, validators.email]"
          name="email"
        />
        <VaSelect
          v-model="newUser.role"
          label="Role"
          class="w-full sm:w-1/2"
          :options="roleSelectOptions"
          :rules="[validators.required]"
          name="role"
          value-by="value"
        />
      </div>
      <div class="flex gap-4 flex-col sm:flex-row w-full">
        <VaInput v-model="newUser.phone" label="Phone" class="w-full sm:w-1/2" name="phone" />
        <VaInput
          v-model="newUser.date_of_birth"
          label="Date of birth"
          class="w-full sm:w-1/2"
          :rules="[validators.required]"
          type="date"
          name="date_of_birth"
        />
      </div>
      <div class="flex gap-2 flex-col-reverse items-stretch justify-end w-full sm:flex-row sm:items-center">
        <VaButton preset="secondary" color="secondary" @click="$emit('close')">Cancel</VaButton>
        <VaButton :disabled="!isValid" @click="onSave">{{ saveButtonLabel }}</VaButton>
      </div>
    </div>
  </VaForm>
</template>
