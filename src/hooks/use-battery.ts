import { useEffect, useState } from "react";

interface BatteryManager extends EventTarget {
    readonly charging: boolean;
    readonly chargingTime: number;
    readonly dischargingTime: number;
    readonly level: number;
    onchargingchange: ((event: Event) => void) | null;
    onchargingtimechange: ((event: Event) => void) | null;
    ondischargingtimechange: ((event: Event) => void) | null;
    onlevelchange: ((event: Event) => void) | null;
}

interface NavigatorWithBattery extends Navigator {
    getBattery: () => Promise<BatteryManager>;
}

type BatteryState =
    | {
        supported: false;
        loading: false;
    }

    | {
        supported: true;
        loading: true;
    }

    | {
        supported: true;
        loading: false;
        level: number;
        charging: boolean;
        chargingTime: number;
        dischargingTime: number;
    }

const IS_SERVER = typeof navigator === 'undefined';

const BATTERY_EVENTS = ['levelchange', 'chargingchange', 'chargingtimechange', 'dischargingtimechange'] as const;

export function useBattery(): BatteryState {
    const [state, setState] = useState<BatteryState>(() => {
        if (IS_SERVER || !('getBattery' in navigator)) return { supported: false, loading: false };
        return { supported: true, loading: true };
    });

    useEffect(() => {
        if (IS_SERVER || !('getBattery' in navigator)) return;

        let resolvedBattery: BatteryManager | null = null;

        const updateState = () => {
            if (!resolvedBattery) return;

            setState({
                supported: true,
                loading: false,
                level: resolvedBattery.level,
                charging: resolvedBattery.charging,
                chargingTime: resolvedBattery.chargingTime,
                dischargingTime: resolvedBattery.dischargingTime,
            });
        };

        (navigator as NavigatorWithBattery).getBattery().then(battery => {
            resolvedBattery = battery;
            updateState();

            BATTERY_EVENTS.forEach(event => {
                resolvedBattery?.addEventListener(event, updateState);
            });
        });

        return () => BATTERY_EVENTS.forEach(event => {
            resolvedBattery?.removeEventListener(event, updateState);
        });
    }, []);

    return state;
}
