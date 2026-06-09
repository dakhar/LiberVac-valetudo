import {
    AppBar,
    Box,
    Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    ListSubheader,
    MenuItem,
    PaletteMode,
    Select,
    Switch,
    Toolbar,
    Typography
} from "@mui/material";
import React from "react";
import {
    AccessTime as TimeIcon,
    Equalizer as StatisticsIcon,
    DarkMode as DarkModeIcon,
    Map as MapManagementIcon,
    Home as HomeIcon,
    Article as LogIcon,
    Menu as MenuIcon,
    ArrowBack as BackIcon,
    PendingActions as PendingActionsIcon,
    Hub as ConnectivityIcon,
    SystemUpdateAlt as UpdaterIcon,
    SettingsRemote as SettingsRemoteIcon,
    GitHub as GithubIcon,
    Favorite as DonateIcon,
    MenuBook as DocsIcon,
    Wysiwyg as SystemInformationIcon,
    Info as AboutIcon,
    Help as HelpIcon,
    Translate as TranslateIcon,
    SvgIconComponent
} from "@mui/icons-material";
import {Link, useLocation} from "react-router-dom";
import ValetudoEvents from "./ValetudoEvents";
import {Capability} from "../api";
import {useCapabilitiesSupported} from "../CapabilitiesProvider";
import {
    RobotMonochromeIcon,
    SwaggerUIIcon,
    ValetudoMonochromeIcon
} from "./CustomIcons";
import {useTranslation} from "react-i18next";
import {SUPPORTED_LANGUAGES, SupportedLanguage} from "../i18n";

interface MenuEntry {
    kind: "MenuEntry";
    route: string;
    titleKey: string;
    menuIcon: SvgIconComponent;
    menuTextKey: string;
    requiredCapabilities?: {
        capabilities: Capability[];
        type: "allof" | "anyof"
    };
}

interface MenuSubEntry {
    kind: "MenuSubEntry",
    route: string,
    titleKey: string,
    parentRoute: string
}

interface MenuSubheader {
    kind: "Subheader";
    titleKey: string;
    requiredCapabilities?: {
        capabilities: Capability[];
        type: "allof" | "anyof"
    };
}

