import { createContext } from "react";

export interface CanvasNodeBase<T extends string> {
    id: string;
    type: T;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    opacity: number;
    rotation: number;
}

export interface RectangleCanvasNode extends CanvasNodeBase<'rectangle'> { }
export interface TextCanvasNode extends CanvasNodeBase<'text'> { }
export interface LineCanvasNode extends CanvasNodeBase<'line'> { }
export interface ArrowCanvasNode extends CanvasNodeBase<'arrow'> { }
export interface EllipseCanvasNode extends CanvasNodeBase<'ellipse'> { }
export interface PolygonCanvasNode extends CanvasNodeBase<'polygon'> { }
export interface StarCanvasNode extends CanvasNodeBase<'star'> { }
export interface ImageCanvasNode extends CanvasNodeBase<'image'> { }
export interface VideoCanvasNode extends CanvasNodeBase<'video'> { }
export interface VectorCanvasNode extends CanvasNodeBase<'vector'> { }

export type CanvasNode =
    | RectangleCanvasNode
    | TextCanvasNode
    | LineCanvasNode
    | ArrowCanvasNode
    | EllipseCanvasNode
    | PolygonCanvasNode
    | StarCanvasNode
    | ImageCanvasNode
    | VideoCanvasNode
    | VectorCanvasNode;

export type CanvasNodeType = CanvasNode['type'];

export interface CanvasNodeTypeMap extends Record<CanvasNodeType, CanvasNode> {
    rectangle: RectangleCanvasNode;
    text: TextCanvasNode;
    line: LineCanvasNode;
    arrow: ArrowCanvasNode;
    ellipse: EllipseCanvasNode;
    polygon: PolygonCanvasNode;
    star: StarCanvasNode;
    image: ImageCanvasNode;
    video: VideoCanvasNode;
    vector: VectorCanvasNode;
}

export interface RootContextValue {
    nodes: ReadonlyArray<CanvasNode>;
    nodeMap: Map<string, CanvasNode>;

    addNode: (node: CanvasNode) => void;
    addNodes: (nodes: CanvasNode[]) => void;

    removeNode: (nodeId: string) => void;
    removeNodes: (nodeIds: string[]) => void;

    updateNode: (nodeId: string, update: Partial<CanvasNode>) => void;
    updateNodesTogether: (nodeIds: string[], sharedUpdate: Partial<CanvasNode>) => void;
    updateNodesSeparately: (nodeIds: string[], updateMap: Record<string, Partial<CanvasNode>>) => void;

    selectedNodeIds: ReadonlyArray<string>;
    addSelectedNodeId: (id: string) => void;
    addSelectedNodeIds: (ids: string[]) => void;
    removeSelectedNodeId: (id: string) => void;
    removeSelectedNodeIds: (ids: string[]) => void;
}

export const RootContext = createContext<RootContextValue | null>(null);