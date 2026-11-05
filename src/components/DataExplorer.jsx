import React, { useMemo, useState } from 'react'
import s from './DataExplorer.module.css'

function isBranch(value) {
  return value !== null && typeof value === 'object'
}

function getAtPath(value, path) {
  return path.reduce((node, key) => node?.[key], value)
}

function humanize(key) {
  return String(key)
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase())
}

function describe(value) {
  if (Array.isArray(value)) return `${value.length.toLocaleString()} items`
  if (value && typeof value === 'object') return `${Object.keys(value).length.toLocaleString()} fields`
  if (typeof value === 'string') return value.length > 56 ? `${value.slice(0, 56)}…` : value
  if (value === null) return 'null'
  return String(value)
}

export default function DataExplorer({ data, rootLabel = 'Member data' }) {
  const [path, setPath] = useState([])
  const [showRaw, setShowRaw] = useState(false)
  const current = getAtPath(data, path)
  const entries = useMemo(() => {
    if (Array.isArray(current)) return current.map((value, index) => [index, value])
    if (current && typeof current === 'object') return Object.entries(current)
    return []
  }, [current])

  function navigate(nextPath) {
    setPath(nextPath)
    setShowRaw(false)
  }

  return (
    <div className={s.explorer}>
      <nav className={s.breadcrumbs} aria-label="Data location">
        <button className={s.crumb} onClick={() => navigate([])}>{rootLabel}</button>
        {path.map((key, index) => (
          <React.Fragment key={`${key}-${index}`}>
            <span className={s.crumbSeparator}>/</span>
            <button className={s.crumb} onClick={() => navigate(path.slice(0, index + 1))}>
              {humanize(key)}
            </button>
          </React.Fragment>
        ))}
      </nav>

      {isBranch(current) ? (
        <>
          <div className={s.sectionHeading}>
            <div>
              <h3>{path.length ? humanize(path[path.length - 1]) : rootLabel}</h3>
              <span>{describe(current)}</span>
            </div>
            <button className={s.rawToggle} onClick={() => setShowRaw(value => !value)}>
              {showRaw ? 'Hide raw view' : 'View raw JSON'}
            </button>
          </div>

          {entries.length === 0 ? (
            <p className={s.empty}>This section is empty.</p>
          ) : (
            <div className={s.branchMenu}>
              {entries.map(([key, value]) => (
                <button className={s.branchButton} key={key} onClick={() => navigate([...path, key])}>
                  <span className={s.branchText}>
                    <span className={s.branchName}>{humanize(key)}</span>
                    <span className={s.branchKey}>{Array.isArray(current) ? `Item ${Number(key) + 1}` : String(key)}</span>
                  </span>
                  <span className={s.branchSummary}>{describe(value)}</span>
                  {isBranch(value) && <span className={s.branchArrow}>›</span>}
                </button>
              ))}
            </div>
          )}

          {showRaw && (
            <div className={s.rawPanel}>
              <JsonNode data={current} />
            </div>
          )}
        </>
      ) : (
        <div className={s.valuePanel}>
          <div className={s.sectionHeading}>
            <div>
              <h3>{humanize(path[path.length - 1] ?? rootLabel)}</h3>
              <span>Raw value</span>
            </div>
          </div>
          <div className={s.rawPanel}><JsonNode data={current} /></div>
        </div>
      )}
    </div>
  )
}

function JsonNode({ data, depth = 0 }) {
  const [open, setOpen] = useState(depth < 1)

  if (data === undefined) return <span className={s.undefined}>undefined</span>
  if (data === null) return <span className={s.null}>null</span>
  if (typeof data === 'boolean') return <span className={s.bool}>{String(data)}</span>
  if (typeof data === 'number') return <span className={s.num}>{data}</span>
  if (typeof data === 'string') return <span className={s.stringValue}>{JSON.stringify(data)}</span>

  const isArray = Array.isArray(data)
  const entries = isArray ? data.slice(0, 100) : Object.entries(data).slice(0, 100)
  const count = isArray ? data.length : Object.keys(data).length
  const extra = count - entries.length
  const brackets = isArray ? ['[', ']'] : ['{', '}']

  if (count === 0) return <span className={s.punctuation}>{brackets[0]}{brackets[1]}</span>

  return (
    <span>
      <button className={s.nodeToggle} onClick={() => setOpen(value => !value)} aria-label={open ? 'Collapse branch' : 'Expand branch'}>
        {open ? '▾' : '▸'}
      </button>
      <span className={s.punctuation}>{brackets[0]}</span>
      {!open && <button className={s.nodePreview} onClick={() => setOpen(true)}>{count} {isArray ? 'items' : 'fields'}</button>}
      {open && (
        <div className={s.nodeChildren}>
          {entries.map((entry, index) => {
            const key = isArray ? index : entry[0]
            const value = isArray ? entry : entry[1]
            return (
              <div className={s.nodeEntry} key={key}>
                {!isArray && <><span className={s.key}>{JSON.stringify(key)}</span><span className={s.colon}>: </span></>}
                <JsonNode data={value} depth={depth + 1} />
                {index < entries.length - 1 && <span className={s.punctuation}>,</span>}
              </div>
            )
          })}
          {extra > 0 && <div className={s.more}>… {extra} more</div>}
        </div>
      )}
      <span className={s.punctuation}>{brackets[1]}</span>
    </span>
  )
}
