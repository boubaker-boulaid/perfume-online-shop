// crypto.randomUUID only exists on https and localhost, so testing from a phone
// over the local network needs this fallback.
export function createUuid(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()

  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (Number(c) ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))).toString(16),
  )
}
