'use client';

import { useEffect, useState } from 'react';
import { UsersIcon } from 'lucide-react';
import { formatDate } from '@/lib/dateUtils';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export default function RecentCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentCustomers();
  }, []);

  const fetchRecentCustomers = async () => {
    try {
      const response = await fetch('/api/customers?limit=4');
      if (response.ok) {
        const data = await response.json();
        // Handle both old array format and new paginated format
        const customersArray = Array.isArray(data) ? data : data.data || [];
        setCustomers(customersArray);
      } else {
        console.error('Failed to fetch recent customers');
      }
    } catch (error) {
      console.error('Error fetching recent customers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="animate-pulse p-4 border border-neutral-200 rounded">
            <div className="flex items-center space-x-4">
              <div className="h-3 w-3 rounded-full bg-neutral-200"></div>
              <div className="space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-32"></div>
                <div className="h-3 bg-neutral-200 rounded w-48"></div>
                <div className="h-3 bg-neutral-200 rounded w-20"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <div key={customer.id} className="group relative bg-gradient-to-r from-white to-neutral-50 border border-neutral-200 rounded-lg p-4 hover:shadow-md hover:border-neutral-300 transition-all duration-200">
          {/* Status indicator */}
          <div className="absolute top-4 right-4">
            <div className={`h-2 w-2 rounded-full ${customer.status === 'active' ? 'bg-green-400' : 'bg-neutral-400'}`}></div>
          </div>
          
          <div className="flex items-start space-x-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-salesforce-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-neutral-900 truncate group-hover:text-salesforce-600 transition-colors">
                  {customer.firstName} {customer.lastName}
                </h4>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  customer.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-neutral-100 text-neutral-700'
                }`}>
                  {customer.status}
                </span>
              </div>
              
              <p className="text-xs text-neutral-600 mt-1 truncate">{customer.email}</p>
              
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-neutral-500">{customer.id}</span>
                <span className="text-xs font-medium text-neutral-700">
                  {formatDate(customer.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {customers.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
            <UsersIcon className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="text-sm font-medium text-neutral-900 mb-1">No customers yet</h3>
          <p className="text-xs text-neutral-500">New customers will appear here</p>
        </div>
      )}
    </div>
  );
}
