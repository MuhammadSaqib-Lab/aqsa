import { AppointmentForm } from "../../components/forms/AppointmentForm";

export function NewAppointmentPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Book an Appointment</h1>
        <p className="mt-1 text-sm text-text-soft">Tell us a bit about what you need, and we'll confirm your slot.</p>
      </div>
      <div className="rounded-2xl border border-border bg-white p-6 shadow-soft sm:p-8">
        <AppointmentForm />
      </div>
    </div>
  );
}
