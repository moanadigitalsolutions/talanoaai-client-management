import { NextRequest, NextResponse } from 'next/server';
import { appointmentQueries, timeSlotQueries, customerQueries } from '@/lib/database';
import { appointmentCreateSchema, parseOrError } from '@/lib/validation';
import crypto from 'crypto';

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
    const upcoming = searchParams.get('upcoming') === 'true';

    let appointments: Appointment[] = appointmentQueries.getAll() as Appointment[];

    // Normalize appointments with computed dateTime once
    appointments = appointments.map(a => ({
      ...a,
      dateTime: a.dateTime || `${a.date}T${a.time}:00` // ISO-ish for parsing
    }));

    if (upcoming) {
      const now = Date.now();
      appointments = appointments.filter(a => {
        const ts = Date.parse(a.dateTime!);
        return !isNaN(ts) && ts > now;
      }).sort((a, b) => Date.parse(a.dateTime!) - Date.parse(b.dateTime!));
    }

    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        appointments = appointments.slice(0, limitNum);
      }
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
    const parsed = parseOrError(appointmentCreateSchema, body);
    if ('error' in parsed) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error }, { status: 400 });
    }
    const dto = parsed.data;
    console.log('Received appointment data:', body);
    
  // Generate collision-resistant appointment ID
  const appointmentId = `APPT_${crypto.randomUUID()}`;
    
  const appointment = { id: appointmentId, ...dto };

    console.log('Creating appointment:', appointment);
    
  const createResult = appointmentQueries.create(appointment);
  // Increment customer's booking count
  try { customerQueries.incrementTotalBookings(appointment.customerId); } catch (e) { console.warn('Failed to increment booking count', e); }
    console.log('Appointment create result:', createResult);
    
    // Update time slot availability if provided (single source of truth)
    if (dto.timeSlotId) {
      try { timeSlotQueries.update(dto.timeSlotId, false, appointmentId); } catch (e) { console.warn('Failed linking time slot', e); }
    }
    
  return NextResponse.json({ message: 'Appointment created successfully', id: appointmentId, dateTime: `${appointment.date}T${appointment.time}:00` }, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
