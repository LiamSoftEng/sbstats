import React from 'react'
import { Card, Button, BackButton, Badge } from '../components/UI'
import { parseSkills, avgSkillLevel, fmt, getProfileMember } from '../utils/skyblock'
import s from './pages.module.css'

export default function ProfilesPage({ player, profiles, selected, onSelect, onOpen, onBack }) {
  return (
    <div className={s.page}>
      <BackButton onClick={onBack} />

      <div className={s.profileHeader}>
        <img
          className={s.avatar}
          src={`https://mc-heads.net/avatar/${player.uuid}/64`}
          alt={player.name}
          onError={e => { e.target.style.display = 'none' }}
        />
        <div>
          <div className={s.playerName}>{player.name}</div>
          <div className={s.playerSub}>{profiles.length} SkyBlock profile{profiles.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      <div className={s.profileGrid}>
        {profiles.map(profile => {
          const member = getProfileMember(profile, player.uuid)
          const skills = parseSkills(member ?? {})
          const avg = avgSkillLevel(skills)
          const purse = member?.coin_purse ?? 0
          const bank = profile.banking?.balance ?? 0
          const isSelected = selected?.profile_id === profile.profile_id

          return (
            <button
              key={profile.profile_id}
              className={`${s.profileCard} ${isSelected ? s.profileCardActive : ''}`}
              onClick={() => onSelect(profile.profile_id)}
            >
              <div className={s.profileCardName}>{profile.cute_name || 'Profile'}</div>
              <div className={s.profileCardStat}>Avg skill: <strong>{avg}</strong></div>
              <div className={s.profileCardStat}>Purse: <strong>{fmt(purse)}</strong></div>
              <div className={s.profileCardStat}>Bank: <strong>{fmt(bank)}</strong></div>
              {profile.selected && <Badge color="accent">Active</Badge>}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className={s.openRow}>
          <Button variant="primary" onClick={onOpen}>
            View {selected.cute_name} →
          </Button>
        </div>
      )}
    </div>
  )
}
