import { useCallback, useEffect, useState } from "react";
import { useEventListener } from "./use-event-listener";

const IS_SERVER = typeof window === 'undefined';

type NetworkEffectiveType = 'slow-2g' | '2g' | '3g' | '4g';
type NetworkType = 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown';

interface NetworkInformation extends EventTarget {
    readonly downlink?: number;
    readonly downlinkMax?: number;
    readonly effectiveType?: NetworkEffectiveType;
    readonly rtt?: number;
    readonly saveData?: boolean;
    readonly type?: NetworkType;
    onchange: ((event: Event) => void) | null;
}

interface NavigatorWithConnection extends Navigator {
    readonly connection?: NetworkInformation;
}

export interface NetworkState {
    online: boolean;
    downlink?: number;
    downlinkMax?: number;
    effectiveType?: NetworkEffectiveType;
    rtt?: number;
    saveData?: boolean;
    type?: NetworkType;
}

const readNetworkState = (): NetworkState => {
    if (IS_SERVER) return { online: true };

    const connection = (navigator as NavigatorWithConnection).connection;

    return {
        online: navigator.onLine,
        downlink: connection?.downlink,
        downlinkMax: connection?.downlinkMax,
        effectiveType: connection?.effectiveType,
        rtt: connection?.rtt,
        saveData: connection?.saveData,
        type: connection?.type,
    };
};

export function useNetworkState(): NetworkState {
    const [state, setState] = useState<NetworkState>(readNetworkState);

    const handleChange = useCallback(() => {
        setState(readNetworkState());
    }, []);

    useEventListener({ event: 'online', handler: handleChange });
    useEventListener({ event: 'offline', handler: handleChange });

    useEffect(() => {
        const connection = (navigator as NavigatorWithConnection).connection;
        if (!connection) return;

        connection.addEventListener('change', handleChange);
        return () => connection.removeEventListener('change', handleChange);
    }, [handleChange]);

    return state;
}
