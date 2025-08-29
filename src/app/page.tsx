'use client';

import { useEffect, useState } from 'react';
import { 
  UsersIcon, 
  CalendarIcon, 
  ClockIcon, 
  TrendingUpIcon,
  DollarSignIcon,
  PhoneCallIcon
} from 'lucide-react';
import DashboardCard from '@/components/dashboard/DashboardCard';
import RecentCustomers from '@/components/dashboard/RecentCustomers';
import dynamic from 'next/dynamic';
const BookingChart = dynamic(() => import('@/components/dashboard/BookingChart'), { ssr: false, loading: () => <div className="h-80 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salesforce-600"></div></div> });
import UpcomingAppointments from '@/components/dashboard/UpcomingAppointments';
import ClientOnly from '@/components/common/ClientOnly';

interface DashboardStats {
  totalCustomers: number;
  activeCustomers: number;
  totalAppointments: number;
  monthlyRevenue: number;
}

interface DashboardData {
  stats: DashboardStats;
  bookingTrends: any[];
  recentCustomers: any[];
  upcomingAppointments: any[];
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
        <div className="p-6 space-y-8 max-w-7xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="animate-pulse">
              <div className="h-8 bg-neutral-200 rounded-lg w-48 mb-2"></div>
              <div className="h-4 bg-neutral-200 rounded w-96"></div>
            </div>
            <div className="hidden md:flex animate-pulse">
              <div className="h-4 bg-neutral-200 rounded w-32"></div>
            </div>
          </div>
          
          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6 animate-pulse">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-neutral-200 rounded w-24 mb-3"></div>
                    <div className="h-8 bg-neutral-200 rounded w-16 mb-4"></div>
                    <div className="h-4 bg-neutral-200 rounded w-20"></div>
                  </div>
                  <div className="h-12 w-12 bg-neutral-200 rounded-xl"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-xl border border-neutral-200 shadow-sm">
              <div className="p-6 border-b border-neutral-100 animate-pulse">
                <div className="h-6 bg-neutral-200 rounded w-40"></div>
              </div>
              <div className="p-6">
                <div className="h-80 bg-neutral-100 rounded-lg animate-pulse"></div>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm">
              <div className="p-6 border-b border-neutral-100 animate-pulse">
                <div className="h-6 bg-neutral-200 rounded w-32"></div>
              </div>
              <div className="p-6 space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="h-10 w-10 bg-neutral-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                      <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const dashboardStats = dashboardData?.stats ? [
    {
      title: 'Total Customers',
      value: (dashboardData.stats.totalCustomers || 0).toString(),
      change: '+12%',
      changeType: 'positive' as const,
      icon: UsersIcon,
    },
    {
      title: 'This Month Bookings',
      value: (dashboardData.stats.totalAppointments || 0).toString(),
      change: '+5%',
      changeType: 'positive' as const,
      icon: CalendarIcon,
    },
    {
      title: 'Active Customers',
      value: (dashboardData.stats.activeCustomers || 0).toString(),
      change: '-3%',
      changeType: 'negative' as const,
      icon: ClockIcon,
    },
    {
      title: 'Monthly Revenue',
      value: `$${(dashboardData.stats.monthlyRevenue || 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
      change: '+18%',
      changeType: 'positive' as const,
      icon: DollarSignIcon,
    },
  ] : [];

  return (
    <div className="min-h-full bg-gradient-to-br from-neutral-50 via-white to-neutral-50">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 bg-gradient-to-r from-neutral-900 to-neutral-600 bg-clip-text">
              Dashboard
            </h1>
            <p className="text-neutral-600 mt-1">Welcome back! Here&apos;s your business overview</p>
          </div>
          <div className="hidden md:flex items-center space-x-3 text-sm text-neutral-500">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span>System Online</span>
            </div>
            <div className="h-4 w-px bg-neutral-300"></div>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <DashboardCard key={index} {...stat} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Chart Section - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 border-b border-neutral-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-neutral-900">Business Analytics</h3>
                  <div className="flex items-center space-x-2 text-xs text-neutral-500">
                    <span>8 months</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <ClientOnly fallback={
                  <div className="h-80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-salesforce-600"></div>
                  </div>
                }>
                  <BookingChart data={dashboardData?.bookingTrends || []} />
                </ClientOnly>
              </div>
            </div>
          </div>
          
          {/* Recent Customers */}
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6 border-b border-neutral-100">
              <h3 className="text-lg font-semibold text-neutral-900">Recent Customers</h3>
              <p className="text-sm text-neutral-600 mt-1">Latest registrations</p>
            </div>
            <div className="p-6">
              <ClientOnly fallback={
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center space-x-3">
                      <div className="h-10 w-10 bg-neutral-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                        <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              }>
                <RecentCustomers />
              </ClientOnly>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-neutral-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Upcoming Appointments</h3>
                <p className="text-sm text-neutral-600 mt-1">Next 5 scheduled appointments</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></div>
                <span className="text-xs text-neutral-500">5 pending</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <ClientOnly fallback={
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between p-4 border border-neutral-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-neutral-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-neutral-200 rounded w-32"></div>
                        <div className="h-3 bg-neutral-200 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-neutral-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            }>
              <UpcomingAppointments />
            </ClientOnly>
          </div>
        </div>
      </div>
    </div>
  );
}
