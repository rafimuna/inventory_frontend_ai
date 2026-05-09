<template>
  <q-page class="pos-page">
    <div class="row q-col-gutter-md">
      <!-- বাম পাশে - প্রোডাক্ট লিস্ট ও সার্চ -->
      <div class="col-12 col-md-7">
        <q-card flat class="product-panel">
          <q-card-section>
            <q-input
              v-model="searchQuery"
              placeholder="🔍 Search by name, SKU or scan barcode..."
              outlined
              dense
              clearable
              @update:model-value="debouncedSearch"
              class="search-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append>
                <q-icon name="qr_code_scanner" class="cursor-pointer" @click="startBarcodeScanner">
                  <q-tooltip>Scan Barcode</q-tooltip>
                </q-icon>
              </template>
            </q-input>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <!-- ক্যাটাগরি ফিল্টার -->
            <q-chip
              v-for="cat in categories"
              :key="cat.id"
              :color="selectedCategory === cat.id ? 'primary' : 'grey-3'"
              :text-color="selectedCategory === cat.id ? 'white' : 'dark'"
              clickable
              @click="selectedCategory = selectedCategory === cat.id ? null : cat.id"
              size="md"
            >
              {{ cat.name }}
            </q-chip>
          </q-card-section>

          <q-card-section>
            <!-- প্রোডাক্ট গ্রিড -->
            <div class="row q-col-gutter-sm">
              <div v-for="product in products" :key="product.id" class="col-6 col-sm-4 col-md-3">
                <q-card
                  class="product-card cursor-pointer"
                  flat
                  bordered
                  @click="addToCart(product)"
                >
                  <q-card-section class="text-center q-pa-sm">
                    <q-icon name="inventory_2" size="2rem" color="primary" />
                    <div class="text-subtitle2 text-weight-bold text-center q-mt-sm">
                      {{ product.name }}
                    </div>
                    <div class="text-caption text-grey-7">{{ product.sku }}</div>
                    <div class="text-h6 text-primary q-mt-sm">
                      ৳{{ formatNumber(product.price) }}
                    </div>
                    <q-badge :color="getStockColor(product.quantity)" class="q-mt-xs">
                      Stock: {{ product.quantity }}
                    </q-badge>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- লোডিং ইন্ডিকেটর -->
            <div v-if="productStore.loading" class="text-center q-pa-lg">
              <q-spinner-dots color="primary" size="2rem" />
            </div>

            <!-- নো ডাটা মেসেজ -->
            <div v-if="!productStore.loading && products.length === 0" class="text-center q-pa-lg">
              <q-icon name="search_off" size="3rem" color="grey-4" />
              <div class="text-h6 text-grey-6">No products found</div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- ডান পাশে - কার্ট ও চেকআউট -->
      <div class="col-12 col-md-5">
        <q-card flat class="cart-panel">
          <q-card-section class="bg-primary text-white">
            <div class="text-h6">Current Sale</div>
            <div class="text-subtitle2">{{ posStore.cartItemCount }} items</div>
          </q-card-section>

          <q-card-section class="q-pa-sm cart-items">
            <q-list separator>
              <q-item v-for="(item, index) in posStore.cart" :key="index" class="cart-item">
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ item.name }}</q-item-label>
                  <q-item-label caption>SKU: {{ item.sku }}</q-item-label>
                  <q-item-label caption
                    >৳{{ formatNumber(item.price) }} x {{ item.quantity }}</q-item-label
                  >
                </q-item-section>

                <q-item-section side class="text-right">
                  <div class="text-weight-bold">
                    ৳{{ formatNumber(item.price * item.quantity) }}
                  </div>
                  <div class="row q-gutter-xs q-mt-sm">
                    <q-btn
                      dense
                      flat
                      round
                      size="sm"
                      icon="remove"
                      color="negative"
                      @click="updateQuantity(item.id, item.quantity - 1)"
                    />
                    <q-badge color="primary" class="q-px-md">
                      {{ item.quantity }}
                    </q-badge>
                    <q-btn
                      dense
                      flat
                      round
                      size="sm"
                      icon="add"
                      color="positive"
                      @click="updateQuantity(item.id, item.quantity + 1)"
                    />
                    <q-btn
                      dense
                      flat
                      round
                      size="sm"
                      icon="delete"
                      color="grey"
                      @click="posStore.removeFromCart(item.id)"
                    />
                  </div>
                </q-item-section>
              </q-item>

              <div v-if="posStore.cart.length === 0" class="text-center q-pa-lg">
                <q-icon name="shopping_cart" size="3rem" color="grey-4" />
                <div class="text-grey-6 q-mt-sm">Cart is empty</div>
                <div class="text-caption text-grey-5">Click on products to add</div>
              </div>
            </q-list>
          </q-card-section>

          <!-- কার্ট সামারি -->
          <q-card-section v-if="posStore.cart.length > 0">
            <q-separator class="q-mb-md" />

            <div class="row q-mb-sm">
              <div class="col">Subtotal:</div>
              <div class="col text-right">৳{{ formatNumber(posStore.subtotal) }}</div>
            </div>

            <div class="row q-mb-sm">
              <div class="col">
                Discount (৳):
                <q-popup-edit v-model="discountValue" buttons>
                  <q-input v-model="discountValue" type="number" dense autofocus />
                </q-popup-edit>
              </div>
              <div class="col text-right text-negative">
                - ৳{{ formatNumber(posStore.discount) }}
              </div>
            </div>

            <div class="row q-mb-sm">
              <div class="col">
                Tax (%):
                <q-popup-edit v-model="taxValue" buttons>
                  <q-input v-model="taxValue" type="number" dense autofocus />
                </q-popup-edit>
              </div>
              <div class="col text-right">
                + ৳{{ formatNumber(posStore.grandTotal - posStore.totalAfterDiscount) }}
              </div>
            </div>

            <q-separator class="q-mb-md" />

            <div class="row text-h6 q-mb-md">
              <div class="col">Grand Total:</div>
              <div class="col text-right text-primary">
                ৳{{ formatNumber(posStore.grandTotal) }}
              </div>
            </div>

            <div class="row q-mb-md">
              <div class="col-12">
                <q-select
                  v-model="selectedPaymentMethodId"
                  :options="paymentMethodOptions"
                  label="Payment Method"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>
            </div>

            <div class="row">
              <div class="col-12">
                <q-input v-model="orderNotes" label="Notes (optional)" outlined dense autogrow />
              </div>
            </div>

            <div class="row q-mt-md">
              <div class="col">
                <q-btn
                  label="Cancel"
                  color="grey-7"
                  outline
                  class="full-width"
                  @click="clearCart"
                />
              </div>
              <div class="col q-ml-sm">
                <q-btn
                  label="Checkout"
                  color="positive"
                  class="full-width"
                  :loading="posStore.loading"
                  @click="checkout"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- চেকআউট সাকসেস ডায়ালগ -->
    <q-dialog v-model="successDialog">
      <q-card style="min-width: 350px">
        <q-card-section class="text-center">
          <q-icon name="check_circle" size="3rem" color="positive" />
          <div class="text-h6 q-mt-md">✅ Order Completed!</div>
          <div class="text-subtitle2">Order #{{ completedOrder?.order_number }}</div>
        </q-card-section>
        <q-card-section>
          <q-table
            :rows="completedOrder?.items || []"
            :columns="receiptColumns"
            dense
            flat
            hide-pagination
          />
          <div class="row q-mt-md">
            <div class="col"><strong>Total:</strong></div>
            <div class="col text-right">
              <strong>৳{{ formatNumber(completedOrder?.grand_total) }}</strong>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="center">
          <q-btn label="Print Receipt" color="primary" outline @click="printReceipt" />
          <q-btn label="New Sale" color="positive" @click="closeSuccessDialog" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- বারকোড স্ক্যানার ইনপুট (hidden) -->
    <input
      ref="barcodeInput"
      type="text"
      class="hidden-barcode-input"
      @keyup.enter="handleBarcodeScan"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useProductStore } from 'src/stores/productStore'
