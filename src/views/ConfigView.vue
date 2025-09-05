<script setup lang="ts">
import EditLocalStorageConfig from '@/components/EditLocalStorageConfig.vue'
import { useMainStore } from '@/stores/persist'
import { ref, type ComputedRef } from 'vue'
const main = useMainStore()
import { customRef } from 'vue'

const ydoc = yjs.ydoc // TODO pass to functions...
import { Doc as YDoc, Map as YMap, Array as YArray, Text as YText } from 'yjs'
function proxyYArray(o: YArray<YAny>) {
  o.observe((event) => {
    console.log('%%%%%%%%%% YArray observe', event)
  })
  return new Proxy(o, {
    get(target, prop) {
      if (prop === Symbol.iterator) {
        return function* () {
          for (let i = 0; i < target.length; i++) {
            const v = target.get(i)
            console.log("array iter", i, v)
            yield proxyY(v)
          }
        }
      }
      if (prop === 'length') {
        return target.length
      }
      if (prop === 'splice') {
        return (start: number, deleteCount?: number, ...items: YAny[]) => {
          console.log('array splice', start, deleteCount, items)
          //return target.splice(start, deleteCount, ...items)
          const res = []
          for (let i = start; i < (deleteCount ? start + deleteCount : target.length); i++) {
            const v = target.get(i)
            res.push(v !== undefined ? v.toJSON() : v)
          }
          ydoc.transact(() => {
            target.delete(start, deleteCount || 0)
            if (items.length > 0) {
              target.insert(start, items.map(toY))
            }
          })
          return res
        }
      }
      if (typeof prop === 'string' && !isNaN(Number(prop))) {
        const v = target.get(Number(prop))
        console.log("array get", prop, v)
        return proxyY(v)
      }
      //throw new Error('Cannot get property ' + String(prop) + ' on YArray')
      return Reflect.get(target, prop)
    },
    set(target, prop, value) {
      if (typeof prop === 'string' && !isNaN(Number(prop))) {
        target.set(Number(prop), toY(value))
        return true
      }
      throw new Error('Cannot set property ' + String(prop) + ' on YArray')
      //return Reflect.set(target, prop, value)
    },
  })
}
function proxyYMap(o: YMap<YAny>) {
  o.observe((event) => {
    console.log('%%%%%%%%%% YMap observe', event)
  })
  return new Proxy(o, {
    get(target, prop) {
      if (typeof prop === 'string' && target.has(prop)) {
        const v = target.get(prop)
        return proxyY(v)
      }
      return Reflect.get(target, prop)
    },
    set(target, prop, value) {
      if (typeof prop === 'string') {
        target.set(prop, toY(value))
        return true
      }
      throw new Error('Cannot set property ' + String(prop) + ' on YMap')
      //return Reflect.set(target, prop, value)
    },
  })
}

function toY(o: any): YAny {
  if (o === undefined || typeof o === 'number') {
    return o
  }
  if (Array.isArray(o)) {
    const ya = new YArray<YAny>()
    ya.insert(0, o.map(toY))
    return ya
  }
  if (typeof o === 'object') {
    const ym = new YMap<YAny>()
    for (const k of Object.keys(o)) {
      ym.set(k, toY(o[k]))
    }
    return ym
  }
  if (typeof o === 'string') {
    return new YText(o)
  }
  throw new Error('Unsupported type for toY: ' + typeof o)
}

type YAny = YMap<YAny> | YArray<YAny> | YText
function proxyY(o: YAny | undefined) {
  if (o === undefined || typeof o === 'number') {
    return o
  }
  console.log('proxyY OBJECT', o)
  const type = o.__proto__.constructor.name.replace(/_/g, '')
  console.log('proxyY TYPE', type)
  if (type === 'YMap') {
    return proxyYMap(o as YMap<YAny>)
  } else if (type === 'YArray') {
    return proxyYArray(o as YArray<YAny>)
  } else if (type === 'YText') {
    return (o as YText).toString()
  }
  throw new Error('Unsupported Y type: ' + type)
}

function yjsRef<T>(doc: YDoc, path: string) {
  console.log('yjsRef (IGNORING)', path)
  return customRef((track, trigger) => ({
    get() {
      console.log('================== yjsRef get')
      track()
      const obj = doc.getMap('YJS-main').get('config').get('templates') as YArray<YAny> | YMap<YAny>
      if (!obj) {
        return []
      }
      obj.observeDeep(useThrottleFn((events) => {
        console.log('%%%%%%%%%% YJS observeDeep', events)
        doc.transact(() => {
          trigger()
        })
      }, 100))
      return proxyY(obj)
    },
    set() {
      throw new Error('Cannot set yjsRef directly')
    },
  })) as ComputedRef<T>
}

//const templates = proxyY(yjs.ydoc.getMap('YJS-main').get('config').get('templates'))
const templates = yjsRef<LogTemplate[]>(yjs.ydoc, 'YJS-main.config.templates')

/*customRef((track, trigger) => ({
  get() {
    track()
    const arr =  as YArray<YAny>
    arr.observeDeep((events) => {
      console.log('%%%%%%%%%% YArray observeDeep', events)
      trigger()
    })
    return proxyYArray(arr)
  },
  set(v) {
    throw new Error('Cannot set templates directly')
  },
}))*/


//import yjson from  '../yjson/src'
//const templates = yjson(yjs.ydoc, 'YJS-main').config
console.log(templates.value)

import { Sortable } from 'sortablejs-vue3'
import { yjs } from '@/main'
import { useDebounceFn, useThrottleFn, type ReadonlyRefOrGetter } from '@vueuse/core'
import type { LogTemplate } from '@/typing'
const onEnd = ({ newIndex, oldIndex }: Record<string, number>) => {
  const o = JSON.parse(JSON.stringify(templates.value[oldIndex]))
  templates.value.splice(oldIndex, 1)
  templates.value.splice(newIndex, 0, o)
  //const newT = JSON.parse(JSON.stringify(main.config.templates))
  //const item = newT.splice(oldIndex, 1)[0]
  //newT.splice(newIndex, 0, item)
  //main.config.templates = newT
}

const showRaw = ref(false)

const defaultTemplates = () =>
  `
Vipa+Butterfly×10 Vipa+WideButterfly×10
DosCassé×10 EssuiGlace×10
Chevilles×10 TrapèzeBalancier×10
HighHanche×10 HancheMob×3 Bend×5
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
  main.config = {
    templates: [
      ...defaultTemplates(),
      {
        name: '@comment',
        activity: '@comment',
        quantity: 1,
      },
    ],
    shortNames: {
      superman: '🦸',
    },
    colors: {
      HighHanche: '#00ff00',
      HancheMob: '#00ff00',
      Bend: '#00ff00',
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
    },
  }
  if (main.data.logs === undefined) {
    main.data.logs = {}
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
        <span @click="promptEdit(e, 'name', templates.map(c => c.name))" style="padding: 0 1em;">{{ e.name }}</span>
        <button @click="templates.splice(ie, 1)">X</button>
      </div>
    </template>
  </Sortable>

  <h3>Bootstrap</h3>
  <button @click="setTestConfig()">Set default test config</button>

  <h3>Server</h3>
  <EditLocalStorageConfig mode="details" />

  <label>
    <h3><input type="checkbox" v-model="showRaw" /> Show raw config</h3>
    <pre v-if="showRaw">{{ JSON.stringify(main.config, null, 2) }}</pre>
  </label>
</template>
