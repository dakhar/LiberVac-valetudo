const MapSegmentRenumberCapability = require("../../../core/capabilities/MapSegmentRenumberCapability");
const MSmartConst = require("../../../msmart/MSmartConst");
const MSmartPacket = require("../../../msmart/MSmartPacket");
const {sleep} = require("../../../utils/misc");

/**
 * @extends MapSegmentRenumberCapability<import("../MideaValetudoRobot")>
 */
class MideaMapSegmentRenumberCapability extends MapSegmentRenumberCapability {
    /**
     * @param {object} options
     * @param {import("../MideaValetudoRobot")} options.robot
     * @param {import("../MideaMapHacksProvider")} options.mapHacksProvider
     */
    constructor(options) {
        super(options);

        this.mapHacksProvider = options.mapHacksProvider;
    }

    /**
     * On the V16/J15 the whole-home clean order is the per-segment cleanSeq: during a full
     * clean the robot visits segments ordered by this value. The official app sets it with a
     * dedicated SET_SEGMENT_CLEAN_ORDER (0x2B) command carrying the cleanSeq for every segment
     * at once; the firmware persists it into room_cfg and switches the run into customized-order
     * mode (manager _handle_customized_clean_param).
     *
     * We mirror that: persist the new order locally (cleanSeq = position in the list) and push
     * the full cleanSeq table to the robot in one 0x2B command.
     *
     * @param {Array<string>} segmentIds - segment ids in the desired clean order
     * @returns {Promise<void>}
     */
    async setSegmentOrder(segmentIds) {
        this.mapHacksProvider.setSegmentOrder(segmentIds);

        // physicalSegmentId -> cleanSeq (the clean-order position we just persisted)
        const remap = this.mapHacksProvider.getSegmentIdRemap().toDisplay;
        const order = Object.keys(remap).map(physicalId => {
            return {
                roomId: parseInt(physicalId),
                cleanSeq: parseInt(remap[physicalId])
            };
        }).filter(entry => {
            return Number.isInteger(entry.roomId) && Number.isInteger(entry.cleanSeq);
        });

        if (order.length > 0) {
            const response = await this.robot.sendCommand(MideaMapSegmentRenumberCapability.buildCleanOrderPacket(order).toHexString());

            if (response?.payload?.[3] !== 0x00) {
                throw new Error("Setting the segment clean order failed.");
            }
        }

        await sleep(500);
        this.robot.pollMap();
        await sleep(1_000);
    }

    /**
     * Builds the SET_SEGMENT_CLEAN_ORDER (0x2B) packet from the full per-segment cleanSeq list.
     *
     * The frame differs from the other SETTING commands: the payload sub-header uses 0x02 (not
     * the usual 0x01), followed by a leading 0x02 flag, the segment count, one 9-byte record per
     * segment, and a trailing 0x01 byte. Each record is
     * `[marker, roomId, 0x01, 0x00, 0x00, 0x01, 0x78, cleanSeq, 0x00]`; the marker is 0x09 on the
     * first record and 0x01 on the rest (a positional marker, not segment specific). The constant
     * middle bytes are replicated verbatim from the official app - only roomId and cleanSeq vary.
     * Verified byte-for-byte (incl. checksum) against two live captures of different orderings.
     *
     * @param {Array<{roomId: number, cleanSeq: number}>} order
     * @returns {MSmartPacket}
     */
    static buildCleanOrderPacket(order) {
        const records = [];
        order.forEach((entry, i) => {
            records.push(
                i === 0 ? 0x09 : 0x01,
                entry.roomId & 0xFF,
                0x01,
                0x00,
                0x00,
                0x01,
                0x78,
                entry.cleanSeq & 0xFF,
                0x00
            );
        });

        const payload = Buffer.concat([
            Buffer.from([0xAA, 0x02, MSmartConst.SETTING.SET_SEGMENT_CLEAN_ORDER]),
            Buffer.from([0x02, order.length & 0xFF]),
            Buffer.from(records),
            Buffer.from([0x01])
        ]);

        return new MSmartPacket({
            messageType: MSmartPacket.MESSAGE_TYPE.SETTING,
            payload: payload
        });
    }
}

module.exports = MideaMapSegmentRenumberCapability;
