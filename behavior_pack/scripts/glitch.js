import { world, system } from "@minecraft/server";
import { getCorruptionLevel, isStabilized } from "./corruption.js";

const xpCache = new Map();
let lastGlitchTick = 0;

function glitchText() {
  const pool = ["##", "@@", "//", "??", "!!", "%%", "<>", "::"];
  const pieces = [];
  const count = 3 + Math.floor(Math.random() * 5);

  for (let i = 0; i < count; i++) {
    pieces.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  return pieces.join(" ");
}

export function processGlitches() {
  const level = getCorruptionLevel();
  if (level <= 0 || isStabilized()) {
    return;
  }

  const tick = system.currentTick;
  const players = world.getPlayers();

  for (const player of players) {
    let currentXp = 0;
    try {
      currentXp = typeof player.getTotalXp === "function" ? player.getTotalXp() : 0;
    } catch {
      currentXp = 0;
    }

    const lastXp = xpCache.get(player.id) ?? currentXp;
    xpCache.set(player.id, currentXp);

    if (currentXp > lastXp) {
      try {
        player.onScreenDisplay.setTitle("§5█▒░▒█", {
          subtitle: `§dXP spike detected §7${glitchText()}`,
          stayDuration: 40,
          fadeInDuration: 1,
          fadeOutDuration: 10,
        });
      } catch {
        // ignore UI failures
      }

      if (level >= 2) {
        try {
          player.addEffect("nausea", 60, {
            amplifier: 0,
            showParticles: false,
          });
        } catch {
          // ignore effect failures
        }
      }
    }

    const interval = Math.max(120 - level * 10, 30);
    if (tick - lastGlitchTick < interval) {
      continue;
    }

    if (Math.random() < Math.min(0.18 + level * 0.02, 0.5)) {
      try {
        player.onScreenDisplay.setActionBar(
          `§5${glitchText()} §7| §dMemory Corruption ${level}`
        );
      } catch {
        // ignore
      }

      if (level >= 3 && Math.random() < 0.3) {
        try {
          player.addEffect("blindness", 40, { amplifier: 0, showParticles: false });
        } catch {
          // ignore
        }
      }
    }
  }

  lastGlitchTick = tick;
}
