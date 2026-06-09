import {Box, Divider, Grid2, styled} from "@mui/material";
import ControlsBody from "./controls";
import {useIsMobileView} from "./hooks";
import {FullHeightGrid} from "./components/FullHeightGrid";
import LiveMapPage from "./map/LiveMapPage";
import MobileControls from "./controls/MobileControls";
import CameraOverlay from "./components/CameraOverlay";
import React from "react";

const MapWithCamera = (): React.ReactElement => (
    <Box sx={{position: "relative", height: "100%", width: "100%"}}>
        <LiveMapPage/>
        <CameraOverlay/>
    </Box>
);

const ScrollableGrid = styled(Grid2)({
    overflow: "auto",
});

const HomePage = (): React.ReactElement => {
    const mobileView = useIsMobileView();
    const [mobileControlsOpen, setMobileControlsOpen] = React.useState(false);

    if (mobileView) {
        return (
            <Box sx={{
                height: "100%",
                width: "100%",
                overflow: "hidden"
            }}>
                <Box sx={{
                    height: "calc(100% - 68px)",
                    display: mobileControlsOpen ? "none" : "inherit"
                }}>
                    <MapWithCamera/>
                </Box>
                <Box sx={{
                    height: "5%",
                    display: mobileControlsOpen ? "inherit" : "none"
                }}>
                    &nbsp;
                </Box>

                <MobileControls
                    open={mobileControlsOpen}
                    setOpen={setMobileControlsOpen}
                />
            </Box>
        );
    }

    return (
        <FullHeightGrid container direction="row" justifyContent="space-evenly">
            <Grid2 size="grow">
                <MapWithCamera/>
            </Grid2>
            <Divider orientation="vertical"/>
            <ScrollableGrid size={{sm:4, md: 4, lg: 4, xl: 3}}>
                <Box m={1}>
                    <ControlsBody/>
                </Box>
            </ScrollableGrid>
        </FullHeightGrid>
    );
};

export default HomePage;
