import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setupYjs } from 'yjs-datatools'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const app = createApp(App)
const pinia = createPinia()

pinia.use(piniaPluginPersistedstate)
export const APP_LOCAL_STORAGE_KEY = 'yap-habits:server'
export const yjs = await setupYjs({ lsKey: APP_LOCAL_STORAGE_KEY })

app.use(pinia)
app.use(router)

app.mount('#app')
