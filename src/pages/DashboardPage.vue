<template>
  <q-page padding class="dashboard-page">
    <!-- Animated Background -->
    <div class="animated-bg"></div>

    <!-- Hero Section -->
    <div class="hero-section q-mb-xl">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="greeting-container">
            <div class="wave-emoji">👋</div>
            <div>
              <div class="text-h4 text-weight-bold text-grey-9">
                Welcome back, {{ authStore.userName || 'Admin' }}
              </div>
              <div class="text-subtitle1 text-grey-6 q-mt-xs">
                Here's what's happening with your inventory today
              </div>
            </div>
          </div>
        </div>

        <div class="col-auto">
          <div class="date-badge">
            <q-icon name="calendar_today" size="sm" class="q-mr-xs" />
            {{ formattedDate }}
          </div>
        </div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 col-sm-6 col-md-3">
        <div class="kpi-card gradient-purple">
          <div class="kpi-icon">
            <q-icon name="inventory_2" size="2rem" />
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Total Products</div>
            <div class="kpi-value">{{ stats.total_products || 0 }}</div>
            <div class="kpi-trend positive">
              <q-icon name="trending_up" size="xs" />
              <span>Available products</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="kpi-card gradient-orange">
          <div class="kpi-icon">
            <q-icon name="warning" size="2rem" />
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Low Stock Alert</div>
            <div class="kpi-value">{{ stats.low_stock_products || 0 }}</div>
            <div class="kpi-trend warning">
              <q-icon name="priority_high" size="xs" />
              <span>Needs attention</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="kpi-card gradient-teal">
          <div class="kpi-icon">
            <q-icon name="account_balance" size="2rem" />
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Stock Value</div>
            <div class="kpi-value">{{ stats.total_value || '৳0' }}</div>
            <div class="kpi-trend">
              <q-icon name="attach_money" size="xs" />
              <span>Current inventory value</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <div class="kpi-card gradient-pink">
          <div class="kpi-icon">
            <q-icon name="category" size="2rem" />
          </div>
          <div class="kpi-content">
            <div class="kpi-label">Categories</div>
            <div class="kpi-value">{{ categoryStore.totalCount || 0 }}</div>
            <div class="kpi-trend">
              <q-icon name="folder" size="xs" />
              <span>Organized products</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="row q-col-gutter-xl q-mb-xl">
      <!-- Chart Section -->
      <div class="col-12 col-md-7">
        <div class="glass-card">
          <div class="card-header">
            <div>
              <div class="text-h6 text-weight-bold">Stock Trend Analysis</div>
              <div class="text-caption text-grey-6">Stock level over time</div>
            </div>
            <div class="range-selector">
              <div class="row q-gutter-xs">
                <q-btn
                  :color="selectedRange === '7' ? 'primary' : 'grey-5'"
                  :flat="selectedRange !== '7'"
                  dense
                  rounded
                  no-caps
                  label="7D"
                  @click="selectedRange = '7'"
                />
                <q-btn
                  :color="selectedRange === '30' ? 'primary' : 'grey-5'"
                  :flat="selectedRange !== '30'"
                  dense
                  rounded
                  no-caps
                  label="30D"
                  @click="selectedRange = '30'"
                />
                <q-btn
                  :color="selectedRange === '90' ? 'primary' : 'grey-5'"
                  :flat="selectedRange !== '90'"
                  dense
                  rounded
                  no-caps
                  label="90D"
                  @click="selectedRange = '90'"
                />
              </div>
            </div>
          </div>

          <div class="chart-container">
            <apexchart
              v-if="chartSeries.length > 0"
              height="350"
              type="area"
              :options="chartOptions"
              :series="chartSeries"
            />
            <div v-else class="text-center q-pa-xl text-grey-6">
              <q-icon name="show_chart" size="3rem" />
              <div class="q-mt-sm">No chart data available</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="col-12 col-md-5">
        <div class="glass-card">
          <div class="card-header">
            <div>
              <div class="text-h6 text-weight-bold">Quick Actions</div>
              <div class="text-caption text-grey-6">Frequently used operations</div>
            </div>
          </div>

          <div class="actions-grid">
            <div class="action-item" @click="$router.push('/products')">
              <div class="action-icon gradient-purple-light">
                <q-icon name="add_shopping_cart" size="1.75rem" />
              </div>
              <div class="action-title">Add Product</div>
              <div class="action-desc">Create new product entry</div>
            </div>

            <div class="action-item" @click="$router.push('/categories')">
              <div class="action-icon gradient-orange-light">
                <q-icon name="category" size="1.75rem" />
              </div>
              <div class="action-title">Categories</div>
              <div class="action-desc">Manage product categories</div>
            </div>

            <div class="action-item" @click="$router.push('/stock-logs')">
              <div class="action-icon gradient-teal-light">
                <q-icon name="history" size="1.75rem" />
              </div>
              <div class="action-title">Stock History</div>
              <div class="action-desc">View all transactions</div>
            </div>

            <div class="action-item" @click="exportReport">
              <div class="action-icon gradient-pink-light">
                <q-icon name="file_download" size="1.75rem" />
              </div>
              <div class="action-title">Export Report</div>
              <div class="action-desc">Download inventory data</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="glass-card">
      <div class="card-header">
        <div>
          <div class="text-h6 text-weight-bold">Recent Activities</div>
          <div class="text-caption text-grey-6">Latest stock movements</div>
        </div>
        <q-btn flat color="primary" label="View All" to="/stock-logs" no-caps />
      </div>

      <div class="activities-list">
        <div v-for="(activity, idx) in recentActivities" :key="idx" class="activity-item">
          <div class="activity-avatar">
            <q-avatar
              :color="activity.change > 0 ? '#10b981' : '#ef4444'"
              text-color="white"
              size="40px"
            >
              <q-icon :name="activity.change > 0 ? 'add' : 'remove'" size="1rem" />
            </q-avatar>
            <div
              class="activity-badge"
              :class="activity.change > 0 ? 'bg-positive' : 'bg-negative'"
            >
              {{ activity.change > 0 ? '+' : '' }}{{ Math.abs(activity.change) }}
            </div>
          </div>

          <div class="activity-details">
            <div class="activity-name">{{ activity.product }}</div>
            <div class="activity-meta">
              <span class="reason">{{ activity.reason }}</span>
              <span class="dot">•</span>
              <span class="time">{{ formatTimeAgo(activity.timestamp) }}</span>
            </div>
          </div>
        </div>

        <div v-if="!recentActivities.length" class="empty-state">
          <q-icon name="inbox" size="3rem" class="text-grey-4" />
          <div class="text-grey-6 q-mt-sm">No recent activities found</div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <q-inner-loading :showing="dashboardStore.loading" class="custom-loading" />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useDashboardStore } from 'src/stores/dashboardStore'
