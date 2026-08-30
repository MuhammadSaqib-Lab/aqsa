import { Home as HomeIcon, PhoneCall } from "lucide-react";
import { clinic } from "../config/clinic";
import { Button } from "../components/ui/Button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-bg-subtle px-4 py-24 text-center">
      <img
        src="/images/logo.png"
        alt={`${clinic.name} logo`}
        width={64}
        height={64}
        className="h-16 w-16 rounded-full object-cover"
      />
      <p className="font-display text-6xl font-semibold text-primary sm:text-7xl">404</p>
      <h1 className="text-balance text-2xl font-semibold text-primary-dark sm:text-3xl">
        This page took an unplanned detour.
      </h1>
      <p className="max-w-md text-balance text-base text-text-muted">
        The page you're looking for may have moved or no longer exists. Let's get you
        back on track.
      </p>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          href="/"
          icon={<HomeIcon className="h-4 w-4" aria-hidden="true" />}
          iconPosition="left"
        >
          Back to Home
        </Button>
        <Button
          size="lg"
          variant="outline"
          href={clinic.phonePrimaryHref}
          icon={<PhoneCall className="h-4 w-4" aria-hidden="true" />}
          iconPosition="left"
        >
          Call the Clinic
        </Button>
      </div>
    </main>
  );
}
