import type { Edge, EdgeTypes } from "reactflow";

export const initialEdges: Edge[] = [
  { id: "a->c", source: "a", target: "c", animated: true },
  { id: "b->d", source: "b", target: "d" },
  { id: "c->d", source: "c", target: "d", animated: true },
];

export const edgeTypes: EdgeTypes = {
  // Add your custom edge types here!
};
