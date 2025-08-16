import React, { useState, useEffect } from 'react';
import { XIcon, CalendarIcon, ClockIcon, UserIcon, MailIcon, PhoneIcon } from 'lucide-react';

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
  // Customer form state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [checkingCustomer, setCheckingCustomer] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCustomerName('');
      setCustomerEmail('');
      setCustomerMobile('');
      setServiceType('');
      setNotes('');
      setExistingCustomer(null);
    }
  }, [isOpen]);

  // Check if customer exists when email changes
  useEffect(() => {
    const checkCustomerExists = async () => {
      if (customerEmail && customerEmail.includes('@')) {
        setCheckingCustomer(true);
        try {
          const response = await fetch(`/api/customers?email=${encodeURIComponent(customerEmail)}`);
          if (response.ok) {
            const customers = await response.json();
            const foundCustomer = customers.find((c: Customer) => 
              c.email.toLowerCase() === customerEmail.toLowerCase()
            );
            
            if (foundCustomer) {
              setExistingCustomer(foundCustomer);
              setCustomerName(`${foundCustomer.firstName} ${foundCustomer.lastName}`);
              setCustomerMobile(foundCustomer.mobile || '');
            } else {
              setExistingCustomer(null);
            }
          }
        } catch (error) {
          console.error('Error checking customer:', error);
        } finally {
          setCheckingCustomer(false);
        }
      } else {
        setExistingCustomer(null);
      }
    };

    const timeoutId = setTimeout(checkCustomerExists, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [customerEmail]);

  const createOrUpdateCustomer = async (): Promise<string> => {
    if (existingCustomer) {
      // Customer exists, return their ID
      return existingCustomer.id;
    }

    // Create new customer
    const [firstName, ...lastNameParts] = customerName.trim().split(' ');
    const lastName = lastNameParts.join(' ') || '';

    const customerData = {
      firstName: firstName || 'Unknown',
      lastName: lastName || '',
      email: customerEmail,
      mobile: customerMobile || '',
      status: 'active'
    };

    const response = await fetch('/api/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      throw new Error('Failed to create customer');
    }

    const newCustomer = await response.json();
    return newCustomer.id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim() || !customerEmail.trim() || !serviceType || !selectedSlot) {
      alert('Please fill in all required fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Create or get customer ID
      const customerId = await createOrUpdateCustomer();
      
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
        customerId: customerId,
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
          customer: customerName,
          service: serviceType
        });

        // Reset form
        setCustomerName('');
        setCustomerEmail('');
        setCustomerMobile('');
        setServiceType('');
        setNotes('');
        setExistingCustomer(null);
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

          {/* Customer Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-4">Customer Information</h3>
            
            {/* Customer Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <UserIcon className="h-4 w-4 inline mr-1" />
                Full Name *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter customer's full name"
                required
              />
            </div>

            {/* Customer Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <MailIcon className="h-4 w-4 inline mr-1" />
                Email Address *
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter customer's email address"
                required
              />
              {checkingCustomer && (
                <p className="text-sm text-blue-600 mt-1">Checking if customer exists...</p>
              )}
              {existingCustomer && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Existing customer found: {existingCustomer.firstName} {existingCustomer.lastName}
                </p>
              )}
            </div>

            {/* Customer Mobile */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                <PhoneIcon className="h-4 w-4 inline mr-1" />
                Mobile Number
              </label>
              <input
                type="tel"
                value={customerMobile}
                onChange={(e) => setCustomerMobile(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter customer's mobile number"
              />
            </div>
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
