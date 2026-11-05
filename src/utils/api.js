const CACHE_TTL_MS = 60_000
const requestCache = new Map()

function cachedRequest(key, request) {
  const cached = requestCache.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.promise
  if (cached) requestCache.delete(key)

  const entry = { expiresAt: Number.POSITIVE_INFINITY, promise: null }
  entry.promise = Promise.resolve()
    .then(request)
    .then(value => {
      if (requestCache.get(key) === entry) entry.expiresAt = Date.now() + CACHE_TTL_MS
      return value
    })
    .catch(error => {
      if (requestCache.get(key) === entry) requestCache.delete(key)
      throw error
    })
  requestCache.set(key, entry)
  return entry.promise
}

export async function resolveUUID(username) {
  const normalizedName = username.trim().toLowerCase()
  return cachedRequest(`mojang:${normalizedName}`, async () => {
    const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username.trim())}`)
    if (!res.ok) throw new Error(`Player "${username}" not found`)
    const data = await res.json()
    return { uuid: data.id, name: data.name }
  })
}

export async function fetchPlayer(apiKey, uuid, { force = false } = {}) {
  const key = `hypixel:player:${uuid.toLowerCase()}`
  if (force) requestCache.delete(key)
  return cachedRequest(key, async () => {
    const res = await fetch(`https://api.hypixel.net/v2/player?uuid=${encodeURIComponent(uuid)}`, {
      headers: { 'API-Key': apiKey },
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.cause || 'Hypixel API error')
    return data.player
  })
}

export async function fetchProfiles(apiKey, uuid, { force = false } = {}) {
  const key = `hypixel:profiles:${uuid.toLowerCase()}`
  if (force) requestCache.delete(key)
  return cachedRequest(key, async () => {
    const res = await fetch(`https://api.hypixel.net/v2/skyblock/profiles?uuid=${encodeURIComponent(uuid)}`, {
      headers: { 'API-Key': apiKey },
    })
    const data = await res.json()
    if (!data.success) throw new Error(data.cause || 'Hypixel API error')
    return data.profiles || []
  })
}

export function cleanUUID(uuid) {
  return uuid.replace(/-/g, '')
}
