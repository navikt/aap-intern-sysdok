import { Handle, type Node, type NodeProps, Position } from "@xyflow/react";
import type { NodeKind } from "@site/src/flytdiagrammer/flows/types.ts";
import styles from "./styles.module.css";

export type FlowBoxData = {
  label: string;
  kind: NodeKind;
  temporary: boolean;
  query?: "whole" | "part";
  selected: boolean;
  onOpen: () => void;
};

export type FlowBoxNode = Node<FlowBoxData, "flowBox">;

export const kindLabel: Record<NodeKind, string> = {
  start: "Start",
  end: "Slutt",
  process: "Steg",
  decision: "Valg",
  database: "Database",
  external: "Ekstern",
};

export const queryLabel: Record<"whole" | "part", string> = {
  whole: "Hele spørringen",
  part: "Del av spørringen",
};

export function FlowBox({ data }: NodeProps<FlowBoxNode>) {
  return (
    <>
      <Handle type="target" position={Position.Top} id="top" />
      <Handle type="target" position={Position.Left} id="left" />
      <button
        type="button"
        className={styles.node}
        data-kind={data.kind}
        data-temporary={data.temporary || undefined}
        data-query={data.query}
        data-selected={data.selected}
        aria-haspopup="dialog"
        onClick={data.onOpen}
      >
        <span>
          {data.temporary && <span className={styles.temporaryTag}>Midlertidig</span>}
          {data.query && <span className={styles.queryTag}>{queryLabel[data.query]}</span>}
          {data.label}
        </span>
      </button>
      <Handle type="source" position={Position.Bottom} id="bottom" />
      <Handle type="source" position={Position.Right} id="right" />
    </>
  );
}
