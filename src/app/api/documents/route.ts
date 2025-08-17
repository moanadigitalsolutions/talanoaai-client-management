import { NextRequest, NextResponse } from 'next/server';
import { documentQueries } from '@/lib/database';
import { z } from 'zod';

const docSchema = z.object({
  customerId: z.string().min(1),
  name: z.string().min(1),
  size: z.string().min(1),
  filePath: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    if (!customerId) return NextResponse.json({ error: 'customerId required' }, { status: 400 });
    const docs = documentQueries.getByCustomer(customerId);
    return NextResponse.json({ documents: docs });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const data = docSchema.parse(json);
    const id = 'DOC' + Date.now();
    documentQueries.create({ id, customerId: data.customerId, name: data.name, size: data.size, uploadDate: new Date().toISOString().split('T')[0], filePath: data.filePath });
    return NextResponse.json({ id });
  } catch (e:any) {
    return NextResponse.json({ error: e.message || 'Failed to create document' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    documentQueries.delete(id);
    return NextResponse.json({ message: 'Deleted'});
  } catch (e) {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
