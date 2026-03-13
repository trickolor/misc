type AnyEventHandler<E extends Event = Event> = ((event: E) => void) | undefined;

export function composeEventHandlers<E extends Event = Event>(
    original: AnyEventHandler<E>,
    override: AnyEventHandler<E>,
    { checkDefaultPrevented = true } = {},
): (event: E) => void {
    return (event: E) => {
        original?.(event);
        if (!checkDefaultPrevented || !event.defaultPrevented) override?.(event);
    };
}
