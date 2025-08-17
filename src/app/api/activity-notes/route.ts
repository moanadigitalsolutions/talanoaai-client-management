import { NextRequest, NextResponse } from 'next/server';
import { activityNoteQueries } from '@/lib/database';
import { activityNoteCreateSchema, parseOrError } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = parseOrError(activityNoteCreateSchema, body);
    if ('error' in parsed) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error }, { status: 400 });
    }
    const dto = parsed.data;
    
    // Generate note ID
    const noteId = `NOTE${Date.now()}`;
    
    const note = {
      id: noteId,
  customerId: dto.customerId,
  type: dto.type,
  description: dto.description,
  date: (dto as any).date || new Date().toISOString().split('T')[0],
  time: (dto as any).time || (() => {
        const now = new Date();
        const hours = now.getUTCHours().toString().padStart(2, '0');
        const minutes = now.getUTCMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      })()
    };

    activityNoteQueries.create(note);
    
    return NextResponse.json({ message: 'Activity note created successfully', id: noteId }, { status: 201 });
  } catch (error) {
    console.error('Error creating activity note:', error);
    return NextResponse.json({ error: 'Failed to create activity note' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    if (!customerId) return NextResponse.json({ error: 'customerId required' }, { status: 400 });
    const notes = activityNoteQueries.getByCustomer(customerId);
    return NextResponse.json({ notes });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch activity notes' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    activityNoteQueries.delete(id);
    return NextResponse.json({ message: 'Deleted' });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete activity note' }, { status: 500 });
  }
}
