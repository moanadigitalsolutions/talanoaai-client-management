import { NextRequest, NextResponse } from 'next/server';
import { customerQueries, activityNoteQueries, documentQueries } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = customerQueries.getById(id);
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get related data
    const activityNotes = activityNoteQueries.getByCustomer(id);
    const documents = documentQueries.getByCustomer(id);

    return NextResponse.json({
      customer,
      activityNotes,
      documents
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ error: 'Failed to fetch customer' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const customer = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      mobile: body.mobile || '',
      dateOfBirth: body.dateOfBirth || '',
      address: body.address || '',
      city: body.city || '',
      state: body.state || '',
      zipCode: body.zipCode || '',
      status: body.status || 'active',
      notes: body.notes || ''
    };

    customerQueries.update(id, customer);
    
    return NextResponse.json({ message: 'Customer updated successfully' });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    customerQueries.delete(id);
    
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
  }
}
