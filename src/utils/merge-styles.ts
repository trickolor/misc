import { type CSSProperties } from "react";

export function mergeStyles(...styles: (CSSProperties | undefined | null)[]): CSSProperties {
    return Object.assign({}, ...styles.filter(Boolean));
}
