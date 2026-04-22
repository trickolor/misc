import { useStrictContext } from "@/hooks/use-strict-context";
import { RootContext, type CanvasNode } from "../root/root-context";
import { RectangleCanvasNode, type RectangleCanvasNodeProps } from "./rectangle-canvas-node";
import { useKeyPress } from "@/hooks/use-key-press";

const TEST_NODE: RectangleCanvasNodeProps = {
    id: 'test',
    type: 'rectangle',
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    fill: '#FFFFFF',
    opacity: 1,
    rotation: 0,
};

export function Canvas() {
    const { addNode, nodes } = useStrictContext(RootContext);

    useKeyPress('Enter', () => {
        addNode({ ...TEST_NODE, id: crypto.randomUUID() });
    });

    const SpecificCanvasNode = (node: CanvasNode) => {
        switch (node.type) {
            case 'rectangle': return <RectangleCanvasNode key={node.id} {...node} />;
            default: return null;
        }
    };

    return (
        <div
            data-component="canvas"
            className="size-full relative"
        >
            {[...nodes].map(SpecificCanvasNode)}
        </div>
    )
}