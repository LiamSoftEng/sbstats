import React from 'react'
import { useStore } from './hooks/useStore'
import ApiKeyPage   from './pages/ApiKeyPage'
import SearchPage   from './pages/SearchPage'
import ProfilesPage from './pages/ProfilesPage'
import PlayerPage   from './pages/PlayerPage'

export default function App() {
  const { state, saveApiKey, clearApiKey, lookupPlayer, refreshPlayerData, selectProfile, openProfile, goBack, setTab } = useStore()
  const { step, apiKey, player, profiles, selectedProfile, activeTab, loading, error } = state

  // If a saved API key exists, skip straight to search
  if (step === 'apiKey' && apiKey) {
    return (
      <SearchPage
        apiKey={apiKey}
        onSearch={lookupPlayer}
        onClearKey={clearApiKey}
        loading={loading}
        error={error}
      />
    )
  }

  if (step === 'apiKey') {
    return <ApiKeyPage onSubmit={saveApiKey} error={error} />
  }

  if (step === 'search') {
    return (
      <SearchPage
        apiKey={apiKey}
        onSearch={lookupPlayer}
        onClearKey={clearApiKey}
        loading={loading}
        error={error}
      />
    )
  }

  if (step === 'profiles') {
    return (
      <ProfilesPage
        player={player}
        profiles={profiles}
        selected={selectedProfile}
        onSelect={selectProfile}
        onOpen={openProfile}
        onBack={goBack}
      />
    )
  }

  if (step === 'player') {
    return (
      <PlayerPage
        player={player}
        profile={selectedProfile}
        activeTab={activeTab}
        onTabChange={setTab}
        onBack={goBack}
        onRefresh={refreshPlayerData}
        refreshing={state.refreshing}
        lastFetchedAt={state.lastFetchedAt}
        refreshError={error}
      />
    )
  }

  return null
}
