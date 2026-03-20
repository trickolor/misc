import { useCallback, useMemo, useState, type ReactNode } from "react";
import { RootContext, type CanvasNode } from "./root-context";
import { useMemoizedObject } from "@/hooks/use-memoized-object";
import { useList } from "@/hooks/use-list";

interface RootProps {
    children?: ReactNode;
}

export function Root({ children }: RootProps) {
    const [nodes, actions] = useList<CanvasNode>();
    const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

    const addNode = useCallback((node: CanvasNode) => {
        actions.push(node);
    }, [nodes]);

    const addNodes = useCallback((newNodes: CanvasNode[]) => {
        actions.push(...newNodes);
    }, [nodes]);

    const removeNode = useCallback((nodeId: string) => {
        actions.set(nodes.filter(node => node.id !== nodeId));
    }, [nodes, nodes]);

    const removeNodes = useCallback((nodeIds: string[]) => {
        actions.set(nodes.filter(node => !nodeIds.includes(node.id)));
    }, [nodes, nodes]);

    const updateNode = useCallback((nodeId: string, update: Partial<CanvasNode>) => {
        const index = nodes.findIndex(node => node.id === nodeId);
        if (index !== -1) {
            actions.updateAt(index, { ...nodes[index], ...update });
        }
    }, [nodes, nodes]);

    const updateNodesTogether = useCallback((nodeIds: string[], sharedUpdate: Partial<CanvasNode>) => {
        actions.set(nodes.map(node => nodeIds.includes(node.id) ? { ...node, ...sharedUpdate } : node));
    }, [nodes, nodes]);

    const updateNodesSeparately = useCallback((nodeIds: string[], updateMap: Record<string, Partial<CanvasNode>>) => {
        actions.set(nodes.map(node => nodeIds.includes(node.id) ? { ...node, ...updateMap[node.id] } : node));
    }, [nodes, nodes]);

    const nodeMap = useMemo(() => {
        return new Map(nodes.map(node => [node.id, node]));
    }, [nodes]);

    const value = useMemoizedObject({
        nodes,
        nodeMap,
        addNode,
        addNodes,
        removeNode,
        removeNodes,
        updateNode,
        updateNodesTogether,
        updateNodesSeparately,
        selectedNodeIds,
        setSelectedNodeIds,
    });

    return (
        <RootContext.Provider value={value}>
            {children}
        </RootContext.Provider>
    );
}

Root.displayName = 'Root';
