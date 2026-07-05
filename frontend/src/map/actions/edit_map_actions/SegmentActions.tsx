import {
    Capability,
    MapSegmentMaterial,
    RawMapLayerMaterial,
    StatusState,
    useJoinSegmentsMutation,
    useMapSegmentMaterialControlPropertiesQuery,
    useRenameSegmentMutation,
    useSetSegmentMaterialMutation,
    useSetSegmentNumberMutation,
    useSplitSegmentMutation
} from "../../../api";
import React from "react";
import {useTranslation} from "react-i18next";
import type {TFunction} from "i18next";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormControlLabel,
    Grid2,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    TextField,
    Typography
} from "@mui/material";
import {ActionButton} from "../../Styled";
import CuttingLineClientStructure from "../../structures/client_structures/CuttingLineClientStructure";
import {PointCoordinates} from "../../utils/types";
import {
    Clear as ClearIcon,
    ContentCut as SplitIcon,
    Dashboard as MaterialIcon,
    JoinFull as JoinIcon,
    Numbers as RenumberIcon,
} from "@mui/icons-material";
import {AddCuttingLineIcon, RenameIcon} from "../../../components/CustomIcons";

const getMaterialLabel = (material: MapSegmentMaterial, t: TFunction): string => {
    switch (material) {
        case MapSegmentMaterial.Generic:
            return t("mapActions.edit.material.generic");
        case MapSegmentMaterial.Tile:
            return t("mapActions.edit.material.tile");
        case MapSegmentMaterial.Wood:
            return t("mapActions.edit.material.wood");
        case MapSegmentMaterial.WoodHorizontal:
            return t("mapActions.edit.material.woodHorizontal");
        case MapSegmentMaterial.WoodVertical:
            return t("mapActions.edit.material.woodVertical");
        default:
            return material;
    }
};

interface SegmentRenameDialogProps {
    open: boolean;
    onClose: () => void;
    currentName: string;
    onRename: (newName: string) => void;
}

