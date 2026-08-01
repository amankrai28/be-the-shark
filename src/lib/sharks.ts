/**
 * Shark metadata, shown ONLY post-reveal (legal constraint: real names must
 * never render before the reveal step — see CLAUDE.md).
 */
export interface SharkInfo {
  name: string
  company: string
  emoji: string
}

export const SHARKS: Record<string, SharkInfo> = {
  ashneer: { name: 'Ashneer Grover', company: 'BharatPe', emoji: '💰' },
  aman: { name: 'Aman Gupta', company: 'boAt', emoji: '🎧' },
  namita: { name: 'Namita Thapar', company: 'Emcure', emoji: '💊' },
  peyush: { name: 'Peyush Bansal', company: 'Lenskart', emoji: '👓' },
  vineeta: { name: 'Vineeta Singh', company: 'SUGAR', emoji: '💄' },
  anupam: { name: 'Anupam Mittal', company: 'Shaadi.com', emoji: '💍' },
  ghazal: { name: 'Ghazal Alagh', company: 'Mamaearth', emoji: '🌿' },
  amit: { name: 'Amit Jain', company: 'CarDekho', emoji: '🚗' },
  vikas: { name: 'Vikas D Nahar', company: 'Happilo', emoji: '🥜' },
  azhar: { name: 'Azhar Iqubal', company: 'Inshorts', emoji: '📰' },
  radhika: { name: 'Radhika Gupta', company: 'Edelweiss MF', emoji: '📈' },
  deepinder: { name: 'Deepinder Goyal', company: 'Zomato', emoji: '🍕' },
  ronnie: { name: 'Ronnie Screwvala', company: 'upGrad', emoji: '🎓' },
  varun: { name: 'Varun Dua', company: 'ACKO', emoji: '🛡️' },
  guest: { name: 'Guest Shark', company: '', emoji: '🦈' },
}

export function sharkInfo(key: string): SharkInfo {
  return SHARKS[key] ?? SHARKS.guest
}
