import { headers } from 'next/headers';

// Shared by anything building an absolute URL server-side (auth redirects,
// links inside notification emails) — not a Server Action itself, so it
// lives outside any 'use server' file.
export async function getOrigin() {
  const h = await headers();
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const protocol = h.get('x-forwarded-proto') ?? 'https';
  return `${protocol}://${host}`;
}
