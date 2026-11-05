const SKILL_XP = [
  0,50,175,375,675,1175,1925,2925,4425,6425,9925,14925,22425,32425,47425,
  67425,97425,147425,222425,322425,522425,822425,1222425,1722425,2322425,
  3022425,3822425,4722425,5722425,6822425,8022425,9322425,10722425,12222425,
  13822425,15522425,17322425,19222425,21222425,23322425,25522425,27822425,
  30222425,32722425,35322425,38072425,40972425,44072425,47472425,51172425,
  55172425,59472425,64072425,68972425,74172425,79672425,85472425,91572425,
  97972425,104672425,111672425,
]

const RUNE_XP = [
  0,50,150,275,435,635,885,1200,1600,2100,2725,3510,4510,5760,7325,9325,
  11825,14950,18950,23950,30200,38050,47850,60100,75400,94450,
]

const SOCIAL_XP = [
  0,50,150,300,550,1050,1800,2800,4050,5550,7550,10050,13050,16800,21300,
  27300,35300,45300,57800,72800,92800,117800,147800,182800,222800,272800,
]

const DUNGEON_XP = [
  0,50,125,235,395,625,955,1425,2095,3045,4385,6275,8940,12700,17960,25340,
  35640,50040,70040,97640,135640,188140,259640,356640,488640,668640,911640,
  1239640,1684640,2284640,3084640,4149640,5559640,7459640,9959640,13259640,
  17559640,23159640,30359640,39559640,51559640,66559640,85559640,109559640,
  139559640,177559640,225559640,285559640,360559640,453559640,569809640,
]

export function xpToLevel(xp, table = SKILL_XP) {
  let level = 0
  for (let i = 0; i < table.length; i++) {
    if (xp >= table[i]) level = i
    else break
  }
  return level
}

export function xpToProgress(xp, table = SKILL_XP) {
  const level = xpToLevel(xp, table)
  const current = table[level] ?? 0
  const next = table[level + 1]
  if (next === undefined) return 1 // maxed
  return (xp - current) / (next - current)
}

const SKILLS = [
  { key: 'farming',      label: 'Farming',      max: 60 },
  { key: 'mining',       label: 'Mining',        max: 60 },
  { key: 'combat',       label: 'Combat',        max: 60 },
  { key: 'foraging',     label: 'Foraging',      max: 57 },
  { key: 'fishing',      label: 'Fishing',       max: 50 },
  { key: 'enchanting',   label: 'Enchanting',    max: 60 },
  { key: 'alchemy',      label: 'Alchemy',       max: 50 },
  { key: 'carpentry',    label: 'Carpentry',     max: 50 },
  { key: 'taming',       label: 'Taming',        max: 60 },
  { key: 'hunting',      label: 'Hunting',       max: 50 },
  { key: 'runecrafting', label: 'Runecrafting',  max: 25, table: RUNE_XP, average: false },
  { key: 'social',       label: 'Social',        max: 25, table: SOCIAL_XP, average: false },
]

export function parseSkills(member) {
  const experience = member?.player_data?.experience ?? member?.experience ?? {}
  const hasSkillData = SKILLS.some(skill => {
    const skillId = `SKILL_${skill.key.toUpperCase()}`
    return member?.[`experience_skill_${skill.key}`] !== undefined
      || experience[skill.key] !== undefined
      || experience[`skill_${skill.key}`] !== undefined
      || experience[skillId] !== undefined
  })
  if (!hasSkillData) return []

  return SKILLS.map(skill => {
    const skillId = `SKILL_${skill.key.toUpperCase()}`
    const xp = Number(member?.[`experience_skill_${skill.key}`]
      ?? experience[skill.key]
      ?? experience[`skill_${skill.key}`]
      ?? experience[skillId]
      ?? 0)
    const table = skill.table ?? SKILL_XP
    const level = Math.min(xpToLevel(xp, table), skill.max)
    const capXp = table[skill.max] ?? table[table.length - 1]
    return {
      ...skill,
      xp,
      capXp,
      overflowXp: Math.max(0, xp - capXp),
      level,
      progress: level >= skill.max ? 1 : xpToProgress(xp, table),
    }
  })
}

