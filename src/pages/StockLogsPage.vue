<template>
  <q-page padding>
    <!-- Header -->
    <div class="row q-mb-md">
      <div class="col">
        <div class="text-h4">Stock History</div>
        <div class="text-subtitle2 text-grey-6">Track all inventory movements</div>
      </div>
      <div class="col-auto">
        <q-btn
          :icon="stockStore.loading ? 'autorenew' : 'refresh'"
          :loading="stockStore.loading"
          flat
          round
          @click="refreshLogs"
        >
          <q-tooltip>Refresh</q-tooltip>
        </q-btn>
      </div>
    </div>

    <!-- Filters -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-4">
        <q-input
          v-model="filterProduct"
          label="Filter by Product Name"
          outlined
          dense
          clearable
          @update:model-value="applyFilter"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div class="col-12 col-md-3">
        <q-select
          v-model="filterReason"
          :options="reasonOptions"
          label="Filter by Reason"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="applyFilter"
        />
      </div>

      <div class="col-12 col-md-3">
        <q-input
          v-model="dateFrom"
          label="Date From"
          outlined
          dense
          type="date"
          clearable
          @update:model-value="applyDateFilter"
        />
      </div>

      <div class="col-12 col-md-2">
        <q-input
          v-model="dateTo"
          label="Date To"
          outlined
          dense
          type="date"
          clearable
          @update:model-value="applyDateFilter"
        />
      </div>
    </div>

    <div class="row q-mb-md">
      <div class="col-12">
        <q-btn label="Reset Filters" color="grey-7" outline @click="resetFilters" />
      </div>
    </div>

    <!-- Stock Logs Table -->
    <q-table
      :rows="filteredLogs"
      :columns="columns"
      row-key="id"
      :loading="stockStore.loading"
      :pagination="pagination"
      @request="onTableRequest"
      flat
      bordered
    >
      <!-- Custom Quantity Change Column -->
      <template v-slot:body-cell-quantity_change="props">
        <q-td>
          <q-badge :color="props.row.quantity_change > 0 ? 'positive' : 'negative'" class="q-pa-sm">
            <q-icon :name="props.row.quantity_change > 0 ? 'add' : 'remove'" size="sm" />
            {{ Math.abs(props.row.quantity_change) }}
          </q-badge>
        </q-td>
      </template>

      <!-- Custom Reason Column -->
      <template v-slot:body-cell-reason="props">
        <q-td>
          <q-chip :color="getReasonColor(props.row.reason)" text-color="white" size="sm">
            {{ formatReason(props.row.reason) }}
          </q-chip>
        </q-td>
      </template>

      <!-- Custom Timestamp Column -->
      <template v-slot:body-cell-timestamp="props">
        <q-td>
          <div>{{ formatDate(props.row.timestamp) }}</div>
          <div class="text-caption text-grey-6">{{ formatTime(props.row.timestamp) }}</div>
        </q-td>
      </template>

      <!-- Custom Product Column -->
      <template v-slot:body-cell-product_detail="props">
        <q-td>
          <div class="text-weight-bold">{{ props.row.product_detail?.name }}</div>
          <div class="text-caption text-grey-6">SKU: {{ props.row.product_detail?.sku }}</div>
        </q-td>
      </template>

      <!-- No Data -->
      <template v-slot:no-data>
        <div class="text-center q-pa-md">
          <q-icon name="history" size="3rem" color="grey" />
          <div class="text-h6 text-grey-6">No stock movements found</div>
          <div class="text-caption text-grey-5">Adjust stock from Products page to see logs</div>
        </div>
      </template>
    </q-table>

    <!-- Summary Card -->
    <q-card class="q-mt-md" flat bordered>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3 text-center">
            <div class="text-caption text-grey-6">Total Movements</div>
            <div class="text-h5">{{ filteredLogs.length }}</div>
          </div>
          <div class="col-12 col-md-3 text-center">
            <div class="text-caption text-grey-6">Total Increases</div>
            <div class="text-h5 text-positive">{{ totalIncreases }}</div>
          </div>
          <div class="col-12 col-md-3 text-center">
            <div class="text-caption text-grey-6">Total Decreases</div>
            <div class="text-h5 text-negative">{{ totalDecreases }}</div>
          </div>
          <div class="col-12 col-md-3 text-center">
            <div class="text-caption text-grey-6">Net Change</div>
            <div class="text-h5" :class="netChange >= 0 ? 'text-positive' : 'text-negative'">
              {{ netChange >= 0 ? '+' : '' }}{{ netChange }}
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStockStore } from 'src/stores/stockStore'

