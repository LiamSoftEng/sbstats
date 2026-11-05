import React from 'react'
import { Card, StatCard, SkillBar, Tabs, BackButton, SectionLabel, Divider, Button, ErrorMsg } from '../components/UI'
import DataExplorer from '../components/DataExplorer'
import { parseSkills, parseSlayers, parseDungeons, fmt, fmtDate, fmtDuration, avgSkillLevel, getProfileMember } from '../utils/skyblock'
import s from './pages.module.css'

const TABS = [
  { id: 'overview',  label: 'Overview'  },
  { id: 'skills',    label: 'Skills'    },
  { id: 'slayers',   label: 'Slayers'   },
  { id: 'dungeons',  label: 'Dungeons'  },
  { id: 'glacite',   label: 'Glacite Tunnels' },
  { id: 'raw',       label: 'Data'      },
]

export default function PlayerPage({ player, profile, activeTab, onTabChange, onBack, onRefresh, refreshing, lastFetchedAt, refreshError }) {
  const member = getProfileMember(profile, player.uuid)
  const skills   = parseSkills(member)
  const slayers  = parseSlayers(member)
  const dungeons = parseDungeons(member)
  const purse = member.coin_purse ?? 0
  const bank  = profile.banking?.balance ?? 0

  return (
    <div className={s.page}>
      <BackButton onClick={onBack} />

      <Card className={s.playerHeaderCard}>
        <div className={s.playerHeaderInner}>
          <img
            className={s.avatar}
            src={`https://mc-heads.net/avatar/${player.uuid}/56`}
            alt={player.name}
            onError={e => { e.target.style.display = 'none' }}
          />
          <div>
            <div className={s.playerName}>{player.name}</div>
            <div className={s.cacheControls}>
              <span className={s.playerSub}>{lastFetchedAt ? `Data fetched: ${new Date(lastFetchedAt).toLocaleString()}` : 'Data not cached'}</span>
              <Button onClick={onRefresh} disabled={refreshing}>{refreshing ? 'Refreshing…' : 'Refresh data'}</Button>
            </div>
            <ErrorMsg message={refreshError} />
            <div className={s.playerSub}>
              {profile.cute_name} · Last saved: {fmtDate(member.last_save)}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <Tabs tabs={TABS} active={activeTab} onChange={onTabChange} />

        {activeTab === 'overview'  && <OverviewTab member={member} skills={skills} slayers={slayers} dungeons={dungeons} purse={purse} bank={bank} />}
        {activeTab === 'skills'    && <SkillsTab skills={skills} />}
        {activeTab === 'slayers'   && <SlayersTab slayers={slayers} />}
        {activeTab === 'dungeons'  && <DungeonsTab dungeons={dungeons} member={member} />}
        {activeTab === 'glacite'   && <GlaciteTab member={member} />}
        {activeTab === 'raw'       && <RawTab member={member} />}
      </Card>
    </div>
  )
}

function OverviewTab({ member, skills, slayers, dungeons, purse, bank }) {
  const avg = avgSkillLevel(skills)
  const totalSlayerXP = slayers.reduce((a, s) => a + s.xp, 0)

  return (
    <>
      <div className={s.statGrid}>
        <StatCard label="Purse" value={fmt(purse)} sub="coins" color="var(--amber)" />
        <StatCard label="Bank" value={fmt(bank)} sub="coins" color="var(--amber)" />
        <StatCard label="Avg skill" value={avg} color="var(--accent)" />
        <StatCard label="Catacombs" value={dungeons ? dungeons.level : '—'} />
        <StatCard label="Slayer XP" value={fmt(totalSlayerXP)} />
        <StatCard label="Fairy souls" value={member.fairy_souls_collected ?? 0} />
      </div>

      <Divider />
      <SectionLabel>Skills snapshot</SectionLabel>
      {skills.slice(0, 7).map(sk => (
        <SkillBar key={sk.key} name={sk.label} level={sk.level} max={sk.max} progress={sk.progress} xp={sk.xp} overflowXp={sk.overflowXp} />
      ))}
    </>
  )
}

function SkillsTab({ skills }) {
  if (!skills.length) return <Empty>No skill data — the player may have their API disabled.</Empty>
  return skills.map(sk => (
    <SkillBar key={sk.key} name={sk.label} level={sk.level} max={sk.max} progress={sk.progress} xp={sk.xp} overflowXp={sk.overflowXp} />
  ))
}