//Note that order is important here
const menuTree: Array<MenuEntry | MenuSubEntry | MenuSubheader> = [
    {
        kind: "MenuEntry",
        route: "/",
        titleKey: "nav.titles.home",
        menuIcon: HomeIcon,
        menuTextKey: "nav.home"
    },
    {
        kind: "Subheader",
        titleKey: "nav.robot",
        requiredCapabilities: {
            capabilities: [
                Capability.ConsumableMonitoring,
                Capability.ManualControl,
                Capability.HighResolutionManualControl,
                Capability.TotalStatistics
            ],
            type: "anyof"
        }
    },
    {
        kind: "MenuEntry",
        route: "/robot/consumables",
        titleKey: "nav.titles.consumables",
        menuIcon: PendingActionsIcon,
        menuTextKey: "nav.consumables",
        requiredCapabilities: {
            capabilities: [Capability.ConsumableMonitoring],
            type: "allof"
        }
    },
    {
        kind: "MenuEntry",
        route: "/robot/manual_control",
        titleKey: "nav.titles.manualControl",
        menuIcon: SettingsRemoteIcon,
        menuTextKey: "nav.manualControl",
        requiredCapabilities: {
            capabilities: [Capability.ManualControl, Capability.HighResolutionManualControl],
            type: "anyof"
        }
    },
    {
        kind: "MenuEntry",
        route: "/robot/total_statistics",
        titleKey: "nav.titles.statistics",
        menuIcon: StatisticsIcon,
        menuTextKey: "nav.statistics",
        requiredCapabilities: {
            capabilities: [Capability.TotalStatistics],
            type: "allof"
        }
    },
    {
        kind: "Subheader",
        titleKey: "nav.options"
    },
    {
        kind: "MenuEntry",
        route: "/options/map_management",
        titleKey: "nav.titles.mapOptions",
        menuIcon: MapManagementIcon,
        menuTextKey: "nav.mapOptions",
        requiredCapabilities: {
            capabilities: [
                Capability.PersistentMapControl,
                Capability.MappingPass,
                Capability.MapReset,

                Capability.MapSegmentEdit,
                Capability.MapSegmentRename,

                Capability.CombinedVirtualRestrictions
            ],
            type: "anyof"
        }
    },
    {
        kind: "MenuSubEntry",
        route: "/options/map_management/segments",
        titleKey: "nav.titles.segmentManagement",
        parentRoute: "/options/map_management"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/map_management/virtual_restrictions",
        titleKey: "nav.titles.virtualRestrictionManagement",
        parentRoute: "/options/map_management"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/map_management/robot_coverage",
        titleKey: "nav.titles.robotCoverageMap",
        parentRoute: "/options/map_management"
    },
    {
        kind: "MenuEntry",
        route: "/options/connectivity",
        titleKey: "nav.titles.connectivityOptions",
        menuIcon: ConnectivityIcon,
        menuTextKey: "nav.connectivity"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/connectivity/auth",
        titleKey: "nav.titles.authSettings",
        parentRoute: "/options/connectivity"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/connectivity/mqtt",
        titleKey: "nav.titles.mqttConnectivity",
        parentRoute: "/options/connectivity"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/connectivity/networkadvertisement",
        titleKey: "nav.titles.networkAdvertisement",
        parentRoute: "/options/connectivity"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/connectivity/ntp",
        titleKey: "nav.titles.ntpConnectivity",
        parentRoute: "/options/connectivity"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/connectivity/wifi",
        titleKey: "nav.titles.wifiConnectivity",
        parentRoute: "/options/connectivity"
    },
    {
        kind: "MenuEntry",
        route: "/options/robot",
        titleKey: "nav.titles.robotOptions",
        menuIcon: RobotMonochromeIcon,
        menuTextKey: "nav.robotOptions"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/robot/system",
        titleKey: "nav.titles.systemOptions",
        parentRoute: "/options/robot"
    },
    {
        kind: "MenuSubEntry",
        route: "/options/robot/quirks",
        titleKey: "nav.titles.quirks",
        parentRoute: "/options/robot"
    },
    {
        kind: "MenuEntry",
        route: "/options/valetudo",
        titleKey: "nav.titles.valetudoOptions",
        menuIcon: ValetudoMonochromeIcon,
        menuTextKey: "nav.valetudoOptions"
    },
    {
        kind: "Subheader",
        titleKey: "nav.misc"
    },
    {
        kind: "MenuEntry",
        route: "/valetudo/timers",
        titleKey: "nav.titles.timers",
        menuIcon: TimeIcon,
        menuTextKey: "nav.timers"
    },
    {
        kind: "MenuEntry",
        route: "/valetudo/log",
        titleKey: "nav.titles.log",
        menuIcon: LogIcon,
        menuTextKey: "nav.log"
    },
    {
        kind: "MenuEntry",
        route: "/valetudo/updater",
        titleKey: "nav.titles.updater",
        menuIcon: UpdaterIcon,
        menuTextKey: "nav.updater"
    },
    {
        kind: "MenuEntry",
        route: "/valetudo/system_information",
        titleKey: "nav.titles.systemInformation",
        menuIcon: SystemInformationIcon,
        menuTextKey: "nav.systemInformation"
    },
    {
        kind: "MenuEntry",
        route: "/valetudo/help",
        titleKey: "nav.titles.generalHelp",
        menuIcon: HelpIcon,
        menuTextKey: "nav.generalHelp"
    },
    {
        kind: "MenuEntry",
        route: "/valetudo/about",
        titleKey: "nav.titles.aboutValetudo",
        menuIcon: AboutIcon,
        menuTextKey: "nav.aboutValetudo"
    },
];