const stockStore = useStockStore()

// Filter states
const filterProduct = ref('')
const filterReason = ref(null)
const dateFrom = ref('')
const dateTo = ref('')

// Table columns
const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'product_detail', label: 'Product', field: 'product_detail', align: 'left' },
  {
    name: 'quantity_change',
    label: 'Change',
    field: 'quantity_change',
    align: 'center',
    sortable: true,
  },
  { name: 'reason', label: 'Reason', field: 'reason', align: 'center' },
  { name: 'created_by_username', label: 'User', field: 'created_by_username', align: 'left' },
  { name: 'timestamp', label: 'Date & Time', field: 'timestamp', align: 'left', sortable: true },
]

const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })
const reasonOptions = [
  { label: 'Purchase', value: 'purchase' },
  { label: 'Sale', value: 'sale' },
  { label: 'Adjustment', value: 'adjustment' },
  { label: 'Return', value: 'return' },
]

// Computed - Filtered logs
const filteredLogs = computed(() => {
  let logs = [...stockStore.logs]

  // Filter by product name
  if (filterProduct.value) {
    logs = logs.filter(
      (log) =>
        log.product_detail?.name?.toLowerCase().includes(filterProduct.value.toLowerCase()) ||
        log.product_detail?.sku?.toLowerCase().includes(filterProduct.value.toLowerCase()),
    )
  }

  // Filter by reason
  if (filterReason.value) {
    logs = logs.filter((log) => log.reason === filterReason.value)
  }

  // Filter by date range
  if (dateFrom.value) {
    logs = logs.filter((log) => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0]
      if (dateFrom.value && dateTo.value) {
        return logDate >= dateFrom.value && logDate <= dateTo.value
      } else if (dateFrom.value && !dateTo.value) {
        return logDate === dateFrom.value
      }
      return true
    })
  }

  return logs
})

// Computed - Statistics
const totalIncreases = computed(() =>
  filteredLogs.value
    .filter((log) => log.quantity_change > 0)
    .reduce((sum, log) => sum + log.quantity_change, 0),
)

const totalDecreases = computed(() =>
  Math.abs(
    filteredLogs.value
      .filter((log) => log.quantity_change < 0)
      .reduce((sum, log) => sum + log.quantity_change, 0),
  ),
)

const netChange = computed(() => totalIncreases.value - totalDecreases.value)

// Helper functions
function formatReason(reason) {
  const reasons = {
    purchase: 'Purchase',
    sale: 'Sale',
    adjustment: 'Adjustment',
    return: 'Return',
  }
  return reasons[reason] || reason
}

function getReasonColor(reason) {
  const colors = {
    purchase: 'positive',
    sale: 'negative',
    adjustment: 'info',
    return: 'warning',
  }
  return colors[reason] || 'grey'
}

function formatDate(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleDateString('bn-BD', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(timestamp) {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Table request handler
function onTableRequest(props) {
  pagination.value = props.pagination
  stockStore.currentPage = props.pagination.page
  stockStore.fetchLogs()
}

// Filter handlers
function applyFilter() {
  // Apply filters (client-side only)
  pagination.value.page = 1
}

function applyDateFilter() {
  applyFilter()
}

function resetFilters() {
  filterProduct.value = ''
  filterReason.value = null
  dateFrom.value = ''
  dateTo.value = ''
  pagination.value.page = 1
}

function refreshLogs() {
  stockStore.fetchLogs()
}

// Load logs on mount
onMounted(() => {
  stockStore.fetchLogs()
})
</script>
