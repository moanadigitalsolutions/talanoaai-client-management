import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed-database';

function allowed(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') return false;
  const token = request.headers.get('x-seed-token');
  return !process.env.SEED_TOKEN || token === process.env.SEED_TOKEN;
}

export async function POST(request: NextRequest) {
  if (!allowed(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const success = seedDatabase();
    return success ? NextResponse.json({ message: 'Database seeded successfully' }) : NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Provide idempotent seed only in non-production
  if (!allowed(request)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  try {
    const success = seedDatabase();
    return success ? NextResponse.json({ message: 'Database seeded successfully' }) : NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
