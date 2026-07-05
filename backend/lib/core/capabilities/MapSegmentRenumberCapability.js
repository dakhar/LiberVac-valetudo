const Capability = require("./Capability");
const NotImplementedError = require("../NotImplementedError");

/**
 * @template {import("../ValetudoRobot")} T
 * @extends Capability<T>
 */
class MapSegmentRenumberCapability extends Capability {
    /**
     * Assigns newNumber to the given segment.
     *
     * This uses swap semantics: the segment that currently uses newNumber (if any) takes
     * over the number the passed segment had, so the overall numbering always stays a
     * permutation of the existing segment ids.
     *
     * @param {import("../../entities/core/ValetudoMapSegment")} segment
     * @param {string} newNumber
     * @returns {Promise<void>}
     */
    async setSegmentNumber(segment, newNumber) {
        throw new NotImplementedError();
    }

    getType() {
        return MapSegmentRenumberCapability.TYPE;
    }
}

MapSegmentRenumberCapability.TYPE = "MapSegmentRenumberCapability";

module.exports = MapSegmentRenumberCapability;