const SegmentRenameDialog = (props: SegmentRenameDialogProps) => {
    const {open, onClose, currentName, onRename} = props;
    const {t} = useTranslation();
    const [name, setName] = React.useState(currentName);

    React.useEffect(() => {
        if (open) {
            setName(currentName);
        }
    }, [open, currentName]);

    return (
        <Dialog open={open} onClose={onClose} sx={{userSelect: "none"}}>
            <DialogTitle>{t("mapActions.edit.renameSegment")}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    {t("mapActions.edit.renameSegmentPrompt", {name: currentName})}
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    variant="standard"
                    label={t("mapActions.edit.segmentName")}
                    fullWidth
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            onRename(name.trim());
                        }
                    }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("common.cancel")}</Button>
                <Button
                    onClick={() => {
                        onRename(name.trim());
                    }}
                >
                    {t("mapActions.edit.rename")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

interface SegmentMaterialDialogProps {
    open: boolean;
    onClose: () => void;
    name: string;
    currentMaterial: MapSegmentMaterial;
    onSubmit: (material: MapSegmentMaterial) => void;
}

const SegmentMaterialDialog = (props: SegmentMaterialDialogProps) => {
    const {open, onClose, name, currentMaterial, onSubmit} = props;
    const {t} = useTranslation();
    const [material, setMaterial] = React.useState<MapSegmentMaterial>(currentMaterial);

    const {
        data: materialProperties,
        isPending: materialPropertiesPending
    } = useMapSegmentMaterialControlPropertiesQuery();

    React.useEffect(() => {
        if (open) {
            setMaterial(currentMaterial);
        }
    }, [open, currentMaterial]);

    const supportedMaterials = materialProperties?.supportedMaterials ?? [];

    return (
        <Dialog open={open} onClose={onClose} sx={{userSelect: "none"}}>
            <DialogTitle>{t("mapActions.edit.segmentMaterial")}</DialogTitle>
            <DialogContent>
                <DialogContentText style={{marginBottom: "1rem"}}>
                    {t("mapActions.edit.segmentMaterialPrompt", {name: name})}
                </DialogContentText>
                {materialPropertiesPending ? (
                    <CircularProgress/>
                ) : (
                    <FormControl component="fieldset">
                        <RadioGroup
                            value={material}
                            onChange={(e) => setMaterial(e.target.value as MapSegmentMaterial)}
                        >
                            {supportedMaterials.map((material) => (
                                <FormControlLabel
                                    key={material}
                                    value={material}
                                    control={<Radio/>}
                                    label={getMaterialLabel(material, t)}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("common.cancel")}</Button>
                <Button
                    onClick={() => {
                        onSubmit(material);
                    }}
                >
                    {t("common.save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

interface SegmentRenumberDialogProps {
    open: boolean;
    onClose: () => void;
    currentNumber: string;
    currentName: string;
    options: Array<{ number: string; label: string }>;
    onSubmit: (newNumber: string) => void;
}

const SegmentRenumberDialog = (props: SegmentRenumberDialogProps) => {
    const {open, onClose, currentNumber, currentName, options, onSubmit} = props;
    const {t} = useTranslation();
    const [newNumber, setNewNumber] = React.useState(currentNumber);

    React.useEffect(() => {
        if (open) {
            setNewNumber(currentNumber);
        }
    }, [open, currentNumber]);

    return (
        <Dialog open={open} onClose={onClose} sx={{userSelect: "none"}}>
            <DialogTitle>{t("mapActions.edit.renumberSegment")}</DialogTitle>
            <DialogContent>
                <DialogContentText style={{marginBottom: "1rem"}}>
                    {t("mapActions.edit.renumberSegmentPrompt", {name: currentName, number: currentNumber})}
                </DialogContentText>
                <FormControl fullWidth>
                    <InputLabel id="segment-renumber-select-label">
                        {t("mapActions.edit.segmentNumber")}
                    </InputLabel>
                    <Select
                        labelId="segment-renumber-select-label"
                        label={t("mapActions.edit.segmentNumber")}
                        value={newNumber}
                        onChange={(e) => {
                            setNewNumber(`${e.target.value}`);
                        }}
                    >
                        {options.map((option) => (
                            <MenuItem key={option.number} value={option.number}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("common.cancel")}</Button>
                <Button
                    onClick={() => {
                        onSubmit(newNumber);
                    }}
                >
                    {t("common.save")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

interface SegmentActionsProperties {
    robotStatus: StatusState,
    selectedSegmentIds: string[];
    segmentNames: Record<string, string>;
    segmentMaterials: Record<string, RawMapLayerMaterial>;
    cuttingLine: CuttingLineClientStructure | undefined,

    convertPixelCoordinatesToCMSpace(coordinates: PointCoordinates): PointCoordinates

    supportedCapabilities: {
        [Capability.MapSegmentEdit]: boolean,
        [Capability.MapSegmentRename]: boolean,
        [Capability.MapSegmentRenumber]: boolean,
        [Capability.MapSegmentMaterialControl]: boolean,
    }

    onAddCuttingLine(): void,

    onClear(): void;
}

const SegmentActions = (
    props: SegmentActionsProperties
): React.ReactElement => {
    const {
        selectedSegmentIds,
        segmentNames,
        segmentMaterials,
        cuttingLine,
        convertPixelCoordinatesToCMSpace,
        supportedCapabilities,
        onAddCuttingLine,
        onClear
    } = props;
    const {t} = useTranslation();

    const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);
    const [renumberDialogOpen, setRenumberDialogOpen] = React.useState(false);
    const [materialDialogOpen, setMaterialDialogOpen] = React.useState(false);

    const {
        mutate: joinSegments,
        isPending: joinSegmentsExecuting
    } = useJoinSegmentsMutation({
        onSuccess: onClear,
    });
    const {
        mutate: splitSegment,
        isPending: splitSegmentExecuting
    } = useSplitSegmentMutation({
        onSuccess: onClear,
    });
    const {
        mutate: renameSegment,
        isPending: renameSegmentExecuting
    } = useRenameSegmentMutation({
        onSuccess: onClear,
    });
    const {
        mutate: setSegmentMaterial,
        isPending: setSegmentMaterialExecuting
    } = useSetSegmentMaterialMutation({
        onSuccess: onClear,
    });
    const {
        mutate: setSegmentNumber,
        isPending: setSegmentNumberExecuting
    } = useSetSegmentNumberMutation({
        onSuccess: onClear,
    });

    const canEdit = props.robotStatus.value === "docked";

    const segmentNumberOptions = React.useMemo(() => {
        return Object.keys(segmentNames)
            .sort((a, b) => Number(a) - Number(b))
            .map((id) => {
                const name = segmentNames[id];

                return {
                    number: id,
                    label: name && name !== id ? `${id} — ${name}` : id
                };
            });
    }, [segmentNames]);

    const handleSplitClick = React.useCallback(() => {
        if (!canEdit || !cuttingLine || selectedSegmentIds.length !== 1) {
            return;
        }

        splitSegment({
            segment_id: selectedSegmentIds[0],
            pA: convertPixelCoordinatesToCMSpace({
                x: cuttingLine.x0,
                y: cuttingLine.y0
            }),
            pB: convertPixelCoordinatesToCMSpace({
                x: cuttingLine.x1,
                y: cuttingLine.y1
            })
        });
    }, [canEdit, splitSegment, selectedSegmentIds, cuttingLine, convertPixelCoordinatesToCMSpace]);

    const handleJoinClick = React.useCallback(() => {
        if (!canEdit || selectedSegmentIds.length !== 2) {
            return;
        }

        joinSegments({
            segment_a_id: selectedSegmentIds[0],
            segment_b_id: selectedSegmentIds[1],
        });
    }, [canEdit, joinSegments, selectedSegmentIds]);

    const handleRename = React.useCallback((name: string) => {
        if (!canEdit || selectedSegmentIds.length !== 1) {
            return;
        }
        setRenameDialogOpen(false);
        renameSegment({
            segment_id: selectedSegmentIds[0],
            name: name
        });
    }, [canEdit, renameSegment, selectedSegmentIds]);

    const handleSetMaterial = React.useCallback((material: MapSegmentMaterial) => {
        if (!canEdit || selectedSegmentIds.length !== 1) {
            return;
        }
        setMaterialDialogOpen(false);
        setSegmentMaterial({
            segment_id: selectedSegmentIds[0],
            material: material
        });
    }, [canEdit, setSegmentMaterial, selectedSegmentIds]);

    const handleRenumber = React.useCallback((newNumber: string) => {
        setRenumberDialogOpen(false);

        if (!canEdit || selectedSegmentIds.length !== 1 || newNumber === selectedSegmentIds[0]) {
            return;
        }

        setSegmentNumber({
            segment_id: selectedSegmentIds[0],
            new_number: newNumber
        });
    }, [canEdit, setSegmentNumber, selectedSegmentIds]);


    return (
        <Grid2 container spacing={1} direction="row-reverse" flexWrap="wrap-reverse">
            {
                supportedCapabilities[Capability.MapSegmentEdit] &&
                (selectedSegmentIds.length === 1 || selectedSegmentIds.length === 2) &&
                cuttingLine === undefined &&

                <Grid2>
                    <ActionButton
                        disabled={joinSegmentsExecuting || !canEdit || selectedSegmentIds.length !== 2}
                        color="inherit"
                        size="medium"
                        variant="extended"
                        onClick={handleJoinClick}
                    >
                        <JoinIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        {t("mapActions.edit.joinSegments", {
                            segmentA: segmentNames[selectedSegmentIds[0]],
                            segmentB: selectedSegmentIds.length === 2 ? segmentNames[selectedSegmentIds[1]] : "?"
                        })}
                        {joinSegmentsExecuting && (
                            <CircularProgress
                                color="inherit"
                                size={18}
                                style={{marginLeft: 10}}
                            />
                        )}
                    </ActionButton>
                </Grid2>
            }
            {
                supportedCapabilities[Capability.MapSegmentEdit] &&
                selectedSegmentIds.length === 1 &&
                cuttingLine !== undefined &&

                <Grid2>
                    <ActionButton
                        disabled={splitSegmentExecuting || !canEdit}
                        color="inherit"
                        size="medium"
                        variant="extended"
                        onClick={handleSplitClick}
                    >
                        <SplitIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        {t("mapActions.edit.splitSegment", {name: segmentNames[selectedSegmentIds[0]]})}
                        {splitSegmentExecuting && (
                            <CircularProgress
                                color="inherit"
                                size={18}
                                style={{marginLeft: 10}}
                            />
                        )}
                    </ActionButton>
                </Grid2>
            }
            {
                supportedCapabilities[Capability.MapSegmentRename] &&
                selectedSegmentIds.length === 1 &&
                cuttingLine === undefined &&

                <Grid2>
                    <ActionButton
                        disabled={renameSegmentExecuting || !canEdit}
                        color="inherit"
                        size="medium"
                        variant="extended"
                        onClick={() => {
                            setRenameDialogOpen(true);
                        }}
                    >
                        <RenameIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        {t("mapActions.edit.rename")}
                        {renameSegmentExecuting && (
                            <CircularProgress
                                color="inherit"
                                size={18}
                                style={{marginLeft: 10}}
                            />
                        )}
                    </ActionButton>
                </Grid2>
            }
            {
                supportedCapabilities[Capability.MapSegmentRenumber] &&
                selectedSegmentIds.length === 1 &&
                cuttingLine === undefined &&
                segmentNumberOptions.length >= 2 &&

                <Grid2>
                    <ActionButton
                        disabled={setSegmentNumberExecuting || !canEdit}
                        color="inherit"
                        size="medium"
                        variant="extended"
                        onClick={() => {
                            setRenumberDialogOpen(true);
                        }}
                    >
                        <RenumberIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        {t("mapActions.edit.renumber")}
                        {setSegmentNumberExecuting && (
                            <CircularProgress
                                color="inherit"
                                size={18}
                                style={{marginLeft: 10}}
                            />
                        )}
                    </ActionButton>
                </Grid2>
            }
            {
                supportedCapabilities[Capability.MapSegmentMaterialControl] &&
                selectedSegmentIds.length === 1 &&
                cuttingLine === undefined &&

                <Grid2>
                    <ActionButton
                        disabled={setSegmentMaterialExecuting || !canEdit}
                        color="inherit"
                        size="medium"
                        variant="extended"
                        onClick={() => {
                            setMaterialDialogOpen(true);
                        }}
                    >
                        <MaterialIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        {t("mapActions.edit.material.label")}
                        {setSegmentMaterialExecuting && (
                            <CircularProgress
                                color="inherit"
                                size={18}
                                style={{marginLeft: 10}}
                            />
                        )}
                    </ActionButton>
                </Grid2>
            }
            {
                supportedCapabilities[Capability.MapSegmentEdit] &&
                selectedSegmentIds.length === 1 &&
                cuttingLine === undefined &&

                <Grid2>
                    <ActionButton
                        disabled={joinSegmentsExecuting || !canEdit}
                        color="inherit"
                        size="medium"
                        variant="extended"
                        onClick={onAddCuttingLine}
                    >
                        <AddCuttingLineIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        {t("mapActions.edit.cuttingLine")}
                    </ActionButton>
                </Grid2>
            }
            {
                (
                    selectedSegmentIds.length > 0 ||
                    cuttingLine !== undefined
                ) &&

                <Grid2>
                    <ActionButton
                        color="inherit"
                        size="medium"
                        variant="extended"
                        onClick={onClear}
                    >
                        <ClearIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        {t("mapActions.clear")}
                    </ActionButton>
                </Grid2>
            }
            {
                !canEdit &&
                <Grid2>
                    <Typography variant="caption" color="textSecondary">
                        {t("mapActions.edit.editingSegmentsRequiresDocked")}
                    </Typography>
                </Grid2>
            }
            {
                canEdit &&
                selectedSegmentIds.length === 0 &&
                <Grid2>
                    <Typography variant="caption" color="textSecondary" style={{fontSize: "1em"}}>
                        {t("mapActions.edit.selectSegmentToEdit")}
                    </Typography>
                </Grid2>
            }

            {
                supportedCapabilities[Capability.MapSegmentRename] && selectedSegmentIds.length === 1 &&
                <SegmentRenameDialog
                    open={renameDialogOpen}
                    onClose={() => setRenameDialogOpen(false)}
                    currentName={segmentNames[selectedSegmentIds[0]] ?? selectedSegmentIds[0]}
                    onRename={handleRename}
                />
            }

            {
                supportedCapabilities[Capability.MapSegmentRenumber] && selectedSegmentIds.length === 1 &&
                <SegmentRenumberDialog
                    open={renumberDialogOpen}
                    onClose={() => setRenumberDialogOpen(false)}
                    currentNumber={selectedSegmentIds[0]}
                    currentName={segmentNames[selectedSegmentIds[0]] ?? selectedSegmentIds[0]}
                    options={segmentNumberOptions}
                    onSubmit={handleRenumber}
                />
            }

            {
                supportedCapabilities[Capability.MapSegmentMaterialControl] && selectedSegmentIds.length === 1 &&
                <SegmentMaterialDialog
                    open={materialDialogOpen}
                    onClose={() => setMaterialDialogOpen(false)}
                    name={segmentNames[selectedSegmentIds[0]] ?? selectedSegmentIds[0]}
                    currentMaterial={segmentMaterials[selectedSegmentIds[0]] as unknown as MapSegmentMaterial ?? MapSegmentMaterial.Generic}
                    onSubmit={handleSetMaterial}
                />
            }
        </Grid2>
    );
};

export default SegmentActions;
