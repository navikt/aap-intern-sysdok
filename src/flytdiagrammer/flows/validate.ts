import type { Flow } from "./types.ts";

/** Returnerer en liste med feil. Tom liste betyr at flytene er gyldige. */
export function validateFlows(flows: Flow[]): string[] {
  const feil: string[] = [];
  const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  const flytIder = new Set<string>();

  for (const flow of flows) {
    if (!kebab.test(flow.id)) feil.push(`Flyt-id "${flow.id}" er ikke kebab-case`);
    if (flytIder.has(flow.id)) feil.push(`Flyt-id "${flow.id}" finnes flere ganger`);
    flytIder.add(flow.id);

    const nodeIder = new Set<string>();
    const posisjoner = new Set<string>();
    for (const node of flow.nodes) {
      const sted = `${flow.id}/${node.id}`;
      if (!kebab.test(node.id)) feil.push(`${sted}: node-id er ikke kebab-case`);
      if (nodeIder.has(node.id)) feil.push(`${sted}: node-id finnes flere ganger`);
      nodeIder.add(node.id);
      const pos = `${node.position.x},${node.position.y}`;
      if (posisjoner.has(pos)) feil.push(`${sted}: overlapper en annen boks på (${pos})`);
      posisjoner.add(pos);
    }

    for (const node of flow.nodes) {
      for (const block of node.details) {
        if (block.type === "link" && !flows.some((f) => f.id === block.flowId)) {
          feil.push(`${flow.id}/${node.id}: lenke til ukjent flyt "${block.flowId}"`);
        }
      }
    }

    flow.edges.forEach((edge, i) => {
      for (const ende of [edge.from, edge.to]) {
        if (!nodeIder.has(ende)) {
          feil.push(`${flow.id}: pil nr. ${i} peker på ukjent node "${ende}"`);
        }
      }
    });
  }
  return feil;
}
