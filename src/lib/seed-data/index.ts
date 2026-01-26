// src/lib/seed-data/index.ts
/**
 * Barrel export for seed-data module.
 * Provides a single entry point for all seeding-related exports.
 */

export { seedUserBoards, type SeedMutations } from "./seed-repository";
export type { SeedBoard } from "./seed-repository";
export { BOARD_TEMPLATES } from "./templates";
