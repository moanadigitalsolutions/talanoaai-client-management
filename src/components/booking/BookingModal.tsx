import React, { useState, useEffect } from 'react';
import { XIcon, CalendarIcon, ClockIcon, UserIcon } from 'lucide-react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
}

interface TimeSlot {
  id: string;
  time: string;
  duration: number;
  isAvailable: boolean;
  day?: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: TimeSlot | null;
  onBookingConfirm: (booking: any) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedSlot,
  onBookingConfirm
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomerId || !serviceType || !selectedSlot) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
      
      // Get the date for the selected day
      const getDayDate = (dayName: string) => {
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayMap: { [key: string]: number } = {
          'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 
          'Thursday': 4, 'Friday': 5, 'Saturday': 6
        };
        
        const targetDay = dayMap[dayName];
        let daysUntilTarget = targetDay - currentDay;
        
        if (daysUntilTarget <= 0) {
          daysUntilTarget += 7; // Next week
        }
        
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysUntilTarget);
        return targetDate.toISOString().split('T')[0];
      };

      const appointmentData = {
        customerId: selectedCustomerId,
        title: serviceType,
        description: notes,
        date: selectedSlot.day ? getDayDate(selectedSlot.day) : new Date().toISOString().split('T')[0],
        time: selectedSlot.time,
        duration: selectedSlot.duration,
        service: serviceType,
        status: 'scheduled',
        timeSlotId: selectedSlot.id
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        const result = await response.json();
        const appointmentId = result.id;
        
        // Update the time slot to mark it as booked
        await fetch('/api/time-slots', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: selectedSlot.id,
            isAvailable: false,
            appointmentId: appointmentId
          }),
        });

        onBookingConfirm({
          id: appointmentId,
          ...appointmentData,
          customer: `${selectedCustomer?.firstName} ${selectedCustomer?.lastName}`,
          service: serviceType
        });

        // Reset form
        setSelectedCustomerId('');
        setServiceType('');
        setNotes('');
        onClose();
      } else {
        throw new Error('Failed to create appointment');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <h2 className="text-xl font-semibold text-neutral-900">Book Appointment</h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Time Slot Info */}
          {selectedSlot && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Selected Time Slot</span>
              </div>
              <div className="flex items-center space-x-4 text-sm text-blue-800">
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>{selectedSlot.day} at {selectedSlot.time}</span>
                </div>
                <span>•</span>
                <span>{selectedSlot.duration} minutes</span>
              </div>
            </div>
          )}

          {/* Customer Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <UserIcon className="h-4 w-4 inline mr-1" />
              Select Customer *
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Choose a customer...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.firstName} {customer.lastName} - {customer.email}
                </option>
              ))}
            </select>
          </div>

          {/* Service Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Service Type *
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select service type...</option>
              <option value="Consultation">Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Initial Meeting">Initial Meeting</option>
              <option value="Review">Review</option>
              <option value="Assessment">Assessment</option>
              <option value="Therapy Session">Therapy Session</option>
            </select>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any additional notes for this appointment..."
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
