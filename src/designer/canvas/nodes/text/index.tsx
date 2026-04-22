import { CanvasNodeBase } from "../base";
import { TextNodeImpl } from "./impl";

export interface TextNodeProps {
    id: string;
    type: 'text';
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    opacity: number;
    rotation: number;

    content: string;
    font: string;
    fontSize: number;
    fontWeight: number;
    lineHeight: number;
    letterSpacing: number;
}

export function TextNode({
    content,
    font,
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
    ...base
}: TextNodeProps) {
    return (
        <CanvasNodeBase {...base}>
            <TextNodeImpl
                content={content}
                font={font}
                fontSize={fontSize}
                fontWeight={fontWeight}
                lineHeight={lineHeight}
                letterSpacing={letterSpacing}
            >
                <TextNodeImpl.View />
            </TextNodeImpl>
        </CanvasNodeBase>
    );
}

export const TextNodeContext = TextNodeImpl.Context;
