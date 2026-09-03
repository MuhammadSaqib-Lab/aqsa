import { Outlet, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { ScrollProgressBar } from "./components/layout/ScrollProgressBar";
import { BackToTopButton } from "./components/layout/BackToTopButton";
import { WhatsAppButton } from "./components/layout/WhatsAppButton";
import { MobileAppointmentBar } from "./components/layout/MobileAppointmentBar";
import { ToastProvider } from "./context/ToastContext";
import { AppointmentProvider } from "./context/AppointmentContext";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import { AdminAuthProvider } from "./admin/context/AdminAuthContext";
import { ProtectedAdminRoute } from "./admin/components/ProtectedAdminRoute";
import { AdminLayout } from "./admin/components/AdminLayout";
import { AdminLoginPage } from "./admin/pages/AdminLoginPage";
import { DashboardHomePage } from "./admin/pages/DashboardHomePage";
import { AppointmentsPage } from "./admin/pages/AppointmentsPage";
import { MessagesPage } from "./admin/pages/MessagesPage";
import { PatientAuthProvider } from "./patient/context/PatientAuthContext";
import { ProtectedPatientRoute } from "./patient/components/ProtectedPatientRoute";
import { PatientLayout } from "./patient/components/PatientLayout";
import { PatientLoginPage } from "./patient/pages/PatientLoginPage";
import { PatientSignupPage } from "./patient/pages/PatientSignupPage";
import { PatientDashboardPage } from "./patient/pages/PatientDashboardPage";
import { NewAppointmentPage } from "./patient/pages/NewAppointmentPage";

export default function App() {
  return (
    <ToastProvider>
      <AppointmentProvider>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <ScrollProgressBar />
                <Navbar />
                <main className="pb-20 sm:pb-0">
                  <Home />
                </main>
                <Footer />
                <WhatsAppButton />
                <BackToTopButton />
                <MobileAppointmentBar />
              </>
            }
          />

          <Route element={<AdminAuthProvider><Outlet /></AdminAuthProvider>}>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedAdminRoute>
                  <AdminLayout />
                </ProtectedAdminRoute>
              }
            >
              <Route index element={<DashboardHomePage />} />
              <Route path="appointments" element={<AppointmentsPage />} />
              <Route path="messages" element={<MessagesPage />} />
            </Route>
          </Route>

          <Route element={<PatientAuthProvider><Outlet /></PatientAuthProvider>}>
            <Route path="/patient/login" element={<PatientLoginPage />} />
            <Route path="/patient/signup" element={<PatientSignupPage />} />
            <Route
              path="/patient"
              element={
                <ProtectedPatientRoute>
                  <PatientLayout />
                </ProtectedPatientRoute>
              }
            >
              <Route index element={<PatientDashboardPage />} />
              <Route path="new-appointment" element={<NewAppointmentPage />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppointmentProvider>
    </ToastProvider>
  );
}
