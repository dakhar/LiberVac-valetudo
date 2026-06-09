import {useCapabilitiesSupported} from "../CapabilitiesProvider";
import {
    Capability,
    useMapResetMutation,
    usePersistentMapMutation,
    usePersistentMapQuery,
    useRobotMapQuery,
    useStartMappingPassMutation,
    useValetudoInformationQuery
} from "../api";
import {
    Save as PersistentMapControlIcon,
    Layers as MappingPassIcon,
    LayersClear as MapResetIcon,
    Dashboard as SegmentEditIcon,
    Crop as CleanupCoverageIcon,
    Download as ValetudoMapDownloadIcon,
} from "@mui/icons-material";
import React from "react";
import ConfirmationDialog from "../components/ConfirmationDialog";
import { LinkListMenuItem } from "../components/list_menu/LinkListMenuItem";
import { ButtonListMenuItem } from "../components/list_menu/ButtonListMenuItem";
import {SpacerListMenuItem} from "../components/list_menu/SpacerListMenuItem";
import {ListMenu} from "../components/list_menu/ListMenu";
import {ToggleSwitchListMenuItem} from "../components/list_menu/ToggleSwitchListMenuItem";
import {MapManagementHelp, MapManagementHelpRu} from "./res/MapManagementHelp";
import PaperContainer from "../components/PaperContainer";
import {MapUtilitiesHelp, MapUtilitiesHelpRu} from "./res/MapUtilitiesHelp";
import {VirtualRestrictionsIcon} from "../components/CustomIcons";
import {useTranslation} from "react-i18next";
import i18n from "../i18n";


export const MappingPassButtonItem = (): React.ReactElement => {
    const {t} = useTranslation();
    const {mutate: startMappingPass, isPending: mappingPassStarting} = useStartMappingPassMutation();

    return (
        <ButtonListMenuItem
            primaryLabel={t("mapManagement.mappingPass")}
            secondaryLabel={t("mapManagement.mappingPassDescription")}
            icon={<MappingPassIcon/>}
            buttonLabel={t("mapManagement.go")}
            confirmationDialog={{
                title: t("mapManagement.mappingPassConfirmTitle"),
                body: t("mapManagement.mappingPassConfirmBody")
            }}
            action={startMappingPass}
            actionLoading={mappingPassStarting}
        />
    );
};

const MapResetButtonItem = (): React.ReactElement => {
    const {t} = useTranslation();
    const {mutate: resetMap, isPending: mapResetting} = useMapResetMutation();

    return (
        <ButtonListMenuItem
            primaryLabel={t("mapManagement.mapReset")}
            secondaryLabel={t("mapManagement.mapResetDescription")}
            icon={<MapResetIcon/>}
            buttonLabel={t("mapManagement.go")}
            buttonColor={"error"}
            confirmationDialog={{
                title: t("mapManagement.mapResetConfirmTitle"),
                body: t("mapManagement.mapResetConfirmBody")
            }}
            action={resetMap}
            actionLoading={mapResetting}
        />
    );
};

export const PersistentMapSwitchListItem = () => {
    const {t} = useTranslation();
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const {
        data: persistentData,
        isFetching: persistentDataLoading,
        isError: persistentDataError,
    } = usePersistentMapQuery();

    const {mutate: mutatePersistentData, isPending: persistentDataChanging} = usePersistentMapMutation();
    const loading = persistentDataLoading || persistentDataChanging;
    const disabled = loading || persistentDataChanging || persistentDataError;

    return (
        <>
            <ToggleSwitchListMenuItem
                value={persistentData?.enabled ?? false}
                setValue={(value) => {
                    // Disabling requires confirmation
                    if (value) {
                        mutatePersistentData(true);
                    } else {
                        setDialogOpen(true);
                    }
                }}
                disabled={disabled}
                loadError={persistentDataError}
                primaryLabel={t("mapManagement.persistentMaps")}
                secondaryLabel={t("mapManagement.persistentMapsDescription")}
                icon={<PersistentMapControlIcon/>}
            />
            <ConfirmationDialog
                title={t("mapManagement.disablePersistentMapsConfirmTitle")}
                text={(
                    <>
                        {t("mapManagement.disablePersistentMapsConfirmBody1")}<br/>
                        {t("mapManagement.disablePersistentMapsConfirmBody2")}
                    </>
                )}
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                }}
                onAccept={() => {
                    mutatePersistentData(false);
                }}
            />
        </>
    );
};

