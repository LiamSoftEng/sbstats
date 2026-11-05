import React from 'react'
import s from './UI.module.css'

export function Card({ children, className = '', style }) {
  return <div className={`${s.card} ${className}`} style={style}>{children}</div>
}

export function StatCard({ label, value, sub, color }) {
  return (
    <div className={s.statCard}>
      <div className={s.statLabel}>{label}</div>
      <div className={s.statValue} style={color ? { color } : undefined}>{value}</div>
      {sub && <div className={s.statSub}>{sub}</div>}
    </div>
  )
}

export function SkillBar({ name, level, max, progress, xp, overflowXp }) {
  const tooltip = xp === undefined
    ? undefined
    : `${name}: ${Math.floor(xp).toLocaleString()} XP${level >= max ? `\nOverflow: ${Math.floor(overflowXp ?? 0).toLocaleString()} XP` : ''}`
  return (
    <div className={s.skillRow} title={tooltip}>
      <span className={s.skillName}>{name}</span>
      <div className={s.barTrack}>
        <div className={s.barFill} style={{ width: `${Math.min(progress * 100, 100).toFixed(1)}%` }} />
      </div>
      <span className={s.skillLevel}>
        {level}
        <span className={s.skillMax}>/{max}</span>
      </span>
    </div>
  )
}

export function Button({ children, onClick, variant = 'default', disabled, style }) {
  return (
    <button
      className={`${s.btn} ${s[`btn_${variant}`] || ''}`}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  )
}

export function Input({ value, onChange, onKeyDown, placeholder, type = 'text', autoFocus }) {
  return (
    <input
      className={s.input}
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      autoFocus={autoFocus}
      spellCheck={false}
    />
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className={s.tabs}>
      {tabs.map(t => (
        <button
          key={t.id}
          className={`${s.tab} ${active === t.id ? s.tabActive : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Badge({ children, color = 'default' }) {
  return <span className={`${s.badge} ${s[`badge_${color}`] || ''}`}>{children}</span>
}

export function Spinner() {
  return <div className={s.spinner} />
}

export function ErrorMsg({ message }) {
  return message ? <div className={s.error}>{message}</div> : null
}

export function BackButton({ onClick }) {
  return (
    <button className={s.backBtn} onClick={onClick}>
      ← Back
    </button>
  )
}

export function Divider() {
  return <div className={s.divider} />
}

export function SectionLabel({ children }) {
  return <div className={s.sectionLabel}>{children}</div>
}
