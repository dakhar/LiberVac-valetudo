const fs = require("node:fs");
const Logger = require("../../Logger");
const MideaJ15MaxUltraValetudoRobot = require("./MideaJ15MaxUltraValetudoRobot");

/*
 * The Midea V16 (product_model "v16_singapore_blue", device.type "MD-SHIHU-DMAOVS-RB-01-L")
 * shares the RK3566 "SHIHU" platform with the J15 Max Ultra and is ~98% identical in firmware,
 * so it reuses that implementation. It is only distinguished by its device.sn8.
 */
class MideaV16ValetudoRobot extends MideaJ15MaxUltraValetudoRobot {
    getModelName() {
        return "V16";
    }

    // The V16's on-device MSmart provisioning daemon listens on TCP 6444
    // (the standard Midea LAN port), not 9999 like the J15 family.
    getWifiProvisioningPort() {
        return 6444;
    }

    static IMPLEMENTATION_AUTO_DETECTION_HANDLER() {
        let sn8;

        try {
            sn8 = fs.readFileSync("/oem/midea/device.sn8").toString().trim();
        } catch (e) {
            //This is intentionally failing if we're the wrong implementation
            Logger.trace("cannot read", "/oem/midea/device.sn8", e);
        }

        return ["750000GH"].includes(sn8);
    }
}

module.exports = MideaV16ValetudoRobot;
