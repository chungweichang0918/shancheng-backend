import { createApp } from 'vue'
import { createPinia } from 'pinia' // 🌟 1. 引入 Pinia
import App from './App.vue'
import { router } from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

const app = createApp(App)
const pinia = createPinia() // 🌟 2. 建立 Pinia 實體

app.use(pinia) // 🌟 3. 讓 Vue 使用 Pinia
app.use(router)
app.mount('#app')