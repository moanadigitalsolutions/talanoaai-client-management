'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  PlusIcon, 
  SearchIcon, 
  FilterIcon,
  MoreVerticalIcon,
  EditIcon,
  EyeIcon,
  TrashIcon
} from 'lucide-react';
import CustomerTable from '@/components/customers/CustomerTable';
import ClientOnly from '@/components/common/ClientOnly';

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

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6 space-y-6 bg-neutral-50 min-h-full">
        <div className="flex justify-center items-center h-64">
          <div className="text-neutral-600">Loading customers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-neutral-50 min-h-full">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Customers</h1>
          <p className="text-neutral-600">Manage your customer database</p>
        </div>
        <Link 
          href="/customers/new"
          className="slds-button slds-button-brand flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Customer</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="slds-card">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="slds-input pl-10"
              />
            </div>
            <button className="slds-button flex items-center space-x-2">
              <FilterIcon className="h-4 w-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="slds-card">
        <ClientOnly fallback={<div className="p-8 text-center text-neutral-500">Loading customers...</div>}>
          <CustomerTable customers={filteredCustomers} onCustomerUpdate={fetchCustomers} />
        </ClientOnly>
      </div>
    </div>
  );
}
