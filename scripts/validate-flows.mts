import { flows } from "../src/flytdiagrammer/flows/index.ts";
import { validateFlows } from "../src/flytdiagrammer/flows/validate.ts";

const feil = validateFlows(flows);
if (feil.length > 0) {
  console.error(`Fant ${feil.length} feil:`);
  for (const f of feil) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`OK: ${flows.length} flyt(er) er gyldige.`);
