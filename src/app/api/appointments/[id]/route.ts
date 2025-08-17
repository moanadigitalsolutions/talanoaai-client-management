import { NextRequest, NextResponse } from 'next/server';
import { appointmentQueries, customerQueries, timeSlotQueries } from '@/lib/database';
import { appointmentUpdateSchema, parseOrError } from '@/lib/validation';

// Simple validation regex (YYYY-MM-DD and HH:MM)
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const appt = appointmentQueries.getById(id) as any;
		if (!appt) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
		return NextResponse.json(appt);
	} catch (e) {
		console.error('Error fetching appointment', e);
		return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
	}
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const existing = appointmentQueries.getById(id) as any;
		if (!existing) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });

		const body = await request.json();
		const parsed = parseOrError(appointmentUpdateSchema, body);
		if ('error' in parsed) {
			return NextResponse.json({ error: 'Validation failed', details: parsed.error }, { status: 400 });
		}
		const dto = parsed.data as any; // partial

		const updated = {
			customerId: dto.customerId ?? existing.customerId,
			title: dto.title ?? existing.title,
			description: dto.description ?? existing.description,
			date: dto.date ?? existing.date,
			time: dto.time ?? existing.time,
			duration: dto.duration ?? existing.duration,
			status: dto.status ?? existing.status,
			service: dto.service ?? existing.service
		};

		appointmentQueries.update(id, updated);
		return NextResponse.json({ message: 'Appointment updated successfully' });
	} catch (e) {
		console.error('Error updating appointment', e);
		return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
	}
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await params;
		const existing = appointmentQueries.getById(id) as any;
		if (!existing) return NextResponse.json({ message: 'Already removed' });
		appointmentQueries.delete(id);
		timeSlotQueries.releaseByAppointment(id);
		try { customerQueries.decrementTotalBookings(existing.customerId); } catch { /* ignore */ }
		return NextResponse.json({ message: 'Appointment deleted successfully' });
	} catch (e) {
		console.error('Error deleting appointment', e);
		return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
	}
}
