/**
 * Datamodell for flytdiagrammer. Alle flyter er hardkodet i src/flytdiagrammer/flows/.
 * Se .agents/skills/update-flow-diagram/SKILL.md for hvordan du endrer dem.
 */

export type NodeKind =
  | "start"
  | "process"
  | "decision"
  | "database"
  | "external"
  | "end";

export type CodeLanguage =
  | "sql"
  | "kotlin"
  | "typescript"
  | "json"
  | "yaml"
  | "bash"
  | "text";

export type DetailBlock =
  /** Avsnitt skilles med en tom linje. Backticks gir inline-kode. */
  | { type: "text"; content: string }
  | { type: "code"; language: CodeLanguage; code: string; title?: string };

export interface FlowNode {
  /** Unik i flyten, kebab-case. Brukes av piler. */
  id: string;
  /** Enkelt navn, 1–4 ord. Det eneste som vises i boksen. */
  label: string;
  kind: NodeKind;
  /** Øvre venstre hjørne i piksler. Bruk rutenettet beskrevet i skillen. */
  position: { x: number; y: number };
  /** Én setning øverst i detaljpanelet. Vises ikke i boksen. */
  summary?: string;
  /** Vises i detaljpanelet når boksen klikkes. */
  details: DetailBlock[];
}

export interface FlowEdge {
  /** Node-id. */
  from: string;
  /** Node-id. */
  to: string;
  /** Valgfri tekst på pilen, f.eks. "ja" / "nei". */
  label?: string;
  /** Stiplet, animert linje for asynkrone kall (Kafka, planlagte jobber). */
  async?: boolean;
}

export interface Flow {
  /** Brukes i URL-en og som filnavn på MDX-siden i docs/funksjonalitet/12_Postmottak/flytdiagrammer/. kebab-case. */
  id: string;
  title: string;
  description: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}
