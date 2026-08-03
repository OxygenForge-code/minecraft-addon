import { ItemStack, system, world } from "@minecraft/server";
import { getCorruptionLevel, isStabilized } from "./corruption.js";

let lastMobSweepTick = 0;

function spawnDiamondsNear(entity, amount) {
  try {
    const stack = new ItemStack("minecraft:diamond", amount);
    entity.dimension.spawnItem(stack, entity.location);
  } catch {
    // ignore item spawn failures
  }
}

function killEntity(entity) {
  try {
    if (typeof entity.kill === "function") {
      entity.kill();
    } else if (typeof entity.remove === "function") {
      entity.remove();
    }
  } catch {
    // ignore
  }
}

export function processCreeperChaos() {
  const level = getCorruptionLevel();
  if (level < 4 || isStabilized()) {
    return;
  }

  const tick = system.currentTick;
  if (tick - lastMobSweepTick < 20 * 2) {
    return;
  }

  lastMobSweepTick = tick;

  for (const player of world.getPlayers()) {
    const creepers = player.dimension.getEntities({ type: "minecraft:creeper" });
    for (const creeper of creepers) {
      const dx = creeper.location.x - player.location.x;
      const dy = creeper.location.y - player.location.y;
      const dz = creeper.location.z - player.location.z;
      const distanceSq = dx * dx + dy * dy + dz * dz;

      if (distanceSq <= 36) {
        const amount = Math.max(1, Math.min(3, 1 + Math.floor(level / 3)));
        spawnDiamondsNear(creeper, amount);
        killEntity(creeper);

        try {
          player.onScreenDisplay.setActionBar("§bCreeper bozuldu: elmas saçıldı.");
        } catch {
          // ignore
        }
      }
    }
  }
}
