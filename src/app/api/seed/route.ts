import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed-database';

export async function POST() {
  try {
    const success = seedDatabase();
    
    if (success) {
      return NextResponse.json({ message: 'Database seeded successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const success = seedDatabase();
    
    if (success) {
      return NextResponse.json({ message: 'Database seeded successfully' });
    } else {
      return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