import { useCategoryStore } from 'src/stores/categoryStore'
import { useAuthStore } from 'src/stores/authStore'

const $q = useQuasar()
const dashboardStore = useDashboardStore()
const categoryStore = useCategoryStore()
const authStore = useAuthStore()

// State
const selectedRange = ref('30')

// Computed
const formattedDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const stats = computed(() => dashboardStore.stats || {})

// Chart configuration
const chartSeries = computed(() => [
  {
    name: 'Stock Level',
    data: dashboardStore.stats.stock_trend || [45, 52, 38, 45, 49, 60, 55],
  },
])

const chartOptions = {
  chart: {
    type: 'area',
    height: 350,
    toolbar: { show: false },
    animations: { enabled: true, easing: 'easeinout', speed: 800 },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2, colors: ['#6366f1'] },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.3,
      stops: [0, 90, 100],
    },
  },
  xaxis: {
    categories: dashboardStore.stats.trend_labels || [
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
      'Sun',
    ],
    labels: { style: { colors: '#94a3b8' } },
  },
  yaxis: {
    title: { text: 'Units in Stock' },
    labels: { style: { colors: '#94a3b8' } },
  },
  colors: ['#6366f1'],
  grid: { borderColor: '#e2e8f0', strokeDashArray: 5 },
}

