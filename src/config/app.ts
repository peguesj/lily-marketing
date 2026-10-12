/**
 * App/URL configuration for the Lily marketing site (README-v2 notes).
 *
 * APP_URL is the origin of the Lily product app (Phoenix). It is a PLACEHOLDER
 * host until the production app domain is confirmed: override it per environment
 * with PUBLIC_LILY_APP_URL (for example in .env or the build environment); the
 * default is https://app.asklily.health. Trailing slashes are stripped.
 *
 * Every marketing-site link into the app must go through `appLinks` so that
 * scripts/check-pages.mjs can allowlist the paths. If you add a path here, add
 * it to APP_PATH_ALLOWLIST in scripts/check-pages.mjs as well.
 *
 * SUBMIT_ENDPOINT is the existing Plesk reverse proxy that forwards form posts
 * to Phoenix. Forms post here with a hidden `_h` honeypot field.
 */
const rawAppUrl: string =
  (import.meta.env.PUBLIC_LILY_APP_URL as string | undefined) || 'https://app.asklily.health';

export const APP_URL: string = rawAppUrl.replace(/\/+$/, '');

export const appLinks = {
  supervisorSignup: `${APP_URL}/app/signup/supervisor`,
  graduateSignup: `${APP_URL}/app/signup/graduate`,
  welcome: `${APP_URL}/app`,
  signIn: `${APP_URL}/app/sign-in`,
  programInquiry: `${APP_URL}/beta/join?audience=sponsor`,
  joinBeta: `${APP_URL}/beta/join`,
} as const;

export type AppLinkName = keyof typeof appLinks;

export const SUBMIT_ENDPOINT = '/api/submit';
