import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { Full } from '@/typing'
import { yjsRef, YDoc } from './useYjs'
import { yjs } from '@/main'

export const useLocalStore = defineStore('local', () => {
  // like setup() in a component
  const userName = ref('bob')
  return { userName }
}, {
  persist: { key: 'yap-habits:local' }, // persisted in localStorage
})

export function useMainStore(ydoc? : YDoc) : Ref<Full> {
  ydoc = ydoc ?? yjs.ydoc
  return yjsRef<Full>(ydoc, 'YJS-main')
}