const ValetudoAppBar: React.FunctionComponent<{ paletteMode: PaletteMode, setPaletteMode: (newMode: PaletteMode) => void }> = ({
    paletteMode,
    setPaletteMode
}): React.ReactElement => {
    const {t, i18n} = useTranslation();
    const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false);
    const currentLocation = useLocation()?.pathname;
    const robotCapabilities = useCapabilitiesSupported(...Object.values(Capability));

    //@ts-ignore
    const currentMenuEntry = menuTree.find(element => element.route === currentLocation) ?? menuTree[0];

    const pageTitle = React.useMemo(() => {
        let ret = "";

        menuTree.forEach((element) => {
            //@ts-ignore
            if (currentLocation.includes(element.route) && element.route !== "/" && element.titleKey) {
                if (ret !== "") {
                    ret += " - ";
                }

                ret += t(element.titleKey);
            }
        });

        if (ret !== "") {
            document.title = `Valetudo - ${ret}`;
        } else {
            document.title = "Valetudo";
        }

        return t(currentMenuEntry.titleKey);
    }, [currentLocation, currentMenuEntry, t]);

    const drawerContent = React.useMemo(() => {
        return (
            <Box
                sx={{width: 250}}
                role="presentation"
                onClick={() => {
                    setDrawerOpen(false);
                }}
                onKeyDown={() => {
                    setDrawerOpen(false);
                }}
                style={{
                    scrollbarWidth: "thin",
                    overflowX: "hidden"
                }}
            >
                <List>
                    {menuTree.filter(item => {
                        return item.kind !== "MenuSubEntry";
                    }).map((value, idx) => {
                        switch (value.kind) {
                            case "Subheader":
                                if (value.requiredCapabilities) {
                                    switch (value.requiredCapabilities.type) {
                                        case "allof": {
                                            if (!value.requiredCapabilities.capabilities.every(capability => {
                                                const idx = Object.values(Capability).indexOf(capability);
                                                return robotCapabilities[idx];
                                            })) {
                                                return null;
                                            }

                                            break;
                                        }
                                        case "anyof": {
                                            if (!value.requiredCapabilities.capabilities.some(capability => {
                                                const idx = Object.values(Capability).indexOf(capability);
                                                return robotCapabilities[idx];
                                            })) {
                                                return null;
                                            }

                                            break;
                                        }
                                    }
                                }

                                return (
                                    <ListSubheader
                                        key={`${idx}`}
                                        sx={{
                                            background: "transparent",
                                            userSelect: "none"
                                        }}
                                        disableSticky={true}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {t(value.titleKey)}
                                    </ListSubheader>
                                );

                            case "MenuEntry": {
                                if (value.requiredCapabilities) {
                                    switch (value.requiredCapabilities.type) {
                                        case "allof": {
                                            if (!value.requiredCapabilities.capabilities.every(capability => {
                                                const idx = Object.values(Capability).indexOf(capability);
                                                return robotCapabilities[idx];
                                            })) {
                                                return null;
                                            }

                                            break;
                                        }
                                        case "anyof": {
                                            if (!value.requiredCapabilities.capabilities.some(capability => {
                                                const idx = Object.values(Capability).indexOf(capability);
                                                return robotCapabilities[idx];
                                            })) {
                                                return null;
                                            }

                                            break;
                                        }
                                    }
                                }

                                const ItemIcon = value.menuIcon;

                                return (
                                    <ListItemButton
                                        key={value.route}
                                        selected={value.route === currentLocation}
                                        component={Link}
                                        to={value.route}
                                    >
                                        <ListItemIcon>
                                            <ItemIcon/>
                                        </ListItemIcon>
                                        <ListItemText primary={t(value.menuTextKey)}/>
                                    </ListItemButton>
                                );
                            }
                        }
                    })}

                    <Divider/>
                    <ListItem
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                            userSelect: "none"
                        }}
                    >
                        <ListItemIcon>
                            <DarkModeIcon/>
                        </ListItemIcon>
                        <ListItemText primary={t("nav.darkMode")}/>
                        <Switch
                            edge="end"
                            onChange={(e) => {
                                setPaletteMode(e.target.checked ? "dark" : "light");
                            }}
                            checked={paletteMode === "dark"}
                        />
                    </ListItem>

                    <ListItem
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                            userSelect: "none"
                        }}
                    >
                        <ListItemIcon>
                            <TranslateIcon/>
                        </ListItemIcon>
                        <ListItemText primary={t("nav.language") ?? "Language"}/>
                        <Select
                            size="small"
                            value={i18n.resolvedLanguage ?? "en"}
                            onChange={(e) => {
                                void i18n.changeLanguage(e.target.value as SupportedLanguage);
                            }}
                            variant="standard"
                            disableUnderline
                            sx={{minWidth: 80}}
                        >
                            {Object.entries(SUPPORTED_LANGUAGES).map(([code, label]) => (
                                <MenuItem key={code} value={code}>{label}</MenuItem>
                            ))}
                        </Select>
                    </ListItem>


                    <ListSubheader
                        sx={{
                            background: "transparent",
                            userSelect: "none"
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {t("nav.links")}
                    </ListSubheader>
                    <ListItemButton
                        component="a"
                        href="./swagger/"
                        target="_blank"
                        rel="noopener"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ListItemIcon>
                            <SwaggerUIIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Swagger UI"/>
                    </ListItemButton>
                    <Divider/>
                    <ListItemButton
                        component="a"
                        href="https://valetudo.cloud"
                        target="_blank"
                        rel="noopener"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ListItemIcon>
                            <DocsIcon/>
                        </ListItemIcon>
                        <ListItemText primary={t("nav.docs")}/>
                    </ListItemButton>
                    <ListItemButton
                        component="a"
                        href="https://github.com/Hypfer/Valetudo"
                        target="_blank"
                        rel="noopener"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ListItemIcon>
                            <GithubIcon/>
                        </ListItemIcon>
                        <ListItemText primary="Hypfer/Valetudo"/>
                    </ListItemButton>
                    <ListItemButton
                        component="a"
                        href="https://github.com/sponsors/Hypfer"
                        target="_blank"
                        rel="noopener"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ListItemIcon>
                            <DonateIcon/>
                        </ListItemIcon>
                        <ListItemText primary={t("nav.donate")}/>
                    </ListItemButton>


                </List>
            </Box>
        );
    }, [currentLocation, paletteMode, setPaletteMode, robotCapabilities, t, i18n]);

    const toolbarContent = React.useMemo(() => {
        switch (currentMenuEntry.kind) {
            case "MenuEntry":
                return (
                    <>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label={t("common.menu")}
                            sx={{mr: 2}}
                            onClick={() => {
                                setDrawerOpen(true);
                            }}
                            title={t("common.menu")}
                        >
                            <MenuIcon/>
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                            {pageTitle}
                        </Typography>
                    </>
                );
            case "MenuSubEntry":
                return (
                    <>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label={t("common.back")}
                            sx={{mr: 2}}

                            component={Link}
                            to={currentMenuEntry.parentRoute}
                        >
                            <BackIcon/>
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                            {pageTitle}
                        </Typography>
                    </>
                );
            case "Subheader":
                //This can never happen
                return (<></>);
        }
    }, [currentMenuEntry, setDrawerOpen, pageTitle, t]);

    return (
        <Box
            sx={{
                userSelect: "none"
            }}
        >
            <AppBar position="fixed">
                <Toolbar>
                    {toolbarContent}
                    <div>
                        <ValetudoEvents/>
                    </div>
                </Toolbar>
            </AppBar>
            <Toolbar/>
            {
                currentMenuEntry.kind !== "MenuSubEntry" &&
                <Drawer
                    anchor={"left"}
                    open={drawerOpen}
                    onClose={() => {
                        setDrawerOpen(false);
                    }}
                >
                    {drawerContent}
                </Drawer>
            }
        </Box>
    );
};

export default ValetudoAppBar;
