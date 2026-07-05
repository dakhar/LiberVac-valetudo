import {
    Capability,
    MapSegmentMaterial,
    RawMapLayerMaterial,
    StatusState,
    useJoinSegmentsMutation,
    useMapSegmentMaterialControlPropertiesQuery,
    useRenameSegmentMutation,
    useSetSegmentMaterialMutation,
    useSetSegmentOrderMutation,
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
    IconButton,
    List,
    ListItem,
    ListItemText,
    Radio,
    RadioGroup,
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
    DragHandle as DragHandleIcon,
    FormatListNumbered as CleanOrderIcon,
    JoinFull as JoinIcon,
} from "@mui/icons-material";
import {AddCuttingLineIcon, RenameIcon} from "../../../components/CustomIcons";
import {
    closestCenter,
    DndContext,
    DragEndEvent,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

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

interface SortableSegmentItemProps {
    id: string;
    label: string;
    position: number;
}

const SortableSegmentItem = (props: SortableSegmentItemProps): React.ReactElement => {
    const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id: props.id});

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <ListItem
            ref={setNodeRef}
            style={style}
            divider
            secondaryAction={
                <IconButton
                    edge="end"
                    aria-label="drag"
                    {...attributes}
                    {...listeners}
                    sx={{cursor: "grab", touchAction: "none"}}
                >
                    <DragHandleIcon/>
                </IconButton>
            }
        >
            <ListItemText primary={`${props.position}. ${props.label}`}/>
        </ListItem>
    );
};

interface CleanOrderDialogProps {
    open: boolean;
    onClose: () => void;
    segmentNames: Record<string, string>;
    onSubmit: (orderedIds: string[]) => void;
}

const CleanOrderDialog = (props: CleanOrderDialogProps): React.ReactElement => {
    const {open, onClose, segmentNames, onSubmit} = props;
    const {t} = useTranslation();

    const [order, setOrder] = React.useState<string[]>([]);

    React.useEffect(() => {
        if (open) {
            setOrder(
                Object.keys(segmentNames).sort((a, b) => Number(a) - Number(b))
            );
        }
    }, [open, segmentNames]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {coordinateGetter: sortableKeyboardCoordinates})
    );

    const handleDragEnd = React.useCallback((event: DragEndEvent) => {
        const {active, over} = event;

        if (over !== null && active.id !== over.id) {
            setOrder((items) => {
                return arrayMove(
                    items,
                    items.indexOf(`${active.id}`),
                    items.indexOf(`${over.id}`)
                );
            });
        }
    }, []);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" sx={{userSelect: "none"}}>
            <DialogTitle>{t("mapActions.edit.cleanOrder.title")}</DialogTitle>
            <DialogContent>
                <DialogContentText style={{marginBottom: "1rem"}}>
                    {t("mapActions.edit.cleanOrder.prompt")}
                </DialogContentText>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={order} strategy={verticalListSortingStrategy}>
                        <List>
                            {order.map((id, index) => {
                                const name = segmentNames[id];
                                const label = name && name !== id ?
                                    name :
                                    t("mapActions.edit.cleanOrder.segmentFallback", {id: id});

                                return (
                                    <SortableSegmentItem key={id} id={id} label={label} position={index + 1}/>
                                );
                            })}
                        </List>
                    </SortableContext>
                </DndContext>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t("common.cancel")}</Button>
                <Button
                    onClick={() => {
                        onSubmit(order);
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
    const [cleanOrderDialogOpen, setCleanOrderDialogOpen] = React.useState(false);
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
        mutate: setSegmentOrder,
        isPending: setSegmentOrderExecuting
    } = useSetSegmentOrderMutation({
        onSuccess: onClear,
    });

    const canEdit = props.robotStatus.value === "docked";

    const segmentCount = Object.keys(segmentNames).length;

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

    const handleSetCleanOrder = React.useCallback((orderedIds: string[]) => {
        setCleanOrderDialogOpen(false);

        if (!canEdit || orderedIds.length < 2) {
            return;
        }

        setSegmentOrder({
            segment_ids: orderedIds
        });
    }, [canEdit, setSegmentOrder]);


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
                cuttingLine === undefined &&
                segmentCount >= 2 &&

                <Grid2>
                    <ActionButton
                        disabled={setSegmentOrderExecuting || !canEdit}
                        color="inherit"
                        size="medium"
                        variant="extended"
                        onClick={() => {
                            setCleanOrderDialogOpen(true);
                        }}
                    >
                        <CleanOrderIcon style={{marginRight: "0.25rem", marginLeft: "-0.25rem"}}/>
                        {t("mapActions.edit.cleanOrder.label")}
                        {setSegmentOrderExecuting && (
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
                supportedCapabilities[Capability.MapSegmentRenumber] &&
                <CleanOrderDialog
                    open={cleanOrderDialogOpen}
                    onClose={() => setCleanOrderDialogOpen(false)}
                    segmentNames={segmentNames}
                    onSubmit={handleSetCleanOrder}
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
