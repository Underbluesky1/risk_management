export const DEFAULT_LOGIN_EMAIL = "ops@riskwatch.local";
export const DEFAULT_LOGIN_PASSWORD = "riskwatch123";

export function getLoginCredentials() {
  const email = process.env.DEFAULT_USER_EMAIL?.trim().toLowerCase() || DEFAULT_LOGIN_EMAIL;
  const password = process.env.DEFAULT_USER_PASSWORD?.trim() || DEFAULT_LOGIN_PASSWORD;

  return { email, password };
}
