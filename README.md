# Barber Shop Management System

## Overview
A comprehensive web application for managing a modern Barber Shop. Built with React, Vite, Tailwind CSS, and Firebase, this system provides three distinct portals tailored for different users: Customers, Barbers, and Administrators.

## Features

### 👤 Public Portal (Customers)
* **Explore Services:** View a catalog of services, barbers, gallery, and reviews.
* **Online Booking:** Intuitive booking flow to schedule appointments with specific barbers.
* **Track Bookings:** Easily track the status of appointments.
* **Leave Reviews:** Share feedback on the services received.

### ✂️ Barber Portal
* **Dashboard:** Overview of daily tasks and upcoming appointments.
* **Manage Appointments:** View and update the status of assigned appointments.
* **Schedule & Availability:** Manage working hours and set availability.

### 👑 Admin Portal
* **Comprehensive Dashboard:** High-level metrics and system overview.
* **Appointment Management:** Oversee all bookings, including walk-in appointments.
* **Staff & Service Management:** Add/edit services and barber profiles.
* **Gallery & Reviews:** Curate the public gallery and moderate customer reviews.
* **Reports & Settings:** Generate business reports and configure shop settings.

## Tech Stack
* **Frontend:** React 19, React Router v7, Vite
* **Styling:** Tailwind CSS, PostCSS, clsx, tailwind-merge
* **Icons:** Lucide React
* **Backend & Database:** Firebase (Authentication, Firestore, etc.) & Firebase Admin
* **Notifications:** EmailJS

## Prerequisites
* Node.js (v18 or higher recommended)
* NPM or Yarn

## Installation & Setup

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd Barber_Shop
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Ensure you have a `.env` file in the root directory with your Firebase and EmailJS configuration.

4. **Firebase Setup:**
   Make sure you have your `serviceAccountKey.json` setup if you are running backend admin scripts (like `setRoles.cjs`).

5. **Start the development server:**
   ```bash
   npm run dev
   ```

6. **Build for production:**
   ```bash
   npm run build
   ```

## Folder Structure
* `src/app`: Contains the page components separated by portals (`public`, `admin`, `barber`).
* `src/components`: Reusable UI components (`layout`, `ui`, `booking`).
* `src/context`: React context providers (e.g., AuthContext).
* `src/firebase`: Firebase configuration and utilities.
* `src/guards`: Route protection components (`RequireAuth`, `RequireAdmin`, `RequireBarber`).
* `src/services`: External service integrations (e.g., EmailService).
* `src/hooks` & `src/utils`: Custom hooks and utility functions.
