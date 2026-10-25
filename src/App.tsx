import { useMemo, useState, useEffect } from 'react'

type IconName = 'home' | 'sparkles' | 'dish' | 'laundry' | 'trash' | 'broom' | 'bath' | 'plus' | 'check' | 'minus' | 'users' | 'chevron'

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    home: <><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    sparkles: <><path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2L12 3Z"/><path d="m5 14 .8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8L5 14Zm14-1 .7 1.8 1.8.7-1.8.7L19 18l-.7-1.8-1.8-.7 1.8-.7L19 13Z"/></>,
    dish: <><path d="M4 10h16a8 8 0 0 1-16 0Z"/><path d="M8 6h.01M12 4h.01M16 6h.01M7 20h10"/></>,
    laundry: <><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h.01M12 6h4"/><circle cx="12" cy="14" r="5"/><path d="M9 14c2-2 4 2 6 0"/></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/></>,
    broom: <><path d="m15 3-6 11M8 13l-4 7h11l-4-7H8Z"/></>,
    bath: <><path d="M3 12h18v3a6 6 0 0 1-6 6H9a6 6 0 0 1-6-6v-3ZM7 12V6a3 3 0 0 1 5-2"/><path d="M7 21v1M17 21v1"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    minus: <path d="M5 12h14"/>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

type ScheduleType = 'daily' | 'weekly' | 'every_other'

interface Chore {
  id: number
  name: string
  detail: string
  points: number
  icon: IconName
  color: string
  schedule: ScheduleType
  weeklyDay?: string
  startDayIndex: number
}

interface Member {
  id: number
  name: string
  initials: string
  points: number | string
  color: string
}

interface HouseholdData {
  members: Member[]
  chores: Chore[]
  completed: number[]
  dayCounter: number
  streak: number
  activityLog: string[]
}

const defaultChores: Chore[] = [
  { id: 1, name: 'Wash the dishes', detail: 'Kitchen · Daily', points: 10, icon: 'dish', color: 'peach', schedule: 'daily', startDayIndex: 0 },
  { id: 2, name: 'Do the laundry', detail: 'Laundry room · Every other day', points: 20, icon: 'laundry', color: 'blue', schedule: 'every_other', startDayIndex: 0 },
  { id: 3, name: 'Take out trash', detail: 'Whole home · Weekly (Fri)', points: 8, icon: 'trash', color: 'green', schedule: 'weekly', weeklyDay: 'Fri', startDayIndex: 0 },
  { id: 4, name: 'Sweep the floors', detail: 'Living areas · Every other day', points: 15, icon: 'broom', color: 'yellow', schedule: 'every_other', startDayIndex: 1 },
  { id: 5, name: 'Clean the bathroom', detail: 'Upstairs · Weekly (Sun)', points: 25, icon: 'bath', color: 'lavender', schedule: 'weekly', weeklyDay: 'Sun', startDayIndex: 0 },
]

const defaultMembers: Member[] = [
  { id: 1, name: 'You', initials: 'YO', points: 0, color: 'coral' }
]

const AVAILABLE_COLORS = ['coral', 'purple', 'teal', 'blue', 'yellow', 'red']
const CHORE_COLORS = ['peach', 'blue', 'green', 'yellow', 'lavender', 'pink']

