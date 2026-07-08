const ComponentType = require("../homeassistant/ComponentType");
const crc = require("crc");
const DataType = require("../homie/DataType");
const fs = require("fs");
const HassAnchor = require("../homeassistant/HassAnchor");
const InLineHassComponent = require("../homeassistant/components/InLineHassComponent");
const Logger = require("../../Logger");
const MapLayer = require("../../entities/map/MapLayer");
const MqttCommonAttributes = require("../MqttCommonAttributes");
const NodeMqttHandle = require("./NodeMqttHandle");
const path = require("path");
const PointMapEntity = require("../../entities/map/entities/PointMapEntity");
const PropertyMqttHandle = require("./PropertyMqttHandle");
const Tools = require("../../utils/Tools");
const zlib = require("zlib");

class MapNodeMqttHandle extends NodeMqttHandle {
    /**
     * @param {object} options
     * @param {import("./RobotMqttHandle")} options.parent
     * @param {import("../MqttController")} options.controller MqttController instance
     * @param {import("../../core/ValetudoRobot")} options.robot
     */
    constructor(options) {
        super(Object.assign(options, {
            topicName: "MapData",
            friendlyName: "Map data",
            type: "Map",
            helpText: "This handle groups access to map data. It is only enabled if `provideMapData` is enabled in " +
                "the MQTT config."
        }));

        this.robot = options.robot;

        this.registerChild(
            new PropertyMqttHandle({
                parent: this,
                controller: this.controller,
                topicName: "map-data",
                friendlyName: "Raw map data",
                datatype: DataType.STRING,
                format: "json, but deflated",
                getter: async () => {
                    return this.getMapData(false);
                }
            })
        );

        this.registerChild(
            new PropertyMqttHandle({
                parent: this,
                controller: this.controller,
                topicName: "segments",
                friendlyName: "Map segments",
                datatype: DataType.STRING,
                format: "json",
                getter: async () => {
                    // Segments are intentionally decoupled from `provideMapData`: they are a tiny,
                    // homie-native id->name mapping (not the heavy raw map blob), so they keep
                    // publishing even when raw map data delivery is disabled.
                    if (this.robot.state.map === null || !this.controller.isInitialized) {
                        return {};
                    }

                    const res = {};
                    for (const segment of this.robot.state.map.getSegments()) {
                        res[segment.id] = segment.name ?? segment.id;
                    }

                    await this.controller.hassAnchorProvider.getAnchor(
                        HassAnchor.ANCHOR.MAP_SEGMENTS_LEN
                    ).post(Object.keys(res).length);

                    await this.controller.hassAnchorProvider.getAnchor(
                        HassAnchor.ANCHOR.MAP_SEGMENTS
                    ).post(res);

                    return res;
                },
                helpText: "This property contains a JSON mapping of segment IDs to segment names."
            }).also((prop) => {
                this.controller.withHass((hass) => {
                    prop.attachHomeAssistantComponent(
                        new InLineHassComponent({
                            hass: hass,
                            robot: this.robot,
                            name: "MapSegments",
                            friendlyName: "Map segments",
                            componentType: ComponentType.SENSOR,
                            baseTopicReference: this.controller.hassAnchorProvider.getTopicReference(
                                HassAnchor.REFERENCE.HASS_MAP_SEGMENTS_STATE
                            ),
                            autoconf: {
                                state_topic: this.controller.hassAnchorProvider.getTopicReference(
                                    HassAnchor.REFERENCE.HASS_MAP_SEGMENTS_STATE
                                ),
                                icon: "mdi:vector-selection",
                                json_attributes_topic: prop.getBaseTopic(),
                                json_attributes_template: "{{ value }}"
                            },
                            topics: {
                                "": this.controller.hassAnchorProvider.getAnchor(
                                    HassAnchor.ANCHOR.MAP_SEGMENTS_LEN
                                )
                            }
                        })
                    );
                });
            })
        );

        // LiberVac addition: the segments the robot currently considers active (i.e. part of the
        // ongoing cleaning job). Sourced from the firmware's GET_ACTIVE_SEGMENTS query, which the
        // Midea map parser folds into each segment layer's `active` flag (J15 Max and newer).
        // Empty {} when idle / nothing active. Like `segments`, not gated by `provideMapData`.
        this.registerChild(
            new PropertyMqttHandle({
                parent: this,
                controller: this.controller,
                topicName: "active-segments",
                friendlyName: "Active segments",
                datatype: DataType.STRING,
                format: "json",
                getter: async () => {
                    if (this.robot.state.map === null || !this.controller.isInitialized) {
                        return {};
                    }

                    const res = {};
                    for (const layer of this.robot.state.map.layers) {
                        if (layer.type === MapLayer.TYPE.SEGMENT && layer.metaData.active === true) {
                            const id = `${layer.metaData.segmentId}`;
                            res[id] = layer.metaData.name ?? id;
                        }
                    }

                    return res;
                },
                helpText: "LiberVac addition. A JSON mapping of the segment IDs the robot is " +
                    "currently cleaning (active) to their names. Empty when idle."
            })
        );

        // LiberVac addition: the single segment the robot is physically inside RIGHT NOW,
        // derived locally by point-in-segment (robot_position entity vs each segment's pixels).
        // The firmware's GET_ACTIVE_SEGMENTS gives the whole selected job set, not the current
        // room, so we compute "current room" ourselves from data we already have. Empty {} when
        // there is no robot position or it falls outside every segment (doorway/wall/unmapped).
        this.registerChild(
            new PropertyMqttHandle({
                parent: this,
                controller: this.controller,
                topicName: "current-segment",
                friendlyName: "Current segment",
                datatype: DataType.STRING,
                format: "json",
                getter: async () => {
                    const map = this.robot.state.map;
                    if (map === null || !this.controller.isInitialized || !map.pixelSize) {
                        return {};
                    }

                    const robot = map.entities.find(e => e.type === PointMapEntity.TYPE.ROBOT_POSITION);
                    if (robot === undefined || !Array.isArray(robot.points) || robot.points.length < 2) {
                        return {};
                    }

                    // robot_position is in cm; segment pixels are in grid units (cm / pixelSize).
                    const gx = Math.floor(robot.points[0] / map.pixelSize);
                    const gy = Math.floor(robot.points[1] / map.pixelSize);

                    for (const layer of map.layers) {
                        if (layer.type !== MapLayer.TYPE.SEGMENT) {
                            continue;
                        }

                        // compressedPixels = flat [xStart, y, count] runs
                        const cp = layer.compressedPixels;
                        for (let i = 0; i < cp.length; i += 3) {
                            if (cp[i + 1] === gy && cp[i] <= gx && gx < cp[i] + cp[i + 2]) {
                                const id = `${layer.metaData.segmentId}`;

                                return {[id]: layer.metaData.name ?? id};
                            }
                        }
                    }

                    return {};
                },
                helpText: "LiberVac addition. A JSON {id: name} of the single segment the robot is " +
                    "physically inside right now (computed via point-in-segment from its position). " +
                    "Empty when the robot is in a doorway/wall or off-map."
            })
        );

        // LiberVac addition: a URL to Valetudo's own built-in live map. This lets Home Assistant
        // render the map in a browser (webpage/iframe card) instead of shipping the raw deflated
        // map blob over MQTT — the viewing client renders it, so the robot does ~no extra work.
        // Deliberately NOT gated by `provideMapData`: it is the lightweight alternative to it.
        this.registerChild(
            new PropertyMqttHandle({
                parent: this,
                controller: this.controller,
                topicName: "url",
                friendlyName: "Map URL",
                datatype: DataType.STRING,
                format: "url",
                getter: async () => {
                    return `http://${Tools.GET_PRIMARY_HOST_IPV4()}/`;
                },
                helpText: "LiberVac addition. URL to Valetudo's built-in live map. Embed it in a " +
                    "Home Assistant webpage/iframe card to render the map client-side instead of " +
                    "consuming the raw `map-data` blob."
            })
        );

        this.controller.withHass((hass) => {
            this.registerChild(
                new PropertyMqttHandle({
                    parent: this,
                    controller: this.controller,
                    topicName: "map-data-hass",
                    friendlyName: "Raw map data for Home Assistant",
                    datatype: DataType.STRING,
                    getter: async () => {
                        return this.getMapData(true);
                    },
                    helpText: "This handle is added automatically if Home Assistant autodiscovery is enabled. It " +
                        "provides a map embedded in a PNG image that recommends installing the Valetudo Lovelace card."
                }).also((prop) => {
                    prop.attachHomeAssistantComponent(
                        new InLineHassComponent({
                            hass: hass,
                            robot: this.robot,
                            name: "MapData",
                            friendlyName: "Map data",
                            componentType: ComponentType.CAMERA,
                            autoconf: {
                                topic: prop.getBaseTopic()
                            }
                        })
                    );
                })
            );
        });
    }

