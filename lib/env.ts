const required = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env var: ${key}`);
  }
  return value;
};

const optional = (key: string, fallback = ""): string => process.env[key] ?? fallback;

export const env = {
  databaseUrl: () => required("DATABASE_URL"),
  nextAuthUrl: () => required("NEXTAUTH_URL"),
  nextAuthSecret: () => required("NEXTAUTH_SECRET"),
  bunnyStorageZone: () => required("BUNNY_STORAGE_ZONE"),
  bunnyApiKey: () => required("BUNNY_API_KEY"),
  bunnyCdnUrl: () => optional("BUNNY_CDN_URL", "https://storage.bunnycdn.com"),
  bunnyPullZoneUrl: () => required("BUNNY_PULL_ZONE_URL")
};
