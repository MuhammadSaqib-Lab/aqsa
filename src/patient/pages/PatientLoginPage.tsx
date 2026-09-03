import { useState, type FormEvent } from "react";
import { Navigate, useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";
import { usePatientAuth } from "../context/PatientAuthContext";
import { ApiRequestError } from "../../lib/apiClient";
import { Button } from "../../components/ui/Button";

export function PatientLoginPage() {
  const { status, login } = usePatientAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = searchParams.get("redirect") || "/patient";

  if (status === "authenticated") return <Navigate to={redirectTo} replace />;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-subtle px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          <img src="/images/logo.png" alt="" width={48} height={48} className="mb-3 h-12 w-12 rounded-full object-cover" />
          <h1 className="font-display text-xl font-semibold text-primary-dark">Patient Login</h1>
          <p className="mt-1 text-sm text-text-soft">Aqsa Physiotherapy Centre</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div>
            <label htmlFor="patient-email" className="mb-1.5 block text-sm font-medium text-text">
              Email
            </label>
            <input
              id="patient-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <div>
            <label htmlFor="patient-password" className="mb-1.5 block text-sm font-medium text-text">
              Password
            </label>
            <input
              id="patient-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-500">
              {error}
            </p>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            icon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
            className="mt-1 w-full"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Don't have an account?{" "}
          <Link
            to={`/patient/signup${redirectTo !== "/patient" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`}
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
