import { NextRequest, NextResponse } from 'next/server';
import { customerQueries } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const email = searchParams.get('email');
    
    let customers = customerQueries.getAll() as any[];
    
    // Filter by email if provided
    if (email) {
      customers = customers.filter((customer: any) => 
        customer.email && customer.email.toLowerCase() === email.toLowerCase()
      );
    }
    
    if (limit) {
      const limitNum = parseInt(limit, 10);
      customers = customers.slice(0, limitNum);
    }
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Generate customer ID
    const customerId = `CUST${Date.now()}`;
    
    const customer = {
      id: customerId,
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

    customerQueries.create(customer);
    
    return NextResponse.json({ 
      message: 'Customer created successfully', 
      id: customerId,
      customer: customer 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
