
import { Doc as YDoc, Map as YMap, Array as YArray, Text as YText } from 'yjs'
export { YDoc, YMap, YArray, YText }

import { customRef } from 'vue'
import { useDebounceFn } from '@vueuse/core'


export type YAny = YMap<YAny> | YArray<YAny> | YText | number
export type SAny = number | string | SAny[] | { [key: string]: SAny }


const unimplemented = new Set<string|symbol>('concat reverse'.split(' '))
export function proxyYArray(o: YArray<YAny>, ydoc: YDoc) {
  o.observe((event) => {
    console.log('%%%%%%%%%% YArray observe', event)
  })
  const proxy =  new Proxy(o, {
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
      if (prop === 'push') {
        return (...items: SAny[]) => (proxy as unknown as SAny[]).splice(target.length, 0, ...items)
      }
      if (prop === 'unshift') {
        return (...items: SAny[]) => (proxy as unknown as SAny[]).splice(0, 0, ...items)
      }
      if (prop === 'pop') {
        return () => (proxy as unknown as SAny[]).splice(target.length - 1, 1)[0]
      }
      if (prop === 'shift') {
        return () => (proxy as unknown as SAny[]).splice(0, 1)[0]
      }
      if (prop === 'splice') {
        return (start: number, deleteCount?: number, ...items: SAny[]) => {
          console.log('array splice', start, deleteCount, items)
          //return target.splice(start, deleteCount, ...items)
          const res = [] as SAny[]
          for (let i = start; i < (deleteCount ? start + deleteCount : target.length); i++) {
            const v = target.get(i)
            res.push(fromY(v)!)
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
        return proxyY(target.get(Number(prop)), ydoc)
      }
      if (unimplemented.has(prop)) {
        throw new Error('Cannot get property ' + String(prop) + ' on YArray')
      }
      return Reflect.get(target, prop)
    },
    set(target, prop, value) {
      if (typeof prop === 'string' && !isNaN(Number(prop))) {
        ydoc.transact(() => {
          const index = Number(prop)
          if (index < target.length) {
            target.delete(index, 1)
            target.insert(index, [toY(value)])
          } else if (index === target.length) {
            target.insert(target.length, [toY(value)])
          }
        })
        return true
      }
      throw new Error('Cannot set property ' + String(prop) + ' on YArray')
      //return Reflect.set(target, prop, value)
    },
  })
  return proxy
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
      console.log('///////////// YMap set', String(prop), value)
      if (value?.__proto__?.constructor?.name?.startsWith('_Y')) {
        value = fromY(value)
      }
      if (typeof prop === 'string') {
        target.set(prop, toY(value))
        return true
      }
      throw new Error('Cannot set property ' + String(prop) + ' on YMap')
      //return Reflect.set(target, prop, value)
    },
  }) as unknown as SAny
}

export function fromY(o: YAny | undefined): SAny | undefined {
  if (o === undefined || typeof o === 'number' || o === null) {
    return o
  }
  return o.toJSON()
}
export function toY(o: SAny): YAny {
  if (o === undefined || typeof o === 'number' || o === null) {
    return o
  }
  if (Array.isArray(o)) {
    const ya = new YArray<YAny>()
    ya.insert(0, o.map(toY))
    return ya
  }

  if (typeof o === 'object') {
    console.log(o.__proto__.constructor.name)//, JSON.stringify(o))
    const ym = new YMap<YAny>()
    for (const k of Object.getOwnPropertyNames(o)) {
      if (k === 'client') {
        throw new Error('toY: skipping client key')
      }
      console.log('toY OBJECT KEY', k, (o as any)[k])
      ym.set(k, toY(o[k]))
    }
    return ym
  }
  if (typeof o === 'string') {
    return new YText(o)
  }
  throw new Error('Unsupported type for toY: ' + typeof o)
}

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
