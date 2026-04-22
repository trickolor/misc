import type { ReactNode } from "react";

import { CanvasNodeBaseImpl } from "../impl";
import { ENDPOINTS } from "../constants";

export interface CanvasNodeLineBaseProps {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    opacity: number;
    rotation: number;
    children?: ReactNode;
}

export function CanvasNodeLineBase({ children, ...rest }: CanvasNodeLineBaseProps) {
    return (
        <CanvasNodeBaseImpl {...rest}>
            <CanvasNodeBaseImpl.Area>
                {children}
                {ENDPOINTS.map(endpoint => (
                    <CanvasNodeBaseImpl.EndpointRotation key={`rot-${endpoint}`} endpoint={endpoint} />
                ))}
                {ENDPOINTS.map(endpoint => (
                    <CanvasNodeBaseImpl.EndpointResizer key={`res-${endpoint}`} endpoint={endpoint} />
                ))}
            </CanvasNodeBaseImpl.Area>
        </CanvasNodeBaseImpl>
    );
}
