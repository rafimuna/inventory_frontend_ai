<template>
  <div class="login-container">
    <!-- Background Gradient -->
    <div class="background-gradient"></div>

    <!-- Login Card -->
    <div class="login-wrapper">
      <q-card class="login-card" flat>
        <!-- Logo/Brand Section -->
        <div class="text-center q-pt-xl q-px-lg">
          <div class="logo-wrapper">
            <q-icon name="inventory_2" size="56px" class="text-primary" />
          </div>
          <div class="text-h4 text-weight-bold q-mt-md">
            Inventory<span class="text-primary">Hub</span>
          </div>
          <div class="text-subtitle2 text-grey-6 q-mt-sm">Manage your inventory efficiently</div>
        </div>

        <!-- Login Form -->
        <div class="q-px-lg q-pb-xl q-pt-lg">
          <div class="text-h6 text-weight-medium q-mb-md">Welcome Back 👋</div>

          <q-form @submit="handleLogin" class="q-gutter-md">
            <q-input
              v-model="username"
              label="Username"
              outlined
              dense
              :rules="[(val) => !!val || 'Username is required']"
              class="custom-input"
            >
              <template v-slot:prepend>
                <q-icon name="person_outline" />
              </template>
            </q-input>

            <q-input
              v-model="password"
              type="password"
              label="Password"
              outlined
              dense
              :rules="[(val) => !!val || 'Password is required']"
              class="custom-input"
            >
              <template v-slot:prepend>
                <q-icon name="lock_outline" />
              </template>
            </q-input>

            <div class="text-right q-mb-md">
              <q-btn flat dense label="Forgot Password?" class="text-caption" />
            </div>

            <q-btn
              type="submit"
              label="Sign In"
              color="primary"
              class="full-width q-py-sm"
              :loading="authStore.loading"
              size="lg"
            />
          </q-form>

          <!-- Divider -->
          <div class="divider q-my-md">
            <span class="divider-text">or</span>
          </div>

          <!-- Register Link -->
          <div class="text-center">
            <span class="text-grey-7">Don't have an account? </span>
            <q-btn
              flat
              label="Create Account"
              color="primary"
              to="/register"
              class="text-weight-bold"
            />
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    $q.notify({ type: 'warning', message: 'Please fill all fields', position: 'top' })
    return
  }

  try {
    await authStore.login(username.value, password.value)
    $q.notify({ type: 'positive', message: 'Welcome back!', position: 'top' })
    router.push('/dashboard')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.error || 'Invalid credentials',
      position: 'top',
    })
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
}

.login-wrapper {
  width: 100%;
  max-width: 450px;
  z-index: 1;
  animation: fadeInUp 0.6s ease-out;
}

.login-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.logo-wrapper {
  display: inline-block;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
}

.custom-input :deep(.q-field__control) {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.custom-input :deep(.q-field__control:hover) {
  transform: translateY(-2px);
}

.divider {
  position: relative;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  height: 1px;
  background: #e0e0e0;
}

.divider-text {
  position: relative;
  background: white;
  padding: 0 10px;
  color: #999;
  font-size: 12px;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
