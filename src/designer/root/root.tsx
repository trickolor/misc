import { useCallback, useMemo, type ReactNode } from "react";
import { useMemoizedObject } from "@/hooks/use-memoized-object";
import { useList } from "@/hooks/use-list";
import { useSet } from "@/hooks/use-set";

import { RootContext } from "./context";
import type { CanvasNode } from "./types";

interface RootProps {
    children?: ReactNode;
}

export function Root({ children }: RootProps) {
    const [nodes, nodeActions] = useList<CanvasNode>();
    const [ids, idActions] = useSet<string>();

    const { push: pushNodes, set: setNodes } = nodeActions;
    const { add: addId, delete: deleteId } = idActions;

    // ---------- selection ---------- //

    const selectedNodeIds = useMemo<ReadonlyArray<string>>(() => {
        return Array.from(ids);
    }, [ids]);

    const addSelectedNodeId = useCallback((id: string) => {
        addId(id);
    }, [addId]);

    const addSelectedNodeIds = useCallback((newIds: string[]) => {
        addId(...newIds);
    }, [addId]);

    const removeSelectedNodeId = useCallback((id: string) => {
        deleteId(id);
    }, [deleteId]);

    const removeSelectedNodeIds = useCallback((idsToRemove: string[]) => {
        idsToRemove.forEach(deleteId);
    }, [deleteId]);

    // ---------- nodes ---------- //

    const addNode = useCallback((node: CanvasNode) => {
        pushNodes(node);
    }, [pushNodes]);

    const addNodes = useCallback((newNodes: CanvasNode[]) => {
        pushNodes(...newNodes);
    }, [pushNodes]);

    const removeNode = useCallback((nodeId: string) => {
        setNodes(prev => prev.filter(node => node.id !== nodeId));
    }, [setNodes]);

    const removeNodes = useCallback((nodeIds: string[]) => {
        setNodes(prev => prev.filter(node => !nodeIds.includes(node.id)));
    }, [setNodes]);

    const updateNode = useCallback((nodeId: string, update: Partial<CanvasNode>) => {
        setNodes(prev => {
            const index = prev.findIndex(node => node.id === nodeId);
            if (index === -1) return prev;
            const next = prev.slice();
            next[index] = { ...prev[index], ...update } as CanvasNode;
            return next;
        });
    }, [setNodes]);

    const updateNodesTogether = useCallback((nodeIds: string[], sharedUpdate: Partial<CanvasNode>) => {
        setNodes(prev => prev.map(node =>
            nodeIds.includes(node.id) ? { ...node, ...sharedUpdate } as CanvasNode : node
        ));
    }, [setNodes]);

    const updateNodesSeparately = useCallback((nodeIds: string[], updateMap: Record<string, Partial<CanvasNode>>) => {
        setNodes(prev => prev.map(node => {
            if (!nodeIds.includes(node.id)) return node;
            const update = updateMap[node.id];
            return update ? { ...node, ...update } as CanvasNode : node;
        }));
    }, [setNodes]);

    // ---------- derived ---------- //

    const nodeMap = useMemo(() => {
        return new Map(nodes.map(node => [node.id, node]));
    }, [nodes]);

    // ---------- context ---------- //

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
