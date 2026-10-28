export const CLINIC_TIME_ZONE = 'America/Lima'
export const DEMO_BOOKINGS_KEY = 'perioalert:demo-appointments:v1'

export type DemoBooking = {
  id: string
  patient: string
  date: string
  time: string
  reason: string
  status: 'requested' | 'confirmed' | 'cancelled'
}

const weekdayTimes = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30']
const saturdayTimes = weekdayTimes.slice(0, 8)

function datePartsInLima(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: CLINIC_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function clinicToday(now = new Date()) {
  return datePartsInLima(now)
}

function dayOfWeek(date: string) {
  return new Date(`${date}T12:00:00Z`).getUTCDay()
}

export function clinicDates(days = 14, now = new Date()) {
  const today = clinicToday(now)
  const cursor = new Date(`${today}T12:00:00Z`)
  const dates: string[] = []
  for (let offset = 0; offset < days; offset += 1) {
    const candidate = new Date(cursor)
    candidate.setUTCDate(cursor.getUTCDate() + offset)
    const date = candidate.toISOString().slice(0, 10)
    if (dayOfWeek(date) !== 0 && clinicSlots(date, now).length > 0) dates.push(date)
  }
  return dates
}

export function clinicSlots(date: string, now = new Date()) {
  const weekday = dayOfWeek(date)
  if (weekday === 0) return []
  const times = weekday === 6 ? saturdayTimes : weekdayTimes
  if (date !== clinicToday(now)) return times

  const timeParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: CLINIC_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)
  const clock = Object.fromEntries(timeParts.map(({ type, value }) => [type, value]))
  const currentMinutes = Number(clock.hour) * 60 + Number(clock.minute) + 60
  return times.filter((time) => {
    const [hour, minute] = time.split(':').map(Number)
    return hour * 60 + minute >= currentMinutes
  })
}

export function formatClinicDate(date: string, options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) {
  return new Intl.DateTimeFormat('es-PE', { ...options, timeZone: 'UTC' }).format(new Date(`${date}T12:00:00Z`))
}

export function makeDemoSeedBookings(now = new Date()): DemoBooking[] {
  const dates = clinicDates(18, now)
  const seed: DemoBooking[] = []
  if (dates[1]) seed.push({ id: 'demo-001', patient: 'Paciente demo 0142', date: dates[1], time: '10:30', reason: 'Control preventivo', status: 'requested' })
  if (dates[3]) seed.push({ id: 'demo-002', patient: 'Paciente demo 0187', date: dates[3], time: dayOfWeek(dates[3]) === 6 ? '11:00' : '15:30', reason: 'Higiene bucal', status: 'confirmed' })
  if (dates[4] && dayOfWeek(dates[4]) === 6) seed.push({ id: 'demo-003', patient: 'Paciente demo 0214', date: dates[4], time: '11:00', reason: 'Evaluación periodontal', status: 'requested' })
  return seed
}

export function readDemoBookings(seed = makeDemoSeedBookings()): DemoBooking[] {
  try {
    const saved = window.localStorage.getItem(DEMO_BOOKINGS_KEY)
    if (saved) {
      const parsed: unknown = JSON.parse(saved)
      if (Array.isArray(parsed)) return parsed as DemoBooking[]
    }
    window.localStorage.setItem(DEMO_BOOKINGS_KEY, JSON.stringify(seed))
  } catch {
    // Keep the demonstration usable when browser storage is unavailable.
  }
  return seed
}

export function writeDemoBookings(bookings: DemoBooking[]) {
  try {
    window.localStorage.setItem(DEMO_BOOKINGS_KEY, JSON.stringify(bookings))
  } catch {
    // The in-memory interaction still works if browser storage is unavailable.
  }
}
