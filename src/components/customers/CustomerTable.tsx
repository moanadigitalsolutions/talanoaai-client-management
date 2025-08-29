'use client';

import { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  MoreVerticalIcon,
  EditIcon,
  EyeIcon,
  TrashIcon
} from 'lucide-react';
import { formatDate } from '@/lib/dateUtils';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  status: 'active' | 'inactive';
  totalBookings: number;
  createdAt: string;
}

interface CustomerTableProps {
  customers: Customer[];
  onCustomerUpdate: () => void;
}

export default function CustomerTable({ customers, onCustomerUpdate }: CustomerTableProps) {
  const handleDeleteCustomer = useCallback(async (customerId: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        const response = await fetch(`/api/customers/${customerId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          onCustomerUpdate();
        } else {
          alert('Failed to delete customer');
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
        alert('Failed to delete customer');
      }
    }
  }, [onCustomerUpdate]);

  const rows = useMemo(() => customers.map((customer) => (
    <tr key={customer.id} className="hover:bg-neutral-50" data-testid="customer-row">
      <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-neutral-900">
        {customer.id}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-xs font-medium text-neutral-900">
          {customer.firstName} {customer.lastName}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-900">
        {customer.email}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-900">
        {customer.mobile || '-'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          customer.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-neutral-100 text-neutral-800'
        }`}>
          {customer.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-900">
        {customer.totalBookings}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-900">
        {formatDate(customer.createdAt)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-xs text-neutral-500">
        <div className="flex items-center space-x-2">
          <Link 
            href={`/customers/${customer.id}`}
            className="text-salesforce-600 hover:text-salesforce-700 p-1 rounded hover:bg-neutral-100"
            data-testid="view-customer"
          >
            <EyeIcon className="h-4 w-4" />
          </Link>
          <Link 
            href={`/customers/${customer.id}/edit`}
            className="text-salesforce-600 hover:text-salesforce-700 p-1 rounded hover:bg-neutral-100"
            data-testid="edit-customer"
          >
            <EditIcon className="h-4 w-4" />
          </Link>
          <button 
            className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDeleteCustomer(customer.id);
            }}
            data-testid="delete-customer"
            aria-label="Delete customer"
            title="Delete customer"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  )), [customers, handleDeleteCustomer]);

  return (
    <div className="overflow-x-auto">
  <table className="slds-table" data-testid="customer-table">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Customer ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Phone
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Bookings
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Join Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-bold text-neutral-700 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {rows}
        </tbody>
      </table>
      
      {customers.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          No customers found
        </div>
      )}
    </div>
  );
}