const ValetudoMapDataExportButtonItem = (): React.ReactElement => {
    const {t} = useTranslation();
    const {
        data: valetudoInformation,
        isPending: valetudoInformationPending
    } = useValetudoInformationQuery();

    const {
        data: mapData,
        isPending: mapPending,
    } = useRobotMapQuery();


    return (
        <ButtonListMenuItem
            primaryLabel={t("mapManagement.exportValetudoMap")}
            secondaryLabel={t("mapManagement.exportValetudoMapDescription")}
            icon={<ValetudoMapDownloadIcon/>}
            buttonLabel={t("mapManagement.go")}
            action={() => {
                if (valetudoInformation && mapData) {
                    const timestamp = new Date().toISOString().replaceAll(":","-").split(".")[0];
                    const mapExportBlob = new Blob(
                        [JSON.stringify(mapData, null, 2)],
                        { type: "application/json" }
                    );

                    const linkElement = document.createElement("a");

                    linkElement.href = URL.createObjectURL(mapExportBlob);
                    linkElement.download = `ValetudoMapExport-${valetudoInformation.systemId}-${timestamp}.json`;

                    linkElement.click();
                }
            }}
            actionLoading={valetudoInformationPending || mapPending}
        />
    );
};

const MapManagement = (): React.ReactElement => {
    const {t} = useTranslation();
    const [
        persistentMapControlCapabilitySupported,
        mappingPassCapabilitySupported,
        mapResetCapabilitySupported,

        mapSegmentEditCapabilitySupported,
        mapSegmentRenameCapabilitySupported,

        combinedVirtualRestrictionsCapabilitySupported
    ] = useCapabilitiesSupported(
        Capability.PersistentMapControl,
        Capability.MappingPass,
        Capability.MapReset,

        Capability.MapSegmentEdit,
        Capability.MapSegmentRename,

        Capability.CombinedVirtualRestrictions
    );

    const robotManagedListItems = React.useMemo(() => {
        const items = [];

        if (
            persistentMapControlCapabilitySupported ||
            mappingPassCapabilitySupported ||
            mapResetCapabilitySupported
        ) {
            if (persistentMapControlCapabilitySupported) {
                items.push(
                    <PersistentMapSwitchListItem key="persistentMapSwitch"/>
                );
            }

            if (mappingPassCapabilitySupported) {
                items.push(
                    <MappingPassButtonItem key="mappingPass"/>
                );
            }

            if (mapResetCapabilitySupported) {
                items.push(
                    <MapResetButtonItem key="mapReset"/>
                );
            }

            if (
                mapSegmentEditCapabilitySupported || mapSegmentRenameCapabilitySupported ||
                combinedVirtualRestrictionsCapabilitySupported
            ) {
                items.push(<SpacerListMenuItem key={"spacer1"}/>);
            }
        }


        if (mapSegmentEditCapabilitySupported || mapSegmentRenameCapabilitySupported) {
            items.push(
                <LinkListMenuItem
                    key="segmentManagement"
                    url="/options/map_management/segments"
                    primaryLabel={t("mapManagement.segmentManagement")}
                    secondaryLabel={t("mapManagement.segmentManagementDescription")}
                    icon={<SegmentEditIcon/>}
                />
            );
        }

        if (combinedVirtualRestrictionsCapabilitySupported) {
            items.push(
                <LinkListMenuItem
                    key="virtualRestrictionManagement"
                    url="/options/map_management/virtual_restrictions"
                    primaryLabel={t("mapManagement.virtualRestrictionManagement")}
                    secondaryLabel={t("mapManagement.virtualRestrictionManagementDescription")}
                    icon={<VirtualRestrictionsIcon/>}
                />
            );
        }

        return items;
    }, [
        persistentMapControlCapabilitySupported,
        mappingPassCapabilitySupported,
        mapResetCapabilitySupported,

        combinedVirtualRestrictionsCapabilitySupported,
        mapSegmentEditCapabilitySupported,
        mapSegmentRenameCapabilitySupported,
        t
    ]);

    const utilityMapItems = React.useMemo(() => {
        return [
            <LinkListMenuItem
                key="robotCoverageMap"
                url="/options/map_management/robot_coverage"
                primaryLabel={t("mapManagement.robotCoverageMap")}
                secondaryLabel={t("mapManagement.robotCoverageMapDescription")}
                icon={<CleanupCoverageIcon/>}
            />,
            <ValetudoMapDataExportButtonItem key="valetudoMapDataExport" />
        ];
    }, [t]);

    return (
        <PaperContainer>
            <ListMenu
                primaryHeader={t("mapManagement.robotManagedMapFeatures")}
                secondaryHeader={t("mapManagement.robotManagedMapFeaturesDescription")}
                listItems={robotManagedListItems}
                helpText={i18n.language?.toLowerCase().startsWith("ru") ? MapManagementHelpRu : MapManagementHelp}
            />
            <ListMenu
                primaryHeader={t("mapManagement.mapUtilities")}
                secondaryHeader={t("mapManagement.mapUtilitiesDescription")}
                listItems={utilityMapItems}
                helpText={i18n.language?.toLowerCase().startsWith("ru") ? MapUtilitiesHelpRu : MapUtilitiesHelp}
                style={{marginTop: "1rem"}}
            />
        </PaperContainer>
    );
};

export default MapManagement;
