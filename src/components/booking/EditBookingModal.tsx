import React, { useState, useEffect } from 'react';
import { XIcon, CalendarIcon, ClockIcon, UserIcon, MailIcon, PhoneIcon } from 'lucide-react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
}

interface Appointment {
  id: string;
  customerId: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  service?: string;
}

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onBookingUpdate: (appointment: Appointment) => void;
}

const EditBookingModal: React.FC<EditBookingModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onBookingUpdate
}) => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(60);
  const [service, setService] = useState('');
  const [status, setStatus] = useState('scheduled');
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);

  // Load appointment data when modal opens
  useEffect(() => {
    if (isOpen && appointment) {
      console.log('Loading appointment data:', appointment); // Debug log
      setTitle(appointment.title || '');
      setDescription(appointment.description || '');
      setDate(appointment.date || '');
      setTime(appointment.time || '');
      setDuration(appointment.duration || 60);
      setService(appointment.service || '');
      setStatus(appointment.status || 'scheduled');
      
      // Load customer data
      if (appointment.customerId) {
        loadCustomer(appointment.customerId);
      } else {
        console.error('No customerId found in appointment:', appointment);
      }
    } else {
      // Reset form when modal closes
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setDuration(60);
      setService('');
      setStatus('scheduled');
      setCustomer(null);
    }
  }, [isOpen, appointment]);

  const loadCustomer = async (customerId: string) => {
    try {
      console.log('Loading customer with ID:', customerId); // Debug log
      const response = await fetch(`/api/customers/${customerId}`);
      if (response.ok) {
        const responseData = await response.json();
        console.log('Customer data loaded:', responseData); // Debug log
        // Extract the customer object from the response
        const customerData = responseData.customer || responseData;
        console.log('Setting customer state:', customerData); // Debug log
        setCustomer(customerData);
      } else {
        console.error('Failed to load customer:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error loading customer:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;

    setLoading(true);
    try {
      const updateData = {
        title,
        description,
        date,
        time,
        duration,
        service,
        status
      };

      console.log('Sending update data:', updateData); // Debug log

      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Update successful:', result); // Debug log
        const updatedAppointment = {
          ...appointment,
          ...updateData
        };
        onBookingUpdate(updatedAppointment);
        onClose();
      } else {
        const errorData = await response.json();
        console.error('API Error:', response.status, errorData); // Debug log
        throw new Error(`Failed to update appointment: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      alert(`Failed to update appointment: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Edit Appointment</h2>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Customer Info (Read-only) */}
        {customer && (
          <div className="p-4 border-b border-neutral-200 bg-neutral-50">
            <h3 className="text-xs font-medium text-neutral-700 mb-2 flex items-center">
              <UserIcon className="w-3 h-3 mr-1" />
              Customer Details
            </h3>
            <div className="space-y-1 text-xs text-neutral-600">
              <div className="flex items-center">
                <UserIcon className="w-3 h-3 mr-2" />
                {customer.firstName} {customer.lastName}
              </div>
              <div className="flex items-center">
                <MailIcon className="w-3 h-3 mr-2" />
                {customer.email}
              </div>
              {customer.mobile && (
                <div className="flex items-center">
                  <PhoneIcon className="w-3 h-3 mr-2" />
                  {customer.mobile}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading state for customer */}
        {!customer && appointment && (
          <div className="p-4 border-b border-neutral-200 bg-neutral-50">
            <div className="text-xs text-neutral-500">Loading customer details...</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Appointment Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-2 py-1.5 border border-neutral-300 rounded text-neutral-900 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter appointment title"
              required
            />
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Service Type
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full px-2 py-1.5 border border-neutral-300 rounded text-neutral-900 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a service</option>
              <option value="consultation">Consultation</option>
              <option value="assessment">Assessment</option>
              <option value="therapy">Therapy Session</option>
              <option value="follow-up">Follow-up</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                <CalendarIcon className="w-3 h-3 inline mr-1" />
                Date *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2 py-1.5 border border-neutral-300 rounded text-neutral-900 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                <ClockIcon className="w-3 h-3 inline mr-1" />
                Time *
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-2 py-1.5 border border-neutral-300 rounded text-neutral-900 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Duration (minutes) *
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-2 py-1.5 border border-neutral-300 rounded text-neutral-900 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes</option>
              <option value={90}>90 minutes</option>
              <option value={120}>120 minutes</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-2 py-1.5 border border-neutral-300 rounded text-neutral-900 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Description/Notes */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">
              Notes
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-2 py-1.5 border border-neutral-300 rounded text-neutral-900 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Add any additional notes for this appointment..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-1.5 border border-neutral-300 text-neutral-700 rounded text-sm hover:bg-neutral-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !title || !date || !time}
            >
              {loading ? 'Updating...' : 'Update Appointment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBookingModal;
