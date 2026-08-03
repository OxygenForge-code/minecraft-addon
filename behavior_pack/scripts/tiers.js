export const CORRUPTION_TIERS = [
  {
    level: 0,
    name: "Stable",
    xpPulse: false,
    ambientGlitch: false,
    blockDistortion: false,
    mobChaos: false,
    hallucination: false,
  },
  {
    level: 1,
    name: "Flicker",
    xpPulse: true,
    ambientGlitch: true,
    blockDistortion: false,
    mobChaos: false,
    hallucination: false,
  },
  {
    level: 2,
    name: "Warp",
    xpPulse: true,
    ambientGlitch: true,
    blockDistortion: true,
    mobChaos: false,
    hallucination: false,
  },
  {
    level: 4,
    name: "Break",
    xpPulse: true,
    ambientGlitch: true,
    blockDistortion: true,
    mobChaos: true,
    hallucination: false,
  },
  {
    level: 7,
    name: "Collapse",
    xpPulse: true,
    ambientGlitch: true,
    blockDistortion: true,
    mobChaos: true,
    hallucination: true,
  },
];

export function getTierForLevel(level) {
  let current = CORRUPTION_TIERS[0];
  for (const tier of CORRUPTION_TIERS) {
    if (level >= tier.level) {
      current = tier;
    }
  }
  return current;
}