function SlayersTab({ slayers }) {
  if (!slayers.length) return <Empty>Hypixel did not include slayer stats in this profile response. Check that the Slayer API is enabled for this profile, then look the player up again.</Empty>
  return (
    <div className={s.statGrid}>
      {slayers.map(sl => (
        <StatCard
          key={sl.key}
          label={`${sl.icon} ${sl.label}`}
          value={fmt(sl.xp)}
          sub={`${sl.kills.toLocaleString()} kills`}
        />
      ))}
    </div>
  )
}

function GlaciteTab({ member }) {
  const glacite = member.glacite_player_data
  if (!glacite) return <Empty>No Glacite Tunnels data was included in this profile response.</Empty>

  const fossils = Array.isArray(glacite.fossils_donated) ? glacite.fossils_donated : []
  const corpses = glacite.corpses_looted ?? {}
  const corpseTypes = [
    ['tungsten', 'Tungsten'],
    ['umber', 'Umber'],
    ['lapis', 'Lapis'],
    ['vanguard', 'Vanguard'],
  ]

  return (
    <>
      <div className={s.statGrid}>
        <StatCard label="Mineshafts entered" value={fmt(glacite.mineshafts_entered ?? 0)} />
        <StatCard label="Fossil dust" value={fmt(glacite.fossil_dust ?? 0)} />
        <StatCard label="Fossils donated" value={fmt(fossils.length)} />
      </div>

      <Divider />
      <SectionLabel>Corpses looted</SectionLabel>
      <div className={s.statGrid}>
        {corpseTypes.map(([key, label]) => (
          <StatCard key={key} label={`${label} corpses`} value={fmt(corpses[key] ?? 0)} />
        ))}
      </div>

      <Divider />
      <SectionLabel>Fossils donated</SectionLabel>
      {fossils.length === 0 ? (
        <Empty>No donated fossils recorded.</Empty>
      ) : (
        <div className={s.fossilList}>
          {fossils.map((fossil, index) => (
            <span className={s.fossilChip} key={`${fossil}-${index}`}>{formatDataLabel(fossil)}</span>
          ))}
        </div>
      )}
    </>
  )
}

function formatDataLabel(value) {
  return String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

function DungeonsTab({ dungeons }) {
  if (!dungeons) return <Empty>No dungeon data found.</Empty>
  return (
    <>
      <div className={s.statGrid}>
        <StatCard label="Catacombs level" value={dungeons.level} color="var(--accent)" />
        <StatCard label="Total runs" value={fmt(dungeons.runs)} />
        <StatCard label="Highest floor" value={`F${dungeons.highestFloor}`} />
        <StatCard label="Total XP" value={fmt(dungeons.xp)} />
      </div>

      {dungeons.classLevels.length > 0 && (
        <>
          <Divider />
          <SectionLabel>Class levels</SectionLabel>
          <div className={s.statGrid}>
            {dungeons.classLevels.map(cls => (
              <StatCard key={cls.name} label={cls.name} value={cls.level} sub={`${fmt(cls.xp)} xp`} />
            ))}
          </div>
        </>
      )}

      <Divider />
      <SectionLabel>Personal best times</SectionLabel>
      <div className={s.dungeonTimesWrap}>
        <table className={s.dungeonTimes}>
          <thead>
            <tr>
              <th>Floor</th>
              <th>Best</th>
              <th>S</th>
              <th>S+</th>
              <th>Master best</th>
              <th>Master S</th>
              <th>Master S+</th>
            </tr>
          </thead>
          <tbody>
            {dungeons.personalBests.map(floor => (
              <tr key={floor.id}>
                <th>{floor.label}</th>
                <td>{fmtDuration(floor.normal.fastest)}</td>
                <td>{fmtDuration(floor.normal.s)}</td>
                <td>{fmtDuration(floor.normal.sPlus)}</td>
                <td>{floor.master ? fmtDuration(floor.master.fastest) : '—'}</td>
                <td>{floor.master ? fmtDuration(floor.master.s) : '—'}</td>
                <td>{floor.master ? fmtDuration(floor.master.sPlus) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function RawTab({ member }) {
  return <DataExplorer data={member} />
}

function Empty({ children }) {
  return <p className={s.empty}>{children}</p>
}
