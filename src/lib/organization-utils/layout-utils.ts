import type { GeofencePolygon } from '@/types';
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

export const computeLayout = async (geofences: GeofencePolygon[]) => {
  const nodes = geofences.map((g) => ({
    id: g.id,
    width: 100,
    height: 50,
    labels: [{ text: g.data.name }],
  }));

  const edges = geofences
  .filter(g => g.data.parentId)
  .map(g => ({
    id: `e-${g.data.parentId}-${g.id}`,
    sources: [g.data.parentId!],
    targets: [g.id],
  }));

  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.layered.spacing.nodeNodeBetweenLayers': '30',
      'elk.spacing.nodeNode': '30',
    },
    children: nodes,
    edges,
  };

  const layout = await elk.layout(elkGraph);

  return layout;
};
