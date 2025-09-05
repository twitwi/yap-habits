<script setup lang="ts">
import { RouterView } from 'vue-router'
import { CalendarDay, Cogs, UserCog } from '@vicons/fa'
import { Icon } from '@vicons/utils'
import { useLocalStore, useMainStore } from './stores/persist'
import router from './router'
import ReloadPrompt from './components/ReloadPrompt.vue'
import { computed } from 'vue'

const local = useLocalStore()
const main = useMainStore()

const isReady = computed(() => {
  const v = main.value
  return v !== undefined && v.config && v.data && v.data.logs
})

function changeUserName() {
  const name = prompt('Enter your name:', local.userName)
  if (name) {
    local.userName = name
  }
}
function navigateToday() {
  router.push({
    name: 'today',
  })
}
function navigateConfig() {
  router.push({
    name: 'config',
  })
}
</script>

<template>
  <div v-if="!isReady" class="loading">Loading...</div>
  <header>
    <div @click="changeUserName()">
      <Icon><UserCog /></Icon>
      <span class="username">{{ local.userName }}</span>
    </div>
    <div @click="navigateToday()">
      <Icon><CalendarDay /></Icon>
    </div>
    <div @click="navigateConfig()" style="font-size: 0.5em;">
      <Icon><Cogs /></Icon>
    </div>
  </header>

  <RouterView />
  <ReloadPrompt />
</template>
