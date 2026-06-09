import React from "react";
import PaperContainer from "../components/PaperContainer";
import {ListMenu} from "../components/list_menu/ListMenu";
import {
    ConsumableMeta,
    ConsumableState,
    useConsumablePropertiesQuery,
    useConsumableResetMutation,
    useConsumableStateQuery
} from "../api";
import {LinearProgress, Skeleton} from "@mui/material";
import {ButtonListMenuItem} from "../components/list_menu/ButtonListMenuItem";
import {convertSecondsToHumans, getConsumableName} from "../utils";
import {ConsumablesHelp, ConsumablesHelpRu} from "./res/ConsumablesHelp";
import {useTranslation} from "react-i18next";
import i18n from "../i18n";

const ConsumableButtonListMenuItem: React.FunctionComponent<{
    consumable: ConsumableMeta,
    state?: ConsumableState
}> = ({
    consumable,
    state
}): React.ReactElement => {
    const {t} = useTranslation();
    const {
        mutate: resetConsumable,
        isPending: resetConsumableIsExecuting
    } = useConsumableResetMutation();

    const consumableName = getConsumableName(consumable.type, consumable.subType, t);

    let secondaryLabel = "";
    let buttonColor : "warning" | "error" | undefined;
    let secondaryLabelElement : React.ReactElement | undefined;

    if (state) {
        const remainingValue = state.remaining.unit === "minutes" ?
            convertSecondsToHumans(60 * state.remaining.value, false) :
            `${state.remaining.value} %`;
        secondaryLabel = `${t("consumables.remaining")}: ${remainingValue}`;

        if (state.remaining.value <= 0) {
            buttonColor = "warning";
            secondaryLabel = t("consumables.depleted");
        }


        let percentRemaining;

        if (consumable.unit === "percent") {
            percentRemaining = state.remaining.value / 100;
        } else if (consumable.maxValue !== undefined) {
            percentRemaining = state.remaining.value / consumable.maxValue;
        }

        if (percentRemaining !== undefined) {
            percentRemaining = percentRemaining * 100;
            percentRemaining = Math.round(percentRemaining);
            percentRemaining = Math.max(percentRemaining, 0);
            percentRemaining = Math.min(percentRemaining, 100);

            secondaryLabelElement = (
                <>
                    <LinearProgress
                        variant="determinate"
                        value={percentRemaining}
                        style={{marginTop: "0.5rem", marginBottom: "0.5rem"}}
                    />
                    <span>{secondaryLabel}</span>
                </>
            );
        }
    }



    return (
        <ButtonListMenuItem
            primaryLabel={consumableName}
            secondaryLabel={secondaryLabelElement ?? secondaryLabel}
            buttonLabel={t("consumables.reset")}
            buttonColor={buttonColor}
            confirmationDialog={{
                title: t("consumables.resetConfirmTitle"),
                body: t("consumables.resetConfirmBody", {name: consumableName})
            }}
            action={() => {
                resetConsumable(consumable);
            }}
            actionLoading={resetConsumableIsExecuting}
        />
    );
};

const Consumables = (): React.ReactElement => {
    const {t} = useTranslation();
    const {
        data: consumableProperties,
        isPending: consumablePropertiesPending,
    } = useConsumablePropertiesQuery();

    const {
        data: consumablesData,
        isPending: consumablesDataPending
    } = useConsumableStateQuery();



    const listItems = React.useMemo(() => {
        if (consumableProperties && consumablesData) {
            return consumableProperties.availableConsumables.map((consumable) => {
                return (
                    <ConsumableButtonListMenuItem
                        consumable={consumable}
                        state={consumablesData.find((e) => e.type === consumable.type && e.subType === consumable.subType)}
                        key={`${consumable.type}_${consumable.subType}`
                        }/>
                );
            });
        } else {
            return [];
        }
    }, [consumableProperties, consumablesData]);

    return (
        <PaperContainer>
            <ListMenu
                primaryHeader={t("consumables.title")}
                secondaryHeader={t("consumables.subtitle")}
                listItems={listItems}
                helpText={i18n.language?.toLowerCase().startsWith("ru") ? ConsumablesHelpRu : ConsumablesHelp}
            />
            {
                (consumablePropertiesPending || consumablesDataPending) &&
                <div style={{display: "flex", justifyContent: "center"}}>
                    <Skeleton height={"24rem"} width={"100%"}/>
                </div>

            }
        </PaperContainer>
    );
};

export default Consumables;
