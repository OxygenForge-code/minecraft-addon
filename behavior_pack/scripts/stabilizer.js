import { system, world } from "@minecraft/server";
import { getCorruptionLevel, isStabilized, stabilizeForTicks } from "./corruption.js";

let lastStabilizerTick = 0;

export function processStabilizer() {
  const level = getCorruptionLevel();
  if (level < 1) {
    return;
  }

  const tick = system.currentTick;
  if (tick - lastStabilizerTick < 20 * 15) {
    return;
  }

  lastStabilizerTick = tick;

  for (const player of world.getPlayers()) {
    if (player.hasTag?.("memory_stabilizer")) {
      stabilizeForTicks(20 * 20);
      if (!isStabilized()) {
        continue;
      }

      try {
        player.onScreenDisplay.setActionBar("§aStabilizer online: corruption suppressed");
      } catch {
        // ignore
      }
    }
  }
}

export function grantTemporaryStability(seconds = 30) {
  stabilizeForTicks(seconds * 20);
}
