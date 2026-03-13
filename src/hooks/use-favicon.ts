import { useIsomorphicLayoutEffect } from "./use-isomoprhic-layout-effect";

const IS_SERVER = typeof document === 'undefined';

export function useFavicon(href: string) {
    useIsomorphicLayoutEffect(() => {
        if (IS_SERVER) return;

        let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');

        if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
        }

        link.href = href;
    }, [href]);
}
