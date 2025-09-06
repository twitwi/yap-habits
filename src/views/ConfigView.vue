<script setup lang="ts">
import EditLocalStorageConfig from '@/components/EditLocalStorageConfig.vue'
import { useMainStore } from '@/stores/persist'
import { Sortable } from 'sortablejs-vue3'
import { computed, ref } from 'vue'

const main = useMainStore()
const templates = computed(() => main.value?.config?.templates ?? [])
//console.log(templates.value)

const onEnd = ({ newIndex, oldIndex }: Record<string, number>) => {
  const o = JSON.parse(JSON.stringify(templates.value[oldIndex]))
  templates.value.splice(oldIndex, 1)
  templates.value.splice(newIndex - (oldIndex < newIndex ? 0 : 0), 0, o)
}

const showRaw = ref(false)

const defaultTemplates = () =>
  `
  HighHanche×10 HancheMob×3 Bend×5
Glutes×10 Glutes:1kg×10
Vipa+Butterfly×10 Vipa+WideButterfly×10
DosCassé×10 EssuiGlace×10
Chevilles×10 TrapèzeBalancier×10
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
Nageur3kg×20
RotateTorso3kg×20
RenfoFromHell×1
Sandi×30
Superman×20
Genoux×15
PiedsNus(tours)×4
`
    .split(/[ \n]/g)
    .filter((t) => t.trim().length > 0)
    .map((t) => {
      const [activity, quantity] = t.split('×')
      return {
        name: `${activity}×${quantity}`,
        activity,
        quantity: parseInt(quantity),
      }
    })

function setTestConfig() {
  const tv = templates.value
  tv.splice(0, tv.length,
    ...JSON.parse(JSON.stringify(defaultTemplates())),
    {
      name: '@comment',
      activity: '@comment',
      quantity: 1,
    },
  )
  const m = main.value
  m.config = m.config || {}
  m.config.templates = m.config.templates || []
  m.config.shortNames = {
    superman: '🦸',
  }
  m.config.colors =  {
    HighHanche: '#00ff00',
    HancheMob: '#00ff00',
    Bend: '#00ff00',
    //
    Glutes: '#881111',
    'Glutes:1kg': '#881111',
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
    Nageur3kg: '#008888',
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
  }

  if (m.data.logs === undefined) {
    m.data.logs = {}
  }
}

function promptEdit(e: Record<string, string>, field: string, forbiddenNames: string[] = []) {
  const value = prompt(`Enter new ${field}:`, e[field])
  if (value && value !== e[field]) {
    if (forbiddenNames.includes(value)) {
      alert(`Name "${value}" is already used`)
      return
    }
    e[field] = value
  }
}

</script>

<template>
  <h3>Templates</h3>
  <button @click="templates.splice(0, 0, { name: 'TODO_'+(''+Math.random()).substring(2), activity: '', quantity: 1 })">Add</button>
  <Sortable :list="templates" item-key="name" :options="{ handle: '.handle', animation: 150 }" @end="onEnd">
    <template #item="{ element: e, index: ie }">
      <div :key="e.name">
        <span class="handle" :style="{
          display: 'inline-block',
          'margin-left': '5px',
          'border-left': '5px solid ' + (main.config.colors[e.activity] || '#000'),
         }">  ⮃  </span>
        <input v-model="e.activity" />
        <input v-model="e.quantity" type="number" />
        <span @click="promptEdit(e as Record<'name', string>, 'name', templates.map(c => c.name))" style="padding: 0 1em;">{{ e.name }}</span>
        <button @click="templates.splice(ie, 1)">X</button>
      </div>
    </template>
  </Sortable>

  <h3>Bootstrap</h3>
  <button @click="setTestConfig()">Set default test config</button>
  <button @click="onEnd({ oldIndex: 0, newIndex: 5 })">Turn-1</button>
  <button @click="onEnd({ oldIndex: 5, newIndex: 0 })">Turn+1</button>

  <h3>Server</h3>
  <EditLocalStorageConfig mode="details" />

  <label>
    <h3><input type="checkbox" v-model="showRaw" /> Show raw config</h3>
    <pre v-if="showRaw">{{ JSON.stringify(main.config, null, 2) }}</pre>
  </label>
</template>
