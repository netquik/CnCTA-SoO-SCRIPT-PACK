// ==UserScript==
// @name            Shockr Tools Basescanner Mailversion - reMod 1.4
// @author          EHz
// @description     Tools to work with Tiberium alliances - mod by EHz - remod by Netquik
// @contributor     Netquik (https://github.com/netquik) reMod 1.4
// @include         http*://*.alliances.commandandconquer.com/*/index.aspx*
// @version         2.9.2
// @updateURL       https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_Shockr_Tools_Basescanner_Mailversion_reMod.user.js
// ==/UserScript==

/* 
codes by NetquiK
----------------
- New Layout Filtering reMod 1.4
- FIX WorldSector RE by NetquiK + patch if not already by other scanners
- NOEVIL
- New WorldCity Wrappers
- FIX for 25.1
----------------
*/
(function () {
    /* globals qx, ClientLib */
    var setupShockrTools = function () {
        var ST = window.ST || {};
        ST.util = {
            waitForLoad: function (callback) {
                var waitFunc = function () {
                    ST.util.waitForLoad(callback);
                };
                if (typeof qx === 'undefined') {
                    return window.setTimeout(waitFunc, 1000);
                }
                var a = qx.core.Init.getApplication();
                if (a === null || a === undefined) {
                    return window.setTimeout(waitFunc, 1000);
                }
                var mb = qx.core.Init.getApplication().getMenuBar();
                if (mb === null || mb === undefined) {
                    return window.setTimeout(waitFunc, 1000);
                }
                var md = ClientLib.Data.MainData.GetInstance();
                if (md === null || md === undefined) {
                    return window.setTimeout(waitFunc, 1000);
                }
                var player = md.get_Player();
                if (player === null || player === undefined) {
                    return window.setTimeout(waitFunc, 1000);
                }
                if (player.get_Name() === '') {
                    return window.setTimeout(waitFunc, 1000);
                }
                return callback();
            }
        };
        window.ST = ST;
    };
    var ST_MODULES = window.ST_MODULES = [];
    ST_MODULES.push(setupShockrTools);
    /* Begin: client/modules/basescanner.js */
    /* globals qx, ClientLib, phe */
    var baseScanner = function () {
        var MAX_FAILS = 25;
        var ST = window.ST || {};
        var BaseScanner;
        ST.BaseScanner = BaseScanner = {
            _patched: false,
            _bases: [],
            checkFieldFree: function (x, y, map) {
                var tKey = x + ',' + y;
                if (tKey in map) {
                    return false;
                } else {
                    return true;
                }
            },

            scan: function () {
                //console.log('DEBUG: ' + 'function scan');
                if (BaseScanner._patched === false) {
                    PatchClientLib.patch();
                }
                if (BaseScanner._scanning) {
                    return;
                }
                BaseScanner._bases = [];

                BaseScanner._msg = [];
                BaseScanner._scanning = true;
                BaseScanner.index = -1;
                BaseScanner._toScanMap = {};
                BaseScanner._toScan = [];
                var allCities = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d;
                for (var selectedBaseID in allCities) {
                    if (!allCities.hasOwnProperty(selectedBaseID)) {
                        continue;
                    }
                    var selectedBase = allCities[selectedBaseID];
                    if (selectedBase === undefined) {
                        throw new Error('unable to find base: ' + selectedBaseID);
                    }
                    BaseScanner.getNearByBases(selectedBase);
                }
                BaseScanner.scanNextBase();

            },
            // selectionChange: function(from, to){
            //     if (to === null){
            //         return;
            //     }
            // },
            getNearByBases: function (base) {
                //console.log('DEBUG: ' + 'function getNearByBases');
                var x = base.get_PosX();
                var y = base.get_PosY();
                //var maxAttack = ClientLib.Data.MainData.GetInstance().get_Server().get_MaxAttackDistance() - 1;
                var maxAttack = ClientLib.Data.MainData.GetInstance().get_Server().get_MaxAttackDistance();
                var world = ClientLib.Data.MainData.GetInstance().get_World();

                var ownBase = {
                    name: base.get_Name(),
                    x: x,
                    y: y,
                    toScanCount: 0
                };

                var toScanCount = 0;
                for (var scanY = y - 10; scanY <= y + 10; scanY++) {
                    for (var scanX = x - 10; scanX <= x + 10; scanX++) {
                        var distX = Math.abs(x - scanX);
                        var distY = Math.abs(y - scanY);
                        var distance = Math.sqrt((distX * distX) + (distY * distY));
                        // too far away to scan
                        if (distance >= maxAttack) {
                            continue;
                        }
                        // already scanning this base from another city.
                        if (BaseScanner._toScanMap[scanX + ':' + scanY] !== undefined) {
                            continue;
                        }
                        var object = world.GetObjectFromPosition(scanX, scanY);
                        // Nothing to scan
                        if (object === null) {
                            continue;
                        }
                        // Object isnt a NPC Base/Camp/Outpost
                        if (![2, 3].includes(object.Type)) {
                            continue;
                        }
                        if (typeof object.get_CampType === 'function' && object.get_CampType() === ClientLib.Data.Reports.ENPCCampType.Destroyed) {
                            continue;
                        }
                        // Cached
                        /* var offlineBase = BaseScanner.getOfflineBase(scanX, scanY);
                        if (offlineBase !== null && offlineBase.id === object.getID()) {
                            delete offlineBase.obj;
                            BaseScanner._bases.push(offlineBase);
                            continue;
                        } */
                        var scanBase = {
                            x: scanX,
                            y: scanY,
                            level: object.get_BaseLevel(),
                            id: object.getID(),
                            distance: distance,
                            selectedBaseID: base.get_Id(),
                            failCount: 0
                        };
                        BaseScanner._toScan.push(scanBase);
                        BaseScanner._toScanMap[scanX + ':' + scanY] = scanBase;
                        toScanCount++;
                    }
                }
                ownBase.toScanCount = toScanCount;
                BaseScanner._toScan.push(ownBase);
                console.log('Found ' + toScanCount + ' new bases to scan from:' + base.get_Name());
            },
            abort: function () {
                //console.log('DEBUG: ' + 'function abort');
                BaseScanner._abort = true;
            },
            getBaseLayout: function (base) {
                //console.log('DEBUG: ' + 'function getBaseLayout');
                if (BaseScanner._abort) {
                    BaseScanner._abort = false;
                    BaseScanner._scanning = false;
                    return console.log('aborting');
                }
                if (base === undefined) {
                    //console.log('DEBUG: ' + '\tbase undefined');
                    BaseScanner._scanning = false;
                    return BaseScanner.saveBases();
                }
                //console.log('DEBUG: ' + '\t[coords]' + base.x + ':' + base.y + '[/coords]');
                if (base.name !== undefined) {
                    // own base
                    //console.log('DEBUG: ' + '\tbase.id undefined -> ' + base);

                    //Edit by Netquik. Don't add Base info if no result.
                    if (BaseScanner._msg[BaseScanner._msg.length - 1] !== " " && BaseScanner._msg.length > 0) {
                        var lastsep = BaseScanner._msg.lastIndexOf(" ");
                        var numlays = lastsep !== -1 ? BaseScanner._msg.length - 1 - lastsep : BaseScanner._msg.length;


                        BaseScanner._msg.push('_______________________________________');
                        BaseScanner._msg.push('found ' + numlays + ' on ' + base.toScanCount + ' around [b]' + base.name + '[/b] [coords]' + base.x + ':' + base.y + '[/coords]');
                        BaseScanner._msg.push('[s]_______________________________________[/s]');
                        BaseScanner._msg.push(' ');
                    }
                    return BaseScanner.scanNextBase();
                }
                if (BaseScanner._lastBaseID !== base.selectedBaseID) {
                    BaseScanner.setCurrentBase(base.selectedBaseID);
                }
                // var currentCity = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity();
                // var world = ClientLib.Data.MainData.GetInstance().get_World();
                //console.log('DEBUG: ' + '\t --- set city id ---');
                ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentCityId(base.id);
                var scanBase = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(base.id);
                var comm = ClientLib.Net.CommunicationManager.GetInstance();
                comm.UserAction();
                //console.log('DEBUG: ' + '\t --- after comm user action ---');
                // base was destroyed.
                if (scanBase.get_IsGhostMode()) {
                    //console.log('DEBUG: ' + '\tbase destroyed');
                    return BaseScanner.scanNextBase();
                }
                // Base hasnt loaded yet.
                if (scanBase.GetBuildingsConditionInPercent() === 0) {
                    //console.log('DEBUG: ' + '\t --- failcount ++ ---');
                    base.failCount++;
                    if (base.failCount === MAX_FAILS) {
                        //console.log('DEBUG: ' + '\tFAILED!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
                        return BaseScanner.scanNextBase();
                    }
                    return setTimeout(function () {
                        BaseScanner.getBaseLayout(base);
                    }, 200);
                }

                // TODO: get type instead of name
                var baseName = scanBase.get_Name();
                var isNPC = scanBase.IsNPC();
                //console.log('DEBUG: ' + '\t --- got base name: "'+baseName+'" fg "'+isNPC+'" ---');
                //if (baseName !== 'Camp' && baseName !== 'Lager' && baseName !== 'Outpost' && baseName !== 'Vorposten' && baseName !== 'Base' && baseName !== 'Basis') {
                if (isNPC !== true) {
                    console.error('not forgotten: "' + baseName + '"');
                    return BaseScanner.scanNextBase();
                }
                base.layout = BaseScanner.getLayout(scanBase, base);
                base.name = baseName;
                BaseScanner._bases.push(base);
                // cache the base in local storage
                localStorage.setItem('scan-' + base.x + ':' + base.y, JSON.stringify(base));
                BaseScanner.printScanResults(base);
                BaseScanner.scanNextBase();
            },
            scanNextBase: function () {
                if (BaseScanner.index === undefined) {
                    BaseScanner.index = 0;
                } else {
                    BaseScanner.index++;
                }
                //console.log('DEBUG: ' + 'function scanNextBase index ' + BaseScanner.index);
                var base = BaseScanner._toScan[BaseScanner.index];
                BaseScanner.getBaseLayout(base);
            },
            saveBases: function () {
                //console.log('DEBUG: ' + 'function saveBases');
                BaseScanner._scanning = false;
                BaseScanner._bases.forEach(function (b) {
                    delete b.distance;
                    delete b.selectedBaseID;
                    delete b.failCount;
                    delete b.obj;
                });

                // send result
                try {
                    var instance = ClientLib.Data.MainData.GetInstance();
                    var apc = instance.get_Cities();
                    var PlayerName = apc.get_CurrentOwnCity().get_PlayerName();
                    var AllianzName = apc.get_CurrentOwnCity().get_AllianceName();
                    var mail = ClientLib.Data.Mail.prototype;
                    var dt = new Date();
                    var ts = (dt.getTime() - dt.getMilliseconds()) / 1000;
                    //MOD Fix No result msg
                    if (BaseScanner._msg.length == 0) BaseScanner._msg.push('[b]No Interesting Layouts Around![/b]');
                    var body = "<cnc><cncs>" + PlayerName + "</cncs><cncd>" + ts + "</cncd><cnct>"  + BaseScanner._msg.join('\n') + "</cnct></cnc>";

                    console.log(PlayerName, AllianzName, 'scanning results', body);
                    mail.SendMail(PlayerName, '', 'Mail BaseScanner Scan Results', body);
                } catch (e) {
                    console.error(e);
                }
                BaseScanner._button.setLabel('done...');
                return setTimeout(function () {
                    BaseScanner._button.setLabel('Scan');
                }, 5000);
            },
            isScanning: function () {
                //console.log('DEBUG: ' + 'function isScanning');
                return BaseScanner._scanning === true;
            },
            printScanResults: function (base) {
                //console.log('DEBUG: ' + 'function printScanResults');
                BaseScanner._button.setLabel(('   ' + BaseScanner.index).slice(-3) + '/' + BaseScanner._toScan.length);
                console.log('[' + ('   ' + BaseScanner.index).slice(-3) + '/' + BaseScanner._toScan.length + ']\t[coords]' + base.x + ':' + base.y + '[/coords] ' + base.layout + ' (' + base.failCount + ')');
            },
            getLayout: function (base, tmp) {

                //console.log('DEBUG: ' + 'function getLayout');
                var layout = [];
                var tib4 = 0;
                var tib5 = 0;
                var tib6 = 0;
                var tib7 = 0;
                var cry4 = 0;
                var cry5 = 0;
                var cry6 = 0;
                var cry7 = 0;
                var mix4 = 0;
                var mix5 = 0;
                var mix6 = 0;
                var mix7 = 0;
                var mix8 = 0;
                var pow7 = 0;
                var pow8 = 0;
                var powL = {};
                var totT = 0; // count total tib
                var totC = 0; // count total cry
                try {
                    for (var y = 0; y < 8; y++) {
                        for (var x = 0; x < 9; x++) {
                            var resourceType = base.GetResourceType(x, y);
                            var aKey = x + ',' + y;
                            switch (resourceType) {
                                case 0:
                                    layout.push('.');
                                    // count tib/cry around
                                    var cntT = 0;
                                    var cntC = 0;
                                    var cntM = 0;
                                    var cntP = 0;
                                    if (y > 0 && y < 7 && x > 0 && x < 8) {
                                        // tib
                                        if (base.GetResourceType(x - 1, y - 1) === 2) {
                                            cntC++;
                                            cntM++;
                                        }
                                        if (base.GetResourceType(x, y - 1) === 2) {
                                            cntC++;
                                            cntM++;
                                        }
                                        if (base.GetResourceType(x + 1, y - 1) === 2) {
                                            cntC++;
                                            cntM++;
                                        }
                                        if (base.GetResourceType(x - 1, y) === 2) {
                                            cntC++;
                                            cntM++;
                                        }
                                        if (base.GetResourceType(x + 1, y) === 2) {
                                            cntC++;
                                            cntM++;
                                        }
                                        if (base.GetResourceType(x - 1, y + 1) === 2) {
                                            cntC++;
                                            cntM++;
                                        }
                                        if (base.GetResourceType(x, y + 1) === 2) {
                                            cntC++;
                                            cntM++;
                                        }
                                        if (base.GetResourceType(x + 1, y + 1) === 2) {
                                            cntC++;
                                            cntM++;
                                        }
                                        // cry
                                        if (base.GetResourceType(x - 1, y - 1) === 1) {
                                            cntT++;
                                            cntM++;
                                        }
                                        if (base.GetResourceType(x, y - 1) === 1) {
                                            cntT++;
                                            cntM++;
                                        }
                                        if (base.GetResourceType(x + 1, y - 1) === 1) {
                                            cntT++;
                                            cntM++;
                                        }
                                        if (base.GetResourceType(x - 1, y) === 1) {
                                            cntT++;
                                            cntM++;
                                        }
                                        if (base.GetResourceType(x + 1, y) === 1) {
                                            cntT++;
                                            cntM++;
                                        }
                                        if (base.GetResourceType(x - 1, y + 1) === 1) {
                                            cntT++;
                                            cntM++;
                                        }
                                        if (base.GetResourceType(x, y + 1) === 1) {
                                            cntT++;
                                            cntM++;
                                        }
                                        if (base.GetResourceType(x + 1, y + 1) === 1) {
                                            cntT++;
                                            cntM++;
                                        }
                                        // power
                                        if (base.GetResourceType(x - 1, y - 1) === 0) {
                                            if (BaseScanner.checkFieldFree(x - 1, y - 1, powL)) {
                                                cntP++;
                                            }
                                        }
                                        if (base.GetResourceType(x, y - 1) === 0) {
                                            if (BaseScanner.checkFieldFree(x, y - 1, powL)) {
                                                cntP++;
                                            }
                                        }
                                        if (base.GetResourceType(x + 1, y - 1) === 0) {
                                            if (BaseScanner.checkFieldFree(x + 1, y - 1, powL)) {
                                                cntP++;
                                            }
                                        }
                                        if (base.GetResourceType(x - 1, y) === 0) {
                                            if (BaseScanner.checkFieldFree(x - 1, y, powL)) {
                                                cntP++;
                                            }
                                        }
                                        if (base.GetResourceType(x + 1, y) === 0) {
                                            if (BaseScanner.checkFieldFree(x + 1, y, powL)) {
                                                cntP++;
                                            }
                                        }
                                        if (base.GetResourceType(x - 1, y + 1) === 0) {
                                            if (BaseScanner.checkFieldFree(x - 1, y + 1, powL)) {
                                                cntP++;
                                            }
                                        }
                                        if (base.GetResourceType(x, y + 1) === 0) {
                                            if (BaseScanner.checkFieldFree(x, y + 1, powL)) {
                                                cntP++;
                                            }
                                        }
                                        if (base.GetResourceType(x + 1, y + 1) === 0) {
                                            if (BaseScanner.checkFieldFree(x + 1, y + 1, powL)) {
                                                cntP++;
                                            }
                                        }
                                    }
                                    if (cntC === 4) {
                                        tib4++;
                                        mix4--;
                                    }
                                    if (cntC === 5) {
                                        tib5++;
                                        mix5--;
                                    }
                                    if (cntC === 6) {
                                        tib6++;
                                        mix6--;
                                    }
                                    if (cntC === 7) {
                                        tib7++;
                                        mix7--;
                                    }
                                    if (cntT === 4) {
                                        cry4++;
                                        mix4--;
                                    }
                                    if (cntT === 5) {
                                        cry5++;
                                        mix5--;
                                    }
                                    if (cntT === 6) {
                                        cry6++;
                                        mix6--;
                                    }
                                    if (cntT === 7) {
                                        cry7++;
                                        mix7--;
                                    }
                                    if (cntM === 4) {
                                        mix4++;
                                    }
                                    if (cntM === 5) {
                                        mix5++;
                                    }
                                    if (cntM === 6) {
                                        mix6++;
                                    }
                                    if (cntM === 7) {
                                        mix7++;
                                    }
                                    if (cntM === 8) {
                                        mix8++;
                                    }
                                    if (cntP === 7) {
                                        pow7++;
                                    }
                                    if (cntP === 8) {
                                        pow8++;
                                        powL[aKey] = 1;
                                        //console.log('DEBUG: ' + '8er akku bei x:' + x + ' y:' + y);
                                    }
                                    break;
                                case 1:
                                    layout.push('c');
                                    totC++;
                                    break;
                                case 2:
                                    layout.push('t');
                                    totT++;
                                    break;
                            }
                        }
                    }



                    //   MOD NEW FILTERING by Netquik
                    var tibup = (tib5 + tib6 + tib7) > 0;
                    var cryup = (cry5 + cry6 + cry7) > 0;
                    var crydw = (cry4 + cryup) > 0;
                    var mixup = (mix5 + mix6 + mix7 + mix8) > 0;
                    if (
                        (tibup || (tib4 > 0 && cryup) || (tib4 > 1 && (crydw || mixup)) || (pow7 > 0 && tib4 > 1) || (pow8 > 1 && tib4 > 0 && crydw))


                    ) {




                        var out;
                        out = '[coords]' + tmp.x + ':' + tmp.y + '[/coords] [' + BaseScanner.formatRes(totT) + 'Tib||' + BaseScanner.formatRes(totC) + 'Cry] -> ';
                        out = out + ' tib(4-7): ' + BaseScanner.formatRes(tib4) + '|' + BaseScanner.formatRes(tib5) + '|' + BaseScanner.formatRes(tib6) + '|' + BaseScanner.formatRes(tib7);
                        out = out + ' cry(4-7): ' + BaseScanner.formatRes(cry4) + '|' + BaseScanner.formatRes(cry5) + '|' + BaseScanner.formatRes(cry6) + '|' + BaseScanner.formatRes(cry7);
                        out = out + ' mix(4-8): ' + BaseScanner.formatRes(mix4) + '|' + BaseScanner.formatRes(mix5) + '|' + BaseScanner.formatRes(mix6) + '|' + BaseScanner.formatRes(mix7) + '|' + BaseScanner.formatRes(mix8);
                        out = out + ' pow(8): ' + BaseScanner.formatRes(pow8);
                        console.log(out);
                        // TODO Watches! integration
                        BaseScanner._msg.push(out);

                    }
                    layout.push(' ', tib4, '|', tib5, '|', tib6, '|', tib7)
                } catch (e) {
                    console.error('\terror: ' + e);
                } finally {
                    return layout.join('');
                }
            },

            formatRes: function (value) {
                if (value > 0) {
                    return ('[b]' + value + '[/b]');
                }
                return value;
            },
            setCurrentBase: function (baseID) {
                //console.log('DEBUG: ' + 'function setCurrentBase');
                var allCities = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d;
                var selectedBase = allCities[baseID];
                ClientLib.Vis.VisMain.GetInstance().CenterGridPosition(selectedBase.get_PosX(), selectedBase.get_PosY());
                ClientLib.Vis.VisMain.GetInstance().Update();
                ClientLib.Vis.VisMain.GetInstance().ViewUpdate();
                BaseScanner._lastBaseID = baseID;
            },
            /* getOfflineBase: function (x, y) {
                return null;
                var base = localStorage.getItem('scan-' + x + ':' + y);
                if (base !== null) {
                    return JSON.parse(base);
                }
                return null;
            } */

        };

        var PatchClientLib = {
            patch: function () {
                //console.log('DEBUG: ' + 'function patch');
                if (BaseScanner._patched) {
                    return;
                }
                // MOD FIX WorldSector WRAPPER by NetquiK + patch if not already by other scanners
                try {
                    var RE = /return this\.[A-Z]{6}\.([A-Z]{6})/;
                    var objs = ['City', 'NPCBase', 'NPCCamp'];
                    objs.forEach(obj => {
                        var o = ClientLib.Data.WorldSector['WorldObject' + obj].prototype;
                        var g = ClientLib.Vis.Region['Region' + obj].prototype;
                        var b = (typeof o.get_BaseLevel != 'function') ? g.get_BaseLevel.toString().match(RE)[1] : null;
                        var d = (typeof o.getID != 'function') ? g.get_Id.toString().match(RE)[1] : null;
                        if (obj == 'NPCCamp') {
                            var t = (typeof o.get_CampType != 'function') ? g.get_CampType.toString().match(RE)[1] : null;
                        }
                        if (b) o.get_BaseLevel = function () {
                            return this[b];
                        }, console.log('WorldObject' + obj + ' get_BaseLevel = ' + b);
                        if (d) o.getID = function () {
                            return this[d];
                        }, console.log('WorldObject' + obj + ' getID = ' + d);
                        if (t) o.get_CampType = function () {
                            return this[t];
                        }, console.log('WorldObject' + obj + ' get_CampType = ' + t);
                    })
                } catch (e) {
                    console.debug("Shockr_Tools_Basescanner_Mailversion WRAPPERS error: ", e);
                }
                BaseScanner._patched = true;
            }
        };
        var makeButton = function () {
            qx.Class.define('ST.BaseScanner.main', {
                type: 'singleton',
                extend: qx.core.Object,
                members: {
                    buttonScan: null,
                    initialize: function () {
                        //console.log('DEBUG: ' + 'function initialize');
                        this.buttonScan = new qx.ui.form.Button('Scan');
                        this.buttonScan.set({
                            width: 94,
                            appearance: 'button-bar-right',
                            toolTipText: 'Scan'
                        });
                        BaseScanner._button = this.buttonScan;
                        this.buttonScan.addListener('click', this.scan, this);
                        var mainBar = qx.core.Init.getApplication().getUIItem(ClientLib.Data.Missions.PATH.BAR_MENU);
                        // Fix for 25.1
                        var menu_children = (mainBar.getChildren().length > 1) ? mainBar.getChildren()[1] : mainBar.getChildren()[0];
                        var childs = menu_children.getChildren();
                        var childCount = childs.length;
                        console.log('shockr childs count: ' + childCount);
                        var Barsize = 0;
                        for (var z = childCount - 1; z >= 0; z--) {
                            if (typeof childs[z].setAppearance === "function") {
                                if (childs[z].getAppearance() == "button-bar-right") {
                                    childs[z].setAppearance("button-bar-center");
                                }
                            }
                        }

                        menu_children.add(this.buttonScan);
                         childs = menu_children.getChildren();
                        for (var i in childs) {
                            if (typeof childs[i].setAppearance === "function" && childs[i].isVisible()) {
                                Barsize += childs[i].getWidth();
                            }
                        } 
                        if (mainBar.getChildren().length > 1) menu_children.setMarginLeft(4),
                        mainBar.getChildren()[0].setScale(true),
                        mainBar.getChildren()[0].setWidth(Barsize + 10);
                        //ScriptsButton = mainBar.getScriptsButton().isVisible() ? 1 : 0;
                        //mainBar.getChildren()[1].setWidth(Barsize+94);
                        mainBar.setMarginLeft(-50);
                        console.log('Scan Button added');
                    },
                    scan: function () {
                        //console.log('DEBUG: ' + 'function scan2');
                        if (BaseScanner.isScanning()) {
                            return BaseScanner.abort();
                        }
                        BaseScanner.scan();
                    }
                }
            });
            window.ST.BaseScanner.main.getInstance().initialize();
            // phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance(), "SelectionChange", ClientLib.Vis.SelectionChange, BaseScanner, BaseScanner.selectionChange);
        };
        ST.util.waitForLoad(function () {
            console.log('ST: Starting module [BaseScanner]');
            PatchClientLib.patch();
            makeButton();
        });
    };

    var ST_MODULES = window.ST_MODULES || [];
    ST_MODULES.push(baseScanner); /* End: client/modules/basescanner.js */
    /* Begin: client/modules/basescount.js */
    /* globals ClientLib, qx, webfrontend */
    var baseCounter = function () {
        var ST = window.ST || {};
        var BaseCounter;
        ST.BaseCounter = BaseCounter = {
            name: 'BaseCounter',
            pasteOutput: function (x, y, baseCount, baseData) {
                //console.log('DEBUG: ' + 'function pasteOutput');
                var input = qx.core.Init.getApplication().getChat().getChatWidget().getEditable();
                var dom = input.getContentElement().getDomElement();
                var output = [];
                output.push(dom.value.substring(0, dom.selectionStart));
                output.push('[[coords]' + x + ':' + y + '[/coords]] Found ' + baseCount + ' Bases - ' + baseData);
                output.push(dom.value.substring(dom.selectionEnd, dom.value.length));
                input.setValue(output.join(' '));
            },
            countBases: function (x, y, paste) {
                //console.log('DEBUG: ' + 'function countBases');
                var levelCount = [];
                var count = 0;
                var maxAttack = ClientLib.Data.MainData.GetInstance().get_Server().get_MaxAttackDistance();
                var world = ClientLib.Data.MainData.GetInstance().get_World();
                for (var scanY = y - 10; scanY <= y + 10; scanY++) {
                    for (var scanX = x - 10; scanX <= x + 10; scanX++) {
                        var distX = Math.abs(x - scanX);
                        var distY = Math.abs(y - scanY);
                        var distance = Math.sqrt((distX * distX) + (distY * distY));
                        // too far away to scan
                        if (distance >= maxAttack) {
                            continue;
                        }

                        var object = world.GetObjectFromPosition(scanX, scanY);
                        // Nothing to scan
                        if (object === null) {
                            continue;
                        }

                        // Object isnt a NPC Base/Camp/Outpost
                        if (![2, 3].includes(object.Type))  {
                            continue;
                        }
                        if (typeof object.get_CampType === 'function' && object.get_CampType() === ClientLib.Data.Reports.ENPCCampType.Destroyed) {
                            continue;
                        }
                        var level = object.get_BaseLevel();
                        levelCount[level] = (levelCount[level] || 0) + 1;
                        count++;
                    }
                }
                var output = [];
                for (var i = 0; i < levelCount.length; i++) {
                    var lvl = levelCount[i];
                    if (lvl !== undefined) {
                        output.push(lvl + ' x ' + i);
                    }
                }
                console.log('[' + x + ':' + y + '] Found ' + count + ' bases - ' + output.join(', '));
                if (paste === undefined || paste === true) {
                    BaseCounter.pasteOutput(x, y, count, output.join(', '));
                }
                return {
                    total: count,
                    levels: levelCount,
                    complete: output.join(', ')
                };
            },
            count: function (paste) {
                //console.log('DEBUG: ' + 'function count');
                if (BaseCounter.selectedBase === null || BaseCounter.selectedBase === undefined) {
                    return;
                }
                return BaseCounter.countBases(BaseCounter.selectedBase.get_RawX(), BaseCounter.selectedBase.get_RawY(), paste);
            },
            startup: function () {
                BaseCounter.registerButton();
            },
            destroy: function () {
                if (webfrontend.gui.region.RegionCityMenu.prototype.__baseCounterButton_showMenu) {
                    webfrontend.gui.region.RegionCityMenu.prototype.showMenu = webfrontend.gui.region.RegionCityMenu.prototype.__baseCounterButton_showMenu;
                    webfrontend.gui.region.RegionCityMenu.prototype.__baseCounterButton_initialized = false;
                    webfrontend.gui.region.RegionCityMenu.prototype.__baseCounterButton_showMenu = undefined;
                }
            },
            registerButton: function () {
                if (!webfrontend.gui.region.RegionCityMenu.prototype.__baseCounterButton_showMenu) {
                    webfrontend.gui.region.RegionCityMenu.prototype.__baseCounterButton_showMenu = webfrontend.gui.region.RegionCityMenu.prototype.showMenu;
                    webfrontend.gui.region.RegionCityMenu.prototype.showMenu = function (selectedVisObject) {
                        BaseCounter.selectedBase = selectedVisObject;
                        //console.log('selected base: raw ' + BaseCounter.selectedBase.get_RawX() + ':' + BaseCounter.selectedBase.get_RawY() + ' - pos ' + BaseCounter.selectedBase.get_PosX() + ':' + BaseCounter.selectedBase.get_PosY() + ' - id ' + BaseCounter.selectedBase.get_Id());
                        console.log('selected base: raw ' + BaseCounter.selectedBase.get_RawX() + ':' + BaseCounter.selectedBase.get_RawY());
                        if (this.__baseCounterButton_initialized !== true) {
                            this.__baseCounterButton_initialized = true;
                            // this.__baseComposite = new qx.ui.container.Composite(new qx.ui.layout.VBox(0)).set({
                            //     padding: 2
                            // });
                            // access forum
                            /*try {
                                //var input = qx.core.Init.getApplication().getChat().getChatWidget().getEditable();
                                var forum = ClientLib.Data.Forum.prototype.$ctor;
                                var fid = forum.Id;
                                var fname = forum.Title;
                                var fthreads = forum.get_ThreadInfos();
                                console.log('DEBUG: ' + 'id: "' + fid + '" threads: "' + fthreads + '" thread 0: "' + fthreads[0] + '"');
                            }
                            catch (e)
                            {
                                console.error(e);
                            }*/
                            this.__baseCountButton = new qx.ui.form.Button('Paste BaseCount');
                            this.__baseCountButton.addListener('execute', function () {
                                BaseCounter.count();
                            });
                            console.log('button made');
                            // this.__baseComposite.add(this.__baseCountButton);
                        }

                        if (BaseCounter.lastBase !== BaseCounter.selectedBase) {
                            var count = BaseCounter.count(false);
                            console.log(count);
                            this.__baseCountButton.set({
                                toolTipText: count.complete
                            });
                            this.__baseCountButton.setLabel('Bases: ' + count.total);
                            BaseCounter.lastBase = BaseCounter.selectedBase;
                        }

                        // console.log(children);
                        this.__baseCounterButton_showMenu(selectedVisObject);
                        switch (selectedVisObject.get_VisObjectType()) {
                            case ClientLib.Vis.VisObject.EObjectType.RegionNPCCamp:
                            case ClientLib.Vis.VisObject.EObjectType.RegionNPCBase:
                            case ClientLib.Vis.VisObject.EObjectType.RegionPointOfInterest:
                            case ClientLib.Vis.VisObject.EObjectType.RegionRuin:
                            case ClientLib.Vis.VisObject.EObjectType.RegionHubControl:
                            case ClientLib.Vis.VisObject.EObjectType.RegionHubServer:
                            case ClientLib.Vis.VisObject.EObjectType.RegionCityType:
                                this.add(this.__baseCountButton);
                                break;
                            default:
                                console.log(selectedVisObject.get_VisObjectType());
                        }
                    };
                }
            }
        };
        ST.util.waitForLoad(function () {
            console.log('ST: Starting module [BaseCounter]');
            BaseCounter.startup();
            //if (ClientLib.Data.MainData.GetInstance().get_Server().get_ForgottenAttacksEnabled()) {
            //    console.log('ST: Starting module [BaseCounter]');
            //    BaseCounter.startup();
            //} else {
            //    console.log('ST: Skipping module [BaseCounter] forgotten attacks not enabled');
            //}
        });
    };

    var ST_MODULES = window.ST_MODULES || [];
    ST_MODULES.push(baseCounter); /* End: client/modules/basescount.js */
    function innerHTML(functions) {
        var output = '';
        for (var i = 0; i < functions.length; i++) {
            var func = functions[i];
            output += '(' + func.toString() + ')();\n';
        }
        return output;
    }
    if (window.location.pathname !== ('/login/auth')) {
        var script = document.createElement('script');
        script.textContent = innerHTML(ST_MODULES);
        script.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(script);
    }
})();