'use client';

import { useState, useEffect } from 'react';
import { 
  CalendarIcon, 
  ClockIcon,
  PlusIcon,
  EditIcon,
  TrashIcon
} from 'lucide-react';

import BookingModal from '@/components/booking/BookingModal';

interface TimeSlot {
  id: string;
  time: string;
  duration: number; // in minutes
  isAvailable: boolean;
  customer?: string;
  service?: string;
  day?: string;
}

interface DaySchedule {
  day: string;
  isEnabled: boolean;
  timeSlots: TimeSlot[];
}

interface Setting {
  id: string;
  key: string;
  value: string;
  category: string;
  updatedAt: string;
}

export default function BookingPage() {
  const [schedule, setSchedule] = useState<DaySchedule[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    fetchSchedule();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchSchedule = async () => {
    try {
      const response = await fetch('/api/time-slots');
      if (response.ok) {
        const data = await response.json();
        setSchedule(data);
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSettingValue = (key: string) => {
    const setting = settings.find(s => s.key === key);
    return setting?.value || '';
  };

  const defaultDuration = parseInt(getSettingValue('defaultDuration')) || 60;

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    if (slot.isAvailable) {
      setShowBookingModal(true);
    }
  };

  const handleBookingConfirm = (booking: any) => {
    // Refresh the schedule to show the new booking
    fetchSchedule();
    setShowBookingModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Booking Schedule</h1>
          <p className="text-neutral-600">
            Manage your weekly appointment schedule 
            {defaultDuration && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                Default Duration: {defaultDuration} min
              </span>
            )}
          </p>
        </div>
        <button className="slds-button slds-button-brand flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Add Time Slot</span>
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-600">Loading schedule...</div>
        </div>
      ) : (
        <>
          {/* Weekly Schedule */}
          <div className="slds-card overflow-hidden">
            <div className="grid grid-cols-6 border-b border-neutral-200">
              <div className="p-4 bg-neutral-50 font-semibold text-neutral-600 uppercase tracking-wide text-sm">Time</div>
              {schedule.map((day) => (
                <div key={day.day} className="p-4 bg-neutral-50 font-semibold text-neutral-600 uppercase tracking-wide text-sm text-center">
                  {day.day}
                </div>
              ))}
            </div>

            {/* Time slots grid */}
            <div className="grid grid-cols-6">
              {/* Time column */}
              <div className="border-r border-neutral-200">
                {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((time) => (
                  <div key={time} className="p-4 border-b border-neutral-200 text-sm text-neutral-600 font-medium">
                    {time}
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {schedule.map((day) => (
                <div key={day.day} className="border-r border-neutral-200">
                  {day.timeSlots.map((slot) => (
                    <div
                      key={slot.id}
                      onClick={() => handleSlotClick({...slot, day: day.day})}
                      className={`
                        p-4 border-b border-neutral-200 cursor-pointer transition-colors min-h-[64px]
                        ${slot.isAvailable 
                          ? 'hover:bg-green-50 bg-green-25' 
                          : 'bg-red-50 hover:bg-red-100'
                        }
                      `}
                    >
                      {slot.isAvailable ? (
                        <div className="text-center">
                          <div className="text-sm text-green-600 font-medium">Available</div>
                          <div className="text-xs text-neutral-500">{slot.duration || defaultDuration}min</div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-sm font-medium text-neutral-900">{slot.customer}</div>
                          <div className="text-xs text-neutral-600">{slot.service}</div>
                          <div className="text-xs text-neutral-500">{slot.duration || defaultDuration}min</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Booking Stats */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="slds-card">
            <div className="p-6 flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Total Bookings</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {schedule.reduce((acc, day) => 
                    acc + day.timeSlots.filter(slot => !slot.isAvailable).length, 0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="slds-card">
            <div className="p-6 flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Available Slots</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {schedule.reduce((acc, day) => 
                    acc + day.timeSlots.filter(slot => slot.isAvailable).length, 0
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="slds-card">
            <div className="p-6 flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <CalendarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide">Utilization Rate</p>
                <p className="text-2xl font-bold text-neutral-900">
                  {schedule.length > 0 ? Math.round((schedule.reduce((acc, day) => 
                    acc + day.timeSlots.filter(slot => !slot.isAvailable).length, 0
                  ) / schedule.reduce((acc, day) => acc + day.timeSlots.length, 0)) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      {!loading && (
        <div className="slds-card">
          <div className="slds-card-header">
            <h3 className="text-lg font-semibold text-neutral-900">Recent Bookings</h3>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="slds-table">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {schedule.flatMap(day => 
                    day.timeSlots
                      .filter(slot => !slot.isAvailable)
                      .map(slot => ({
                        ...slot,
                        day: day.day,
                      }))
                  ).map((booking) => (
                    <tr key={booking.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white"></div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-neutral-900">
                              {booking.customer}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {booking.service}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {booking.day} at {booking.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {booking.duration || defaultDuration} minutes
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        <div className="flex items-center space-x-2">
                          <button className="text-salesforce-600 hover:text-salesforce-700">
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-700">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        selectedSlot={selectedSlot}
        onBookingConfirm={handleBookingConfirm}
      />
    </div>
  );
}
