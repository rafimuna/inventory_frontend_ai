<template>
  <q-layout view="hHh Lpr lFf">
    <!-- 🔝 HEADER -->
    <q-header class="bg-positive text-white">
      <q-toolbar>
        <!-- Menu -->
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />

        <!-- Title -->
        <q-toolbar-title class="text-weight-bold"> 📦 Inventory System </q-toolbar-title>

        <!-- User Info -->
        <div class="row items-center q-gutter-sm">
          <span class="text-subtitle2">Admin</span>

          <!-- Logout -->
          <q-btn
            flat
            dense
            icon="logout"
            label="Logout"
            color="white"
            class="q-ml-md"
            @click="handleLogout"
          />
        </div>
      </q-toolbar>
    </q-header>

    <!-- 📂 DRAWER -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :mini="miniState"
      @mouseenter="miniState = false"
      @mouseleave="miniState = true"
      class="bg-grey-1"
    >
      <!-- Logo -->
      <div class="q-pa-md text-center text-weight-bold">
        <q-icon name="inventory_2" size="28px" />
        <div v-if="!miniState">Inventory</div>
      </div>

      <q-separator />

      <!-- Navigation -->
      <q-list padding>
        <q-item-label header v-if="!miniState"> Main </q-item-label>

        <q-item
          clickable
          v-ripple
          :to="{ name: 'dashboard' }"
          exact
          active-class="bg-primary text-white"
        >
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section v-if="!miniState"> Dashboard </q-item-section>
        </q-item>

        <q-item clickable v-ripple :to="{ name: 'products' }" active-class="bg-primary text-white">
          <q-item-section avatar>
            <q-icon name="inventory" />
          </q-item-section>
          <q-item-section v-if="!miniState"> Products </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :to="{ name: 'categories' }"
          active-class="bg-primary text-white"
        >
          <q-item-section avatar>
            <q-icon name="category" />
          </q-item-section>
          <q-item-section v-if="!miniState"> Categories </q-item-section>
        </q-item>

        <q-item
          clickable
          v-ripple
          :to="{ name: 'stock-logs' }"
          active-class="bg-primary text-white"
        >
          <q-item-section avatar>
            <q-icon name="history" />
          </q-item-section>
          <q-item-section v-if="!miniState"> Stock History </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/forecast">
          <q-item-section avatar><q-icon name="trending_up" /></q-item-section>
          <q-item-section>Demand Forecast</q-item-section>
        </q-item>
      </q-list>

      <!-- Footer -->
      <div class="absolute-bottom text-center q-pa-sm text-caption">
        <span v-if="!miniState">v1.0.0</span>
      </div>
    </q-drawer>

    <!-- 📄 PAGE -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const leftDrawerOpen = ref(true)
const miniState = ref(true)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function handleLogout() {
  $q.dialog({
    title: 'Logout',
    message: 'Do you really want to logout?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    authStore.logout()
    $q.notify({
      type: 'positive',
      message: 'Logged out successfully',
    })
    router.push('/login')
  })
}
</script>
