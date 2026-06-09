//Adapted from https://stackoverflow.com/a/34270811/10951033
import {ConsumableSubType, ConsumableType, ValetudoDataPoint} from "./api";
import {useCallback, useLayoutEffect, useRef} from "react";
import type {TFunction} from "i18next";
import i18n from "./i18n";

export function convertSecondsToHumans(seconds: number, showSeconds = true, showDays = true): string {
    let levels;

    if (showDays) {
        levels = [
            {
                value: Math.floor(seconds / 86400),
                label: i18n.t("units.days", {defaultValue: "d"})
            },
            {
                value: Math.floor((seconds % 86400) / 3600).toString().padStart(2, "0"),
                label: i18n.t("units.hours", {defaultValue: "h"})
            },
            {
                value: Math.floor(((seconds % 86400) % 3600) / 60).toString().padStart(2, "0"),
                label: i18n.t("units.minutes", {defaultValue: "m"})
            }
        ];


        if (showSeconds) {
            levels.push(
                {
                    value: (((seconds % 86400) % 3600) % 60).toString().padStart(2, "0"),
                    label: i18n.t("units.seconds", {defaultValue: "s"})
                }
            );
        }
    } else {
        levels = [
            {
                value: Math.floor(seconds / 3600).toString().padStart(2, "0"),
                label: i18n.t("units.hours", {defaultValue: "h"})
            },
            {
                value: Math.floor((seconds % 3600) / 60).toString().padStart(2, "0"),
                label: i18n.t("units.minutes", {defaultValue: "m"})
            }
        ];


        if (showSeconds) {
            levels.push(
                {
                    value: ((seconds % 3600) % 60).toString().padStart(2, "0"),
                    label: i18n.t("units.seconds", {defaultValue: "s"})
                }
            );
        }
    }


    let humanReadableTimespan = "";

    levels.forEach((lvl) => {
        humanReadableTimespan += lvl.value + lvl.label + " ";
    });

    return humanReadableTimespan.trim();
}

export function convertBytesToHumans(bytes: number): string {
    if (bytes >= 1024*1024*1024) {
        return `${(((bytes/1024)/1024)/1024).toFixed(2)} GiB`;
    } else if (bytes >= 1024*1024) {
        return `${((bytes/1024)/1024).toFixed(2)} MiB`;
    } else if (bytes >= 1024) {
        return `${(bytes/1024).toFixed(2)} KiB`;
    } else {
        return `${bytes} bytes`;
    }
}

//Adapted from https://stackoverflow.com/a/41358305
export function convertNumberToRoman(num: number): string {
    const symbols: Record<string, number> = {
        XC: 90,
        L: 50,
        XL: 40,
        X: 10,
        IX: 9,
        V: 5,
        IV: 4,
        I: 1
    };
    let str = "";

    for (const i of Object.keys(symbols)) {
        const quantity = Math.floor(num / symbols[i]);

        num -= quantity * symbols[i];
        str += i.repeat(quantity);
    }

    return str;
}

// Adapted from https://stackoverflow.com/a/53660837
export const median = (numbers: Array<number>): number => { //Note that this will modify the input array
    const sorted = numbers.sort((a, b) => {
        return a - b;
    });
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
};

// Adapted from https://gist.github.com/erikvullings/ada7af09925082cbb89f40ed962d475e
export const deepCopy = <T>(target: T): T => {
    if (target === null) {
        return target;
    }
    if (target instanceof Date) {
        return new Date(target.getTime()) as any;
    }
    if (target instanceof Array) {
        const cp = [] as any[];
        (target as any[]).forEach((v) => {
            cp.push(v);
        });
        return cp.map((n: any) => {
            return deepCopy<any>(n);
        }) as any;
    }
    if (typeof target === "object" && Object.keys(target).length !== 0) {
        const cp = {...(target as { [key: string]: any })} as { [key: string]: any };
        Object.keys(cp).forEach(k => {
            cp[k] = deepCopy<any>(cp[k]);
        });
        return cp as T;
    }
    return target;
};

export const getConsumableName = (
    type: ConsumableType,
    subType: ConsumableSubType | undefined,
    t: TFunction
): string => {
    const typeName = t(`consumables.type.${type}`, {defaultValue: type});
    const subTypeName = subType ? t(`consumables.subType.${subType}`, {defaultValue: ""}) : "";
    const parts = [subTypeName, typeName].filter(Boolean);
    return parts.join(" ") || t("consumables.unknownConsumable", {type: type, subType: subType});
};

export function getFriendlyStatName(stat: ValetudoDataPoint, t: TFunction): string {
    return t(`currentStatistics.statType.${stat.type}`, {defaultValue: stat.type});
}

export function getHumanReadableStatValue(stat: ValetudoDataPoint): string {
    switch (stat.type) {
        case "area":
            return (stat.value / 10000).toFixed(2).padStart(6, "0") + " " + i18n.t("units.squareMeters", {defaultValue: "m²"});
        case "time":
            return convertSecondsToHumans(stat.value, true, false);
        case "count":
            return stat.value.toString();
    }
}

export function formatRelative(timestamp: number | string | Date, t: TFunction): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 0) {
        return t("relative.inTheFuture");
    }

    if (diffInSeconds < 60) {
        return t("relative.justNow");
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return t("relative.minutesAgo", {count: diffInMinutes});
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return t("relative.hoursAgo", {count: diffInHours});
    }

    return format8601Ish(date);
}

export function format8601Ish(date: Date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

//adapted from https://stackoverflow.com/a/60880664
export function adjustHexColorBrightness(hexInput: string, percent: number) : string {
    let hex = hexInput;

    // strip the leading # if it's there
    hex = hex.trim().replace("#","");

    // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
    if (hex.length === 3) {
        hex = hex.replace(/(.)/g, "$1$1");
    }

    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);

    const calculatedPercent = (100 + percent) / 100;

    r = Math.round(Math.min(255, Math.max(0, r * calculatedPercent)));
    g = Math.round(Math.min(255, Math.max(0, g * calculatedPercent)));
    b = Math.round(Math.min(255, Math.max(0, b * calculatedPercent)));

    let result = "#";

    result += r.toString(16).toUpperCase().padStart(2, "0");
    result += g.toString(16).toUpperCase().padStart(2, "0");
    result += b.toString(16).toUpperCase().padStart(2, "0");

    return result;
}

//adapted from https://stackoverflow.com/a/69331524
export const useGetter = <S>(value: S): (() => S) => {
    const ref = useRef(value);
    useLayoutEffect(() => {
        ref.current = value;
    });
    return useCallback(() => {
        return ref.current;
    }, [ref]);
};

export function extractHostFromUrl(value: string): string {
    return value.replace(/^[a-zA-Z]+:\/\//, "").replace(/\/.*/g, "").trim();
}

export let isAprilFools = ((d) => d.getMonth() === 3 && d.getDate() === 1)(new Date());
export function setAprilFools(value: boolean) {
    isAprilFools = value;
}
