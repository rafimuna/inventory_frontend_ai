import { defineStore } from 'pinia'
import { posService } from 'src/services/posService'

export const usePosStore = defineStore('pos', {
  state: () => ({
    cart: [], // কার্টে যোগ করা আইটেম
    paymentMethods: [], // পেমেন্ট মাধ্যম লিস্ট
    currentOrder: null, // বর্তমান অর্ডার
    orders: [], // অর্ডার লিস্ট
    loading: false,
    discount: 0,
    tax: 0,
    selectedPaymentMethod: null,
  }),

  getters: {
    // কার্টের মোট আইটেম সংখ্যা
    cartItemCount: (state) => state.cart.reduce((sum, item) => sum + item.quantity, 0),

    // কার্টের সাবটোটাল
    subtotal: (state) => state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0),

    // ডিসকাউন্ট প্রয়োগ করে টোটাল
    totalAfterDiscount: (state) => {
      const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      return subtotal - state.discount
    },

    // গ্র্যান্ড টোটাল (ডিসকাউন্ট + ট্যাক্স)
    grandTotal: (state) => {
      const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const afterDiscount = subtotal - state.discount
      return afterDiscount + (afterDiscount * state.tax) / 100
    },

    // কার্ট ফরম্যাট করা (API এর জন্য)
    formattedCart: (state) =>
      state.cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
  },

  actions: {
    // পেমেন্ট মাধ্যম লোড
    async fetchPaymentMethods() {
      const response = await posService.getPaymentMethods()
      this.paymentMethods = response.data
      if (this.paymentMethods.length > 0 && !this.selectedPaymentMethod) {
        this.selectedPaymentMethod = this.paymentMethods[0].id
      }
      return this.paymentMethods
    },

    // কার্টে প্রোডাক্ট যোগ
    addToCart(product, quantity = 1) {
      const existingItem = this.cart.find((item) => item.id === product.id)
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.cart.push({
          id: product.id,
          name: product.name,
          sku: product.sku,
          price: parseFloat(product.price),
          quantity: quantity,
          stock: product.quantity,
        })
      }
    },

    // কার্ট থেকে আইটেম রিমুভ
    removeFromCart(productId) {
      this.cart = this.cart.filter((item) => item.id !== productId)
    },

    // আইটেমের পরিমাণ আপডেট
    updateQuantity(productId, quantity) {
      const item = this.cart.find((item) => item.id === productId)
      if (item) {
        if (quantity <= 0) {
          this.removeFromCart(productId)
        } else if (quantity <= item.stock) {
          item.quantity = quantity
        } else {
          throw new Error(`Only ${item.stock} items available in stock`)
        }
      }
    },

    // ডিসকাউন্ট সেট
    setDiscount(value) {
      this.discount = parseFloat(value) || 0
    },

    // ট্যাক্স সেট
    setTax(value) {
      this.tax = parseFloat(value) || 0
    },

    // পেমেন্ট মাধ্যম সেট
    setPaymentMethod(methodId) {
      this.selectedPaymentMethod = methodId
    },

    // কার্ট ক্লিয়ার
    clearCart() {
      this.cart = []
      this.discount = 0
      this.tax = 0
      this.selectedPaymentMethod = null
    },

    // অর্ডার সাবমিট
    async submitOrder(notes = '') {
      this.loading = true
      try {
        const orderData = {
          items: this.formattedCart,
          discount: this.discount,
          tax: this.tax,
          payment_method: this.selectedPaymentMethod,
          notes: notes,
        }

        const response = await posService.createOrder(orderData)
        this.currentOrder = response.data
        this.clearCart()
        return response.data
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },

    // অর্ডার লিস্ট লোড
    async fetchOrders(params = {}) {
      this.loading = true
      try {
        const response = await posService.getOrders(params)
        this.orders = response.data.results || response.data
        return this.orders
      } finally {
        this.loading = false
      }
    },

    // দৈনিক সেলস রিপোর্ট
    async getDailyReport(date) {
      const response = await posService.getDailyReport(date)
      return response.data
    },
  },
})