export default function App() {
  const [households, setHouseholds] = useState<string[]>(() => {
    const saved = localStorage.getItem('tidy_households')
    return saved ? JSON.parse(saved) : ['Home']
  })
  
  const [activeHousehold, setActiveHousehold] = useState<string>(() => {
    const saved = localStorage.getItem('tidy_active_house')
    return saved || 'Home'
  })

  const [householdDataMap, setHouseholdDataMap] = useState<Record<string, HouseholdData>>(() => {
    const saved = localStorage.getItem('tidy_house_data_map')
    if (saved) return JSON.parse(saved)
    return {
      'Home': {
        members: defaultMembers,
        chores: defaultChores,
        completed: [],
        dayCounter: 0,
        streak: 1,
        activityLog: ['Household initialized on Mon.']
      }
    }
  })

  useEffect(() => {
    localStorage.setItem('tidy_households', JSON.stringify(households))
    localStorage.setItem('tidy_active_house', activeHousehold)
    localStorage.setItem('tidy_house_data_map', JSON.stringify(householdDataMap))
  }, [households, activeHousehold, householdDataMap])

  const currentData = householdDataMap[activeHousehold] || {
    members: defaultMembers,
    chores: defaultChores,
    completed: [],
    dayCounter: 0,
    streak: 0,
    activityLog: ['Household initialized.']
  }

  const { members, chores, completed, dayCounter, streak, activityLog } = currentData
  const currentDayName = DAYS_OF_WEEK[dayCounter % 7]

  function updateCurrentHousehold(updater: (prev: HouseholdData) => HouseholdData) {
    setHouseholdDataMap(prevMap => {
      const current = prevMap[activeHousehold] || {
        members: defaultMembers,
        chores: defaultChores,
        completed: [],
        dayCounter: 0,
        streak: 0,
        activityLog: []
      }
      return {
        ...prevMap,
        [activeHousehold]: updater(current)
      }
    })
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'chores' | 'members' | 'households'>('overview')

  const [modal, setModal] = useState<'household' | 'member' | 'chore' | 'deduct' | 'confirm' | 'completeChore' | 'editMember' | 'editChore' | 'editHousehold' | null>(null)
  const [name, setName] = useState('')
  const [editingHouseName, setEditingHouseName] = useState('')
  const [targetHouseToEdit, setTargetHouseToEdit] = useState<string | null>(null)

  const [selectedMemberId, setSelectedMemberId] = useState<number>(1)
  const [deductAmount, setDeductAmount] = useState<string | number>(5)
  const [deductReason, setDeductReason] = useState<string>('')

  const [selectedChoreId, setSelectedChoreId] = useState<number | null>(null)
  const [completingMemberId, setCompletingMemberId] = useState<number>(1)

  const [editingMember, setEditingMember] = useState<Member | null>(null)

  const [chorePoints, setChorePoints] = useState<string | number>(10)
  const [choreColor, setChoreColor] = useState<string>('pink')
  const [choreSchedule, setChoreSchedule] = useState<ScheduleType>('daily')
  const [choreWeeklyDay, setChoreWeeklyDay] = useState<string>('Mon')
  const [editingChore, setEditingChore] = useState<Chore | null>(null)

  const total = useMemo(() => members.reduce((sum, member) => sum + (Number(member.points) || 0), 0), [members])

  const sortedMembers = useMemo(() => {
    return [...members].sort((a, b) => (Number(b.points) || 0) - (Number(a.points) || 0))
  }, [members])

  function isChoreActiveOnDay(chore: Chore, dayName: string, dayIdx: number) {
    if (chore.schedule === 'daily') return true
    if (chore.schedule === 'weekly') return chore.weeklyDay === dayName
    if (chore.schedule === 'every_other') {
      return Math.abs(dayIdx - chore.startDayIndex) % 2 === 0
    }
    return true
  }

  const todayChores = useMemo(() => {
    return chores.filter(chore => isChoreActiveOnDay(chore, currentDayName, dayCounter))
  }, [chores, dayCounter, currentDayName])

  const todayGoalPoints = useMemo(() => {
    return todayChores.reduce((sum, chore) => sum + chore.points, 0)
  }, [todayChores])

  const todayEarnedPoints = useMemo(() => {
    return todayChores
      .filter(chore => completed.includes(chore.id))
      .reduce((sum, chore) => sum + chore.points, 0)
  }, [todayChores, completed])

  const progressPercentage = todayGoalPoints > 0 ? Math.min(100, (todayEarnedPoints / todayGoalPoints) * 100) : 0

  function advanceToNextDay() {
    const nextCounter = dayCounter + 1
    const nextDayName = DAYS_OF_WEEK[nextCounter % 7]
    
    // Check if all chores scheduled for today were completed
    const allTodayCompleted = todayChores.length > 0 && todayChores.every(c => completed.includes(c.id))
    const newStreak = allTodayCompleted ? streak + 1 : (todayChores.length === 0 ? streak : 0)

    let streakMessage = ''
    if (allTodayCompleted) streakMessage = ` 🔥 Streak increased to ${newStreak} days!`
    else if (todayChores.length > 0) streakMessage = ` 💔 Streak reset (incomplete tasks).`

    updateCurrentHousehold(prev => ({
      ...prev,
      dayCounter: nextCounter,
      streak: newStreak,
      completed: prev.completed.filter(choreId => {
        const chore = prev.chores.find(c => c.id === choreId)
        if (!chore) return false
        if (isChoreActiveOnDay(chore, nextDayName, nextCounter)) return false
        return true
      }),
      activityLog: [`Advanced to ${nextDayName}.${streakMessage}`, ...prev.activityLog.slice(0, 4)]
    }))
  }

  const handleOpenCompleteModal = (id: number) => {
    if (completed.includes(id)) return
    setSelectedChoreId(id)
    setCompletingMemberId(members[0]?.id || 1)
    setModal('completeChore')
  }

  function confirmCompleteChore() {
    if (selectedChoreId === null) return
    const targetChore = chores.find(c => c.id === selectedChoreId)
    const targetMember = members.find(m => m.id === completingMemberId)
    
    if (!targetChore || !targetMember) return

    updateCurrentHousehold(prev => ({
      ...prev,
      completed: [...prev.completed, selectedChoreId],
      members: prev.members.map(m => m.id === completingMemberId ? { ...m, points: (Number(m.points) || 0) + targetChore.points } : m),
      activityLog: [`${targetMember.name} completed "${targetChore.name}" (+${targetChore.points} pts)`, ...prev.activityLog.slice(0, 4)]
    }))
    setModal(null)
    setSelectedChoreId(null)
  }

  function openDeductModal() {
    setSelectedMemberId(members[0]?.id || 1)
    setDeductAmount(5)
    setDeductReason('')
    setModal('deduct')
  }

  function handleDeductSubmit() {
    const amt = Number(deductAmount) || 0
    if (amt > 25) {
      setModal('confirm') 
    } else {
      executeDeduction()
    }
  }

  function executeDeduction() {
    const targetMember = members.find(m => m.id === selectedMemberId)
    const amt = Number(deductAmount) || 0
    updateCurrentHousehold(prev => ({
      ...prev,
      members: prev.members.map(m => {
        if (m.id === selectedMemberId) {
          return { ...m, points: Math.max(0, (Number(m.points) || 0) - amt) }
        }
        return m
      }),
      activityLog: [
        `Penalty: -${amt} pts on ${targetMember?.name || 'Member'}${deductReason ? ` (${deductReason})` : ''}`, 
        ...prev.activityLog.slice(0, 4)
      ]
    }))
    setModal(null)
  }

  function handleOpenEditMember(member: Member) {
    setEditingMember(member)
    setModal('editMember')
  }

  function saveEditedMember() {
    if (!editingMember || !editingMember.name.trim()) return
    const cleanName = editingMember.name.trim()
    updateCurrentHousehold(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === editingMember.id ? { 
        ...m, 
        name: cleanName, 
        initials: cleanName.slice(0, 2).toUpperCase(), 
        color: editingMember.color,
        points: editingMember.points === '' ? 0 : Number(editingMember.points)
      } : m),
      activityLog: [`Updated profile for ${cleanName}`, ...prev.activityLog.slice(0, 4)]
    }))
    setModal(null)
    setEditingMember(null)
  }

  function deleteMember(id: number) {
    if (members.length <= 1) {
      alert("You must keep at least one member in the household!")
      return
    }
    updateCurrentHousehold(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== id),
      activityLog: ['Removed a household member', ...prev.activityLog.slice(0, 4)]
    }))
    setModal(null)
    setEditingMember(null)
  }

  function handleOpenEditChore(chore: Chore) {
    setEditingChore(chore)
    setName(chore.name)
    setChorePoints(chore.points)
    setChoreColor(chore.color)
    setChoreSchedule(chore.schedule)
    setChoreWeeklyDay(chore.weeklyDay || 'Mon')
    setModal('editChore')
  }

  function saveEditedChore() {
    if (!editingChore || !name.trim()) return
    const cleanName = name.trim()
    const pointsToAssign = Number(chorePoints) || 10
    
    let detailStr = 'Custom · '
    if (choreSchedule === 'daily') detailStr += 'Daily'
    else if (choreSchedule === 'weekly') detailStr += `Weekly (${choreWeeklyDay})`
    else if (choreSchedule === 'every_other') detailStr += 'Every other day'

    updateCurrentHousehold(prev => ({
      ...prev,
      chores: prev.chores.map(c => c.id === editingChore.id ? {
        ...c,
        name: cleanName,
        points: pointsToAssign,
        color: choreColor,
        schedule: choreSchedule,
        weeklyDay: choreSchedule === 'weekly' ? choreWeeklyDay : undefined,
        detail: detailStr
      } : c),
      activityLog: [`Updated chore "${cleanName}"`, ...prev.activityLog.slice(0, 4)]
    }))
    setModal(null)
    setEditingChore(null)
    setName('')
  }

  function deleteChore(id: number) {
    updateCurrentHousehold(prev => ({
      ...prev,
      chores: prev.chores.filter(c => c.id !== id),
      activityLog: ['Deleted a chore', ...prev.activityLog.slice(0, 4)]
    }))
    setModal(null)
    setEditingChore(null)
  }

  function clearAllChores() {
    if (!window.confirm(`Are you sure you want to clear ALL chores from "${activeHousehold}"?`)) return
    updateCurrentHousehold(prev => ({
      ...prev,
      chores: [],
      completed: [],
      activityLog: ['Cleared all chores.', ...prev.activityLog.slice(0, 4)]
    }))
  }

  function resetCurrentHousehold() {
    if (!window.confirm(`Are you sure you want to reset "${activeHousehold}" to default settings?`)) return
    setHouseholdDataMap(prev => ({
      ...prev,
      [activeHousehold]: {
        members: defaultMembers,
        chores: defaultChores,
        completed: [],
        dayCounter: 0,
        streak: 1,
        activityLog: ['Household reset to default.']
      }
    }))
  }

  function handleOpenEditHousehold(houseName: string) {
    setTargetHouseToEdit(houseName)
    setEditingHouseName(houseName)
    setModal('editHousehold')
  }

  function saveEditedHousehold() {
    const clean = editingHouseName.trim()
    if (!clean || !targetHouseToEdit) return
    if (households.includes(clean) && clean !== targetHouseToEdit) {
      alert("A household with this name already exists!")
      return
    }

    setHouseholds(households.map(h => h === targetHouseToEdit ? clean : h))
    setHouseholdDataMap(prev => {
      const mapCopy = { ...prev }
      if (mapCopy[targetHouseToEdit]) {
        mapCopy[clean] = mapCopy[targetHouseToEdit]
        if (targetHouseToEdit !== clean) {
          delete mapCopy[targetHouseToEdit]
        }
      }
      return mapCopy
    })

    if (activeHousehold === targetHouseToEdit) {
      setActiveHousehold(clean)
    }

    setModal(null)
    setTargetHouseToEdit(null)
    setEditingHouseName('')
  }

  function deleteHousehold(houseName: string) {
    if (households.length <= 1) {
      alert("You must keep at least one household!")
      return
    }
    if (!window.confirm(`Are you sure you want to delete household "${houseName}"?`)) return

    const remainingHouses = households.filter(h => h !== houseName)
    setHouseholds(remainingHouses)

    setHouseholdDataMap(prev => {
      const mapCopy = { ...prev }
      delete mapCopy[houseName]
      return mapCopy
    })

    if (activeHousehold === houseName) {
      setActiveHousehold(remainingHouses[0])
    }
  }

  function submitModal() {
    const clean = name.trim()
    if (!clean) return
    if (modal === 'household') {
      if (!households.includes(clean)) {
        setHouseholds([...households, clean])
        setHouseholdDataMap(prev => ({
          ...prev,
          [clean]: {
            members: defaultMembers,
            chores: defaultChores,
            completed: [],
            dayCounter: 0,
            streak: 0,
            activityLog: [`Household "${clean}" created.`]
          }
        }))
      }
      setActiveHousehold(clean)
    }
    if (modal === 'member') {
      const assignedColor = AVAILABLE_COLORS[members.length % AVAILABLE_COLORS.length]
      const newMem = { id: Date.now(), name: clean, initials: clean.slice(0, 2).toUpperCase(), points: 0, color: assignedColor }
      updateCurrentHousehold(prev => ({
        ...prev,
        members: [...prev.members, newMem],
        activityLog: [`Added new member "${clean}"`, ...prev.activityLog.slice(0, 4)]
      }))
    }
    if (modal === 'chore') {
      const pointsToAssign = Number(chorePoints) || 10
      let detailStr = 'Custom · '
      if (choreSchedule === 'daily') detailStr += 'Daily'
      else if (choreSchedule === 'weekly') detailStr += `Weekly (${choreWeeklyDay})`
      else if (choreSchedule === 'every_other') detailStr += 'Every other day'

      const newChore: Chore = { 
        id: Date.now(), 
        name: clean, 
        detail: detailStr, 
        points: pointsToAssign, 
        icon: 'sparkles', 
        color: choreColor,
        schedule: choreSchedule,
        weeklyDay: choreSchedule === 'weekly' ? choreWeeklyDay : undefined,
        startDayIndex: dayCounter
      }
      
      updateCurrentHousehold(prev => ({
        ...prev,
        chores: [...prev.chores, newChore],
        activityLog: [`Created chore "${clean}" (+${pointsToAssign} pts)`, ...prev.activityLog.slice(0, 4)]
      }))
    }
    setName('')
    setChorePoints(10)
    setChoreSchedule('daily')
    setModal(null)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Icon name="sparkles" size={22} /></span><span>Habitual</span></div>
        <nav>
          <button className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}><Icon name="home" /><span>Overview</span></button>
          <button className={`nav-item ${activeTab === 'chores' ? 'active' : ''}`} onClick={() => setActiveTab('chores')}><Icon name="check" /><span>Chores</span></button>
          <button className={`nav-item ${activeTab === 'members' ? 'active' : ''}`} onClick={() => setActiveTab('members')}><Icon name="users" /><span>Members</span></button>
          <button className={`nav-item ${activeTab === 'households' ? 'active' : ''}`} onClick={() => setActiveTab('households')}><Icon name="home" /><span>Households</span></button>
        </nav>
        <div className="sidebar-bottom">
          <div className="mini-card">
            <span className="mini-icon"><Icon name="sparkles" size={18}/></span>
            <div><strong>🔥 {streak} Day Streak</strong><p>Day #{dayCounter + 1} ({currentDayName})</p></div>
          </div>
          <button className="house-switcher" onClick={() => setActiveTab('households')}>
            <span className="avatar avatar-coral">YO</span>
            <span><strong>{activeHousehold}</strong><small>{members.length} members (Switch)</small></span>
            <Icon name="chevron" size={16}/>
          </button>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">HOUSEHOLD · {activeHousehold.toUpperCase()} · {currentDayName.toUpperCase()}</p>
            <h1>{activeTab === 'chores' ? 'Weekly Chores Manager' : activeTab === 'members' ? 'Household Members' : activeTab === 'households' ? 'Household Manager' : `Good morning, ${members[0]?.name || 'Alex'}.`}</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="outline-button" style={{ background: '#29483f', color: '#fff', border: '0' }} onClick={advanceToNextDay}>
              Next Day ({currentDayName} → {DAYS_OF_WEEK[(dayCounter + 1) % 7]}) ➔
            </button>
            <button className="outline-button" onClick={() => { setName('');setModal('household'); }}><Icon name="plus" size={17}/> New household</button>
            <button className="outline-button" style={{ background: '#fff5f5', color: '#c62828', borderColor: '#ffcdd2' }} onClick={resetCurrentHousehold}>Reset Household</button>
          </div>
        </header>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <span className="hero-kicker"><Icon name="sparkles" size={15}/> {currentDayName.toUpperCase()} GOAL TRACKER · 🔥 {streak} DAY STREAK</span>
                <h2>Your home is looking<br/>pretty wonderful.</h2>
                <p>Earned <strong>{todayEarnedPoints}</strong> of <strong>{todayGoalPoints} points</strong> scheduled for today.</p>
                <div className="hero-progress"><span style={{ width: `${progressPercentage}%` }}/></div>
                <small>{Math.max(0, todayGoalPoints - todayEarnedPoints)} points remaining until today's goal is complete</small>
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="sun"/><div className="plant"><span/><span/><span/><i/></div>
                <div className="basket"><span/><i/><i/><i/></div>
                <div className="spark s1">✦</div><div className="spark s2">✦</div>
              </div>
            </section>

            <section className="content-grid">
              <div className="chores-panel">
                <div className="section-head">
                  <div>
                    <h2>{currentDayName}’s Chores ({todayChores.length})</h2>
                    <p>Showing tasks scheduled for today.</p>
                  </div>
                  <button className="text-button" onClick={() => setModal('chore')}><Icon name="plus" size={16}/> Add chore</button>
                </div>
                
                <div className="chore-list">
                  {todayChores.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#888', fontStyle: 'italic', padding: '12px 0' }}>No chores scheduled for {currentDayName}! Enjoy your day off.</p>
                  ) : (
                    todayChores.map((chore) => {
                      const done = completed.includes(chore.id)
                      return (
                        <article className={`chore-row ${done ? 'is-done' : ''}`} key={chore.id}>
                          <span className={`chore-icon ${chore.color}`}><Icon name={chore.icon}/></span>
                          <div className="chore-info" onClick={() => handleOpenEditChore(chore)} style={{ cursor: 'pointer' }} title="Click to edit chore">
                            <h3>{chore.name} ✏️</h3>
                            <p>{done ? 'Completed' : chore.detail}</p>
                          </div>
                          <span className="points">+{chore.points} pts</span>
                          <button className="complete-button" onClick={() => handleOpenCompleteModal(chore.id)} aria-label={`Complete ${chore.name}`}>
                            <Icon name="check" size={17}/><span>{done ? 'Done' : 'Complete'}</span>
                          </button>
                        </article>
                      )
                    })
                  )}
                </div>
              </div>

              <aside className="right-column">
                <section className="leaderboard">
                  <div className="section-head compact">
                    <div><p className="eyebrow">HOUSEHOLD</p><h2>Points board</h2></div>
                    <button className="icon-button" onClick={() => setModal('member')} aria-label="Add member"><Icon name="plus" size={18}/></button>
                  </div>
                  <div className="member-list">
                    {sortedMembers.map((member, index) => (
                      <div 
                        className="member-row" 
                        key={member.id} 
                        onClick={() => handleOpenEditMember(member)} 
                        style={{ cursor: 'pointer' }}
                        title="Click to edit member"
                      >
                        <span className="rank">{index + 1}</span>
                        <span className={`avatar avatar-${member.color}`}>{member.initials}</span>
                        <div><strong>{member.name}</strong><small>{index === 0 ? '👑 Leading (Click to edit)' : 'Click to edit'}</small></div>
                        <b>{member.points} pts</b>
                      </div>
                    ))}
                  </div>
                  <button className="deduct-button" onClick={openDeductModal}><Icon name="minus" size={16}/> Log a missed chore <span>− Deduct</span></button>
                </section>

                {/* LIVE ACTIVITY FEED */}
                <section className="tip-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="tip-icon"><Icon name="sparkles" size={16}/></span>
                    <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px' }}>LIVE ACTIVITY</p>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#555', display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                    {activityLog.map((log, idx) => (
                      <li key={idx}>{log}</li>
                    ))}
                  </ul>
                </section>
              </aside>
            </section>
          </>
        )}

        {/* TAB 2: CHORES MANAGER PAGE */}
        {activeTab === 'chores' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Review and edit all household chores mapped across the week for <strong>{activeHousehold}</strong>.</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ padding: '10px 16px', borderRadius: '8px', border: 0, background: '#ffebee', color: '#c62828', fontWeight: 700, cursor: 'pointer' }} onClick={clearAllChores}>
                  Clear All Chores
                </button>
                <button className="primary-button" style={{ padding: '10px 16px', borderRadius: '8px', border: 0, background: '#29483f', color: '#fff', fontWeight: 700 }} onClick={() => setModal('chore')}>
                  + Create New Chore
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {DAYS_OF_WEEK.map((dayName, idx) => {
                const dayChores = chores.filter(c => isChoreActiveOnDay(c, dayName, idx))
                const isToday = dayName === currentDayName
                return (
                  <div key={dayName} style={{ background: isToday ? '#eaf2ec' : '#fff', border: isToday ? '2px solid #29483f' : '1px solid #e8e8e2', borderRadius: '14px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#26322f' }}>{dayName} {isToday && '(Today)'}</h3>
                      <span style={{ fontSize: '11px', background: '#ddd', padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>{dayChores.length} tasks</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {dayChores.length === 0 ? (
                        <p style={{ fontSize: '12px', color: '#888', fontStyle: 'italic' }}>No tasks</p>
                      ) : (
                        dayChores.map(chore => (
                          <div 
                            key={chore.id} 
                            onClick={() => handleOpenEditChore(chore)}
                            style={{ background: '#fff', padding: '10px', borderRadius: '8px', border: '1px solid #daddd6', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            title="Click to edit chore"
                          >
                            <div>
                              <strong style={{ fontSize: '12px', display: 'block' }}>{chore.name}</strong>
                              <small style={{ fontSize: '10px', color: '#777' }}>{chore.detail}</small>
                            </div>
                            <span className="points" style={{ fontSize: '9px' }}>+{chore.points}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 3: MEMBERS MANAGER PAGE */}
        {activeTab === 'members' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Manage household participants in <strong>{activeHousehold}</strong>.</p>
              <button className="primary-button" style={{ padding: '10px 16px', borderRadius: '8px', border: 0, background: '#29483f', color: '#fff', fontWeight: 700 }} onClick={() => setModal('member')}>
                + Add Member
              </button>
            </div>
            <div className="leaderboard" style={{ maxWidth: '650px' }}>
              <div className="member-list">
                {sortedMembers.map((member, index) => (
                  <div 
                    className="member-row" 
                    key={member.id} 
                    onClick={() => handleOpenEditMember(member)} 
                    style={{ cursor: 'pointer', display: 'grid', gridTemplateColumns: '20px auto 1fr auto auto', gap: '12px', alignItems: 'center' }}
                    title="Click to edit profile"
                  >
                    <span className="rank">{index + 1}</span>
                    <span className={`avatar avatar-${member.color}`}>{member.initials}</span>
                    <div><strong>{member.name}</strong><small>Click to edit points or color</small></div>
                    <b>{member.points} pts</b>
                    <span style={{ fontSize: '11px', color: '#0066cc', fontWeight: 600 }}>Edit ⚙️</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HOUSEHOLDS MANAGER PAGE */}
        {activeTab === 'households' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '650px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Switch between separate houses, rename them, or delete houses.</p>
              <button className="primary-button" style={{ padding: '10px 16px', borderRadius: '8px', border: 0, background: '#29483f', color: '#fff', fontWeight: 700 }} onClick={() => setModal('household')}>
                + Add Household
              </button>
            </div>
            <div className="leaderboard">
              <div className="member-list">
                {households.map((house, index) => {
                  const isActive = house === activeHousehold
                  const hData = householdDataMap[house]
                  const mCount = hData ? hData.members.length : 1
                  return (
                    <div 
                      className="member-row" 
                      key={house}
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 10px' }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span className="rank">{index + 1}</span>
                        <div>
                          <strong>{house} {isActive && '👑 (Active)'}</strong>
                          <small>{mCount} members registered</small>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                          className="outline-button" 
                          style={{ padding: '6px 10px', fontSize: '11px' }}
                          onClick={() => handleOpenEditHousehold(house)}
                        >
                          Rename ✏️
                        </button>
                        {!isActive && (
                          <button 
                            className="primary-button" 
                            style={{ padding: '6px 12px', fontSize: '11px', background: '#29483f', color: '#fff', border: 0, borderRadius: '6px' }}
                            onClick={() => {
                              setActiveHousehold(house)
                              setActiveTab('overview')
                            }}
                          >
                            Switch
                          </button>
                        )}
                        <button 
                          style={{ background: '#ffebee', color: '#c62828', border: 0, padding: '6px 10px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                          onClick={() => deleteHousehold(house)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* GENERAL MODALS */}
      {(modal === 'household' || modal === 'member' || modal === 'chore') && (
        <div className="modal-backdrop" onMouseDown={() => setModal(null)}>
          <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <span className="modal-icon"><Icon name={modal === 'member' ? 'users' : modal === 'chore' ? 'broom' : 'home'}/></span>
            <p className="eyebrow">{modal === 'household' ? 'HOUSEHOLD SETUP' : 'ADD NEW'}</p>
            <h2>{modal === 'member' ? 'Household member' : modal === 'chore' ? 'Custom chore' : 'New Household Name'}</h2>
            <p>{modal === 'chore' ? 'Configure chore name, schedule, reward points, and color.' : modal === 'household' ? 'Enter a name for your separate house (e.g. Beach House, Apartment 4B):' : 'Give it a name to get started.'}</p>
            
            <input 
              autoFocus 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder={modal === 'member' ? 'e.g. Sam' : modal === 'chore' ? 'e.g. Water the plants' : 'e.g. Beach House'}
            />

            {modal === 'chore' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', marginTop: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600 }}>Repeat Schedule:</label>
                <select 
                  value={choreSchedule} 
                  onChange={(e) => setChoreSchedule(e.target.value as ScheduleType)}
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                >
                  <option value="daily">Daily (Every Day)</option>
                  <option value="every_other">Every Other Day (Alternating)</option>
                  <option value="weekly">Weekly (Specific Day)</option>
                </select>

                {choreSchedule === 'weekly' && (
                  <>
                    <label style={{ fontSize: '13px', fontWeight: 600 }}>Repeat On Day:</label>
                    <select 
                      value={choreWeeklyDay} 
                      onChange={(e) => setChoreWeeklyDay(e.target.value)}
                      style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                    >
                      {DAYS_OF_WEEK.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </>
                )}

                <label style={{ fontSize: '13px', fontWeight: 600 }}>Point Reward Value:</label>
                <input 
                  type="text" 
                  value={chorePoints} 
                  onChange={(e) => setChorePoints(e.target.value)} 
                  style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                />

                <label style={{ fontSize: '13px', fontWeight: 600 }}>Chore Color Tag:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {CHORE_COLORS.map(col => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setChoreColor(col)}
                      className={`chore-icon ${col}`}
                      style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '8px', 
                        border: choreColor === col ? '3px solid #000' : '1px solid #ddd',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{col[0].toUpperCase()}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '16px' }}>
              <button onClick={() => setModal(null)}>Cancel</button>
              <button className="primary-button" onClick={submitModal}>{modal === 'household' ? 'Create / Switch' : `Add ${modal}`}</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT HOUSEHOLD MODAL */}
      {modal === 'editHousehold' && (
        <div className="modal-backdrop" onMouseDown={() => setModal(null)}>
          <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <span className="modal-icon"><Icon name="home"/></span>
            <p className="eyebrow">HOUSEHOLD SETTINGS</p>
            <h2>Rename Household</h2>
            <p>Enter a new name for this household:</p>
            
            <input 
              autoFocus 
              value={editingHouseName} 
              onChange={(e) => setEditingHouseName(e.target.value)} 
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', width: '100%', margin: '12px 0' }}
            />

            <div className="modal-actions">
              <button onClick={() => setModal(null)}>Cancel</button>
              <button className="primary-button" onClick={saveEditedHousehold}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT CHORE MODAL */}
      {modal === 'editChore' && editingChore && (
        <div className="modal-backdrop" onMouseDown={() => setModal(null)}>
          <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <span className="modal-icon"><Icon name="broom"/></span>
            <p className="eyebrow">CHORE SETTINGS</p>
            <h2>Edit Chore</h2>
            <p>Modify task name, schedule, or point value:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', margin: '12px 0' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Chore Name:</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />

              <label style={{ fontSize: '13px', fontWeight: 600 }}>Repeat Schedule:</label>
              <select 
                value={choreSchedule} 
                onChange={(e) => setChoreSchedule(e.target.value as ScheduleType)}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                <option value="daily">Daily (Every Day)</option>
                <option value="every_other">Every Other Day (Alternating)</option>
                <option value="weekly">Weekly (Specific Day)</option>
              </select>

              {choreSchedule === 'weekly' && (
                <>
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>Repeat On Day:</label>
                  <select 
                    value={choreWeeklyDay} 
                    onChange={(e) => setChoreWeeklyDay(e.target.value)}
                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                  >
                    {DAYS_OF_WEEK.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </>
              )}

              <label style={{ fontSize: '13px', fontWeight: 600 }}>Point Reward Value:</label>
              <input 
                type="text" 
                value={chorePoints} 
                onChange={(e) => setChorePoints(e.target.value)} 
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />

              <label style={{ fontSize: '13px', fontWeight: 600 }}>Chore Color Tag:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {CHORE_COLORS.map(col => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setChoreColor(col)}
                    className={`chore-icon ${col}`}
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '8px', 
                      border: choreColor === col ? '3px solid #000' : '1px solid #ddd',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{col[0].toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button style={{ background: '#ffebee', color: '#c62828' }} onClick={() => deleteChore(editingChore.id)}>Delete Chore</button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setModal(null)}>Cancel</button>
                <button className="primary-button" onClick={saveEditedChore}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MEMBER MODAL */}
      {modal === 'editMember' && editingMember && (
        <div className="modal-backdrop" onMouseDown={() => setModal(null)}>
          <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <span className="modal-icon"><Icon name="users"/></span>
            <p className="eyebrow">PROFILE SETTINGS</p>
            <h2>Edit Member</h2>
            <p>Customize name, points balance, or remove member:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', margin: '12px 0' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Name:</label>
              <input 
                type="text" 
                value={editingMember.name} 
                onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />

              <label style={{ fontSize: '13px', fontWeight: 600 }}>Points Balance:</label>
              <input 
                type="text" 
                value={editingMember.points} 
                onChange={(e) => setEditingMember({ ...editingMember, points: e.target.value === '' ? '' : Number(e.target.value) })}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />

              <label style={{ fontSize: '13px', fontWeight: 600 }}>Avatar Color:</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {AVAILABLE_COLORS.map(col => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setEditingMember({ ...editingMember, color: col })}
                    className={`avatar avatar-${col}`}
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      border: editingMember.color === col ? '3px solid #000' : '1px solid #ddd',
                      cursor: 'pointer'
                    }}
                  >
                    {editingMember.name.slice(0, 2).toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button style={{ background: '#ffebee', color: '#c62828' }} onClick={() => deleteMember(editingMember.id)}>Delete Member</button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setModal(null)}>Cancel</button>
                <button className="primary-button" onClick={saveEditedMember}>Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHORE COMPLETION MEMBER ASSIGNMENT MODAL */}
      {modal === 'completeChore' && (
        <div className="modal-backdrop" onMouseDown={() => setModal(null)}>
          <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <span className="modal-icon"><Icon name="check"/></span>
            <p className="eyebrow">CHORE COMPLETED</p>
            <h2>Who deserves the points?</h2>
            <p>Select the household member who completed this chore:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', margin: '12px 0' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Member:</label>
              <select 
                value={completingMemberId} 
                onChange={(e) => setCompletingMemberId(Number(e.target.value))}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} (Current: {m.points} pts)</option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button onClick={() => setModal(null)}>Cancel</button>
              <button className="primary-button" onClick={confirmCompleteChore}>Award Points</button>
            </div>
          </div>
        </div>
      )}

      {/* DEDUCT POINTS MODAL */}
      {modal === 'deduct' && (
        <div className="modal-backdrop" onMouseDown={() => setModal(null)}>
          <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <span className="modal-icon"><Icon name="minus"/></span>
            <p className="eyebrow">LOG MISSED CHORE</p>
            <h2>Deduct Points</h2>
            <p>Select member and enter deduction details:</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', margin: '12px 0' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Select Member:</label>
              <select 
                value={selectedMemberId} 
                onChange={(e) => setSelectedMemberId(Number(e.target.value))}
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              >
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.points} pts)</option>
                ))}
              </select>

              <label style={{ fontSize: '13px', fontWeight: 600 }}>Penalty Amount (Points):</label>
              <input 
                type="text" 
                value={deductAmount} 
                onChange={(e) => setDeductAmount(e.target.value)} 
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />

              <label style={{ fontSize: '13px', fontWeight: 600 }}>Reason (Optional):</label>
              <input 
                type="text" 
                placeholder="e.g. Left dirty dishes in sink" 
                value={deductReason} 
                onChange={(e) => setDeductReason(e.target.value)} 
                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>

            <div className="modal-actions">
              <button onClick={() => setModal(null)}>Cancel</button>
              <button className="primary-button" style={{ background: '#e53e3e' }} onClick={handleDeductSubmit}>Apply Penalty</button>
            </div>
          </div>
        </div>
      )}

      {/* HIGH PENALTY CONFIRMATION MODAL */}
      {modal === 'confirm' && (
        <div className="modal-backdrop" onMouseDown={() => setModal(null)}>
          <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <span className="modal-icon" style={{ background: '#fff5f5', color: '#e53e3e' }}>⚠️</span>
            <p className="eyebrow" style={{ color: '#e53e3e' }}>HEAVY PENALTY</p>
            <h2>Are you sure it was that bad?</h2>
            <p>You are about to deduct <strong>{deductAmount} points</strong> from <strong>{members.find(m => m.id === selectedMemberId)?.name}</strong>{deductReason ? ` for "${deductReason}"` : ''}.</p>
            
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button onClick={() => setModal('deduct')}>Go Back</button>
              <button className="primary-button" style={{ background: '#e53e3e' }} onClick={executeDeduction}>Yes, Confirm Penalty</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}