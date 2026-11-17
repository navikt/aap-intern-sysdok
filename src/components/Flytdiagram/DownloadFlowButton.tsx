import { useReactFlow } from "@xyflow/react";
import { toCanvas } from "html-to-image";
import { useState } from "react";

const PADDING = 48;
const PIXEL_RATIO = 2;
const TITLE_FONT_SIZE = 28;
// Plass over diagrammet til tittelen. Diagrammet har selv PADDING i toppen.
const TITLE_HEIGHT = PADDING + TITLE_FONT_SIZE;

/** Laster ned hele flyten som PNG, uavhengig av zoom og panorering i visningen. */
export function DownloadFlowButton({
  flowId,
  title,
  container,
}: {
  flowId: string;
  title: string;
  container: () => HTMLElement | null;
}) {
  const { getNodes, getNodesBounds } = useReactFlow();
  const [loading, setLoading] = useState(false);

  async function download() {
    const viewport = container()?.querySelector<HTMLElement>(".react-flow__viewport");
    if (!viewport) return;
    setLoading(true);
    try {
      // Bruk instansmetoden med id-er. Den leser målte størrelser fra React Flow. Nodene vi sender inn
      // har ikke `measured`, så den frittstående getNodesBounds regner dem som 0 px brede og kutter bildet.
      const bounds = getNodesBounds(getNodes().map((node) => node.id));
      const width = Math.ceil(bounds.width + PADDING * 2);
      const height = Math.ceil(bounds.height + PADDING * 2);
      const root = getComputedStyle(document.documentElement);
      const background = root.getPropertyValue("--ifm-background-surface-color").trim() || "#fff";
      const textColor = root.getPropertyValue("--ifm-font-color-base").trim() || "#1c1e21";
      const fontFamily = root.getPropertyValue("--ifm-font-family-base").trim() || "sans-serif";

      const diagram = await toCanvas(viewport, {
        width,
        height,
        pixelRatio: PIXEL_RATIO,
        backgroundColor: background,
        // Flytt og skaler slik at hele flyten havner i bildet, uansett hva brukeren ser nå.
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${PADDING - bounds.x}px, ${PADDING - bounds.y}px) scale(1)`,
        },
        filter: (node) => !(node instanceof HTMLElement && node.classList.contains("react-flow__handle")),
      });

      const image = document.createElement("canvas");
      image.width = diagram.width;
      image.height = diagram.height + TITLE_HEIGHT * PIXEL_RATIO;
      const ctx = image.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, image.width, image.height);
      ctx.fillStyle = textColor;
      ctx.font = `600 ${TITLE_FONT_SIZE * PIXEL_RATIO}px ${fontFamily}`;
      ctx.textBaseline = "top";
      ctx.fillText(title, PADDING * PIXEL_RATIO, PADDING * PIXEL_RATIO);
      ctx.drawImage(diagram, 0, TITLE_HEIGHT * PIXEL_RATIO);

      const link = document.createElement("a");
      link.download = `${flowId}.png`;
      link.href = image.toDataURL("image/png");
      link.click();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className="button button--secondary button--sm"
      disabled={loading}
      onClick={download}
    >
      {loading ? "Lager bilde …" : "Last ned som bilde"}
    </button>
  );
}
