import React from "react";

/*
 * Camera overlay settings (LiberVac addition — the camera is a pure frontend overlay fed
 * by go2rtc, not a backend capability, so its config lives in localStorage). Shared by the
 * Robot -> General -> Camera settings UI and the CameraOverlay on the home screen.
 */
const STORAGE_KEY = "valetudo_camera_config";
const CHANGE_EVENT = "valetudo_camera_config_changed";

export interface CameraSettings {
    enabled: boolean;
    url: string;
}

// The default stream URL = go2rtc's built-in player on this host (WebRTC with MSE
// fallback), i.e. exactly what the overlay used before this setting existed.
export const defaultCameraUrl = (): string => {
    return `http://${window.location.hostname}:1984/stream.html?src=cam&mode=webrtc,mse`;
};

interface StoredCameraSettings {
    enabled?: boolean;
    url?: string;
}

const readStored = (): StoredCameraSettings => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            return JSON.parse(raw);
        }
    } catch (e) {
        /* ignore */
    }

    return {};
};

export const getCameraSettings = (): CameraSettings => {
    const stored = readStored();

    return {
        enabled: stored.enabled ?? true,
        // An empty/absent stored url resolves to the computed default, so the default
        // tracks the current host instead of baking in a hostname.
        url: stored.url && stored.url.trim() ? stored.url : defaultCameraUrl(),
    };
};

export const setCameraSettings = (patch: Partial<StoredCameraSettings>): void => {
    const next = {...readStored(), ...patch};
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
        /* ignore */
    }
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
};

// Reactive accessor: re-renders consumers when the settings change (same tab via the
// custom event, other tabs via the storage event).
export const useCameraSettings = (): CameraSettings => {
    const [settings, setSettings] = React.useState<CameraSettings>(getCameraSettings);

    React.useEffect(() => {
        const handler = (): void => setSettings(getCameraSettings());
        window.addEventListener(CHANGE_EVENT, handler);
        window.addEventListener("storage", handler);

        return () => {
            window.removeEventListener(CHANGE_EVENT, handler);
            window.removeEventListener("storage", handler);
        };
    }, []);

    return settings;
};
