'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, SaveIcon } from 'lucide-react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  address: string;
  notes: string;
  status: 'active' | 'inactive';
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditCustomerPage({ params }: PageProps) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string>('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    address: '',
    notes: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    const initializePage = async () => {
      const { id } = await params;
      setCustomerId(id);
      
      const fetchCustomer = async () => {
        try {
          const response = await fetch(`/api/customers/${id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch customer');
          }
          const data = await response.json();
          const customerData = data.customer;
          setCustomer(customerData);
          const newFormData = {
            firstName: customerData.firstName || '',
            lastName: customerData.lastName || '',
            email: customerData.email || '',
            mobile: customerData.mobile || '',
            dateOfBirth: customerData.dateOfBirth || '',
            address: customerData.address || '',
            notes: customerData.notes || '',
            status: customerData.status || 'active'
          };
          setFormData(newFormData);
        } catch (error) {
          console.error('Error fetching customer:', error);
          setError('Failed to load customer');
        } finally {
          setLoading(false);
        }
      };

      fetchCustomer();
    };

    initializePage();
  }, [params]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update customer');
      }

      router.push(`/customers/${customerId}`);
    } catch (error) {
      console.error('Error updating customer:', error);
      setError('Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-lg text-neutral-600">Loading customer...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href={`/customers/${customerId}`}
              className="flex items-center text-neutral-600 hover:text-neutral-800"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Customer
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h1 className="text-xl font-semibold text-neutral-900">
              Edit Customer: {customer?.firstName} {customer?.lastName}
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              Update customer information and preferences
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-salesforce-500 focus:border-salesforce-500 text-sm text-neutral-900 bg-white"
                />
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-salesforce-500 focus:border-salesforce-500 text-sm text-neutral-900 bg-white"
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-salesforce-500 focus:border-salesforce-500 text-sm text-neutral-900 bg-white"
                />
              </div>

              {/* Mobile */}
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-neutral-700 mb-2">
                  Mobile Phone
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-salesforce-500 focus:border-salesforce-500 text-sm text-neutral-900 bg-white"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-neutral-700 mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-salesforce-500 focus:border-salesforce-500 text-sm text-neutral-900 bg-white"
                />
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-salesforce-500 focus:border-salesforce-500 text-sm text-neutral-900 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div className="mt-6">
              <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-2">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-salesforce-500 focus:border-salesforce-500 text-sm text-neutral-900 bg-white"
                placeholder="Street address, city, state, postal code"
              />
            </div>

            {/* Notes */}
            <div className="mt-6">
              <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-salesforce-500 focus:border-salesforce-500 text-sm text-neutral-900 bg-white"
                placeholder="Additional notes about the customer..."
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end space-x-4">
              <Link
                href={`/customers/${customerId}`}
                className="px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-salesforce-600 border border-transparent rounded-md hover:bg-salesforce-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SaveIcon className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
