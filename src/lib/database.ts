import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'client_management.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Initialize database tables
export function initializeDatabase() {
  // Customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      mobile TEXT,
      dateOfBirth TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      zipCode TEXT,
      status TEXT DEFAULT 'active',
      totalBookings INTEGER DEFAULT 0,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Appointments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      duration INTEGER DEFAULT 60,
      status TEXT DEFAULT 'scheduled',
      service TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customerId) REFERENCES customers (id) ON DELETE CASCADE
    )
  `);

  // Time slots table
  db.exec(`
    CREATE TABLE IF NOT EXISTS time_slots (
      id TEXT PRIMARY KEY,
      day TEXT NOT NULL,
      time TEXT NOT NULL,
      duration INTEGER DEFAULT 60,
      isAvailable BOOLEAN DEFAULT true,
      appointmentId TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appointmentId) REFERENCES appointments (id) ON DELETE SET NULL
    )
  `);

  // Activity notes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_notes (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customerId) REFERENCES customers (id) ON DELETE CASCADE
    )
  `);

  // Documents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      customerId TEXT NOT NULL,
      name TEXT NOT NULL,
      size TEXT NOT NULL,
      uploadDate TEXT NOT NULL,
      filePath TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customerId) REFERENCES customers (id) ON DELETE CASCADE
    )
  `);

  // Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      category TEXT NOT NULL,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default time slots for the week
  insertDefaultTimeSlots();
  
  // Insert default settings
  insertDefaultSettings();
  
  // Insert sample data if database is empty
  insertSampleData();
}

function insertDefaultTimeSlots() {
  const checkSlots = db.prepare('SELECT COUNT(*) as count FROM time_slots').get() as { count: number };
  
  if (checkSlots.count === 0) {
    const insertSlot = db.prepare(`
      INSERT INTO time_slots (id, day, time, duration, isAvailable)
      VALUES (?, ?, ?, ?, ?)
    `);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
    
    let id = 1;
    days.forEach(day => {
      times.forEach(time => {
        insertSlot.run(`slot_${id}`, day, time, 60, 1); // 1 for true (available)
        id++;
      });
    });
  }
}

function insertDefaultSettings() {
  const checkSettings = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  
  if (checkSettings.count === 0) {
    const insertSetting = db.prepare(`
      INSERT INTO settings (id, key, value, category, updatedAt)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const defaultSettings = [
      ['SETTING_DEFAULT_DURATION', 'defaultDuration', '60', 'booking'],
      ['SETTING_BUFFER_TIME', 'bufferTime', '15', 'booking'],
      ['SETTING_MAX_ADVANCE_BOOKING', 'maxAdvanceBooking', '30', 'booking'],
      ['SETTING_CANCELLATION_POLICY', 'cancellationPolicy', '24', 'booking'],
      ['SETTING_MONDAY_START', 'mondayStart', '09:00', 'workingHours'],
      ['SETTING_MONDAY_END', 'mondayEnd', '17:00', 'workingHours'],
      ['SETTING_TUESDAY_START', 'tuesdayStart', '09:00', 'workingHours'],
      ['SETTING_TUESDAY_END', 'tuesdayEnd', '17:00', 'workingHours'],
      ['SETTING_WEDNESDAY_START', 'wednesdayStart', '09:00', 'workingHours'],
      ['SETTING_WEDNESDAY_END', 'wednesdayEnd', '17:00', 'workingHours'],
      ['SETTING_THURSDAY_START', 'thursdayStart', '09:00', 'workingHours'],
      ['SETTING_THURSDAY_END', 'thursdayEnd', '17:00', 'workingHours'],
      ['SETTING_FRIDAY_START', 'fridayStart', '09:00', 'workingHours'],
      ['SETTING_FRIDAY_END', 'fridayEnd', '17:00', 'workingHours'],
    ];

    defaultSettings.forEach(setting => {
      insertSetting.run(...setting);
    });
  }
}

