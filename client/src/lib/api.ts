const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function parseJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit & { token?: string } = {}
): Promise<T> {
  const headers = new Headers(opts.headers || {});
  headers.set("Content-Type", "application/json");
  if (opts.token) headers.set("Authorization", `Bearer ${opts.token}`);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  } catch {
    throw new ApiError(
      `Cannot reach backend at ${API_URL}. Check server is running and VITE_API_URL is correct.`,
      0
    );
  }
  const json = await parseJson(res);
  if (!res.ok) {
    throw new ApiError(json?.error || "Request failed", res.status, json?.details);
  }
  return json as T;
}

