// ==UserScript==
// @name        Maelstrom ADDON City Online Status Colorer for SC
// @namespace   https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @include     https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @description change the color of cities according to online state of the player
// @version     0.7
// @author      White X Dragon / Debitosphere / NetquiK
// @author      Der_Flake
// @contributor NetquiK (https://github.com/netquik) - REMOVED USELESS CODES - NOEVIL
// @updateURL   https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_ADDON_City_Online_Status_Colorer_SC.user.js
// ==/UserScript==
/*global PerforceChangelist,window,localStorage, console, ClientLib, MaelstromTools*/
(function () {
    function OnlineStatusCityColor_Main() {
        var localStorageKey = "CCTA_MaelstromTools_CC_OnlineStateColorer";
        var version = '0.7';
        var injectionMode = 'NOEVIL';
        console.log("Maelstrom_CityOnlineStateColorer " + version + " loaded, Serverversion " + injectionMode);
        var OnlineState = {
            Online: 1,
            Away: 2,
            Offline: 0,
            Hidden: 3
        };
        var onlineStateColor = {};
        onlineStateColor[OnlineState.Online] = "#00FF00";
        onlineStateColor[OnlineState.Away] = "#FFFF00";
        onlineStateColor[OnlineState.Offline] = "#FF0000";
        onlineStateColor[OnlineState.Hidden] = "#C2C2C2";

        function CityOnlineStateColorerInclude() {
            setInterval(requestOnlineStatusUpdate, 300 * 1000); // update users online status each 5 minutes
            console.log("Maelstrom_CityOnlineStateColorer Include");
            var regionCityPrototype = ClientLib.Vis.Region.RegionCity.prototype;
            regionCityPrototype.CityTextcolor = function (defaultColor) {
                try {
                    var members = ClientLib.Data.MainData.GetInstance().get_Alliance().get_MemberData().d;
                    var playerId = this.get_PlayerId();
                    if (members[playerId] !== undefined) {
                        var onlineState = members[playerId].OnlineState;
                        return onlineStateColor[onlineState];
                    }
                } catch (ex) {
                    console.log("MaelstromTools_CityOnlineStateColorer CityTextcolor error: ", ex);
                }
                return defaultColor;
            };


            var updateColorParts = g(regionCityPrototype.UpdateColor, /createHelper;this\.([A-Z]{6})\(/, "ClientLib.Vis.Region.RegionCity UpdateColor", 1);
            var setCanvasValue_Name = updateColorParts[1];
            console.log("setCanvasValue_Name = " + updateColorParts[1]);
            if (updateColorParts === null || setCanvasValue_Name.length !== 6) {
                console.error("Error - ClientLib.Vis.Region.RegionCity.SetCanvasValue undefined");
                return;
            }

            regionCityPrototype.SetCanvasValue_ORG = regionCityPrototype[setCanvasValue_Name];
            //console.log("regionCityPrototype.SetCanvasValue_ORG = " + regionCityPrototype[setCanvasValue_Name]);
            var setCanvasValueFunctionBody = getFunctionBody(regionCityPrototype.SetCanvasValue_ORG);
            regionCityPrototype.SetCanvasValue_BODY = setCanvasValueFunctionBody;

            //var setCanvasValueFunctionBodyFixed = setCanvasValueFunctionBody.replace(/true;.{0,3}\}.{0,3}this/im, "true; } g=this.CityTextcolor(g); this");
            var M = setCanvasValueFunctionBody.match(/var [a-zA-Z]=\$I\.([a-zA-Z]+)\.([a-zA-Z]+)\(\)\.([a-zA-Z]+).+\.([a-zA-Z]+)\(this\.([a-zA-Z]+)\.([a-zA-Z]+)\).+\.([a-zA-Z]+)\(this\.([a-zA-Z]+)\(\),this\.([a-zA-Z]+)\(.+\.([a-zA-Z]+)\(\)==\$I\.([a-zA-Z]+).+var [a-zA-Z]=this\.([a-zA-Z]+)\+.+\.([a-zA-Z]+)\.t.+[a-zA-Z]=[a-zA-Z]\.([a-zA-Z]+);.+[a-zA-Z]=[a-zA-Z]\.([a-zA-Z]+);if \(\$I\.([a-zA-Z]+)\.([a-zA-Z]+)\(\)\.([a-zA-Z]+).+{this\.([a-zA-Z]+)\.T.+this\.([a-zA-Z]+)\.T.+this\.([a-zA-Z]+)\.T.+&&\(this\.([a-zA-Z]+).+if\(this\.([a-zA-Z]+).+\.([a-zA-Z]+)\(this\.([a-zA-Z]+).+\.([a-zA-Z]+)\(.+\.([a-zA-Z]+)\(/);
            /* var setCanvasValueFunctionBodyFixed = setCanvasValueFunctionBody.replace(
                /\{g="#000000";\}/im,
                "{g=\"#000000\";}else{g=this.CityTextcolor(g);}"); */
                setCanvasValueFunctionBodyFixed=function(a,b){var $createHelper;var c=$I[M[1]][M[2]]()[M[3]]();var d=true;var e=null;if(d){var f=false;e=a[M[4]](this[M[5]][M[6]]);if(e!=null){var g=$I[M[1]][M[2]]()[M[3]]()[M[7]](this[M[8]](),this[M[9]]());if(this[M[10]]()==$I[M[11]].Own)g="#000000";else g=this.CityTextcolor(g);var h=this[M[12]]+" "+b[M[13]].toString();var i=b[M[14]];var j=e[M[15]];if($I[M[16]][M[17]]()[M[18]]())j="            ";if(this[M[19]].Text!=h||this[M[19]].Color!=g){f=true;this[M[19]].Text=
                    h;this[M[19]].Color=g}if(this[M[20]].Text!=i||this[M[20]].Color!=g){f=true;this[M[20]].Text=i;this[M[20]].Color=g}if(this[M[21]].Text!=j||this[M[21]].Color!=g){f=true;this[M[21]].Text=j;this[M[21]].Color=g}}else{this[M[19]].Text="";this[M[20]].Text="";this[M[21]].Text=""}if(f&&this[M[22]]!=null){if(this[M[23]]()!=$I[M[11]].Own)this[M[22]][M[24]](this[M[25]]());this[M[22]][M[26]]()}}else this[M[27]]()};
                
            //regionCityPrototype[setCanvasValue_Name] = new Evil("a", "b", setCanvasValueFunctionBodyFixed);
            //regionCityPrototype.SetCanvasValue_FIXED = new Evil("a", "b", setCanvasValueFunctionBodyFixed);
            regionCityPrototype[setCanvasValue_Name] = setCanvasValueFunctionBodyFixed;
            regionCityPrototype.SetCanvasValue_FIXED = setCanvasValueFunctionBodyFixed;


            /* var visUpdateParts = null;

            switch (injectionMode) {
                case 1:
                    visUpdateParts = g(regionCityPrototype.VisUpdate, /Own:\{?this\.(.{6})\(.*Alliance:\{?this\.(.{6})\(/, "ClientLib.Vis.Region.RegionCity.VisUpdate", 2);
                    break;
                default:
                    visUpdateParts = g(regionCityPrototype.VisUpdate, /Own:\{?\$I\.(.{6})\.(.{6})\(.*Alliance:\{?\$I\..{6}\.(.{6})\(/, "ClientLib.Vis.Region.RegionCity.VisUpdate", 3);
                    var G = ClientLib.Vis.Region.Region.prototype;
                    fc = g(G.VisUpdate, /\.(.{6})\(a,n,s\);/, "ClientLib.Vis.Region.Region.VisUpdate", 1);
                    break;
            }
            if (visUpdateParts === null || visUpdateParts[1].length !== 6) {
                //console.error("Error - ClientLib.Vis.Region.RegionCity VisUpdate paramter undefined");
                return;
            }

            if (injectionMode > 1) {
                regionCityPrototype[visUpdateParts[2]] = $I[visUpdateParts[1]][visUpdateParts[2]];
                regionCityPrototype[visUpdateParts[3]] = $I[visUpdateParts[1]][visUpdateParts[3]];
                var visUpdate = getFunctionBody(regionCityPrototype.VisUpdate);
                var t = visUpdate.replace(/Own:(\{?).{0,2}\$I\.(.{6})\.(.{6}).{0,2}\(/im, "Own: $1 this.$3(");
                var q = t.replace(/Alliance:(\{?).{0,2}\$I\.(.{6})\.(.{6}).{0,2}\(/im, "Alliance: $1 this.$3(");
                var F = q.replace(/Enemy:(\{?).{0,2}\$I\.(.{6})\.(.{6}).{0,2}\(/im, "Enemy: $1 this.$3(");
                regionCityPrototype[fc[1]] = new Evil("a", "b", "c", F);
                regionCityPrototype.VisUpdate = regionCityPrototype[fc[1]];
            }
            try {
                var u = null,
                    Q = null;
                if (injectionMode === 1) {
                    u = getFunctionBody(regionCityPrototype[visUpdateParts[1]]);
                    Q = u.replace(/c\.Font\);/im, "c.Font); this.CityBackgroundColor(a); ");
                    regionCityPrototype[visUpdateParts[1]] = new Evil("a", "b", "c", "d", Q);
                } else {
                    u = getFunctionBody(regionCityPrototype[visUpdateParts[2]]);
                    Q = u.replace(/d\.Font\);/im, "d.Font); this.CityBackgroundColor(b);");
                    regionCityPrototype[visUpdateParts[2]] = new Evil("a", "b", "c", "d", "e", Q);
                }
            } catch (P) {
                console.log("MaelstromTools_CityOnlineStateColorer Include B error: ", P);
            }
            try {
                if (injectionMode === 1) {
                    var K = getFunctionBody(regionCityPrototype[visUpdateParts[2]]);
                    var J = K.replace(/c.Font\);/im, "c.Font); this.CityBackgroundColor(a); ");
                    regionCityPrototype[visUpdateParts[2]] = new Evil("a", "b", "c", "d", "e", J);
                } else {
                    var K = getFunctionBody(regionCityPrototype[visUpdateParts[3]]);
                    var J = K.replace(/d.Font\);/im, "d.Font); this.CityBackgroundColor(b);");
                    regionCityPrototype[visUpdateParts[3]] = new Evil("a", "b", "c", "d", "e", "f", "g", J);
                }
            } catch (P) {
                console.log("MaelstromTools_CityOnlineStateColorer Include C error: ", P);
            } */


            /* var K = getFunctionBody($I.KGBAZW.SLETKT);
            var J = K.replace(/d.Font\);/im, "d.Font); this.CityBackgroundColor(b);");
            $I.KGBAZW.SLETKT = new Eviln("a", "b", "c", "d", "e", "f", "g", J); */

            /* $I["KGBAZW"]["CityBackgroundColor"] = function (backgroundBlock) {
                try {
                    //return;
                    var contexd2d = backgroundBlock.getContext("2d");
                    /* var savedData = [];
                    var item = null;
                    if (localStorage[localStorageKey] !== null && localStorage[localStorageKey] !== "undefined") {
                        savedData = JSON.parse(localStorage[localStorageKey]);
                    }
                    for (item in savedData) { 
                        if (savedData[item] instanceof Array && savedData[item].length >= 2) {
                            if (savedData[item][0] === this.get_PlayerName()) {
                                var isColor = /^#[0-9A-F]{6}$/i.test(savedData[item][2]);
                                if (isColor) {
                                    contexd2d.fillStyle = savedData[item][2];
                                } else {
                                    contexd2d.fillStyle = "#000000";
                                /* } 
                                contexd2d.fillRect(0, 0, backgroundBlock.width, backgroundBlock.height);
                                /* break;
                            } else {
                                if (savedData[item][0] === this.get_AllianceName()) {
                                    var isColor = /^#[0-9A-F]{6}$/i.test(savedData[item][2]);
                                    if (isColor) {
                                        contexd2d.fillStyle = savedData[item][2];
                                    } else {
                                        contexd2d.fillStyle = "#000000";
                                    }
                                    contexd2d.fillRect(0, 0, backgroundBlock.width, backgroundBlock.height);
                                    break;
                                }
                            } 
                        }
                    }
                } catch (ex) {
                    console.log("MaelstromTools_CityOnlineStateColorer CityBackgroundColor error: ", ex);
                }
            };
*/

        }

        function g(functionObject, regEx, m, p) {
            var functionBody = functionObject.toString();
            var shrinkedText = functionBody.replace(/\s/gim, "");
            var matches = shrinkedText.match(regEx);
            for (var i = 1; i < (p + 1); i++) {
                if (matches !== null && matches[i].length === 6) {
                    console.log(m, i, matches[i]);
                } else {
                    //console.error("Error - ", m, i, "not found");
                    console.warn(m, shrinkedText);
                }
            }
            return matches;
        }

        function requestOnlineStatusUpdate() {
            console.log("XXX City Color: requesting online status update..Checks every 5 minutes..)");
            var mainData = ClientLib.Data.MainData.GetInstance();
            var alliance = mainData.get_Alliance();
            alliance.RefreshMemberData();
        }

        function getFunctionBody(functionObject) {
            var string = functionObject.toString();
            var singleLine = string.replace(/(\n\r|\n|\r|\t)/gm, " ");
            var spacesShrinked = singleLine.replace(/\s+/gm, " ");
            var headerRemoved = spacesShrinked.replace(/function.*?\{/, "");
            var result = headerRemoved.substring(0, headerRemoved.length - 1); // remove last "}"
            return result;
        }

        function MaelstromTools_CityOnlineStateColorerInclude_checkIfLoaded() {
            try {
                if (typeof ClientLib !== "undefined" && ClientLib.Vis !== undefined && ClientLib.Vis.Region !== undefined && ClientLib.Vis.Region.RegionCity !== undefined) {
                    window.setTimeout(CityOnlineStateColorerInclude, 30000);
                } else {
                    window.setTimeout(MaelstromTools_CityOnlineStateColorerInclude_checkIfLoaded, 1000);
                }
            } catch (ex) {
                console.log("MaelstromTools_CityOnlineStateColorerInclude_checkIfLoaded: ", ex);
            }
        }

        function MaelstromTools_CityOnlineStateColorerTool_checkIfLoaded() {
            try {
                if (typeof ClientLib === "undefined" || typeof MaelstromTools === "undefined") {
                    window.setTimeout(MaelstromTools_CityOnlineStateColorerTool_checkIfLoaded, 1000);
                }
            } catch (ex) {
                console.log("MaelstromTools_CityOnlineStateColorerTool_checkIfLoaded: ", ex);
            }
        }

        if (/commandandconquer\.com/i.test(document.domain)) {
            window.setTimeout(MaelstromTools_CityOnlineStateColorerInclude_checkIfLoaded, 1000);
            window.setTimeout(MaelstromTools_CityOnlineStateColorerTool_checkIfLoaded, 30000);
        }
    }
    try {
        if (/commandandconquer\.com/i.test(document.domain)) {
            var scriptTag = document.createElement("script");
            scriptTag.id = "xxx";
            scriptTag.innerHTML = "(" + OnlineStatusCityColor_Main.toString() + ")();";
            scriptTag.type = "text/javascript";
            document.getElementsByTagName("head")[0].appendChild(scriptTag);
        }
    } catch (c) {
        console.log("MaelstromTools_CityOnlineStateColorer: init error: ", c);
    }
})();