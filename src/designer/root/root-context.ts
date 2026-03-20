import { createContext } from "react";

export interface RectangleNode {
    id: string;
    type: 'rectangle';
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    opacity: number;
}

export type CanvasNode = RectangleNode; // more node types will be added later

export interface RootContextValue {
    nodes: CanvasNode[];
    nodeMap: Map<string, CanvasNode>;

    addNode: (node: CanvasNode) => void;
    addNodes: (nodes: CanvasNode[]) => void;

    removeNode: (nodeId: string) => void;
    removeNodes: (nodeIds: string[]) => void;

    updateNode: (nodeId: string, update: Partial<CanvasNode>) => void;
    updateNodesTogether: (nodeIds: string[], sharedUpdate: Partial<CanvasNode>) => void;
    updateNodesSeparately: (nodeIds: string[], updateMap: Record<string, Partial<CanvasNode>>) => void;

    selectedNodeIds: string[];
    setSelectedNodeIds: (nodeIds: string[]) => void;
}

export const RootContext = createContext<RootContextValue | null>(null);