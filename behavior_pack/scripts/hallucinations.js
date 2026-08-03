import { system, world } from "@minecraft/server";
import { getCorruptionLevel, isStabilized } from "./corruption.js";

let lastHallucinationTick = 0;

const HALLUCINATION_LINES = [
  "§8...dosyalar karışıyor...",
  "§8sahte entity algılandı",
  "§8chunk cache instability",
  "§8görüntü bozulması tespit edildi",
  "§8bellek okuması başarısız",
];

export function processHallucinations() {
  const level = getCorruptionLevel();
  if (level < 7 || isStabilized()) {
    return;
  }

  const tick = system.currentTick;
  if (tick - lastHallucinationTick < 20 * 12) {
    return;
  }

  lastHallucinationTick = tick;

  const players = world.getPlayers();
  if (players.length === 0) {
    return;
  }

  const line = HALLUCINATION_LINES[Math.floor(Math.random() * HALLUCINATION_LINES.length)];

  for (const player of players) {
    if (Math.random() < 0.6) {
      try {
        player.onScreenDisplay.setActionBar(`§5${line}`);
      } catch {
        // ignore UI failures
      }
    }

    if (Math.random() < 0.35) {
      try {
        player.addEffect("darkness", 40, {
          amplifier: 0,
          showParticles: false,
        });
      } catch {
        // ignore effect failures
      }
    }

    if (Math.random() < 0.2) {
      try {
        player.sendMessage(`§8${line}`);
      } catch {
        // ignore
      }
    }
  }
}
