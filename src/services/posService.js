import { api } from 'src/boot/axios'

export const posService = {
  // পেমেন্ট মাধ্যম লিস্ট আনা
  getPaymentMethods() {
    return api.get('/pos/payment-methods/')
  },

  // নতুন অর্ডার তৈরি
  createOrder(orderData) {
    return api.post('/pos/orders/', orderData)
  },

  // অর্ডারের লিস্ট দেখা
  getOrders(params = {}) {
    return api.get('/pos/orders/', { params })
  },

  // নির্দিষ্ট অর্ডারের ডিটেইল
  getOrderDetail(orderId) {
    return api.get(`/pos/orders/${orderId}/`)
  },

  // অর্ডার স্ট্যাটাস আপডেট
  updateOrderStatus(orderId, status) {
    return api.patch(`/pos/orders/${orderId}/`, { status })
  },

  // দৈনিক সেলস রিপোর্ট
  getDailyReport(date) {
    return api.get('/pos/reports/daily/', { params: { date } })
  },

  // প্রোডাক্ট সার্চ (বারকোড বা নাম দিয়ে)
  searchProduct(query) {
    return api.get('/products/', { params: { search: query, page_size: 20 } })
  },
}
