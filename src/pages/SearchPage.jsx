import React, { useState } from 'react'
import { Card, Input, Button, ErrorMsg, Spinner, Badge } from '../components/UI'
import s from './pages.module.css'

export default function SearchPage({ apiKey, onSearch, onClearKey, loading, error }) {
  const [name, setName] = useState('')

  function submit() {
    if (name.trim()) onSearch(name.trim())
  }

  return (
    <div className={s.center}>
      <div className={s.logo}>
        <span className={s.logoIcon}>⛏</span>
        <div>
          <div className={s.logoTitle}>SkyBlock Viewer</div>
          <div className={s.logoSub}>Hypixel</div>
        </div>
      </div>

      <Card className={s.authCard}>
        <div className={s.keyRow}>
          <div className={s.stepLabel} style={{ margin: 0 }}>API key</div>
          <Badge color="green">✓ saved</Badge>
          <button className={s.changeKey} onClick={onClearKey}>Change</button>
        </div>
      </Card>

      <Card className={s.authCard}>
        <div className={s.stepLabel}>Player name</div>
        <div className={s.row}>
          <Input
            value={name}
            onChange={setName}
            placeholder="e.g. Technoblade"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
          <Button variant="primary" onClick={submit} disabled={loading || !name.trim()}>
            {loading ? <Spinner /> : 'Look up →'}
          </Button>
        </div>
        <ErrorMsg message={error} />
      </Card>
    </div>
  )
}
