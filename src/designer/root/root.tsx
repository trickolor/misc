import { useCallback, useMemo, type ReactNode } from "react";
import { useMemoizedObject } from "@/hooks/use-memoized-object";
import { useList } from "@/hooks/use-list";
import { useSet } from "@/hooks/use-set";

import { RootContext, type CanvasNode } from "./root-context";

interface RootProps {
    children?: ReactNode;
}

export function Root({ children }: RootProps) {
    const [nodes, nodeListActions] = useList<CanvasNode>();
    const [ids, idSetActions] = useSet<string>();

    const selectedNodeIds = useMemo<ReadonlyArray<string>>(() => {
        return Array.from(ids);
    }, [ids]);

    const addSelectedNodeId = useCallback((id: string) => {
        idSetActions.add(id);
    }, [idSetActions.add]);

    const addSelectedNodeIds = useCallback((ids: string[]) => {
        idSetActions.add(...ids);
    }, [idSetActions.add]);

    const removeSelectedNodeId = useCallback((id: string) => {
        idSetActions.delete(id);
    }, [idSetActions.delete]);

    const removeSelectedNodeIds = useCallback((ids: string[]) => {
        ids.forEach(id => idSetActions.delete(id));
    }, [idSetActions.delete]);

    const addNode = useCallback((node: CanvasNode) => {
        nodeListActions.push(node);
    }, [nodes]);

    const addNodes = useCallback((newNodes: CanvasNode[]) => {
        nodeListActions.push(...newNodes);
    }, [nodes]);

    const removeNode = useCallback((nodeId: string) => {
        nodeListActions.set(nodes.filter(node => node.id !== nodeId));
    }, [nodes, nodes]);

    const removeNodes = useCallback((nodeIds: string[]) => {
        nodeListActions.set(nodes.filter(node => !nodeIds.includes(node.id)));
    }, [nodes, nodes]);

    const updateNode = useCallback((nodeId: string, update: Partial<CanvasNode>) => {
        const index = nodes.findIndex(node => node.id === nodeId);
        if (index !== -1) {
            nodeListActions.updateAt(index, { ...nodes[index], ...update });
        }
    }, [nodes, nodes]);

    const updateNodesTogether = useCallback((nodeIds: string[], sharedUpdate: Partial<CanvasNode>) => {
        nodeListActions.set(nodes.map(node => nodeIds.includes(node.id) ? { ...node, ...sharedUpdate } : node));
    }, [nodes, nodes]);

    const updateNodesSeparately = useCallback((nodeIds: string[], updateMap: Record<string, Partial<CanvasNode>>) => {
        nodeListActions.set(nodes.map(node => nodeIds.includes(node.id) ? { ...node, ...updateMap[node.id] } : node));
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

        addSelectedNodeId,
        addSelectedNodeIds,
        removeSelectedNodeId,
        removeSelectedNodeIds,
    });

    return (
        <RootContext.Provider value={value}>
            {children}
        </RootContext.Provider>
    );
}

Root.displayName = 'Root';
