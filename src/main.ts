import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setupYjs } from './main-yjs'

const app = createApp(App)
const pinia = createPinia()

setupYjs(pinia)

app.use(pinia)
app.use(router)

app.mount('#app')
