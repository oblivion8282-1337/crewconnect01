# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CrewConnect is a booking management platform for freelancers and film/media production agencies. It features a dual-role system where users can switch between freelancer and agency views to manage booking requests, options, fixed bookings, and rescheduling.

## Commands

```bash
npm run dev      # Start development server (Vite with HMR)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

## Tech Stack

- React 19 + Vite 7
- Tailwind CSS for styling
- Lucide React for icons
- No state management library (custom hooks pattern)

## Architecture

### State Management

All state is managed through custom hooks in `src/hooks/`:

- **useBookings.js** - Core booking logic, notifications, blocked days, day status calculation
- **useProjects.js** - Agency projects with phases
- **useProfile.js** - Freelancer and agency profile management

App.jsx integrates all hooks and passes state/handlers down as props.

### Component Organization

```
src/components/
├── freelancer/    # FreelancerDashboard, FreelancerCalendar, FreelancerProfile
├── agency/        # AgencyProjects, AgencyBookings, AgencySearch, AgencyProfile
├── modals/        # CancelBookingModal, RescheduleBookingModal, FreelancerSearchModal
└── shared/        # StatusBadge, BookingHistory, DateRangePicker, etc.
```

### Booking Logic (Critical)

The booking system has complex visibility rules documented in `logik.md`. Key points:

**Booking Types:**
- **Option** - Unverbindliche Reservierung, andere Agenturen sehen Tag als GRÜN
- **Fix** - Verbindliche Buchung, Tag wird ROT für alle

**Day Status Visibility Matrix:**

| Status | Freelancer | Own Agency | OTHER Agencies |
|--------|------------|------------|----------------|
| Pending/Option | Yellow | Yellow | **Green** (private!) |
| Fix confirmed | Red | Red | Red |
| Fix + open for more | Striped | Red | Green |

The `getDayStatus` function in `useBookings.js` implements this matrix with parameters:
```javascript
getDayStatus(forFreelancerId, date, forAgencyId, excludeBookingId)
```

### Data Models

**Booking statuses:** `pending`, `confirmed`, `declined`, `withdrawn`, `cancelled`

**Booking types:** `option`, `fix`

### Constants

- `src/constants/calendar.js` - BOOKING_STATUS, BOOKING_TYPES, DAY_STATUS_COLORS
- `src/constants/profileOptions.js` - Dropdown options for profiles

### Utilities

- `src/utils/dateUtils.js` - Date formatting, createDateKey (YYYY-MM-DD format)

## Key Patterns

1. Role-based rendering: Components check `userRole` to show freelancer or agency UI
2. Props-down, callbacks-up: No context providers, direct prop passing
3. Modal state in App.jsx: `cancelModalBooking`, `rescheduleModalBooking`
4. Notifications: Separate by role with `forRole` property

## App-Struktur-Regeln (WICHTIG!)

Diese Regeln definieren, wie Features in der App strukturiert sind. Bitte strikt einhalten!

### Freelancer-Suche
- Die Freelancer-Suche existiert **NUR innerhalb von Phasen** ("+Freelancer" Button)
- **KEIN** standalone Such-Button in der Agentur-Navigation
- Die Suche öffnet das `FreelancerSearchModal` mit Kontext der Phase (Projekt, Datum, Berufsgruppe)

### Projekt-Management (Agentur)
- **Projektliste**: Kompakte Karten mit Klick → Detailansicht
- **Projektdetail**: Eigene "Seite" (via `selectedProjectId` State in App.jsx)
- Phasen-Verwaltung findet **NUR in der Projektdetail-Ansicht** statt
- Freelancer werden **pro Phase** gebucht (nicht pro Projekt)
- Navigation: Projekte → Klick auf Projekt → ProjectDetail → "Zurück" Button
