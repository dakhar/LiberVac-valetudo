import React from "react";
import {
    RestartAlt as ConfigRestoreIcon,
    SystemUpdateAlt as UpdaterIcon,
    Badge as FriendlyNameIcon,
} from "@mui/icons-material";
import {ListMenu} from "../components/list_menu/ListMenu";
import PaperContainer from "../components/PaperContainer";
import {
    UpdaterConfiguration,
    useRestoreDefaultConfigurationMutation,
    useUpdaterConfigurationMutation,
    useUpdaterConfigurationQuery,
    useValetudoCustomizationsMutation,
    useValetudoCustomizationsQuery
} from "../api";
import {ButtonListMenuItem} from "../components/list_menu/ButtonListMenuItem";
import {SelectListMenuItem, SelectListMenuItemOption} from "../components/list_menu/SelectListMenuItem";
import {SpacerListMenuItem} from "../components/list_menu/SpacerListMenuItem";
import { TextEditModalListMenuItem } from "../components/list_menu/TextEditModalListMenuItem";
import { ActivationListMenuItem } from "./ValetudoActivation";
import {isAprilFools} from "../utils";
import {useTranslation} from "react-i18next";


const ConfigRestoreButtonListMenuItem = (): React.ReactElement => {
    const {t} = useTranslation();
    const {
        mutate: restoreDefaultConfiguration,
        isPending: restoreDefaultConfigurationIsExecuting
    } = useRestoreDefaultConfigurationMutation();

    return (
        <ButtonListMenuItem
            primaryLabel={t("valetudoOptions.restoreDefaultConfiguration")}
            secondaryLabel={t("valetudoOptions.restoreDefaultConfigurationDescription")}
            icon={<ConfigRestoreIcon/>}
            buttonLabel={t("valetudoOptions.go")}
            buttonColor={"error"}
            confirmationDialog={{
                title: t("valetudoOptions.restoreDefaultConfigurationConfirmTitle"),
                body: t("valetudoOptions.restoreDefaultConfigurationConfirmBody")
            }}
            action={() => {
                restoreDefaultConfiguration();
            }}
            actionLoading={restoreDefaultConfigurationIsExecuting}
        />
    );
};

const FriendlyNameEditModalListMenuItem = (): React.ReactElement => {
    const {t} = useTranslation();
    const {
        data: valetudoCustomizations,
        isPending: valetudoCustomizationsPending,
    } = useValetudoCustomizationsQuery();
    const {
        mutate: updateValetudoCustomizations,
        isPending: valetudoCustomizationsUpdating
    } = useValetudoCustomizationsMutation();

    const description = t("valetudoOptions.customFriendlyNameDescription");
    let secondaryLabel = description;

    if (valetudoCustomizations && valetudoCustomizations.friendlyName !== "") {
        secondaryLabel = valetudoCustomizations.friendlyName;
    }

    return (
        <TextEditModalListMenuItem
            isLoading={valetudoCustomizationsPending || valetudoCustomizationsUpdating}
            value={valetudoCustomizations?.friendlyName ?? ""}

            dialog={{
                title: t("valetudoOptions.customFriendlyName"),
                description: description,

                validatingTransformer: (newValue: string) => {
                    return newValue.replace(/[^a-zA-Z0-9 -]/g, "").slice(0,24);
                },
                onSave: (newValue: string) => {
                    updateValetudoCustomizations({
                        friendlyName: newValue
                    });
                }
            }}

            icon={<FriendlyNameIcon/>}
            primaryLabel={t("valetudoOptions.customFriendlyName")}
            secondaryLabel={secondaryLabel}
        />
    );
};

const UpdateProviderSelectListMenuItem = (): React.ReactElement => {
    const {t} = useTranslation();
    const updateProviders : Array<SelectListMenuItemOption> = React.useMemo(() => [
        {
            value: "github",
            label: t("valetudoOptions.updateChannelRelease")
        },
        {
            value: "github_nightly",
            label: t("valetudoOptions.updateChannelNightly")
        }
    ], [t]);

    const {
        data: storedConfiguration,
        isPending: configurationPending,
        isError: configurationError,
    } = useUpdaterConfigurationQuery();

    const {mutate: updateConfiguration, isPending: configurationUpdating} = useUpdaterConfigurationMutation();

    const disabled = configurationPending || configurationUpdating || configurationError;

    const currentValue = updateProviders.find(provider => provider.value === storedConfiguration?.updateProvider) ?? {value: "", label: ""};

    return (
        <SelectListMenuItem
            options={updateProviders}
            currentValue={currentValue}
            setValue={(e) => {
                updateConfiguration({
                    updateProvider: e.value
                } as UpdaterConfiguration);
            }}
            disabled={disabled}
            loadingOptions={false}
            loadError={configurationError}
            primaryLabel={t("valetudoOptions.updateChannel")}
            secondaryLabel={t("valetudoOptions.updateChannelDescription")}
            icon={<UpdaterIcon/>}
        />
    );
};

const ValetudoOptions = (): React.ReactElement => {
    const {t} = useTranslation();
    const listItems = React.useMemo(() => {
        const items = [
            <ConfigRestoreButtonListMenuItem key={"configRestoreAction"}/>,
            <SpacerListMenuItem key={"spacer0"}/>,
            <FriendlyNameEditModalListMenuItem key={"friendlyName"}/>,
            <UpdateProviderSelectListMenuItem key={"updateProviderSelect"}/>,
        ];

        if (isAprilFools) {
            items.unshift(
                <ActivationListMenuItem key={"activation"}/>,
                <SpacerListMenuItem key={"spacer1"}/>
            );
        }

        return items;
    }, []);

    return (
        <PaperContainer>
            <ListMenu
                primaryHeader={t("valetudoOptions.title")}
                secondaryHeader={t("valetudoOptions.subtitle")}
                listItems={listItems}
            />
        </PaperContainer>
    );
};

export default ValetudoOptions;
