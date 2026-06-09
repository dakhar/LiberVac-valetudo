import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControl,
    Grid2,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
    Skeleton,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import React from "react";
import {
    useWifiConfigurationMutation,
    useWifiConfigurationPropertiesQuery,
    useWifiStatusQuery,
    WifiStatus
} from "../../api";

import {
    Wifi as WifiIcon,

    Wifi as WifiStateUnknownIcon,
    SignalWifiOff as WifiStateNotConnectedIcon,
    SignalWifi4Bar as WifiStateConnected4BarIcon,
    SignalWifi3Bar as WifiStateConnected3BarIcon,
    SignalWifi2Bar as WifiStateConnected2BarIcon,
    SignalWifi1Bar as WifiStateConnected1BarIcon,
    SignalWifi0Bar as WifiStateConnected0BarIcon,
    VisibilityOff as VisibilityOffIcon, Visibility as VisibilityIcon,

} from "@mui/icons-material";
import PaperContainer from "../../components/PaperContainer";
import ConfirmationDialog from "../../components/ConfirmationDialog";
import InfoBox from "../../components/InfoBox";
import DetailPageHeaderRow from "../../components/DetailPageHeaderRow";
import {useTranslation} from "react-i18next";

const WifiStatusComponent: React.FunctionComponent<{
    status?: WifiStatus,
    statusLoading: boolean,
    statusError: boolean
}> = ({
    status,
    statusLoading,
    statusError
}) => {
    const theme = useTheme();
    const {t} = useTranslation();

    if (statusLoading || !status) {
        return (
            <Skeleton height={"4rem"}/>
        );
    }

    if (statusError) {
        return <Typography color="error">{t("connectivity.wifi.statusLoadError")}</Typography>;
    }

    const getIconForState = (): React.ReactElement => {
        switch (status.state) {
            case "not_connected":
                return <WifiStateNotConnectedIcon sx={{fontSize: "4rem"}}/>;
            case "unknown":
                return <WifiStateUnknownIcon sx={{fontSize: "4rem"}}/>;
            case "connected":

                //Adapted from https://android.stackexchange.com/a/176325 Android 7.1.2
                if (status.details.signal === undefined || status.details.signal >= -55) {
                    return <WifiStateConnected4BarIcon sx={{fontSize: "4rem"}}/>;
                } else if (status.details.signal >= -66) {
                    return <WifiStateConnected3BarIcon sx={{fontSize: "4rem"}}/>;
                } else if (status.details.signal >= -77) {
                    return <WifiStateConnected2BarIcon sx={{fontSize: "4rem"}}/>;
                } else if (status.details.signal >= -88) {
                    return <WifiStateConnected1BarIcon sx={{fontSize: "4rem"}}/>;
                } else {
                    return <WifiStateConnected0BarIcon sx={{fontSize: "4rem"}}/>;
                }
        }
    };

    const getContentForState = (): React.ReactElement | undefined => {
        switch (status.state) {
            case "not_connected":
                return (
                    <Typography variant="h5">{t("connectivity.wifi.notConnected")}</Typography>
                );
            case "unknown":
                return (
                    <Typography variant="h5">{t("connectivity.wifi.unknown")}</Typography>
                );
            case "connected":
                return (
                    <>
                        <Typography variant="h5">
                            {status.details.ssid ?? t("connectivity.wifi.unknownSSID")}
                        </Typography>

                        {
                            status.details.signal !== undefined &&

                            <Typography
                                variant="subtitle2"
                                style={{
                                    marginTop: "0.5rem",
                                    color: theme.palette.grey[theme.palette.mode === "light" ? 400 : 700]
                                }}
                            >
                                {status.details.signal} dBm
                            </Typography>
                        }
                        {
                            status.details.ips !== undefined &&

                            <Typography
                                variant="subtitle2"
                                style={{
                                    marginTop: "0.5rem",
                                    color: theme.palette.grey[theme.palette.mode === "light" ? 400 : 700],
                                    userSelect: "text"
                                }}
                            >
                                {status.details.ips.map(ip => {
                                    return (
                                        <span key={ip}>
                                            {ip}<br/>
                                        </span>
                                    );
                                })}
                            </Typography>
                        }
                    </>
                );
        }
    };


    return (
        <Grid2 container alignItems="center" direction="column" style={{paddingBottom: "1rem"}}>
            <Grid2 style={{marginTop: "1rem"}}>
                {getIconForState()}
            </Grid2>
            <Grid2
                sx={{
                    maxWidth: "100% !important", //Why, MUI? Why?
                    wordWrap: "break-word",
                    textAlign: "center",
                    userSelect: "none"
                }}
            >
                {getContentForState()}
            </Grid2>
        </Grid2>
    );
};

