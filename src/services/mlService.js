import { api } from 'src/boot/axios'

export const mlService = {
  // Get category suggestion for a product
  suggestCategory(productName, description = '') {
    return api.post('/ml/suggest-category/', {
      product_name: productName,
      product_description: description,
    })
  },

  // Batch suggestions
  batchSuggest(products) {
    return api.post('/ml/batch-suggest/', { products })
  },

  // Accept suggestion and update product
  acceptSuggestion(productId, categoryName, confidence) {
    return api.post('/ml/accept-suggestion/', {
      product_id: productId,
      accepted_category: categoryName,
      confidence: confidence,
    })
  },

  // Retrain model (admin only)
  retrainModel() {
    return api.post('/ml/train-model/')
  },
}
