import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { services } from "../../config/clinic";
import { submitAppointmentRequest } from "../../lib/appointmentApi";
import { useToast } from "../../context/ToastContext";
import type { AppointmentFormValues } from "../../types";
import { Button } from "../ui/Button";

const initialValues: AppointmentFormValues = {
  fullName: "",
  phone: "",
  email: "",
  preferredDate: "",
  preferredTime: "",
  service: "",
  message: "",
};

type Errors = Partial<Record<keyof AppointmentFormValues, string>>;

const PHONE_PATTERN = /^[0-9+\-\s()]{7,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(values: AppointmentFormValues): Errors {
  const errors: Errors = {};

  if (!values.fullName.trim()) errors.fullName = "Please enter your full name.";
  else if (values.fullName.trim().length < 2) errors.fullName = "Name looks too short.";

  if (!values.phone.trim()) errors.phone = "Please enter a phone number.";
  else if (!PHONE_PATTERN.test(values.phone.trim())) errors.phone = "Please enter a valid phone number.";

  if (values.email.trim() && !EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!values.preferredDate) errors.preferredDate = "Please choose a preferred date.";
  else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date(values.preferredDate) < today) {
      errors.preferredDate = "Please choose a date from today onward.";
    }
  }

  if (!values.preferredTime) errors.preferredTime = "Please choose a preferred time.";
  if (!values.service) errors.service = "Please select a service.";

  return errors;
}

interface AppointmentFormProps {
  onSuccess?: () => void;
}

export function AppointmentForm({ onSuccess }: AppointmentFormProps) {
  const [values, setValues] = useState<AppointmentFormValues>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const { showToast } = useToast();

  const updateField = <K extends keyof AppointmentFormValues>(field: K, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setStatus("loading");
    try {
      await submitAppointmentRequest(values);
      setStatus("success");
      showToast("Appointment request received. We'll contact you shortly.");
      onSuccess?.();
    } catch (error) {
      setStatus("error");
      const message =
        error instanceof Error ? error.message : "Something went wrong. Please try again or call us directly.";
      showToast(message, "error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <CheckCircle2 className="h-14 w-14 text-accent" aria-hidden="true" />
        <h3 className="text-xl font-semibold text-primary-dark">Request Received</h3>
        <p className="max-w-sm text-sm text-text-muted">
          Thank you, {values.fullName.split(" ")[0]}. Your request has been received
          and is pending confirmation. Our team will contact you shortly using the
          details you provided.
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setValues(initialValues);
            setStatus("idle");
          }}
        >
          Submit another request
        </Button>
      </div>
    );
  }

  const inputClasses = (field: keyof AppointmentFormValues) =>
    `w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-text transition-colors focus:outline-none focus:ring-2 focus:ring-accent/40 ${
      errors[field] ? "border-red-400" : "border-border focus:border-accent"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-text">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            value={values.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            className={inputClasses("fullName")}
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
          />
          {errors.fullName && (
            <p id="fullName-error" className="mt-1 text-xs text-red-500">
              {errors.fullName}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-text">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="03XX-XXXXXXX"
            value={values.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            className={inputClasses("phone")}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? "phone-error" : undefined}
          />
          {errors.phone && (
            <p id="phone-error" className="mt-1 text-xs text-red-500">
              {errors.phone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-text">
          Email <span className="text-text-soft">(optional)</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => updateField("email", e.target.value)}
          className={inputClasses("email")}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-xs text-red-500">
            {errors.email}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="preferredDate" className="mb-1.5 block text-sm font-medium text-text">
            Preferred Date <span className="text-red-500">*</span>
          </label>
          <input
            id="preferredDate"
            name="preferredDate"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={values.preferredDate}
            onChange={(e) => updateField("preferredDate", e.target.value)}
            className={inputClasses("preferredDate")}
            aria-invalid={Boolean(errors.preferredDate)}
            aria-describedby={errors.preferredDate ? "preferredDate-error" : undefined}
          />
          {errors.preferredDate && (
            <p id="preferredDate-error" className="mt-1 text-xs text-red-500">
              {errors.preferredDate}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="preferredTime" className="mb-1.5 block text-sm font-medium text-text">
            Preferred Time <span className="text-red-500">*</span>
          </label>
          <input
            id="preferredTime"
            name="preferredTime"
            type="time"
            value={values.preferredTime}
            onChange={(e) => updateField("preferredTime", e.target.value)}
            className={inputClasses("preferredTime")}
            aria-invalid={Boolean(errors.preferredTime)}
            aria-describedby={errors.preferredTime ? "preferredTime-error" : undefined}
          />
          {errors.preferredTime && (
            <p id="preferredTime-error" className="mt-1 text-xs text-red-500">
              {errors.preferredTime}
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="service" className="mb-1.5 block text-sm font-medium text-text">
          Service <span className="text-red-500">*</span>
        </label>
        <select
          id="service"
          name="service"
          value={values.service}
          onChange={(e) => updateField("service", e.target.value)}
          className={inputClasses("service")}
          aria-invalid={Boolean(errors.service)}
          aria-describedby={errors.service ? "service-error" : undefined}
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.slug} value={service.title}>
              {service.title}
            </option>
          ))}
        </select>
        {errors.service && (
          <p id="service-error" className="mt-1 text-xs text-red-500">
            {errors.service}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-text">
          Message <span className="text-text-soft">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          value={values.message}
          onChange={(e) => updateField("message", e.target.value)}
          className={inputClasses("message")}
          placeholder="Tell us briefly about your concern"
        />
      </div>

      {status === "error" && (
        <p role="alert" className="text-sm text-red-500">
          Something went wrong submitting your request. Please try again.
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={status === "loading"}
        icon={
          status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )
        }
        className="mt-1 w-full"
      >
        {status === "loading" ? "Submitting..." : "Request Appointment"}
      </Button>
      <p className="text-center text-xs text-text-soft">
        Submitting this form sends your request to our team for confirmation — it does
        not book a guaranteed time slot.
      </p>
    </form>
  );
}
