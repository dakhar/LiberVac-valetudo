import {useCurrentStatisticsQuery} from "../api";
import {Box, CircularProgress, Grid2, Paper, Typography} from "@mui/material";
import {Equalizer as StatisticsIcon} from "@mui/icons-material";
import React from "react";
import {getFriendlyStatName, getHumanReadableStatValue} from "../utils";
import ControlsCard from "./ControlsCard";
import {useTranslation} from "react-i18next";

const CurrentStatistics = (): React.ReactElement => {
    const {t} = useTranslation();
    const {
        data: currentStatistics,
        isPending: statisticsPending,
        isError: statisticsLoadError,
    } = useCurrentStatisticsQuery();

    const body = React.useMemo(() => {
        if (statisticsPending) {
            return (
                <Grid2>
                    <CircularProgress size={20}/>
                </Grid2>
            );
        }

        if (statisticsLoadError || !Array.isArray(currentStatistics)) {
            return (
                <Paper>
                    <Box p={1}>
                        <Typography color="error">{t("currentStatistics.errorLoading")}</Typography>
                    </Box>
                </Paper>
            );
        }

        return currentStatistics.map((stat, i) => {
            return (
                <Grid2 size="grow" container direction="column" key={i}>
                    <Grid2>
                        <Typography variant="subtitle2">
                            {getFriendlyStatName(stat, t)}
                        </Typography>
                    </Grid2>
                    <Grid2 style={{maxHeight: "2rem"}}>{getHumanReadableStatValue(stat)}</Grid2>
                </Grid2>
            );
        });
    }, [
        statisticsPending,
        statisticsLoadError,
        currentStatistics,
        t
    ]);

    return (
        <ControlsCard icon={StatisticsIcon} title={t("currentStatistics.title")} isLoading={statisticsPending}>
            <Grid2 container direction="row">
                {body}
            </Grid2>
        </ControlsCard>
    );
};

export default CurrentStatistics;
