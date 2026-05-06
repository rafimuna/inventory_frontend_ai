<template>
  <q-page padding>
    <!-- Header -->
    <div class="row q-mb-md">
      <div class="col">
        <div class="text-h4">Products</div>
      </div>
      <div class="col-auto">
        <q-btn label="Add Product" color="primary" @click="openAddDialog" />
      </div>
    </div>

    <!-- Search & Filter -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-md-5">
        <q-input
          v-model="searchQuery"
          label="Search by name or SKU"
          outlined
          dense
          clearable
          @update:model-value="applySearch"
        >
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-4">
        <q-select
          v-model="selectedCategory"
          :options="categoryStore.categoryOptions"
          label="Filter by Category"
          outlined
          dense
          clearable
          emit-value
          map-options
          @update:model-value="applyCategoryFilter"
        />
      </div>
      <div class="col-12 col-md-3">
        <q-btn
          label="Reset Filters"
          color="grey-7"
          outline
          class="full-width"
          @click="resetFilters"
        />
      </div>
    </div>

    <!-- Products Table -->
    <q-table
      :rows="productStore.products"
      :columns="columns"
      row-key="id"
      :loading="productStore.loading"
      :pagination="pagination"
      @request="onTableRequest"
      flat
      bordered
    >
      <template v-slot:body-cell-price="props">
        <q-td>
          {{ formatCurrency(props.row.price) }}
        </q-td>
      </template>

      <template v-slot:body-cell-quantity="props">
        <q-td>
          <q-badge :color="getStockColor(props.row.quantity)">
            {{ props.row.quantity }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td class="q-gutter-x-sm">
          <q-btn dense flat icon="edit" color="primary" @click="editProduct(props.row)">
            <q-tooltip>Edit Product</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="inventory" color="info" @click="openStockDialog(props.row)">
            <q-tooltip>Adjust Stock</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="delete" color="negative" @click="confirmDelete(props.row)">
            <q-tooltip>Delete Product</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <template v-slot:no-data>
        <div class="text-center q-pa-md">
          <q-icon name="inventory" size="3rem" color="grey" />
          <div class="text-h6 text-grey-6">No products found</div>
          <q-btn label="Add Product" color="primary" flat @click="openAddDialog" />
        </div>
      </template>
    </q-table>

    <!-- Add/Edit Product Dialog -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 500px; max-width: 90%">
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Edit Product' : 'Add New Product' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form ref="productFormRef" @submit="saveProduct" class="q-gutter-md">
            <q-input
              v-model="productForm.name"
              label="Product Name *"
              outlined
              dense
              :rules="[(val) => !!val || 'Name is required']"
            />

            <q-input
              v-model="productForm.sku"
              label="SKU *"
              outlined
              dense
              :rules="[(val) => !!val || 'SKU is required']"
            />

            <!-- Category with AI Suggestion -->
            <div class="row items-center q-col-gutter-sm">
              <div class="col-10">
                <q-select
                  v-model="productForm.category"
                  :options="categoryStore.categoryOptions"
                  label="Category *"
                  outlined
                  dense
                  emit-value
                  map-options
                  :rules="[(val) => !!val || 'Category is required']"
                />
              </div>
              <div class="col-2">
                <q-btn
                  v-if="productForm.name"
                  flat
                  round
                  color="primary"
                  icon="auto_awesome"
                  :loading="aiLoading"
                  @click="getAISuggestion"
                >
                  <q-tooltip>Get AI Category Suggestion</q-tooltip>
                </q-btn>
              </div>
            </div>

            <!-- AI Suggestion Chip -->
            <div v-if="aiSuggestion" class="q-mt-sm">
              <q-chip
                :color="aiSuggestion.confidence > 70 ? 'positive' : 'warning'"
                text-color="white"
                clickable
                @click="applyAISuggestion"
              >
                <q-icon name="auto_awesome" size="sm" class="q-mr-xs" />
                AI Suggests: {{ aiSuggestion.suggested_category }} ({{ aiSuggestion.confidence }}%
                confidence)
                <q-tooltip>Click to apply this category</q-tooltip>
              </q-chip>
            </div>

            <q-input
              v-model.number="productForm.price"
              label="Price *"
              type="number"
              outlined
              dense
              :rules="[(val) => val > 0 || 'Price must be > 0']"
              prefix="৳"
            />

            <q-input
              v-model.number="productForm.quantity"
              label="Initial Quantity"
              type="number"
              outlined
              dense
              :rules="[(val) => val >= 0 || 'Quantity cannot be negative']"
            />

            <q-input
              v-model="productForm.description"
              label="Description"
              type="textarea"
              outlined
              dense
              autogrow
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn label="Save" type="submit" color="primary" @click="saveProduct" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Stock Adjustment Dialog -->
    <q-dialog v-model="stockDialogVisible" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Adjust Stock</div>
          <div class="text-subtitle2">{{ currentProduct?.name }}</div>
        </q-card-section>

        <q-card-section>
          <div class="text-center q-mb-md">
            <div class="text-caption">Current Stock</div>
            <div class="text-h4">{{ currentProduct?.quantity }}</div>
          </div>

          <q-input
            v-model.number="stockAdjustment"
            label="Quantity Change"
            type="number"
            outlined
            dense
            :rules="[(val) => val !== 0 || 'Change cannot be zero']"
          >
            <template v-slot:append>
              <q-icon name="info" color="grey">
                <q-tooltip>Positive = Increase, Negative = Decrease</q-tooltip>
              </q-icon>
            </template>
          </q-input>

          <q-select
            v-model="stockReason"
            :options="reasonOptions"
            label="Reason"
            outlined
            dense
            emit-value
            map-options
            class="q-mt-md"
          />

          <div class="text-center q-mt-md">
            <q-badge
              :color="stockAdjustment > 0 ? 'positive' : stockAdjustment < 0 ? 'negative' : 'grey'"
            >
              New Stock: {{ (currentProduct?.quantity || 0) + (stockAdjustment || 0) }}
            </q-badge>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn label="Apply" color="primary" @click="applyStockAdjust" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useProductStore } from 'src/stores/productStore'
