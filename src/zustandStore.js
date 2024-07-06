import create from 'zustand';
import { devtools } from 'zustand/middleware';

// Create a store with Zustand
const useStore = create(
  devtools((set) => ({
    nodes: [],
    setNodes: (nodes) => set({ nodes }),
    edges: [],
    setEdges: (edges) => set({ edges }),
    nodeId: 0,
    setNodeId: (nodeId) => set({ nodeId }),
  }))
);

export { useStore };
