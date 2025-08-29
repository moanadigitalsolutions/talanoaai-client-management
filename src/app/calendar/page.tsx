'use client';

import { useState, useEffect } from 'react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  PlusIcon,
  CalendarIcon
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { formatDate } from '@/lib/dateUtils';

interface Appointment {
  id: string;
  customerId: string;
  firstName?: string;
  lastName?: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  service?: string;
}

interface Event {
  id: string;
  title: string;
  date: Date;
  time: string;
  type: 'appointment' | 'meeting' | 'reminder';
  customer?: string;
  status: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
        
        // Convert appointments to events format
        const eventsData: Event[] = data.map((appointment: Appointment) => ({
          id: appointment.id,
          title: appointment.title,
          date: new Date(appointment.date),
          time: appointment.time,
          type: 'appointment' as const,
          customer: appointment.firstName && appointment.lastName 
            ? `${appointment.firstName} ${appointment.lastName}` 
            : undefined,
          status: appointment.status
        }));
        setEvents(eventsData);
      } else {
        console.error('Failed to fetch appointments');
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salesforce-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Calendar</h1>
          <p className="text-neutral-600">Manage your appointments and events</p>
        </div>
        <button className="slds-button slds-button-brand flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Add Event</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 slds-card">
          {/* Calendar Header */}
          <div className="slds-card-header flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 text-sm bg-salesforce-50 text-salesforce-600 rounded-lg hover:bg-salesforce-100"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-2 hover:bg-neutral-100 rounded-lg"
              >
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-semibold text-neutral-600 uppercase tracking-wide">
                  {day}
                </div>
              ))}
              
              {daysInMonth.map((date, index) => {
                const dayEvents = getEventsForDate(date);
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isTodayDate = isToday(date);
                
                return (
                  <div
                    key={index}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      p-2 min-h-[80px] border border-neutral-200 cursor-pointer hover:bg-neutral-50
                      ${isSelected ? 'bg-salesforce-50 border-salesforce-200' : ''}
                      ${isTodayDate ? 'bg-blue-50 border-blue-200' : ''}
                    `}
                  >
                    <div className={`
                      text-sm font-medium
                      ${isTodayDate ? 'text-blue-600' : 'text-neutral-900'}
                      ${isSelected ? 'text-salesforce-600' : ''}
                    `}>
                      {format(date, 'd')}
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={`
                            text-xs p-1 rounded truncate
                            ${event.type === 'appointment' ? 'bg-green-100 text-green-800' : ''}
                            ${event.type === 'meeting' ? 'bg-blue-100 text-blue-800' : ''}
                            ${event.type === 'reminder' ? 'bg-yellow-100 text-yellow-800' : ''}
                          `}
                        >
                          {event.time} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-neutral-500">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Event Details Sidebar */}
        <div className="slds-card">
          <div className="slds-card-header">
            <h3 className="text-lg font-semibold text-neutral-900">
              {selectedDate ? `${format(selectedDate, 'EEEE')}, ${formatDate(selectedDate)}` : 'Select a date'}
            </h3>
          </div>
          
          {selectedDate && (
            <div className="p-6 space-y-4">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <div key={event.id} className="p-4 border border-neutral-200 rounded hover:bg-neutral-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${event.type === 'appointment' ? 'bg-green-100 text-green-800' : ''}
                        ${event.type === 'meeting' ? 'bg-blue-100 text-blue-800' : ''}
                        ${event.type === 'reminder' ? 'bg-yellow-100 text-yellow-800' : ''}
                      `}>
                        {event.type}
                      </span>
                      <span className="text-sm text-neutral-600">{event.time}</span>
                    </div>
                    <h4 className="font-medium text-neutral-900">{event.title}</h4>
                    {event.customer && (
                      <p className="text-sm text-neutral-600 mt-1">with {event.customer}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-neutral-500 text-center">No events scheduled</p>
              )}
              
              <button className="w-full mt-4 slds-button slds-button-brand">
                Add Event for {formatDate(selectedDate)}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Integration Options */}
      <div className="slds-card">
        <div className="slds-card-header">
          <h3 className="text-lg font-semibold text-neutral-900">Calendar Integration</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="flex items-center justify-center space-x-3 p-4 border border-neutral-300 rounded-lg hover:bg-neutral-50 text-neutral-700">
              <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium">Connect Google Calendar</span>
            </button>
            <button className="flex items-center justify-center space-x-3 p-4 border border-neutral-300 rounded-lg hover:bg-neutral-50 text-neutral-700">
              <div className="h-8 w-8 bg-blue-800 rounded flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium">Connect Outlook Calendar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
