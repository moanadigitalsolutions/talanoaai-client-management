import { NextRequest, NextResponse } from 'next/server';
import { appointmentQueries, timeSlotQueries } from '@/lib/database';

interface Appointment {
  id: string;
  customerId: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  dateTime?: string;
  duration: number;
  status: string;
  service?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const upcoming = searchParams.get('upcoming');
    
    let appointments: Appointment[] = appointmentQueries.getAll() as Appointment[];
    
    // Filter upcoming appointments if requested
    if (upcoming === 'true') {
      const now = new Date();
      appointments = appointments.filter((appointment: Appointment) => {
        const appointmentDateTime = new Date(appointment.dateTime || `${appointment.date} ${appointment.time}`);
        return appointmentDateTime > now;
      });
      
      // Sort by date/time
      appointments.sort((a: Appointment, b: Appointment) => {
        const dateA = new Date(a.dateTime || `${a.date} ${a.time}`);
        const dateB = new Date(b.dateTime || `${b.date} ${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
    }
    
    if (limit) {
      const limitNum = parseInt(limit, 10);
      appointments = appointments.slice(0, limitNum);
    }
    
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received appointment data:', body);
    
    // Generate appointment ID
    const appointmentId = `APPT${Date.now()}`;
    
    const appointment = {
      id: appointmentId,
      customerId: body.customerId,
      title: body.title,
      description: body.description || '',
      date: body.date,
      time: body.time,
      duration: body.duration || 60,
      status: body.status || 'scheduled',
      service: body.service || ''
    };

    console.log('Creating appointment:', appointment);
    
    const createResult = appointmentQueries.create(appointment);
    console.log('Appointment create result:', createResult);
    
    // Update time slot availability if provided
    if (body.timeSlotId) {
      console.log('Updating time slot:', body.timeSlotId);
      console.log('Parameters:', { timeSlotId: body.timeSlotId, isAvailable: false, appointmentId });
      console.log('Parameter types:', { 
        timeSlotId: typeof body.timeSlotId, 
        isAvailable: typeof false, 
        appointmentId: typeof appointmentId 
      });
      const updateResult = timeSlotQueries.update(body.timeSlotId, false, appointmentId);
      console.log('Time slot update result:', updateResult);
    }
    
    return NextResponse.json({ message: 'Appointment created successfully', id: appointmentId }, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
