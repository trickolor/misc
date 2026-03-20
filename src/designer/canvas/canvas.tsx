import { useStrictContext } from "@/hooks/use-strict-context";
import { RootContext } from "../root/root-context";

import { CanvasNode } from "./canvas-node";

export function Canvas() {
    const { } = useStrictContext(RootContext);

    const DEBUG_NODE_ARRAY = [
        {
            id: '1',
            type: 'rectangle' as const,
            x: 0,
            y: 0,
            width: 100,
            height: 100,
            fill: '#FFFFFF',
            opacity: 1,
        }
    ]

    return (
        <div
            data-component="canvas"
            className="size-full relative"
        >
            {
                DEBUG_NODE_ARRAY.map(node => (
                    <CanvasNode key={node.id} {...node} />
                ))
            }
        </div>
    )
}