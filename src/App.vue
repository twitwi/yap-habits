<script setup lang="ts">
import { RouterView } from 'vue-router'
import { CalendarDay, Cogs, UserCog } from '@vicons/fa'
import { Icon } from '@vicons/utils'
import { useLocalStore } from './stores/persist'
import router from './router'
import ReloadPrompt from './components/ReloadPrompt.vue'

const local = useLocalStore()

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
