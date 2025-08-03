import { useEffect, useState } from 'react'
import { useViewingStore } from '../stores/viewingStore'
import { TimeSlot } from '../types'
import { format, toZonedTime } from 'date-fns-tz'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, X, Loader2 } from 'lucide-react'

export default function Home() {
  const { viewings, addViewing, removeViewing, getAvailableSlots, timezone } =
    useViewingStore()

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [viewerName, setViewerName] = useState('')
  const [propertyAddress, setPropertyAddress] = useState('')
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    if (!showBookingForm) {
      setViewerName('')
      setPropertyAddress('')
      setSelectedSlot(null)
    }
  }, [showBookingForm])

  const formatTime = (date: Date) => {
    const zonedDate = toZonedTime(date, timezone)
    return format(zonedDate, 'h:mm a', { timeZone: timezone })
  }

  const formatDate = (date: Date) => {
    const zonedDate = toZonedTime(date, timezone)
    return format(zonedDate, 'EEEE, MMMM d', { timeZone: timezone })
  }

  const groupSlotsByDate = (slots: TimeSlot[]) => {
    return slots.reduce((groups: Record<string, TimeSlot[]>, slot) => {
      const zonedDate = toZonedTime(slot.startTime, timezone)
      const dateKey = format(zonedDate, 'yyyy-MM-dd', { timeZone: timezone })
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(slot)
      return groups
    }, {})
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.isAvailable) {
      setSelectedSlot(slot)
      setShowBookingForm(true)
    }
  }

  const handleBooking = async () => {
    if (selectedSlot && viewerName.trim() && propertyAddress.trim()) {
      setIsBooking(true)

      try {
        addViewing({
          startTime: selectedSlot.startTime,
          viewerName: viewerName.trim(),
          propertyAddress: propertyAddress.trim(),
        })

        setFeedback({
          type: 'success',
          message: 'Viewing booked successfully!',
        })

        setShowBookingForm(false)

        // Clear feedback after 3 seconds
        setTimeout(() => setFeedback(null), 3000)
      } catch (error) {
        setFeedback({
          type: 'error',
          message: 'Failed to book viewing. Please try again.',
        })
        setTimeout(() => setFeedback(null), 3000)
      } finally {
        setIsBooking(false)
      }
    }
  }

  const handleCancelViewing = async (viewingId: string) => {
    if (confirm('Are you sure you want to cancel this viewing?')) {
      try {
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 500))

        removeViewing(viewingId)

        setFeedback({
          type: 'success',
          message: 'Viewing cancelled successfully!',
        })

        // Clear feedback after 3 seconds
        setTimeout(() => setFeedback(null), 3000)
      } catch (error) {
        setFeedback({
          type: 'error',
          message: 'Failed to cancel viewing. Please try again.',
        })
        setTimeout(() => setFeedback(null), 3000)
      }
    }
  }

  const availableSlotsGrouped = groupSlotsByDate(getAvailableSlots())
  const upcomingViewings = viewings.sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Property Viewing Scheduler
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            Schedule your property viewings for the next 7 weekdays
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:grid-cols-3">
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">
                  Upcoming Viewings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingViewings.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No upcoming viewings scheduled
                  </p>
                ) : (
                  <div className="space-y-3">
                    {upcomingViewings.map((viewing) => (
                      <div
                        key={viewing.id}
                        className="rounded-lg border border-gray-200 p-3 sm:p-4"
                      >
                        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div className="text-sm font-medium text-gray-900">
                            {viewing.viewerName}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelViewing(viewing.id)}
                            className="self-start text-red-600 hover:text-red-700"
                          >
                            Cancel
                          </Button>
                        </div>
                        <div className="mb-1 text-sm break-words text-gray-600">
                          {viewing.propertyAddress}
                        </div>
                        <div className="text-xs text-gray-500 sm:text-sm">
                          {formatDate(viewing.startTime)} at{' '}
                          {formatTime(viewing.startTime)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="text-lg sm:text-xl">
                    Available Times
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 sm:space-y-6">
                  {Object.entries(availableSlotsGrouped).map(
                    ([dateKey, slots]) => (
                      <div key={dateKey}>
                        <h3 className="mb-2 text-base font-medium text-gray-900 sm:mb-3 sm:text-lg">
                          {formatDate(slots[0].startTime)}
                        </h3>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5">
                          {slots.map((slot) => (
                            <Button
                              key={slot.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handleSlotSelect(slot)}
                              className="touch-manipulation p-2 text-xs sm:p-3 sm:text-sm"
                            >
                              {formatTime(slot.startTime)}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Dialog open={showBookingForm} onOpenChange={setShowBookingForm}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Book Viewing</DialogTitle>
            </DialogHeader>

            {selectedSlot && (
              <div className="mb-4 rounded-lg bg-blue-50 p-3">
                <div className="text-sm break-words text-blue-700">
                  {formatDate(selectedSlot.startTime)} at{' '}
                  {formatTime(selectedSlot.startTime)}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Property Address
                </label>
                <Input
                  type="text"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  placeholder="Enter property address"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Viewer Name
                </label>
                <Input
                  type="text"
                  value={viewerName}
                  onChange={(e) => setViewerName(e.target.value)}
                  placeholder="Enter viewer's name"
                />
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setShowBookingForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBooking}
                disabled={
                  !viewerName.trim() || !propertyAddress.trim() || isBooking
                }
                className="flex-1"
                variant={'outline'}
              >
                {isBooking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Book Viewing'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {feedback && (
          <Alert
            className={`fixed top-4 right-4 z-50 max-w-sm ${
              feedback.type === 'success'
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription
                className={`font-medium ${
                  feedback.type === 'success'
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}
              >
                {feedback.message}
              </AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFeedback(null)}
                className="ml-auto h-auto p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        )}
      </div>
    </div>
  )
}
