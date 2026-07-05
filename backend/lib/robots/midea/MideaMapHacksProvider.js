const fs = require("fs");

const entities = require("../../entities");
const Logger = require("../../Logger");

const stateAttrs = entities.state.attributes;

/*
    This class houses a bunch of ugly hacks that are necessary because Valetudo behaves a bit different from the cloud
    Since it doesn't have persistence, it cannot cache data the same way the real cloud would.
    
    Additionally, there is a workaround in here that handles the path data being the only source for the robot position
    and with that, a docked robot sometimes for some reason not rendering as docked.
    I think in normal usage, the app does the same fakery?
    
    Essentially, this class exists because Valetudo tries its best to hide the jank from the user
 */

class MideaMapHacksProvider {
    /**
     * @param {object} options
     * @param {import("./MideaValetudoRobot")} options.robot
     */
    constructor(options) {
        this.robot = options.robot;

        this.lastRoomMetadataUpdate = undefined;
        /** @type {{[key: string]: {material: number, name?: string, displayId?: number}}} */
        this.lastRoomMetadata = {};
    }

    /**
     * @return {boolean}
     */
    get isDocked() {
        const statusStateAttribute = this.robot.state.getFirstMatchingAttributeByConstructor(stateAttrs.StatusStateAttribute);

        return statusStateAttribute?.value === stateAttrs.StatusStateAttribute.VALUE.DOCKED;
    }

    /**
     * @return {{[key: string]: {material: number, name?: string, displayId?: number}}}
     */
    getRoomMetadata() {
        if (this.robot.config.get("embedded") !== true) {
            return {};
        }

        const roomDataStat = fs.statSync(ROOM_DATA_PATH, {throwIfNoEntry: false});
        if (!roomDataStat) {
            this.lastRoomMetadataUpdate = undefined;
            this.lastRoomMetadata = {};

            return this.lastRoomMetadata;
        }

        if (roomDataStat.mtimeMs === this.lastRoomMetadataUpdate) {
            return this.lastRoomMetadata;
        }

        let roomData;
        try {
            const rawRoomData = fs.readFileSync(ROOM_DATA_PATH);
            roomData = JSON.parse(rawRoomData.toString());
        } catch (e) {
            Logger.warn("Error while reading room metadata", e);

            return {};
        }

        this.lastRoomMetadataUpdate = roomDataStat.mtimeMs;
        this.lastRoomMetadata = {};

        for (const room of roomData.rooms ?? []) {
            this.lastRoomMetadata[room.id] = {
                material: room.groundMaterialType ?? 0,
                name: room.name,
                displayId: room.valetudoDisplayId // Valetudo-only segment renumbering; undefined = use the physical id
            };
        }

        return this.lastRoomMetadata;
    }

    /**
     * Returns the physical<->display segment id remap resulting from user renumbering.
     * The display id of a room defaults to its physical id when it was never renumbered.
     *
     * A stored remap is only honored when it still forms a valid permutation of the segment
     * ids currently present (i.e. every display id is itself a present physical id). Should a
     * map change (join/split/new map) have invalidated it, this falls back to identity so the
     * user never ends up with duplicate or dangling numbers.
     *
     * @return {{toDisplay: {[physicalId: string]: string}, toPhysical: {[displayId: string]: string}}}
     */
    getSegmentIdRemap() {
        const meta = this.getRoomMetadata();
        const physicalIds = Object.keys(meta);

        /** @type {{[key: string]: string}} */
        const toDisplay = {};
        /** @type {{[key: string]: string}} */
        const toPhysical = {};
        const usedDisplayIds = new Set();
        let valid = true;

        for (const physicalId of physicalIds) {
            const displayId = meta[physicalId].displayId !== undefined && meta[physicalId].displayId !== null ?
                `${meta[physicalId].displayId}` :
                `${physicalId}`;

            if (usedDisplayIds.has(displayId) || !Object.prototype.hasOwnProperty.call(meta, displayId)) {
                valid = false;
                break;
            }

            usedDisplayIds.add(displayId);
            toDisplay[physicalId] = displayId;
            toPhysical[displayId] = physicalId;
        }

        if (!valid) {
            /** @type {{[key: string]: string}} */
            const identityToDisplay = {};
            /** @type {{[key: string]: string}} */
            const identityToPhysical = {};

            for (const physicalId of physicalIds) {
                identityToDisplay[physicalId] = physicalId;
                identityToPhysical[physicalId] = physicalId;
            }

            return {toDisplay: identityToDisplay, toPhysical: identityToPhysical};
        }

        return {toDisplay, toPhysical};
    }

