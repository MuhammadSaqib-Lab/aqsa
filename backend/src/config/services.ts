/**
 * Mirrors the real service titles from the frontend's
 * `src/config/clinic.ts` (`services[].title`), which is what
 * `AppointmentForm.tsx` actually sends as the `service` field. Keep this
 * list in sync with that file — do not add services that aren't offered.
 */
export const SERVICE_TITLES = [
  "Pain Management",
  "Sports Injury Rehabilitation",
  "Back & Neck Pain",
  "Post-Surgical Rehabilitation",
  "Joint Rehabilitation",
  "Exercise Therapy",
  "Posture & Mobility",
  "Neurological Rehabilitation",
] as const;
