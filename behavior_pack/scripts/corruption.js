import { world, system } from "@minecraft/server";

const state = {
  brokenBlocks: 0,
  corruptionLevel: 0,
  lastAutomaticStepTick: 0,
  stabilizedUntilTick: 0,
};

export function getCorruptionLevel() {
  return state.corruptionLevel;
}

export function getBrokenBlockCount() {
  return state.brokenBlocks;
}

export function isStabilized() {
  return system.currentTick < state.stabilizedUntilTick;
}

export function stabilizeForTicks(ticks = 20 * 30) {
  state.stabilizedUntilTick = Math.max(state.stabilizedUntilTick, system.currentTick + ticks);
}

export function addCorruption(amount = 1, reason = "unknown") {
  const previous = state.corruptionLevel;
  state.corruptionLevel = Math.max(0, state.corruptionLevel + amount);

  if (state.corruptionLevel !== previous) {
    world.sendMessage(
      `§5§l[Memory Corruption]§r Seviye §d${state.corruptionLevel}§r oldu. (§7${reason}§r)`
    );
  }

  return state.corruptionLevel;
}

export function registerBrokenBlock(player, block) {
  state.brokenBlocks += 1;

  if (state.brokenBlocks % 100 === 0) {
    addCorruption(1, "100 blok kırıldı");
  }

  const level = state.corruptionLevel;
  if (player && block && level >= 2 && level % 2 === 0) {
    try {
      player.onScreenDisplay.setActionBar(
        `§dMemory Corruption§r §7| §5Level ${level}§r §8| §f${block.typeId}`
      );
    } catch {
      // ignore HUD failures
    }
  }
}

export function stepCorruptionOverTime() {
  const tick = system.currentTick;
  if (tick - state.lastAutomaticStepTick < 20 * 60) {
    return false;
  }

  state.lastAutomaticStepTick = tick;
  addCorruption(1, "zaman geçti");
  return true;
}

export function getCorruptionState() {
  return {
    brokenBlocks: state.brokenBlocks,
    corruptionLevel: state.corruptionLevel,
    stabilizedUntilTick: state.stabilizedUntilTick,
    lastAutomaticStepTick: state.lastAutomaticStepTick,
  };
}
