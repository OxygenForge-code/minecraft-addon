import { world, system } from "@minecraft/server";
import { getCorruptionLevel, isStabilized } from "./corruption.js";

let lastEventTick = 0;

const EVENT_LINES = [
  "Mantık tablosu yeniden çiziliyor...",
  "Bellek bütünlüğü doğrulanamadı.",
  "Gerçeklik stack overflow verdi.",
  "Chunk cache kararsız durumda.",
  "Bir şeyler burada yanlış ama oyun devam ediyor.",
];

function applyRandomStatusEffect(player, effectId, duration, amplifier = 0) {
  try {
    player.addEffect(effectId, duration, {
      amplifier,
      showParticles: false,
    });
  } catch {
    // ignore effect failures
  }
}

export function processCorruptionEvents() {
  const level = getCorruptionLevel();
  if (level < 2 || isStabilized()) {
    return;
  }

  const tick = system.currentTick;
  if (tick - lastEventTick < 20 * 30) {
    return;
  }

  lastEventTick = tick;
  const players = world.getPlayers();
  if (players.length === 0) {
    return;
  }

  const roll = Math.random();
  const line = EVENT_LINES[Math.floor(Math.random() * EVENT_LINES.length)];

  world.sendMessage(`§5§l[Corruption]§r §7${line}`);

  for (const player of players) {
    if (roll < 0.2 || level >= 6) {
      applyRandomStatusEffect(player, "blindness", 40);
    }

    if (roll >= 0.2 && roll < 0.45 || level >= 4) {
      applyRandomStatusEffect(player, "slowness", 80, 1);
    }

    if (roll >= 0.45 && roll < 0.65 && level >= 3) {
      applyRandomStatusEffect(player, "nausea", 80);
    }

    if (roll >= 0.65 && level >= 5) {
      applyRandomStatusEffect(player, "slow_falling", 120);
    }

    try {
      if (level >= 7) {
        player.onScreenDisplay.setActionBar(`§d${line}`);
      }
    } catch {
      // ignore
    }
  }
}
