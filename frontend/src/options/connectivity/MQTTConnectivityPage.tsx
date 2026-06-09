import {
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Collapse,
    Container,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    Grid2,
    IconButton,
    Input,
    InputAdornment,
    InputLabel,
    Popper,
    Skeleton,
    Switch,
    Typography,
    useTheme,
} from "@mui/material";
import {
    ArrowUpward,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,

    LinkOff as MQTTDisconnectedIcon,
    Link as MQTTConnectedIcon,
    Sync as MQTTConnectingIcon,
    Warning as MQTTErrorIcon,
} from "@mui/icons-material";
import React from "react";
import {
    MQTTConfiguration,
    MQTTStatus,
    useMQTTConfigurationMutation,
    useMQTTConfigurationQuery,
    useMQTTPropertiesQuery,
    useMQTTStatusQuery
} from "../../api";
import {getIn, setIn} from "../../api/utils";
import {convertBytesToHumans, deepCopy, extractHostFromUrl} from "../../utils";
import {InputProps} from "@mui/material/Input/Input";
import InfoBox from "../../components/InfoBox";
import PaperContainer from "../../components/PaperContainer";
import {MQTTIcon} from "../../components/CustomIcons";
import TextInformationGrid from "../../components/TextInformationGrid";
import DetailPageHeaderRow from "../../components/DetailPageHeaderRow";
import {useTranslation} from "react-i18next";

const MQTTStatusComponent: React.FunctionComponent<{
    status: MQTTStatus | undefined,
    statusLoading: boolean,
    statusError: boolean
}> = ({
    status,
    statusLoading,
    statusError
}) => {
    const {t} = useTranslation();

    if (statusLoading || !status) {
        return (
            <Skeleton height={"4rem"}/>
        );
    }

    if (statusError) {
        return <Typography color="error">{t("connectivity.mqtt.statusLoadError")}</Typography>;
    }

    const getIconForState = (): React.ReactElement => {
        switch (status.state) {
            case "disconnected":
                return <MQTTDisconnectedIcon sx={{fontSize: "4rem"}}/>;
            case "ready":
                return <MQTTConnectedIcon sx={{fontSize: "4rem"}}/>;
            case "init":
                return <MQTTConnectingIcon sx={{fontSize: "4rem"}}/>;
            case "lost":
            case "alert":
                return <MQTTErrorIcon sx={{fontSize: "4rem"}}/>;
        }
    };

    const getContentForState = (): React.ReactElement => {
        switch (status.state) {
            case "disconnected":
                return (
                    <Typography variant="h5">{t("connectivity.mqtt.disconnected")}</Typography>
                );
            case "ready":
                return (
                    <Typography variant="h5">{t("connectivity.mqtt.connected")}</Typography>
                );
            case "init":
                return (
                    <Typography variant="h5">{t("connectivity.mqtt.connecting")}</Typography>
                );
            case "lost":
            case "alert":
                return (
                    <Typography variant="h5">{t("connectivity.mqtt.connectionError")}</Typography>
                );
        }
    };

    const getMessageStats = (): React.ReactElement => {
        const items = [
            {
                header: t("connectivity.mqtt.messagesSent"),
                body: status.stats.messages.count.sent.toString()
            },
            {
                header: t("connectivity.mqtt.bytesSent"),
                body: convertBytesToHumans(status.stats.messages.bytes.sent)
            },
            {
                header: t("connectivity.mqtt.messagesReceived"),
                body: status.stats.messages.count.received.toString()
            },
            {
                header: t("connectivity.mqtt.bytesReceived"),
                body: convertBytesToHumans(status.stats.messages.bytes.received)
            },
        ];

        return <TextInformationGrid items={items}/>;
    };

    const getConnectionStats = (): React.ReactElement => {
        const items = [
            {
                header: t("connectivity.mqtt.connects"),
                body: status.stats.connection.connects.toString()
            },
            {
                header: t("connectivity.mqtt.disconnects"),
                body: status.stats.connection.disconnects.toString()
            },
            {
                header: t("connectivity.mqtt.reconnects"),
                body: status.stats.connection.reconnects.toString()
            },
            {
                header: t("connectivity.mqtt.errors"),
                body: status.stats.connection.errors.toString()
            },
        ];

        return <TextInformationGrid items={items}/>;
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
            <Grid2
                container
                direction="row"
                style={{marginTop: "1rem"}}
            >
                <Grid2
                    style={{flexGrow: 1}}
                    p={1}
                >
                    <Card
                        sx={{boxShadow: 3}}
                    >
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {t("connectivity.mqtt.messageStatistics")}
                            </Typography>
                            <Divider/>
                            {getMessageStats()}
                        </CardContent>
                    </Card>
                </Grid2>
                <Grid2
                    style={{flexGrow: 1}}
                    p={1}
                >
                    <Card
                        sx={{boxShadow: 3}}
                    >
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                {t("connectivity.mqtt.connectionStatistics")}
                            </Typography>
                            <Divider/>
                            {getConnectionStats()}
                        </CardContent>
                    </Card>
                </Grid2>
            </Grid2>
        </Grid2>
    );
};


