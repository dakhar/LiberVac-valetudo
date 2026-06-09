import React from "react";
import {Box, IconButton, Paper, Tooltip} from "@mui/material";
import {
    Videocam as CameraIcon,
    Close as CloseIcon,
    OpenInFull as ExpandIcon,
    CloseFullscreen as ShrinkIcon,
} from "@mui/icons-material";
import {useTranslation} from "react-i18next";
import {useCameraSettings} from "./cameraSettings";

const STORAGE_KEY = "valetudo_camera_overlay";

/*
 * Picture-in-picture camera overlay for the V16 (libervac-agent serves RTSP on :8554,
 * go2rtc on :1984 bridges it to WebRTC/MSE for the browser). The iframe points at
 * go2rtc's built-in player on the same host. go2rtc pulls the RTSP stream on-demand,
 * so the encoder only runs while the overlay is open.
 *
 * To proxy go2rtc through Valetudo's own webserver instead of hitting :1984 directly,
 * change CAMERA_SRC to a same-origin path (e.g. "/_camera/stream.html?...").
 */
interface OverlayState {
    open: boolean;
    large: boolean;
}

const loadState = (): OverlayState => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
            return {open: false, large: false, ...JSON.parse(raw)};
        }
    } catch (e) {
        /* ignore */
    }

    return {open: false, large: false};
};

const CameraOverlay = (): React.ReactElement => {
    const {t} = useTranslation();
    const camera = useCameraSettings();
    const [state, setState] = React.useState<OverlayState>(loadState);

    const update = React.useCallback((patch: Partial<OverlayState>) => {
        setState((prev) => {
            const next = {...prev, ...patch};
            try {
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            } catch (e) {
                /* ignore */
            }

            return next;
        });
    }, []);

    if (!camera.enabled) {
        return <></>;
    }

    if (!state.open) {
        return (
            <Box sx={{position: "absolute", bottom: 16, left: 16, zIndex: 1200}}>
                <Tooltip title={t("camera.showCamera")}>
                    <IconButton
                        onClick={(): void => update({open: true})}
                        sx={{
                            backgroundColor: "background.paper",
                            boxShadow: 3,
                            "&:hover": {backgroundColor: "background.paper"},
                        }}
                    >
                        <CameraIcon/>
                    </IconButton>
                </Tooltip>
            </Box>
        );
    }

    const width = state.large ? 480 : 256;

    return (
        <Paper
            elevation={6}
            sx={{
                position: "absolute",
                bottom: 16,
                left: 16,
                zIndex: 1200,
                width: width,
                maxWidth: "calc(100% - 32px)",
                overflow: "hidden",
                borderRadius: 2,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    px: 0.5,
                    py: 0.25,
                    backgroundColor: "action.hover",
                }}
            >
                <Box sx={{flexGrow: 1, pl: 1, fontSize: "0.8rem", opacity: 0.8}}>
                    {t("camera.title")}
                </Box>
                <Tooltip title={state.large ? t("camera.shrink") : t("camera.enlarge")}>
                    <IconButton size="small" onClick={(): void => update({large: !state.large})}>
                        {state.large ? <ShrinkIcon fontSize="small"/> : <ExpandIcon fontSize="small"/>}
                    </IconButton>
                </Tooltip>
                <Tooltip title={t("camera.hideCamera")}>
                    <IconButton size="small" onClick={(): void => update({open: false})}>
                        <CloseIcon fontSize="small"/>
                    </IconButton>
                </Tooltip>
            </Box>
            <Box sx={{aspectRatio: "4 / 3", width: "100%", backgroundColor: "#000"}}>
                <iframe
                    title={t("camera.title")}
                    src={camera.url}
                    allow="autoplay; fullscreen"
                    style={{width: "100%", height: "100%", border: 0, display: "block"}}
                />
            </Box>
        </Paper>
    );
};

export default CameraOverlay;
