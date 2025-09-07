import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { Full } from '@/typing'
import { yjs } from '@/main'
import { yjsRef, YDoc } from 'yjs-datatools'

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
