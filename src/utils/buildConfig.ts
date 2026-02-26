/**
 * Determines if applications pages should be built.
 * Returns false only in Netlify production builds (CONTEXT=production).
 * Returns true for local dev, deploy previews, and branch deploys.
 */
export function shouldBuildApplications(): boolean {
  if (import.meta.env.DEV) return true;
  return process.env.CONTEXT !== 'production';
}