    /**
     * Translates a display segment id (as seen by the user/UI) back to the physical segment id
     * the robot understands. Returns the input unchanged when there is no active remap.
     *
     * @param {string|number} displayId
     * @return {string}
     */
    resolvePhysicalSegmentId(displayId) {
        return this.getSegmentIdRemap().toPhysical[`${displayId}`] ?? `${displayId}`;
    }

    setName(roomId, newName) {
        if (this.robot.config.get("embedded") !== true) {
            throw new Error("Only possible when embedded");
        }

        const {roomData, originalStat} = this._readRoomData();

        const room = (roomData.rooms ?? []).find(r => `${r.id}` === `${roomId}`);
        if (!room) {
            throw new Error(`Room ${roomId} not found`);
        }

        room.name = newName;

        this._persistRoomData(roomData, originalStat);
    }

    /**
     * Assigns newDisplayId to the segment currently shown as fromDisplayId, swapping display ids
     * with whichever segment already used newDisplayId. This keeps the numbering a permutation of
     * the physical segment ids at all times.
     *
     * @param {string|number} fromDisplayId - the number the target segment currently shows
     * @param {string|number} newDisplayId - the number it should show instead
     */
    setSegmentNumber(fromDisplayId, newDisplayId) {
        if (this.robot.config.get("embedded") !== true) {
            throw new Error("Only possible when embedded");
        }

        fromDisplayId = `${fromDisplayId}`;
        newDisplayId = `${newDisplayId}`;

        if (fromDisplayId === newDisplayId) {
            return;
        }

        const {roomData, originalStat} = this._readRoomData();
        const rooms = roomData.rooms ?? [];

        const displayIdOf = (room) => `${room.valetudoDisplayId ?? room.id}`;

        const roomToRenumber = rooms.find(r => displayIdOf(r) === fromDisplayId);
        const roomToSwapWith = rooms.find(r => displayIdOf(r) === newDisplayId);

        if (!roomToRenumber) {
            throw new Error(`No segment currently numbered ${fromDisplayId}`);
        }
        if (!roomToSwapWith) {
            // Swap semantics: a number can only be taken from an existing segment
            throw new Error(`Cannot assign number ${newDisplayId}: no segment currently uses it`);
        }

        roomToRenumber.valetudoDisplayId = Number(newDisplayId);
        roomToSwapWith.valetudoDisplayId = Number(fromDisplayId);

        // The display id doubles as the clean-order position. The robot itself is told about the
        // new order by MideaMapSegmentRenumberCapability, which pushes the full per-segment
        // cleanSeq via the SET_SEGMENT_CLEAN_ORDER (0x2B) command. Writing cleanSeq into this file
        // directly does NOT work: the room_cfg loader ignores the "cleanSeq" key, so the order has
        // to go through the command path. Here we only persist the Valetudo-side display numbering.
        this._persistRoomData(roomData, originalStat);
    }

    /**
     * @private
     * @return {{roomData: object, originalStat: import("fs").Stats}}
     */
    _readRoomData() {
        let originalStat;
        try {
            originalStat = fs.statSync(ROOM_DATA_PATH);
        } catch (e) {
            throw new Error("Missing room metadata");
        }

        try {
            const rawRoomData = fs.readFileSync(ROOM_DATA_PATH);

            return {roomData: JSON.parse(rawRoomData.toString()), originalStat: originalStat};
        } catch (e) {
            Logger.warn("Error while reading room metadata", e);

            throw new Error("Could not read room metadata");
        }
    }

    /**
     * @private
     * @param {object} roomData
     * @param {import("fs").Stats} originalStat
     */
    _persistRoomData(roomData, originalStat) {
        const tempPath = ROOM_DATA_PATH + ".tmp";
        try {
            fs.writeFileSync(tempPath, JSON.stringify(roomData));

            fs.chownSync(tempPath, originalStat.uid, originalStat.gid);
            fs.chmodSync(tempPath, originalStat.mode);

            fs.renameSync(tempPath, ROOM_DATA_PATH);
        } catch (e) {
            try {
                if (fs.existsSync(tempPath)) {
                    fs.unlinkSync(tempPath);
                }
            } catch (cleanupError) {
                Logger.warn("Failed to delete tmp file", cleanupError);
            }

            Logger.error("Failed to store room metadata", e);
            throw e;
        }
    }
}

const ROOM_DATA_PATH = "/oem/slam/room_cfg02.settings"; // ID 02 seems to be the first stored map? I think?

module.exports = MideaMapHacksProvider;
