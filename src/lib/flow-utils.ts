// src/utils/geofenceToFlow.ts
import { GeofenceColors, type GeofencePolygon } from "@/types";
import { type Node, type Edge } from "@xyflow/react";

export function convertGeofencesToFlow(
  geofences: GeofencePolygon[]
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  geofences.forEach((g) => {
    const color = GeofenceColors[g.data.type];

    nodes.push({
      id: g.id,
      data: { label: g.data.name },
      position: { x: Math.random() * 500, y: Math.random() * 300 }, // random layout for now
      style: {
        background: color,
        color: "#fff",
        fontSize: 12,
        padding: 8,
        borderRadius: 6,
        border: "1px solid #ccc",
      },
    });

    if (g.data.parentId) {
      edges.push({
        id: `e-${g.data.parentId}-${g.id}`,
        source: g.data.parentId,
        target: g.id,
        animated: false,
        style: { stroke: "#aaa" },
      });
    }
  });

  return { nodes, edges };
}
