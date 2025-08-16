import { NextRequest, NextResponse } from 'next/server';
import { customerQueries } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
    const email = searchParams.get('email');
  const pageParam = searchParams.get('page');
  const search = searchParams.get('search');
  const pageSizeParam = searchParams.get('pageSize');

    if (email) {
      const customer = customerQueries.getByEmail(email);
      return NextResponse.json(customer ? [customer] : []);
    }

    // Pagination defaults
    const page = pageParam ? Math.max(parseInt(pageParam, 10), 1) : 1;
    const pageSize = pageSizeParam ? Math.min(Math.max(parseInt(pageSizeParam, 10), 1), 100) : (limitParam ? parseInt(limitParam, 10) : 25);
    const offset = (page - 1) * pageSize;

    let customers: any[] = [];
    let total = 0;

    if (search) {
      customers = customerQueries.searchPaginated(search, pageSize, offset) as any[];
      total = customerQueries.countSearch(search);
    } else if (limitParam && !pageParam && !pageSizeParam) {
      // Simple limit use-case (existing behavior compatibility)
      customers = customerQueries.getAll(parseInt(limitParam, 10)) as any[];
      total = customers.length;
    } else {
      customers = customerQueries.getPaginated(pageSize, offset) as any[];
      total = customerQueries.countAll();
    }

    return NextResponse.json({ data: customers, page, pageSize, total, totalPages: Math.ceil(total / pageSize) });
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
