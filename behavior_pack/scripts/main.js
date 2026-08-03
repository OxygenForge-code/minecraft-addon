import { system, world } from "@minecraft/server";
import { registerBrokenBlock, stepCorruptionOverTime } from "./corruption.js";
import { distortBlocksNearPlayers, onBlockBrokenWorld } from "./blocks.js";
import { processCorruptionEvents } from "./events.js";
import { processCreeperChaos } from "./mobs.js";
import { processGlitches } from "./glitch.js";
import { processHallucinations } from "./hallucinations.js";
import { grantTemporaryStability, processStabilizer } from "./stabilizer.js";

world.afterEvents.playerBreakBlock.subscribe((event) => {
  registerBrokenBlock(event.player, event.block);
  onBlockBrokenWorld(event);
});

world.afterEvents.playerSpawn.subscribe((event) => {
  if (!event.initialSpawn) {
    return;
  }

  try {
    event.player.sendMessage("§5Memory Corruption§r yüklendi. Dünya yavaşça bozulacak.");
    event.player.onScreenDisplay.setActionBar("§dBozuk Bellek aktif.");
  } catch {
    // ignore spawn UI failures
  }
});

world.afterEvents.itemUse.subscribe((event) => {
  const itemType = event.itemStack?.typeId;
  if (!itemType) {
    return;
  }

  if (itemType === "memorycorruption:memory_stabilizer") {
    grantTemporaryStability(30);

    try {
      event.source.sendMessage("§aStabilizer dalgası yayıldı. Corruption kısa süreliğine bastırıldı.");
      event.source.onScreenDisplay.setActionBar("§aMemory Stabilizer: active");
    } catch {
      // ignore
    }
  }
});

system.runInterval(() => {
  stepCorruptionOverTime();
  processGlitches();
  processHallucinations();
  processCorruptionEvents();
  processCreeperChaos();
  processStabilizer();
  distortBlocksNearPlayers();
}, 20);

world.sendMessage("§5§l[Memory Corruption]§r Core scripts loaded.");
