<script setup lang="ts">

const props = defineProps<{
  day: string
}>()

import router from '@/router'
import { useMainStore } from '@/stores/simple'
const main = useMainStore()

const oneDay = 24 * 3600 * 1000 // ms
function deltaDate(delta: number) {
  const date = new Date(props.day)
  date.setTime(date.getTime() + delta * oneDay)
  router.push({
    name: 'day',
    params: {
      day: date.toISOString().split('T')[0]
    }
  })
}
</script>

<template>
  <h1><span @click="deltaDate(-1)">{{ "<" }}</span><span>{{ day }}</span><span @click="deltaDate(1)">{{ ">" }}</span></h1>
  <pre>{{ JSON.stringify(main.data, null, 2) }}</pre>
  <button @click="main.data.count++">+</button>
  <button @click="main.data.count--">-</button>
</template>

