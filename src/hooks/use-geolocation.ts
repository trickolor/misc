import { useEffect, useRef, useState } from "react";
import { useIsomorphicLayoutEffect } from "./use-isomoprhic-layout-effect";

interface GeolocationLoadingState {
    loading: true;
    error: undefined;
    latitude: undefined;
    longitude: undefined;
    accuracy: undefined;
    altitude: undefined;
    altitudeAccuracy: undefined;
    heading: undefined;
    speed: undefined;
    timestamp: undefined;
}

interface GeolocationErrorState {
    loading: false;
    error: GeolocationPositionError;
    latitude: undefined;
    longitude: undefined;
    accuracy: undefined;
    altitude: undefined;
    altitudeAccuracy: undefined;
    heading: undefined;
    speed: undefined;
    timestamp: undefined;
}

interface GeolocationSuccessState {
    loading: false;
    error: undefined;
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
    timestamp: number;
}

type GeolocationState =
    | GeolocationLoadingState
    | GeolocationErrorState
    | GeolocationSuccessState;


const LOADING_STATE: GeolocationLoadingState = {
    loading: true,
    error: undefined,
    latitude: undefined,
    longitude: undefined,
    accuracy: undefined,
    altitude: undefined,
    altitudeAccuracy: undefined,
    heading: undefined,
    speed: undefined,
    timestamp: undefined,
};

const ERROR_STATE: GeolocationErrorState = {
    loading: false,
    error: {
        code: 2,
        message: 'Geolocation is not supported by this browser.',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
    } as GeolocationPositionError,
    latitude: undefined,
    longitude: undefined,
    accuracy: undefined,
    altitude: undefined,
    altitudeAccuracy: undefined,
    heading: undefined,
    speed: undefined,
    timestamp: undefined,
};

const IS_SUPPORTED = typeof navigator !== 'undefined' && 'geolocation' in navigator;

export function useGeolocation(options?: PositionOptions): GeolocationState {
    const optionsKey = JSON.stringify(options);
    const optionsRef = useRef(options);

    useIsomorphicLayoutEffect(() => {
        optionsRef.current = options;
    });

    const [[prevOptionsKey, state], setTrackedState] = useState<[string, GeolocationState]>(
        () => [optionsKey, IS_SUPPORTED ? LOADING_STATE : ERROR_STATE]
    );

    if (prevOptionsKey !== optionsKey)
        setTrackedState([optionsKey, LOADING_STATE]);

    useEffect(() => {
        if (!IS_SUPPORTED) return;

        const onSuccess = ({ coords, timestamp }: GeolocationPosition) => setTrackedState([optionsKey, {
            loading: false,
            error: undefined,
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            altitude: coords.altitude,
            altitudeAccuracy: coords.altitudeAccuracy,
            heading: coords.heading,
            speed: coords.speed,
            timestamp,
        }]);

        const onError = (error: GeolocationPositionError) => setTrackedState([optionsKey, {
            loading: false,
            error,
            latitude: undefined,
            longitude: undefined,
            accuracy: undefined,
            altitude: undefined,
            altitudeAccuracy: undefined,
            heading: undefined,
            speed: undefined,
            timestamp: undefined,
        }]);

        const watchId = navigator.geolocation
            .watchPosition(onSuccess, onError, optionsRef.current);

        return () => navigator.geolocation.clearWatch(watchId);
    }, [optionsKey]);

    return state;
}
