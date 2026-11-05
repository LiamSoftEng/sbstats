import { useState, useCallback } from 'react'
import { resolveUUID, fetchPlayer, fetchProfiles, cleanUUID } from '../utils/api'
import { readProfileCache, writeProfileCache } from '../utils/profileCache'

const INITIAL = {
  step: 'apiKey',       // apiKey | search | profiles | player
  apiKey: localStorage.getItem('sb_api_key') || '',
  player: null,         // { uuid, name }
  hypixelPlayer: null,
  profiles: [],
  selectedProfile: null,
  activeTab: 'overview',
  loading: false,
  refreshing: false,
  lastFetchedAt: null,
  error: null,
}

export function useStore() {
  const [state, setState] = useState(INITIAL)

  const set = useCallback((patch) => {
    setState(prev => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))
  }, [])

  const saveApiKey = useCallback((key) => {
    localStorage.setItem('sb_api_key', key)
    set({ apiKey: key, step: 'search', error: null })
  }, [set])

  const clearApiKey = useCallback(() => {
    localStorage.removeItem('sb_api_key')
    set({ apiKey: '', step: 'apiKey', player: null, profiles: [], selectedProfile: null })
  }, [set])

  const lookupPlayer = useCallback(async (name) => {
    set({ loading: true, error: null })
    try {
      const { uuid, name: exactName } = await resolveUUID(name)
      const clean = cleanUUID(uuid)
      const player = { uuid: clean, name: exactName }
      const cached = await readProfileCache(clean)
      if (cached) {
        set({ player, hypixelPlayer: cached.hypixelPlayer, profiles: cached.profiles, selectedProfile: null, lastFetchedAt: cached.updatedAt, step: 'profiles', loading: false })
        return
      }
      const [hypixelPlayer, profiles] = await Promise.all([
        fetchPlayer(state.apiKey, clean),
        fetchProfiles(state.apiKey, clean),
      ])
      const updatedAt = Date.now()
      await writeProfileCache({ uuid: clean, player, hypixelPlayer, profiles, updatedAt })
      set({
        player,
        hypixelPlayer,
        profiles,
        lastFetchedAt: updatedAt,
        selectedProfile: null,
        step: 'profiles',
        loading: false,
      })
    } catch (e) {
      set({ loading: false, error: e.message })
    }
  }, [state.apiKey, set])

  const refreshPlayerData = useCallback(async () => {
    const currentPlayer = state.player
    if (!currentPlayer || state.refreshing) return
    set({ refreshing: true, error: null })
    try {
      const uuid = cleanUUID(currentPlayer.uuid)
      const [hypixelPlayer, profiles] = await Promise.all([
        fetchPlayer(state.apiKey, uuid, { force: true }),
        fetchProfiles(state.apiKey, uuid, { force: true }),
      ])
      const updatedAt = Date.now()
      await writeProfileCache({ uuid, player: currentPlayer, hypixelPlayer, profiles, updatedAt })
      set(prev => ({
        hypixelPlayer, profiles,
        selectedProfile: prev.selectedProfile ? profiles.find(p => p.profile_id === prev.selectedProfile.profile_id) || null : null,
        lastFetchedAt: updatedAt, refreshing: false,
      }))
    } catch (e) {
      set({ refreshing: false, error: e.message })
    }
  }, [state.apiKey, state.player, state.refreshing, set])

  const selectProfile = useCallback((profileId) => {
    const profile = state.profiles.find(p => p.profile_id === profileId)
    set({ selectedProfile: profile })
  }, [state.profiles, set])

  const openProfile = useCallback(() => {
    set({ step: 'player', activeTab: 'overview' })
  }, [set])

  const goBack = useCallback(() => {
    set(prev => ({
      step: prev.step === 'player' ? 'profiles' : 'search',
      error: null,
    }))
  }, [set])

  const setTab = useCallback((tab) => set({ activeTab: tab }), [set])

  return { state, saveApiKey, clearApiKey, lookupPlayer, refreshPlayerData, selectProfile, openProfile, goBack, setTab }
}
