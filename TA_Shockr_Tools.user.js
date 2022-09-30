// ==UserScript==
// @name            Shockr - Tiberium Alliances Tools
// @author          Shockr <contact@shockr.dev> - fixed by NetquiK [SoO] (https://github.com/netquik)
// @description     Tools to work with Tiberium alliances https://shockr.dev
// @updateURL       https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/Testing/TA_Shockr_Tools.user.js
// @match           https://*.alliances.commandandconquer.com/*/index.aspx*
// @grant           GM_updatingEnabled
// @grant           unsafeWindow
// @version         4.5.3
// @icon            https://shockr.dev/favicon.0012b310.png
// @versionHash     77260e3
// ==/UserScript==

function startSt() {
    /******/
    (function (modules, runtime) { // webpackBootstrap
        /******/
        "use strict";
        /******/ // The module cache
        /******/
        var installedModules = {};
        /******/
        /******/ // The require function
        /******/
        function __webpack_require__(moduleId) {
            /******/
            /******/ // Check if module is in cache
            /******/
            if (installedModules[moduleId]) {
                /******/
                return installedModules[moduleId].exports;
                /******/
            }
            /******/ // Create a new module (and put it into the cache)
            /******/
            var module = installedModules[moduleId] = {
                /******/
                i: moduleId,
                /******/
                l: false,
                /******/
                exports: {}
                /******/
            };
            /******/
            /******/ // Execute the module function
            /******/
            modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            /******/
            /******/ // Flag the module as loaded
            /******/
            module.l = true;
            /******/
            /******/ // Return the exports of the module
            /******/
            return module.exports;
            /******/
        }
        /******/
        /******/
        /******/
        __webpack_require__.ab = "/";
        /******/
        /******/ // the startup function
        /******/
        function startup() {
            /******/ // Load entry module and return exports
            /******/
            return __webpack_require__(382);
            /******/
        };
        /******/
        /******/ // run startup
        /******/
        return startup();
        /******/
    })
    /************************************************************************/
    /******/
    ({

        /***/
        17:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const util_1 = __webpack_require__(182);
                const st_plugin_1 = __webpack_require__(544);
                const st_cli_1 = __webpack_require__(289);

                function replaceBaseLevel(t) {
                    // eslint-disable-next-line @typescript-eslint/camelcase
                    t.prototype.get_BaseLevel = t.prototype.get_BaseLevelFloat;
                }
                const CampTrackerOptions = {
                    size: {
                        value: 24,
                        description: 'Size of the circle in pixels'
                    },
                    font: {
                        value: 'Iosevka Term',
                        description: 'Font to use'
                    },
                    fontSize: {
                        value: 20,
                        description: 'Font size in pixels'
                    },
                    offense: {
                        value: -1,
                        description: "Filter out camps that are below your main's offense level"
                    },
                    count: {
                        value: 10,
                        description: 'Number of icons to show'
                    },
                    alert: {
                        value: true,
                        description: 'Alert on new camps/outposts spawning'
                    },
                };
                class CampTracker extends st_plugin_1.StPlugin {
                    constructor() {
                        super(...arguments);
                        this.name = 'CampTracker';
                        this.priority = 100;
                        /** Max number to show at one time */
                        this.options = CampTrackerOptions;
                        this.markers = new Map();
                        this.maxOffDiff = -1;
                        this.firstUpdate = true;
                    }
                    async onStart() {
                        const md = ClientLib.Data.MainData.GetInstance();
                        const visMain = ClientLib.Vis.VisMain.GetInstance();
                        const region = visMain.get_Region();
                        this.addEvent(region, 'PositionChange', ClientLib.Vis.PositionChange, this.updatePosition);
                        this.addEvent(region, 'ZoomFactorChange', ClientLib.Vis.ZoomFactorChange, this.updatePosition);
                        this.addEvent(region, 'SectorUpdated', ClientLib.Vis.Region.SectorUpdated, this.update);
                        this.addEvent(md.get_Cities(), 'Change', ClientLib.Data.CitiesChange, this.update);
                        // Use floating point base numbers for tool tips
                        replaceBaseLevel(ClientLib.Vis.Region.RegionNPCBase);
                        replaceBaseLevel(ClientLib.Vis.Region.RegionNPCCamp);
                        this.update();
                    }
                    onConfig() {
                        this.markers.forEach((e) => this.updateStyle(e.el));
                        this.doUpdate();
                    }
                    async onStop() {
                        for (const cityId of Array.from(this.markers.keys())) {
                            this.destroy(cityId);
                        }
                        this.markers.clear();
                    }
                    update() {
                        // Update already triggering
                        if (this.updateCb != null) {
                            return;
                        }
                        const serverStep = ClientLib.Data.MainData.GetInstance().get_Time().GetServerStep();
                        if (serverStep == this.lastUpdatedStep) {
                            return;
                        }
                        this.lastUpdatedStep = serverStep;
                        this.updateCb = requestAnimationFrame(() => this.doUpdate());
                    }
                    doUpdate() {
                        this.updateCb = null;
                        const mainBase = util_1.CityUtil.getMainCity();
                        // No main base, skip
                        if (mainBase == null) {
                            return;
                        }
                        const offLevel = mainBase.get_LvlOffense();
                        const minBaseHighlight = offLevel + this.maxOffDiff;
                        const nearByCamps = Array.from(util_1.CityUtil.getObjectsNearCity(mainBase).values()).filter((f) => {
                            // All outposts are camps
                            if (!util_1.PatchWorldObjectNPCCamp.isPatched(f.object)) {
                                return false;
                            }
                            if (f.object.$CampType === 0 /* Destroyed */ ) {
                                return false;
                            }
                            // Ignore low level camps/outposts
                            if (f.object.$Level < minBaseHighlight) {
                                return false;
                            }
                            return true;
                        });
                        const newestCamps = nearByCamps.sort((a, b) => b.id - a.id).slice(0, this.config('count'));
                        const existingMarkers = new Set(this.markers.keys());
                        newestCamps.forEach((camp, index) => {
                            const existing = this.markers.get(camp.id);
                            if (existing != null) {
                                existing.index = index;
                                existingMarkers.delete(camp.id);
                            } else {
                                const location = util_1.BaseLocationPacker.unpack(camp.location);
                                this.addMarker(camp.id, location, index);
                                const obj = camp.object;
                                if (!util_1.PatchWorldObjectNPCCamp.isPatched(obj)) {
                                    return;
                                }
                                if (!this.firstUpdate && this.config('alert') && index == 0) {
                                    const campType = obj.$CampType == 2 /* Random */ ? 'Camp' : 'Outpost';
                                    const campLocation = st_cli_1.FontBuilder.coOrd(location.x, location.y);
                                    this.st.cli.sendMessage('lightblue', `[ST] New ${obj.$Level} ${campType} spawned at ${campLocation}`);
                                }
                            }
                        });
                        this.firstUpdate = false;
                        for (const cityId of existingMarkers.values()) {
                            this.destroy(cityId);
                        }
                        this.updatePosition();
                        return newestCamps;
                    }
                    updateElement(el, location, index) {
                        const visMain = ClientLib.Vis.VisMain.GetInstance();
                        const region = visMain.get_Region();
                        const gridWidth = region.get_GridWidth();
                        const gridHeight = region.get_GridHeight();
                        const top = visMain.ScreenPosFromWorldPosY((location.y + 0.1) * gridHeight);
                        const left = visMain.ScreenPosFromWorldPosX((location.x + 0.1) * gridWidth);
                        const bottom = region.get_ViewHeight();
                        const right = region.get_ViewWidth();
                        // Out of bounds disable
                        if (top < 0 || left < 0 || top > bottom || left > right) {
                            el.remove();
                            return;
                        }
                        el.style.top = top + 'px';
                        el.style.left = left + 'px';
                        if (el.getAttribute('st-last-index') != String(index)) {
                            el.innerHTML = '#' + (index + 1);
                            if (index < 3) {
                                el.style.backgroundColor = `rgba(0,240,0,0.9)`;
                            } else {
                                el.style.backgroundColor = `rgba(200,240,0,0.9)`;
                            }
                            el.setAttribute('st-last-index', String(index));
                        }
                        if (el.parentElement == null) {
                            this.addMarkerToDom(el);
                        }
                    }
                    updatePosition() {
                        this.markers.forEach(({
                            el,
                            location,
                            index
                        }) => this.updateElement(el, location, index));
                    }
                    destroy(cityId) {
                        const marker = this.markers.get(cityId);
                        if (marker == null) {
                            return;
                        }
                        marker.el.remove();
                        this.markers.delete(cityId);
                    }
                    updateStyle(el) {
                        el.style.position = 'absolute';
                        el.style.pointerEvents = 'none';
                        el.style.fontFamily = this.config('font');
                        el.style.fontWeight = 'bold';
                        el.style.fontSize = this.config('fontSize') + 'px';
                        el.style.zIndex = '10';
                        el.style.borderRadius = '50%';
                        const iconSize = this.config('size');
                        el.style.width = `${iconSize}px`;
                        el.style.height = `${iconSize}px`;
                        el.style.padding = '2px';
                        el.style.display = 'flex';
                        el.style.justifyContent = 'center';
                        el.style.alignItems = 'center';
                        el.style.border = '2px solid rgba(0,0,0,0.87)';
                    }
                    addMarker(cityId, location, index) {
                        const el = document.createElement('div');
                        el.title = `Object #${cityId}`;
                        this.updateStyle(el);
                        this.updateElement(el, location, index);
                        this.markers.set(cityId, {
                            el,
                            location,
                            index
                        });
                        this.addMarkerToDom(el);
                    }
                    addMarkerToDom(el) {
                        var _a, _b;
                        (_b = (_a = document.querySelector('canvas')) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.appendChild(el);
                    }
                }
                exports.CampTracker = CampTracker;

                /***/
            }),

        /***/
        33:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                // MOD Regex Fix try by NetquiK
                const client_patcher_1 = __webpack_require__(879);
                exports.PatchCityUnits = new client_patcher_1.ClientLibPatch('ClientLib.Data.CityUnits');
                exports.PatchCityUnits.addGetter('$OffenseUnits', 'HasUnitMdbId', /for ?\(.+[a-z]:this.([A-Z]{6}).+[a-z]:this.([A-Z]{6})/, 1);
                exports.PatchCityUnits.addGetter('$DefenseUnits', 'HasUnitMdbId', /for ?\(.+[a-z]:this.([A-Z]{6}).+[a-z]:this.([A-Z]{6})/, 2);
                exports.PatchWorldObjectNPCCamp = new client_patcher_1.ClientLibPatch('ClientLib.Data.WorldSector.WorldObjectNPCCamp');
                exports.PatchWorldObjectNPCCamp.addGetter('$CampType', '$ctor', /this\.([A-Z]{6})=\(*[a-z]\>\>(22|0x16)\)?/);
                exports.PatchWorldObjectNPCCamp.addGetter('$Id', '$ctor', /\&.*=-1[,;]\}?this\.([A-Z]{6})=\(/);
                exports.PatchWorldObjectNPCCamp.addGetter('$Level', '$ctor', /\.*this\.([A-Z]{6})=\(\(?\(?[a-z]>>4/);
                exports.PatchWorldObjectNPCBase = new client_patcher_1.ClientLibPatch('ClientLib.Data.WorldSector.WorldObjectNPCBase');
                exports.PatchWorldObjectNPCBase.addGetter('$Id', '$ctor', /.*[a-z][;,]this\.([A-Z]{6})=\(/);
                exports.PatchWorldObjectNPCBase.addGetter('$Level', '$ctor', /\.*this\.([A-Z]{6})=\(\(?\(?[a-z]>>4/);
                exports.PatchWorldObjectCity = new client_patcher_1.ClientLibPatch('ClientLib.Data.WorldSector.WorldObjectCity');
                exports.PatchWorldObjectCity.addGetter('$PlayerId', '$ctor', /&(?:0x3ff|1023)\)?[;,]this.([A-Z]{6})/);
                exports.PatchWorldObjectCity.addGetter('$AllianceId', '$ctor', /.*[a-z]\+=[a-z][;,,]?this\.([A-Z]{6})=\(/);
                exports.PatchWorldObjectCity.addGetter('$Id', '$ctor', /.*[a-z]\+=[a-z][;,]this\.([A-Z]{6})=\(.*[a-z]\+=[a-z].*[a-z]\+=/);
                exports.PatchCommunicationManager = new client_patcher_1.ClientLibPatch('ClientLib.Net.CommunicationManager');
                exports.PatchCommunicationManager.addAlias('$Poll', () => {
                    var _a;
                    return (_a = client_patcher_1.ClientLibPatch.findFunctionInProto(ClientLib.Net.CommunicationManager, '"Poll"')) === null || _a === void 0 ? void 0 : _a.key;
                });
                exports.Patches = [
                    exports.PatchCityUnits,
                    exports.PatchWorldObjectCity,
                    exports.PatchWorldObjectNPCBase,
                    exports.PatchWorldObjectNPCCamp,
                    exports.PatchCommunicationManager,
                ];

                /***/
            }),

        /***/
        62:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                var INSTANCE;
                var Log = (function () {
                    function Log(parent, keys) {
                        this.closed = false;
                        this.keys = keys;
                        this.parent = parent;
                    }
                    Log.getInstance = function () {
                        if (INSTANCE == null) {
                            throw new Error('No BBLog Instance created, run BBLog.createLogger first');
                        }
                        return INSTANCE;
                    };
                    Log.createLogger = function (obj) {
                        INSTANCE = new Log(null, {
                            name: obj.name,
                            hostname: obj.hostname
                        });
                        if (obj.streams && Array.isArray(obj.streams)) {
                            obj.streams.forEach(function (stream) {
                                return INSTANCE.addStream(stream);
                            });
                        }
                        if (obj.stream) {
                            INSTANCE.addStream(obj.stream);
                        }
                        if (obj.keys) {
                            INSTANCE.addKeys(obj.keys);
                        }
                        return INSTANCE;
                    };
                    Log.child = function (keys) {
                        return Log.getInstance().child(keys);
                    };
                    Log.prototype.child = function (keys) {
                        return new Log(this, keys);
                    };
                    Log.prototype.addStream = function (stream) {
                        this.streams = this.streams || [];
                        this.streams.push(stream);
                        return this;
                    };
                    Log.prototype.addKeys = function (obj) {
                        var _this = this;
                        Object.keys(obj).forEach(function (key) {
                            _this.keys[key] = obj[key];
                        });
                    };
                    Log.prototype.close = function () {
                        this.closed = true;
                        var closeAllStreams = this.streams.map(function (s) {
                            return s.close == null ? null : s.close();
                        });
                        return Promise.all(closeAllStreams).then(function (_) {
                            return null;
                        });
                    };
                    Log.prototype.trace = function (data, msg) {
                        this.log(Log.TRACE, data, msg);
                    };
                    Log.prototype.debug = function (data, msg) {
                        this.log(Log.DEBUG, data, msg);
                    };
                    Log.prototype.info = function (data, msg) {
                        this.log(Log.INFO, data, msg);
                    };
                    Log.prototype.warn = function (data, msg) {
                        this.log(Log.WARN, data, msg);
                    };
                    Log.prototype.error = function (data, msg) {
                        this.log(Log.ERROR, data, msg);
                    };
                    Log.prototype.fatal = function (data, msg) {
                        this.log(Log.FATAL, data, msg);
                    };
                    Log.prototype.joinKeys = function (obj) {
                        if (this.parent) {
                            this.parent.joinKeys(obj);
                        }
                        var keys = this.keys;
                        if (keys == null) {
                            return obj;
                        }
                        Object.keys(keys).forEach(function (key) {
                            return obj[key] = keys[key];
                        });
                        return obj;
                    };
                    Log.prototype.log = function (level) {
                        var data = [];
                        for (var _i = 1; _i < arguments.length; _i++) {
                            data[_i - 1] = arguments[_i];
                        }
                        var output = {
                            pid: 0,
                            time: new Date(),
                            hostname: '',
                            level: level,
                            msg: '',
                            v: Log.LOG_VERSION
                        };
                        this.joinKeys(output);
                        for (var i = 0; i < data.length; i++) {
                            var dataValue = data[i];
                            if (dataValue == null) {
                                continue;
                            }
                            if (typeof dataValue === 'string') {
                                output.msg = output.msg + dataValue;
                            } else if (dataValue instanceof Error) {
                                output.err = ErrorSerializer(dataValue);
                            } else {
                                Object.keys(dataValue).forEach(function (key) {
                                    var value = dataValue[key];
                                    if (value instanceof Error) {
                                        output[key] = ErrorSerializer(value);
                                    } else {
                                        output[key] = value;
                                    }
                                });
                            }
                        }
                        this.write(output);
                    };
                    Log.prototype.write = function (message) {
                        if (this.closed) {
                            return;
                        }
                        if (this.streams && this.streams.length > 0) {
                            for (var i = 0; i < this.streams.length; i++) {
                                var obj = this.streams[i];
                                obj.write(message);
                            }
                            return true;
                        }
                        if (this.parent) {
                            return this.parent.write(message);
                        }
                    };
                    return Log;
                }());
                Log.TRACE = 10;
                Log.DEBUG = 20;
                Log.INFO = 30;
                Log.WARN = 40;
                Log.ERROR = 50;
                Log.FATAL = 60;
                Log.LOG_VERSION = 0;
                Log.LEVELS = {
                    trace: Log.TRACE,
                    debug: Log.DEBUG,
                    info: Log.INFO,
                    warn: Log.WARN,
                    error: Log.ERROR,
                    fatal: Log.FATAL
                };
                exports.Log = Log;
                // Taken from Bunyan :  https://github.com/trentm/node-bunyan/blob/master/lib/bunyan.js
                function getFullErrorStack(ex) {
                    var ret = ex.stack || ex.toString();
                    if (ex.cause && typeof (ex.cause) === 'function') {
                        var cex = ex.cause();
                        if (cex) {
                            ret += '\nCaused by: ' + getFullErrorStack(cex);
                        }
                    }
                    return (ret);
                }

                function ErrorSerializer(err) {
                    if (!err || !err.stack) {
                        return err;
                    }
                    return {
                        message: err.message,
                        name: err.name,
                        stack: getFullErrorStack(err),
                        code: err.code,
                        signal: err.signal
                    };
                }
                exports.ErrorSerializer = ErrorSerializer;

                /***/
            }),

        /***/
        87:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const iter_1 = __webpack_require__(567);
                const location_1 = __webpack_require__(291);
                const pack_1 = __webpack_require__(414);
                const client_patcher_1 = __webpack_require__(879);
                const patch_data_1 = __webpack_require__(33);
                /**
                 * Useful utility functions when working with cities
                 */
                class CityUtil {
                    /** Distance between two points */
                    static distance(a, b) {
                        const x = a.x - b.x;
                        const y = a.y - b.y;
                        return Math.sqrt(x * x + y * y);
                    }
                    /**
                     * Select a object on the client side from a X/Y Position
                     */
                    static select(x, y) {
                        ClientLib.Vis.VisMain.GetInstance().CenterGridPosition(x, y);
                        const md = ClientLib.Data.MainData.GetInstance();
                        const world = md.get_World();
                        const obj = world.GetObjectFromPosition(x, y);
                        if (obj == null) {
                            return;
                        }
                        if (client_patcher_1.ClientLibPatch.hasPatchedId(obj)) {
                            md.get_Cities().set_CurrentCityId(obj.$Id);
                        }
                    }
                    /**
                     * Get the biggest offense city
                     */
                    static getMainCity() {
                        let mainCity = null;
                        const allCities = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities();
                        for (const selectedBase of Object.values(allCities.d)) {
                            if (mainCity == null || mainCity.get_LvlOffense() < selectedBase.get_LvlOffense()) {
                                mainCity = selectedBase;
                            }
                        }
                        return mainCity;
                    }
                    /**
                     * Get a list of all known allied cities
                     *
                     * @remarks
                     * This may not be all allied cities, especially if the alliance is spread out
                     */
                    static getAlliedCities() {
                        const md = ClientLib.Data.MainData.GetInstance();
                        const allianceId = md.get_Alliance().get_Id();
                        const playerId = md.get_Player().id;
                        const cities = [];
                        for (const city of iter_1.ClientLibIter.values(md.get_World().GetCities())) {
                            if (!patch_data_1.PatchWorldObjectCity.isPatched(city)) {
                                continue;
                            }
                            if (city.$PlayerId == playerId) {
                                continue;
                            }
                            if (city.$AllianceId == allianceId) {
                                cities.push(city);
                            }
                        }
                        // Make similar playerIds near each other
                        cities.sort((a, b) => a.$PlayerId - b.$PlayerId);
                        const allianceData = md.get_Alliance().get_MemberData();
                        let baseCount = 0;
                        for (const allianceMember of iter_1.ClientLibIter.values(allianceData)) {
                            baseCount += allianceMember.Bases;
                        }
                        if (baseCount > cities.length) {
                            // TODO warn that cities are missing
                        }
                        return cities;
                    }
                    /** Iterate through all objects near by any of the player's city */
                    static getNearByObjects() {
                        const allCities = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities();
                        const output = new Map();
                        for (const selectedBase of Object.values(allCities.d)) {
                            const objects = CityUtil.getObjectsNearCity(selectedBase);
                            for (const object of objects.values()) {
                                output.set(object.location, object);
                            }
                        }
                        return Array.from(output.values());
                    }
                    /**
                     * Get near by objects from a city
                     *
                     * @param city to start scanning from
                     */
                    static getObjectsNearCity(city) {
                        const cityX = city.get_PosX();
                        const cityY = city.get_PosY();
                        const maxAttack = ClientLib.Data.MainData.GetInstance().get_Server().get_MaxAttackDistance() - 0.5;
                        const world = ClientLib.Data.MainData.GetInstance().get_World();
                        const output = new Map();
                        for (const point of location_1.LocationIter.xyDistance(cityX, cityY, maxAttack)) {
                            const object = world.GetObjectFromPosition(point.x, point.y);
                            if (object == null) {
                                continue;
                            }
                            if (!client_patcher_1.ClientLibPatch.hasPatchedId(object)) {
                                continue;
                            }
                            const location = pack_1.BaseLocationPacker.pack(point);
                            output.set(location, {
                                id: object.$Id,
                                object,
                                location,
                                ownCityId: city.get_Id(),
                                distance: point.distance,
                            });
                        }
                        return output;
                    }
                    /** Wait for a city to load */
                    static async waitForCity(cityId, maxFailCount = 30) {
                        const comm = ClientLib.Net.CommunicationManager.GetInstance();
                        for (let i = 0; i < maxFailCount; i++) {
                            const city = CityUtil.isReady(cityId);
                            if (city == null) {
                                await new Promise((resolve) => setTimeout(resolve, 5 * i));
                                // Force a poll
                                if (i > 3 && patch_data_1.PatchCommunicationManager.isPatched(comm)) {
                                    comm.$Poll();
                                }
                                continue;
                            }
                            return city;
                        }
                        return null;
                    }
                    /** has the city data for this city been loaded */
                    static isReady(cityId) {
                        const city = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(cityId);
                        if (city == null) {
                            return null;
                        }
                        // Dead ignore
                        if (city.get_IsGhostMode()) {
                            return null;
                        }
                        // Base has not loaded yet
                        if (city.GetBuildingsConditionInPercent() === 0) {
                            return null;
                        }
                        return city;
                    }
                }
                exports.CityUtil = CityUtil;

                /***/
            }),

        /***/
        114:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                /**
                 * Pack up a layout into a number per row
                 *
                 * This packs a layout into 24 bits per row or 48 bytes / layout
                 */
                class LayoutPacker {
                    static packIndex(tile, x) {
                        return tile << (3 * x);
                    }
                    static pack(tiles) {
                        let output = 0;
                        for (let x = 0; x < tiles.length; x++) {
                            const element = tiles[x];
                            output = output | (element << (3 * x));
                        }
                        return output;
                    }
                    /** Unpack a resource into a resource type array, will zero pad empty tiles */
                    static unpack(num) {
                        const output = [];
                        while (num > 0) {
                            output.push(num & 0b111);
                            num = num >> 3;
                        }
                        while (output.length < 9 /* Max */ ) {
                            output.push(0);
                        }
                        return output;
                    }
                }
                exports.LayoutPacker = LayoutPacker;

                /***/
            }),

        /***/
        143:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const duration_1 = __webpack_require__(287);
                const st_plugin_1 = __webpack_require__(544);
                class StConfig extends st_plugin_1.StPlugin {
                    constructor() {
                        super(...arguments);
                        this.name = 'Config';
                        this.priority = 10;
                        this.localStorageKey = 'st-config';
                        this.data = {};
                    }
                    async onStart() {
                        this.load();
                        // Auto reload config
                        this.interval(() => this.load(), duration_1.Duration.seconds(60));
                    }
                    async onStop() {
                        this.save();
                    }
                    load() {
                        const item = localStorage.getItem(this.localStorageKey);
                        if (item == null) {
                            return;
                        }
                        this.data = JSON.parse(item);
                    }
                    save() {
                        localStorage.setItem(this.localStorageKey, JSON.stringify(this.data));
                    }
                    get(key) {
                        return this.data[key.toLowerCase()];
                    }
                    set(key, value) {
                        const searchKey = key.toLowerCase();
                        const oldValue = this.get(searchKey);
                        if (value == undefined) {
                            delete this.data[searchKey];
                        } else {
                            this.data[searchKey] = value;
                        }
                        if (oldValue != value) {
                            this.save();
                            this.st.onConfig();
                        }
                    }
                    isDisabled(plugin) {
                        return this.get(`${plugin.name}.enabled`) == false;
                    }
                    disable(module) {
                        this.set(`${module.name}.enabled`, false);
                    }
                    enable(module) {
                        this.set(`${module.name}.enabled`, true);
                    }
                }
                exports.StConfig = StConfig;

                /***/
            }),

        /***/
        181:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const util_1 = __webpack_require__(182);
                const st_plugin_1 = __webpack_require__(544);
                const city_cache_1 = __webpack_require__(993);
                const StCliScanLayout = {
                    cmd: 'layout scan',
                    handle(st) {
                        var _a;
                        st.actions.clear();
                        // Abort a in progress scan
                        if (!st.actions.isIdle) {
                            st.cli.sendCommandMessage('Abort Scan');
                            return;
                        }
                        const scanCount = (_a = st.plugin('layout')) === null || _a === void 0 ? void 0 : _a.scanAll();
                        st.cli.sendCommandMessage('Starting Scan (' + scanCount + ' layouts)');
                        st.actions.run(true).then(() => st.cli.sendCommandMessage('Scan done!'));
                    },
                };
                const StCliLayout = {
                    cmd: 'layout',
                    commands: {
                        scan: StCliScanLayout,
                    },
                };
                class LayoutScanner extends st_plugin_1.StPlugin {
                    constructor() {
                        super(...arguments);
                        this.name = 'layout';
                        this.priority = 100;
                    }
                    async onStart() {
                        this.interval(() => this.scanAll(), util_1.Duration.OneHour);
                        this.cli(StCliLayout);
                    }
                    scanAll() {
                        this.clearActions();
                        let count = 0;
                        const nearByObjects = util_1.CityUtil.getNearByObjects();
                        for (const {
                                object,
                                location,
                                ownCityId
                            } of nearByObjects) {
                            if (object.Type !== 2 /* NPCBase */ && object.Type !== 3 /* NPCCamp */ ) {
                                continue;
                            }
                            const existing = city_cache_1.CityCache.get(object.$Id);
                            if (existing) {
                                continue;
                            }
                            count++;
                            this.queueAction((index, total) => this.scanLayout(object.$Id, ownCityId, location, index, total));
                        }
                        return count;
                    }
                    async scanLayout(cityId, ownCityId, location, current, count) {
                        const startTime = Date.now();
                        const md = ClientLib.Data.MainData.GetInstance();
                        const cities = md.get_Cities();
                        const world = md.get_World();
                        const maxAttack = md.get_Server().get_MaxAttackDistance() - 0.5;
                        const {
                            x,
                            y
                        } = util_1.BaseLocationPacker.unpack(location);
                        const worldObject = world.GetObjectFromPosition(x, y);
                        if (worldObject == null) {
                            return;
                        }
                        if (util_1.PatchWorldObjectNPCCamp.isPatched(worldObject) && worldObject.$CampType === 0 /* Destroyed */ ) {
                            return;
                        }
                        cities.set_CurrentCityId(cityId);
                        // Modify our current own city if we are out of range
                        if (ownCityId != ownCityId) {
                            const currentCity = cities.get_CurrentOwnCity();
                            const sourceXy = {
                                x: currentCity.get_PosX(),
                                y: currentCity.get_PosY()
                            };
                            if (util_1.CityUtil.distance(sourceXy, {
                                    x,
                                    y
                                }) > maxAttack) {
                                cities.set_CurrentOwnCityId(ownCityId);
                            }
                        }
                        const cityObj = await util_1.CityUtil.waitForCity(cityId);
                        if (cityObj == null) {
                            this.st.log.debug({
                                cityId,
                                index: current,
                                count,
                                duration: Date.now() - startTime
                            }, 'ScanLayout:Failed');
                            return;
                        }
                        const output = util_1.CityScannerUtil.get(cityObj);
                        if (output == null) {
                            return;
                        }
                        this.st.log.debug({
                            cityId,
                            index: current,
                            count,
                            duration: Date.now() - startTime
                        }, 'ScanLayout');
                        this.st.api.base(output).then((baseId) => city_cache_1.CityCache.setStId(cityId, baseId, output.tiles));
                    }
                }
                exports.LayoutScanner = LayoutScanner;

                /***/
            }),

        /***/
        182:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                function __export(m) {
                    for (var p in m)
                        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
                }
                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                __export(__webpack_require__(745));
                __export(__webpack_require__(87));
                __export(__webpack_require__(500));
                __export(__webpack_require__(785));
                __export(__webpack_require__(567));
                __export(__webpack_require__(738));
                __export(__webpack_require__(291));
                __export(__webpack_require__(414));
                __export(__webpack_require__(114));
                __export(__webpack_require__(287));
                __export(__webpack_require__(282));
                __export(__webpack_require__(920));
                __export(__webpack_require__(346));
                __export(__webpack_require__(776));
                __export(__webpack_require__(322));
                __export(__webpack_require__(436));

                /***/
            }),

        /***/
        255:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                var sdk_1 = __webpack_require__(795);
                exports.V2Sdk = sdk_1.V2Sdk;
                var report_1 = __webpack_require__(466);
                exports.V2Report = report_1.V2Report;

                /***/
            }),

        /***/
        276:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const util_1 = __webpack_require__(182);
                const ulid = __webpack_require__(934);
                exports.WorldIdPacker = new util_1.BaseNPacker(util_1.Base62, {
                    worldId: 2
                });
                exports.WorldPlayerId = new util_1.BaseNPacker(util_1.Base62, {
                    worldId: 2,
                    playerId: util_1.BaseNPacker.VarLength
                });
                exports.WorldAllianceId = new util_1.BaseNPacker(util_1.Base62, {
                    worldId: 2,
                    allianceId: util_1.BaseNPacker.VarLength
                });
                exports.WorldCityId = new util_1.BaseNPacker(util_1.Base62, {
                    worldId: 2,
                    timestamp: util_1.BaseNPacker.TimeStampSeconds,
                    cityId: util_1.BaseNPacker.VarLength,
                });
                exports.Id = {
                    generate() {
                        return ulid.ulid().toLowerCase();
                    },
                };

                /***/
            }),

        /***/
        282:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                function __export(m) {
                    for (var p in m)
                        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
                }
                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                __export(__webpack_require__(879));
                __export(__webpack_require__(33));
                __export(__webpack_require__(441));
                __export(__webpack_require__(610));

                /***/
            }),

        /***/
        287:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                class Duration {
                    static seconds(seconds) {
                        return Duration.OneSecond * seconds;
                    }
                    static days(days) {
                        return Duration.OneDay * days;
                    }
                    static minutes(minutes) {
                        return Duration.OneMinute * minutes;
                    }
                    static hours(hours) {
                        return Duration.OneHour * hours;
                    }
                }
                exports.Duration = Duration;
                Duration.OneSecond = 1000;
                Duration.OneMinute = Duration.OneSecond * 60;
                Duration.OneHour = Duration.OneMinute * 60;
                Duration.OneDay = Duration.OneHour * 24;

                /***/
            }),

        /***/
        289:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const st_config_cli_1 = __webpack_require__(787);
                const st_plugin_1 = __webpack_require__(544);

                function isSubCommand(cmd) {
                    return typeof cmd['commands'] == 'object';
                }
                class FontBuilder {
                    static color(color, msg) {
                        return `<font color="${color}">${msg}</font>`;
                    }
                    static coOrd(x, y) {
                        return `<a style="color:${webfrontend.gui.util.BBCode.clrLink}; cursor: pointer;" onClick="webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(${x}, ${y});">${x}:${y}</a>`;
                    }
                }
                exports.FontBuilder = FontBuilder;
                class StCli extends st_plugin_1.StPlugin {
                    constructor() {
                        super(...arguments);
                        this.StSlashCommand = '/st';
                        this.name = 'Cli';
                        this.priority = 50;
                        this.commands = {};
                        this.handleKeyDown = (e) => {
                            var _a, _b;
                            if (e.key != 'Enter') {
                                return;
                            }
                            const el = this.inputEl;
                            if (!el.value.startsWith(this.StSlashCommand)) {
                                return;
                            }
                            // Parse CLI args
                            const parts = el.value.trim().split(' ');
                            const cmd = ((_a = parts[1]) !== null && _a !== void 0 ? _a : '').toLowerCase();
                            const command = this.commands[cmd];
                            if (command == null) {
                                this.sendCommandError('Invalid command, Options: ' + Object.keys(this.commands).join(', '));
                            } else if (isSubCommand(command)) {
                                this.sendCommandMessage(parts.join(' '));
                                const subCmd = ((_b = parts[2]) !== null && _b !== void 0 ? _b : '').toLowerCase();
                                if (command.commands[subCmd] != null) {
                                    command.commands[subCmd].handle(this.st, parts.slice(3));
                                } else {
                                    this.sendCommandError(`Invalid command "${cmd} ${parts[2]}", Options: ` + Object.keys(command.commands).join(', '));
                                }
                            } else {
                                command.handle(this.st, parts.slice(2));
                            }
                            el.value = '';
                            el.focus();
                            setTimeout(() => el.focus(), 5);
                            e.preventDefault();
                            return false;
                        };
                    }
                    get inputEl() {
                        return qx.core.Init.getApplication()
                            .getChat()
                            .getChatWidget()
                            .getEditable()
                            .getContentElement()
                            .getDomElement();
                    }
                    async onStart() {
                        this.inputEl.addEventListener('keydown', this.handleKeyDown);
                        this.cli(st_config_cli_1.StCliConfigCommand);
                        this.cli(st_config_cli_1.StCliPluginCommand);
                    }
                    async onStop() {
                        this.inputEl.removeEventListener('keydown', this.handleKeyDown);
                    }
                    register(cmd) {
                        this.commands[cmd.cmd] = cmd;
                    }
                    unregister(cmd) {
                        delete this.commands[cmd.cmd];
                    }
                    sendCommandError(msg) {
                        return this.sendMessage('red', `[ST] ${msg}`);
                    }
                    sendCommandMessage(msg) {
                        return this.sendMessage('white', `[ST] ${msg}`);
                    }
                    sendMessage(color, msg) {
                        this.sendMessageRaw(FontBuilder.color(color, msg));
                    }
                    sendMessageRaw(msg) {
                        qx.core.Init.getApplication()
                            .getChat()
                            .getChatWidget()
                            .showMessage(msg, webfrontend.gui.chat.ChatWidget.sender.system, 31 /* allflags */ );
                    }
                }
                exports.StCli = StCli;

                /***/
            }),

        /***/
        291:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                class LocationIter {
                    static * xy(xMin, xMax, yMin, yMax) {
                        for (let y = yMin; y < yMax; y++) {
                            for (let x = xMin; x < xMax; x++) {
                                yield {
                                    x,
                                    y
                                };
                            }
                        }
                    }
                    /**
                     * Yield XY Points for every within distance of the point
                     */
                    static * xyDistance(x, y, maxDistance) {
                        for (const point of LocationIter.xy(x - maxDistance, x + maxDistance, y - maxDistance, y + maxDistance)) {
                            const distX = Math.abs(point.x - x);
                            const distY = Math.abs(point.y - y);
                            const distance = Math.sqrt(distX * distX + distY * distY);
                            if (distance >= maxDistance) {
                                continue;
                            }
                            yield {
                                x: point.x,
                                y: point.y,
                                distance
                            };
                        }
                    }
                    /**
                     * Yield XY Points for every point inside of a base
                     */
                    static xyBase(maxY = 20 /* Max */ ) {
                        return LocationIter.xy(0, 9 /* Max */ , 0, maxY);
                    }
                }
                exports.LocationIter = LocationIter;

                /***/
            }),

        /***/
        313:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const binary_packer_1 = __webpack_require__(784);
                exports.UnitPacker = new binary_packer_1.BinaryPacker({
                    xy: 8,
                    id: 9,
                    level: 7
                });

                /***/
            }),

        /***/
        322:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.InvalidAllianceId = 0;
                exports.InvalidAllianceName = '';

                /***/
            }),

        /***/
        323:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const st_plugin_1 = __webpack_require__(544);
                /**
                 * Display the approximate plunder amount when mousing over units inside the battle view
                 */
                class KillInfo extends st_plugin_1.StPlugin {
                    constructor() {
                        super(...arguments);
                        this.name = 'KillInfo';
                        this.priority = 100;
                        this.protoInfo = null;
                        this.oldFunction = null;
                    }
                    async onStart() {
                        this.findPrototype();
                        const protoInfo = this.protoInfo;
                        if (protoInfo == null) {
                            return;
                        }
                        const proto = $I[protoInfo.protoName];
                        if (proto == null || proto.prototype[protoInfo.functionName] == null) {
                            return;
                        }
                        const oldFunction = (this.oldFunction = proto.prototype[protoInfo.functionName]);
                        proto.prototype[protoInfo.functionName] = function (c) {
                            if (typeof c.get_UnitDetails !== 'function') {
                                return oldFunction.call(this, c);
                            }
                            oldFunction.call(this, c);
                            if (ClientLib.Vis.VisMain.GetInstance().get_MouseMode() != 0 /* Default */ ) {
                                return;
                            }
                            const unit = c.get_UnitDetails();
                            // TODO adjust plunder to hp
                            // const hp = unit.get_HitpointsPercent();
                            const plunder = unit.get_UnitLevelRepairRequirements();
                            const data = unit.get_UnitGameData_Obj();
                            if (this[protoInfo.internalObj] != null) {
                                this[protoInfo.internalObj][protoInfo.showFunction](data.dn, data.ds, plunder, '');
                            }
                        };
                    }
                    findPrototype() {
                        const funcNameMatch = '"tnf:full hp needed to upgrade")';
                        const funcContentMatch = 'DefenseTerrainFieldType';
                        /** Look for the translation string */
                        function searchFunction(proto) {
                            for (const j of Object.keys(proto)) {
                                if (j.length !== 6) {
                                    continue;
                                }
                                const func = proto[j];
                                if (typeof func === 'function') {
                                    const str = func.toString();
                                    if (str.indexOf(funcNameMatch) !== -1) {
                                        return j;
                                    }
                                }
                            }
                            return '';
                        }
                        for (const i of Object.keys($I)) {
                            const obj = $I[i];
                            if (obj.prototype === undefined) {
                                continue;
                            }
                            const funcName = searchFunction(obj.prototype);
                            if (funcName === '') {
                                continue;
                            }
                            const func = obj.prototype[funcName];
                            if (func === undefined) {
                                continue;
                            }
                            const str = func.toString();
                            // not the particular version we are looking for
                            if (str.indexOf(funcContentMatch) === -1) {
                                continue;
                            }
                            const matches = str.match(/(.{6}).(.{6})\(d,e,i,f\)/);
                            if (matches !== null && matches.length === 3) {
                                this.protoInfo = {
                                    functionName: funcName,
                                    protoName: i,
                                    internalObj: matches[1],
                                    showFunction: matches[2],
                                };
                            }
                        }
                    }
                    async onStop() {
                        if (this.oldFunction == null || this.protoInfo == null) {
                            return;
                        }
                        // reset the function
                        $I[this.protoInfo.protoName].prototype[this.protoInfo.functionName] = this.oldFunction;
                        this.oldFunction = null;
                    }
                }
                exports.KillInfo = KillInfo;

                /***/
            }),

        /***/
        346:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const base_n_1 = __webpack_require__(776);
                exports.Base62 = new base_n_1.BaseN('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', '.');

                /***/
            }),

        /***/
        347:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });

                function promise() {
                    const output = {};
                    const promise = new Promise((resolve, reject) => {
                        output.resolve = resolve;
                        output.reject = reject;
                    });
                    output.promise = promise;
                    return output;
                }
                const CacheTime = 5 * 60 * 1000;
                class Batcher {
                    constructor(idField, delay = 100, maxSize = 25) {
                        this.sendTimeout = null;
                        this.toSend = new Map();
                        /** Cached objects afeter being sent */
                        this.cache = new Map();
                        this.idField = idField;
                        this.delay = delay;
                        this.maxSize = maxSize;
                    }
                    queue(obj) {
                        const idVal = String(obj[this.idField]);
                        let sending = this.toSend.get(idVal);
                        if (sending) {
                            return sending.def.promise;
                        }
                        const cached = this.cache.get(idVal);
                        if (cached != null) {
                            if (Date.now() - cached.timestamp > CacheTime) {
                                this.cache.delete(idVal);
                            } else {
                                return cached.def.promise;
                            }
                        }
                        sending = {
                            id: idVal,
                            obj,
                            def: promise(),
                            timestamp: Date.now(),
                        };
                        this.toSend.set(idVal, sending);
                        if (this.sendTimeout == null) {
                            this.sendTimeout = setTimeout(() => this.flush(), this.delay);
                        }
                        if (this.toSend.size > this.maxSize) {
                            this.flush();
                        }
                        return sending.def.promise;
                    }
                    flush() {
                        if (this.sendTimeout == null) {
                            return;
                        }
                        clearTimeout(this.sendTimeout);
                        this.sendTimeout = null;
                        this.exec(this.toSend);
                    }
                    async exec(data) {
                        const toSend = Array.from(data.values());
                        data.clear();
                        const res = await this.run(toSend.map((c) => c.obj));
                        for (let i = 0; i < toSend.length; i++) {
                            toSend[i].def.resolve(res[i]);
                            this.cache.set(toSend[i].id, toSend[i]);
                        }
                    }
                }
                exports.Batcher = Batcher;

                /***/
            }),

        /***/
        382:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const bug_fix_1 = __webpack_require__(402);
                const st_1 = __webpack_require__(538);
                const camp_tracker_1 = __webpack_require__(17);
                const alliance_scanner_1 = __webpack_require__(843);
                const layout_1 = __webpack_require__(181);
                const kill_info_1 = __webpack_require__(323);
                const button_1 = __webpack_require__(708);
                const player_status_1 = __webpack_require__(779);

                function autoDisable(st, module) {
                    if (st.config.get(`${module.name}.enabled`) == null) {
                        st.config.disable(module);
                    }
                }
                if (typeof window != 'undefined') {
                    async function startup() {
                        var _a;
                        const windowAny = window;
                        await ((_a = windowAny.st) === null || _a === void 0 ? void 0 : _a.stop());
                        const st = st_1.St.getInstance();
                        windowAny.st = st;
                        await st.start();
                        const as = new alliance_scanner_1.AllianceScanner(st);
                        const ls = new layout_1.LayoutScanner(st);
                        const button = new button_1.Button(st);
                        autoDisable(st, as);
                        autoDisable(st, ls);
                        autoDisable(st, button);
                        st.push(as);
                        st.push(ls);
                        st.push(new camp_tracker_1.CampTracker(st));
                        st.push(new kill_info_1.KillInfo(st));
                        st.push(button);
                        st.push(new player_status_1.PlayerStatus(st));
                    }
                    startup().catch((e) => console.error(e));
                    /** FixOnLoad */
                    bug_fix_1.BugFixer.fixOnUnload();
                }

                /***/
            }),

        /***/
        389:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const index_1 = __webpack_require__(282);
                const st_plugin_1 = __webpack_require__(544);
                class StPatches extends st_plugin_1.StPlugin {
                    constructor(st) {
                        super(st);
                        this.name = 'Patches';
                        this.priority = 0;
                        for (const patch of Object.values(index_1.Patches)) {
                            this.patches.push(patch);
                        }
                    }
                }
                exports.StPatches = StPatches;

                /***/
            }),

        /***/
        402:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const st_1 = __webpack_require__(538);
                class BugFixer {
                    /**
                     * `window.onunload` takes a very long time inside of _onNativeUnload
                     * which appears to be destroying objects.
                     *
                     * quick hack remove onunload listeners
                     */
                    static fixOnUnload() {
                        const fixedWindow = window;
                        fixedWindow._addEventListener = window.addEventListener;
                        window.addEventListener = function (a, b, c) {
                            if (a == 'unload') {
                                st_1.St.getInstance().log.info('Prevented Unload bug');
                                return;
                            }
                            return fixedWindow._addEventListener(a, b, c);
                        };
                    }
                }
                exports.BugFixer = BugFixer;

                /***/
            }),

        /***/
        405:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const st_plugin_1 = __webpack_require__(544);
                const duration_1 = __webpack_require__(287);
                var StState;
                (function (StState) {
                    StState["Idle"] = "idle";
                    StState["Active"] = "active";
                    StState["Stopped"] = "stopped";
                })(StState = exports.StState || (exports.StState = {}));
                /** What is the player currently up to */
                var PlayerState;
                (function (PlayerState) {
                    /** Has recently done something */
                    PlayerState[PlayerState["Active"] = 0] = "Active";
                    /** Hasnt moved in a while */
                    PlayerState[PlayerState["Idle"] = 1] = "Idle";
                })(PlayerState = exports.PlayerState || (exports.PlayerState = {}));
                const PlayerEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
                class StActions extends st_plugin_1.StPlugin {
                    constructor() {
                        super(...arguments);
                        this.name = 'Actions';
                        this.actions = [];
                        this.priority = 100;
                        this.actionState = StState.Idle;
                        this.player = PlayerState.Active;
                        /** No user actions within 20 minutes, means player is idle */
                        this.IdleTime = duration_1.Duration.minutes(20);
                        this.playerAction = () => {
                            this.lastActionTime = Date.now();
                            if (this.player == PlayerState.Idle) {
                                this.st.log.info('PlayerActive');
                            }
                            this.player = PlayerState.Active;
                        };
                    }
                    async onStart() {
                        for (const evt of PlayerEvents) {
                            document.addEventListener(evt, this.playerAction, true);
                        }
                        this.lastActionTime = Date.now();
                        this.interval(() => this.checkIdle(), duration_1.Duration.OneSecond);
                    }
                    async onStop() {
                        for (const evt of PlayerEvents) {
                            document.removeEventListener(evt, this.playerAction, true);
                        }
                    }
                    checkIdle() {
                        if (this.player == PlayerState.Idle) {
                            return;
                        }
                        if (Date.now() - this.lastActionTime > this.IdleTime) {
                            this.player = PlayerState.Idle;
                            this.st.log.debug({
                                lastAction: new Date(this.lastActionTime).toISOString()
                            }, 'PlayerIdle');
                            // Start processing background actions
                            this.run();
                        }
                    }
                    queue(action) {
                        this.actions.push(action);
                        if (this.isIdle && this.isPlayerIdle) {
                            this.run();
                        }
                    }
                    /** Remove any queued actions from a module */
                    clear(StPlugin) {
                        if (StPlugin == null) {
                            this.actions = [];
                        } else {
                            this.actions = this.actions.filter((f) => f.plugin.id != StPlugin.id);
                        }
                    }
                    nextAction(playerTriggered) {
                        const action = this.actions.shift();
                        if (action == null) {
                            return 'NoAction';
                        }
                        if (!this.st.isOnline) {
                            return 'PlayerOffline';
                        }
                        if (!this.isActive) {
                            return 'StExit';
                        }
                        if (action.plugin.isStopping) {
                            return 'ModuleStopping';
                        }
                        if (!playerTriggered && !this.isPlayerIdle) {
                            this.st.log.info('AbortScan');
                            return 'PlayerActive';
                        }
                        return action;
                    }
                    /**
                     * Run the queued actions, each action will be run once at a time
                     *
                     * This should be pauseable if the user decides to move the mouse and click @see this.player state
                     */
                    async run(playerTriggered = false) {
                        if (!this.isIdle) {
                            throw new Error('ST is not idle');
                        }
                        if (this.actions.length == 0 || !this.st.isOnline) {
                            return;
                        }
                        this.actionState = StState.Active;
                        // Hide the main overlay
                        qx.core.Init.getApplication().showMainOverlay(false);
                        // Force a async callback
                        await new Promise((resolve) => setTimeout(resolve, 0));
                        const startTime = Date.now();
                        this.st.log.info('RunStart');
                        let reason = 'None';
                        try {
                            let count = 0;
                            while (this.actions.length > 0) {
                                // User actions make poll's faster
                                ClientLib.Net.CommunicationManager.GetInstance().UserAction();
                                const action = this.nextAction(playerTriggered);
                                if (typeof action == 'string') {
                                    reason = action;
                                    break;
                                }
                                count++;
                                await action.run(count, this.actions.length + count);
                            }
                            if (this.actions.length == 0) {
                                reason = 'Finished';
                            }
                        } finally {
                            this.st.log.info({
                                duration: Date.now() - startTime,
                                reason
                            }, 'RunFinished');
                            this.actionState = StState.Idle;
                        }
                    }
                    get isIdle() {
                        return this.actionState == StState.Idle;
                    }
                    get isActive() {
                        return this.actionState == StState.Active;
                    }
                    get isPlayerIdle() {
                        return this.player == PlayerState.Idle;
                    }
                }
                exports.StActions = StActions;

                /***/
            }),

        /***/
        414:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                function __export(m) {
                    for (var p in m)
                        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
                }
                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                __export(__webpack_require__(114));
                __export(__webpack_require__(650));
                __export(__webpack_require__(784));
                __export(__webpack_require__(313));
                __export(__webpack_require__(717));

                /***/
            }),

        /***/
        417:
            /***/
            (function (module) {

                module.exports = null;

                /***/
            }),

        /***/
        436:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.WorldNames = {
                    10: {
                        name: 'Closed Beta 1'
                    },
                    11: {
                        name: 'Closed Beta 2'
                    },
                    12: {
                        name: 'Closed Beta 3'
                    },
                    13: {
                        name: 'World 4 (Europe)'
                    },
                    14: {
                        name: 'World 5 (USA East Coast)'
                    },
                    15: {
                        name: 'Welt 1'
                    },
                    16: {
                        name: 'Welt 2'
                    },
                    17: {
                        name: 'World 6 (Europe)'
                    },
                    18: {
                        name: 'World 7 (Europe)'
                    },
                    19: {
                        name: 'Welt 3'
                    },
                    20: {
                        name: 'World 8 (USA East Coast)'
                    },
                    21: {
                        name: 'World 9 (USA West Coast)'
                    },
                    24: {
                        name: 'World 10 (Europe)'
                    },
                    25: {
                        name: 'World 11 (Europe)'
                    },
                    26: {
                        name: 'Welt 4'
                    },
                    27: {
                        name: 'World 12 (Europe)'
                    },
                    28: {
                        name: 'World 13 (USA East Coast)'
                    },
                    29: {
                        name: 'World 15 (Europe)'
                    },
                    30: {
                        name: 'World 14 (Europe)'
                    },
                    31: {
                        name: 'World 16 (Europe)'
                    },
                    32: {
                        name: 'World 17 (USA East Coast)'
                    },
                    33: {
                        name: 'World 18 (Europe)'
                    },
                    34: {
                        name: 'World 19 (USA West Coast)'
                    },
                    35: {
                        name: 'World 30 (Europe)'
                    },
                    36: {
                        name: 'World 21 (Europe)'
                    },
                    37: {
                        name: 'Monde 1'
                    },
                    38: {
                        name: 'Mondo 1'
                    },
                    39: {
                        name: 'Mundo 1 (España)'
                    },
                    40: {
                        name: 'Świat 1'
                    },
                    41: {
                        name: 'Мир 1'
                    },
                    42: {
                        name: 'Mundo 1 (Portuguesa)'
                    },
                    43: {
                        name: 'Dünya 1'
                    },
                    44: {
                        name: 'Wereld 1'
                    },
                    45: {
                        name: 'Mundo 1 Brazil'
                    },
                    46: {
                        name: 'Welt 5'
                    },
                    47: {
                        name: 'Monde 2'
                    },
                    48: {
                        name: 'Mondo 2'
                    },
                    49: {
                        name: 'Mundo 2 (España)'
                    },
                    50: {
                        name: 'Świat 2'
                    },
                    51: {
                        name: 'Mundo 2 (Portuguesa)'
                    },
                    52: {
                        name: 'Мир 2'
                    },
                    53: {
                        name: 'Dünya 2'
                    },
                    54: {
                        name: 'Wereld 2'
                    },
                    55: {
                        name: 'Mundo 2 Brazil'
                    },
                    56: {
                        name: 'World 22 (USA East Coast)'
                    },
                    57: {
                        name: 'World 23 (Europe)'
                    },
                    58: {
                        name: 'Welt 6'
                    },
                    59: {
                        name: 'World 24 (Europe)'
                    },
                    60: {
                        name: 'World 25 (USA West Coast)'
                    },
                    61: {
                        name: 'World 26 (USA East Coast)'
                    },
                    62: {
                        name: 'World 27 (Europe)'
                    },
                    64: {
                        name: 'Welt 7'
                    },
                    65: {
                        name: 'Monde 3'
                    },
                    66: {
                        name: 'World 28 (USA East Coast)'
                    },
                    67: {
                        name: 'World 29 (Europe)'
                    },
                    68: {
                        name: 'Welt 8'
                    },
                    69: {
                        name: 'Mundo 3 (España)'
                    },
                    70: {
                        name: 'World 31 (USA West Coast)'
                    },
                    71: {
                        name: 'World 32 (USA East Coast)'
                    },
                    72: {
                        name: 'Monde 4'
                    },
                    73: {
                        name: 'World 33 (Europe)'
                    },
                    74: {
                        name: 'Welt 9'
                    },
                    75: {
                        name: 'Мир 3'
                    },
                    76: {
                        name: 'Welt 10'
                    },
                    77: {
                        name: 'World 34 (Europe)'
                    },
                    78: {
                        name: 'Mundo 3 Brazil'
                    },
                    79: {
                        name: 'World 35 (USA East Coast)'
                    },
                    80: {
                        name: 'Welt 11'
                    },
                    81: {
                        name: 'World 36 (Europe)'
                    },
                    82: {
                        name: 'Mundo 4 (España)'
                    },
                    83: {
                        name: 'Мир 4'
                    },
                    84: {
                        name: 'Monde 5'
                    },
                    85: {
                        name: 'Welt 12'
                    },
                    86: {
                        name: 'World 37 (Europe)'
                    },
                    87: {
                        name: 'World 38 (USA West Coast)'
                    },
                    88: {
                        name: 'World 39 (USA East Coast)'
                    },
                    99: {
                        name: 'Mundo 4 Brazil'
                    },
                    100: {
                        name: 'World 40 (Europe)'
                    },
                    101: {
                        name: 'Welt 13'
                    },
                    102: {
                        name: 'Mundo 5 (España)'
                    },
                    103: {
                        name: 'Świat 3'
                    },
                    104: {
                        name: 'World 41 (Europe)'
                    },
                    105: {
                        name: 'Welt 14'
                    },
                    106: {
                        name: 'World 42 (USA East Coast)'
                    },
                    107: {
                        name: 'Мир 5'
                    },
                    108: {
                        name: 'World 43 (Europe)'
                    },
                    109: {
                        name: 'Monde 6'
                    },
                    110: {
                        name: 'Welt 15'
                    },
                    111: {
                        name: 'Мир 1 Українська'
                    },
                    112: {
                        name: 'Världen 1'
                    },
                    113: {
                        name: 'Svet 1'
                    },
                    114: {
                        name: 'Lume 1'
                    },
                    115: {
                        name: 'Verden 1'
                    },
                    116: {
                        name: 'Világ 1'
                    },
                    117: {
                        name: 'Maailma 1'
                    },
                    118: {
                        name: 'Verden 1'
                    },
                    119: {
                        name: 'Svět 1'
                    },
                    120: {
                        name: '1 العالم'
                    },
                    121: {
                        name: 'World 44 (Europe)'
                    },
                    122: {
                        name: 'Мир 6'
                    },
                    123: {
                        name: 'Welt 16'
                    },
                    124: {
                        name: 'World 45 (USA West Coast)'
                    },
                    125: {
                        name: 'World 46 (USA East Coast)'
                    },
                    126: {
                        name: 'Mundo 6 (España)'
                    },
                    127: {
                        name: 'World 47 (Europe)'
                    },
                    128: {
                        name: 'Mundo 3 (Portuguesa)'
                    },
                    129: {
                        name: 'Świat 4'
                    },
                    130: {
                        name: 'Welt 17'
                    },
                    131: {
                        name: 'Мир 7'
                    },
                    132: {
                        name: 'World 48 (Europe)'
                    },
                    133: {
                        name: 'World 49 (USA East Coast)'
                    },
                    134: {
                        name: 'Monde 7'
                    },
                    135: {
                        name: 'Dünya 3'
                    },
                    136: {
                        name: 'Mundo 4 (Portuguesa)'
                    },
                    137: {
                        name: 'Welt 18'
                    },
                    138: {
                        name: 'World 50 (Europe)'
                    },
                    139: {
                        name: 'Mundo 7 (España)'
                    },
                    140: {
                        name: 'World 51 (USA West Coast)'
                    },
                    141: {
                        name: 'World 52 (USA East Coast)'
                    },
                    142: {
                        name: 'World 53 (Europe)'
                    },
                    143: {
                        name: 'Мир 8'
                    },
                    144: {
                        name: 'Welt 19'
                    },
                    145: {
                        name: 'World 54 (Europe)'
                    },
                    146: {
                        name: 'Welt 20'
                    },
                    147: {
                        name: 'Мир 9'
                    },
                    148: {
                        name: 'World 55 (USA East Coast)'
                    },
                    149: {
                        name: 'Mundo 8 (España)'
                    },
                    150: {
                        name: 'Świat 5'
                    },
                    151: {
                        name: 'World 56 (Europe)'
                    },
                    152: {
                        name: 'Monde 8'
                    },
                    153: {
                        name: 'Wereld 3'
                    },
                    154: {
                        name: 'World 57 (Europe)'
                    },
                    155: {
                        name: 'World 58 (USA East Coast)'
                    },
                    156: {
                        name: 'Welt 21'
                    },
                    157: {
                        name: 'Mundo 5 Brazil'
                    },
                    158: {
                        name: 'Welt 22'
                    },
                    159: {
                        name: 'World 59 (USA West Coast)'
                    },
                    160: {
                        name: 'World 60 (Europe)'
                    },
                    161: {
                        name: 'World 61 (USA East Coast)'
                    },
                    162: {
                        name: 'Мир 10'
                    },
                    163: {
                        name: 'Mundo 9 (España)'
                    },
                    164: {
                        name: 'World 62 (Europe)'
                    },
                    165: {
                        name: 'Мир 11'
                    },
                    166: {
                        name: 'Welt 23'
                    },
                    167: {
                        name: 'Świat 6'
                    },
                    168: {
                        name: 'World 63 (Europe)'
                    },
                    169: {
                        name: 'Mundo 10 (España)'
                    },
                    170: {
                        name: 'Mundo 6 Brazil'
                    },
                    171: {
                        name: 'Welt 24'
                    },
                    172: {
                        name: 'Мир 12'
                    },
                    173: {
                        name: 'Monde 9'
                    },
                    174: {
                        name: 'World 64 (USA East Coast)'
                    },
                    175: {
                        name: 'World 65 (USA West Coast)'
                    },
                    176: {
                        name: 'Мир 13'
                    },
                    177: {
                        name: 'Welt 25'
                    },
                    178: {
                        name: 'World 66 (Europe)'
                    },
                    179: {
                        name: 'Mundo 7 Brazil'
                    },
                    180: {
                        name: 'World 67 (USA East Coast)'
                    },
                    182: {
                        name: 'Świat 7'
                    },
                    183: {
                        name: 'Мир 14'
                    },
                    184: {
                        name: 'Welt 26'
                    },
                    185: {
                        name: 'Mundo 11 (España)'
                    },
                    186: {
                        name: 'World 68 (USA West Coast)'
                    },
                    187: {
                        name: 'Svět 2'
                    },
                    188: {
                        name: 'World 69 (USA East Coast)'
                    },
                    189: {
                        name: 'Monde 10'
                    },
                    190: {
                        name: 'World 70 (Europe)'
                    },
                    191: {
                        name: 'Dunia 1'
                    },
                    192: {
                        name: 'Welt 27'
                    },
                    193: {
                        name: 'Mundo 12 (España)'
                    },
                    194: {
                        name: 'Welt 28'
                    },
                    195: {
                        name: 'World 71 (USA East Coast)'
                    },
                    196: {
                        name: 'Мир 15'
                    },
                    197: {
                        name: 'World 72 (Europe)'
                    },
                    198: {
                        name: 'Dünya 4'
                    },
                    199: {
                        name: 'Mundo 8 Brazil'
                    },
                    200: {
                        name: 'Wereld 4'
                    },
                    201: {
                        name: 'World 73 (USA West Coast)'
                    },
                    202: {
                        name: 'World 74 (USA East Coast)'
                    },
                    203: {
                        name: 'Welt 29'
                    },
                    204: {
                        name: 'Mundo 13 (España)'
                    },
                    205: {
                        name: 'Monde 11'
                    },
                    206: {
                        name: 'Świat 8'
                    },
                    207: {
                        name: 'Mondo 3'
                    },
                    220: {
                        name: 'World 75 (Anniversary)'
                    },
                    222: {
                        name: 'Мир 16'
                    },
                    223: {
                        name: 'Welt 30'
                    },
                    224: {
                        name: 'World 77 (USA East Coast)'
                    },
                    225: {
                        name: 'Welt 31'
                    },
                    226: {
                        name: 'Mundo 14 (España)'
                    },
                    227: {
                        name: 'World 78 (Europe)'
                    },
                    228: {
                        name: 'World 79 (USA West Coast)'
                    },
                    229: {
                        name: 'World 80 (USA East Coast)'
                    },
                    230: {
                        name: 'World 81 (Europe)'
                    },
                    231: {
                        name: 'Mundo 9 Brazil'
                    },
                    232: {
                        name: 'Világ 2'
                    },
                    233: {
                        name: 'Monde 12'
                    },
                    234: {
                        name: 'Мир 17'
                    },
                    235: {
                        name: 'World 82 (Europe)'
                    },
                    236: {
                        name: 'Welt 32'
                    },
                    237: {
                        name: 'World 83 (USA East Coast)'
                    },
                    238: {
                        name: 'Świat 9'
                    },
                    239: {
                        name: 'Mundo 15 (España)'
                    },
                    240: {
                        name: 'World 84 (Europe)'
                    },
                    241: {
                        name: 'Dünya 5'
                    },
                    242: {
                        name: 'Svět 3'
                    },
                    244: {
                        name: 'World 85 (Europe)'
                    },
                    245: {
                        name: 'Welt 33'
                    },
                    246: {
                        name: 'World 86 (USA East Coast)'
                    },
                    247: {
                        name: 'World 87 (Europe)'
                    },
                    248: {
                        name: 'World 88 (USA West Coast)'
                    },
                    249: {
                        name: 'Welt 34'
                    },
                    250: {
                        name: 'Monde 13'
                    },
                    251: {
                        name: 'Мир 18'
                    },
                    252: {
                        name: 'Mundo 10 Brazil'
                    },
                    254: {
                        name: 'Mundo 16 (España)'
                    },
                    255: {
                        name: 'World 89 (Europe)'
                    },
                    256: {
                        name: 'Wereld 5'
                    },
                    257: {
                        name: 'Świat 10'
                    },
                    258: {
                        name: 'World 90 (USA West Coast)'
                    },
                    259: {
                        name: 'World 91 (Europe)'
                    },
                    260: {
                        name: 'Mondo 4'
                    },
                    261: {
                        name: 'World Forgotten Attacks Beta'
                    },
                    262: {
                        name: 'World 92 (USA West Coast)'
                    },
                    263: {
                        name: 'Мир 19'
                    },
                    264: {
                        name: 'Welt 35'
                    },
                    265: {
                        name: 'World 93 (Europe)'
                    },
                    266: {
                        name: 'Mundo 11 Brazil'
                    },
                    267: {
                        name: 'Dünya 6'
                    },
                    268: {
                        name: 'Monde 14'
                    },
                    269: {
                        name: 'Mundo 17 (España)'
                    },
                    270: {
                        name: 'World 94 (USA West Coast)'
                    },
                    271: {
                        name: 'World 95 (Europe)'
                    },
                    272: {
                        name: 'World 96 (USA East Coast)'
                    },
                    273: {
                        name: 'Lume 2'
                    },
                    274: {
                        name: 'Svet 2'
                    },
                    276: {
                        name: 'Mundo 5 (Portuguesa)'
                    },
                    277: {
                        name: 'World 97 (Europe)'
                    },
                    278: {
                        name: 'Мир 20'
                    },
                    279: {
                        name: 'Mundo 12 Brazil'
                    },
                    280: {
                        name: 'Welt 36'
                    },
                    281: {
                        name: 'World 98 (Europe)'
                    },
                    282: {
                        name: 'Świat 11'
                    },
                    283: {
                        name: 'Mundo 18 (España)'
                    },
                    284: {
                        name: 'Monde 15'
                    },
                    285: {
                        name: 'World 99 (USA East Coast)'
                    },
                    286: {
                        name: 'World 100'
                    },
                    289: {
                        name: 'World 101 (Europe)'
                    },
                    290: {
                        name: 'Världen 2'
                    },
                    291: {
                        name: 'World 102 (USA West Coast)'
                    },
                    292: {
                        name: 'Welt 37'
                    },
                    293: {
                        name: 'World 103 (Europe)'
                    },
                    294: {
                        name: 'World 104 (USA East Coast)'
                    },
                    295: {
                        name: 'Mundo 13 Brazil'
                    },
                    296: {
                        name: 'Мир 21'
                    },
                    297: {
                        name: 'Mundo 19 (España)'
                    },
                    298: {
                        name: 'World 105 (Europe)'
                    },
                    299: {
                        name: 'Monde 16'
                    },
                    300: {
                        name: 'World 106 (Europe)'
                    },
                    301: {
                        name: 'World 107 Classic (USA East Coast)'
                    },
                    302: {
                        name: 'Welt 38 Klassisch'
                    },
                    303: {
                        name: 'Dünya 7'
                    },
                    304: {
                        name: '2 العالم'
                    },
                    306: {
                        name: 'Verden 2'
                    },
                    307: {
                        name: 'Verden 2'
                    },
                    310: {
                        name: 'World 108 Classic (USA West Coast)'
                    },
                    313: {
                        name: 'Tiberian 1'
                    },
                    314: {
                        name: 'Wrath 1'
                    },
                    315: {
                        name: 'Firestorm 1'
                    },
                    316: {
                        name: 'Tiberian 2 (Europe)'
                    },
                    317: {
                        name: 'Tiberian 3'
                    },
                    318: {
                        name: 'Wrath 2'
                    },
                    319: {
                        name: 'Firestorm 2'
                    },
                    320: {
                        name: 'Public Test Environment'
                    },
                    322: {
                        name: 'Tiberian 4'
                    },
                    323: {
                        name: 'Wrath 3'
                    },
                    324: {
                        name: 'Firestorm 3'
                    },
                    326: {
                        name: 'Tiberian 5'
                    },
                    327: {
                        name: 'Tiberian 6'
                    },
                    328: {
                        name: 'Tiberian 7'
                    },
                    329: {
                        name: 'Wrath 4'
                    },
                    330: {
                        name: 'Firestorm 4'
                    },
                    331: {
                        name: 'Tiberian 8'
                    },
                    332: {
                        name: 'Firestorm 5'
                    },
                    333: {
                        name: 'Wrath 5'
                    },
                    334: {
                        name: 'Tiberian 9'
                    },
                    335: {
                        name: 'Tiberian 10'
                    },
                    336: {
                        name: 'Wrath 6'
                    },
                    337: {
                        name: 'Firestorm 6'
                    },
                    338: {
                        name: 'Tiberian 11'
                    },
                    339: {
                        name: 'Tiberian 12'
                    },
                    341: {
                        name: 'Tiberian 13'
                    },
                    342: {
                        name: 'Speedworld 1'
                    },
                    344: {
                        name: 'Wrath 7'
                    },
                    345: {
                        name: 'Tiberian 14'
                    },
                    346: {
                        name: 'Firestorm 7'
                    },
                    350: {
                        name: 'Tiberian 15'
                    },
                    351: {
                        name: 'Wrath 8'
                    },
                    353: {
                        name: 'Tiberian 16'
                    },
                    354: {
                        name: 'Wrath 9'
                    },
                    355: {
                        name: 'Tiberian 17'
                    },
                    356: {
                        name: 'Speedworld 2'
                    },
                    357: {
                        name: 'Tiberian 18'
                    },
                    358: {
                        name: 'Wrath 10'
                    },
                    359: {
                        name: 'Tiberian 19'
                    },
                    360: {
                        name: 'Wrath 11'
                    },
                    361: {
                        name: 'Tiberian 20'
                    },
                    362: {
                        name: 'Wrath 12'
                    },
                    364: {
                        name: 'Tiberian 21'
                    },
                    365: {
                        name: 'Wrath 13'
                    },
                    366: {
                        name: 'Tiberian 22'
                    },
                    367: {
                        name: 'Wrath 14'
                    },
                    368: {
                        name: 'Tiberian 23'
                    },
                    369: {
                        name: 'Wrath 15'
                    },
                    370: {
                        name: 'Tiberian 24 (Europe)'
                    },
                    371: {
                        name: 'Wrath 16'
                    },
                    372: {
                        name: 'Tiberian 25 (Europe)'
                    },
                    374: {
                        name: 'Tiberian 26'
                    },
                    376: {
                        name: 'Wrath 17'
                    },
                    377: {
                        name: 'Tiberian 27 (Europe)'
                    },
                    378: {
                        name: 'Tiberian 28 (Europe)'
                    },
                    379: {
                        name: 'Wrath 18'
                    },
                    380: {
                        name: 'Tiberian 29 (Europe)'
                    },
                    382: {
                        name: 'Wrath 19'
                    },
                    383: {
                        name: 'Wrath 20'
                    },
                    384: {
                        name: 'Tiberian 30 (Europe)'
                    },
                    385: {
                        name: 'Firestorm 8'
                    },
                    386: {
                        name: 'Tiberian 31 (Europe)'
                    },
                    387: {
                        name: 'Tiberian 32 (Europe)'
                    },
                    388: {
                        name: 'Wrath 21'
                    },
                    390: {
                        name: 'Tiberian 33 (Europe)'
                    },
                    391: {
                        name: 'Firestorm 9'
                    },
                    392: {
                        name: 'Tiberian 34 (Europe)'
                    },
                    393: {
                        name: 'Wrath 22'
                    },
                    394: {
                        name: 'Tiberian 35 (Europe)'
                    },
                    397: {
                        name: 'Tiberian 36 (Europe)'
                    },
                    398: {
                        name: 'Wrath 23'
                    },
                    399: {
                        name: 'Firestorm 10'
                    },
                    400: {
                        name: 'Tiberian 37 (Europe)'
                    },
                    401: {
                        name: 'Firestorm 11'
                    },
                    402: {
                        name: 'Tiberian 38 (Europe)'
                    },
                    404: {
                        name: 'Tiberian 39 (Europe)'
                    },
                    405: {
                        name: 'Firestorm 12'
                    },
                    406: {
                        name: 'Tiberian 40'
                    },
                    407: {
                        name: 'Wrath 24'
                    },
                    408: {
                        name: 'Tiberian 41'
                    },
                    410: {
                        name: 'Tiberian 42'
                    },
                    411: {
                        name: 'Tiberian 43'
                    },
                    412: {
                        name: 'Firestorm 13'
                    },
                };

                function getWorldName(worldId) {
                    var _a, _b;
                    return (_b = (_a = exports.WorldNames[worldId]) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : `Unknown World`;
                }
                exports.getWorldName = getWorldName;

                /***/
            }),

        /***/
        441:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                class ClientLibPatchGetter {
                    constructor(targetFunctionName, varName) {
                        this.targetFunctionName = targetFunctionName;
                        this.varName = varName;
                    }
                    isPatched(k) {
                        return k != null && typeof k[this.targetFunctionName] !== 'undefined';
                    }
                    apply(target) {
                        // Make sure the property does not already exist
                        if (typeof target.prototype[this.targetFunctionName] !== 'undefined') {
                            return true;
                        }
                        const varName = typeof this.varName == 'function' ? this.varName() : this.varName;
                        if (varName == null) {
                            return false;
                        }
                        Object.defineProperty(target.prototype, this.targetFunctionName, {
                            configurable: true,
                            get: function () {
                                return this[varName];
                            },
                        });
                        return true;
                    }
                    remove(target) {
                        if (typeof target.prototype[this.targetFunctionName] !== 'undefined') {
                            delete target.prototype[this.targetFunctionName];
                        }
                    }
                }
                exports.ClientLibPatchGetter = ClientLibPatchGetter;

                /***/
            }),

        /***/
        466:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });

                function report(errors) {
                    const output = [];
                    for (const e of errors) {
                        output.push({
                            reason: 'invalid',
                            value: e.value,
                            path: e.context
                                .slice(1)
                                .map((c) => c.key)
                                .join('.'),
                        });
                    }
                    return output;
                }
                exports.V2Report = {
                    report,
                };

                /***/
            }),

        /***/
        494:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const bblog_1 = __webpack_require__(62);
                exports.StLog = bblog_1.Log.createLogger({
                    name: 'st',
                    hostname: ''
                });
                const IGNORE_KEYS = {
                    msg: true,
                    id: true,
                    level: true,
                    v: true,
                    time: true,
                    pid: true,
                    hostname: true,
                    name: true,
                };

                function getLogStatus(level) {
                    if (level <= 10) {
                        return 'TRACE';
                    }
                    if (level <= 20) {
                        return 'DEBUG';
                    }
                    if (level <= 30) {
                        return 'INFO';
                    }
                    if (level <= 40) {
                        return 'WARN';
                    }
                    if (level <= 50) {
                        return 'ERROR';
                    }
                    return 'FATAL';
                }

                function getShortId(msg) {
                    if (typeof msg.id == 'string') {
                        return msg.id.substr(-5);
                    }
                    return '';
                }
                exports.StLogStream = {
                    level: bblog_1.Log.TRACE,
                    setLevel(level) {
                        this.level = level;
                    },
                    formatObject(obj) {
                        const kvs = [];
                        for (const key of Object.keys(obj)) {
                            if (IGNORE_KEYS[key] === true) {
                                continue;
                            }
                            const value = obj[key];
                            if (value == null || value === '') {
                                continue;
                            }
                            let output = '';
                            const typeofValue = typeof value;
                            if (typeofValue === 'number') {
                                output = String(value);
                            } else if (typeofValue === 'string') {
                                output = value;
                            } else if (typeofValue === 'object') {
                                const subOutput = this.formatObject(value);
                                if (subOutput.length > 0) {
                                    output = `{ ${subOutput.join(', ')} }`;
                                }
                            } else {
                                output = String(value);
                            }
                            if (output != '') {
                                kvs.push(`${key}=${output}`);
                            }
                        }
                        return kvs;
                    },
                    write(msg) {
                        if (msg.level < exports.StLogStream.level) {
                            return;
                        }
                        // @ts-ignore
                        if (typeof window == 'undefined') {
                            console.log(JSON.stringify(msg));
                        } else {
                            const kvString = this.formatObject(msg);
                            const idShort = getShortId(msg);
                            console.log(msg.time.toISOString(), getLogStatus(msg.level), idShort, msg.msg, kvString.join(', '));
                        }
                    },
                };
                exports.StLog.addStream(exports.StLogStream);

                /***/
            }),

        /***/
        500:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const patch_data_1 = __webpack_require__(33);
                const base_62_1 = __webpack_require__(346);
                const city_research_1 = __webpack_require__(785);
                const pack_1 = __webpack_require__(414);
                const layout_packer_1 = __webpack_require__(114);
                const unit_packer_1 = __webpack_require__(313);
                class CityScannerUtil {
                    static packUnit(unit) {
                        const xy = pack_1.UnitLocationPacker.pack(unit.get_CoordX(), unit.get_CoordY());
                        return unit_packer_1.UnitPacker.pack({
                            xy,
                            id: unit.get_MdbUnitId(),
                            level: unit.get_CurrentLevel()
                        });
                    }
                    static get(city) {
                        if (city == null) {
                            return null;
                        }
                        const MainData = ClientLib.Data.MainData.GetInstance();
                        const player = MainData.get_Player();
                        const server = MainData.get_Server();
                        const ownerId = city.get_OwnerId();
                        const cityData = {
                            cityId: city.get_Id(),
                            level: {
                                base: city.get_LvlBase(),
                                off: city.get_LvlOffense(),
                                def: city.get_LvlDefense(),
                            },
                            name: city.get_Name(),
                            x: city.get_PosX(),
                            y: city.get_PosY(),
                            faction: city.get_CityFaction(),
                            ownerId: city.get_OwnerId(),
                            owner: city.get_OwnerName() || player.name,
                            version: city.get_Version(),
                            worldId: server.get_WorldId(),
                            alliance: city.get_OwnerAllianceName(),
                            allianceId: city.get_OwnerAllianceId(),
                            tiles: CityScannerUtil.getLayout(city),
                            base: base_62_1.Base62.pack(Object.values(city.get_Buildings().d).map((unit) => CityScannerUtil.packUnit(unit))),
                            upgrades: city_research_1.ClientLibResearchUtil.getUpgrades(city),
                            ...CityScannerUtil.getUnits(city),
                            timestamp: Date.now(),
                        };
                        // If the base is owned by us it screws with the alliance info
                        if (ownerId == player.id) {
                            const alliance = MainData.get_Alliance();
                            if (alliance == null) {
                                return cityData;
                            }
                            cityData.alliance = alliance.get_Name();
                            cityData.allianceId = alliance.get_Id();
                        }
                        return cityData;
                    }
                    /** Pack a city layout into a number */
                    static getLayout(city) {
                        const output = [];
                        for (let y = 0; y < 16 /* MaxDef */ ; y++) {
                            const row = [];
                            for (let x = 0; x < 9 /* Max */ ; x++) {
                                const type = city.GetResourceType(x, y);
                                row.push(type);
                            }
                            output.push(layout_packer_1.LayoutPacker.pack(row));
                        }
                        return base_62_1.Base62.pack(output);
                    }
                    static getUnits(city) {
                        const units = city.get_CityUnitsData();
                        if (!patch_data_1.PatchCityUnits.isPatched(units)) {
                            throw new Error('City is not patched, missing: $DefenseUnits');
                        }
                        const defUnits = units.$DefenseUnits;
                        const offUnits = units.$OffenseUnits;
                        const faction = city.get_CityFaction();
                        if (faction === 2 /* Nod */ || faction === 1 /* Gdi */ ) {
                            return {
                                def: base_62_1.Base62.pack(Object.values(defUnits.d).map((unit) => CityScannerUtil.packUnit(unit))),
                                off: base_62_1.Base62.pack(Object.values(offUnits.d).map((unit) => CityScannerUtil.packUnit(unit))),
                            };
                        }
                        return {
                            def: base_62_1.Base62.pack(Object.values(defUnits.d).map((unit) => CityScannerUtil.packUnit(unit))),
                            off: '',
                        };
                    }
                }
                exports.CityScannerUtil = CityScannerUtil;

                /***/
            }),

        /***/
        508:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const api_1 = __webpack_require__(255);
                const st_1 = __webpack_require__(538);
                const batcher_1 = __webpack_require__(347);
                class BatchBaseSender extends batcher_1.Batcher {
                    constructor(api) {
                        super('cityId', 30 * 1000, 25);
                        this.api = api;
                    }
                    get scanId() {
                        return st_1.St.getInstance().instanceId;
                    }
                    async run(data) {
                        st_1.St.getInstance().log.info({
                            bases: data.length
                        }, 'SendingData');
                        const md = ClientLib.Data.MainData.GetInstance();
                        const worldId = md.get_Server().get_WorldId();
                        const player = md.get_Player().name;
                        const res = await api_1.V2Sdk.call('city.scan', {
                            cities: data,
                            worldId,
                            player
                        });
                        if (res.ok) {
                            return res.response.cityIds;
                        }
                        throw new Error('Failed to scan');
                    }
                }
                exports.BatchBaseSender = BatchBaseSender;

                /***/
            }),

        /***/
        536:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                function __export(m) {
                    for (var p in m)
                        if (!exports.hasOwnProperty(p)) exports[p] = m[p];
                }
                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                __export(__webpack_require__(581));
                exports.ApiHeaders = {
                    ExtensionVersion: 'X-St-Extension-Version',
                    ExtensionHash: 'X-St-Extension-Hash',
                    ExtensionInstall: 'X-St-Extension-Install',
                };

                /***/
            }),

        /***/
        538:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const Util = __webpack_require__(182);
                const util_1 = __webpack_require__(182);
                const id_1 = __webpack_require__(276);
                const log_1 = __webpack_require__(494);
                const st_api_1 = __webpack_require__(963);
                const st_actions_1 = __webpack_require__(405);
                const st_cli_1 = __webpack_require__(289);
                const st_config_1 = __webpack_require__(143);
                const st_patches_1 = __webpack_require__(389);
                const InstanceIdKey = 'st-instance-id';
                const ChallengeIdKey = 'st-instance-challenge-id';
                class St {
                    constructor() {
                        /** Time St was initialized */
                        this.startedAt = Date.now();
                        this.id = id_1.Id.generate();
                        this.log = log_1.StLog.child({
                            id: this.id
                        });
                        this.config = new st_config_1.StConfig(this);
                        this.cli = new st_cli_1.StCli(this);
                        this.api = new st_api_1.StApi(this);
                        this.actions = new st_actions_1.StActions(this);
                        this.patches = new st_patches_1.StPatches(this);
                        this.util = Util;
                        this.plugins = [
                            // Core modules
                            this.patches,
                            this.config,
                            this.cli,
                            this.api,
                            this.actions,
                        ];
                    }
                    static getInstance() {
                        if (St.instance == null) {
                            St.instance = new St();
                        }
                        return St.instance;
                    }
                    /** Unique installation key */
                    get instanceId() {
                        let instanceId = localStorage.getItem(InstanceIdKey);
                        if (instanceId == null) {
                            instanceId = id_1.Id.generate();
                            localStorage.setItem(InstanceIdKey, instanceId);
                        }
                        return instanceId;
                    }
                    /** Challenge key given to the user */
                    get challengeId() {
                        var _a;
                        return (_a = localStorage.getItem(ChallengeIdKey)) !== null && _a !== void 0 ? _a : '';
                    }
                    plugin(name) {
                        return this.plugins.find((f) => f.name.toLowerCase() == name.toLowerCase());
                    }
                    async start() {
                        this.log.debug('StStartup');
                        let failCount = 0;
                        while (util_1.ClientLibLoader.isLoaded === false) {
                            failCount++;
                            await new Promise((resolve) => setTimeout(resolve, 100));
                            if (failCount > 100) {
                                this.log.error('StStartup:Failed');
                                throw new Error('St: failed to start after 100 attempts.');
                            }
                        }
                        const removed = util_1.LocalCache.cleanUp();
                        this.log.trace({
                            removed
                        }, 'StCleanup');
                        for (const plugin of this.plugins) {
                            if (this.config.isDisabled(plugin)) {
                                this.log.info({
                                    plugin: plugin.name
                                }, 'StPlugin:Disabled');
                                continue;
                            }
                            if (!plugin.isInit) {
                                this.log.warn({
                                    plugin: plugin.name,
                                    state: plugin.state
                                }, 'Invalid module state');
                                continue;
                            }
                            this.log.debug({
                                plugin: plugin.name
                            }, 'StPlugin:Start');
                            await plugin.start();
                        }
                    }
                    async stop() {
                        for (const plugin of this.plugins) {
                            if (!plugin.isStarted) {
                                continue;
                            }
                            this.log.debug({
                                plugin: plugin.name
                            }, 'StPlugin:Stop');
                            await plugin.stop();
                        }
                    }
                    push(plugin) {
                        this.log.debug({
                            plugin: plugin.name
                        }, 'StPlugin:Add');
                        if (!plugin.isInit) {
                            throw new Error('Invalid plugin state: ' + plugin.name + ' ' + plugin.state);
                        }
                        if (this.plugins.find((f) => f.name == plugin.name)) {
                            throw new Error('Duplicate plugin name: ' + plugin.name);
                        }
                        this.plugins.push(plugin);
                        if (util_1.ClientLibLoader.isLoaded && !this.config.isDisabled(plugin)) {
                            plugin.st = this;
                            plugin.start().catch((error) => log_1.StLog.error({
                                error,
                                plugin: plugin.name
                            }, 'Failed to start plugin'));
                        }
                    }
                    onConfig() {
                        this.plugins.forEach((c) => {
                            var _a;
                            return c.isStarted && ((_a = c.onConfig) === null || _a === void 0 ? void 0 : _a.call(c));
                        });
                    }
                    get isOnline() {
                        return ClientLib.Net.CommunicationManager.GetInstance().get_SessionId() != null;
                    }
                }
                exports.St = St;
                exports.foo = St;

                /***/
            }),

        /***/
        544:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const util_1 = __webpack_require__(182);
                const id_1 = __webpack_require__(276);
                var StPluginState;
                (function (StPluginState) {
                    StPluginState["Init"] = "init";
                    StPluginState["Starting"] = "starting";
                    StPluginState["Started"] = "started";
                    StPluginState["Stopping"] = "stopping";
                    StPluginState["Stopped"] = "stopped";
                })(StPluginState = exports.StPluginState || (exports.StPluginState = {}));
                class StPlugin {
                    constructor(st) {
                        /** Unique id for the specific instantiation of the module */
                        this.id = id_1.Id.generate();
                        this.state = StPluginState.Init;
                        /** Bound events to ClientLib */
                        this.events = [];
                        /** Any periodic timers needed */
                        this.timers = [];
                        /** ClientLib Patches specifically applied for this module */
                        this.patches = [];
                        this.cliCommands = [];
                        this.st = st;
                    }
                    async start() {
                        var _a, _b;
                        this.state = StPluginState.Starting;
                        await ((_a = this.onStart) === null || _a === void 0 ? void 0 : _a.call(this));
                        for (const patch of this.patches) {
                            this.st.log.info({
                                plugin: this.name,
                                patch: patch.path
                            }, 'Patch:Apply');
                            patch.apply();
                        }
                        (_b = this.onConfig) === null || _b === void 0 ? void 0 : _b.call(this);
                        this.state = StPluginState.Started;
                    }
                    cli(cmd) {
                        this.st.cli.register(cmd);
                        this.cliCommands.push(cmd);
                    }
                    async stop() {
                        var _a;
                        this.state = StPluginState.Stopping;
                        this.clearActions();
                        await ((_a = this.onStop) === null || _a === void 0 ? void 0 : _a.call(this));
                        // Destroy events
                        for (const event of this.events) {
                            webfrontend.phe.cnc.Util.detachNetEvent(event.source, event.name, event.type, this, event.cb);
                        }
                        // Destroy timers
                        for (const timer of this.timers) {
                            clearInterval(timer);
                        }
                        // Remove any clientlib patches
                        for (const patch of this.patches) {
                            patch.remove();
                        }
                        this.cliCommands.forEach((c) => this.st.cli.unregister(c));
                        this.state = StPluginState.Stopped;
                    }
                    config(key) {
                        var _a, _b;
                        if (this.config == null) {
                            throw new Error('No config provided for plugin: ' + this.name);
                        }
                        const res = this.st.config.get(`${this.name}.${key}`);
                        if (res == null) {
                            return (_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a[key]) === null || _b === void 0 ? void 0 : _b.value;
                        }
                        return res;
                    }
                    patch(path, obj) {
                        const patch = new util_1.ClientLibPatch(path);
                        patch.baseObject = obj;
                        this.patches.push(patch);
                        return patch;
                    }
                    interval(func, timeout) {
                        this.timers.push(setInterval(func, timeout));
                    }
                    clearActions() {
                        this.st.actions.clear(this);
                    }
                    queueAction(action) {
                        this.st.actions.queue({
                            plugin: this,
                            run: action
                        });
                    }
                    addEvent(source, name, type, cb) {
                        this.events.push({
                            source,
                            name,
                            type,
                            cb
                        });
                        webfrontend.phe.cnc.Util.attachNetEvent(source, name, type, this, cb);
                    }
                    get isStopping() {
                        return this.state == StPluginState.Stopped || this.state == StPluginState.Stopping;
                    }
                    get isStarting() {
                        return this.state == StPluginState.Started || this.state == StPluginState.Starting;
                    }
                    get isInit() {
                        return this.state == StPluginState.Init;
                    }
                    get isStarted() {
                        return this.state == StPluginState.Started;
                    }
                }
                exports.StPlugin = StPlugin;

                /***/
            }),

        /***/
        567:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                class ClientLibIter {
                    static values(obj) {
                        return Object.values(obj.d);
                    }
                    static * iter(obj) {
                        for (const key of Object.keys(obj.d)) {
                            const value = obj.d[key];
                            yield {
                                key,
                                value
                            };
                        }
                    }
                }
                exports.ClientLibIter = ClientLibIter;

                /***/
            }),

        /***/
        581:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const config_1 = __webpack_require__(679);
                class ApiUtil {
                    static request(method, url, params, body = undefined) {
                        let output = url.startsWith('/') ? url.substr(1) : url;
                        for (const [key, value] of Object.entries(params)) {
                            output = output.replace(`:${key}`, String(value));
                        }
                        return {
                            method,
                            url: `${ApiUtil.BaseUrl}/${output}`,
                            params,
                            body: JSON.stringify(body),
                        };
                    }
                }
                exports.ApiUtil = ApiUtil;
                ApiUtil.BaseUrl = config_1.Config.api.url.replace('https://shockr.dev', 'https://shockr.dev');

                /***/
            }),

        /***/
        610:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                /**
                 * Replace a function on a prototype with a new function
                 *
                 * stores a backup inside the `backupFunctionName` so it can be revered
                 */
                class ClientLibPatchFunction {
                    constructor(sourceFunctionName, targetFunction) {
                        this.sourceFunctionName = sourceFunctionName;
                        this.targetFunction = targetFunction;
                    }
                    get backupFunctionName() {
                        return `__st__${this.sourceFunctionName}`;
                    }
                    isPatched() {
                        return false;
                    }
                    apply(baseObject) {
                        if (typeof baseObject.prototype[this.backupFunctionName] != 'undefined') {
                            return false;
                        }
                        baseObject.prototype[this.backupFunctionName] = baseObject.prototype[this.sourceFunctionName];
                        this.oldFunction = baseObject.prototype[this.backupFunctionName];
                        baseObject.prototype[this.sourceFunctionName] = this.targetFunction;
                        return true;
                    }
                    remove(baseObject) {
                        if (typeof baseObject.prototype[this.backupFunctionName] == 'undefined') {
                            return false;
                        }
                        baseObject.prototype[this.sourceFunctionName] = this.oldFunction;
                        delete baseObject.prototype[this.backupFunctionName];
                        delete this.oldFunction;
                        return true;
                    }
                }
                exports.ClientLibPatchFunction = ClientLibPatchFunction;

                /***/
            }),

        /***/
        650:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const binary_packer_1 = __webpack_require__(784);
                exports.BaseLocationPacker = new binary_packer_1.BinaryPacker({
                    x: 16,
                    y: 16
                });
                class UnitLocationPacker {
                    static pack(x, y) {
                        return y * 9 /* Max */ + x;
                    }
                    static unpack(xy) {
                        return {
                            x: xy % 9 /* Max */ ,
                            y: Math.floor(xy / 9 /* Max */ ),
                        };
                    }
                }
                exports.UnitLocationPacker = UnitLocationPacker;

                /***/
            }),

        /***/
        679:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                exports.Config = {
                    version: '4.5.0',
                    hash: '77260e3',
                    icon: 'favicon.0012b310.png',
                    api: {
                        url: 'https://shockr.dev',
                    },
                };

                /***/
            }),

        /***/
        708:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const util_1 = __webpack_require__(182);
                const config_1 = __webpack_require__(679);
                const st_plugin_1 = __webpack_require__(544);
                const city_cache_1 = __webpack_require__(993);

                function isQxComposite(x) {
                    return x != null && x.basename == 'Composite';
                }
                class Button extends st_plugin_1.StPlugin {
                    constructor() {
                        super(...arguments);
                        this.name = 'Button';
                        this.priority = 100;
                        this.isButtonsAdded = false;
                        this.buttons = [];
                        this.composite = null;
                        this.lastBaseId = null;
                        this.lastBaseLinkId = null;
                    }
                    async onStart() {
                        const regionCity = webfrontend.gui.region.RegionCityMenu.prototype;
                        const oldFunction = (this.oldFunction = regionCity.showMenu);
                        /* eslint-disable @typescript-eslint/no-this-alias */
                        const self = this;
                        regionCity.showMenu = function (selectedBase) {
                            var _a;
                            if (!self.isButtonsAdded) {
                                self.registerButtons(this);
                            }
                            const currentId = (_a = selectedBase.get_Id) === null || _a === void 0 ? void 0 : _a.call(selectedBase);
                            if (currentId == null) {
                                self.buttons.forEach((b) => b.exclude());
                                self.lastBaseId = null;
                                oldFunction.call(this, selectedBase);
                                return;
                            }
                            if (currentId == self.lastBaseId) {
                                oldFunction.call(this, selectedBase);
                                return;
                            }
                            self.buttons.forEach((b) => b.exclude());
                            self.lastBaseId = currentId;
                            self.lastBaseLinkId = null;
                            switch (selectedBase.get_VisObjectType()) {
                                case 14 /* RegionNPCBase */ :
                                case 15 /* RegionNPCCamp */ :
                                case 4 /* RegionCityType */ :
                                    self.waitForBaseReady();
                                    break;
                            }
                            oldFunction.call(this, selectedBase);
                        };
                    }
                    /** Enable the button if/when it can be enabled. */
                    async waitForBaseReady() {
                        const waitId = this.lastBaseId;
                        if (waitId == null) {
                            return;
                        }
                        const res = city_cache_1.CityCache.get(waitId, util_1.Duration.minutes(5));
                        if (res && res.stId) {
                            this.lastBaseLinkId = Promise.resolve(res.stId);
                            this.buttons.forEach((b) => b.show());
                            return;
                        }
                        const city = await util_1.CityUtil.waitForCity(waitId);
                        if (city == null) {
                            return;
                        }
                        const cityObj = util_1.CityScannerUtil.get(city);
                        if (cityObj == null) {
                            return;
                        }
                        const stId = this.st.api.base(cityObj);
                        if (waitId != this.lastBaseId) {
                            return;
                        }
                        this.lastBaseLinkId = stId;
                        this.buttons.forEach((b) => b.show());
                    }
                    registerButtons(obj) {
                        this.isButtonsAdded = true;
                        for (const funcName in obj) {
                            const composite = obj[funcName];
                            if (!isQxComposite(composite)) {
                                continue;
                            }
                            const button = new qx.ui.form.Button('Scan', `${config_1.Config.api.url}/${config_1.Config.icon}`);
                            button.getChildControl('icon').set({
                                width: 16,
                                height: 16,
                                scale: true
                            }); // Force icon to be 16x16 px
                            button.addListener('execute', async () => {
                                var _a, _b;
                                if (this.lastBaseId == null) {
                                    return;
                                }
                                this.st.api.flush();
                                const linkId = await this.lastBaseLinkId;
                                (_b = (_a = qx.core.Init.getApplication()) === null || _a === void 0 ? void 0 : _a.getPlayArea()) === null || _b === void 0 ? void 0 : _b.setView(13 /* pavmAllianceBase */ , this.lastBaseId, 0, 0);
                                window.open(`${config_1.Config.api.url}/base/${linkId}`, '_blank');
                            });
                            composite.add(button);
                            this.buttons.push(button);
                        }
                    }
                    async onStop() {
                        if (this.oldFunction) {
                            webfrontend.gui.region.RegionCityMenu.prototype.showMenu = this.oldFunction;
                            delete this.oldFunction;
                        }
                        for (const button of this.buttons) {
                            button.destroy();
                        }
                        this.buttons = [];
                    }
                }
                exports.Button = Button;

                /***/
            }),

        /***/
        717:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const BaseNVarLength = 'VarLength';
                const BaseNTimeStamp = 'TimeStamp';
                const BaseNTimeStampSeconds = 'TimeStampSeconds';
                /** Ulids use 48 bits for timestamps lets just copy that */
                const MaxTimeMs = 2 ** 48 - 1;
                /** Seconds expire sometime in 3000 */
                const MaxTimeSeconds = 2 ** 35 - 1;
                /**
                 * Pack a collection of numbers into fix width baseN characters
                 */
                class BaseNPacker {
                    constructor(base, format) {
                        this.timeStampSize = 9;
                        this.timeStampSecondsSize = 5;
                        this.base = base;
                        this.fields = [];
                        let offset = 0;
                        this.timeStampSize = this.base.encode(MaxTimeMs).length;
                        this.timeStampSecondsSize = this.base.encode(MaxTimeSeconds).length;
                        for (const [name, length] of Object.entries(format)) {
                            // Timestamp is always first
                            if (length == BaseNTimeStamp || length == BaseNTimeStampSeconds) {
                                if (this.timestamp != null) {
                                    throw new Error(`Duplicate timestamp fields ${this.timestamp.name} vs ${name}`);
                                }
                                this.timestamp = {
                                    name,
                                    type: length
                                };
                                continue;
                            }
                            // VarLength is always last
                            if (length == BaseNVarLength) {
                                if (this.varLength != null) {
                                    throw new Error(`Duplicate var length fields ${this.varLength.name} vs ${name}`);
                                }
                                this.varLength = {
                                    name
                                };
                                continue;
                            }
                            const max = Math.pow(this.base.base, length);
                            this.fields.push({
                                name,
                                length,
                                offset,
                                max
                            });
                            offset += length;
                        }
                    }
                    pack(obj) {
                        var _a;
                        const output = [];
                        if (this.timestamp) {
                            let tsVal = (_a = obj[this.timestamp.name]) !== null && _a !== void 0 ? _a : 0;
                            let size = this.timeStampSize;
                            if (this.timestamp.type == BaseNTimeStampSeconds) {
                                tsVal = Math.floor(tsVal / 1000);
                                size = this.timeStampSecondsSize;
                            }
                            const tsEncoded = this.base
                                .encodeAry(tsVal, size)
                                .reverse() // To have timestamps sortable need to reverse them
                                .join('');
                            output.push(tsEncoded);
                        }
                        for (const field of this.fields) {
                            const value = obj[field.name] || 0;
                            if (value < 0 || value > field.max) {
                                throw new Error(`field: ${field.name} value is too large value: ${value}, maxValue: ${field.max}`);
                            }
                            output.push(this.base.encode(value, field.length));
                        }
                        if (this.varLength) {
                            output.push(this.base.encode(obj[this.varLength.name]));
                        }
                        return output.join('');
                    }
                    unpack(val) {
                        const output = {};
                        const inputAry = val.split('');
                        let offset = 0;
                        if (this.timestamp) {
                            const size = this.timestamp.type == BaseNTimeStampSeconds ? this.timeStampSecondsSize : this.timeStampSize;
                            const tsVal = inputAry.slice(0, size).reverse();
                            const bytes = this.base.decode(tsVal, 0, size);
                            output[this.timestamp.name] =
                                this.timestamp.type == BaseNTimeStampSeconds ? bytes.value * 1000 : bytes.value;
                            offset += size;
                        }
                        for (const field of this.fields) {
                            output[field.name] = this.base.decode(inputAry, offset, field.length).value;
                            offset += field.length;
                        }
                        if (this.varLength) {
                            output[this.varLength.name] = this.base.decode(inputAry, offset).value;
                        }
                        return output;
                    }
                }
                exports.BaseNPacker = BaseNPacker;
                BaseNPacker.VarLength = BaseNVarLength;
                BaseNPacker.TimeStamp = BaseNTimeStamp;
                BaseNPacker.TimeStampSeconds = BaseNTimeStampSeconds;

                /***/
            }),

        /***/
        738:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                class ClientLibLoader {
                    /** Has the game fully loaded */
                    static get isLoaded() {
                        if (typeof ClientLib === 'undefined') {
                            return false;
                        }
                        if (typeof qx === 'undefined') {
                            return false;
                        }
                        const a = qx.core.Init.getApplication();
                        if (a == null) {
                            return false;
                        }
                        const mb = a.getMenuBar();
                        if (mb == null) {
                            return false;
                        }
                        const md = ClientLib.Data.MainData.GetInstance();
                        if (md == null) {
                            return false;
                        }
                        const player = md.get_Player();
                        if (player == null) {
                            return false;
                        }
                        if (player.name === '') {
                            return false;
                        }
                        return true;
                    }
                }
                exports.ClientLibLoader = ClientLibLoader;

                /***/
            }),

        /***/
        745:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const duration_1 = __webpack_require__(287);
                exports.CacheVersion = 0;
                const OneWeekMs = duration_1.Duration.days(7);
                class LocalCache {
                    static get prefix() {
                        const worldId = ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId();
                        return `${LocalCache.prefixStr}-${worldId}-`;
                    }
                    static get(key, maxAge = LocalCache.MaxAgeMs) {
                        const obj = localStorage.getItem(LocalCache.prefix + key);
                        if (obj == null) {
                            return null;
                        }
                        const objJson = JSON.parse(obj);
                        if (objJson.v == null || objJson.v != exports.CacheVersion) {
                            localStorage.removeItem(LocalCache.prefix + key);
                            return null;
                        }
                        if (Date.now() - objJson.timestamp > maxAge) {
                            localStorage.removeItem(LocalCache.prefix + key);
                            return null;
                        }
                        return objJson.value;
                    }
                    static set(key, value) {
                        const toStore = JSON.stringify({
                            timestamp: Date.now(),
                            value,
                            v: exports.CacheVersion
                        });
                        localStorage.setItem(LocalCache.prefix + key, toStore);
                    }
                    static cleanUp() {
                        let removedCount = 0;
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (!(key === null || key === void 0 ? void 0 : key.startsWith(LocalCache.prefix))) {
                                continue;
                            }
                            const value = localStorage.getItem(key);
                            if (value == null) {
                                localStorage.removeItem(key);
                                removedCount++;
                                continue;
                            }
                            const cacheItem = JSON.parse(value);
                            if (cacheItem == null || cacheItem.timestamp == null || Date.now() - cacheItem.timestamp > OneWeekMs) {
                                removedCount++;
                                localStorage.removeItem(key);
                            }
                        }
                        return removedCount;
                    }
                }
                exports.LocalCache = LocalCache;
                LocalCache.prefixStr = 'st-';
                LocalCache.MaxAgeMs = duration_1.Duration.days(3); // 3 days

                /***/
            }),

        /***/
        776:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                /** Base91 is how the server communicates to the client */
                class BaseN {
                    constructor(chars, separator) {
                        this.DecodingTable = {};
                        this.separatorCode = -1;
                        /** Max length needed to store 2 ** 32 */
                        this.maxIntLength = -1;
                        this.base = chars.length;
                        this.chars = chars;
                        this.EncodingTable = chars.split('');
                        this.EncodingTable.forEach((c, index) => (this.DecodingTable[c.charCodeAt(0)] = index));
                        this.separator = separator;
                        this.separatorCode = separator.charCodeAt(0);
                        if (chars.includes(separator)) {
                            throw new Error('Separator cannot be included in the encoding chars');
                        }
                        this.maxIntLength = this.encode(Math.pow(2, 32)).length;
                    }
                    dec(ctx, maxBytes = this.maxIntLength) {
                        const {
                            value,
                            bytes
                        } = this.decode(ctx.data, ctx.offset, maxBytes);
                        ctx.offset = ctx.offset + bytes;
                        return value;
                    }
                    decode(str, offset = 0, maxBytes = this.maxIntLength) {
                        let multiplier = 1;
                        let value = 0;
                        let bytes = 0;
                        for (let i = 0; i < maxBytes; i++) {
                            bytes++;
                            const current = offset + i;
                            if (current >= str.length) {
                                break;
                            }
                            const val = str[current].charCodeAt(0);
                            if (val == this.separatorCode) {
                                break;
                            }
                            const charValue = this.DecodingTable[val];
                            value = value + multiplier * charValue;
                            multiplier = multiplier * this.base;
                        }
                        return {
                            value,
                            bytes
                        };
                    }
                    encodeAry(num, padLength = 0) {
                        let current = num;
                        const output = [];
                        while (current > 0) {
                            const mod = current % this.base;
                            output.push(this.EncodingTable[mod]);
                            current = (current - mod) / this.base;
                        }
                        while (output.length < padLength) {
                            output.push(this.chars[0]);
                        }
                        return output;
                    }
                    encode(num, padLength = 0) {
                        return this.encodeAry(num, padLength).join('');
                    }
                    pack(data) {
                        const output = [];
                        for (const num of data) {
                            output.push(this.encode(num));
                        }
                        return output.join(this.separator);
                    }
                    unpack(data) {
                        const output = [];
                        const ctx = {
                            data,
                            offset: 0
                        };
                        while (ctx.offset < data.length) {
                            const decoded = this.dec(ctx);
                            output.push(decoded);
                        }
                        return output;
                    }
                }
                exports.BaseN = BaseN;

                /***/
            }),

        /***/
        779:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const util_1 = __webpack_require__(182);
                const st_plugin_1 = __webpack_require__(544);
                class PlayerStatus extends st_plugin_1.StPlugin {
                    constructor() {
                        super(...arguments);
                        this.name = 'PlayerStatus';
                        this.priority = 100;
                    }
                    async onStart() {
                        const patch = this.patch('ClientLib.Data.BaseColors', ClientLib.Data.BaseColors);
                        // Lookup the name of the 'get_BaseColors' function to patch
                        const patchKey = util_1.ClientLibPatch.extractValueFromFunction(ClientLib.Vis.Region.RegionCity, 'Color=', /.*\.([A-Z]{6})\(this.*Color=.*/);
                        patch.replaceFunction(patchKey, PlayerStatus.getPlayerColor);
                        const alliance = ClientLib.Data.MainData.GetInstance().get_Alliance();
                        this.addEvent(alliance, 'Change', ClientLib.Data.AllianceChange, this.allianceChange);
                        // Refresh member data every 30 seconds
                        this.interval(() => alliance.RefreshMemberData(), util_1.Duration.seconds(30));
                    }
                    allianceChange() {
                        ClientLib.Vis.VisMain.GetInstance().get_Region().SetColorDirty();
                    }
                    static getPlayerColor(playerId, allianceId) {
                        const md = ClientLib.Data.MainData.GetInstance();
                        const alliance = md.get_Alliance();
                        const myAllianceId = alliance.get_Id();
                        // Color for my base (Only seems to be used for ruins)
                        if (md.get_Player().id == playerId) {
                            return '#ffffff';
                        }
                        // Color for alliance bases
                        if (myAllianceId > 0 && myAllianceId == allianceId) {
                            const memberData = alliance.get_MemberData().d[playerId];
                            if (memberData != null) {
                                return PlayerStatus.PlayerColor[memberData.OnlineState];
                            }
                            return '#c8c800';
                        }
                        // Color for other alliances
                        switch (md.get_Alliance().GetRelation(allianceId)) {
                            case 1 /* Friend */ :
                                return '#76ff03';
                            case 2 /* NAP */ :
                                return '#bbdefb';
                            case 3 /* Foe */ :
                                return '#f44336';
                        }
                        return '#ffffff';
                    }
                }
                exports.PlayerStatus = PlayerStatus;
                PlayerStatus.PlayerColor = {
                    [1 /* Online */ ]: '#76ff03',
                    [2 /* Away */ ]: '#ffd600',
                    [0 /* Offline */ ]: '#5a5653',
                    [3 /* Hidden */ ]: '#ffff00',
                };

                /***/
            }),

        /***/
        784:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });

                function isNumberArray(x) {
                    return Array.isArray(x) && typeof x[0] == 'number';
                }
                /**
                 * Pack numbers into arbitrary bit length numbers
                 *
                 * @example
                 * ```javascript
                 *   const packer = new BinaryPacker({x:8, y:8})
                 *   packer.packArgs(0, 255) // 65280
                 *   packer.unpack(65280) // {x:0, y: 255}
                 * ```
                 */
                class BinaryPacker {
                    constructor(format) {
                        this.fields = [];
                        this.format = format;
                        let offset = 0;
                        for (const [name, length] of Object.entries(format)) {
                            const mask = (1 << length) - 1;
                            this.fields.push({
                                name,
                                length,
                                offset,
                                mask
                            });
                            offset += length;
                            if (offset > 32) {
                                throw new Error('Unable to pack more than 32 bits');
                            }
                        }
                    }
                    pack(...obj) {
                        var _a;
                        let output = 0;
                        if (isNumberArray(obj)) {
                            for (let i = 0; i < this.fields.length; i++) {
                                const field = this.fields[i];
                                const value = obj[i];
                                if (value > field.mask || value < 0) {
                                    throw new Error(`Field:${field.name} is outside mask range mask:0-${field.mask} value: ${value}`);
                                }
                                output = output | (value << field.offset);
                            }
                        } else {
                            const [values] = obj;
                            for (const field of this.fields) {
                                const value = (_a = values[field.name]) !== null && _a !== void 0 ? _a : 0;
                                if (value > field.mask || value < 0) {
                                    throw new Error(`Field:${field.name} is outside mask range mask:0-${field.mask} value: ${value}`);
                                }
                                output = output | (value << field.offset);
                            }
                        }
                        return output;
                    }
                    /**
                     * Unpack a number into the structure
                     * @param num
                     */
                    unpack(num) {
                        let current = num;
                        const output = {};
                        for (const field of this.fields) {
                            output[field.name] = current & field.mask;
                            current = current >> field.length;
                        }
                        return output;
                    }
                }
                exports.BinaryPacker = BinaryPacker;

                /***/
            }),

        /***/
        785:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                class ClientLibResearchUtil {
                    static get unitModules() {
                        if (this._unitModules.size > 0) {
                            return this._unitModules;
                        }
                        for (const unit of Object.values(GAMEDATA.units)) {
                            for (const mod of unit.m) {
                                if (mod.r.length == 0) {
                                    this._unitModules.set(mod.i, {
                                        id: unit.i,
                                        level: 1
                                    });
                                } else {
                                    this._unitModules.set(mod.i, {
                                        id: unit.i,
                                        level: 2
                                    });
                                }
                            }
                        }
                        return this._unitModules;
                    }
                    static getPlayerResearch() {
                        const research = ClientLib.Data.MainData.GetInstance().get_Player().get_PlayerResearch();
                        const output = {};
                        for (const researchType of [1 /* TechOffense */ , 2 /* TechDefense */ ]) {
                            for (const re of research.GetResearchItemListByType(researchType).l) {
                                if (re.get_CurrentLevel() == 0 /* NotResearched */ ) {
                                    continue;
                                }
                                output[re.get_GameDataUnit_Obj().i] = re.get_CurrentLevel();
                            }
                        }
                        return output;
                    }
                    static getUpgrades(city) {
                        if (city.IsOwnBase()) {
                            return ClientLibResearchUtil.getPlayerResearch();
                        }
                        const modules = city.get_ActiveModules();
                        if (modules == null) {
                            return {};
                        }
                        const upgrades = {};
                        for (const mod of modules) {
                            const unitMod = this.unitModules.get(mod);
                            if (unitMod == null) {
                                continue;
                            }
                            const {
                                id,
                                level
                            } = unitMod;
                            const upgrade = upgrades[id];
                            if (upgrade == null || upgrade < level) {
                                upgrades[id] = level;
                            }
                        }
                        return upgrades;
                    }
                }
                exports.ClientLibResearchUtil = ClientLibResearchUtil;
                ClientLibResearchUtil._unitModules = new Map();

                /***/
            }),

        /***/
        787:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const st_cli_1 = __webpack_require__(289);

                function getPlugin(st, pluginName) {
                    if (pluginName == null || pluginName.trim() == '') {
                        st.cli.sendCommandError('Invalid plugin name');
                        return null;
                    }
                    const plugin = st.plugins.find((f) => f.name.toLowerCase() == pluginName.toLowerCase());
                    if (plugin == null) {
                        const pluginNames = st.plugins.map((c) => c.name);
                        if (pluginNames.length == 0) {
                            st.cli.sendCommandError('No plugins found');
                            return null;
                        }
                        st.cli.sendCommandError('Could not find plugin, current plugins: ' + pluginNames.join(', '));
                        return null;
                    }
                    return plugin;
                }
                const StCliConfigSet = {
                    cmd: 'config set',
                    handle(st, args) {
                        const [key, value] = args;
                        if (key == null || key.trim() == '') {
                            st.cli.sendCommandError('Could not find key to set');
                            return;
                        }
                        if (value == null || value.trim() == '') {
                            st.cli.sendCommandError('Invalid value');
                            return;
                        }
                        const [pluginName, optionKey] = key.toLowerCase().split('.');
                        const plugin = st.plugin(pluginName);
                        if (plugin == null || plugin.options == null) {
                            st.cli.sendCommandError(`Unable to find plugin for key "${key}"`);
                            return;
                        }
                        const cfgKey = Object.keys(plugin.options).find((f) => f.toLowerCase() == optionKey);
                        if (cfgKey == null) {
                            st.cli.sendCommandError(`Unable to find option "${key}"`);
                            return;
                        }
                        const cfg = plugin.options[cfgKey];
                        const configKey = `${plugin.name}.${cfgKey}`;
                        if (typeof cfg.value == 'number') {
                            st.config.set(configKey, parseFloat(value));
                        } else if (typeof cfg.value === 'boolean') {
                            st.config.set(configKey, value == 'true');
                        } else {
                            st.config.set(configKey, value);
                        }
                        st.log.info({
                            key: configKey,
                            value
                        }, 'ConfigSet');
                    },
                };
                const StCliConfigList = {
                    cmd: 'config list',
                    handle(st) {
                        st.cli.sendMessage('white', 'Config');
                        for (const plugin of st.plugins) {
                            if (plugin.options == null) {
                                continue;
                            }
                            st.cli.sendMessage('white', `----------------`);
                            st.cli.sendMessage('white', `${plugin.name}`);
                            st.cli.sendMessage('white', `----------------`);
                            for (const key of Object.keys(plugin.options)) {
                                const cfg = plugin.options[key];
                                const currentValue = plugin.config(key);
                                // const cfgKey = `${plugin.name}.${key}`;
                                const message = [
                                    st_cli_1.FontBuilder.color('white', plugin.name + '.'),
                                    st_cli_1.FontBuilder.color('lightblue', key),
                                    st_cli_1.FontBuilder.color('white', ': '),
                                    st_cli_1.FontBuilder.color('lightgreen', String(currentValue)),
                                    st_cli_1.FontBuilder.color('white', ` - ${cfg.description} (Default: `),
                                    st_cli_1.FontBuilder.color('lightgreen', String(cfg.value)),
                                    st_cli_1.FontBuilder.color('white', ' )'),
                                ];
                                st.cli.sendMessageRaw(message.join(''));
                            }
                        }
                    },
                };
                exports.StCliConfigCommand = {
                    cmd: 'config',
                    commands: {
                        list: StCliConfigList,
                        set: StCliConfigSet,
                    },
                };
                const StCliDisable = {
                    cmd: 'plugin disable',
                    handle(st, args) {
                        const plugin = getPlugin(st, args[0]);
                        if (plugin == null) {
                            return;
                        }
                        st.log.info({
                            plugin: plugin.name
                        }, 'Disable');
                        st.config.disable(plugin);
                        if (plugin.isStarted) {
                            st.cli.sendMessage('lightblue', 'Stopping ' + plugin.name);
                            plugin.stop();
                        }
                    },
                };
                const StCliEnable = {
                    cmd: 'plugin enable',
                    handle(st, args) {
                        const plugin = getPlugin(st, args[0]);
                        if (plugin == null) {
                            return;
                        }
                        st.log.info({
                            plugin: plugin.name
                        }, 'Enable');
                        st.config.enable(plugin);
                        if (!plugin.isStarted) {
                            st.cli.sendMessage('lightblue', 'Starting ' + plugin.name);
                            plugin.start();
                        }
                    },
                };
                exports.StCliPluginCommand = {
                    cmd: 'plugin',
                    commands: {
                        enable: StCliEnable,
                        disable: StCliDisable,
                    },
                };

                /***/
            }),

        /***/
        795:
            /***/
            (function (__unusedmodule, exports) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const V2SdkConfig = {
                    baseUrl: null,
                    fetch: typeof fetch,
                    headers: () => ({}),
                };
                exports.V2Sdk = {
                    config(cfg) {
                        V2SdkConfig.baseUrl = cfg.baseUrl;
                        V2SdkConfig.fetch = cfg.fetch;
                        V2SdkConfig.headers = cfg.headers;
                    },
                    async call(name, request) {
                        if (V2SdkConfig.fetch == null) {
                            throw new Error('Fetch must be supplied before using St:SDK');
                        }
                        if (V2SdkConfig.baseUrl == null) {
                            throw new Error('Invalid baseUrl');
                        }
                        const targetUrl = `${V2SdkConfig.baseUrl}/api/v2/${name}`;
                        const configHeaders = await V2SdkConfig.headers();
                        const headers = {
                            ...configHeaders,
                            'content-type': 'application/json'
                          
                        };
                        const res = await V2SdkConfig.fetch(targetUrl, {
                            method: 'post',
                            headers,
                            body: request == null ? undefined : JSON.stringify(request),
                        });
                        if (res.ok) {
                            return {
                                ok: true,
                                code: 200,
                                response: await res.json()
                            };
                        }
                        if (!res.headers.get('content-type').includes('application/json')) {
                            throw new Error('Failed to fetch: ' + (await res.text()));
                        }
                        const data = await res.json();
                        if (res.status == 422) {
                            return {
                                ok: false,
                                code: 422,
                                reason: data.reason
                            };
                        }
                        if (res.status == 403) {
                            return {
                                ok: false,
                                code: 403
                            };
                        }
                        return {
                            ok: false,
                            code: 500,
                            error: {
                                status: res.statusCode,
                                body: data
                            }
                        };
                    },
                };

                /***/
            }),

        /***/
        843:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const util_1 = __webpack_require__(182);
                const st_plugin_1 = __webpack_require__(544);
                const city_cache_1 = __webpack_require__(993);
                const StCliScanAlliance = {
                    cmd: 'alliance scan',
                    handle(st) {
                        var _a;
                        st.actions.clear();
                        // Abort a in progress scan
                        if (!st.actions.isIdle) {
                            st.cli.sendCommandMessage('Abort Scan');
                            return;
                        }
                        const scanCount = (_a = st.plugin('alliance')) === null || _a === void 0 ? void 0 : _a.scanAll();
                        st.cli.sendCommandMessage('Starting Scan (' + scanCount + ' cities)');
                        st.actions.run(true).then(() => st.cli.sendCommandMessage('Scan done!'));
                    },
                };
                const StCliAlliance = {
                    cmd: 'alliance',
                    commands: {
                        scan: StCliScanAlliance,
                    },
                };
                class AllianceScanner extends st_plugin_1.StPlugin {
                    constructor() {
                        super(...arguments);
                        this.name = 'alliance';
                        this.priority = 100;
                    }
                    async onStart() {
                        this.interval(() => this.scanAll(), util_1.Duration.OneHour);
                        this.interval(() => this.playerScan(), util_1.Duration.minutes(20));
                        this.cli(StCliAlliance);
                    }
                    /** Scan only the current player's bases */
                    playerScan() {
                        if (!this.st.isOnline) {
                            return;
                        }
                        const cities = ClientLib.Data.MainData.GetInstance().get_Cities();
                        for (const city of Object.values(cities.get_AllCities().d)) {
                            if (!city.IsOwnBase()) {
                                continue;
                            }
                            const output = util_1.CityScannerUtil.get(city);
                            if (output == null) {
                                continue;
                            }
                            this.st.api.base(output);
                        }
                    }
                    scanAll() {
                        this.clearActions();
                        const allCities = util_1.CityUtil.getAlliedCities();
                        let count = 0;
                        for (const city of allCities) {
                            // Limit scanning to once every 15 minutes
                            const cityData = city_cache_1.CityCache.get(city.$Id, util_1.Duration.minutes(15));
                            if (cityData != null) {
                                continue;
                            }
                            this.queueAction((index, total) => this.scanCity(city.$Id, index, total));
                            count++;
                        }
                        return count;
                    }
                    async scanCity(cityId, current, total) {
                        const cities = ClientLib.Data.MainData.GetInstance().get_Cities();
                        cities.set_CurrentCityId(cityId);
                        const cityObj = await util_1.CityUtil.waitForCity(cityId);
                        if (cityObj == null) {
                            return;
                        }
                        const output = util_1.CityScannerUtil.get(cityObj);
                        if (output == null) {
                            return;
                        }
                        this.st.log.debug({
                            cityId,
                            owner: output.owner,
                            current,
                            total
                        }, 'ScanAlliance');
                        this.st.api.base(output).then((c) => city_cache_1.CityCache.setStId(cityId, c, ''));
                    }
                }
                exports.AllianceScanner = AllianceScanner;

                /***/
            }),

        /***/
        879:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const patch_getter_1 = __webpack_require__(441);
                const patch_replacement_1 = __webpack_require__(610);
                /**
                 * Pi Interface for the new patches
                 * Po Object that is being patched
                 */
                class ClientLibPatch {
                    constructor(path) {
                        this.patches = [];
                        this.path = path;
                    }
                    setObject(o) {
                        this.baseObject = o;
                    }
                    getBaseObject() {
                        if (this.baseObject == null) {
                            const parts = this.path.split('.');
                            let current = window;
                            while (parts.length > 0) {
                                const currentPart = parts.shift();
                                if (currentPart == null) {
                                    throw new Error('Unable find object in path: ' + this.path);
                                }
                                current = current[currentPart];
                                if (current == null) {
                                    throw new Error('Unable to find object in path: ' + this.path);
                                }
                            }
                            this.baseObject = current;
                        }
                        return this.baseObject;
                    }
                    static hasPatchedId(k) {
                        return k != null && typeof k['$Id'] != 'undefined';
                    }
                    isPatched(k) {
                        for (const patch of this.patches) {
                            if (!patch.isPatched(k)) {
                                return false;
                            }
                        }
                        return true;
                    }
                    /**
                     * Patch a object to provide a new getter
                     *
                     * @param key name of getter to create
                     * @param sourceFunctionName name of function to use as the source information
                     * @param re text to find inside of source function to find the correct 'KJNGHF'
                     */
                    addGetter(key, sourceFunctionName, re, m) {
                        var mn = m ? m : 1;
                        const getter = new patch_getter_1.ClientLibPatchGetter(key, () => {
                            const currentData = this.baseObject.prototype[sourceFunctionName];
                            if (currentData == null) {
                                throw new Error('Failed to load patch');
                            }
                            const matches = currentData.toString().match(re);
                            if (!matches) {
                                throw new Error('Failed to load patch, no matches');
                            }
                            //console.log(key, currentData.toString(), re, matches[mn]);
                            return matches[mn];
                        });
                        this.patches.push(getter);
                        return getter;
                    }
                    addAlias(key, target) {
                        if (target == null) {
                            throw new Error(`Failed to add patch: ${key} missing target`);
                        }
                        const getter = new patch_getter_1.ClientLibPatchGetter(key, target);
                        this.patches.push(getter);
                        return getter;
                    }
                    replaceFunction(sourceFunctionName, targetFunction) {
                        const replacement = new patch_replacement_1.ClientLibPatchFunction(sourceFunctionName, targetFunction);
                        this.patches.push(replacement);
                        return replacement;
                    }
                    static findFunctionInProto(target, toFind) {
                        for (const functionName of Object.keys(target.prototype)) {
                            const value = target.prototype[functionName];
                            if (typeof value != 'function') {
                                continue;
                            }
                            const functionData = value.toString();
                            if (typeof toFind == 'string') {
                                if (functionData.includes(toFind)) {
                                    return {
                                        key: functionName,
                                        value: functionData
                                    };
                                }
                            } else if (functionData.match(toFind) != null) {
                                return {
                                    key: functionName,
                                    value: functionData
                                };
                            }
                        }
                        return null;
                    }
                    /**
                     * Look for a function inside the target's prototype where it contains toFind, then extract the first match.
                     * @param target Class to search inside
                     * @param toFind text to find
                     * @param extract text to extract
                     */
                    static extractValueFromFunction(target, toFind, extract) {
                        const source = ClientLibPatch.findFunctionInProto(target, toFind);
                        if (source == null) {
                            throw new Error(`Unable to extract "${toFind}" from target:${target}`);
                        }
                        const extracted = source.value.match(extract);
                        if (extracted == null) {
                            throw new Error(`Unable to extract "${toFind}" from target:${target}`);
                        }
                        return extracted[1];
                    }
                    /**
                     * Apply all patches
                     */
                    apply() {
                        const obj = this.getBaseObject();
                        for (const patch of this.patches) {
                            patch.apply(obj);
                        }
                    }
                    /** Remove all patches */
                    remove() {
                        const obj = this.getBaseObject();
                        for (const patch of this.patches) {
                            patch.remove(obj);
                        }
                    }
                }
                exports.ClientLibPatch = ClientLibPatch;

                /***/
            }),

        /***/
        920:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const base_n_1 = __webpack_require__(776);
                exports.Base91 = new base_n_1.BaseN("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&()*+,. :;<=>?@[]^_`{|}~'", '-');

                /***/
            }),

        /***/
        934:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                (function (global, factory) {
                    true ? factory(exports) :
                        undefined;
                }(this, (function (exports) {
                    'use strict';

                    function createError(message) {
                        var err = new Error(message);
                        err.source = "ulid";
                        return err;
                    }
                    // These values should NEVER change. If
                    // they do, we're no longer making ulids!
                    var ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford's Base32
                    var ENCODING_LEN = ENCODING.length;
                    var TIME_MAX = Math.pow(2, 48) - 1;
                    var TIME_LEN = 10;
                    var RANDOM_LEN = 16;

                    function replaceCharAt(str, index, char) {
                        if (index > str.length - 1) {
                            return str;
                        }
                        return str.substr(0, index) + char + str.substr(index + 1);
                    }

                    function incrementBase32(str) {
                        var done = undefined;
                        var index = str.length;
                        var char = void 0;
                        var charIndex = void 0;
                        var maxCharIndex = ENCODING_LEN - 1;
                        while (!done && index-- >= 0) {
                            char = str[index];
                            charIndex = ENCODING.indexOf(char);
                            if (charIndex === -1) {
                                throw createError("incorrectly encoded string");
                            }
                            if (charIndex === maxCharIndex) {
                                str = replaceCharAt(str, index, ENCODING[0]);
                                continue;
                            }
                            done = replaceCharAt(str, index, ENCODING[charIndex + 1]);
                        }
                        if (typeof done === "string") {
                            return done;
                        }
                        throw createError("cannot increment this string");
                    }

                    function randomChar(prng) {
                        var rand = Math.floor(prng() * ENCODING_LEN);
                        if (rand === ENCODING_LEN) {
                            rand = ENCODING_LEN - 1;
                        }
                        return ENCODING.charAt(rand);
                    }

                    function encodeTime(now, len) {
                        if (isNaN(now)) {
                            throw new Error(now + " must be a number");
                        }
                        if (now > TIME_MAX) {
                            throw createError("cannot encode time greater than " + TIME_MAX);
                        }
                        if (now < 0) {
                            throw createError("time must be positive");
                        }
                        if (Number.isInteger(now) === false) {
                            throw createError("time must be an integer");
                        }
                        var mod = void 0;
                        var str = "";
                        for (; len > 0; len--) {
                            mod = now % ENCODING_LEN;
                            str = ENCODING.charAt(mod) + str;
                            now = (now - mod) / ENCODING_LEN;
                        }
                        return str;
                    }

                    function encodeRandom(len, prng) {
                        var str = "";
                        for (; len > 0; len--) {
                            str = randomChar(prng) + str;
                        }
                        return str;
                    }

                    function decodeTime(id) {
                        if (id.length !== TIME_LEN + RANDOM_LEN) {
                            throw createError("malformed ulid");
                        }
                        var time = id.substr(0, TIME_LEN).split("").reverse().reduce(function (carry, char, index) {
                            var encodingIndex = ENCODING.indexOf(char);
                            if (encodingIndex === -1) {
                                throw createError("invalid character found: " + char);
                            }
                            return carry += encodingIndex * Math.pow(ENCODING_LEN, index);
                        }, 0);
                        if (time > TIME_MAX) {
                            throw createError("malformed ulid, timestamp too large");
                        }
                        return time;
                    }

                    function detectPrng() {
                        var allowInsecure = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
                        var root = arguments[1];

                        if (!root) {
                            root = typeof window !== "undefined" ? window : null;
                        }
                        var browserCrypto = root && (root.crypto || root.msCrypto);
                        if (browserCrypto) {
                            return function () {
                                var buffer = new Uint8Array(1);
                                browserCrypto.getRandomValues(buffer);
                                return buffer[0] / 0xff;
                            };
                        } else {
                            try {
                                var nodeCrypto = __webpack_require__(417);
                                return function () {
                                    return nodeCrypto.randomBytes(1).readUInt8() / 0xff;
                                };
                            } catch (e) {}
                        }
                        if (allowInsecure) {
                            try {
                                console.error("secure crypto unusable, falling back to insecure Math.random()!");
                            } catch (e) {}
                            return function () {
                                return Math.random();
                            };
                        }
                        throw createError("secure crypto unusable, insecure Math.random not allowed");
                    }

                    function factory(currPrng) {
                        if (!currPrng) {
                            currPrng = detectPrng();
                        }
                        return function ulid(seedTime) {
                            if (isNaN(seedTime)) {
                                seedTime = Date.now();
                            }
                            return encodeTime(seedTime, TIME_LEN) + encodeRandom(RANDOM_LEN, currPrng);
                        };
                    }

                    function monotonicFactory(currPrng) {
                        if (!currPrng) {
                            currPrng = detectPrng();
                        }
                        var lastTime = 0;
                        var lastRandom = void 0;
                        return function ulid(seedTime) {
                            if (isNaN(seedTime)) {
                                seedTime = Date.now();
                            }
                            if (seedTime <= lastTime) {
                                var incrementedRandom = lastRandom = incrementBase32(lastRandom);
                                return encodeTime(lastTime, TIME_LEN) + incrementedRandom;
                            }
                            lastTime = seedTime;
                            var newRandom = lastRandom = encodeRandom(RANDOM_LEN, currPrng);
                            return encodeTime(seedTime, TIME_LEN) + newRandom;
                        };
                    }
                    var ulid = factory();

                    exports.replaceCharAt = replaceCharAt;
                    exports.incrementBase32 = incrementBase32;
                    exports.randomChar = randomChar;
                    exports.encodeTime = encodeTime;
                    exports.encodeRandom = encodeRandom;
                    exports.decodeTime = decodeTime;
                    exports.detectPrng = detectPrng;
                    exports.factory = factory;
                    exports.monotonicFactory = monotonicFactory;
                    exports.ulid = ulid;

                    Object.defineProperty(exports, '__esModule', {
                        value: true
                    });

                })));


                /***/
            }),

        /***/
        963:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const api_1 = __webpack_require__(255);
                const api_2 = __webpack_require__(536);
                const config_1 = __webpack_require__(679);
                const st_plugin_1 = __webpack_require__(544);
                const batcher_base_1 = __webpack_require__(508);
                class StApi extends st_plugin_1.StPlugin {
                    constructor() {
                        super(...arguments);
                        this.name = 'Api';
                        this.baseUrl = config_1.Config.api.url;
                        this.priority = 100;
                        this.baseSender = new batcher_base_1.BatchBaseSender(this);
                    }
                    get jsonHeaders() {
                        return {
                            'content-type': 'application/json',
                            Authorization: `Bearer  ${this.st.instanceId}:${this.st.challengeId}`,
                            [api_2.ApiHeaders.ExtensionVersion]: config_1.Config.version,
                            [api_2.ApiHeaders.ExtensionHash]: config_1.Config.hash,
                            [api_2.ApiHeaders.ExtensionInstall]: this.st.instanceId,
                        };
                    }
                    async base(base, flush = false) {
                        const promise = this.baseSender.queue(base);
                        if (flush) {
                            await this.baseSender.flush();
                        }
                        return promise;
                    }
                    async onStart() {
                        api_1.V2Sdk.config({
                            fetch: fetch.bind(window),
                            baseUrl: config_1.Config.api.url,
                            headers: () => this.jsonHeaders,
                        });
                        const installId = this.st.instanceId;
                        const md = ClientLib.Data.MainData.GetInstance();
                        const worldId = md.get_Server().get_WorldId();
                        const player = md.get_Player().name;
                        /* api_1.V2Sdk.call('install.track', {
                            installId,
                            worldId,
                            player,
                            version: config_1.Config.version,
                            hash: config_1.Config.hash
                        }); */
                    }
                    async onStop() {
                        await this.baseSender.flush();
                    }
                    flush() {
                        this.baseSender.flush();
                    }
                }
                exports.StApi = StApi;

                /***/
            }),

        /***/
        993:
            /***/
            (function (__unusedmodule, exports, __webpack_require__) {

                "use strict";

                Object.defineProperty(exports, "__esModule", {
                    value: true
                });
                const util_1 = __webpack_require__(182);
                const OneDayMs = util_1.Duration.days(1);
                class CityCache {
                    static get cacheKey() {
                        return `${util_1.LocalCache.prefix}-layout-cache`;
                    }
                    static get(cityId, maxAge = OneDayMs) {
                        return util_1.LocalCache.get(String(cityId), maxAge);
                    }
                    static setStId(cityId, stId, layout) {
                        util_1.LocalCache.set(String(cityId), {
                            stId,
                            layout
                        });
                    }
                }
                exports.CityCache = CityCache;

                /***/
            })

        /******/
    });
}
if (window.location.pathname !== ('/login/auth')) {
    var script = document.createElement('script');
    script.innerHTML = '(' + startSt.toString() + ')()';
    script.type = 'text/javascript';
    document.getElementsByTagName('head')[0].appendChild(script);
}