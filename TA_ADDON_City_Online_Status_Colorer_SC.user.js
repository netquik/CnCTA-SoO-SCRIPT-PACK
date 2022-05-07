// ==UserScript==
// @name        Maelstrom ADDON City Online Status Colorer for SC
// @namespace   https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @include     https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @description change the color of cities according to online state of the player
// @version     0.7.3
// @author      White X Dragon / Debitosphere / NetquiK
// @author      Der_Flake
// @contributor NetquiK (https://github.com/netquik) - REMOVED USELESS CODES - !!NOEVIL!! - RECODED
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
            /*  var updateColorParts = g(regionCityPrototype.UpdateColor, /createHelper;this\.([A-Z]{6})\(/, "ClientLib.Vis.Region.RegionCity UpdateColor", 1); */
            var updateColorParts = regionCityPrototype.UpdateColor.toString().match(/\$createHelper;this\.([A-Z]{6})\(this\.[A-Z]{6},this\.([A-Z]{6})\)/);

            var setCanvasValue_Name = updateColorParts[1];
            var cityinfo = updateColorParts[2];
            console.log("Maelstrom_CityOnlineStateColorer: setCanvasValue_Name = " + updateColorParts[1]);
            console.log("Maelstrom_CityOnlineStateColorer: CityInfo = " + updateColorParts[2]);
            if (updateColorParts === null || setCanvasValue_Name.length !== 6) {
                console.error("Error - ClientLib.Vis.Region.RegionCity.SetCanvasValue undefined");
                return;
            }
            regionCityPrototype.SetCanvasValue_ORG = regionCityPrototype[setCanvasValue_Name];
            var M = regionCityPrototype[setCanvasValue_Name].toString().match(/\([a-z],([a-z])\).+this\.[A-Z]{6}\.([A-Z]{6}).+\+\1\.([A-Z]{6}).+\1\.([A-Z]{6}).+[a-z]\.([A-Z]{6});.+this\.([A-Z]{6})\.T.+this\.([A-Z]{6})\.T.+this\.([A-Z]{6})\.T.+this\.([A-Z]{6})\.([A-Z]{6}).+this\.\9\.([A-Z]{6}).+this\.([A-Z]{6})\(\);}}/);
            /* var setCanvasValueFunctionBodyFixed = setCanvasValueFunctionBody.replace(
                /\{g="#000000";\}/im,
                "{g=\"#000000\";}else{g=this.CityTextcolor(g);}"); */
            setCanvasValueFunctionBodyFixed = function (g, d) {
                ClientLib.Data.MainData.GetInstance().get_BaseColors();
                var c = !1;
                var b = g.GetPlayer(this[cityinfo][M[2]]);
                if (null != b) {
                    var a = ClientLib.Data.MainData.GetInstance().get_BaseColors().GetBaseColor(this.get_PlayerId(), this.get_AllianceId());
                    a = this.get_Type() == ClientLib.Vis.Region.RegionCity.ERegionCityType.Own ? "#000000" : this.CityTextcolor(a);
                    var e = "Lvl " + d[M[3]].toString(),
                        f = d[M[4]];
                    b = b[M[5]];
                    ClientLib.Vis.VisMain.GetInstance().get_HideRegionPlayerNames() && (b =
                        "            ");
                    if (this[M[6]].Text != e || this[M[6]].Color != a) c = !0, this[M[6]].Text = e, this[M[6]].Color = a;
                    if (this[M[7]].Text != f || this[M[7]].Color != a) c = !0, this[M[7]].Text = f, this[M[7]].Color = a;
                    if (this[M[8]].Text != b || this[M[8]].Color != a) c = !0, this[M[8]].Text = b, this[M[8]].Color = a
                } else this[M[6]].Text = "", this[M[7]].Text = "", this[M[8]].Text = "";
                if (c && null != this[M[9]]) {
                    if (this.get_Type() != ClientLib.Vis.Region.RegionCity.ERegionCityType.Own) this[M[9]][M[10]](this.get_AllianceId());
                    this[M[9]][M[11]]()
                }
            };
            regionCityPrototype[setCanvasValue_Name] = setCanvasValueFunctionBodyFixed;
            regionCityPrototype.SetCanvasValue_FIXED = setCanvasValueFunctionBodyFixed;
        }
        function requestOnlineStatusUpdate() {
            console.log("XXX City Color: requesting online status update..Checks every 5 minutes..)");
            var mainData = ClientLib.Data.MainData.GetInstance();
            var alliance = mainData.get_Alliance();
            alliance.RefreshMemberData();
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
            scriptTag.textContent = "(" + OnlineStatusCityColor_Main.toString() + ")();";
            scriptTag.type = "text/javascript";
            document.getElementsByTagName("head")[0].appendChild(scriptTag);
        }
    } catch (c) {
        console.log("MaelstromTools_CityOnlineStateColorer: init error: ", c);
    }
})();