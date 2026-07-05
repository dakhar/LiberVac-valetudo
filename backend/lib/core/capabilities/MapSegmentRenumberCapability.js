const Capability = require("./Capability");
const NotImplementedError = require("../NotImplementedError");

/**
 * @template {import("../ValetudoRobot")} T
 * @extends Capability<T>
 */
class MapSegmentRenumberCapability extends Capability {
    /**
     * Sets the whole-home clean order by assigning each segment a clean-order position
     * (cleanSeq) from its index in the provided list: segmentIds[0] is cleaned first,
     * segmentIds[1] second, and so on. The list should contain every current segment id.
     *
     * @param {Array<string>} segmentIds - segment ids in the desired clean order
     * @returns {Promise<void>}
     */
    async setSegmentOrder(segmentIds) {
        throw new NotImplementedError();
    }

    getType() {
        return MapSegmentRenumberCapability.TYPE;
    }
}

MapSegmentRenumberCapability.TYPE = "MapSegmentRenumberCapability";

module.exports = MapSegmentRenumberCapability;
