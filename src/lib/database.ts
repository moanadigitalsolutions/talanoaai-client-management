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
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
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

  // Create indexes after tables & seed
  createIndexes();
}

function insertDefaultSettings() {
  const checkSettings = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };

  if (checkSettings.count === 0) {
    const insertSetting = db.prepare(`
      INSERT INTO settings (id, key, value, category, updatedAt)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const defaultSettings = [
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
      INSERT INTO customers (id, firstName, lastName, email, mobile, dateOfBirth, address, city, state, zipCode, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const customers = [
      ['CUST001', 'John', 'Smith', 'john.smith@email.com', '(555) 123-4567', '1985-03-15', '123 Main St', 'Anytown', 'CA', '12345', 'active', 'Regular customer'],
      ['CUST002', 'Sarah', 'Johnson', 'sarah.johnson@email.com', '(555) 234-5678', '1990-07-22', '456 Oak Ave', 'Somewhere', 'NY', '67890', 'active', 'New customer, very punctual'],
      ['CUST003', 'Michael', 'Brown', 'michael.brown@email.com', '(555) 345-6789', '1982-11-08', '789 Pine Rd', 'Elsewhere', 'TX', '54321', 'active', 'Long-term client'],
      ['CUST004', 'Emily', 'Davis', 'emily.davis@email.com', '(555) 456-7890', '1988-09-14', '321 Elm St', 'Nowhere', 'FL', '98765', 'active', 'Busy professional'],
      ['CUST005', 'David', 'Wilson', 'david.wilson@email.com', '(555) 567-8901', '1992-12-03', '654 Maple Dr', 'Anywhere', 'WA', '13579', 'active', 'Regular customer']
    ];

    customers.forEach(customer => {
      insertCustomer.run(...customer);
    });

    // Insert sample activity notes
    const insertNote = db.prepare(`
      INSERT INTO activity_notes (id, customerId, type, description, date, time)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const notes = [
      ['NOTE001', 'CUST001', 'meeting', 'Initial consultation completed successfully', '2024-08-01', '10:30'],
      ['NOTE002', 'CUST001', 'note', 'Customer expressed interest in premium services', '2024-08-01', '11:00'],
      ['NOTE003', 'CUST002', 'meeting', 'Discussed project requirements and timeline', '2024-08-10', '09:15'],
      ['NOTE004', 'CUST003', 'note', 'Follow-up scheduled for next week', '2024-08-05', '14:20']
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

// Performance: add indexes for frequent lookups & ordering
function createIndexes() {
  try {
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
      CREATE INDEX IF NOT EXISTS idx_customers_createdAt ON customers(createdAt DESC);
      CREATE INDEX IF NOT EXISTS idx_activity_notes_customer_date ON activity_notes(customerId, date DESC, time DESC);
      CREATE INDEX IF NOT EXISTS idx_documents_customer_date ON documents(customerId, uploadDate DESC);
    `);
  } catch (e) {
    console.error('Failed creating indexes', e);
  }
}

// Database query functions
export const customerQueries = {
  getAll: (limit?: number) => {
    if (limit) {
      return db.prepare('SELECT * FROM customers ORDER BY createdAt DESC LIMIT ?').all(limit);
    }
    return db.prepare('SELECT * FROM customers ORDER BY createdAt DESC').all();
  },
  getByEmail: (email: string) => db.prepare('SELECT * FROM customers WHERE email = ?').get(email),
  getById: (id: string) => db.prepare('SELECT * FROM customers WHERE id = ?').get(id),
  getPaginated: (limit: number, offset: number) => db.prepare('SELECT * FROM customers ORDER BY createdAt DESC LIMIT ? OFFSET ?').all(limit, offset),
  countAll: () => (db.prepare('SELECT COUNT(*) as count FROM customers').get() as any).count as number,
  searchPaginated: (term: string, limit: number, offset: number) => {
    const like = `%${term.toLowerCase()}%`;
    return db.prepare(`
      SELECT * FROM customers
      WHERE lower(firstName) LIKE ? OR lower(lastName) LIKE ? OR lower(email) LIKE ?
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `).all(like, like, like, limit, offset);
  },
  countSearch: (term: string) => {
    const like = `%${term.toLowerCase()}%`;
    return (db.prepare(`
      SELECT COUNT(*) as count FROM customers
      WHERE lower(firstName) LIKE ? OR lower(lastName) LIKE ? OR lower(email) LIKE ?
    `).get(like, like, like) as any).count as number;
  },
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
