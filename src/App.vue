<script setup lang="ts">
import { RouterView } from 'vue-router'
import { CalendarDay, UserCog } from '@vicons/fa'
import { Icon } from '@vicons/utils'
import { useLocalStore, useMainStore } from './stores/simple'
import router from './router'

const local = useLocalStore()
const main = useMainStore()

const defaultTemplates = () => `
HighHanche×10 HancheMob×3
Vipa+Butterfly×10 Vipa+WideButterfly×10
DosCassé×10 Chevilles×10 EssuiGlace×10
TrapèzeBalancier×10
QuadMur×10
Squat×10
SquatLoaded×10
Calf×10
CalfLoaded×10
CalfBent×10
CalfBentLoaded×10
Equilibre(s)×30
EquilibreLoaded(s)×30
EquilibrePlaid(s)×30
EquilibrePlaidLoaded(s)×30
Biceps3kg×20
BicepsRunner3kg×20
Triceps3kg×20
RotateTorso3kg×20
RenfoFromHell×1
Sandi×30
Superman×20
Genoux×15
PiedsNus(tours)×4
`.split(/[ \n]/g).filter(t => t.trim().length > 0).map((t) => {
  const [activity, quantity] = t.split('×')
  return {
    name: `${activity}×${quantity}`,
    activity,
    quantity: parseInt(quantity),
  }
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
function setTestConfig() {
  main.config = {
    templates: defaultTemplates(),
    shortNames: {
      superman: '🦸',
    },
    colors: {
      HighHanche: '#00ff00',
      HancheMob: '#00ff00',
      //
      'Vipa+Butterfly': '#00ffff',
      'Vipa+WideButterfly': '#00ffff',
      DosCassé: '#00ffff',
      Chevilles: '#00ffff',
      EssuiGlace: '#00ffff',
      //
      TrapèzeBalancier: '#ff8800',
      Equilibre: '#888800',
      //
      Biceps3kg: '#008888',
      BicepsRunner3kg: '#008888',
      Triceps3kg: '#008888',
      RotateTorso3kg: '#008888',
      //
      EquilibreLoaded: '#ff88ff',
      EquilibrePlaid: '#ff88ff',
      EquilibrePlaidLoaded: '#ff88ff',
      //
      Calf: '#ff0088',
      CalfBent: '#ff0088',
      CalfLoaded: '#ff0088',
      CalfBentLoaded: '#ff0088',
      //
      QuadMur: '#8800ff',
      Squat: '#8800ff',
      SquatLoaded: '#8800ff',
      //
      RenfoFromHell: '#8888ff',
      Sandi: '#8888ff',
      Superman: '#8888ff',
      Genoux: '#8888ff',
      'PiedsNus(tours)': '#8888ff',
    },
  }
  if (main.data.logs === undefined) {
    main.data.logs = {}
  }
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
    <div @click="setTestConfig()">CFG</div>
    <!--
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    -->
  </header>

  <RouterView />
</template>
