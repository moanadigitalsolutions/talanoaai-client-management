'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  CalendarIcon, 
  ClockIcon,
  PlusIcon,
  EditIcon,
  TrashIcon
} from 'lucide-react';

import BookingModal from '@/components/booking/BookingModal';
import EditBookingModal from '@/components/booking/EditBookingModal';
import { formatDate } from '@/lib/dateUtils';

interface TimeSlot {
  id: string;
  time: string;
  duration: number; // in minutes
  isAvailable: boolean;
  customer?: string;
  service?: string;
  day?: string;
  date?: string; // concrete date (YYYY-MM-DD)
}

interface DaySchedule {
  day: string;
  dayDate?: string; // added by API
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
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekRange, setWeekRange] = useState<{start?: string; end?: string}>({});
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlot, setNewSlot] = useState({ day: 'Monday', time: '09:00', duration: 60 });
  const [manageMode, setManageMode] = useState(false);

  useEffect(() => {
    fetchSettings();
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

  const fetchSchedule = useCallback(async () => {
    try {
      const response = await fetch(`/api/time-slots?weekOffset=${weekOffset}`);
      if (response.ok) {
        const data = await response.json();
        setSchedule(data.days);
        setWeekRange({ start: data.weekStart, end: data.weekEnd });
      }
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  }, [weekOffset]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

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
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Booking Schedule</h1>
          <p className="text-neutral-600">
            Manage your weekly appointment schedule 
            {defaultDuration && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                Default Duration: {defaultDuration} min
              </span>
            )}
            {weekRange.start && weekRange.end && (
              <span className="ml-2 px-2 py-1 bg-neutral-100 text-neutral-700 text-sm rounded border border-neutral-200">
                Week: {formatDate(weekRange.start)} → {formatDate(weekRange.end)}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setManageMode(m=>!m)}
            className={`px-3 py-2 text-sm border rounded ${manageMode? 'bg-neutral-800 text-white border-neutral-800':'border-neutral-300 hover:bg-neutral-50 text-neutral-700'}`}
          >{manageMode? 'Done':'Manage'}</button>
          <button
            onClick={() => setShowAddSlot(v => !v)}
            className="px-3 py-2 text-sm border border-neutral-300 rounded hover:bg-neutral-50 text-neutral-700"
          >{showAddSlot ? 'Cancel' : 'Add Slot'}</button>
          <button
            onClick={() => { setLoading(true); setWeekOffset(o => o - 1); }}
            className="px-3 py-2 text-sm border border-neutral-300 rounded hover:bg-neutral-50 text-neutral-700"
          >Prev Week</button>
          <button
            onClick={() => { setLoading(true); setWeekOffset(0); }}
            className="px-3 py-2 text-sm border border-neutral-300 rounded hover:bg-neutral-50 text-neutral-700 disabled:text-neutral-400"
            disabled={weekOffset === 0}
          >This Week</button>
          <button
            onClick={() => { setLoading(true); setWeekOffset(o => o + 1); }}
            className="px-3 py-2 text-sm border border-neutral-300 rounded hover:bg-neutral-50 text-neutral-700"
          >Next Week</button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-neutral-600">Loading schedule...</div>
        </div>
      ) : (
        <>
          {showAddSlot && (
            <div className="slds-card mb-4">
              <div className="p-4 flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Day</label>
                  <select value={newSlot.day} onChange={e=>setNewSlot(s=>({...s, day:e.target.value}))} className="border px-2 py-1 rounded text-sm">
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d=> <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Time</label>
                  <input value={newSlot.time} onChange={e=>setNewSlot(s=>({...s, time:e.target.value}))} className="border px-2 py-1 rounded text-sm w-24" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 mb-1">Duration (min)</label>
                  <input type="number" value={newSlot.duration} onChange={e=>setNewSlot(s=>({...s, duration:parseInt(e.target.value)||60}))} className="border px-2 py-1 rounded text-sm w-28" />
                </div>
                <button
                  onClick={async ()=>{
                    try {
                      const res = await fetch('/api/time-slots', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(newSlot) });
                      if(res.ok){ setShowAddSlot(false); fetchSchedule(); }
                    } catch(e){ console.error(e); }
                  }}
                  className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >Save Slot</button>
              </div>
            </div>
          )}
          {/* Weekly Schedule */}
          <div className="slds-card overflow-hidden">
            <div className="grid grid-cols-8 border-b border-neutral-200">
              <div className="p-4 bg-neutral-50 font-semibold text-neutral-600 uppercase tracking-wide text-sm">Time</div>
              {schedule.map((day) => (
                <div key={day.day} className="p-4 bg-neutral-50 font-semibold text-neutral-600 uppercase tracking-wide text-sm text-center">
                  <div>{day.day}</div>
                  {day.dayDate && (
                    <div className="text-[11px] font-normal text-neutral-500 normal-case">{formatDate(day.dayDate)}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Time slots grid */}
            <div className="grid grid-cols-8">
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
                  {day.timeSlots.map((slot) => {
                    const past = (()=>{
                      if(!slot.date) return false;
                      const dt = new Date(`${slot.date}T${slot.time}:00`);
                      return dt.getTime() < Date.now();
                    })();
                    return (
                    <div
                      key={slot.id}
                      onClick={() => { if(!past && !manageMode) handleSlotClick({...slot, day: day.day}); }}
                      className={`
                        p-4 border-b border-neutral-200 cursor-pointer transition-colors min-h-[64px]
                        ${past ? 'bg-neutral-50 text-neutral-400 cursor-not-allowed' : slot.isAvailable 
                          ? 'hover:bg-green-50 bg-green-25' 
                          : 'bg-red-50 hover:bg-red-100'}
                      `}
                    >
                      {slot.isAvailable ? (
                        <div className="text-center relative">
                          {manageMode && !past && (
                            <button
                              onClick={async (e)=>{
                                e.stopPropagation();
                                if(!confirm('Delete this slot template?')) return;
                                try {
                                  const res = await fetch(`/api/time-slots?id=${encodeURIComponent(slot.id)}`, { method:'DELETE' });
                                  if(res.ok) fetchSchedule();
                                } catch(err){ console.error(err); }
                              }}
                              className="absolute top-1 right-1 text-red-600 hover:text-red-800"
                              title="Delete slot"
                            >×</button>
                          )}
                          <div className={`text-sm font-medium ${past ? 'text-neutral-400' : 'text-green-600'}`}>{past ? 'Past' : 'Available'}</div>
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
                    );
                  })}
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
                        {booking.date || booking.day} {booking.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                        {booking.duration || defaultDuration} minutes
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                        <div className="flex items-center space-x-2">
                          <button 
                            className="text-salesforce-600 hover:text-salesforce-700 p-1 rounded hover:bg-neutral-100"
                            onClick={async () => {
                              try {
                                // Find the appointment and load its data
                                const appointmentRes = await fetch('/api/appointments');
                                if (appointmentRes.ok) {
                                  const appointments = await appointmentRes.json();
                                  // Handle both array response and object with data property
                                  const appointmentList = Array.isArray(appointments) ? appointments : appointments.data || [];
                                  const appointment = appointmentList.find((apt: any) => 
                                    apt.date === booking.date && apt.time === booking.time && apt.customerId
                                  );
                                  if (appointment) {
                                    setSelectedAppointment(appointment);
                                    setShowEditModal(true);
                                  } else {
                                    console.log('Appointment not found. Available appointments:', appointmentList);
                                    alert('Appointment not found');
                                  }
                                } else {
                                  console.error('Failed to fetch appointments');
                                  alert('Failed to load appointments');
                                }
                              } catch (error) {
                                console.error('Error loading appointment for editing:', error);
                                alert('Failed to load appointment for editing');
                              }
                            }}
                            title="Edit booking"
                          >
                            <EditIcon className="h-4 w-4" />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                            onClick={async () => {
                              if (window.confirm(`Are you sure you want to cancel the booking for ${booking.customer}?`)) {
                                try {
                                  // Find the appointment and delete it
                                  const appointmentRes = await fetch('/api/appointments');
                                  if (appointmentRes.ok) {
                                    const appointments = await appointmentRes.json();
                                    // Handle both array response and object with data property
                                    const appointmentList = Array.isArray(appointments) ? appointments : appointments.data || [];
                                    const appointment = appointmentList.find((apt: any) => 
                                      apt.date === booking.date && apt.time === booking.time && apt.customerId
                                    );
                                    if (appointment) {
                                      const deleteRes = await fetch(`/api/appointments/${appointment.id}`, {
                                        method: 'DELETE'
                                      });
                                      if (deleteRes.ok) {
                                        // Refresh the schedule
                                        fetchSchedule();
                                      } else {
                                        alert('Failed to cancel booking');
                                      }
                                    } else {
                                      console.log('Appointment not found. Available appointments:', appointmentList);
                                      alert('Appointment not found for deletion');
                                    }
                                  } else {
                                    console.error('Failed to fetch appointments');
                                    alert('Failed to load appointments for deletion');
                                  }
                                } catch (error) {
                                  console.error('Error canceling booking:', error);
                                  alert('Failed to cancel booking');
                                }
                              }
                            }}
                            title="Cancel booking"
                          >
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

      {/* Edit Booking Modal */}
      <EditBookingModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        appointment={selectedAppointment}
        onBookingUpdate={() => {
          setShowEditModal(false);
          fetchSchedule();
        }}
      />
    </div>
  );
}
