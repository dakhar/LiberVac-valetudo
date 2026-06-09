import i18n from "./index";

/*
 * Quirk title/description/option strings come from the BACKEND (per-robot, in English —
 * see backend MideaQuirkFactory). They are not part of the static t() key system, so we
 * localize them here by quirk id (the stable UUID). Only the DISPLAY is localized; the
 * option VALUE sent back to the robot is always the original backend value.
 *
 * Unknown ids (other robots / new quirks) fall back to the backend-provided English text,
 * so this never breaks — extend RU below to cover more.
 */
interface QuirkText {
    title: string;
    description: string;
    options?: Record<string, string>;
}

const RU: Record<string, QuirkText> = {
    // Hair Cutting
    "afa83002-87db-43bb-b8ff-e4b38863a5d3": {
        title: "Подрезание волос",
        description: "Управление циклом подрезания волос, который запускается на базе после уборки.",
        options: {off: "Выкл", normal: "Обычно", strong: "Сильно"},
    },
    // Hair Cutting Turbo
    "224b6a0a-1a51-48d7-9d4d-61645399d368": {
        title: "Турбо-подрезание волос",
        description: "Включение запустит ещё более сильный цикл подрезания волос при следующей уборке. После этого отключается автоматически.",
        options: {off: "Выкл", on: "Вкл"},
    },
    // AI Obstacle Classification
    "75af01c4-5c24-4cb3-9619-41b46b6ce333": {
        title: "ИИ-классификация препятствий",
        description: "Определяет, должен ли робот и насколько усердно пытаться распознавать встреченные препятствия и обходить их.",
        options: {off: "Выкл", high: "Высокая", normal: "Обычная"},
    },
    // Quiet Auto-Empty
    "96a98473-d60c-4ed9-8ef4-b71f023085a0": {
        title: "Тихая автоочистка контейнера",
        description: "Снижает уровень шума при автоочистке контейнера. Также сделает её менее эффективной.",
        options: {normal: "Обычно", quiet: "Тихо"},
    },
    // Cliff Sensors
    "ef7a7a7f-370b-485d-80fb-704206a9b354": {
        title: "Датчики обрыва",
        description: "! ОПАСНО ! — Позволяет отключить датчики обрыва. Робот БУДЕТ падать с лестниц и может сломаться, если вы это сделаете.",
        options: {on: "Вкл", off: "Выкл"},
    },
    // Carpet First
    "4b100fec-08d5-4227-9edf-eb0198d6ea20": {
        title: "Сначала ковры",
        description: "Когда включено, робот сначала убирает все ковровые зоны, а затем продолжает остальную уборку.",
        options: {off: "Выкл", on: "Вкл"},
    },
    // Deep Carpet Cleaning
    "d2ad3f99-c1b0-4195-9a98-4f13bdb0f1e8": {
        title: "Глубокая чистка ковров",
        description: "Когда включено, робот автоматически медленно убирает обнаруженные ковры с удвоенным числом проходов в чередующихся направлениях.",
        options: {off: "Выкл", on: "Вкл"},
    },
    // Increased Carpet Avoidance
    "f3ff1c65-9fe7-4312-b196-83ce91107fe8": {
        title: "Усиленный объезд ковров",
        description: "Когда включено, при объезде ковров робот держится от них дальше.",
        options: {off: "Выкл", on: "Вкл"},
    },
    // Stain Cleaning
    "d4688a29-a6e4-43c2-ab3a-08ddae40655c": {
        title: "Очистка пятен",
        description: "Когда включено, во время уборки робот обнаруживает пятна и подтёки и уделяет им особое внимание. Из-за оптического сходства эта функция несовместима с объездом препятствий от питомцев.",
        options: {off: "Выкл", on: "Вкл"},
    },
    // Mop Cleaning Frequency
    "12ec228f-6aae-4ba1-b85a-aa090ae4eb3e": {
        title: "Частота промывки швабры",
        description: "Определяет, как часто робот должен промывать и смачивать насадки швабры во время уборки.",
        options: {
            every_5_m2: "Каждые 5 м²",
            every_10_m2: "Каждые 10 м²",
            every_15_m2: "Каждые 15 м²",
            every_20_m2: "Каждые 20 м²",
            every_25_m2: "Каждые 25 м²",
        },
    },
    // Mop Dock Mop Wash Intensity
    "c0ccbdfe-c942-41ac-a770-ad1efdc98f8b": {
        title: "Интенсивность промывки швабры в доке",
        description: "Более высокие значения означают больше воды и более долгие циклы промывки.",
        options: {low: "Низкая", medium: "Средняя", high: "Высокая"},
    },
    // Mop Dock Self-cleaning Frequency
    "8aa6f147-dbcc-44f6-a9f9-2a7f4fb59c7e": {
        title: "Частота самоочистки дока",
        description: "Нужно ли и как часто доку выполнять цикл самоочистки.",
        options: {
            every_cleanup: "После каждой уборки",
            every_3_cleanups: "Каждые 3 уборки",
            every_5_cleanups: "Каждые 5 уборок",
            off: "Выкл",
        },
    },
    // Threshold Recognition
    "2fa33876-f5ad-444d-9084-d51eb7be4670": {
        title: "Распознавание порогов",
        description: "Обнаружение порогов с помощью ИИ-камеры и соответствующие действия.",
        options: {off: "Выкл", on: "Вкл"},
    },
    // Threshold Boost
    "17d539ff-51d3-49be-8b9e-29aa1e9c8d39": {
        title: "Усиление на порогах",
        description: "Автоматически увеличивает мощность всасывания над порогом или рядом с ним. Как режим ковра, но для порогов.",
        options: {off: "Выкл", on: "Вкл"},
    },
};

const isRu = (): boolean => i18n.language?.toLowerCase().startsWith("ru") ?? false;

export const localizeQuirkTitle = (id: string, fallback: string): string => {
    return (isRu() && RU[id]?.title) || fallback;
};

export const localizeQuirkDescription = (id: string, fallback: string): string => {
    return (isRu() && RU[id]?.description) || fallback;
};

export const localizeQuirkOption = (id: string, value: string, fallback: string): string => {
    return (isRu() && RU[id]?.options?.[value]) || fallback;
};
