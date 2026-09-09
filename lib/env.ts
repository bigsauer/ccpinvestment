function required(name: string, value: string | undefined) {
  if (value && value.trim()) return value.trim();
  throw new Error(`Missing required env ${name}`);
}

export function assertRuntimeEnv() {
  required("DATABASE_URL", process.env.DATABASE_URL);
  required("AUTH_SECRET", process.env.AUTH_SECRET);
  if (process.env.NODE_ENV === "production") {
    required("AUTH_URL", process.env.AUTH_URL);
  }
}
