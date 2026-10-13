import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';

// Public pages
import { LandingPage } from '../pages/LandingPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DoctorSearchPage } from '../pages/patient/DoctorSearchPage';
import { DoctorDetailPage } from '../pages/patient/DoctorDetailPage';
import { AiRecommendationPage } from '../pages/patient/AiRecommendationPage';

// Patient pages
import { PatientDashboard } from '../pages/patient/PatientDashboard';
import { PatientAppointmentsPage } from '../pages/patient/PatientAppointmentsPage';
import { PatientPrescriptionsPage } from '../pages/patient/PatientPrescriptionsPage';
import { PatientProfilePage } from '../pages/patient/PatientProfilePage';

// Doctor pages
import { DoctorDashboard } from '../pages/doctor/DoctorDashboard';
import { DoctorAppointmentsPage } from '../pages/doctor/DoctorAppointmentsPage';
import { DoctorAvailabilityPage } from '../pages/doctor/DoctorAvailabilityPage';
import { DoctorProfilePage } from '../pages/doctor/DoctorProfilePage';

// Admin pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminDoctorsPage } from '../pages/admin/AdminDoctorsPage';
import { AdminPatientsPage } from '../pages/admin/AdminPatientsPage';
import { AdminDepartmentsPage } from '../pages/admin/AdminDepartmentsPage';
import { AdminAppointmentsPage } from '../pages/admin/AdminAppointmentsPage';
import { AdminAuditLogsPage } from '../pages/admin/AdminAuditLogsPage';

// Error pages
import { NotFoundPage } from '../pages/errors/NotFoundPage';
import { UnauthorizedPage } from '../pages/errors/UnauthorizedPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Standalone Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Public Pages with Main Layout (Navbar + Footer) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/doctors" element={<DoctorSearchPage />} />
        <Route path="/doctors/:id" element={<DoctorDetailPage />} />
        <Route path="/ai-recommendation" element={<AiRecommendationPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />
      </Route>

      {/* Patient Portal (Role Protected, with Dashboard Sidebar) */}
      <Route
        path="/patient"
        element={
          <ProtectedRoute allowedRoles={['ROLE_PATIENT', 'PATIENT']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/patient/dashboard" replace />} />
        <Route path="dashboard" element={<PatientDashboard />} />
        <Route path="appointments" element={<PatientAppointmentsPage />} />
        <Route path="prescriptions" element={<PatientPrescriptionsPage />} />
        <Route path="profile" element={<PatientProfilePage />} />
      </Route>

      {/* Doctor Portal (Role Protected, with Dashboard Sidebar) */}
      <Route
        path="/doctor"
        element={
          <ProtectedRoute allowedRoles={['ROLE_DOCTOR', 'DOCTOR']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/doctor/dashboard" replace />} />
        <Route path="dashboard" element={<DoctorDashboard />} />
        <Route path="appointments" element={<DoctorAppointmentsPage />} />
        <Route path="availability" element={<DoctorAvailabilityPage />} />
        <Route path="profile" element={<DoctorProfilePage />} />
      </Route>

      {/* Admin Portal (Role Protected, with Dashboard Sidebar) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ADMIN']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="doctors" element={<AdminDoctorsPage />} />
        <Route path="patients" element={<AdminPatientsPage />} />
        <Route path="users" element={<Navigate to="/admin/patients" replace />} />
        <Route path="departments" element={<AdminDepartmentsPage />} />
        <Route path="appointments" element={<AdminAppointmentsPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
      </Route>

      {/* Catch-all 404 Route */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
