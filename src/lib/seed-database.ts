import { customerQueries, appointmentQueries } from './database';

export function seedDatabase() {
  try {
    // Add sample customers
    const customers = [
      {
        id: 'CUST001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        mobile: '+1 (555) 123-4567',
        dateOfBirth: '1985-03-15',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        status: 'active' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: 'CUST002',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.j@email.com',
        mobile: '+1 (555) 987-6543',
        dateOfBirth: '1990-07-22',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90210',
        status: 'active' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: 'CUST003',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@email.com',
        mobile: '+1 (555) 456-7890',
        dateOfBirth: '1982-11-08',
        address: '789 Pine St',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        status: 'active' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: 'CUST004',
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@email.com',
        mobile: '+1 (555) 321-0987',
        dateOfBirth: '1995-05-12',
        address: '321 Elm St',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        status: 'inactive' as const,
        createdAt: new Date().toISOString()
      },
      {
        id: 'CUST005',
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@email.com',
        mobile: '+1 (555) 555-0123',
        dateOfBirth: '1988-09-30',
        address: '654 Maple Dr',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        status: 'active' as const,
        createdAt: new Date().toISOString()
      }
    ];

    customers.forEach(customer => {
      try {
        customerQueries.create(customer);
      } catch (error) {
        console.log(`Customer ${customer.id} might already exist, skipping...`);
      }
    });

    // Add sample appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);

    const appointments = [
      {
        id: 'APPT001',
        customerId: 'CUST001',
        title: 'Consultation',
        description: 'Initial consultation meeting',
        date: tomorrow.toISOString().split('T')[0],
        time: '10:00',
        dateTime: `${tomorrow.toISOString().split('T')[0]} 10:00:00`,
        duration: 60,
        status: 'confirmed',
        service: 'Consultation',
        createdAt: new Date().toISOString()
      },
      {
        id: 'APPT002',
        customerId: 'CUST002',
        title: 'Follow-up',
        description: 'Follow-up appointment',
        date: tomorrow.toISOString().split('T')[0],
        time: '14:30',
        dateTime: `${tomorrow.toISOString().split('T')[0]} 14:30:00`,
        duration: 45,
        status: 'pending',
        service: 'Follow-up',
        createdAt: new Date().toISOString()
      },
      {
        id: 'APPT003',
        customerId: 'CUST003',
        title: 'Initial Meeting',
        description: 'First time meeting',
        date: dayAfter.toISOString().split('T')[0],
        time: '09:00',
        dateTime: `${dayAfter.toISOString().split('T')[0]} 09:00:00`,
        duration: 90,
        status: 'confirmed',
        service: 'Initial Meeting',
        createdAt: new Date().toISOString()
      },
      {
        id: 'APPT004',
        customerId: 'CUST004',
        title: 'Review',
        description: 'Review session',
        date: dayAfter.toISOString().split('T')[0],
        time: '15:00',
        dateTime: `${dayAfter.toISOString().split('T')[0]} 15:00:00`,
        duration: 60,
        status: 'pending',
        service: 'Review',
        createdAt: new Date().toISOString()
      }
    ];

    appointments.forEach(appointment => {
      try {
        appointmentQueries.create(appointment);
      } catch (error) {
        console.log(`Appointment ${appointment.id} might already exist, skipping...`);
      }
    });

    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}
