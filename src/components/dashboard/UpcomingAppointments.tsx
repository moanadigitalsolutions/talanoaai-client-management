'use client';

import { useEffect, useState } from 'react';
import { CalendarIcon, ClockIcon } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/dateUtils';

interface Appointment {
  id: string;
  customerId: string;
  customerName?: string;
  service: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export default function UpcomingAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingAppointments();
  }, []);

  const fetchUpcomingAppointments = async () => {
    try {
      const response = await fetch('/api/appointments?limit=5&upcoming=true');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      } else {
        console.error('Failed to fetch upcoming appointments');
      }
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="slds-table">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td className="px-6 py-4 whitespace-nowrap animate-pulse">
                  <div className="h-4 bg-neutral-200 rounded w-32"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap animate-pulse">
                  <div className="h-4 bg-neutral-200 rounded w-24"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap animate-pulse">
                  <div className="h-4 bg-neutral-200 rounded w-40"></div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap animate-pulse">
                  <div className="h-6 bg-neutral-200 rounded w-20"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const parsed = Date.parse(appointment.dateTime);
        const appointmentDate = isNaN(parsed) ? null : new Date(parsed);
        return (
          <div key={appointment.id} className="group relative bg-gradient-to-r from-white to-neutral-50 border border-neutral-200 rounded-lg p-4 hover:shadow-md hover:border-neutral-300 transition-all duration-200">
            {/* Status indicator */}
            <div className="absolute top-4 right-4">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                appointment.status === 'confirmed' 
                  ? 'bg-green-100 text-green-800' 
                  : appointment.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : appointment.status === 'completed'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {appointment.status}
              </span>
            </div>
            
            <div className="flex items-start space-x-4 pr-20">
              {/* Customer Avatar */}
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {appointment.customerName ? 
                    appointment.customerName.split(' ').map(n => n.charAt(0)).join('').substring(0, 2) :
                    'C'
                  }
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                      {appointment.customerName || `Customer ${appointment.customerId}`}
                    </h4>
                    <p className="text-sm text-neutral-600 mt-1">{appointment.service}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mt-3">
                  <div className="flex items-center space-x-1 text-xs text-neutral-600">
                    <CalendarIcon className="h-3 w-3" />
                    <span>{appointmentDate ? formatDate(appointmentDate) : 'Invalid Date'}</span>
                  </div>
                    <div className="flex items-center space-x-1 text-xs text-neutral-600">
                      <ClockIcon className="h-3 w-3" />
                      <span>{appointmentDate ? formatTime(appointmentDate) : '--'}</span>
                    </div>
                </div>
                
                {appointment.notes && (
                  <p className="text-xs text-neutral-500 mt-2 line-clamp-2">{appointment.notes}</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {appointments.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <CalendarIcon className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="text-sm font-medium text-neutral-900 mb-1">No upcoming appointments</h3>
          <p className="text-xs text-neutral-500">New appointments will appear here</p>
        </div>
      )}
    </div>
  );
}
