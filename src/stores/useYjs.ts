
import { Doc as YDoc, Map as YMap, Array as YArray, Text as YText } from 'yjs'
export { YDoc, YMap, YArray, YText }

import { customRef } from 'vue'
import { nextTick, ref, type ComputedRef, type Ref } from 'vue'
import { useDebounceFn, useThrottleFn } from '@vueuse/core'

export function proxyYArray(o: YArray<YAny>, ydoc: YDoc) {
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
            yield proxyY(v, ydoc)
          }
        }
      }
      if (prop === 'length') {
        return target.length
      }
      if (prop === 'splice') {
        return (start: number, deleteCount?: number, ...items: SAny[]) => {
          console.log('array splice', start, deleteCount, items)
          //return target.splice(start, deleteCount, ...items)
          const res = [] as SAny[]
          for (let i = start; i < (deleteCount ? start + deleteCount : target.length); i++) {
            const v = target.get(i)
            res.push(v !== undefined ? v.toJSON() : v)
          }
          ydoc.transact(() => {
            deleteCount = deleteCount ?? 0
            if (deleteCount > 0) {
              target.delete(start, deleteCount)
            }
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
        return proxyY(v, ydoc)
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

export function proxyYMap(o: YMap<YAny>, ydoc: YDoc) {
  o.observe((event) => {
    console.log('%%%%%%%%%% YMap observe', event)
  })
  return new Proxy(o, {
    get(target, prop) {
      if (typeof prop === 'string' && target.has(prop)) {
        const v = target.get(prop)
        return proxyY(v, ydoc)
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
  }) as unknown as SAny
}

export function toY(o: SAny): YAny {
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

export type YAny = YMap<YAny> | YArray<YAny> | YText | number
export type SAny = number | string | SAny[] | { [key: string]: SAny }

export function proxyY(o: YAny | undefined, ydoc: YDoc): SAny | undefined {
  if (o === undefined || typeof o === 'number') {
    return o
  }
  console.log('proxyY OBJECT', o)
  const type = o.__proto__.constructor.name.replace(/_/g, '')
  console.log('proxyY TYPE', type)
  if (type === 'YMap') {
    return proxyYMap(o as YMap<YAny>, ydoc)
  } else if (type === 'YArray') {
    return proxyYArray(o as YArray<YAny>, ydoc)
  } else if (type === 'YText') {
    return (o as YText).toString()
  }
  throw new Error('Unsupported Y type: ' + type)
}

export function yjsRef<T>(ydoc: YDoc, path: string) {
  const parts = path.split('/').filter(p => p)
  if (parts.length === 0) {
    throw new Error('Invalid path for yjsRef: ' + path)
  }
  return customRef((track, trigger) => {
    const obj = (() => {
      const p = [...parts]
      let o = ydoc.getMap(p.shift()) as YMap<YAny> | YArray<YAny>
      while (o && p.length > 0) {
        const k = p.shift()!
        o = o.get(k)
        if (o === undefined) {
          console.error('Path not found in yjsRef: ' + path)
          return undefined
        }
      }
      return o
    })()
    if (!obj) {
      console.error('Path not found in yjsRef: ' + path)
      return {
        get() {
          return [] as T[]
        },
        set(v) {
          throw new Error('Cannot set yjsRef directly')
        },
      }
    }
    const trig = useDebounceFn(trigger, 1)
    obj.observeDeep((events) => {
      console.log('%%%%%%%%%% YJS observeDeep', events)
      //if (!events[0].transaction.local) {
        trig()
      //}
    })
    let prox = proxyY(obj, ydoc) as T[]
    return {
      get() {
        console.log('================== yjsRef get')
        track()
        // each access creates a proxy !
        prox = proxyY(obj, ydoc) as T[]
        return prox
      },
      set(v) {
        prox.splice(0, prox.length, ...v)
        //throw new Error('Cannot set yjsRef directly')
        trig()
      },
    }
  }) as Ref<T>
}
