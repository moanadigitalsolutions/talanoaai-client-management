import { NextRequest, NextResponse } from 'next/server';
import { customerQueries, appointmentQueries, timeSlotQueries } from '@/lib/database';

// Simple in-memory cache (resets on server restart / deployment)
let dashboardCache: { data: any; timestamp: number } | null = null;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds

export async function GET(request: NextRequest) {
  try {
    // Return cached if fresh
    if (dashboardCache && Date.now() - dashboardCache.timestamp < CACHE_TTL_MS) {
      const etag = dashboardCache.data._etag;
      const ifNoneMatch = request.headers.get('if-none-match');
      if (ifNoneMatch && etag && ifNoneMatch === etag) {
        return new NextResponse(null, { status: 304, headers: { 'ETag': etag } });
      }
      return NextResponse.json(dashboardCache.data, { headers: { 'ETag': etag } });
    }

    const customers = customerQueries.getAll() as any[];
    const appointments = appointmentQueries.getAll() as any[];
    const timeSlots = timeSlotQueries.getAll() as any[];
    
    // Calculate statistics
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const totalAppointments = appointments.length;
    const scheduledAppointments = appointments.filter(a => a.status === 'scheduled').length;
    const completedAppointments = appointments.filter(a => a.status === 'completed').length;
    
    // Calculate revenue (mock calculation)
    const monthlyRevenue = completedAppointments * 150; // $150 per appointment
    
    // Calculate booking trends for chart (last 7 days)
    const bookingTrends = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const bookingsCount = appointments.filter(a => a.date === dateStr).length;
      
      bookingTrends.push({
        date: (() => {
          const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
          const day = date.getUTCDate();
          return `${month} ${day}`;
        })(),
        bookings: bookingsCount
      });
    }
    
    // Recent customers (last 5)
    const recentCustomers = customers
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(customer => ({
        id: customer.id,
        name: `${customer.firstName} ${customer.lastName}`,
        email: customer.email,
        status: customer.status,
        joinDate: customer.createdAt
      }));
    
    // Upcoming appointments (next 5)
    const upcomingAppointments = appointments
      .filter(a => a.status === 'scheduled')
      .sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5)
      .map(appointment => ({
        id: appointment.id,
        customerName: `${appointment.firstName || ''} ${appointment.lastName || ''}`.trim(),
        service: appointment.service,
        date: appointment.date,
        time: appointment.time
      }));
    
  const payload: any = {
      stats: {
        totalCustomers,
        activeCustomers,
        totalAppointments,
        monthlyRevenue
      },
      bookingTrends,
      recentCustomers,
      upcomingAppointments
  };

  // Compute weak ETag (simple hash alternative)
  const etag = 'W/"' + Buffer.from(JSON.stringify(payload)).toString('base64').slice(0, 16) + '"';
  payload._etag = etag;

  dashboardCache = { data: payload, timestamp: Date.now() };
  return NextResponse.json(payload, { headers: { 'ETag': etag, 'Cache-Control': 'public, max-age=15, stale-while-revalidate=30' } });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
