import { useContext, type Context } from "react";

export function useStrictContext<T>(context: Context<T | null>): T {
    const value = useContext(context);
    if (!value) throw new Error('A context can not be used outside of its Provider component.');
    return value;
}