const GroupBox = (props: {
    title: string,
    children: React.ReactNode,
    checked?: boolean,
    disabled?: boolean,
    onChange?: ((event: React.ChangeEvent<HTMLInputElement>) => void)
}): React.ReactElement => {
    let title = (
        <Typography
            variant="subtitle1"
            sx={{
                marginBottom: 0,
                userSelect: "none"
            }}
        >
            {props.title}
        </Typography>
    );
    if (props.onChange) {
        title = (
            <FormControlLabel
                control={
                    <Checkbox
                        checked={props.checked}
                        disabled={props.disabled}
                        onChange={props.onChange}
                    />
                }
                disableTypography
                label={title}
            />
        );
    }

    return (
        <Container sx={{m: 0.2}}>
            {title}
            <Collapse in={props.checked || !props.onChange} appear={false}>
                <div>
                    {props.children}
                </div>
            </Collapse>
            <Box pt={1}/>
        </Container>
    );
};

const MQTTInput: React.FunctionComponent<{
    mqttConfiguration: MQTTConfiguration,
    modifyMQTTConfig: (value: any, configPath: Array<string>) => void,
    disabled?: boolean,

    title: string,
    helperText: string,
    required: boolean,
    configPath: Array<string>,
    additionalProps?: InputProps
    inputPostProcessor?: (value: any) => any
}> = ({
    mqttConfiguration,
    modifyMQTTConfig,
    disabled = false,

    title,
    helperText,
    required,
    configPath,
    additionalProps,
    inputPostProcessor
}) => {
    const idBase = "mqtt-config-" + configPath.join("-");
    const inputId = idBase + "-input";
    const helperId = idBase + "-helper";
    const value = getIn(mqttConfiguration, configPath);
    const error = required && !value;

    return (
        <FormControl
            required={required}
            error={error}
            component="fieldset"
            sx={{ml: 1, mt: 2}}

        >
            <InputLabel htmlFor={inputId}>{title}</InputLabel>
            <Input
                id={inputId}
                value={value}
                onChange={(e) => {
                    let newValue = additionalProps?.type === "number" ? parseInt(e.target.value) : e.target.value;
                    if (inputPostProcessor) {
                        newValue = inputPostProcessor(newValue);
                    }

                    modifyMQTTConfig(newValue, configPath);
                }}
                aria-describedby={helperId}

                {...additionalProps}
            />
            <FormHelperText id={helperId} sx={{userSelect: "none"}}>
                {helperText}
            </FormHelperText>
        </FormControl>
    );
};

const MQTTSwitch: React.FunctionComponent<{
    mqttConfiguration: MQTTConfiguration,
    modifyMQTTConfig: (value: any, configPath: Array<string>) => void,
    disabled?: boolean,

    title: string,
    configPath: Array<string>,
}> = ({
    mqttConfiguration,
    modifyMQTTConfig,
    disabled = false,

    title,
    configPath,
}) => {
    const value = getIn(mqttConfiguration, configPath);
    return (
        <FormControlLabel
            control={
                <Switch checked={value} onChange={(e) => {
                    modifyMQTTConfig(e.target.checked, configPath);
                }}/>
            }

            label={title}
            sx={{userSelect: "none"}}
        />
    );
};

