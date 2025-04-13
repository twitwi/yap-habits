import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { createPiniaYJSPlugin } from 'pinia-plugin-yjs'
import { IndexeddbPersistence } from 'y-indexeddb'
import type { Pinia } from 'pinia'

export function getOrAskConfig(LOCAL_STORAGE_KEY = 'yjsapp-renfollow', saveToLocalStorage = true) {
  const ASK = Symbol('ask')

  let config: symbol | (string | symbol)[] = ASK
  //let default = [ASK, ASK, ASK]
  //let default = ['TODO.com', ASK, ASK]
  //let default = ['TODO.com', 'todo-doc', 'todo-tok-suffix'] // TODO: server, document name, token (if any)

  if (LOCAL_STORAGE_KEY ?? '' !== '') {
    if (LOCAL_STORAGE_KEY == 'yjsapp-config') {
      alert(
        'WARNING: Using default config\n\nPlease configure your app with a unique local storage key.\n\n(if not, two apps might reuse the same credentials to the same document (but treat this as different type!).',
      )
      alert("We recommend to use a unique key, e.g. 'yjsapp-<your-app-name>', but will let you continue now.")
    }
    const local = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (local) {
      config = local.split(':')
    }
  }

  if (config == ASK) {
    const v = prompt('Enter the doc description e.g.: todo.com:doc:token')
    if (!v) {
      throw new Error('No config provided')
    }
    config = v.split(':')
    if (config.length < 3) {
      throw new Error('Invalid config provided')
    }
  }
  if (!Array.isArray(config)) {
    throw new Error('Invalid config provided')
  }
  if (config[0] == ASK) {
    const server = prompt('Enter the server name, e.g.: todo.com')
    if (!server) {
      throw new Error('No server provided')
    }
    config[0] = server
  }
  if (config[1] == ASK) {
    const docname = prompt('Enter the document name, e.g.: todo-doc')
    if (!docname) {
      throw new Error('No document name provided')
    }
    config[1] = docname
  }
  if (config[2] == ASK) {
    const token = prompt('Enter the token, e.g.: todo-tok-suffix')
    if (!token) {
      throw new Error('No token provided')
    }
    config[2] = token
  }
  if (saveToLocalStorage) {
    localStorage.setItem(LOCAL_STORAGE_KEY, config.join(':'))
  }
  return config as [string, string, string]
}

export function setupYjs(piniaUse: Pinia, { websocket = true, indexeddb = true, pinia = true } = {}) {
  const ydoc = new Y.Doc()
  const [server, docname, token] = getOrAskConfig()
  const idbkey = `yjs-${docname}` // idb key, can be different
  if (websocket) {
    new WebsocketProvider(`wss://${server}`, `${docname}?t=${token}`, ydoc)
  }
  if (indexeddb) {
    new IndexeddbPersistence(idbkey, ydoc)
  }
  if (pinia) {
    piniaUse.use(createPiniaYJSPlugin({ doc: ydoc }))
  }
  return ydoc
}