import { useCategoryStore } from 'src/stores/categoryStore'
import { stockService } from 'src/services/stockService'
import { mlService } from 'src/services/mlService'

const $q = useQuasar()
const productStore = useProductStore()
const categoryStore = useCategoryStore()

// Table columns
const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'name', label: 'Product Name', field: 'name', sortable: true, align: 'left' },
  { name: 'sku', label: 'SKU', field: 'sku', align: 'left' },
  { name: 'price', label: 'Price', field: 'price', sortable: true, align: 'right' },
  { name: 'quantity', label: 'Stock', field: 'quantity', sortable: true, align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
]

// Pagination
const pagination = ref({ page: 1, rowsPerPage: 10, rowsNumber: 0 })

// Filter states
const searchQuery = ref('')
const selectedCategory = ref(null)

// Dialog states
const dialogVisible = ref(false)
const stockDialogVisible = ref(false)
const isEditing = ref(false)
const editingId = ref(null)

// Product form data
const productForm = reactive({
  name: '',
  sku: '',
  category: null,
  price: 0,
  quantity: 0,
  description: '',
})

// Stock adjust states
const currentProduct = ref(null)
const stockAdjustment = ref(0)
const stockReason = ref('adjustment')

// AI states
const aiLoading = ref(false)
const aiSuggestion = ref(null)

const reasonOptions = [
  { label: 'Purchase (Increase)', value: 'purchase' },
  { label: 'Sale (Decrease)', value: 'sale' },
  { label: 'Adjustment', value: 'adjustment' },
  { label: 'Return (Increase)', value: 'return' },
]

// Helper functions
function formatCurrency(value) {
  return new Intl.NumberFormat('bn-BD', { style: 'currency', currency: 'BDT' }).format(value)
}

function getStockColor(quantity) {
  if (quantity <= 0) return 'negative'
  if (quantity < 10) return 'warning'
  return 'positive'
}

function onTableRequest(props) {
  pagination.value = props.pagination
  productStore.currentPage = props.pagination.page
  productStore.pageSize = props.pagination.rowsPerPage
  productStore.fetchProducts()
}

function applySearch() {
  productStore.setSearch(searchQuery.value)
}