const MQTTOptionalExposedCapabilitiesEditor: React.FunctionComponent<{
    mqttConfiguration: MQTTConfiguration,
    modifyMQTTConfig: (value: any, configPath: Array<string>) => void,
    disabled?: boolean,

    configPath: Array<string>,
    exposableCapabilities: Array<string>
}> = ({
    mqttConfiguration,
    modifyMQTTConfig,
    disabled = false,

    configPath,
    exposableCapabilities
}) => {
    let selection: Array<string> = getIn(mqttConfiguration, configPath);

    return (
        <Container sx={{m: 0.2}}>
            <FormGroup>
                {
                    exposableCapabilities.map((capabilityName: string) => {
                        return (
                            <FormControlLabel
                                key={capabilityName}
                                control={
                                    <Checkbox
                                        checked={selection.includes(capabilityName)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                selection.push(capabilityName);
                                            } else {
                                                selection = selection.filter(e => {
                                                    return e !== capabilityName;
                                                });
                                            }

                                            modifyMQTTConfig(selection, configPath);
                                        }
                                        }
                                    />
                                }

                                label={capabilityName}
                                sx={{userSelect: "none"}}
                            />
                        );
                    })
                }

            </FormGroup>
        </Container>
    );
};

const sanitizeStringForMQTT = (value: string, allowSlashes = false) => {
    /*
      This rather limited set of characters is unfortunately required by Home Assistant
      Without Home Assistant, it would be enough to replace [\s+#/]

      See also: https://www.home-assistant.io/docs/mqtt/discovery/#discovery-topic
     */
    return value.replace(
        allowSlashes ? /[^a-zA-Z0-9_\-/]/g : /[^a-zA-Z0-9_-]/g,
        ""
    );
};

const sanitizeTopicPrefix = (value: string) => {
    return value.replace(
        /^\//,
        ""
    ).replace(
        /\/$/,
        ""
    );
};

const sanitizeConfigBeforeSaving = (mqttConfiguration: MQTTConfiguration) => {
    mqttConfiguration.customizations.topicPrefix = sanitizeTopicPrefix(mqttConfiguration.customizations.topicPrefix);
};