import { useCategoryStore } from 'src/stores/categoryStore'
import { usePosStore } from 'src/stores/posStore'
import { posService } from 'src/services/posService'
import { debounce } from 'lodash-es'

const $q = useQuasar()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const posStore = usePosStore()

// Refs
const searchQuery = ref('')
const selectedCategory = ref(null)
const discountValue = ref(0)
const taxValue = ref(0)
const selectedPaymentMethodId = ref(null)
const orderNotes = ref('')
const successDialog = ref(false)
const completedOrder = ref(null)
const barcodeInput = ref(null)

// Computed
const products = computed(() => {
  let filtered = [...productStore.products]
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query),
    )
  }
  if (selectedCategory.value) {
    filtered = filtered.filter((p) => p.category === selectedCategory.value)
  }
  return filtered
})

const categories = computed(() => categoryStore.categories)

const paymentMethodOptions = computed(() => {
  return posStore.paymentMethods.map((m) => ({
    label: m.name,
    value: m.id,
  }))
})

const receiptColumns = [
  {
    name: 'product',
    label: 'Product',
    field: (row) => row.product_detail?.name || row.product_name,
    align: 'left',
  },
  { name: 'qty', label: 'Qty', field: 'quantity', align: 'center' },
  { name: 'price', label: 'Price', field: 'price', align: 'right' },
  { name: 'total', label: 'Total', field: 'total', align: 'right' },
]

