import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Config, Data } from '@/typing'

export const useLocalStore = defineStore('local', () => {
  // like setup() in a component
  const userName = ref('bob')
  return { userName }
}, {
  persist: { key: 'yap-habits:local' }, // persisted in localStorage
})

export const useMainStore = defineStore(
  'main',
  () => {
    // like setup() in a component
    const config = ref({} as Config)
    const data = ref({} as Data)
    return { config, data }
  },
  {
    sharing: true, // shared through yjs (+ local IDB)
  },
)
