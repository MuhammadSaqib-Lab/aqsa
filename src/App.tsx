import { Route, Routes } from "react-router-dom";
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppointmentProvider>
    </ToastProvider>
  );
}
