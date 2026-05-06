<template>
  <q-page class="flex flex-center">
    <q-card style="width: 100%; max-width: 500px" class="q-pa-md">
      <q-card-section class="text-center">
        <div class="text-h5 q-mt-md">Create Account</div>
        <div class="text-subtitle2 text-grey-6">Register to get started</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleRegister" @reset="resetForm" class="q-gutter-md">
          <q-input
            v-model="formData.username"
            label="Username"
            outlined
            dense
            :rules="[
              (val) => !!val || 'Username is required',
              (val) => val.length >= 3 || 'Minimum 3 characters',
            ]"
            lazy-rules
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            v-model="formData.email"
            label="Email"
            type="email"
            outlined
            dense
            :rules="[
              (val) => !!val || 'Email is required',
              (val) => /.+@.+\..+/.test(val) || 'Invalid email',
            ]"
            lazy-rules
          >
            <template v-slot:prepend>
              <q-icon name="email" />
            </template>
          </q-input>

          <q-input
            v-model="formData.password"
            type="password"
            label="Password"
            outlined
            dense
            :rules="[
              (val) => !!val || 'Password is required',
              (val) => val.length >= 6 || 'Minimum 6 characters',
            ]"
            lazy-rules
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
          </q-input>

          <q-input
            v-model="formData.password2"
            type="password"
            label="Confirm Password"
            outlined
            dense
            :rules="[
              (val) => !!val || 'Please confirm password',
              (val) => val === formData.password || 'Passwords do not match',
            ]"
            lazy-rules
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
          </q-input>

          <q-select
            v-model="formData.role"
            :options="roleOptions"
            label="Role"
            outlined
            dense
            :rules="[(val) => !!val || 'Role is required']"
            lazy-rules
          />

          <div class="row q-mt-md">
            <div class="col">
              <q-btn
                type="submit"
                label="Register"
                color="primary"
                class="full-width"
                :loading="authStore.loading"
              />
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-section class="text-center q-pt-none">
        <div class="text-caption">
          Already have an account?
          <router-link to="/login" class="text-primary">Login here</router-link>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const formData = reactive({
  username: '',
  email: '',
  password: '',
  password2: '',
  role: 'staff',
})

const roleOptions = [
  { label: 'Staff', value: 'staff' },
  { label: 'Admin', value: 'admin' },
]

async function handleRegister() {
  try {
    await authStore.register(formData)
    $q.notify({
      type: 'positive',
      message: 'Registration successful! Please login.',
      position: 'top',
    })
    router.push('/login')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.password?.[0] || 'Registration failed',
      position: 'top',
    })
  }
}

function resetForm() {
  formData.username = ''
  formData.email = ''
  formData.password = ''
  formData.password2 = ''
  formData.role = 'staff'
}
</script>
