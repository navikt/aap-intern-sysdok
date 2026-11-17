import BrowserOnly from "@docusaurus/BrowserOnly";
import { getFlow } from "@site/src/flytdiagrammer/flows/index.ts";

/** Viser én flyt. React Flow trenger nettleseren, så lerretet rendres ikke under bygg. */
export default function Flytdiagram({ flowId }: { flowId: string }) {
  const flow = getFlow(flowId);
  if (!flow) throw new Error(`Fant ikke flyten "${flowId}" i src/flytdiagrammer/flows/index.ts`);

  return (
    <BrowserOnly fallback={<p>Laster diagram …</p>}>
      {() => {
        const { FlowView } = require("./FlowView");
        return <FlowView flow={flow} />;
      }}
    </BrowserOnly>
  );
}
