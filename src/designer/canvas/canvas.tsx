import { useStrictContext } from "@/hooks/use-strict-context";
import { useKeyPress } from "@/hooks/use-key-press";

import { RootContext } from "../root/context";
import type { CanvasNode } from "../root/types";
import { RectangleNode } from "./nodes/rectangle";
import { TextNode } from "./nodes/text";
import { LineNode } from "./nodes/line";

import {
    TEST_LINE_NODE,
    TEST_RECTANGLE_NODE,
    TEST_TEXT_NODE,
} from "./constants";

export function Canvas() {
    const { addNode, nodes } = useStrictContext(RootContext);

    useKeyPress('1', () => {
        addNode({ ...TEST_RECTANGLE_NODE, id: crypto.randomUUID() });
    });

    useKeyPress('2', () => {
        addNode({ ...TEST_TEXT_NODE, id: crypto.randomUUID() });
    });

    useKeyPress('3', () => {
        addNode({ ...TEST_LINE_NODE, id: crypto.randomUUID() });
    });

    const SpecificCanvasNode = (node: CanvasNode) => {
        switch (node.type) {
            case 'rectangle': return <RectangleNode key={node.id} {...node} />;
            case 'text': return <TextNode key={node.id} {...node} />;
            case 'line': return <LineNode key={node.id} {...node} />;
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
