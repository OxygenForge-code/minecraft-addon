import { system, world } from "@minecraft/server";
import { registerBrokenBlock, stepCorruptionOverTime } from "./corruption.js";
import { distortBlocksNearPlayers, onBlockBrokenWorld } from "./blocks.js";
import { processCorruptionEvents } from "./events.js";
import { processCreeperChaos } from "./mobs.js";
import { processGlitches } from "./glitch.js";
import { processStabilizer } from "./stabilizer.js";

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

system.runInterval(() => {
  stepCorruptionOverTime();
  processGlitches();
  processCorruptionEvents();
  processCreeperChaos();
  processStabilizer();
  distortBlocksNearPlayers();
}, 20);

world.sendMessage("§5§l[Memory Corruption]§r Core scripts loaded.");