const MQTTConnectivity = (): React.ReactElement => {
    const theme = useTheme();
    const {t} = useTranslation();

    const [anchorElement, setAnchorElement] = React.useState(null);

    const identifierElement = React.useRef(null);
    const topicElement = React.useRef(null);

    const {
        data: storedMQTTConfiguration,
        isPending: mqttConfigurationPending,
        isError: mqttConfigurationError,
    } = useMQTTConfigurationQuery();

    const {
        data: mqttStatus,
        isPending: mqttStatusPending,
        isError: mqttStatusError,
    } = useMQTTStatusQuery();

    const {
        data: mqttProperties,
        isPending: mqttPropertiesPending,
        isError: mqttPropertiesError
    } = useMQTTPropertiesQuery();

    const {mutate: updateMQTTConfiguration, isPending: mqttConfigurationUpdating} = useMQTTConfigurationMutation();

    const [mqttConfiguration, setMQTTConfiguration] = React.useState<MQTTConfiguration | null>(null);
    const [configurationModified, setConfigurationModified] = React.useState<boolean>(false);


    const [showMQTTAuthPasswordAsPlain, setShowMQTTAuthPasswordAsPlain] = React.useState(false);

    React.useEffect(() => {
        if (storedMQTTConfiguration && !configurationModified && !mqttConfigurationUpdating) {
            setMQTTConfiguration(deepCopy(storedMQTTConfiguration));
            setConfigurationModified(false);
        }
    }, [storedMQTTConfiguration, configurationModified, mqttConfigurationUpdating]);

    const modifyMQTTConfig = React.useCallback((value: any, configPath: Array<string>): void => {
        if (!mqttConfiguration) {
            return;
        }
        const newConfig = deepCopy(mqttConfiguration);
        setIn(newConfig, value, configPath);
        setMQTTConfiguration(newConfig);
        setConfigurationModified(true);
    }, [mqttConfiguration]);

    if (mqttConfigurationPending || mqttPropertiesPending || !mqttConfiguration) {
        return (
            <>
                <Skeleton height={"12rem"}/>
                <Divider sx={{mt: 1}} style={{marginBottom: "1rem"}}/>
                <Skeleton height={"36rem"}/>
            </>
        );
    }

    if (mqttConfigurationError || mqttPropertiesError || !storedMQTTConfiguration || !mqttProperties) {
        return <Typography color="error">{t("connectivity.mqtt.configLoadError")}</Typography>;
    }

    return (
        <>
            <MQTTStatusComponent
                status={mqttStatus}
                statusLoading={mqttStatusPending}
                statusError={mqttStatusError}
            />
            <Divider sx={{mt: 1}} style={{marginBottom: "1rem"}}/>

            <FormControlLabel
                control={
                    <Checkbox
                        checked={mqttConfiguration.enabled}
                        onChange={e => {
                            modifyMQTTConfig(e.target.checked, ["enabled"]);
                        }}
                    />
                }
                label={t("connectivity.mqtt.enabled")}
                sx={{userSelect: "none", marginLeft: "0.5rem", marginBottom: "0.5rem"}}
            />

            <GroupBox title={t("connectivity.mqtt.connection")}>
                <MQTTInput
                    mqttConfiguration={mqttConfiguration}
                    modifyMQTTConfig={modifyMQTTConfig}

                    title={t("connectivity.mqtt.host")}
                    helperText={t("connectivity.mqtt.hostHelper")}
                    required={true}
                    configPath={["connection", "host"]}
                    inputPostProcessor={(value) => {
                        return extractHostFromUrl(value);
                    }}
                />
                <MQTTInput
                    mqttConfiguration={mqttConfiguration}
                    modifyMQTTConfig={modifyMQTTConfig}

                    title={t("connectivity.mqtt.port")}
                    helperText={t("connectivity.mqtt.portHelper")}
                    required={true}
                    configPath={["connection", "port"]}
                    additionalProps={{type: "number"}}
                />

                <GroupBox title="TLS" checked={mqttConfiguration.connection.tls.enabled}
                    onChange={(e) => {
                        modifyMQTTConfig(e.target.checked, ["connection", "tls", "enabled"]);
                    }}>
                    <MQTTInput
                        mqttConfiguration={mqttConfiguration}
                        modifyMQTTConfig={modifyMQTTConfig}

                        title={t("connectivity.mqtt.ca")}
                        helperText={t("connectivity.mqtt.caHelper")}
                        required={false}
                        configPath={["connection", "tls", "ca"]}
                        additionalProps={{
                            multiline: true,
                            minRows: 3,
                            maxRows: 10,
                        }}
                    />
                    <br/><br/>
                    <MQTTSwitch
                        mqttConfiguration={mqttConfiguration}
                        modifyMQTTConfig={modifyMQTTConfig}
                        title={t("connectivity.mqtt.ignoreCertificateErrors")}
                        configPath={["connection", "tls", "ignoreCertificateErrors"]}
                    />
                </GroupBox>

                <GroupBox title={t("connectivity.mqtt.authentication")}>
                    <GroupBox title={t("connectivity.mqtt.credentials")}
                        checked={mqttConfiguration.connection.authentication.credentials.enabled}
                        onChange={(e) => {
                            modifyMQTTConfig(e.target.checked, ["connection", "authentication", "credentials", "enabled"]);
                        }}>
                        <MQTTInput
                            mqttConfiguration={mqttConfiguration}
                            modifyMQTTConfig={modifyMQTTConfig}

                            title={t("connectivity.mqtt.username")}
                            helperText={t("connectivity.mqtt.usernameHelper")}
                            required={true}
                            configPath={["connection", "authentication", "credentials", "username"]}
                        />
                        <MQTTInput
                            mqttConfiguration={mqttConfiguration}
                            modifyMQTTConfig={modifyMQTTConfig}

                            title={t("connectivity.mqtt.password")}
                            helperText={t("connectivity.mqtt.passwordHelper")}
                            required={false}
                            configPath={["connection", "authentication", "credentials", "password"]}
                            additionalProps={{
                                type: showMQTTAuthPasswordAsPlain ? "text" : "password",
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => {
                                                setShowMQTTAuthPasswordAsPlain(!showMQTTAuthPasswordAsPlain);
                                            }}
                                            onMouseDown={e => {
                                                e.preventDefault();
                                            }}
                                            edge="end"
                                        >
                                            {showMQTTAuthPasswordAsPlain ? <VisibilityOffIcon/> : <VisibilityIcon/>}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                    </GroupBox>
                    <GroupBox title={t("connectivity.mqtt.clientCertificate")}
                        checked={mqttConfiguration.connection.authentication.clientCertificate.enabled}
                        onChange={(e) => {
                            modifyMQTTConfig(e.target.checked, ["connection", "authentication", "clientCertificate", "enabled"]);
                        }}>

                        <MQTTInput
                            mqttConfiguration={mqttConfiguration}
                            modifyMQTTConfig={modifyMQTTConfig}

                            title={t("connectivity.mqtt.certificate")}
                            helperText={t("connectivity.mqtt.certificateHelper")}
                            required={true}
                            configPath={["connection", "authentication", "clientCertificate", "certificate"]}
                            additionalProps={{
                                multiline: true,
                                minRows: 3,
                                maxRows: 10
                            }}
                        />
                        <MQTTInput
                            mqttConfiguration={mqttConfiguration}
                            modifyMQTTConfig={modifyMQTTConfig}

                            title={t("connectivity.mqtt.key")}
                            helperText={t("connectivity.mqtt.keyHelper")}
                            required={true}
                            configPath={["connection", "authentication", "clientCertificate", "key"]}
                            additionalProps={{
                                multiline: true,
                                minRows: 3,
                                maxRows: 10
                            }}
                        />
                    </GroupBox>
                </GroupBox>
            </GroupBox>

            <GroupBox title={t("connectivity.mqtt.integrations")}>
                <GroupBox title="Home Assistant" checked={mqttConfiguration.interfaces.homeassistant.enabled}
                    onChange={(e) => {
                        modifyMQTTConfig(e.target.checked, ["interfaces", "homeassistant", "enabled"]);
                    }}>
                    <FormControl component="fieldset" variant="standard">
                        <FormGroup sx={{marginLeft: "1rem"}}>
                            <MQTTSwitch
                                mqttConfiguration={mqttConfiguration}
                                modifyMQTTConfig={modifyMQTTConfig}
                                title={t("connectivity.mqtt.deleteAutodiscoveryOnShutdown")}
                                configPath={["interfaces", "homeassistant", "cleanAutoconfOnShutdown"]}
                            />
                        </FormGroup>
                    </FormControl>
                </GroupBox>

                <GroupBox title="Homie" checked={mqttConfiguration.interfaces.homie.enabled}
                    onChange={(e) => {
                        modifyMQTTConfig(e.target.checked, ["interfaces", "homie", "enabled"]);
                    }}>
                    <FormControl component="fieldset" variant="standard">
                        <FormGroup sx={{marginLeft: "1rem"}}>
                            <MQTTSwitch
                                mqttConfiguration={mqttConfiguration}
                                modifyMQTTConfig={modifyMQTTConfig}
                                title={t("connectivity.mqtt.deleteAutodiscoveryOnShutdown")}
                                configPath={["interfaces", "homie", "cleanAttributesOnShutdown"]}
                            />
                        </FormGroup>
                    </FormControl>
                </GroupBox>
            </GroupBox>

            <GroupBox title={t("connectivity.mqtt.customizations")}>
                <MQTTInput
                    mqttConfiguration={mqttConfiguration}
                    modifyMQTTConfig={modifyMQTTConfig}

                    title={t("connectivity.mqtt.topicPrefix")}
                    helperText={t("connectivity.mqtt.topicPrefixHelper")}
                    required={false}
                    configPath={["customizations", "topicPrefix"]}
                    additionalProps={{
                        placeholder: mqttProperties.defaults.customizations.topicPrefix,
                        color: "warning",
                        onFocus: () => {
                            setAnchorElement(topicElement.current);
                        },
                        onBlur: () => {
                            setAnchorElement(null);
                        },
                    }}
                    inputPostProcessor={(value) => {
                        return sanitizeStringForMQTT(
                            value,
                            true
                        ).replace(
                            /\/\//g,
                            "/"
                        );
                    }}
                />
                <MQTTInput
                    mqttConfiguration={mqttConfiguration}
                    modifyMQTTConfig={modifyMQTTConfig}

                    title={t("connectivity.mqtt.identifier")}
                    helperText={t("connectivity.mqtt.identifierHelper")}
                    required={false}
                    configPath={["identity", "identifier"]}
                    additionalProps={{
                        placeholder: mqttProperties.defaults.identity.identifier,
                        color: "secondary",
                        onFocus: () => {
                            setAnchorElement(identifierElement.current);
                        },
                        onBlur: () => {
                            setAnchorElement(null);
                        },
                    }}
                    inputPostProcessor={(value) => {
                        return sanitizeStringForMQTT(value, false);
                    }}
                />
                <br/>
                <Typography variant="subtitle2" sx={{mt: "0.5rem", mb: "2rem", userSelect: "none"}} noWrap={false}>
                    {t("connectivity.mqtt.topicStructure")}<br/>
                    <span style={{
                        fontFamily: "\"JetBrains Mono\",monospace",
                        fontWeight: 200,
                        overflowWrap: "anywhere",
                        userSelect: "text"
                    }}>
                        <span
                            style={{
                                color: theme.palette.warning.main
                            }}
                            ref={topicElement}
                        >
                            {sanitizeTopicPrefix(mqttConfiguration.customizations.topicPrefix) || mqttProperties.defaults.customizations.topicPrefix}
                        </span>
                        /<wbr/>
                        <span
                            style={{
                                color: theme.palette.secondary.main
                            }}
                            ref={identifierElement}
                        >
                            {mqttConfiguration.identity.identifier || mqttProperties.defaults.identity.identifier}
                        </span>
                            /<wbr/>BatteryStateAttribute/<wbr/>level
                    </span>
                </Typography>
                <MQTTSwitch
                    mqttConfiguration={mqttConfiguration}
                    modifyMQTTConfig={modifyMQTTConfig}
                    title={t("connectivity.mqtt.provideMapData")}
                    configPath={["customizations", "provideMapData"]}
                />
            </GroupBox>

            {
                mqttProperties.optionalExposableCapabilities.length > 0 &&
                <GroupBox title={t("connectivity.mqtt.optionallyExposableCapabilities")}>
                    <MQTTOptionalExposedCapabilitiesEditor
                        mqttConfiguration={mqttConfiguration}
                        modifyMQTTConfig={modifyMQTTConfig}
                        configPath={["optionalExposedCapabilities"]}
                        exposableCapabilities={mqttProperties.optionalExposableCapabilities}
                    />
                </GroupBox>
            }

            <Popper
                open={Boolean(anchorElement)}
                anchorEl={anchorElement}
            >
                <Box>
                    <ArrowUpward fontSize={"large"} color={"info"}/>
                </Box>
            </Popper>

            <InfoBox
                boxShadow={5}
                style={{
                    marginTop: "2rem",
                    marginBottom: "2rem"
                }}
            >
                <Typography color="info">
                    {t("connectivity.mqtt.infoLine1")}<br/>
                    {t("connectivity.mqtt.infoLine2")}
                    <br/>
                    {t("connectivity.mqtt.infoLine3")}
                </Typography>
            </InfoBox>

            <Divider sx={{mt: 1}} style={{marginBottom: "1rem"}}/>

            <Grid2 container>
                <Grid2 style={{marginLeft: "auto"}}>
                    <Button
                        disabled={!configurationModified}
                        loading={mqttConfigurationUpdating}
                        color="primary"
                        variant="outlined"
                        onClick={() => {
                            sanitizeConfigBeforeSaving(mqttConfiguration);

                            updateMQTTConfiguration(mqttConfiguration);
                            setConfigurationModified(false);
                        }}
                    >
                        {t("connectivity.common.saveConfiguration")}
                    </Button>
                </Grid2>
            </Grid2>
        </>
    );
};

const MQTTConnectivityPage = (): React.ReactElement => {
    const {t} = useTranslation();

    const {
        isFetching: mqttStatusFetching,
        refetch: refetchMqttStatus,
    } = useMQTTStatusQuery();

    return (
        <PaperContainer>
            <Grid2 container direction="row">
                <Box style={{width: "100%"}}>
                    <DetailPageHeaderRow
                        title={t("connectivity.mqtt.title")}
                        icon={<MQTTIcon/>}
                        onRefreshClick={() => {
                            refetchMqttStatus().catch(() => {
                                /* intentional */
                            });
                        }}
                        isRefreshing={mqttStatusFetching}
                    />
                    <MQTTConnectivity/>
                </Box>
            </Grid2>
        </PaperContainer>
    );
};

export default MQTTConnectivityPage;
