# TalanoaAI Client Management System

A comprehensive customer management system built with Next.js 15, featuring customer profiles, activity tracking, document management, and business analytics.

## 🚀 Live Demo

**GitHub Repository:** [https://github.com/moanadigitalsolutions/talanoaai-client-management](https://github.com/moanadigitalsolutions/talanoaai-client-management)

## ✨ Features

### 🏠 Dashboard
- Real-time business metrics and KPIs
- Customer analytics and statistics
- Recent customers overview
- Activity tracking and insights
- Dynamic statistics with customer engagement rates

### 👥 Customer Management
- Complete CRUD operations for customers
- Detailed customer profiles with edit functionality
- Customer search and filtering with pagination
- Contact information and personal details management
- Activity notes and history tracking
- Document upload and management per customer

### 📄 Document Management
- Secure document storage per customer
- File upload with metadata tracking
- Document organization and retrieval
- File type validation and size limits

### 📝 Activity Notes
- Customer interaction tracking
- Note categorization (meeting, note, etc.)
- Date and time stamped entries
- Activity history timeline

### ⚙️ Settings Management
- Profile management for business information
- Working hours configuration
- Notification preferences
- Security settings and user management
- General application preferences

### 📊 Analytics & Reporting
- Customer statistics and trends
- Activity metrics and engagement tracking
- Business performance insights
- Data visualization with interactive charts

## Technology Stack

- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **PWA**: Service Worker for offline functionality
- **Validation**: Zod schemas

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/moanadigitalsolutions/talanoaai-client-management.git
   cd talanoaai-client-management
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Key Features Implemented

### ✅ Customer Management System
- **Complete CRUD operations** for customer data
- **Advanced search and filtering** with pagination
- **Customer profiles** with comprehensive information
- **Activity notes tracking** with categorization
- **Document management** per customer

### ✅ Dashboard Analytics
- **Real-time customer statistics** and metrics
- **Activity tracking** and engagement insights
- **Recent customers overview** with quick access
- **Business performance indicators**

### ✅ Document Management
- **Secure file uploads** with validation
- **Document organization** by customer
- **File metadata tracking** (name, size, upload date)
- **Document retrieval** and management

### ✅ Settings & Configuration
- **Business profile management**
- **Working hours configuration**
- **Notification preferences**
- **Security settings**

## 🚀 Recent Updates

**Latest Update (August 2025)**: Complete removal of booking system to focus on core customer management functionality. The application now provides a streamlined, customer-centric experience with enhanced document management and activity tracking capabilities.

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For any questions or support, please contact [moanadigitalsolutions](https://github.com/moanadigitalsolutions).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── customers/         # Customer management pages
│   │   ├── page.tsx      # Customer list with search/filter
│   │   ├── [id]/         # Individual customer pages
│   │   │   ├── page.tsx  # Customer detail view
│   │   │   └── edit/     # Customer edit functionality
│   ├── settings/         # Application settings
│   │   └── page.tsx      # Settings management
│   ├── api/              # API routes
│   │   ├── customers/    # Customer CRUD operations
│   │   ├── dashboard/    # Dashboard data and analytics
│   │   ├── documents/    # Document management
│   │   ├── activity-notes/ # Activity tracking
│   │   └── settings/     # Settings management
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout with navigation
│   └── page.tsx          # Dashboard (home page)
├── components/            # Reusable React components
│   ├── common/           # Shared components
│   ├── customers/        # Customer-specific components
│   ├── dashboard/        # Dashboard widgets and charts
│   └── layout/           # Layout components (Sidebar, etc.)
├── lib/                  # Utility libraries
│   ├── database.ts       # SQLite database operations
│   ├── dateUtils.ts      # Date formatting utilities
│   ├── validation.ts     # Zod validation schemas
│   └── seed-database.ts  # Database seeding (removed)
└── public/               # Static assets
    ├── icons/           # PWA icons
    └── manifest.json    # PWA manifest
```

## PWA Features

- **Offline Support**: Service worker caches essential pages
- **App-like Experience**: Installable on mobile and desktop
- **Responsive Design**: Optimized for all screen sizes
- **Fast Loading**: Optimized bundle sizes and code splitting

## Key Components

### Customer Data Table
- Displays customer ID, name, contact info, status, and join date
- Clickable rows for detailed customer view
- Search and filter functionality with pagination
- Actions: View, Edit, Delete

### Customer Detail View
- Comprehensive customer information display
- Activity notes timeline
- Document management interface
- Edit customer information

### Dashboard Overview
- Customer statistics and metrics
- Recent customer activity
- Business performance indicators
- Quick access to key functions

### Document Management
- File upload interface with drag-and-drop
- Document listing with metadata
- File type validation and size limits
- Secure storage and retrieval

## Design System

- **Colors**: Professional blue primary color palette
- **Typography**: Inter font family
- **Cards**: Subtle shadows and rounded corners
- **Tables**: Stripe-style design with hover effects
- **Forms**: Clean input designs with focus states
- **Navigation**: Intuitive sidebar navigation

## Future Enhancements

- Advanced customer segmentation and filtering
- Email/SMS notifications for customer interactions
- Customer communication history and templates
- Advanced reporting and analytics dashboard
- Document versioning and collaboration features
- Customer portal for self-service access
- API integration for external CRM systems
- Mobile app version with offline capabilities
- Bulk customer operations and data import/export
- Customer satisfaction surveys and feedback
- Automated customer follow-up workflows
- Integration with popular business tools (Slack, Zapier, etc.)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For any questions or support, please contact [moanadigitalsolutions](https://github.com/moanadigitalsolutions).

---

Built with ❤️ for efficient customer management
