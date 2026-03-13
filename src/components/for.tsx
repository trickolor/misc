import { type ReactNode } from "react";

interface ForProps<T> {
    each: T[];
    children: (item: T, index: number, array: T[]) => ReactNode;
    fallback?: ReactNode;
}

export function For<T>({ each, children, fallback }: ForProps<T>) {
    return (
        <>
            {
                each.length > 0
                    ? each.map((item, index, array) => children(item, index, array))
                    : fallback
            }
        </>
    );
}
