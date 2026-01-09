export type MobileSession = {
  token: string;
  expiresAt: string;
};

export function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`
  };
}
