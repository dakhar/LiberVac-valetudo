const CapabilityRouter = require("./CapabilityRouter");

class MapSegmentRenumberCapabilityRouter extends CapabilityRouter {
    initRoutes() {
        this.router.put("/", this.validator, async (req, res) => {
            if (req.body.action === "set_order") {
                if (Array.isArray(req.body.segment_ids) && req.body.segment_ids.length > 0) {
                    try {
                        await this.capability.setSegmentOrder(
                            req.body.segment_ids.map(id => `${id}`)
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
