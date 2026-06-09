import React, {FunctionComponent} from "react";
import {
    Box,
    Divider,
    FormControl,
    Grid2,
    MenuItem,
    Paper,
    Select,
    SelectChangeEvent,
    Typography
} from "@mui/material";
import {
    Quirk,
    useQuirksQuery,
    useSetQuirkValueMutation
} from "../../api";

import {QuirksHelp, QuirksHelpRu} from "./res/QuirksHelp";
import {Star as QuirksIcon} from "@mui/icons-material";
import PaperContainer from "../../components/PaperContainer";
import DetailPageHeaderRow from "../../components/DetailPageHeaderRow";
import {useTranslation} from "react-i18next";
import {localizeQuirkDescription, localizeQuirkOption, localizeQuirkTitle} from "../../i18n/quirks";

const QuirkControl: FunctionComponent<{ quirk: Quirk, style?: React.CSSProperties }> = (props) => {
    useTranslation(); // re-render on language change so the localized strings below update
    const {mutate: setQuirkValue, isPending: quirkValueSetting} = useSetQuirkValueMutation();
    const handleChange = React.useCallback(
        (event: SelectChangeEvent<string>) => {
            setQuirkValue({
                id: props.quirk.id,
                value: event.target.value
            });
        },
        [props.quirk.id, setQuirkValue]
    );


    return (
        <Grid2
            style={props.style}
            sx={{
                width: {
                    "xs": "100%",
                    "sm": "60%"
                },
                marginLeft: "auto",
                marginRight: "auto"
            }}
        >
            <Paper
                sx={{
                    boxShadow: 3,
                    padding: "1rem"
                }}
            >
                <FormControl
                    variant="standard"
                    style={{
                        width: "100%"
                    }}
                >
                    <Typography variant="body1" sx={{mb: 0}}>
                        {localizeQuirkTitle(props.quirk.id, props.quirk.title)}
                    </Typography>
                    <Divider sx={{mt: 1}} style={{marginBottom: "1rem"}}/>
                    <Select
                        id={props.quirk.id + "-select"}
                        value={props.quirk.value}
                        onChange={handleChange}
                        disabled={quirkValueSetting}

                    >
                        {
                            props.quirk.options.map((o, i) => {
                                return (
                                    <MenuItem
                                        value={o}
                                        key={`${o}_${i}`}
                                    >
                                        {localizeQuirkOption(props.quirk.id, o, o)}
                                    </MenuItem>
                                );
                            })
                        }
                    </Select>
                    <Typography
                        variant="body2"
                        sx={{mb: 1}}
                        style={{marginTop: "1rem"}}
                    >
                        {localizeQuirkDescription(props.quirk.id, props.quirk.description)}
                    </Typography>
                </FormControl>
            </Paper>
        </Grid2>
    );
};

const Quirks: FunctionComponent = () => {
    const {t, i18n} = useTranslation();
    const {
        data: quirks,
        isError: quirksLoadingError,
        isPending: quirksPending,
        isFetching: quirksFetching,
        refetch: refetchQuirks
    } = useQuirksQuery();

    const quirksContent = React.useMemo(() => {
        if (quirksLoadingError) {
            return (
                <Typography color="error" style={{textAlign: "center"}}>
                    {t("quirks.errorLoading")}
                </Typography>
            );
        }

        if (!quirksPending && (!quirks || (Array.isArray(quirks) && quirks.length === 0))) {
            return (
                <Typography style={{textAlign: "center"}}>
                    {t("quirks.none")}
                </Typography>
            );
        }

        if (!quirks) {
            return;
        }


        quirks.sort((qA, qB) => {
            return localizeQuirkTitle(qA.id, qA.title).localeCompare(localizeQuirkTitle(qB.id, qB.title));
        });

        return (
            <>
                {
                    quirks.map((quirk, i) => {
                        return <QuirkControl
                            quirk={quirk}
                            key={quirk.id}
                            style={i === quirks.length -1 ? {} : {paddingBottom: "1rem"}}
                        />;
                    })
                }
            </>
        );


    }, [quirksLoadingError, quirksPending, quirks, t, i18n.language]);


    return (
        <PaperContainer>
            <Grid2 container direction="row">
                <Box style={{width: "100%"}}>
                    <DetailPageHeaderRow
                        title={t("quirks.title")}
                        icon={<QuirksIcon/>}
                        helpText={i18n.language?.toLowerCase().startsWith("ru") ? QuirksHelpRu : QuirksHelp}
                        onRefreshClick={() => {
                            refetchQuirks().catch(() => {
                                /* intentional */
                            });
                        }}
                        isRefreshing={quirksFetching}
                    />

                    <Grid2 container direction="column" style={{marginTop: "1rem"}}>
                        {quirksContent}
                    </Grid2>
                </Box>
            </Grid2>
        </PaperContainer>
    );
};

export default Quirks;
