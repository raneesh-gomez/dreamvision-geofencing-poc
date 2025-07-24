import {
  ReactFlow,
  Background,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  Position,
  MarkerType
} from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';
import '@xyflow/react/dist/style.css';
import { type GeofencePolygon } from '@/types';
import { GeofenceColors, GeofenceTypeLabels } from '@/constants';
import { computeLayout } from '@/lib/organization-utils/layout-utils';

interface GeofenceHierarchyProps {
  geofences: GeofencePolygon[];
}

const GeofenceHierarchy = ({ geofences }: GeofenceHierarchyProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const layoutGraph = async () => {
        const layout = await computeLayout(geofences);

        const nodeMap = new Map<string, GeofencePolygon>();
        geofences.forEach(g => nodeMap.set(g.id, g));

        const nodes: Node[] = (layout.children ?? []).map((n) => {
            const g = nodeMap.get(n.id)!;
            return {
                id: n.id,
                position: { x: n.x ?? 0, y: n.y ?? 0 },
                data: { label: `${g.data.name} (${GeofenceTypeLabels[g.data.type]})` },
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    border: `2px solid ${GeofenceColors[g.data.type]}`,
                    borderRadius: 6,
                    padding: 10,
                    fontSize: 6,
                    width: 75,
                    height: 25,
                },
                sourcePosition: Position.Top,
                targetPosition: Position.Bottom,
            };
        });

        const edges: Edge[] = (layout.edges ?? []).map((e) => ({
            id: e.id,
            source: e.targets[0],
            target: e.sources[0],
            type: 'smoothstep',
            animated: true,
            style: {
                stroke: '#374151',
                strokeDasharray: '6 3',
            },
            markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 15,
                height: 15,
                color: '#374151',
            },
        }));

        setNodes(nodes);
        setEdges(edges);
    };

    layoutGraph();
  }, [geofences]);

  const onNodesChange = useCallback(
      (changes: NodeChange<Node>[]) => setNodes(nds => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
      (changes: EdgeChange<Edge>[]) => setEdges(eds => applyEdgeChanges(changes, eds)),
    []
  );

  return (
    <div className='mt-4 border rounded bg-white shadow-sm' style={{ width: '100%', height: 600 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodesDraggable
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default GeofenceHierarchy;
