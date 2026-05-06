import { createApp } from 'vue'
import { Quasar } from 'quasar'
import { createPinia } from 'pinia'
import router from './router'
import VueApexCharts from 'vue3-apexcharts'

// Quasar styles
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/src/css/index.sass'

// App
import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

// Register ApexCharts component globally
app.component('apexchart', VueApexCharts)

app.use(pinia)
app.use(router)
app.use(Quasar, {
  plugins: {
    Notify: true,
    Loading: true,
    Dialog: true,
  },
})

app.mount('#app')
