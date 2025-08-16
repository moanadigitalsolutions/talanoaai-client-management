# TalanoaAI - Client Management PWA

A comprehensive Progressive Web Application (PWA) for managing clients with a professional Stripe-style design built with Next.js, TypeScript, and Tailwind CSS.

## Features

### 🏠 Dashboard
- Overview cards showing key business metrics
- Interactive charts displaying booking trends
- Recent customers list
- Upcoming appointments table

### 👥 Customer Management
- Excel-style data table for customer information
- Detailed customer profiles with personal data
- Document upload and management
- Activity notes and history tracking
- Customer search and filtering

### 📅 Calendar
- Interactive monthly calendar view
- Event management (appointments, meetings, reminders)
- Google Calendar and Outlook Calendar integration support
- Event details sidebar

### 📋 Booking System
- Weekly schedule management (Monday-Friday)
- Time slot availability tracking
- Booking statistics and utilization rates
- Recent bookings management

### ⚙️ Settings
- **Profile Management**: Personal and business information
- **Booking Settings**: Working hours, appointment duration, buffer times
- **Calendar Integration**: Google and Outlook calendar sync
- **Notifications**: Email and push notification preferences
- **Security**: Password changes and 2FA setup
- **General Settings**: Timezone, date/time formats, currency

## Technology Stack

- **Framework**: Next.js 15.4.6 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **PWA**: Service Worker for offline functionality

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd talanoaai
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

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── booking/           # Booking management
│   ├── calendar/          # Calendar and events
│   ├── customers/         # Customer management
│   │   └── [id]/         # Individual customer pages
│   ├── settings/         # Application settings
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Dashboard (home page)
└── components/            # Reusable components
    ├── dashboard/        # Dashboard specific components
    ├── customers/        # Customer management components
    └── layout/           # Layout components (Sidebar, etc.)
```

## PWA Features

- **Offline Support**: Service worker caches essential pages
- **App-like Experience**: Installable on mobile and desktop
- **Responsive Design**: Optimized for all screen sizes
- **Fast Loading**: Optimized bundle sizes and code splitting

## Key Components

### Customer Data Table
- Displays customer ID, name, contact info, join date, bookings, and status
- Clickable rows for detailed customer view
- Search and filter functionality
- Actions: View, Edit, Delete

### Calendar Integration
- Monthly calendar view with event visualization
- Event types: appointments, meetings, reminders
- Integration placeholders for Google Calendar and Outlook
- Event creation and management

### Booking Schedule
- Visual weekly grid (Monday-Friday)
- Color-coded availability (available vs booked)
- Booking statistics and utilization tracking
- Time slot management

## Design System

- **Colors**: Professional blue primary color palette
- **Typography**: Inter font family
- **Cards**: Subtle shadows and rounded corners
- **Tables**: Stripe-style design with hover effects
- **Forms**: Clean input designs with focus states

## Future Enhancements

- Real-time calendar synchronization
- Email/SMS notifications
- Payment processing integration
- Advanced reporting and analytics
- Multi-user support
- API integration for external services
- Mobile app version

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

---

Built with ❤️ for efficient client management
