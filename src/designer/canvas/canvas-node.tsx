import type { CanvasNode } from "../root/root-context";

export function CanvasNode({ id, type, x, y, width, height, fill, opacity }: CanvasNode) {
    if (type === 'rectangle') return (
        <div
            data-component="canvas-node"
            data-node-id={id}
            data-node-type={type}
            className="absolute"

            style={{
                left: x, top: y,
                width, height,
                backgroundColor: fill,
                opacity,
            }}
        />
    );

    return null;
}