import { TimeSlot } from '../types'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'
import { addMinutes, isWeekend, addHours } from 'date-fns'

export function generateTimeSlots(
  date: Date,
  timezone: string = 'UTC',
  currentTime?: Date
): TimeSlot[] {
  const slots: TimeSlot[] = []
  const startHour = 9 // 9 AM
  const endHour = 18 // 6 PM
  const slotDuration = 30 // 30 minutes

  const zonedDate = toZonedTime(date, timezone)
  const now = currentTime || new Date()
  const zonedNow = toZonedTime(now, timezone)

  // Check if this is today
  const isToday = zonedDate.toDateString() === zonedNow.toDateString()

  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      const startTimeInZone = new Date(zonedDate).setHours(hour, minute, 0, 0)
      const startTime = fromZonedTime(startTimeInZone, timezone)
      const endTime = addMinutes(startTime, slotDuration)

      // Check if end time would go past business hours (9 to 5)
      const endTimeInZone = toZonedTime(endTime, timezone)
      if (endTimeInZone.getHours() > endHour) {
        break
      }

      // Skip slots that have already passed for today
      if (isToday && startTime <= now) {
        continue
      }

      slots.push({
        id: crypto.randomUUID(),
        startTime,
        endTime,
        isAvailable: true,
      })
    }
  }

  return slots
}

export function isWeekday(date: Date, timezone: string = 'UTC'): boolean {
  const zonedDate = toZonedTime(date, timezone)
  return !isWeekend(zonedDate)
}

export function getNext7WeekdaySlots(timezone: string = 'UTC'): TimeSlot[] {
  const slots: TimeSlot[] = []
  const today = new Date()
  let daysChecked = 0 // Start from today
  let weekdaysAdded = 0

  while (weekdaysAdded < 7) {
    const currentDate = new Date(today)
    currentDate.setDate(today.getDate() + daysChecked)

    if (isWeekday(currentDate, timezone)) {
      const daySlots = generateTimeSlots(currentDate, timezone, today)
      slots.push(...daySlots)
      weekdaysAdded++
    }
    daysChecked++
  }

  return slots
}
