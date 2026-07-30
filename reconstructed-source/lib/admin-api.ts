/**
 * RECONSTRUCTED SOURCE
 *
 * Exact browser API contract recovered from deployed module 49427.
 */

export class AdminApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
  }
}

type AdminEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export async function adminFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(url, options);

  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = "/backoffice/login";
    }
    throw new AdminApiError("Unauthorized", 401);
  }

  const json = (await response.json()) as AdminEnvelope<T>;
  if (!json.success) {
    throw new AdminApiError(
      json.error || `Request failed (${response.status})`,
      response.status,
    );
  }

  return json.data;
}

export function adminPost<T>(url: string, body: unknown): Promise<T> {
  return adminFetch<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function adminPut<T>(url: string, body: unknown): Promise<T> {
  return adminFetch<T>(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function adminPatch<T>(url: string, body: unknown): Promise<T> {
  return adminFetch<T>(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function adminDelete<T>(url: string): Promise<T> {
  return adminFetch<T>(url, { method: "DELETE" });
}
