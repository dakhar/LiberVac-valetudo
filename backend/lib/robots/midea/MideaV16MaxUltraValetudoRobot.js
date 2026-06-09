const fs = require("node:fs");
const Logger = require("../../Logger");
const MideaJ15MaxUltraValetudoRobot = require("./MideaJ15MaxUltraValetudoRobot");

/**
 * Midea-branded variant of the Eureka J15 Max Ultra. Identical hardware (sn8 750000GH,
 * RK3566 "SHIHU" board) and therefore the exact same implementation — only the displayed
 * identity differs. Midea documents this unit as the "V15 Max Ultra", while the firmware
 * itself reports V16, hence the class name.
 */
class MideaV16MaxUltraValetudoRobot extends MideaJ15MaxUltraValetudoRobot {
    getManufacturer() {
        return "Midea";
    }

    getModelName() {
        return "V15 Max Ultra";
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

module.exports = MideaV16MaxUltraValetudoRobot;
