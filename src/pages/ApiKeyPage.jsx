import React, { useState } from 'react'
import { Card, Input, Button, ErrorMsg } from '../components/UI'
import s from './pages.module.css'

export default function ApiKeyPage({ onSubmit, error }) {
  const [key, setKey] = useState('')

  function submit() {
    if (key.trim()) onSubmit(key.trim())
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
        <div className={s.stepLabel}>API key</div>
        <p className={s.hint}>
          Enter your Hypixel API key to get started.
        </p>
        <div className={s.row}>
          <Input
            value={key}
            onChange={setKey}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            type="password"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
          <Button variant="primary" onClick={submit} disabled={!key.trim()}>
            Continue →
          </Button>
        </div>
        <ErrorMsg message={error} />
      </Card>
    </div>
  )
}