function applyCategoryFilter() {
  productStore.setCategory(selectedCategory.value)
}

function resetFilters() {
  searchQuery.value = ''
  selectedCategory.value = null
  productStore.resetFilters()
}

// Product CRUD
function openAddDialog() {
  isEditing.value = false
  editingId.value = null
  productForm.name = ''
  productForm.sku = ''
  productForm.category = null
  productForm.price = 0
  productForm.quantity = 0
  productForm.description = ''
  aiSuggestion.value = null
  dialogVisible.value = true
}

function editProduct(product) {
  isEditing.value = true
  editingId.value = product.id
  productForm.name = product.name
  productForm.sku = product.sku
  productForm.category = product.category
  productForm.price = product.price
  productForm.quantity = product.quantity
  productForm.description = product.description || ''
  aiSuggestion.value = null
  dialogVisible.value = true
}

async function saveProduct() {
  try {
    const saveData = {
      name: productForm.name.trim(),
      sku: productForm.sku.trim(),
      category: productForm.category,
      price: productForm.price,
      quantity: productForm.quantity,
      description: productForm.description || '',
    }

    if (isEditing.value) {
      await productStore.updateProduct(editingId.value, saveData)
      $q.notify({ type: 'positive', message: 'Product updated successfully!' })
    } else {
      await productStore.addProduct(saveData)
      $q.notify({ type: 'positive', message: 'Product created successfully!' })
    }
    dialogVisible.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.detail || 'Failed to save product',
    })
  }
}

function confirmDelete(product) {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete "${product.name}"?`,
    ok: { label: 'Delete', color: 'negative' },
    cancel: { label: 'Cancel', color: 'primary' },
    persistent: true,
  }).onOk(async () => {
    try {
      await productStore.deleteProduct(product.id)
      $q.notify({ type: 'positive', message: 'Product deleted successfully!' })
    } catch (error) {
      $q.notify({ type: 'negative', message: 'Failed to delete product' })
    }
  })
}

// Stock adjustment
function openStockDialog(product) {
  currentProduct.value = product
  stockAdjustment.value = 0
  stockReason.value = 'adjustment'
  stockDialogVisible.value = true
}

async function applyStockAdjust() {
  if (stockAdjustment.value === 0) {
    $q.notify({ type: 'warning', message: 'Quantity change cannot be zero' })
    return
  }

  try {
    await stockService.adjustStock({
      product: currentProduct.value.id,
      quantity_change: stockAdjustment.value,
      reason: stockReason.value,
    })
    $q.notify({ type: 'positive', message: 'Stock adjusted successfully!' })
    stockDialogVisible.value = false
    productStore.fetchProducts() // Refresh product list
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.error || 'Failed to adjust stock',
    })
  }
}

// AI Suggestion
async function getAISuggestion() {
  if (!productForm.name) {
    $q.notify({ type: 'warning', message: 'Please enter product name first' })
    return
  }

  aiLoading.value = true
  try {
    const response = await mlService.suggestCategory(productForm.name, productForm.description)
    aiSuggestion.value = response.data

    $q.notify({
      type: 'info',
      message: `AI suggests: ${response.data.suggested_category}`,
      position: 'top',
      timeout: 3000,
    })
  } catch (error) {
    console.error('AI suggestion error:', error)
    $q.notify({ type: 'negative', message: 'Failed to get AI suggestion' })
  } finally {
    aiLoading.value = false
  }
}

function applyAISuggestion() {
  if (aiSuggestion.value) {
    // Find category option that matches
    const matchingCategory = categoryStore.categoryOptions.find(
      (opt) => opt.label === aiSuggestion.value.suggested_category,
    )

    if (matchingCategory) {
      productForm.category = matchingCategory.value
      aiSuggestion.value = null
      $q.notify({ type: 'positive', message: 'AI suggestion applied!' })
    } else {
      $q.notify({
        type: 'warning',
        message: `Category "${aiSuggestion.value.suggested_category}" not found. Please create it first.`,
      })
    }
  }
}

// Load data on mount
onMounted(async () => {
  await categoryStore.fetchCategories()
  await productStore.fetchProducts()
})
</script>
