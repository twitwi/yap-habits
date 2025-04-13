<script setup lang="ts">
const props = defineProps<{
  day: string
}>()

import router from '@/router'
import { useLocalStore, useMainStore } from '@/stores/simple'
import type { Log, LogTemplate } from '@/typing'
import { computed } from 'vue'
const local = useLocalStore()
const main = useMainStore()

const logs = computed(() => {
  const l = main.data.logs
  if (l === undefined) {
    return [] as Log[]
  }
  const ul = l[local.userName]
  if (ul === undefined) {
    return [] as Log[]
  }
  const d = ul[props.day]
  if (d === undefined) {
    return [] as Log[]
  }
  return d
})

const showsToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return today === props.day
})

const oneDay = 24 * 3600 * 1000 // ms
function deltaDate(delta: number) {
  const date = new Date(props.day)
  date.setTime(date.getTime() + delta * oneDay)
  router.push({
    name: 'day',
    params: {
      day: date.toISOString().split('T')[0],
    },
  })
}

function shortClean(name: string) {
  let res = name
  if (main.config.shortNames !== undefined) {
     res = main.config.shortNames[name] || name
  }
  res = res.replace(/([^ ×])([A-Z×(])/g, '$1 $2')
  return res
}

function templateStyle(t: Log | LogTemplate) {
  if (main.config.colors === undefined) {
    return {}
  }
  const color = main.config.colors[t.activity]
  if (color === undefined) {
    return {}
  }
  return {
    '--color': color,
  }
}

function clickTemplate(t: LogTemplate) {
  const log: Log = {
    activity: t.activity,
    quantity: t.quantity,
    at: new Date().getTime(),
  }
  const l = main.data.logs
  l[local.userName] = l[local.userName] || {}
  const ul = l[local.userName]
  ul[props.day] = ul[props.day] || []
  ul[props.day].push(log)
}
</script>

<template>
  <h1>
    <span @click="deltaDate(-1)">{{ '<' }}</span
    ><span :class="{ today: showsToday }">{{ day }}</span
    ><span @click="deltaDate(1)">{{ '>' }}</span>
  </h1>
  <div class="list-of-done">
    <div
      v-for="(log, index) in logs"
      :key="index"
      :style="templateStyle(log)"
    >
      <span>{{ shortClean(log.activity) }}</span>
      <span class="quantity">{{ log.quantity }}</span>
    </div>
  </div>
  <hr/>
  <div class="list-of-templates">
    <div
      v-for="(template, index) in main.config.templates"
      :key="index"
      :style="templateStyle(template)"
      @click="clickTemplate(template)"
    >
      <span>{{ shortClean(template.name) }}</span>
    </div>
  </div>
  <pre>{{ JSON.stringify(main.data, null, 2) }}</pre>
  <pre>{{ JSON.stringify(logs, null, 2) }}</pre>
</template>
