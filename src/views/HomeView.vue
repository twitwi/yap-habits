<script setup lang="ts">
import { useLocalStore, useMainStore } from '@/stores/simple'
const local = useLocalStore()
const main = useMainStore()
</script>

<template>
  <h3>Hello {{ local.userName }}, please select a day above</h3>
  <pre>{{ JSON.stringify(main, null, 2) }}</pre>
</template>
