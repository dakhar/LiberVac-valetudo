import React, {FunctionComponent} from "react";
import {useTranslation} from "react-i18next";
import {Button, Collapse, LinearProgress, TextField, Typography} from "@mui/material";
import {
    Capability,
    useVoicePackManagementMutation,
    useVoicePackManagementStateQuery,
    VoicePackManagementCommand
} from "../../api";
import {useCapabilitiesSupported} from "../../CapabilitiesProvider";
import {CapabilityItem} from "./CapabilityLayout";
import {VoicepackHelp, VoicepackHelpRu} from "./res/VoicepackHelp";
import i18n from "../../i18n";

const VoicePackControl: FunctionComponent = () => {
    const {t} = useTranslation();
    const {
        data: voicePack,
        isFetching: voicePackFetching,
        isError: voicePackError,
        refetch: voicePackRefetch,
    } = useVoicePackManagementStateQuery();

    const [url, setUrl] = React.useState("");
    const [languageCode, setLanguageCode] = React.useState("");
    const [hash, setHash] = React.useState("");

    const {mutate: sendVoicePackCommand, isPending: voicePackMutating} = useVoicePackManagementMutation();

    const intervalRef = React.useRef<any>(undefined);
    React.useEffect(() => {
        const operationType = voicePack?.operationStatus.type;
        if (operationType === "downloading" || operationType === "installing") {
            intervalRef.current = setInterval(() => {
                return voicePackRefetch();
            }, 1000);
            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
            };
        }
    }, [voicePack, voicePackRefetch]);

    const voicePackContent = React.useMemo(() => {
        if (voicePackError) {
            return (
                <Typography color="error">
                    {t("capabilities.voicePack.errorLoading")}
                </Typography>
            );
        }

        const statusType = voicePack?.operationStatus.type;
        const isError = statusType === "error";
        const isDownloading = statusType === "downloading";
        const isInstalling = statusType === "installing";
        const isWorking = isDownloading || isInstalling;
        const commandDisabled = !voicePack || isDownloading || isInstalling;
        const progressValue = voicePack?.operationStatus.progress;
        const progressVariant = progressValue ? "determinate" : "indeterminate";

        return (
            <>
                <Typography variant="body1" sx={{mb: 1}}>
                    {t("capabilities.voicePack.currentLanguage", {language: voicePack?.currentLanguage})}
                </Typography>
                {isError && (
                    <Typography color="error">
                        {t("capabilities.voicePack.errorInstalling")}
                    </Typography>
                )}
                <Collapse in={isWorking}>
                    <Typography variant="subtitle1">
                        {isDownloading ? t("capabilities.voicePack.downloading") : t("capabilities.voicePack.installing")}
                    </Typography>
                    <LinearProgress color={isDownloading ? "success" : "secondary"} variant={progressVariant} value={progressValue} sx={{mb: 1}}/>
                </Collapse>

                <TextField label={t("capabilities.voicePack.url")} value={url} onChange={(e) => {
                    setUrl(e.target.value);
                }} variant="standard" placeholder="https://" disabled={commandDisabled} fullWidth sx={{mb: 0.3}}/>
                <TextField label={t("capabilities.voicePack.languageCode")} value={languageCode} onChange={(e) => {
                    setLanguageCode(e.target.value);
                }} variant="standard" placeholder="VA" disabled={commandDisabled} fullWidth sx={{mb: 0.3}}/>
                <TextField label={t("capabilities.voicePack.hash")} value={hash} onChange={(e) => {
                    setHash(e.target.value);
                }} variant="standard" disabled={commandDisabled} fullWidth sx={{mb: 1}}/>

                <Button loading={voicePackMutating || commandDisabled}
                    loadingPosition="center"
                    variant="outlined"
                    onClick={() => {
                        const command: VoicePackManagementCommand = {
                            action: "download",
                            url: url,
                            hash: hash,
                            language: languageCode
                        };
                        sendVoicePackCommand(command);
                    }}>
                    {t("capabilities.voicePack.setVoicePack")}
                </Button>
            </>
        );
    }, [sendVoicePackCommand, voicePack, voicePackError, voicePackMutating, hash, languageCode, url, t]);

    const loading = voicePackFetching || voicePackMutating || !voicePack;
    return (
        <CapabilityItem
            title={t("capabilities.voicePack.title")}
            loading={loading}
            helpText={i18n.language?.toLowerCase().startsWith("ru") ? VoicepackHelpRu : VoicepackHelp}
        >
            {voicePackContent}
        </CapabilityItem>
    );
};

const VoicePackManagement: FunctionComponent = () => {
    const [voicePackManagement] = useCapabilitiesSupported(Capability.VoicePackManagement);
    if (!voicePackManagement) {
        return null;
    }

    return <VoicePackControl/>;
};

export default VoicePackManagement;
