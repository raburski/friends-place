const required = (key: string) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing env var: ${key}`);
  }
  return value;
};

export const env = {
  databaseUrl: () => required("DATABASE_URL"),
  nextAuthUrl: () => required("NEXTAUTH_URL"),
  nextAuthSecret: () => required("NEXTAUTH_SECRET")
};
