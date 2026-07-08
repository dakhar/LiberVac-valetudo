const DataType = require("../homie/DataType");
const MqttCommonAttributes = require("../MqttCommonAttributes");
const NodeMqttHandle = require("./NodeMqttHandle");
const PropertyMqttHandle = require("./PropertyMqttHandle");
const Tools = require("../../utils/Tools");

/**
 * LiberVac addition: exposes the on-device camera stream URLs over MQTT/Homie.
 *
 * The camera is not a Valetudo capability — it is served locally by the libervac-agent
 * (vidtap -> RTSP :8554/cam) and re-packaged by go2rtc (:1984, WebRTC/MSE) for browsers.
 * This node publishes ready-to-use URLs so Home Assistant (via the Homie integration or a
 * generic camera) and other consumers can find the stream without hard-coding the robot IP.
 *
 * Only attached for robots that actually have a camera (i.e. expose CameraLightControlCapability).
 */
class CameraNodeMqttHandle extends NodeMqttHandle {
    /**
     * @param {object} options
     * @param {import("./RobotMqttHandle")} options.parent
     * @param {import("../MqttController")} options.controller MqttController instance
     * @param {import("../../core/ValetudoRobot")} options.robot
     */
    constructor(options) {
        super(Object.assign(options, {
            topicName: "Camera",
            friendlyName: "Camera",
            type: "Camera",
            helpText: "LiberVac addition. This handle publishes the local camera stream URLs " +
                "(go2rtc WebRTC/MSE player, raw RTSP and HLS). It is only attached for robots " +
                "that feature a camera."
        }));

        this.robot = options.robot;

        this.registerChild(
            new PropertyMqttHandle({
                parent: this,
                controller: this.controller,
                topicName: "stream-url",
                friendlyName: "Stream URL",
                datatype: DataType.STRING,
                format: "url",
                getter: async () => {
                    const ip = Tools.GET_PRIMARY_HOST_IPV4();

                    // go2rtc's built-in player (WebRTC with MSE fallback) — the same URL the
                    // Valetudo camera overlay embeds. Browser-friendly, embeddable in an iframe.
                    return `http://${ip}:${CameraNodeMqttHandle.GO2RTC_PORT}/stream.html?src=${CameraNodeMqttHandle.STREAM_NAME}&mode=webrtc,mse`;
                },
                helpText: "The go2rtc WebRTC/MSE player URL for the camera. Embeddable in a browser " +
                    "or a Home Assistant webpage card."
            })
        );

        this.registerChild(
            new PropertyMqttHandle({
                parent: this,
                controller: this.controller,
                topicName: "rtsp-url",
                friendlyName: "RTSP URL",
                datatype: DataType.STRING,
                format: "url",
                getter: async () => {
                    const ip = Tools.GET_PRIMARY_HOST_IPV4();

                    // Raw native-quality H.264 RTSP served by vidtap. Point a Home Assistant
                    // generic camera / go2rtc / ffmpeg / VLC at this.
                    return `rtsp://${ip}:${CameraNodeMqttHandle.RTSP_PORT}/${CameraNodeMqttHandle.STREAM_NAME}`;
                },
                helpText: "The raw RTSP URL served by vidtap. Suitable for a Home Assistant generic " +
                    "camera, go2rtc, ffmpeg or VLC."
            })
        );

        this.registerChild(
            new PropertyMqttHandle({
                parent: this,
                controller: this.controller,
                topicName: "hls-url",
                friendlyName: "HLS URL",
                datatype: DataType.STRING,
                format: "url",
                getter: async () => {
                    const ip = Tools.GET_PRIMARY_HOST_IPV4();

                    // go2rtc's HLS output (served on the API port). Pulled on-demand like the
                    // WebRTC player. Playable by Safari natively, hls.js, ffmpeg, VLC and any
                    // HLS-capable player / dashboard.
                    return `http://${ip}:${CameraNodeMqttHandle.GO2RTC_PORT}/api/stream.m3u8?src=${CameraNodeMqttHandle.STREAM_NAME}`;
                },
                helpText: "The go2rtc HLS (.m3u8) URL for the camera. Playable by Safari, hls.js, " +
                    "ffmpeg, VLC and any HLS-capable player."
            })
        );
    }

    /**
     * @returns {number}
     */
    getQoS() {
        return MqttCommonAttributes.QOS.AT_LEAST_ONCE;
    }
}

CameraNodeMqttHandle.STREAM_NAME = "cam";
CameraNodeMqttHandle.RTSP_PORT = 8554;
CameraNodeMqttHandle.GO2RTC_PORT = 1984;

module.exports = CameraNodeMqttHandle;
