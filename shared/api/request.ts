export class ApiError extends Error {
  status: number;
  code?: string;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

type RequestBody = BodyInit | unknown;

type RequestJsonOptions = {
  method?: string;
  headers?: HeadersInit;
  body?: RequestBody;
  baseUrl?: string;
  credentials?: RequestCredentials;
  onUnauthorized?: () => void | Promise<void>;
};

function isFormBody(body: unknown): body is FormData | URLSearchParams | Blob | ArrayBuffer {
  if (!body) {
    return false;
  }
  if (typeof FormData !== "undefined" && body instanceof FormData) {
    return true;
  }
  if (typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams) {
    return true;
  }
  if (typeof Blob !== "undefined" && body instanceof Blob) {
    return true;
  }
  if (typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer) {
    return true;
  }
  return false;
}

async function parseResponseBody(response: Response) {
  const raw = await response.text();
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

export async function requestJson<T>(path: string, options: RequestJsonOptions = {}): Promise<T> {
  const { baseUrl = "", body, headers, method, credentials, onUnauthorized } = options;
  const isJsonBody = body !== undefined && typeof body !== "string" && !isFormBody(body);

  const response = await fetch(`${baseUrl}${path}`, {
    method: method ?? (body ? "POST" : "GET"),
    headers: {
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(headers ?? {})
    },
    body: isJsonBody ? JSON.stringify(body) : (body as BodyInit | undefined),
    credentials
  });

  if (!response.ok) {
    const data = await parseResponseBody(response);
    const errorCode = data && typeof data === "object" && "error" in data ? String((data as any).error) : undefined;

    if (response.status === 401 && onUnauthorized) {
      await onUnauthorized();
    }

    throw new ApiError(errorCode ?? "request_failed", response.status, data, errorCode);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await parseResponseBody(response);
  return data as T;
}
