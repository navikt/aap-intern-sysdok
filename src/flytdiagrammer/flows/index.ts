import { fordelingMvpKantTilKantFlyt } from "./fordeling-mvp-kant-til-kant.ts";
import type { Flow } from "./types.ts";

/** Registrer alle flyter her. Rekkefølgen bestemmer rekkefølgen på forsiden. */
export const flows: Flow[] = [fordelingMvpKantTilKantFlyt];

export function getFlow(id: string): Flow | undefined {
  return flows.find((flow) => flow.id === id);
}
