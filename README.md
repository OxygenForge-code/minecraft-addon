# Memory Corruption: Glitch World

A Minecraft Bedrock add-on concept where the world gets more unstable the longer you play.

## What this build already does

- Counts broken blocks and increases corruption every 100 breaks
- Slowly increases corruption over time
- Distorts blocks near players
- Shows glitchy HUD/action bar messages
- Applies weird status effects at higher corruption levels
- Turns nearby Creepers into diamond explosions at high corruption
- Includes a stabilizer suppression system for future item integration

## Repository layout

- `behavior_pack/` — behavior pack and Script API logic
- `resource_pack/` — resource pack scaffold for future visual assets

## Current API target

This scaffold is written against the latest Bedrock Script API stable line documented by Microsoft Learn (`@minecraft/server` 2.8.0) and a `min_engine_version` of `1.21.120`.

## Next planned steps

- Add a real Memory Stabilizer item
- Add custom textures and UI overlays
- Add block/event tables for more corruption tiers
- Package the packs into a distributable `.mcaddon`
