import { create } from 'zustand'
import { Viewing, TimeSlot } from '../types'
import { getNext7WeekdaySlots } from '../utils/slotGeneration'

interface ViewingState {
  viewings: Viewing[]
  availableSlots: TimeSlot[]
  timezone: string

  // Actions
  addViewing: (viewing: Omit<Viewing, 'id'>) => void
  removeViewing: (viewingId: string) => void
  getAvailableSlots: () => TimeSlot[]
}

const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

export const useViewingStore = create<ViewingState>((set, get) => ({
  viewings: [],
  timezone: localTimezone,
  availableSlots: getNext7WeekdaySlots(localTimezone),

  addViewing: (viewingData) => {
    const newViewing: Viewing = {
      ...viewingData,
      id: crypto.randomUUID(),
    }

    set((state) => {
      const updatedSlots = state.availableSlots.map((slot) => {
        if (slot.startTime.getTime() === viewingData.startTime.getTime()) {
          return {
            ...slot,
            isAvailable: false,
            viewingId: newViewing.id,
          }
        }
        return slot
      })

      return {
        viewings: [...state.viewings, newViewing],
        availableSlots: updatedSlots,
      }
    })
  },

  removeViewing: (viewingId) => {
    set((state) => {
      const updatedSlots = state.availableSlots.map((slot) => {
        if (slot.viewingId === viewingId) {
          return {
            ...slot,
            isAvailable: true,
            viewingId: undefined,
          }
        }
        return slot
      })

      return {
        viewings: state.viewings.filter((viewing) => viewing.id !== viewingId),
        availableSlots: updatedSlots,
      }
    })
  },

  getAvailableSlots: () => {
    return get().availableSlots.filter((slot) => slot.isAvailable)
  },
}))
