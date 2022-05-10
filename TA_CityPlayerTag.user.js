// ==UserScript==
// @name        PlayerTag Slave Script
// @namespace   https://*.alliances.commandandconquer.com/*/index.aspx*
// @description Allow to set tags for players
// @match     https://*.alliances.commandandconquer.com/*/index.aspx*
// @version     2.2
// @author      Alkalyne
// @contributor NetquiK (https://github.com/netquik) - (see first comments for changelog)
// @updateURL   https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_CityPlayerTag.user.js
// @downloadURL   https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_CityPlayerTag.user.js
// ==/UserScript==

//
// NOTE : Prototype
//

/*
codes by NetquiK
----------------
- !!NOEVIL!!
- 22.2 FIX
- Compatibility with ADDON_City_Online_Status_Colorer_SC
----------------
*/


(function () {
    // 22.2 New Framework Fixes issue #9182: new unified pointer input model since Chrome 55
    if (parseFloat(GameVersion) < 22.2) window.navigator.pointerEnabled = "PointerEvent" in window;
    // see https://github.com/qooxdoo/qooxdoo/issues/9182
    function PlayerTag_Main() {
        console.log("CityPlayerTag: Loaded");
        var worldId;

        var re = /.*\/([0-9]*)\//;
        var str = window.location.href;
        var m;

        if ((m = re.exec(str)) !== null) {
            if (m.index === re.lastIndex) {
                re.lastIndex++;
            }
            worldId = m[1];
        } else {
            return;
        }

        var localStorageKey = "CCTA_MaelstromTools_CC_PlayerTag_" + worldId;
        var localStorageKeyVersion = "CCTA_MaelstromTools_CC_PlayerTag_Version_" + worldId;
        localStorage.removeItem(localStorageKeyVersion);

        var tagArray = {};
        var oldTagArray = {};
        var tagJsonData = localStorage.getItem(localStorageKey);
        if (tagJsonData !== null && tagJsonData !== undefined) {
            tagArray = JSON.parse(tagJsonData);
        } else {
            localStorage.setItem(localStorageKey, JSON.stringify(tagArray));
        }

        var selectedObjectMemberName;
        var worldSectorObjectsMemberName;
        var updateData$ctorMethodName;
        var worldSectorVersionMemberName;
        var regionUpdateMethodName;
        var visObjectTypeNameMap = {};


        function CityPlayerTagInclude() {
            visObjectTypeNameMap[ClientLib.Vis.VisObject.EObjectType.RegionCityType] = ClientLib.Vis.Region.RegionCity.prototype.get_ConditionDefense.toString().match(/&&\(this\.([A-Z]{6})\.[A-Z]{6}>=0\)/)[1];
            visObjectTypeNameMap[ClientLib.Vis.VisObject.EObjectType.RegionNPCBase] = ClientLib.Vis.Region.RegionNPCBase.prototype.get_BaseLevel.toString().match(/return this\.([A-Z]{6})\.[A-Z]{6};/)[1];
            worldSectorObjectsMemberName = ClientLib.Data.WorldSector.prototype.SetDetails.toString().match(/case \$I\.[A-Z]{6}\.City:.+?this\.([A-Z]{6})\.[A-Z]{6}\(\(\(e<<(?:16|0x10)\)\|d\),g\);.+?var h=this\.([A-Z]{6})\.d\[g\.[A-Z]{6}\];if\(h==null\){return false;}var i=\(\(h\.([A-Z]{6})!=0\)\s?\?\s?this\.([A-Z]{6})\.d\[h\.\3\]\s?:\s?null\);/)[1];
            updateData$ctorMethodName = ClientLib.Vis.MouseTool.CreateUnitTool.prototype.Activate.toString()
                .match(/\$I\.[A-Z]{6}\.[A-Z]{6}\(\)\.[A-Z]{6}\(\)\.[A-Z]{6}\(\)\.[A-Z]{6}\(\(new \$I\.[A-Z]{6}\)\.([A-Z]{6})\(this,this\.[A-Z]{6}\)\);/)[1];

            regionUpdateMethodName = ClientLib.Vis.Region.Region.prototype.SetPosition.toString()
                .match(/this\.([A-Z]{6})\(\);/)[1];
            var matchList = webfrontend.gui.region.RegionCityMenu.prototype.onTick.toString()
                .match(/if\(this\.([A-Za-z_]+)!==null\){?this\.[A-Za-z0-9_]+\(\);/);

            // attackButtonPatch script Fix
            if (matchList == undefined) {
                matchList = webfrontend.gui.region.RegionCityMenu.prototype.onTickAttPatch.toString()
                    .match(/if\(this\.([A-Za-z_]+)!==null\){?this\.[A-Za-z0-9_]+\(\);/);
            }
            selectedObjectMemberName = matchList[1];
            worldSectorVersionMemberName = ClientLib.Data.WorldSector.prototype.get_Version.toString()
                .match(/return this\.([A-Z]{6});/)[1];


            var scriptsButton = qx.core.Init.getApplication().getMenuBar().getScriptsButton();

            scriptsButton.Add('Update Tags/Name from Server', '');
            let children = scriptsButton.getMenu().getChildren();
            let lastChild = children[children.length - 1];
            lastChild.addListener('execute', updateFromServer, PlayerTag_Main);


            ClientLib.Vis.Region.RegionNPCBase.prototype.BaseColor = function (baseColor) {
                try {
                    var baseCoordX = this.get_RawX();
                    var baseCoordY = this.get_RawY();
                    if (tagArray[baseCoordX + ':' + baseCoordY] !== undefined && tagArray[baseCoordX + ':' + baseCoordY] !== "") {
                        return "#ffffff"; //ff5a00
                    }
                } catch (ex) {
                    console.log("MaelstromTools_PlayerTag error: ", ex);
                }
                return baseColor;
            };

            ClientLib.Vis.Region.RegionNPCBase.prototype.BaseName = function (baseName) {
                try {
                    var baseCoordX = this.get_RawX();
                    var baseCoordY = this.get_RawY();
                    if (tagArray[baseCoordX + ':' + baseCoordY] !== undefined && tagArray[baseCoordX + ':' + baseCoordY] !== "") {
                        return tagArray[baseCoordX + ':' + baseCoordY];
                    }
                } catch (ex) {
                    console.log("MaelstromTools_PlayerTag error: ", ex);
                }
                return baseName;
            };
            createBasePlateFunction(ClientLib.Vis.Region.RegionNPCBase);


            var regionCityPrototype = ClientLib.Vis.Region.RegionCity.prototype;
            regionCityPrototype.BaseNameTag = function (baseName) { //ff5a00
                try {
                    var playerName = this.get_PlayerName();
                    if (tagArray[playerName] !== undefined && tagArray[playerName] !== "") {
                        return "[" + tagArray[playerName] + "] " + baseName;
                    }
                } catch (ex) {
                    console.log("MaelstromTools_PlayerTag error: ", ex);
                }
                return baseName;
            };


            var updateColorParts = g(regionCityPrototype.UpdateColor, /createHelper;this\.([A-Z]{6})\(/, "ClientLib.Vis.Region.RegionCity UpdateColor", 1);
            var setCanvasValue_Name = updateColorParts[1];
            if (updateColorParts === null || setCanvasValue_Name.length !== 6) {
                console.error("Error - ClientLib.Vis.Region.RegionCity.SetCanvasValue undefined");
                return;
            }
            //MOD NO EVIL by NetquiK
            regionCityPrototype.SetCanvasValueTag_ORG = regionCityPrototype[setCanvasValue_Name];
            //var setCanvasValueFunctionBody = getFunctionBody(regionCityPrototype.SetCanvasValueTag_ORG);
            //regionCityPrototype.SetCanvasValueTag_BODY = setCanvasValueFunctionBody;
            var M = regionCityPrototype[setCanvasValue_Name].toString().replace(/[\r\n]/g, "").match(/\([a-z],([a-z])\).+this\.([A-Z]{6})\.([A-Z]{6}).+\+\1\.([A-Z]{6}).+\1\.([A-Z]{6}).+[a-z]\.([A-Z]{6});.+this\.([A-Z]{6})\.T.+this\.([A-Z]{6})\.T.+this\.([A-Z]{6})\.T.+this\.([A-Z]{6})\.([A-Z]{6}).+this\.\10\.([A-Z]{6}).+this\.([A-Z]{6})\(\);}}/);
            var setCanvasValueFunctionBodyFixed = function (a, b) {
                var $createHelper;
                var c = ClientLib.Data.MainData.GetInstance().get_BaseColors();
                var d = true;
                var e = null;
                if (d) {
                    var f = false;
                    e = a.GetPlayer(this[M[2]][M[3]]);
                    if (e != null) {
                        var g = c.GetBaseColor(this.get_PlayerId(), this.get_AllianceId());
                        if (this.get_Type() == ClientLib.Vis.Region.RegionCity.ERegionCityType.Own) {
                            g = "#000000";
                            //MOD for City_online_Status_Colorer
                        } else if (typeof this.CityTextcolor == 'function') {
                            g = this.CityTextcolor(g);
                        }
                        var h = "Lvl " + b[M[4]].toString();
                        var i = this.BaseNameTag(b[M[5]]);
                        var j = e[M[6]];
                        if (ClientLib.Vis.VisMain.GetInstance().get_HideRegionPlayerNames()) {
                            j = "            ";
                        }
                        if ((this[M[7]].Text != h) || (this[M[7]].Color != g)) {
                            f = true;
                            this[M[7]].Text = h;
                            this[M[7]].Color = g;
                        }
                        if ((this[M[8]].Text != i) || (this[M[8]].Color != g)) {
                            f = true;
                            this[M[8]].Text = i;
                            this[M[8]].Color = g;
                        }
                        if ((this[M[9]].Text != j) || (this[M[9]].Color != g)) {
                            f = true;
                            this[M[9]].Text = j;
                            this[M[9]].Color = g;
                        }
                    } else {
                        this[M[7]].Text = "";
                        this[M[8]].Text = "";
                        this[M[9]].Text = "";
                    }
                    if (f && (this[M[10]] != null)) {
                        if (this.get_Type() != ClientLib.Vis.Region.RegionCity.ERegionCityType.Own) {
                            this[M[10]][M[11]](this.get_AllianceId());
                        }
                        this[M[10]][M[12]]();
                    }
                } else {
                    this[M[13]]();
                }
            }
            /*             var setCanvasValueFunctionBodyFixed = setCanvasValueFunctionBody.replace(
                            /if\(\(this\.([A-Z]{6})\.Text\!=i\)\|\|\(this\.([A-Z]{6})\.Color\!=g\)\)\{f=true;this\.([A-Z]{6})\.Text=i;this\.([A-Z]{6})\.Color=g;/im,
                            "if((this.$1.Text!=this.BaseNameTag(i))||(this.$2.Color!=g)){f=true;this.$3.Text=this.BaseNameTag(i);this.$4.Color=g;"); */
            /*             regionCityPrototype[setCanvasValue_Name] = new Evil("a", "b", setCanvasValueFunctionBodyFixed);
                        regionCityPrototype.SetCanvasValueTag_FIXED = new Evil("a", "b", setCanvasValueFunctionBodyFixed); */

            regionCityPrototype[setCanvasValue_Name] = setCanvasValueFunctionBodyFixed;
            regionCityPrototype.SetCanvasValueTag_FIXED = setCanvasValueFunctionBodyFixed;

            var regionNPCBasePrototype = ClientLib.Vis.Region.RegionNPCBase.prototype;

            var url = PT.util.urlGet(worldId, ClientLib.Data.MainData.GetInstance().get_Alliance().get_Id());
            PT.util.ajax('GET', url, null, function (xhr) {
                if (xhr.responseText != null && xhr.responseText != "") {
                    tagArray = JSON.parse(xhr.responseText);
                    localStorage.setItem(localStorageKey, JSON.stringify(tagArray));
                }
            });

            // Mise à jour automatique
            window.setInterval(function () {
                updateFromServer();
            }, 300000);

        }

        function refreshWorldObject(x, y) {
            var sector = ClientLib.Data.MainData.GetInstance().get_World().GetWorldSectorByCoords(x, y);
            if (sector != null) {
                var encodedSectorCoords = ((y % 0x20) << 0x10) | (x % 0x20);
                var worldObject = sector[worldSectorObjectsMemberName].d[encodedSectorCoords];
                if (worldObject == undefined) {
                    return;
                }
                delete sector[worldSectorObjectsMemberName].d[encodedSectorCoords];
            }

            ClientLib.Vis.VisMain.GetInstance().get_Region()[regionUpdateMethodName]();
            setTimeout(function () {
                insertWorldObject(x, y, worldObject);
                ClientLib.Vis.VisMain.GetInstance().get_Region()[regionUpdateMethodName]();;
            }, 50);
            ClientLib.Net.CommunicationManager.GetInstance().RegisterDataReceiver('WORLD', (new ClientLib.Net.UpdateData)[updateData$ctorMethodName](this, updateWorldDetour));
        }

        function insertWorldObject(x, y, worldObject) {
            var sector = ClientLib.Data.MainData.GetInstance().get_World().GetWorldSectorByCoords(x, y);
            if (sector != null) {
                var encodedSectorCoords = ((y % 0x20) << 0x10) | (x % 0x20);
                sector[worldSectorObjectsMemberName].d[encodedSectorCoords] = worldObject;
                sector[worldSectorVersionMemberName] = 0;
            }
        }

        function getWorldObject(regionObject) {

            var visObjectType = regionObject.get_VisObjectType();

            if (visObjectType in visObjectTypeNameMap) {
                return regionObject[visObjectTypeNameMap[visObjectType]];
            }

            return ClientLib.Data.MainData.GetInstance().get_World().GetObjectFromPosition(regionObject.get_RawX(), regionObject.get_RawY());
        }


        function updateWorldDetour(type, data) {
            var world = ClientLib.Data.MainData.GetInstance().get_World();
            world.Update(type, data);

            if (type === 'WORLD') {
                ClientLib.Vis.VisMain.GetInstance().get_Region()[regionUpdateMethodName]();
                ClientLib.Net.CommunicationManager.GetInstance().RegisterDataReceiver('WORLD', (new ClientLib.Net.UpdateData)[updateData$ctorMethodName](world, world.Update));
            }
        }


        function createBasePlateFunction(r) {
            try {
                var regionObject = r.prototype;
                for (var key in regionObject) {
                    /**
                    $I.ZEBCTS.prototype.GNVUCY = function () {
                    var $createHelper;
                    return this.WXGXKC.Text;
                    };*/
                    if (typeof regionObject[key] === 'function') {
                        var strFunction = regionObject[key].toString().replace(/[\r\n]/g, "");
                        if (strFunction.indexOf("tnf:mutants base") > -1) {
                            if (r == ClientLib.Vis.Region.RegionNPCBase) {
                                /* var initBaseFunction = getFunctionBody(regionObject[key]);
                                //var f=$I.FFGAJK.OSOBAM("tnf:mutants base");
                                var initBaseFunctionFixed = initBaseFunction.replace(
                                    /var f=([^;]*);/im,
                                    "var f=this.BaseName($1);");
                                initBaseFunctionFixed = initBaseFunctionFixed.replace(
                                    /var g=([^;]*);/im,
                                    "var g=this.BaseColor($1);"); 
                                regionObject[key] = new Evil("a", "b", "c", "d", "e", initBaseFunctionFixed);
                                */
                                // MOD NOEVIL 2 by NetquiK
                                var ROM = strFunction.match(/\);this\.([A-Z]{6})=.+this\.([A-Z]{6})=.+this\.([A-Z]{6})=.+this\.([A-Z]{6})=.+this\.([A-Z]{6})=.+this\.([A-Z]{6})=.+this\.([A-Z]{6})=.+this\.([A-Z]{6})=.+\.([A-Z]{6})\.toS.+this\.([A-Z]{6})=.+new \$I\.([A-Z]{6})\)\.([A-Z]{6})\(this\.([A-Z]{6})\(\),this\.\7,this\.\8.+this\.([A-Z]{6})\.([A-Z]{6}).+\14\.[A-Z]{6}.+\14\.[A-Z]{6}.+this\.([A-Z]{6})=.+\14\.\15\(\)\.([A-Z]{6}).+this\.\16\.([A-Z]{6})\(\d+\).+\16\.([A-Z]{6})\(\$I.([A-Z]{6})\.([A-Z]{6}).+\16\.([A-Z]{6})\(\$I\.\20\.([A-Z]{6}).+this\.([A-Z]{6})=.+this\.([A-Z]{6})=this\.\5\.([A-Z]{6}).+this\.([A-Z]{6})=this\.\5\.([A-Z]{6}).+this\.([A-Z]{6})=.+this\.([A-Z]{6})=\(\(this\.\5\.([A-Z]{6}).+this\.([A-Z]{6})\([a-z],[a-z]\).+\.([A-Z]{6})\(.+this\.([A-Z]{6})\)\)/);
                                regionObject[key] = function (a, b, c, d, e) {
                                    var $createHelper;
                                    ClientLib.Vis.Region.RegionObject.prototype.$ctor.call(this, a, b, c);
                                    this[ROM[1]] = -1;
                                    this[ROM[2]] = -1;
                                    this[ROM[3]] = e.SequenceId;
                                    this[ROM[4]] = d;
                                    this[ROM[5]] = e;
                                    this[ROM[6]] = phe.cnc.ClientLibTNF.translate("tnf:lvl");
                                    //MOD ClientLib.Vis.Region.RegionNPCBase 1
                                    //var f = phe.cnc.ClientLibTNF.translate("tnf:mutants base");
                                    var f = this.BaseName(phe.cnc.ClientLibTNF.translate("tnf:mutants base"));
                                    if (this.get_IsHubBase()) {
                                        f = phe.cnc.ClientLibTNF.translate("tnf:mutants hub");
                                    }
                                    //MOD ClientLib.Vis.Region.RegionNPCBase 2
                                    //var g = ClientLib.Data.MainData.GetInstance().get_BaseColors().GetStandardColor(ClientLib.Data.BaseColors.ColorType.NPCBase);
                                    var g = this.BaseColor(ClientLib.Data.MainData.GetInstance().get_BaseColors().GetStandardColor(ClientLib.Data.BaseColors.ColorType.NPCBase));
                                    this[ROM[7]] = (new ClientLib.Vis.Region.RegionTextInfo).$ctor(f, "region_city_name", g);
                                    this[ROM[8]] = (new ClientLib.Vis.Region.RegionTextInfo).$ctor(this[ROM[6]] + " " + e[ROM[9]].toString(), "region_city_owner", g);
                                    this[ROM[10]] = (new $I[ROM[11]])[ROM[12]](this[ROM[13]](), this[ROM[7]], this[ROM[8]], true);
                                    var h = this[ROM[14]][ROM[15]]();
                                    var i = this[ROM[14]].get_GridWidth();
                                    var j = this[ROM[14]].get_GridHeight();
                                    this[ROM[16]] = this[ROM[14]][ROM[15]]()[ROM[17]]("image", null);
                                    this[ROM[16]][ROM[18]](98);
                                    this[ROM[16]][ROM[19]]($I[ROM[20]][ROM[21]]);
                                    this[ROM[16]][ROM[22]]($I[ROM[20]][ROM[23]]);
                                    this[ROM[24]] = ClientLib.Data.MainData.GetInstance().get_Cities().GetBaseEffectIndexFromMainBuildingLevel(this[ROM[5]][ROM[9]], ClientLib.Base.EFactionType.NPCBase);
                                    var k = ClientLib.Data.MainData.GetInstance().get_Time().GetServerStep();
                                    this[ROM[25]] = this[ROM[5]][ROM[26]];
                                    this[ROM[27]] = this[ROM[5]][ROM[28]];
                                    this.CalculateBuildingAndDefenseCondition(k);
                                    this[ROM[29]] = this[ROM[14]].GetDamageStateByBuildingAndDefenseConditions(this[ROM[25]], ((this[ROM[5]][ROM[28]] != -1) ? this[ROM[27]] : this[ROM[5]][ROM[28]]));
                                    this[ROM[30]] = ((this[ROM[5]][ROM[31]] - ClientLib.Data.MainData.GetInstance().get_Server().get_PostCombatBlockedForAllSteps()) > k);
                                    this[ROM[32]](d, e);
                                    this.UpdateMoralDecal(ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity());
                                    ClientLib.Data.MainData.GetInstance().get_Cities().add_CurrentChange((new ClientLib.Data.CurrentCityChange)[ROM[33]](this, this[ROM[34]]));
                                    return this;
                                };



                                break;
                            }
                        }
                    }
                }
            } catch (q) {
                console.log(q)
            }
        }

        function IsJsonString(str) {
            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }
            return true;
        }

        function refreshTags(refreshTagArray) {
            ClientLib.Data.MainData.GetInstance().get_Alliance().RefreshMemberData();
            for (var attr in refreshTagArray) {
                if (attr.indexOf(":") != -1) {
                    refreshWorldObject(attr.split(":")[0], attr.split(":")[1]);
                }
            }

        }


        function updateFromServer() {
            var url = PT.util.urlGet(worldId, ClientLib.Data.MainData.GetInstance().get_Alliance().get_Id());
            PT.util.ajax('GET', url, null, function (xhr) {
                if (xhr.responseText != null && xhr.responseText != "") {
                    var jsonResult = JSON.parse(xhr.responseText);
                    if (jsonResult["version"] != localStorage.getItem(localStorageKeyVersion)) {
                        oldTagArray = tagArray;
                        tagArray = jsonResult;
                        localStorage.setItem(localStorageKey, JSON.stringify(tagArray));

                        var selectedObject = webfrontend.gui.region.RegionCityMenu.getInstance()[selectedObjectMemberName];
                        if (selectedObject != null) {
                            //"Correction" Bug menu contextuel
                            var selectedBase = {};
                            selectedBase[selectedObject.get_RawX() + ":" + selectedObject.get_RawY()] = "";
                            refreshTags(selectedBase);
                        }
                        localStorage.setItem(localStorageKeyVersion, jsonResult["version"]);

                        refreshTags(difference(oldTagArray, tagArray));
                        refreshTags(tagArray);
                    }
                }
            });
        }

        function difference(array1, array2) {
            var result = {};

            for (var k in array1) {
                if (!array2.hasOwnProperty(k)) {
                    result[k] = array2[k];
                }
            }

            return result;
        }

        function g(functionObject, regEx, m, p) {
            var functionBody = functionObject.toString();
            var shrinkedText = functionBody.replace(/\s/gim, "");
            var matches = shrinkedText.match(regEx);
            for (var i = 1; i < (p + 1); i++) {
                if (matches !== null && matches[i].length === 6) {
                    //console.log(m, i, matches[i]);
                } else {
                    console.error("Error - ", m, i, "not found");
                    console.warn(m, shrinkedText);
                }
            }
            return matches;
        }


        /* function getFunctionBody(functionObject) {
            var string = functionObject.toString();
            var singleLine = string.replace(/(\n\r|\n|\r|\t)/gm, " ");
            var spacesShrinked = singleLine.replace(/\s+/gm, " ");
            var headerRemoved = spacesShrinked.replace(/function.*?\{/, "");
            var result = headerRemoved.substring(0, headerRemoved.length - 1); // remove last "}"
            return result;
        } */

        function MaelstromTools_CityPlayerTagInclude_checkIfLoaded() {
            try {
                if (typeof ClientLib !== "undefined" && ClientLib.Vis !== undefined && ClientLib.Vis.Region !== undefined && ClientLib.Vis.Region.RegionCity !== undefined && typeof qx !== 'undefined' && qx.core.Init.getApplication() && qx.core.Init.getApplication().initDone && ClientLib.Data.MainData.GetInstance().get_Alliance().get_Id() != 0) {

                    window.setTimeout(CityPlayerTagInclude, 1000);

                } else {
                    window.setTimeout(MaelstromTools_CityPlayerTagInclude_checkIfLoaded, 1000);
                }
            } catch (ex) {
                console.log("MaelstromTools_CityPlayerTagInclude_checkIfLoaded: ", ex);
            }
        }

        function MaelstromTools_CityPlayerTagTool_checkIfLoaded() {
            try {
                if (typeof ClientLib === "undefined" || typeof MaelstromTools === "undefined") {
                    window.setTimeout(MaelstromTools_CityPlayerTagTool_checkIfLoaded, 1000);
                }
            } catch (ex) {
                console.log("MaelstromTools_CityPlayerTagTool_checkIfLoaded: ", ex);
            }
        }

        if (/commandandconquer\.com/i.test(document.domain)) {
            window.setTimeout(MaelstromTools_CityPlayerTagInclude_checkIfLoaded, 1000);
            window.setTimeout(MaelstromTools_CityPlayerTagTool_checkIfLoaded, 30000);
        }

        var PT = window.PT || {};
        PT.util = {
            URLGET: 'https://ccta.hodor.ninja/getPlayersTagsVersion.php',
            urlGet: function (world, alliance) {
                return PT.util.URLGET + "?world=" + world + "&alliance=" + alliance + "&version=" + localStorage.getItem(localStorageKeyVersion) + "&t=" + Math.floor(Date.now() / 1000);
            },
            ajax: function (method, url, data, callback) {
                var xhr = new XMLHttpRequest();
                xhr.open(method, url, true);
                xhr.setRequestHeader('Content-Type', 'application/json');

                if (callback !== undefined) {
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState !== 4) {
                            return;
                        }
                        callback(xhr);
                    };
                }

                if (data !== undefined && data !== null) {
                    xhr.send(data);
                } else {
                    xhr.send();
                }
            },

        };

        window.PT = PT;


    }



    try {
        if (/commandandconquer\.com/i.test(document.domain)) {
            var scriptTag = document.createElement("script");
            scriptTag.id = "xxx";
            scriptTag.innerHTML = "(" + PlayerTag_Main.toString() + ")();";
            scriptTag.type = "text/javascript";
            document.getElementsByTagName("head")[0].appendChild(scriptTag);
        }
    } catch (c) {
        console.log("MaelstromTools_CityPlayerTag: init error: ", c);
    }


})();