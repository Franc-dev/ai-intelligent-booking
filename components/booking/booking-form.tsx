"use client"

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, MessageCircle, Check, X, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface Counselor {
  id: string
  name: string
  specialties: string[]
  bio?: string
  availability?: Array<{
    dayOfWeek: number
    startTime: string
    endTime: string
  }>
}

interface BookingFormProps {
  onBook: (bookingData: any) => void
  onCancel: () => void
  currentMessage?: any
}

const BookingForm: React.FC<BookingFormProps> = ({ 
  onBook, 
  onCancel, 
  currentMessage 
}) => {
  const [step, setStep] = useState(1)
  const [counselors, setCounselors] = useState<Counselor[]>([])
  const [selectedCounselor, setSelectedCounselor] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [duration, setDuration] = useState<number>(60)
  const [notes, setNotes] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [availability, setAvailability] = useState<any>(null)
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('')

  useEffect(() => {
    fetchCounselors()
  }, [])

  const fetchCounselors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/counselors')
      if (response.ok) {
        const data = await response.json()
        setCounselors(data.counselors || [])
      } else {
        throw new Error('Failed to load counselors')
      }
    } catch (err) {
      setError('Failed to load counselors')
    } finally {
      setLoading(false)
    }
  }

  const checkAvailability = async () => {
    if (!selectedCounselor || !selectedDate || !selectedTime) return

    setLoading(true)
    try {
      const response = await fetch('/api/booking/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          counselorId: selectedCounselor,
          date: selectedDate,
          time: selectedTime,
          duration
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAvailability(data)
        
        if (data.available) {
          setStep(3) // Move to confirmation
        } else {
          setError(data.reason || 'Time slot not available')
        }
      } else {
        throw new Error('Failed to check availability')
      }
    } catch (err) {
      setError('Failed to check availability')
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    setLoading(true)
    try {
      const bookingData = {
        counselorId: selectedCounselor,
        date: selectedDate,
        time: selectedTime,
        duration,
        notes: notes.trim()
      }

      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      })

      if (response.ok) {
        const result = await response.json()
        
        if (result.success) {
          onBook(result.booking)
        } else {
          setError(result.error || 'Failed to create booking')
        }
      } else {
        throw new Error('Failed to create booking')
      }
    } catch (err) {
      setError('Failed to create booking')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        slots.push(timeStr)
      }
    }
    return slots
  }

  const filteredCounselors = counselors.filter(counselor => 
    !specialtyFilter || counselor.specialties.some(s => 
      s.toLowerCase().includes(specialtyFilter.toLowerCase())
    )
  )

  const selectedCounselorData = counselors.find(c => c.id === selectedCounselor)

  const getDayName = (dayNumber: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayNumber]
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Book Your Session</h2>
          <button 
            onClick={onCancel}
            className="text-blue-200 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex items-center mt-3 text-sm text-blue-100">
          <div className={`w-3 h-3 rounded-full mr-2 ${step >= 1 ? 'bg-white' : 'bg-blue-400'}`} />
          <span className="mr-4">Counselor</span>
          <div className={`w-3 h-3 rounded-full mr-2 ${step >= 2 ? 'bg-white' : 'bg-blue-400'}`} />
          <span className="mr-4">Time</span>
          <div className={`w-3 h-3 rounded-full mr-2 ${step >= 3 ? 'bg-white' : 'bg-blue-400'}`} />
          <span>Confirm</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-400 mr-2" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="p-6">
        {/* Step 1: Select Counselor */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Choose a Counselor
              </h3>
              
              {/* Specialty Filter */}
              <div className="mb-4">
                <Label htmlFor="specialty-filter" className="text-sm font-medium text-gray-700">
                  Filter by Specialty
                </Label>
                <Input
                  id="specialty-filter"
                  type="text"
                  placeholder="e.g., anxiety, depression, trauma..."
                  value={specialtyFilter}
                  onChange={(e) => setSpecialtyFilter(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading counselors...</span>
                  </div>
                ) : filteredCounselors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No counselors found matching your criteria.
                  </div>
                ) : (
                  filteredCounselors.map((counselor) => (
                    <Card
                      key={counselor.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedCounselor === counselor.id
                          ? 'ring-2 ring-blue-500 bg-blue-50'
                          : 'hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedCounselor(counselor.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-2">{counselor.name}</h4>
                            <div className="flex flex-wrap gap-1 mb-2">
                              {counselor.specialties.slice(0, 3).map((specialty, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                              {counselor.specialties.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{counselor.specialties.length - 3} more
                                </Badge>
                              )}
                            </div>
                            {counselor.bio && (
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {counselor.bio}
                              </p>
                            )}
                          </div>
                          {selectedCounselor === counselor.id && (
                            <Check className="w-6 h-6 text-blue-600" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            <Button
              onClick={() => setStep(2)}
              disabled={!selectedCounselor}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              Next: Select Time
            </Button>
          </div>
        )}

        {/* Step 2: Select Date & Time */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                Choose Date & Time
              </h3>

              {selectedCounselorData && (
                <Card className="bg-gray-50 border-gray-200 mb-4">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-gray-900 mb-1">
                      Selected Counselor: {selectedCounselorData.name}
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedCounselorData.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="date" className="text-sm font-medium text-gray-700 mb-1">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label htmlFor="duration" className="text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </Label>
                  <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="90">90 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-4">
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Times
                </Label>
                <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                  {generateTimeSlots().map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => setSelectedTime(time)}
                      className="text-sm py-2"
                    >
                      {formatTime(time)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <Label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific topics or concerns you'd like to discuss..."
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={checkAvailability}
                  disabled={!selectedDate || !selectedTime || loading}
                  className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Checking...
                    </div>
                  ) : (
                    'Check Availability'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                <Check className="w-5 h-5 mr-2 text-green-600" />
                Confirm Your Booking
              </h3>

              <Card className="bg-green-50 border-green-200 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center mb-2">
                    <Check className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-800">Time slot available!</span>
                  </div>
                  <p className="text-sm text-green-700">
                    Your selected time is available and ready to book.
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Counselor</Label>
                    <p className="text-gray-900">{selectedCounselorData?.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Date</Label>
                    <p className="text-gray-900">{formatDate(selectedDate)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Time</Label>
                    <p className="text-gray-900">{formatTime(selectedTime)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Duration</Label>
                    <p className="text-gray-900">{duration} minutes</p>
                  </div>
                </div>

                {notes && (
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Notes</Label>
                    <p className="text-gray-900">{notes}</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleBooking}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white hover:bg-green-700"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Booking...
                    </div>
                  ) : (
                    'Confirm & Book'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export { BookingForm }