export function avgSkillLevel(skills) {
  const averaged = skills.filter(skill => skill.average !== false)
  if (!averaged.length) return 0
  const total = averaged.reduce((sum, skill) => sum + skill.level + (skill.level < skill.max ? skill.progress : 0), 0)
  return (total / averaged.length).toFixed(1)
}

const SLAYERS = [
  { key: 'zombie',    label: 'Zombie',    icon: '🧟' },
  { key: 'spider',    label: 'Spider',    icon: '🕷️' },
  { key: 'wolf',      label: 'Wolf',      icon: '🐺' },
  { key: 'enderman',  label: 'Enderman',  icon: '🌑' },
  { key: 'blaze',     label: 'Blaze',     icon: '🔥' },
  { key: 'vampire',   label: 'Vampire',   icon: '🧛' },
]

export function parseSlayers(member) {
  const bosses = member?.slayer?.slayer_bosses
    ?? member?.slayer_bosses
    ?? member?.player_data?.slayer_bosses
    ?? {}
  return SLAYERS.map(s => {
    const data = bosses[s.key]
    if (!data) return null
    const xp = data.xp ?? 0
    const kills = Object.entries(data)
      .filter(([k]) => k.startsWith('boss_kills_tier'))
      .reduce((acc, [, v]) => acc + (v ?? 0), 0)
    return { ...s, xp, kills }
  }).filter(Boolean)
}

export function getProfileMember(profile, uuid) {
  const members = profile?.members ?? {}
  const normalizedUuid = uuid?.replace(/-/g, '').toLowerCase()
  const memberKey = Object.keys(members).find(key => key.replace(/-/g, '').toLowerCase() === normalizedUuid)
  return memberKey ? members[memberKey] : {}
}

export function parseDungeons(member) {
  const cata = member?.dungeons?.dungeon_types?.catacombs
  if (!cata) return null
  const xp = cata.experience ?? 0
  const level = xpToLevel(xp, DUNGEON_XP)
  const progress = xpToProgress(xp, DUNGEON_XP)
  const timesPlayed = cata.times_played ?? {}
  const runs = Object.values(timesPlayed).reduce((a, b) => a + b, 0)
  const highestFloor = cata.highest_tier_completed ?? 0

  const classes = member?.dungeons?.player_classes ?? {}
  const classLevels = Object.entries(classes).map(([name, data]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    xp: data.experience ?? 0,
    level: xpToLevel(data.experience ?? 0, DUNGEON_XP),
  }))

  const master = member?.dungeons?.dungeon_types?.master_catacombs ?? {}
  const floors = [
    { id: 'entrance', label: 'Entrance', tier: 0 },
    ...Array.from({ length: 7 }, (_, index) => ({
      id: `tier_${index + 1}`,
      label: `Floor ${['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'][index]}`,
      tier: index + 1,
    })),
  ]
  const personalBests = floors.map(floor => ({
    ...floor,
    normal: getFloorTimes(cata, floor),
    master: floor.tier ? getFloorTimes(master, floor, true) : null,
  }))

  return { level, progress, xp, runs, highestFloor, classLevels, personalBests }
}

function getFloorTimes(dungeon, floor, masterMode = false) {
  const keys = masterMode
    ? [String(floor.tier), `tier_${floor.tier}`, `master_tier_${floor.tier}`, `master_${floor.tier}`]
    : [floor.id, floor.tier ? String(floor.tier) : '0', `tier_${floor.tier}`]
  const readTime = source => {
    for (const key of keys) {
      const value = source?.[key]
      if (value !== undefined && value !== null) {
        if (typeof value === 'object' && value.seconds !== undefined) return Number(value.seconds) * 1000
        return Number(value.milliseconds ?? value.time ?? value)
      }
    }
    return null
  }
  return {
    fastest: readTime(dungeon?.fastest_time),
    s: readTime(dungeon?.fastest_time_s),
    sPlus: readTime(dungeon?.fastest_time_s_plus),
  }
}

export function fmtDuration(value) {
  if (value === null || value === undefined || !Number.isFinite(value) || value <= 0) return 'N/A'
  const seconds = value / 1000
  const minutes = Math.floor(seconds / 60)
  const remainder = (seconds - minutes * 60).toFixed(2).padStart(5, '0')
  return `${minutes}:${remainder}`
}

export function fmt(n) {
  if (n === undefined || n === null) return '—'
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'k'
  return Math.round(n).toLocaleString()
}

export function fmtDate(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}
