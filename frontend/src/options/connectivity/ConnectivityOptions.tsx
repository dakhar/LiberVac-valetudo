import {useCapabilitiesSupported} from "../../CapabilitiesProvider";
import {Capability} from "../../api";
import React from "react";
import {LinkListMenuItem} from "../../components/list_menu/LinkListMenuItem";
import {MQTTIcon} from "../../components/CustomIcons";
import {
    AccessTime as NTPIcon,
    VpnKey as AuthIcon,
    Wifi as WifiIcon,
    AutoFixHigh as NetworkAdvertisementIcon
} from "@mui/icons-material";
import {ListMenu} from "../../components/list_menu/ListMenu";
import {SpacerListMenuItem} from "../../components/list_menu/SpacerListMenuItem";
import PaperContainer from "../../components/PaperContainer";
import {useTranslation} from "react-i18next";

const ConnectivityOptions = (): React.ReactElement => {
    const {t} = useTranslation();

    const [
        wifiConfigurationCapabilitySupported,
    ] = useCapabilitiesSupported(
        Capability.WifiConfiguration,
    );

    const listItems = React.useMemo(() => {
        const items = [];

        if (wifiConfigurationCapabilitySupported) {
            items.push(
                <LinkListMenuItem
                    key="wifiConfiguration"
                    url="/options/connectivity/wifi"
                    primaryLabel={t("connectivity.wifi.title")}
                    secondaryLabel={t("connectivity.wifi.menuSubtitle")}
                    icon={<WifiIcon/>}
                />
            );

            items.push(<SpacerListMenuItem key={"spacer1"}/>);
        }

        items.push(
            <LinkListMenuItem
                key="mqttConnectivity"
                url="/options/connectivity/mqtt"
                primaryLabel={t("connectivity.mqtt.title")}
                secondaryLabel={t("connectivity.mqtt.menuSubtitle")}
                icon={<MQTTIcon/>}
            />
        );

        items.push(
            <LinkListMenuItem
                key="ntpConnectivity"
                url="/options/connectivity/ntp"
                primaryLabel={t("connectivity.ntp.title")}
                secondaryLabel={t("connectivity.ntp.menuSubtitle")}
                icon={<NTPIcon/>}
            />
        );

        items.push(
            <LinkListMenuItem
                key="networkAdvertisementSettings"
                url="/options/connectivity/networkadvertisement"
                primaryLabel={t("connectivity.networkAdvertisement.title")}
                secondaryLabel={t("connectivity.networkAdvertisement.menuSubtitle")}
                icon={<NetworkAdvertisementIcon/>}
            />
        );

        items.push(
            <LinkListMenuItem
                key="authSettings"
                url="/options/connectivity/auth"
                primaryLabel={t("connectivity.auth.title")}
                secondaryLabel={t("connectivity.auth.menuSubtitle")}
                icon={<AuthIcon/>}
            />
        );

        return items;
    }, [
        wifiConfigurationCapabilitySupported,
        t
    ]);

    return (
        <PaperContainer>
            <ListMenu
                primaryHeader={t("connectivity.options.title")}
                secondaryHeader={t("connectivity.options.subtitle")}
                listItems={listItems}
            />
        </PaperContainer>
    );
};

export default ConnectivityOptions;
