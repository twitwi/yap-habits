import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { Full } from '@/typing'
import { yjsRef, YDoc } from './useYjs'
import { yjs } from '@/main'

export const useLocalStore = defineStore('local', () => {
  return {
    userName: ref('bob'),
    mode: ref('' as '' | 'edit'),
  }
}, {
  persist: { key: 'yap-habits:local' }, // persisted in localStorage
})

export function useMainStore(ydoc? : YDoc) : Ref<Full> {
  ydoc = ydoc ?? yjs.ydoc
  return yjsRef<Full>(ydoc, 'YJS-main')
}