function insertSampleData() {
  const checkCustomers = db.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number };
  
  if (checkCustomers.count === 0) {
    // Insert sample customers
    const insertCustomer = db.prepare(`
      INSERT INTO customers (id, firstName, lastName, email, mobile, dateOfBirth, address, city, state, zipCode, status, totalBookings, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const customers = [
      ['CUST001', 'John', 'Smith', 'john.smith@email.com', '(555) 123-4567', '1985-03-15', '123 Main St', 'Anytown', 'CA', '12345', 'active', 5, 'Regular customer, prefers morning appointments'],
      ['CUST002', 'Sarah', 'Johnson', 'sarah.johnson@email.com', '(555) 234-5678', '1990-07-22', '456 Oak Ave', 'Somewhere', 'NY', '67890', 'active', 3, 'New customer, very punctual'],
      ['CUST003', 'Michael', 'Brown', 'michael.brown@email.com', '(555) 345-6789', '1982-11-08', '789 Pine Rd', 'Elsewhere', 'TX', '54321', 'active', 8, 'Long-term client, flexible schedule'],
      ['CUST004', 'Emily', 'Davis', 'emily.davis@email.com', '(555) 456-7890', '1988-09-14', '321 Elm St', 'Nowhere', 'FL', '98765', 'active', 2, 'Busy professional, prefers evening slots'],
      ['CUST005', 'David', 'Wilson', 'david.wilson@email.com', '(555) 567-8901', '1992-12-03', '654 Maple Dr', 'Anywhere', 'WA', '13579', 'active', 6, 'Regular monthly appointments']
    ];

    customers.forEach(customer => {
      insertCustomer.run(...customer);
    });

    // Insert sample appointments
    const insertAppointment = db.prepare(`
      INSERT INTO appointments (id, customerId, title, description, date, time, duration, status, service)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const appointments = [
      ['APPT001', 'CUST001', 'Consultation with John Smith', 'Initial consultation meeting', '2024-08-16', '10:00', 60, 'scheduled', 'Consultation'],
      ['APPT002', 'CUST002', 'Follow-up with Sarah Johnson', 'Follow-up appointment', '2024-08-16', '15:00', 60, 'scheduled', 'Follow-up'],
      ['APPT003', 'CUST003', 'Initial Meeting with Michael Brown', 'First meeting with new requirements', '2024-08-17', '09:00', 60, 'scheduled', 'Initial Meeting'],
      ['APPT004', 'CUST004', 'Review with Emily Davis', 'Monthly progress review', '2024-08-18', '15:00', 60, 'scheduled', 'Review']
    ];

    appointments.forEach(appointment => {
      insertAppointment.run(...appointment);
    });

    // Update time slots with appointments
    const updateSlot = db.prepare(`
      UPDATE time_slots SET isAvailable = false, appointmentId = ?
      WHERE day = ? AND time = ?
    `);

    updateSlot.run('APPT001', 'Monday', '10:00');
    updateSlot.run('APPT002', 'Monday', '15:00');
    updateSlot.run('APPT003', 'Tuesday', '09:00');
    updateSlot.run('APPT004', 'Wednesday', '15:00');

    // Insert sample activity notes
    const insertNote = db.prepare(`
      INSERT INTO activity_notes (id, customerId, type, description, date, time)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const notes = [
      ['NOTE001', 'CUST001', 'meeting', 'Initial consultation completed successfully', '2024-08-01', '10:30'],
      ['NOTE002', 'CUST001', 'note', 'Customer expressed interest in premium services', '2024-08-01', '11:00'],
      ['NOTE003', 'CUST002', 'appointment', 'Scheduled follow-up appointment for next week', '2024-08-05', '14:20'],
      ['NOTE004', 'CUST003', 'meeting', 'Discussed project requirements and timeline', '2024-08-10', '09:15']
    ];

    notes.forEach(note => {
      insertNote.run(...note);
    });

    // Insert sample documents
    const insertDocument = db.prepare(`
      INSERT INTO documents (id, customerId, name, size, uploadDate)
      VALUES (?, ?, ?, ?, ?)
    `);

    const documents = [
      ['DOC001', 'CUST001', 'contract_john_smith.pdf', '245 KB', '2024-08-01'],
      ['DOC002', 'CUST001', 'identification.jpg', '1.2 MB', '2024-08-01'],
      ['DOC003', 'CUST002', 'requirements_sarah.docx', '89 KB', '2024-08-05'],
      ['DOC004', 'CUST003', 'project_brief.pdf', '156 KB', '2024-08-10']
    ];

    documents.forEach(document => {
      insertDocument.run(...document);
    });
  }
}

// Database query functions
export const customerQueries = {
  getAll: () => db.prepare('SELECT * FROM customers ORDER BY createdAt DESC').all(),
  getById: (id: string) => db.prepare('SELECT * FROM customers WHERE id = ?').get(id),
  create: (customer: any) => db.prepare(`
    INSERT INTO customers (id, firstName, lastName, email, mobile, dateOfBirth, address, city, state, zipCode, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(customer.id, customer.firstName, customer.lastName, customer.email, customer.mobile, customer.dateOfBirth, customer.address, customer.city, customer.state, customer.zipCode, customer.status, customer.notes),
  update: (id: string, customer: any) => db.prepare(`
    UPDATE customers SET firstName = ?, lastName = ?, email = ?, mobile = ?, dateOfBirth = ?, address = ?, city = ?, state = ?, zipCode = ?, status = ?, notes = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(customer.firstName, customer.lastName, customer.email, customer.mobile, customer.dateOfBirth, customer.address, customer.city, customer.state, customer.zipCode, customer.status, customer.notes, id),
  delete: (id: string) => db.prepare('DELETE FROM customers WHERE id = ?').run(id)
};

export const appointmentQueries = {
  getAll: () => db.prepare(`
    SELECT a.*, c.firstName, c.lastName, c.email
    FROM appointments a
    LEFT JOIN customers c ON a.customerId = c.id
    ORDER BY a.date DESC, a.time DESC
  `).all(),
  getById: (id: string) => db.prepare('SELECT * FROM appointments WHERE id = ?').get(id),
  getByCustomer: (customerId: string) => db.prepare('SELECT * FROM appointments WHERE customerId = ? ORDER BY date DESC, time DESC').all(customerId),
  create: (appointment: any) => db.prepare(`
    INSERT INTO appointments (id, customerId, title, description, date, time, duration, status, service)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(appointment.id, appointment.customerId, appointment.title, appointment.description, appointment.date, appointment.time, appointment.duration, appointment.status, appointment.service),
  update: (id: string, appointment: any) => db.prepare(`
    UPDATE appointments SET customerId = ?, title = ?, description = ?, date = ?, time = ?, duration = ?, status = ?, service = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(appointment.customerId, appointment.title, appointment.description, appointment.date, appointment.time, appointment.duration, appointment.status, appointment.service, id),
  delete: (id: string) => db.prepare('DELETE FROM appointments WHERE id = ?').run(id)
};

export const timeSlotQueries = {
  getAll: () => db.prepare('SELECT * FROM time_slots ORDER BY day, time').all(),
  getByDay: (day: string) => db.prepare('SELECT * FROM time_slots WHERE day = ? ORDER BY time').all(day),
  update: (id: string, isAvailable: boolean, appointmentId?: string) => db.prepare(`
    UPDATE time_slots SET isAvailable = ?, appointmentId = ?
    WHERE id = ?
  `).run(isAvailable ? 1 : 0, appointmentId || null, id),
  updateDuration: (id: string, duration: number) => db.prepare(`
    UPDATE time_slots SET duration = ?
    WHERE id = ?
  `).run(duration, id),
  updateAllAvailableDurations: (duration: number) => db.prepare(`
    UPDATE time_slots SET duration = ?
    WHERE isAvailable = true
  `).run(duration)
};

export const activityNoteQueries = {
  getByCustomer: (customerId: string) => db.prepare('SELECT * FROM activity_notes WHERE customerId = ? ORDER BY date DESC, time DESC').all(customerId),
  create: (note: any) => db.prepare(`
    INSERT INTO activity_notes (id, customerId, type, description, date, time)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(note.id, note.customerId, note.type, note.description, note.date, note.time),
  delete: (id: string) => db.prepare('DELETE FROM activity_notes WHERE id = ?').run(id)
};

export const documentQueries = {
  getByCustomer: (customerId: string) => db.prepare('SELECT * FROM documents WHERE customerId = ? ORDER BY uploadDate DESC').all(customerId),
  create: (document: any) => db.prepare(`
    INSERT INTO documents (id, customerId, name, size, uploadDate, filePath)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(document.id, document.customerId, document.name, document.size, document.uploadDate, document.filePath),
  delete: (id: string) => db.prepare('DELETE FROM documents WHERE id = ?').run(id)
};

export const settingsQueries = {
  getAll: () => db.prepare('SELECT * FROM settings ORDER BY category, key').all(),
  getByCategory: (category: string) => db.prepare('SELECT * FROM settings WHERE category = ? ORDER BY key').all(category),
  get: (key: string) => db.prepare('SELECT * FROM settings WHERE key = ?').get(key),
  set: (key: string, value: string, category: string) => db.prepare(`
    INSERT OR REPLACE INTO settings (id, key, value, category, updatedAt)
    VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
  `).run(`SETTING_${key.toUpperCase()}`, key, value, category),
  delete: (key: string) => db.prepare('DELETE FROM settings WHERE key = ?').run(key)
};

// Initialize database on import
initializeDatabase();

export default db;
