/**
 * Slugify a string (URL-friendly format)
 * Example: "Electronics & Gadgets" -> "electronics-gadgets"
 */
export function slugify(text) {
  if (!text) return ''

  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}

/**
 * Format currency for Bangladesh Taka
 */
export function formatCurrency(amount) {
  if (!amount && amount !== 0) return '৳0'

  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format date to local date string
 */
export function formatDate(dateString, format = 'short') {
  const date = new Date(dateString)

  if (format === 'short') {
    return date.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  if (format === 'long') {
    return date.toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (format === 'datetime') {
    return date.toLocaleString('bn-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return date.toLocaleDateString()
}

/**
 * Format time only
 */
export function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get stock status and color
 */
export function getStockStatus(quantity) {
  if (quantity <= 0) {
    return { text: 'Out of Stock', color: 'negative', icon: 'warning' }
  }
  if (quantity < 10) {
    return { text: 'Low Stock', color: 'warning', icon: 'priority_high' }
  }
  return { text: 'In Stock', color: 'positive', icon: 'check_circle' }
}