    /**
     * @returns {number}
     */
    getQoS() {
        // This shall prevent resource issues for the MQTT broker as maps can be quite heavy
        // and might be cached indefinitely with AT_LEAST_ONCE
        return MqttCommonAttributes.QOS.AT_MOST_ONCE;
    }

    /**
     * Called by MqttController on map updated.
     *
     * @public
     */
    onMapUpdated() {
        if (this.controller.isInitialized) {
            this.refresh().catch(err => {
                Logger.error("Error during MQTT handle refresh", err);
            });
        }
    }

    /**
     * @private
     * @param {boolean} wrapInPng
     * @return {Promise<Buffer|null>}
     */
    async getMapData(wrapInPng) {
        if (this.robot.state.map === null || !(this.controller.currentConfig.customizations.provideMapData ?? true) || !this.controller.isInitialized) {
            return null;
        }
        const robot = this.robot;

        const promise = new Promise((resolve, reject) => {
            zlib.deflate(JSON.stringify(robot.state.map), (err, buf) => {
                if (err !== null) {
                    return reject(err);
                }

                let payload;

                if (wrapInPng) {
                    const length = Buffer.alloc(4);
                    const checksum = Buffer.alloc(4);

                    const textChunkData = Buffer.concat([
                        PNG_WRAPPER.TEXT_CHUNK_TYPE,
                        PNG_WRAPPER.TEXT_CHUNK_METADATA,
                        buf
                    ]);

                    length.writeInt32BE(PNG_WRAPPER.TEXT_CHUNK_METADATA.length + buf.length, 0);
                    checksum.writeUInt32BE(crc.crc32(textChunkData), 0);


                    payload = Buffer.concat([
                        PNG_WRAPPER.IMAGE_WITHOUT_END_CHUNK,
                        length,
                        textChunkData,
                        checksum,
                        PNG_WRAPPER.END_CHUNK
                    ]);
                } else {
                    payload = buf;
                }

                resolve(payload);
            });
        });

        try {
            // intentional return await
            return await promise;
        } catch (err) {
            Logger.error("Error while deflating map data for mqtt publish", err);
        }
        return null;
    }


}


const PNG_WRAPPER = {
    TEXT_CHUNK_TYPE: Buffer.from("zTXt"),
    TEXT_CHUNK_METADATA: Buffer.from("ValetudoMap\0\0"),
    IMAGE: fs.readFileSync(path.join(__dirname, "../../res/valetudo_home_assistant_mqtt_wrapper.png"))
};
PNG_WRAPPER.IMAGE_WITHOUT_END_CHUNK = PNG_WRAPPER.IMAGE.subarray(0, PNG_WRAPPER.IMAGE.length - 12);
//The PNG IEND chunk is always the last chunk and consists of a 4-byte length, the 4-byte chunk type, 0-byte chunk data and a 4-byte crc
PNG_WRAPPER.END_CHUNK = PNG_WRAPPER.IMAGE.subarray(PNG_WRAPPER.IMAGE.length - 12);

module.exports = MapNodeMqttHandle;