const recentActivities = computed(() => dashboardStore.stats.recent_activities || [])

// Methods
function formatTimeAgo(timestamp) {
  if (!timestamp) return 'just now'
  const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

async function loadData() {
  await dashboardStore.fetchStats(selectedRange.value)
  await categoryStore.fetchCategories()
}

function exportReport() {
  $q.dialog({
    title: 'Export Report',
    message: 'Choose export format',
    options: {
      type: 'radio',
      model: 'csv',
      items: [
        { label: 'CSV Format', value: 'csv' },
        { label: 'Excel Format', value: 'xlsx' },
        { label: 'PDF Format', value: 'pdf' },
      ],
    },
    cancel: true,
  }).onOk((format) => {
    $q.notify({ type: 'info', message: `Exporting ${format} report...` })
    setTimeout(() => {
      $q.notify({ type: 'positive', message: 'Report exported!' })
    }, 1500)
  })
}

// Watchers
watch(selectedRange, loadData)

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Main Background */
.dashboard-page {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  min-height: 100vh;
  position: relative;
}

/* Animated Background */
.animated-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

/* Hero Section */
.hero-section {
  position: relative;
  z-index: 1;
}

.greeting-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wave-emoji {
  font-size: 3rem;
  animation: wave 2s infinite;
}

@keyframes wave {
  0%,
  100% {
    transform: rotate(0deg);
  }
  20% {
    transform: rotate(14deg);
  }
  40% {
    transform: rotate(-8deg);
  }
  60% {
    transform: rotate(14deg);
  }
  80% {
    transform: rotate(-4deg);
  }
}

.date-badge {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 10px 20px;
  border-radius: 40px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.2);
}

/* KPI Cards */
.kpi-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

.kpi-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.kpi-content {
  flex: 1;
}

.kpi-label {
  font-size: 0.813rem;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 4px;
}

.kpi-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.kpi-trend {
  font-size: 0.75rem;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.kpi-trend.positive {
  color: #10b981;
}
.kpi-trend.warning {
  color: #f59e0b;
}

/* Gradients */
.gradient-purple {
  background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
}
.gradient-orange {
  background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
}
.gradient-teal {
  background: linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%);
}
.gradient-pink {
  background: linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%);
}

.gradient-purple-light {
  background: linear-gradient(135deg, #818cf8 0%, #c7d2fe 100%);
}
.gradient-orange-light {
  background: linear-gradient(135deg, #fbbf24 0%, #fed7aa 100%);
}
.gradient-teal-light {
  background: linear-gradient(135deg, #14b8a6 0%, #99f6e4 100%);
}
.gradient-pink-light {
  background: linear-gradient(135deg, #ec4899 0%, #fbcfe8 100%);
}

/* Glass Cards */
.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.1);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.card-header {
  padding: 20px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e2e8f0;
}

/* Chart Container */
.chart-container {
  padding: 20px;
}

/* Actions Grid */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 20px 24px;
}

.action-item {
  background: #f8fafc;
  border-radius: 16px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.action-item:hover {
  background: white;
  transform: translateY(-2px);
  border-color: #6366f1;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
  color: white;
}

.action-title {
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.action-desc {
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Activities List */
.activities-list {
  padding: 8px 0;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: #f8fafc;
}

.activity-avatar {
  position: relative;
}

.activity-badge {
  position: absolute;
  bottom: -6px;
  right: -6px;
  border-radius: 20px;
  font-size: 0.625rem;
  font-weight: 700;
  padding: 2px 6px;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.activity-details {
  flex: 1;
}

.activity-name {
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.activity-meta {
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reason {
  text-transform: capitalize;
}

.dot {
  color: #cbd5e1;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
}

/* Loading Overlay */
.custom-loading :deep(.q-loading) {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
}

/* Responsive */
@media (max-width: 768px) {
  .kpi-card {
    flex-direction: column;
    text-align: center;
  }

  .greeting-container {
    flex-direction: column;
    text-align: center;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
