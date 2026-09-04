/**
 * Centralized fetch client for the backend API. Every frontend API call
 * should go through this instead of calling fetch() directly, so base URL,
 * headers, timeouts, and error handling stay in one place.
 */

// Defaults to the production Render backend so the deployed frontend works
// even if VITE_API_URL is never configured in Vercel. Local dev overrides
// this via .env.local (VITE_API_URL=http://localhost:5000/api).
const PRODUCTION_API_URL = "https://aqsa-ustm.onrender.com/api";
const API_URL = ((import.meta.env.VITE_API_URL as string | undefined) ?? PRODUCTION_API_URL).replace(/\/$/, "");
const DEFAULT_TIMEOUT_MS = 10_000;

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
  const method = options.method ?? "GET";
  const url = `${API_URL}${path}`;

  // Traces every call from the browser console — the fastest way to tell
  // "never left the browser" (network error below) apart from "backend
  // rejected it" (a logged non-2xx) apart from "never even reached fetch()"
  // (nothing logged at all, meaning a JS error happened before this ran).
  console.log(`[apiClient] → ${method} ${url}`);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: options.body ? { "Content-Type": "application/json" } : undefined,
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: "include",
      signal: controller.signal,
    });
  } catch (error) {
    console.error(`[apiClient] ✗ ${method} ${url} — request never reached the server`, error);
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
    console.error(`[apiClient] ✗ ${method} ${url} — ${response.status} ${message}`);
    throw new ApiRequestError(message, response.status, payload && !payload.success ? payload.errors : undefined);
  }

  console.log(`[apiClient] ✓ ${method} ${url} — ${response.status}`);
  return payload.data;
}
