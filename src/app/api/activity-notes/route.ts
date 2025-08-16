import { NextRequest, NextResponse } from 'next/server';
import { activityNoteQueries } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate note ID
    const noteId = `NOTE${Date.now()}`;
    
    const note = {
      id: noteId,
      customerId: body.customerId,
      type: body.type,
      description: body.description,
      date: body.date || new Date().toISOString().split('T')[0],
      time: body.time || (() => {
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
