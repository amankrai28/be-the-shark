/**
 * Casual-DevTools deterrence only, NOT security: company/founder names are
 * XOR-mixed and base64-encoded at build time (scripts/prepare-data.mjs) so
 * today's answer doesn't appear in plain text in view-source or the network
 * tab. A determined player can still decode it — accepted MVP stance.
 */
const KEY = 'betheshark'

export function decodeName(encoded: string): string {
  if (!encoded) return ''
  try {
    const raw = atob(encoded)
    let out = ''
    for (let i = 0; i < raw.length; i++) {
      out += String.fromCharCode(raw.charCodeAt(i) ^ KEY.charCodeAt(i % KEY.length))
    }
    return decodeURIComponent(escape(out))
  } catch {
    return ''
  }
}
