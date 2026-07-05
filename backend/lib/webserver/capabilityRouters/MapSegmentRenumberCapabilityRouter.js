const CapabilityRouter = require("./CapabilityRouter");
const ValetudoMapSegment = require("../../entities/core/ValetudoMapSegment");

class MapSegmentRenumberCapabilityRouter extends CapabilityRouter {
    initRoutes() {
        this.router.put("/", this.validator, async (req, res) => {
            if (req.body.action === "set_segment_number") {
                if (req.body.segment_id !== undefined && req.body.new_number !== undefined) {
                    try {
                        await this.capability.setSegmentNumber(
                            new ValetudoMapSegment({id: `${req.body.segment_id}`}),
                            `${req.body.new_number}`
                        );

                        res.sendStatus(200);
                    } catch (e) {
                        this.sendErrorResponse(req, res, e);
                    }
                } else {
                    res.sendStatus(400);
                }
            } else {
                res.sendStatus(400);
            }
        });
    }
}

module.exports = MapSegmentRenumberCapabilityRouter;
