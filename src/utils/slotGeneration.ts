import { TimeSlot } from '../types';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { addMinutes, isWeekend } from 'date-fns';

export function generateTimeSlots(date: Date, timezone: string = 'UTC'): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startHour = 9; // 9 AM
  const endHour = 18; // 6 PM
  const slotDuration = 30; // 30 minutes

  // Convert the date to the specified timezone
  const zonedDate = toZonedTime(date, timezone);
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotDuration) {
      // Create start time in the specified timezone
      const startTimeInZone = new Date(zonedDate);
      startTimeInZone.setHours(hour, minute, 0, 0);
      
      // Convert to UTC for consistent storage
      const startTime = fromZonedTime(startTimeInZone, timezone);
      const endTime = addMinutes(startTime, slotDuration);
      
      // Check if end time would go past business hours in the target timezone
      const endTimeInZone = toZonedTime(endTime, timezone);
      if (endTimeInZone.getHours() > endHour) {
        break;
      }

      slots.push({
        id: crypto.randomUUID(),
        startTime,
        endTime,
        isAvailable: true
      });
    }
  }

  return slots;
}

export function isWeekday(date: Date, timezone: string = 'UTC'): boolean {
  const zonedDate = toZonedTime(date, timezone);
  return !isWeekend(zonedDate);
}

export function getNext7WeekdaySlots(timezone: string = 'UTC'): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const today = new Date();
  let daysChecked = 1; // Start from tomorrow
  let weekdaysAdded = 0;

  while (weekdaysAdded < 7) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + daysChecked);
    
    if (isWeekday(currentDate, timezone)) {
      const daySlots = generateTimeSlots(currentDate, timezone);
      slots.push(...daySlots);
      weekdaysAdded++;
    }
    daysChecked++;
  }

  return slots;
}