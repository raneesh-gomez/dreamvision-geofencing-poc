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

interface GeofenceHierarchyProps {
  geofences: GeofencePolygon[];
}

const GeofenceHierarchy = ({ geofences }: GeofenceHierarchyProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  /* TODO Use ELKJS for automatic layout (arrange nodes and edges into tree structure) */
  useEffect(() => {
    const nodes: Node[] = geofences.map((g, index) => ({
      id: g.id,
      data: { label: `${g.data.name} (${GeofenceTypeLabels[g.data.type]})` },
      position: { x: 100 * index, y: 100 },
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
        height: 25
      },
      sourcePosition: Position.Top,    // Edge exits from top of child
      targetPosition: Position.Bottom, // Edge enters at bottom of parent
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
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: '#374151',
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
