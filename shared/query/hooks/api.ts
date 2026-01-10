import { requestJson } from "../../api/request";
import { authHeaders } from "../../auth/mobile-session";

type RequestCredentialsValue = "omit" | "same-origin" | "include";
type HeadersInitValue = Record<string, string> | Array<[string, string]>;

type ApiRequestOptions = {
  baseUrl?: string;
  token?: string;
  credentials?: RequestCredentialsValue;
  headers?: HeadersInitValue;
  onUnauthorized?: () => void | Promise<void>;
};

type ApiRequestParams = ApiRequestOptions & {
  method?: string;
  body?: unknown;
};

export type ApiOptions = ApiRequestOptions;
export type ApiQueryOptions = ApiRequestOptions & { enabled?: boolean };

export async function apiRequest<T>(path: string, options: ApiRequestParams = {}): Promise<T> {
  const credentials = options.credentials ?? (options.token ? undefined : "include");
  const headers = {
    ...(options.token ? authHeaders(options.token) : {}),
    ...(options.headers ?? {})
  } as HeadersInitValue;

  return requestJson<T>(path, {
    baseUrl: options.baseUrl,
    credentials,
    headers,
    method: options.method,
    body: options.body,
    onUnauthorized: options.onUnauthorized
  });
}
