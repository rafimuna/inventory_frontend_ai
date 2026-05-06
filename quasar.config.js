// quasar.config.js (ES Module version)
import { configure } from 'quasar/wrappers'

export default configure((/* ctx */) => {
  return {
    // https://quasar.dev/quasar-cli-vite/quasar-config-js
    boot: ['axios', 'pinia', 'apexcharts'],

    css: ['app.scss'],

    extras: ['material-icons', 'roboto-font'],

    build: {
      target: { browser: 'es2015' },
      vueRouterMode: 'history',
      env: {
        API_URL: process.env.VITE_API_URL,
      },
    },

    devServer: {
      port: 9000,
      open: true,
    },

    framework: {
      config: {},
      plugins: ['Notify', 'Loading', 'Dialog'],
    },

    animations: [],

    sourceFiles: {
      rootComponent: 'src/App.vue',
      router: 'src/router/index.js',
      store: 'src/store/index.js',
    },
  }
})
