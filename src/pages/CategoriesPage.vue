<template>
  <q-page padding>
    <!-- Header -->
    <div class="row q-mb-md">
      <div class="col">
        <div class="text-h4">Categories</div>
        <div class="text-subtitle2 text-grey-6">Manage your product categories</div>
      </div>
      <div class="col-auto">
        <q-btn label="Add Category" color="primary" @click="openAddDialog" />
      </div>
    </div>

    <!-- Categories Table -->
    <q-table
      :rows="categoryStore.categories"
      :columns="columns"
      row-key="id"
      :loading="categoryStore.loading"
      flat
      bordered
    >
      <!-- Custom Slug Column -->
      <template v-slot:body-cell-slug="props">
        <q-td>
          <q-badge outline color="primary" :label="props.row.slug" />
        </q-td>
      </template>

      <!-- Actions Column -->
      <template v-slot:body-cell-actions="props">
        <q-td class="q-gutter-x-sm">
          <q-btn dense flat icon="edit" color="primary" @click="editCategory(props.row)">
            <q-tooltip>Edit Category</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="delete" color="negative" @click="confirmDelete(props.row)">
            <q-tooltip>Delete Category</q-tooltip>
          </q-btn>
        </q-td>
      </template>

      <!-- No Data -->
      <template v-slot:no-data>
        <div class="text-center q-pa-md">
          <q-icon name="category" size="3rem" color="grey" />
          <div class="text-h6 text-grey-6">No categories found</div>
          <q-btn label="Add Category" color="primary" flat @click="openAddDialog" />
        </div>
      </template>
    </q-table>

    <!-- Add/Edit Category Dialog -->
    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 450px; max-width: 90%">
        <q-card-section>
          <div class="text-h6">{{ isEditing ? 'Edit Category' : 'Add New Category' }}</div>
        </q-card-section>

        <q-card-section>
          <q-form ref="categoryFormRef" @submit="saveCategory" class="q-gutter-md">
            <q-input
              v-model="formData.name"
              label="Category Name *"
              outlined
              dense
              :rules="[
                (val) => !!val || 'Name is required',
                (val) => val.length >= 2 || 'Minimum 2 characters',
              ]"
              @input="generateSlug"
            >
              <template v-slot:prepend>
                <q-icon name="label" />
              </template>
            </q-input>

            <q-input
              v-model="formData.slug"
              label="Slug *"
              outlined
              dense
              :rules="[
                (val) => !!val || 'Slug is required',
                (val) => /^[a-z0-9-]+$/.test(val) || 'Only lowercase letters, numbers and hyphens',
              ]"
              hint="URL-friendly version of the name (auto-generated)"
            >
              <template v-slot:prepend>
                <q-icon name="link" />
              </template>
              <template v-slot:append>
                <q-btn dense flat icon="refresh" @click="generateSlug" />
              </template>
            </q-input>

            <q-input
              v-model="formData.description"
              label="Description"
              type="textarea"
              outlined
              dense
              autogrow
              hint="Optional - describe what this category includes"
            >
              <template v-slot:prepend>
                <q-icon name="description" />
              </template>
            </q-input>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            label="Save"
            type="submit"
            color="primary"
            @click="saveCategory"
            :loading="categoryStore.loading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="deleteDialogVisible" persistent>
      <q-card style="min-width: 350px">
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-md text-h6">Delete Category?</span>
        </q-card-section>

        <q-card-section>
          <div>
            Are you sure you want to delete <strong>{{ categoryToDelete?.name }}</strong
            >?
          </div>
          <div class="text-caption text-grey-6 q-mt-md">
            Note: Products in this category will have their category set to NULL.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn label="Delete" color="negative" @click="deleteCategory" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useCategoryStore } from 'src/stores/categoryStore'
import { slugify } from 'src/utils/formatters'

const $q = useQuasar()
const categoryStore = useCategoryStore()

// Table columns
const columns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'name', label: 'Category Name', field: 'name', sortable: true, align: 'left' },
  { name: 'slug', label: 'Slug', field: 'slug', align: 'left' },
  { name: 'description', label: 'Description', field: 'description', align: 'left' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' },
]

// Dialog states
const dialogVisible = ref(false)
const deleteDialogVisible = ref(false)
const isEditing = ref(false)
const categoryToDelete = ref(null)
const categoryFormRef = ref(null)

// Form data
const formData = reactive({
  name: '',
  slug: '',
  description: '',
})
const editingId = ref(null)

// Generate slug from name
function generateSlug() {
  if (formData.name) {
    formData.slug = slugify(formData.name)
  }
}

// Open add dialog
function openAddDialog() {
  isEditing.value = false
  editingId.value = null
  formData.name = ''
  formData.slug = ''
  formData.description = ''
  dialogVisible.value = true
}

// Edit category
function editCategory(category) {
  isEditing.value = true
  editingId.value = category.id
  formData.name = category.name
  formData.slug = category.slug
  formData.description = category.description || ''
  dialogVisible.value = true
}

// Save category
async function saveCategory() {
  try {
    const saveData = {
      name: formData.name.trim(),
      slug: formData.slug.trim().toLowerCase(),
      description: formData.description || '',
    }

    if (isEditing.value) {
      await categoryStore.updateCategory(editingId.value, saveData)
      $q.notify({
        type: 'positive',
        message: 'Category updated successfully!',
        position: 'top',
      })
    } else {
      await categoryStore.addCategory(saveData)
      $q.notify({
        type: 'positive',
        message: 'Category created successfully!',
        position: 'top',
      })
    }
    dialogVisible.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message:
        error.response?.data?.detail ||
        error.response?.data?.slug?.[0] ||
        'Failed to save category',
      position: 'top',
    })
  }
}

// Confirm delete
function confirmDelete(category) {
  categoryToDelete.value = category
  deleteDialogVisible.value = true
}

// Delete category
async function deleteCategory() {
  try {
    await categoryStore.deleteCategory(categoryToDelete.value.id)
    $q.notify({
      type: 'positive',
      message: 'Category deleted successfully!',
      position: 'top',
    })
    deleteDialogVisible.value = false
    categoryToDelete.value = null
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.detail || 'Failed to delete category',
      position: 'top',
    })
  }
}

// Load categories on mount
onMounted(() => {
  categoryStore.fetchCategories()
})
</script>
