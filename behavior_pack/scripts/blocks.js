import { BlockPermutation, world, system } from "@minecraft/server";
import { getCorruptionLevel, isStabilized } from "./corruption.js";

let lastDistortTick = 0;

const STONE_VARIANTS = new Set([
  "minecraft:stone",
  "minecraft:deepslate",
  "minecraft:cobblestone",
  "minecraft:andesite",
  "minecraft:diorite",
  "minecraft:granite",
]);

const DIRT_VARIANTS = new Set([
  "minecraft:dirt",
  "minecraft:grass_block",
  "minecraft:coarse_dirt",
  "minecraft:rooted_dirt",
  "minecraft:mud",
]);

function safeSetBlock(block, typeId) {
  try {
    if (block && block.typeId !== typeId) {
      block.setPermutation(BlockPermutation.resolve(typeId));
    }
  } catch {
    // ignore unloaded chunk / invalid block failures
  }
}

export function onBlockBrokenWorld(event) {
  const player = event.player;
  const block = event.block;
  const level = getCorruptionLevel();

  if (!player || !block) {
    return;
  }

  if (level >= 4 && block.typeId === "minecraft:stone") {
    try {
      player.onScreenDisplay.setActionBar("§bTaşlar burada artık su gibi davranmak istiyor...");
    } catch {
      // ignore
    }
  }
}

export function distortBlocksNearPlayers() {
  const tick = system.currentTick;
  if (tick - lastDistortTick < 20 * 5) {
    return;
  }

  lastDistortTick = tick;
  const level = getCorruptionLevel();
  if (level < 2 || isStabilized()) {
    return;
  }

  for (const player of world.getPlayers()) {
    const dimension = player.dimension;
    const center = player.location;
    const radius = Math.min(2 + Math.floor(level / 2), 5);

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -1; dy <= 2; dy++) {
        for (let dz = -radius; dz <= radius; dz++) {
          const x = Math.floor(center.x + dx);
          const y = Math.floor(center.y + dy);
          const z = Math.floor(center.z + dz);

          const block = dimension.getBlock({ x, y, z });
          if (!block) continue;

          if (level >= 2 && STONE_VARIANTS.has(block.typeId) && Math.random() < 0.18) {
            safeSetBlock(block, "minecraft:sand");
          } else if (level >= 3 && DIRT_VARIANTS.has(block.typeId) && Math.random() < 0.14) {
            safeSetBlock(block, "minecraft:glass");
          } else if (level >= 5 && block.typeId === "minecraft:water" && Math.random() < 0.12) {
            safeSetBlock(block, "minecraft:ice");
          } else if (level >= 6 && block.typeId === "minecraft:lava" && Math.random() < 0.12) {
            safeSetBlock(block, "minecraft:magma_block");
          }
        }
      }
    }
  }
}
