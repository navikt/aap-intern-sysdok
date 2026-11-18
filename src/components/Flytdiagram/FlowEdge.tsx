import { BaseEdge, type EdgeProps, getSmoothStepPath, Position } from "@xyflow/react";

// Etiketten legges rett ved utgangen fra kilden, ikke midt på pilen.
// Da er det tydelig hvilket valg «ja» og «nei» hører til, også når flere piler møtes.
export function FlowEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  label,
  markerEnd,
  style,
}: EdgeProps) {
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  const labelX = sourcePosition === Position.Right ? sourceX + 32 : sourceX;
  const labelY = sourcePosition === Position.Right ? sourceY : sourceY + 20;

  return (
    <BaseEdge
      path={path}
      markerEnd={markerEnd}
      style={style}
      label={label}
      labelX={labelX}
      labelY={labelY}
      labelShowBg
      labelBgPadding={[4, 2]}
      labelBgBorderRadius={4}
    />
  );
}
