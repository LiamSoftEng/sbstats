const DATABASE_NAME = 'skyblock-viewer'
const STORE_NAME = 'profiles'

function openDatabase() {
  if (!('indexedDB' in globalThis)) return Promise.resolve(null)
  return new Promise(resolve => {
    const request = indexedDB.open(DATABASE_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: 'uuid' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => resolve(null)
    request.onblocked = () => resolve(null)
  })
}

export async function readProfileCache(uuid) {
  const db = await openDatabase()
  if (!db) return null
  return new Promise(resolve => {
    const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(uuid.toLowerCase())
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => resolve(null)
  })
}

export async function writeProfileCache(profile) {
  const db = await openDatabase()
  if (!db) return
  return new Promise(resolve => {
    const transaction = db.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).put({ ...profile, uuid: profile.uuid.toLowerCase() })
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => resolve()
    transaction.onabort = () => resolve()
  })
}
