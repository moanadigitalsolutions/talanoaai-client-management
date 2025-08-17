import { NextRequest, NextResponse } from 'next/server';
import { timeSlotQueries, appointmentQueries } from '@/lib/database';
import { timeSlotUpdateSchema, parseOrError } from '@/lib/validation';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const weekOffset = parseInt(searchParams.get('weekOffset') || '0', 10) || 0;

    // Base template slots (day/time/duration). We ignore isAvailable & appointmentId for other weeks.
    const templateSlots = timeSlotQueries.getAll();

    // Determine start of current week (Monday) in New Zealand timezone.
    const today = new Date();
    // Convert to New Zealand timezone
    const nzDate = new Date(today.toLocaleString("en-US", {timeZone: "Pacific/Auckland"}));
    const day = nzDate.getDay(); // 0 Sun ... 6 Sat
    const diffToMonday = (day === 0 ? -6 : 1 - day); // move back to Monday
    const monday = new Date(nzDate);
    monday.setHours(0,0,0,0);
    monday.setDate(monday.getDate() + diffToMonday + weekOffset * 7);

    const weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const dateMap: Record<string,string> = {};
    weekdays.forEach((wd, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      // Use local NZ date string to avoid timezone issues
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dateMap[wd] = `${year}-${month}-${day}`;
    });

  // Get appointments for the displayed week using range query
  const weekStart = dateMap['Monday'];
  const weekEnd = dateMap['Sunday'];
  const appointments = (appointmentQueries as any).getRange ? (appointmentQueries as any).getRange(weekStart, weekEnd) : appointmentQueries.getAll();
  const apptIndex = new Map<string, any>();
  appointments.forEach((a:any) => apptIndex.set(`${a.date}|${a.time}`, a));

    // Build schedule structure
    const scheduleArray = weekdays.map(dayName => {
      const slotsForDay = templateSlots.filter((s: any) => s.day === dayName).map((slot: any) => {
        const date = dateMap[dayName];
        const key = `${date}|${slot.time}`;
        const appt = apptIndex.get(key);
        return {
          id: slot.id,
            time: slot.time,
            duration: slot.duration,
            isAvailable: appt ? false : true,
            customer: appt ? `${appt.firstName || ''} ${appt.lastName || ''}`.trim() : null,
            service: appt ? appt.service : null,
            date,
            day: dayName
        };
      });
      return {
        day: dayName,
        dayDate: dateMap[dayName],
        isEnabled: true,
        timeSlots: slotsForDay
      };
    });

    return NextResponse.json({ weekOffset, days: scheduleArray, weekStart: dateMap['Monday'], weekEnd: dateMap['Sunday'] });
  } catch (error) {
    console.error('Error fetching time slots:', error);
    return NextResponse.json({ error: 'Failed to fetch time slots' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
  const body = await request.json();
  const parsed = parseOrError(timeSlotUpdateSchema, body);
  if ('error' in parsed) return NextResponse.json({ error: 'Validation failed', details: parsed.error }, { status: 400 });
  const { id, isAvailable, appointmentId } = parsed.data;

  timeSlotQueries.update(id, isAvailable, appointmentId ?? undefined);
    
    return NextResponse.json({ message: 'Time slot updated successfully' });
  } catch (error) {
    console.error('Error updating time slot:', error);
    return NextResponse.json({ error: 'Failed to update time slot' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const schema = z.object({
      day: z.enum(['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']),
      time: z.string().regex(/^\d{2}:\d{2}$/),
      duration: z.number().min(5).max(480).default(60)
    });
    const data = await request.json();
    const { day, time, duration } = schema.parse(data);
    timeSlotQueries.createIfNotExists(day, time, duration);
    return NextResponse.json({ message: 'Time slot template ensured' });
  } catch (error:any) {
    return NextResponse.json({ error: error.message || 'Failed to create time slot' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    (timeSlotQueries as any).delete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (error) {
    console.error('Error deleting time slot:', error);
    return NextResponse.json({ error: 'Failed to delete time slot' }, { status: 500 });
  }
}
