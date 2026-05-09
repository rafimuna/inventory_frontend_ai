<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">📋 Orders</div>

    <!-- ফিল্টার -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-3">
        <q-input
          v-model="filters.orderNumber"
          label="Order Number"
          outlined
          dense
          clearable
          @update:model-value="loadOrders"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-select
          v-model="filters.status"
          :options="statusOptions"
          label="Status"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="loadOrders"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-input
          v-model="filters.date"
          type="date"
          label="Date"
          outlined
          dense
          clearable
          @update:model-value="loadOrders"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-btn label="Refresh" color="primary" @click="loadOrders" :loading="posStore.loading" />
      </div>
    </div>

    <!-- অর্ডার টেবিল -->
    <q-table
      :rows="posStore.orders"
      :columns="columns"
      row-key="id"
      :loading="posStore.loading"
      flat
      bordered
    >
      <template v-slot:body-cell-status="props">
        <q-td>
          <q-badge :color="getStatusColor(props.row.status)">
            {{ props.row.status }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td>
          <q-btn dense flat icon="visibility" color="info" @click="viewOrder(props.row)" />
        </q-td>
      </template>
    </q-table>

    <!-- অর্ডার ডিটেইল ডায়ালগ -->
    <q-dialog v-model="detailDialog" maximized>
      <q-card>
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">Order Details</div>
          <div class="text-subtitle2">{{ selectedOrder?.order_number }}</div>
        </q-card-section>

        <q-card-section>
          <div class="row">
            <div class="col-6"><strong>Cashier:</strong> {{ selectedOrder?.cashier_name }}</div>
            <div class="col-6">
              <strong>Date:</strong> {{ formatDate(selectedOrder?.order_date) }}
            </div>
          </div>
        </q-card-section>

        <q-card-section>
          <q-table :rows="selectedOrder?.items || []" :columns="detailColumns" dense flat />
        </q-card-section>

        <q-card-section>
          <div class="row text-right">
            <div class="col-6 offset-6">
              <div class="row">
                <div class="col-6">Subtotal:</div>
                <div class="col-6">৳{{ formatNumber(selectedOrder?.total_amount) }}</div>
              </div>
              <div class="row">
                <div class="col-6">Discount:</div>
                <div class="col-6 text-negative">
                  - ৳{{ formatNumber(selectedOrder?.discount) }}
                </div>
              </div>
              <div class="row">
                <div class="col-6">Tax:</div>
                <div class="col-6">+ ৳{{ formatNumber(selectedOrder?.tax) }}</div>
              </div>
              <div class="row text-h6 q-mt-md">
                <div class="col-6">Grand Total:</div>
                <div class="col-6 text-primary">
                  ৳{{ formatNumber(selectedOrder?.grand_total) }}
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
          <q-btn
            v-if="selectedOrder?.status === 'pending'"
            label="Complete"
            color="positive"
            @click="updateStatus('completed')"
          />
          <q-btn
            v-if="selectedOrder?.status === 'pending'"
            label="Cancel"
            color="negative"
            @click="updateStatus('cancelled')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { usePosStore } from 'src/stores/posStore'
import { posService } from 'src/services/posService'

const $q = useQuasar()
const posStore = usePosStore()

const filters = reactive({
  orderNumber: '',
  status: null,
  date: '',
})

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Refunded', value: 'refunded' },
]

const columns = [
  { name: 'order_number', label: 'Order #', field: 'order_number', align: 'left' },
  { name: 'cashier_name', label: 'Cashier', field: 'cashier_name', align: 'left' },
  { name: 'order_date', label: 'Date', field: 'order_date', align: 'left' },
  { name: 'grand_total', label: 'Total', field: 'grand_total', align: 'right' },
  { name: 'payment_method_name', label: 'Payment', field: 'payment_method_name', align: 'center' },
  { name: 'status', label: 'Status', field: 'status', align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
]

const detailColumns = [
  {
    name: 'product',
    label: 'Product',
    field: (row) => row.product_detail?.name || row.product_name,
  },
  { name: 'quantity', label: 'Qty', field: 'quantity', align: 'center' },
  { name: 'price', label: 'Price', field: 'price', align: 'right' },
  { name: 'total', label: 'Total', field: 'total', align: 'right' },
]

const detailDialog = ref(false)
const selectedOrder = ref(null)

function formatNumber(value) {
  return new Intl.NumberFormat('bn-BD').format(value || 0)
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString()
}

function getStatusColor(status) {
  const colors = {
    pending: 'warning',
    completed: 'positive',
    cancelled: 'negative',
    refunded: 'info',
  }
  return colors[status] || 'grey'
}

async function loadOrders() {
  const params = {}
  if (filters.orderNumber) params.search = filters.orderNumber
  if (filters.status) params.status = filters.status
  if (filters.date) params.date = filters.date
  await posStore.fetchOrders(params)
}

function viewOrder(order) {
  selectedOrder.value = order
  detailDialog.value = true
}

async function updateStatus(newStatus) {
  try {
    await posService.updateOrderStatus(selectedOrder.value.id, newStatus)
    $q.notify({ type: 'positive', message: `Order ${newStatus}!` })
    detailDialog.value = false
    await loadOrders()
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to update status' })
  }
}

onMounted(() => {
  loadOrders()
})
</script>
