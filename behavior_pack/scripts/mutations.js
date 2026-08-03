import { system, world } from "@minecraft/server";
import { getCorruptionLevel, isStabilized } from "./corruption.js";
import { getTierForLevel } from "./tiers.js";

let lastMutationTick = 0;
let lastTimeFlip = 0;

async function tryRunCommand(dimension, command) {
  try {
    if (typeof dimension.runCommandAsync === "function") {
      await dimension.runCommandAsync(command);
    } else if (typeof dimension.runCommand === "function") {
      dimension.runCommand(command);
    }
  } catch {
    // ignore command failures
  }
}

function pulsePlayer(player, level) {
  try {
    if (level >= 2) {
      player.addEffect("slowness", 40, { amplifier: 0, showParticles: false });
    }
    if (level >= 4) {
      player.addEffect("nausea", 60, { amplifier: 0, showParticles: false });
    }
    if (level >= 7) {
      player.addEffect("blindness", 20, { amplifier: 0, showParticles: false });
    }
  } catch {
    // ignore effect failures
  }
}

export async function processWorldMutations() {
  const level = getCorruptionLevel();
  const tier = getTierForLevel(level);
  if (level <= 0 || isStabilized()) {
    return;
  }

  const tick = system.currentTick;
  if (tick - lastMutationTick < 20 * 8) {
    return;
  }

  lastMutationTick = tick;

  for (const player of world.getPlayers()) {
    if (tier.ambientGlitch && Math.random() < 0.45) {
      try {
        player.onScreenDisplay.setActionBar(`§5Reality desync §7| §d${tier.name}`);
      } catch {
        // ignore UI failures
      }
    }

    if (tier.xpPulse && Math.random() < 0.3) {
      pulsePlayer(player, level);
    }

    if (tier.hallucination && Math.random() < 0.2) {
      try {
        player.sendMessage("§8A sahte sistem sinyali çöktü.");
      } catch {
        // ignore
      }
    }

    if (tier.blockDistortion && Math.random() < 0.2) {
      const dim = player.dimension;
      const loc = player.location;
      const x = Math.floor(loc.x);
      const y = Math.floor(loc.y - 1);
      const z = Math.floor(loc.z);
      const below = dim.getBlock({ x, y, z });
      if (below && Math.random() < 0.08) {
        try {
          below.setType("minecraft:glass");
        } catch {
          // ignore
        }
      }
    }
  }

  const overworld = world.getDimension("overworld");
  if (!overworld) return;

  if (level >= 3 && tick - lastTimeFlip >= 20 * 25) {
    lastTimeFlip = tick;
    const flipNight = Math.random() < 0.5;
    await tryRunCommand(overworld, flipNight ? "time set midnight" : "time set day");
    await tryRunCommand(overworld, Math.random() < 0.6 ? "weather clear" : "weather rain");

    try {
      world.sendMessage(
        flipNight
          ? "§5[Memory Corruption]§r Gökyüzü geceye kilitlendi."
          : "§5[Memory Corruption]§r Gökyüzü yeniden kırpıldı."
      );
    } catch {
      // ignore
    }
  }
}
