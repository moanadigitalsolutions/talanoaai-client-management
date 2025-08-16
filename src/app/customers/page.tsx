'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim());
      }
      const response = await fetch(`/api/customers?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        if (Array.isArray(result)) {
          // Backwards compatibility if API returns array (older format)
          setCustomers(result);
          setTotal(result.length);
          setTotalPages(1);
        } else {
          setCustomers(result.data);
          setPage(result.page);
          setPageSize(result.pageSize);
          setTotalPages(result.totalPages);
          setTotal(result.total);
        }
      }
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchTerm]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchCustomers();
    }, 300); // debounce
    return () => clearTimeout(delay);
  }, [fetchCustomers]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(parseInt(e.target.value, 10));
    setPage(1);
  };

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
          <CustomerTable customers={customers} onCustomerUpdate={fetchCustomers} />
          {/* Pagination Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between px-6 py-4 space-y-4 md:space-y-0 border-t border-neutral-200">
            <div className="text-xs text-neutral-600">
              Showing {customers.length} of {total} customers
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-xs">
                <span>Rows per page</span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="border border-neutral-300 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {[10,25,50,100].map(size => <option key={size} value={size}>{size}</option>)}
                </select>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-2 py-1 border border-neutral-300 rounded disabled:opacity-40"
                >Prev</button>
                <span>Page {page} / {totalPages}</span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-2 py-1 border border-neutral-300 rounded disabled:opacity-40"
                >Next</button>
              </div>
            </div>
          </div>
        </ClientOnly>
      </div>
    </div>
  );
}
