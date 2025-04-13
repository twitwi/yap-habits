<script setup lang="ts">
import { RouterView } from 'vue-router'
import { UserCog } from '@vicons/fa'
import { Icon } from '@vicons/utils'
import { useLocalStore } from './stores/simple'

const local = useLocalStore()

function changeUserName() {
  const name = prompt('Enter your name:', local.userName)
  if (name) {
    local.userName = name
  }
}
</script>

<template>
  <header>
    <div @click="changeUserName()">
      <Icon><UserCog/></Icon>
      <span class="username">{{ local.userName }}</span>
    </div>
    <!--
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    -->
  </header>

  <RouterView />
</template>
