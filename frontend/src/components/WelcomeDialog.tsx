import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    Typography
} from "@mui/material";
import React, {FunctionComponent} from "react";
import {useCapabilitiesSupported} from "../CapabilitiesProvider";
import {Capability, useBasicControlMutation, useDismissWelcomeDialogMutation} from "../api";
import {MappingPassButtonItem, PersistentMapSwitchListItem} from "../options/MapManagement";
import {ButtonListMenuItem} from "./list_menu/ButtonListMenuItem";
import {
    Layers as MappingPassIcon
} from "@mui/icons-material";
import {useTranslation} from "react-i18next";

const FullCleanupButtonItem = (): React.ReactElement => {
    const {t} = useTranslation();
    const {
        mutate: executeBasicControlCommand,
        isPending: basicControlIsExecuting
    } = useBasicControlMutation();

    return (
        <ButtonListMenuItem
            primaryLabel={t("components.welcome.fullCleanup")}
            secondaryLabel={t("components.welcome.createNewMap")}
            icon={<MappingPassIcon/>}
            buttonLabel={t("robotOptions.go")}
            confirmationDialog={{
                title: t("components.welcome.startFullCleanup"),
                body: t("components.welcome.startFullCleanupDescription")
            }}
            action={() => {
                executeBasicControlCommand("start");
            }}
            actionLoading={basicControlIsExecuting}
        />
    );
};

const WelcomeDialog: FunctionComponent<{open: boolean, hide: () => void}> = ({
    open,
    hide
}): React.ReactElement => {
    const {t} = useTranslation();
    const [
        basicControlSupported,
        persistentMapControlSupported,
        mappingPassSupported
    ] = useCapabilitiesSupported(
        Capability.BasicControl,
        Capability.PersistentMapControl,
        Capability.MappingPass
    );
    const {
        mutate: dismissWelcomeDialog,
    } = useDismissWelcomeDialogMutation();

    return (
        <Dialog
            open={open}
        >
            <DialogTitle>
                {t("components.welcome.title")}
            </DialogTitle>
            <DialogContent>
                <DialogContentText
                    style={{
                        whiteSpace: "pre-wrap"
                    }}
                    component="span"
                >
                    <Typography>
                        {t("components.welcome.intro")}
                    </Typography>
                    <br/>
                    <Typography>
                        {t("components.welcome.firstStep")}
                        <br/><br/>
                        {t("components.welcome.variations")}
                    </Typography>
                    <br/>
                    <Typography component="span">
                        {t("components.welcome.ensurePrefix")}
                        <ul>
                            <li>{t("components.welcome.ensureDocked")}</li>
                            <li>{t("components.welcome.ensureDoorsOpen")}</li>
                            <li>{t("components.welcome.ensureNoCables")}</li>
                            <li>{t("components.welcome.ensureBlockedOff")}</li>
                        </ul>
                        {t("components.welcome.ensureSuffix")}
                    </Typography>
                    {
                        persistentMapControlSupported &&
                        (
                            <Paper
                                elevation={2}
                                sx={{marginTop: "1rem"}}
                            >
                                <PersistentMapSwitchListItem/>
                            </Paper>
                        )
                    }
                    {
                        mappingPassSupported &&
                        (
                            <Paper
                                elevation={2}
                                sx={{marginTop: "1rem"}}
                            >
                                <MappingPassButtonItem/>
                            </Paper>
                        )
                    }
                    {
                        basicControlSupported &&
                        !mappingPassSupported &&
                        (
                            <Paper
                                elevation={2}
                                sx={{marginTop: "1rem"}}
                            >
                                <FullCleanupButtonItem/>
                            </Paper>
                        )
                    }
                    <br/>
                    <Typography>
                        {t("components.welcome.enjoy")}
                    </Typography>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => {
                    hide();
                }}>
                    {t("components.welcome.hide")}
                </Button>
                <Button onClick={() => {
                    dismissWelcomeDialog();
                }}>
                    {t("components.welcome.doNotShowAgain")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WelcomeDialog;