const WifiConnectivity = (): React.ReactElement => {
    const {t} = useTranslation();

    const {
        data: wifiStatus,
        isPending: wifiStatusPending,
        isError: wifiStatusLoadError,
    } = useWifiStatusQuery();

    const {
        data: properties,
        isPending: propertiesPending,
        isError: propertiesLoadError
    } = useWifiConfigurationPropertiesQuery();


    const {mutate: updateConfiguration, isPending: configurationUpdating} = useWifiConfigurationMutation({
        onSuccess: () => {
            setFinalDialogOpen(true);
        }
    });

    const [newSSID, setNewSSID] = React.useState("");
    const [newPSK, setNewPSK] = React.useState("");

    const [showPasswordAsPlain, setShowPasswordAsPlain] = React.useState(false);
    const [configurationModified, setConfigurationModified] = React.useState<boolean>(false);
    const [confirmationDialogOpen, setConfirmationDialogOpen] = React.useState(false);
    const [finalDialogOpen, setFinalDialogOpen] = React.useState(false);


    if (wifiStatusPending || propertiesPending) {
        return (
            <Skeleton height={"8rem"}/>
        );
    }

    if (wifiStatusLoadError || !wifiStatus || propertiesLoadError || !properties) {
        return <Typography color="error">{t("connectivity.wifi.statusLoadError")}</Typography>;
    }

    return (
        <>
            <WifiStatusComponent
                status={wifiStatus}
                statusLoading={wifiStatusPending}
                statusError={wifiStatusLoadError}
            />
            <Divider sx={{mt: 1}} style={{marginBottom: "1rem"}}/>

            <Typography variant="h6" style={{marginBottom: "0.5rem"}}>
                {t("connectivity.wifi.changeConfiguration")}
            </Typography>

            {
                properties.provisionedReconfigurationSupported &&
                <Grid2 container spacing={1} sx={{mb: 1}} direction="row">
                    <Grid2 style={{flexGrow: 1}}>
                        <TextField
                            style={{width: "100%"}}
                            label={t("connectivity.wifi.ssidLabel")}
                            value={newSSID}
                            variant="standard"
                            onChange={e => {
                                setNewSSID(e.target.value);
                                setConfigurationModified(true);
                            }}
                        />
                    </Grid2>
                    <Grid2 style={{flexGrow: 1}}>
                        <FormControl style={{width: "100%"}} variant="standard">
                            <InputLabel htmlFor="standard-adornment-password">{t("connectivity.wifi.pskLabel")}</InputLabel>
                            <Input
                                type={showPasswordAsPlain ? "text" : "password"}
                                fullWidth
                                value={newPSK}
                                sx={{mb: 1}}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => {
                                                setShowPasswordAsPlain(!showPasswordAsPlain);
                                            }}
                                            onMouseDown={e => {
                                                e.preventDefault();
                                            }}
                                            edge="end"
                                        >
                                            {showPasswordAsPlain ? <VisibilityOffIcon/> : <VisibilityIcon/>}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                onChange={(e) => {
                                    setNewPSK(e.target.value);
                                    setConfigurationModified(true);
                                }}/>
                        </FormControl>
                    </Grid2>
                </Grid2>
            }

            {
                !properties.provisionedReconfigurationSupported &&
                <InfoBox
                    boxShadow={5}
                    style={{
                        marginTop: "2rem",
                        marginBottom: "2rem"
                    }}
                >
                    <Typography color="info">
                        {t("connectivity.wifi.resetInfoLine1")}
                        <br/><br/>
                        {t("connectivity.wifi.resetInfoLine2Part1")}<a style={{color: "inherit"}} href="https://valetudo.cloud" target="_blank" rel="noreferrer">valetudo.cloud</a>{t("connectivity.wifi.resetInfoLine2Part2")}<br/>
                        {t("connectivity.wifi.resetInfoLine3")}

                        <br/><br/>

                        <strong>{t("connectivity.wifi.noteLabel")}</strong><br/>
                        {t("connectivity.wifi.resetNoteLine1")}<br/>
                        {t("connectivity.wifi.resetNoteLine2")}
                    </Typography>
                </InfoBox>
            }

            <Divider sx={{mt: 1}} style={{marginTop: "1rem", marginBottom: "1rem"}}/>

            {
                properties.provisionedReconfigurationSupported &&
                <Grid2 container>
                    <Grid2 style={{marginLeft: "auto"}}>
                        <Button
                            loading={configurationUpdating}
                            color="primary"
                            variant="outlined"
                            disabled={!(configurationModified && newSSID && newPSK)}
                            onClick={() => {
                                setConfirmationDialogOpen(true);
                            }}
                        >
                            {t("connectivity.common.saveConfiguration")}
                        </Button>
                    </Grid2>
                </Grid2>
            }
            <ConfirmationDialog
                title={t("connectivity.wifi.applyDialogTitle")}
                text=""
                open={confirmationDialogOpen}
                onClose={() => {
                    setConfirmationDialogOpen(false);
                }}
                onAccept={() => {
                    updateConfiguration({
                        ssid: newSSID,
                        credentials: {
                            type: "wpa2_psk",
                            typeSpecificSettings: {
                                password: newPSK
                            }
                        }
                    });
                }}
            >
                <DialogContentText>
                    {t("connectivity.wifi.applyDialogText")}
                    <br/>
                    <br/>
                    <strong>{t("connectivity.wifi.hintLabel")}</strong>
                    <br/>
                    {t("connectivity.wifi.applyDialogHint")}
                </DialogContentText>
            </ConfirmationDialog>

            <Dialog open={finalDialogOpen}>
                <DialogTitle>
                    {t("connectivity.wifi.applyingDialogTitle")}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t("connectivity.wifi.applyingDialogText")}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        window.location.reload();
                    }} autoFocus>
                        {t("common.ok")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const WifiConnectivityPage = (): React.ReactElement => {
    const {t} = useTranslation();

    const {
        isFetching: wifiStatusFetching,
        refetch: refetchWifiStatus,
    } = useWifiStatusQuery();

    return (
        <PaperContainer>
            <Grid2 container direction="row">
                <Box style={{width: "100%"}}>
                    <DetailPageHeaderRow
                        title={t("connectivity.wifi.title")}
                        icon={<WifiIcon/>}
                        onRefreshClick={() => {
                            refetchWifiStatus().catch(() => {
                                /* intentional */
                            });
                        }}
                        isRefreshing={wifiStatusFetching}
                    />

                    <WifiConnectivity/>
                </Box>
            </Grid2>
        </PaperContainer>
    );
};

export default WifiConnectivityPage;
