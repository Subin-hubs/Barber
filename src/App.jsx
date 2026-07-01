import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AdminLayout } from './components/layout/AdminLayout';
import { BarberLayout } from './components/layout/BarberLayout';
import { OfflineBanner } from './components/ui/OfflineBanner';

// Public Pages
import { HomePage } from './app/public/HomePage';
import { ServicesPage } from './app/public/ServicesPage';
import { BarbersPage } from './app/public/BarbersPage';
import { GalleryPage } from './app/public/GalleryPage';
import { ReviewsPage } from './app/public/ReviewsPage';
import { BookingPage } from './app/public/BookingPage';
import { BookingConfirmPage } from './app/public/BookingConfirmPage';
import { TrackBookingPage } from './app/public/TrackBookingPage';
import { LeaveReviewPage } from './app/public/LeaveReviewPage';
import { LoginPage } from './app/public/LoginPage';
import { NotFoundPage } from './app/public/NotFoundPage';

// Admin Pages
import { AdminDashboard } from './app/admin/AdminDashboard';
import { AdminAppointmentsPage } from './app/admin/AdminAppointmentsPage';
import { AdminServicesPage } from './app/admin/AdminServicesPage';
import { AdminBarbersPage } from './app/admin/AdminBarbersPage';
import { AdminGalleryPage } from './app/admin/AdminGalleryPage';
import { AdminReviewsPage } from './app/admin/AdminReviewsPage';
import { AdminReportsPage } from './app/admin/AdminReportsPage';
import { AdminSettingsPage } from './app/admin/AdminSettingsPage';
import { AdminWalkInPage } from './app/admin/AdminWalkInPage';

// Barber Pages
import { BarberDashboard } from './app/barber/BarberDashboard';
import { BarberAppointmentsPage } from './app/barber/BarberAppointmentsPage';
import { BarberSchedulePage } from './app/barber/BarberSchedulePage';
import { BarberAvailabilityPage } from './app/barber/BarberAvailabilityPage';
import { BarberProfilePage } from './app/barber/BarberProfilePage';

// Guards
import { RequireAuth } from './guards/RequireAuth';
import { RequireAdmin } from './guards/RequireAdmin';
import { RequireBarber } from './guards/RequireBarber';

const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Footer />
  </>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <OfflineBanner />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
          <Route path="/barbers" element={<PublicLayout><BarbersPage /></PublicLayout>} />
          <Route path="/gallery" element={<PublicLayout><GalleryPage /></PublicLayout>} />
          <Route path="/reviews" element={<PublicLayout><ReviewsPage /></PublicLayout>} />
          
          <Route path="/book" element={<PublicLayout><BookingPage /></PublicLayout>} />
          <Route path="/book/confirm" element={<PublicLayout><BookingConfirmPage /></PublicLayout>} />
          <Route path="/track" element={<PublicLayout><TrackBookingPage /></PublicLayout>} />
          <Route path="/review" element={<PublicLayout><LeaveReviewPage /></PublicLayout>} />
          <Route path="/staff/login" element={<LoginPage />} />

          {/* Barber Portal Routes */}
          <Route path="/barber" element={
            <RequireAuth><RequireBarber>
              <BarberLayout />
            </RequireBarber></RequireAuth>
          }>
            <Route index element={<Navigate to="/barber/dashboard" replace />} />
            <Route path="dashboard" element={<BarberDashboard />} />
            <Route path="appointments" element={<BarberAppointmentsPage />} />
            <Route path="schedule" element={<BarberSchedulePage />} />
            <Route path="availability" element={<BarberAvailabilityPage />} />
            <Route path="profile" element={<BarberProfilePage />} />
          </Route>

          {/* Admin Portal Routes */}
          <Route path="/admin" element={
            <RequireAuth><RequireAdmin>
              <AdminLayout />
            </RequireAdmin></RequireAuth>
          }>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="appointments" element={<AdminAppointmentsPage />} />
            <Route path="walk-in" element={<AdminWalkInPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="barbers" element={<AdminBarbersPage />} />
            <Route path="gallery" element={<AdminGalleryPage />} />
            <Route path="reviews" element={<AdminReviewsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
