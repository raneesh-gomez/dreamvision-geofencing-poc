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
} from '@xyflow/react';
import { useCallback, useEffect, useState } from 'react';
import '@xyflow/react/dist/style.css';
import { GeofenceColors, type GeofencePolygon } from '@/types';

export default function GeofenceFlow({ geofences }: { geofences: GeofencePolygon[] }) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  useEffect(() => {
    const nodes: Node[] = geofences.map((g, index) => ({
      id: g.id,
      data: { label: g.data.name },
      position: { x: 100 * index, y: 100 },
      style: { 
        border: `2px solid ${GeofenceColors[g.data.type]}`,
        borderRadius: 6,
        padding: 10,
        fontSize: 6,
        width: 75,
        height: 25 
      },
    }));

    const edges: Edge[] = geofences
      .filter(g => g.data.parentId)
      .map(g => ({
        id: `e-${g.data.parentId}-${g.id}`,
        target: g.data.parentId!,
        source: g.id,
        type: 'smoothstep',
        animated: true,
        style: {
            stroke: '#374151',
            strokeDasharray: '6 3',
        },
      }));

    setNodes(nodes);
    setEdges(edges);
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
    <div className='mt-4 border rounded bg-white' style={{ width: '100%', height: 750 }}>
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
}
