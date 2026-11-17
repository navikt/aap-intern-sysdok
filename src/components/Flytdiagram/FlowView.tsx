import "@xyflow/react/dist/style.css";
import {
  Background,
  Controls,
  type Edge,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { useMemo, useRef, useState } from "react";
import type { Flow } from "@site/src/flytdiagrammer/flows/types.ts";
import { DownloadFlowButton } from "./DownloadFlowButton";
import { FlowBox, type FlowBoxNode } from "./FlowBox";
import { NodeDetails } from "./NodeDetails";
import styles from "./styles.module.css";

const nodeTypes = { flowBox: FlowBox };

// Provideren gjør flyten tilgjengelig for nedlastingsknappen, som ligger utenfor lerretet.
export function FlowView({ flow }: { flow: Flow }) {
  return (
    <ReactFlowProvider>
      <FlowCanvas flow={flow} />
    </ReactFlowProvider>
  );
}

function FlowCanvas({ flow }: { flow: Flow }) {
  const [selectedId, setSelectedId] = useState<string>();
  const canvasRef = useRef<HTMLDivElement>(null);
  const selected = flow.nodes.find((node) => node.id === selectedId);

  const nodes = useMemo<FlowBoxNode[]>(
    () =>
      flow.nodes.map((node) => ({
        id: node.id,
        type: "flowBox",
        position: node.position,
        data: {
          label: node.label,
          kind: node.kind,
          selected: node.id === selectedId,
          onOpen: () => setSelectedId(node.id),
        },
      })),
    [flow, selectedId],
  );

  const edges = useMemo<Edge[]>(() => {
    const byId = new Map(flow.nodes.map((node) => [node.id, node]));
    return flow.edges.map((edge, i) => {
      const from = byId.get(edge.from)!.position;
      const to = byId.get(edge.to)!.position;
      // Samme rad: koble side mot side. Ellers fra bunn til topp.
      const sideways = Math.abs(from.y - to.y) < 50 && to.x > from.x;
      return {
        id: `e${i}-${edge.from}-${edge.to}`,
        source: edge.from,
        target: edge.to,
        sourceHandle: sideways ? "right" : "bottom",
        targetHandle: sideways ? "left" : "top",
        label: edge.label,
        animated: edge.async,
        style: edge.async ? { strokeDasharray: "6 4" } : undefined,
        // Markøren skaleres med strekbredden (2), så 10 gir en pil på 20 px.
        markerEnd: { type: MarkerType.ArrowClosed, width: 10, height: 10, strokeWidth: 2 },
        type: "smoothstep",
      };
    });
  }, [flow]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <span>Klikk på en boks for detaljer.</span>
        <DownloadFlowButton
          flowId={flow.id}
          title={flow.title}
          container={() => canvasRef.current}
        />
      </div>
      <div ref={canvasRef} className={styles.canvas}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable={false}
          onNodeClick={(_, node) => setSelectedId(node.id)}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
      <NodeDetails node={selected} onClose={() => setSelectedId(undefined)} />
    </div>
  );
}
