<template>
  <q-page padding>
    <div class="text-h4 q-mb-md">Demand Forecast</div>

    <!-- Product Selector -->
    <q-select
      v-model="selectedProduct"
      :options="productOptions"
      label="Select Product"
      outlined
      dense
      class="q-mb-md"
      emit-value
      map-options
      :loading="productStore.loading"
      @update:model-value="loadForecast"
    />

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-dots color="primary" size="3rem" />
      <div class="q-ml-md">Generating forecast...</div>
    </div>

    <!-- Forecast Chart -->
    <div
      v-else-if="forecastData && forecastData.forecast && forecastData.forecast.length > 0"
      class="q-mt-md"
    >
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ forecastData.product_name }}</div>
          <div class="text-caption text-grey-6">Next 30 days demand prediction</div>
        </q-card-section>

        <q-card-section>
          <div id="chart">
            <apexchart
              v-if="series.length > 0"
              type="line"
              height="350"
              :options="chartOptions"
              :series="series"
            />
            <div v-else class="text-center text-grey-6">No chart data available</div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Summary Table -->
      <q-card class="q-mt-md">
        <q-card-section>
          <div class="text-h6">Forecast Details</div>
        </q-card-section>
        <q-card-section>
          <q-table
            :rows="forecastTable"
            :columns="tableColumns"
            row-key="date"
            flat
            dense
            :loading="loading"
          >
            <template v-slot:no-data>
              <div class="text-center q-pa-md">No forecast data available</div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- No Data State -->
    <div
      v-else-if="!loading && selectedProduct && (!forecastData || forecastData.error)"
      class="text-center q-pa-xl"
    >
      <q-icon name="trending_down" size="4rem" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">Unable to generate forecast</div>
      <div class="text-caption text-grey-5">
        {{ forecastData?.error || 'Not enough sales data for this product' }}
      </div>
      <div class="q-mt-md text-caption text-grey-6">
        Make sure you have at least 7 days of sales data (StockLogs with reason='sale')
      </div>
    </div>

    <!-- Initial State -->
    <div v-else-if="!loading && !selectedProduct" class="text-center q-pa-xl">
      <q-icon name="show_chart" size="4rem" color="grey-4" />
      <div class="text-h6 text-grey-6 q-mt-md">Select a product to see forecast</div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'
import { useProductStore } from 'src/stores/productStore'

const $q = useQuasar()
const productStore = useProductStore()

const selectedProduct = ref(null)
const forecastData = ref(null)
const loading = ref(false)

const productOptions = computed(() =>
  productStore.products.map((p) => ({
    label: `${p.name} (SKU: ${p.sku})`,
    value: p.id,
  })),
)

// Chart options
const chartOptions = {
  chart: {
    type: 'line',
    zoom: { enabled: true },
    toolbar: { show: true },
    height: 350,
  },
  stroke: { curve: 'smooth', width: 2 },
  title: { text: 'Demand Forecast', align: 'left' },
  xaxis: {
    type: 'datetime',
    title: { text: 'Date' },
    labels: { datetimeUTC: false },
  },
  yaxis: {
    title: { text: 'Units Sold' },
    min: 0,
  },
  colors: ['#008FFB', '#00E396', '#FF4560'],
  tooltip: {
    x: { format: 'dd MMM yyyy' },
    y: { formatter: (val) => `${Math.round(val)} units` },
  },
  legend: { position: 'top' },
}

// Series for chart
const series = computed(() => {
  if (
    !forecastData.value ||
    !forecastData.value.forecast ||
    forecastData.value.forecast.length === 0
  ) {
    return []
  }

  const forecast = forecastData.value.forecast

  return [
    {
      name: 'Predicted Demand',
      data: forecast.map((f) => [new Date(f.ds).getTime(), f.yhat || 0]),
    },
    {
      name: 'Upper Bound',
      data: forecast.map((f) => [new Date(f.ds).getTime(), f.yhat_upper || f.yhat + 5]),
    },
    {
      name: 'Lower Bound',
      data: forecast.map((f) => [
        new Date(f.ds).getTime(),
        Math.max(0, f.yhat_lower || f.yhat - 5),
      ]),
    },
  ]
})

// Table data
const forecastTable = computed(() => {
  if (!forecastData.value || !forecastData.value.forecast) return []

  return forecastData.value.forecast.map((f) => ({
    date: formatDate(f.ds),
    predicted: Math.round(f.yhat || 0),
    min: Math.round(f.yhat_lower || f.yhat - 5 || 0),
    max: Math.round(f.yhat_upper || f.yhat + 5 || 0),
  }))
})

const tableColumns = [
  { name: 'date', label: 'Date', field: 'date', align: 'left' },
  { name: 'predicted', label: 'Predicted Demand', field: 'predicted', align: 'center' },
  { name: 'min', label: 'Min Expected', field: 'min', align: 'center' },
  { name: 'max', label: 'Max Expected', field: 'max', align: 'center' },
]

function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

async function loadForecast() {
  if (!selectedProduct.value) return

  loading.value = true
  forecastData.value = null

  try {
    const response = await api.get(`/inventory/forecast/${selectedProduct.value}/`)
    forecastData.value = response.data

    if (response.data.error) {
      $q.notify({
        type: 'warning',
        message: response.data.error,
        position: 'top',
        timeout: 5000,
      })
    } else {
      $q.notify({
        type: 'positive',
        message: `Forecast generated for ${response.data.product_name}`,
        position: 'top',
        timeout: 3000,
      })
    }
  } catch (error) {
    console.error('Forecast error:', error)
    forecastData.value = {
      error: error.response?.data?.error || 'Failed to generate forecast',
    }
    $q.notify({
      type: 'negative',
      message: error.response?.data?.error || 'Failed to load forecast',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  productStore.fetchProducts()
})
</script>

<style scoped>
:deep(.apexcharts-tooltip) {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