// Methods
function formatNumber(value) {
  return new Intl.NumberFormat('bn-BD').format(value || 0)
}

function getStockColor(quantity) {
  if (quantity <= 0) return 'negative'
  if (quantity < 10) return 'warning'
  return 'positive'
}

function addToCart(product) {
  if (product.quantity <= 0) {
    $q.notify({ type: 'warning', message: `${product.name} is out of stock!` })
    return
  }
  posStore.addToCart(product)
  $q.notify({
    type: 'positive',
    message: `${product.name} added to cart`,
    position: 'top',
    timeout: 1000,
  })
}

function updateQuantity(productId, quantity) {
  try {
    posStore.updateQuantity(productId, quantity)
  } catch (error) {
    $q.notify({ type: 'negative', message: error.message })
  }
}

function clearCart() {
  posStore.clearCart()
  discountValue.value = 0
  taxValue.value = 0
  orderNotes.value = ''
}

async function checkout() {
  if (posStore.cart.length === 0) {
    $q.notify({ type: 'warning', message: 'Cart is empty!' })
    return
  }

  if (!selectedPaymentMethodId.value) {
    $q.notify({ type: 'warning', message: 'Select payment method!' })
    return
  }

  posStore.setDiscount(discountValue.value)
  posStore.setTax(taxValue.value)
  posStore.setPaymentMethod(selectedPaymentMethodId.value)

  try {
    const order = await posStore.submitOrder(orderNotes.value)
    completedOrder.value = order
    successDialog.value = true

    // Refresh products to update stock
    await productStore.fetchProducts()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.error || 'Failed to complete order',
    })
  }
}

function closeSuccessDialog() {
  successDialog.value = false
  completedOrder.value = null
  discountValue.value = 0
  taxValue.value = 0
  orderNotes.value = ''
}

function printReceipt() {
  window.print()
}

// Barcode scanner
function startBarcodeScanner() {
  barcodeInput.value?.focus()
  $q.notify({ type: 'info', message: 'Scan barcode now...', timeout: 3000 })
}

function handleBarcodeScan(event) {
  const barcode = event.target.value
  if (barcode) {
    searchQuery.value = barcode
    event.target.value = ''
  }
}

// Debounced search
const debouncedSearch = debounce(() => {
  // Search is already handled by computed
}, 500)

// Watch for discount/tax changes
watch(discountValue, (val) => posStore.setDiscount(val))
watch(taxValue, (val) => posStore.setTax(val))
watch(selectedPaymentMethodId, (val) => posStore.setPaymentMethod(val))

// Load data on mount
onMounted(async () => {
  await Promise.all([
    productStore.fetchProducts(),
    categoryStore.fetchCategories(),
    posStore.fetchPaymentMethods(),
  ])

  if (posStore.paymentMethods.length > 0 && !selectedPaymentMethodId.value) {
    selectedPaymentMethodId.value = posStore.paymentMethods[0]?.id
  }
})

onUnmounted(() => {
  debouncedSearch.cancel()
})
</script>

<style scoped>
.pos-page {
  background: #f5f7fa;
}

.product-panel,
.cart-panel {
  border-radius: 16px;
  overflow: hidden;
}

.product-card {
  transition: all 0.2s ease;
  border-radius: 12px;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cart-items {
  max-height: 400px;
  overflow-y: auto;
}

.cart-item {
  border-bottom: 1px solid #eee;
}

.search-input :deep(.q-field__control) {
  border-radius: 30px;
}

.hidden-barcode-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  height: 0;
  width: 0;
}

/* Print styles */
@media print {
  .product-panel,
  .q-header,
  .q-drawer,
  .q-btn {
    display: none !important;
  }
  .cart-panel {
    width: 100% !important;
  }
}
</style>
