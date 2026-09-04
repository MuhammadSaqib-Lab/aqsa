/**
 * Centralized fetch client for the backend API. Every frontend API call
 * should go through this instead of calling fetch() directly, so base URL,
 * headers, timeouts, and error handling stay in one place.
 */

const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const API_URL = rawApiUrl?.replace(/\/$/, "") ?? "/api";
const DEFAULT_TIMEOUT_MS = 10_000;

if (!rawApiUrl) {
  // Falling back to a same-origin relative path silently sends every API call
  // nowhere useful when the backend lives on a different domain (Render vs
  // Vercel) — surface it loudly instead of leaving requests to fail with no
  // trace in the backend's logs.
  console.warn(
    `[apiClient] VITE_API_URL is not set — falling back to relative "${API_URL}", which only reaches a backend ` +
      "hosted on this same origin. If API calls aren't reaching the backend, set VITE_API_URL " +
      "(e.g. https://your-backend.onrender.com/api) in your hosting provider's build environment variables " +
      "and trigger a fresh build."
  );
}

interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

interface ApiFailure {
  success: false;
  message: string;
  errors?: Array<{ path: string; message: string }>;
}

export class ApiRequestError extends Error {
  status: number;
  errors?: ApiFailure["errors"];

  constructor(message: string, status: number, errors?: ApiFailure["errors"]) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  timeoutMs?: number;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: "include",
      signal: controller.signal,
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new ApiRequestError("The request timed out. Please check your connection and try again.", 0);
    }
    throw new ApiRequestError("Unable to reach the server. Please try again later.", 0);
  } finally {
    clearTimeout(timeout);
  }

  const payload = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null;

  if (!response.ok || !payload?.success) {
    const message = payload?.message ?? "Something went wrong. Please try again.";
    throw new ApiRequestError(message, response.status, payload && !payload.success ? payload.errors : undefined);
  }

  return payload.data;
}
