import { useState } from 'react';
import { useViewingStore } from '../stores/viewingStore';
import { TimeSlot } from '../types';
import { format, toZonedTime } from 'date-fns-tz';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, X, Loader2 } from 'lucide-react';

export default function Home() {
  const { 
    viewings,
    addViewing, 
    removeViewing, 
    getAvailableSlots,
    timezone
  } = useViewingStore();

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [viewerName, setViewerName] = useState('');
  const [property, setProperty] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const formatTime = (date: Date) => {
    const zonedDate = toZonedTime(date, timezone);
    return format(zonedDate, 'h:mm a', { timeZone: timezone });
  };

  const formatDate = (date: Date) => {
    const zonedDate = toZonedTime(date, timezone);
    return format(zonedDate, 'EEEE, MMMM d', { timeZone: timezone });
  };

  const groupSlotsByDate = (slots: TimeSlot[]) => {
    return slots.reduce((groups: Record<string, TimeSlot[]>, slot) => {
      const zonedDate = toZonedTime(slot.startTime, timezone);
      const dateKey = format(zonedDate, 'yyyy-MM-dd', { timeZone: timezone });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(slot);
      return groups;
    }, {});
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.isAvailable) {
      setSelectedSlot(slot);
      setShowBookingForm(true);
    }
  };

  const handleBooking = async () => {
    if (selectedSlot && viewerName.trim() && property.trim()) {
      setIsBooking(true);
      
      try {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        addViewing({
          startTime: selectedSlot.startTime,
          viewerName: viewerName.trim(),
          property: property.trim()
        });
        
        setFeedback({
          type: 'success',
          message: 'Viewing booked successfully!'
        });
        
        setSelectedSlot(null);
        setViewerName('');
        setProperty('');
        setShowBookingForm(false);
        
        // Clear feedback after 3 seconds
        setTimeout(() => setFeedback(null), 3000);
      } catch (error) {
        setFeedback({
          type: 'error',
          message: 'Failed to book viewing. Please try again.'
        });
        setTimeout(() => setFeedback(null), 3000);
      } finally {
        setIsBooking(false);
      }
    }
  };

  const handleCancelViewing = async (viewingId: string) => {
    if (confirm('Are you sure you want to cancel this viewing?')) {
      try {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 500));
        
        removeViewing(viewingId);
        
        setFeedback({
          type: 'success',
          message: 'Viewing cancelled successfully!'
        });
        
        // Clear feedback after 3 seconds
        setTimeout(() => setFeedback(null), 3000);
      } catch (error) {
        setFeedback({
          type: 'error',
          message: 'Failed to cancel viewing. Please try again.'
        });
        setTimeout(() => setFeedback(null), 3000);
      }
    }
  };

  const availableSlotsGrouped = groupSlotsByDate(getAvailableSlots());
  const upcomingViewings = viewings.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Property Viewing Scheduler</h1>
          <p className="text-sm sm:text-base text-gray-600">Schedule your property viewings for the next 7 weekdays</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-lg sm:text-xl">Available Times</CardTitle>
                </div>
              </CardHeader>
              <CardContent>

              <div className="space-y-4 sm:space-y-6">
                {Object.entries(availableSlotsGrouped).map(([dateKey, slots]) => (
                  <div key={dateKey}>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2 sm:mb-3">
                      {formatDate(slots[0].startTime)}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
                      {slots.map((slot) => (
                        <Button
                          key={slot.id}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSlotSelect(slot)}
                          className="p-2 sm:p-3 text-xs sm:text-sm touch-manipulation"
                        >
                          {formatTime(slot.startTime)}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Upcoming Viewings</CardTitle>
              </CardHeader>
              <CardContent>
              {upcomingViewings.length === 0 ? (
                <p className="text-gray-500 text-sm">No upcoming viewings scheduled</p>
              ) : (
                <div className="space-y-3">
                  {upcomingViewings.map((viewing) => (
                    <div key={viewing.id} className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                        <div className="text-sm font-medium text-gray-900">
                          {viewing.viewerName}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancelViewing(viewing.id)}
                          className="text-red-600 hover:text-red-700 self-start"
                        >
                          Cancel
                        </Button>
                      </div>
                      <div className="text-sm text-gray-600 mb-1 break-words">
                        {viewing.property}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {formatDate(viewing.startTime)} at {formatTime(viewing.startTime)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-700 break-words">
                    {formatDate(selectedSlot.startTime)} at {formatTime(selectedSlot.startTime)}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Property Address
                  </label>
                  <Input
                    type="text"
                    value={property}
                    onChange={(e) => setProperty(e.target.value)}
                    placeholder="Enter property address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
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

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBooking}
                  disabled={!viewerName.trim() || !property.trim() || isBooking}
                  className="flex-1"
                >
                  {isBooking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
          <Alert className={`fixed top-4 right-4 z-50 max-w-sm ${
            feedback.type === 'success' 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600" />
              )}
              <AlertDescription className={`font-medium ${
                feedback.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {feedback.message}
              </AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFeedback(null)}
                className="ml-auto h-auto p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Alert>
        )}
      </div>
    </div>
  );
}
