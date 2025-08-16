import { NextRequest, NextResponse } from 'next/server';
import { timeSlotQueries, appointmentQueries } from '@/lib/database';

export async function GET() {
  try {
    const timeSlots = timeSlotQueries.getAll();
    
    // Group by day for easier frontend consumption
    const schedule: Record<string, any> = timeSlots.reduce((acc: Record<string, any>, slot: any) => {
      if (!acc[slot.day]) {
        acc[slot.day] = {
          day: slot.day,
          isEnabled: true,
          timeSlots: []
        };
      }
      
      // Get appointment details if slot is booked
      let customer = null;
      let service = null;
      
      if (!slot.isAvailable && slot.appointmentId) {
        const appointment = appointmentQueries.getById(slot.appointmentId) as any;
        if (appointment) {
          customer = `${appointment.firstName || ''} ${appointment.lastName || ''}`.trim();
          service = appointment.service;
        }
      }
      
      acc[slot.day].timeSlots.push({
        id: slot.id,
        time: slot.time,
        duration: slot.duration,
        isAvailable: Boolean(slot.isAvailable),
        customer,
        service
      });
      
      return acc;
    }, {});
    
    // Convert to array format
    const scheduleArray = Object.values(schedule);
    
    return NextResponse.json(scheduleArray);
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json({ error: 'Failed to fetch time slots' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, isAvailable, appointmentId } = body;
    
    timeSlotQueries.update(id, isAvailable, appointmentId);
    
    return NextResponse.json({ message: 'Time slot updated successfully' });
  } catch (error) {
    console.error('Error updating time slot:', error);
    return NextResponse.json({ error: 'Failed to update time slot' }, { status: 500 });
  }
}
