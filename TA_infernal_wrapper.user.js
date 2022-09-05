// ==UserScript==
// @name infernal wrapper
// @description Supplies some wrapper functions for public use + some global fixes for all scripts
// @downloadURL    https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_infernal_wrapper.user.js
// @updateURL      https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_infernal_wrapper.user.js
// @match          https://*.alliances.commandandconquer.com/*/index.aspx*
// @version 1.47
// @author NetquiK (original code from infernal_me, KRS_L, krisan) - (https://github.com/netquik) (see first comment for changelog)
// ==/UserScript==

/* 
codes by NetquiK
----------------
- Recoded all for NOEVIL and removed iterations
- 22.2 New Framework Update
- 22.3 FIX
- 22.3 FIX
- !! FIX GLOBAL PHE for 22.3 PATCH !!
- OPERA BROWSER FULL SUPPORTED
- MISSING BLANK GIF FIX
----------------
*/

(function () {
    var CCTAWrapper_main = function () {
        var operafixed = false;
        try {
            _log = function () {
                if (typeof console != 'undefined') console.log(arguments);
                else if (window.opera) opera.postError(arguments);
                else GM_log(arguments);
            }

            function operafix() {
                // MOD OPERA BROWSER SUPPORT
                webfrontend.Application.prototype.checkBrowserSupport = function () {
                    var n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_PART,
                        t = parseFloat(qx.core.Environment.get("browser.version")),
                        i = parseFloat(qx.core.Environment.get("browser.documentmode"));
                    switch (qx.core.Environment.get('browser.name')) {
                        case 'opera':
                            t < 15 && (n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_NONE);
                            t >= 15 && (n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_OK);
                            break;
                        case 'firefox':
                            t < 3.6 && (n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_NONE);
                            t >= 4 && (n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_OK);
                            break;
                        case 'ie':
                            (t <= 9 || i <= 9) && (n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_NONE);
                            t >= 10 && (n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_OK);
                            break;
                        case 'chrome':
                            n = t < 14 ? webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_NONE : webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_OK;
                            break;
                        case 'safari':
                            n = t < 4 ? webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_NONE : webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_OK;
                            break;
                        case 'edge':
                            n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_OK
                    }
                    if (n == webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_OK && ClientLib.Draw.WebGL.SceneFactory.CheckWebGL() == -1 && (n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_NOGFX),
                        n == webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_OK) {
                        this.waitForAssetPreload();
                        return
                    }
                    (new webfrontend.gui.BadBrowserWindow).set({
                        BrowserMode: n
                    }).show()
                }
                console.log("FIX: OPERA BROWSER NOW SUPPORTED");
            }

            function blankfix() {
                // MOD BLANK GIF FIX
                qx.html.Image.prototype.resetSource = function () {
                    if ((qx.core.Environment.get("engine.name") == "webkit")) {
                        this._setProperty("source", "webfrontend/ui/common/blank.gif");
                    } else {
                        this._removeProperty("source", true);
                    };
                    return this;
                }
                console.log("FIX: MISSING BLANK GIF")
            }

            function phefix() {
                // MOD FIX GLOBAL PHE for 22.3 PATCH
                if (parseFloat(GameVersion) >= 22.3 && typeof webfrontend.phe != "undefined") window.phe = webfrontend.phe, console.log("FIX: PHE GLOBALIZED for Game Version " + GameVersion);
            }

            function createCCTAWrapper() {
                console.log('CCTAWrapper loaded');
                _log('wrapper loading' + PerforceChangelist);
                System = $I;
                SharedLib = $I;
                var strFunction;
                var StartBattle_Source = ClientLib.Vis.Battleground.Battleground.prototype.StartBattle.toString();
                var HasUnitMdbId_Source = ClientLib.Data.CityUnits.prototype.HasUnitMdbId.toString();
                //MOD Recoded all for NOEVIL and removed iterations by NetquiK
                // SharedLib.Combat.CbtSimulation.prototype.DoStep
                var subM = StartBattle_Source.match(/this\.([a-zA-Z]+)=\(new \$I\.([a-zA-Z]+)\)\..+{this\.\1\.([a-zA-Z]+)\((false|!1\))/);
                $I[subM[2]].prototype.DoStep = $I[subM[2]].prototype[subM[3]];
                console.log("SharedLib.Combat.CbtSimulation.prototype.DoStep = $I." + subM[2] + ".prototype." + subM[3]);

                // ClientLib.Data.CityUnits.prototype.get_OffenseUnits edited by Netquik
                var get_UnitsF = HasUnitMdbId_Source.match(/for ?\(.+[a-z]:this.([A-Z]{6}).+[a-z]:this.([A-Z]{6})/);

                var get_OffenseUnitsF = get_UnitsF[1];
                
                ClientLib.Data.CityUnits.prototype.get_OffenseUnits = function () {
                    return this[get_OffenseUnitsF];
                };
                
                console.log("ClientLib.Data.CityUnits.prototype.get_OffenseUnits = function(){var $createHelper;return this." + get_OffenseUnitsF + ";}");

                var get__DefenseUnitsF = get_UnitsF[2];   
                ClientLib.Data.CityUnits.prototype.get_DefenseUnits = function () {
                    return this[get__DefenseUnitsF];
                };
                
                console.log("ClientLib.Data.CityUnits.prototype.get_DefenseUnits = function(){var $createHelper;return this." + get__DefenseUnitsF + ";}");
                ClientLib.Vis.Battleground.Battleground.prototype.get_Simulation = function () {
                    return this[subM[1]];
                };
                console.log("ClientLib.Vis.Battleground.Battleground.prototype.get_Simulation = function(){return this." + subM[1] + ";}");
                // GetNerfBoostModifier
                if (typeof ClientLib.Vis.Battleground.Battleground.prototype.GetNerfAndBoostModifier == 'undefined') ClientLib.Vis.Battleground.Battleground.prototype.GetNerfAndBoostModifier = ClientLib.Base.Util.GetNerfAndBoostModifier;

                _log('wrapper loaded');
            }
        } catch (e) {
            console.log("createCCTAWrapper: ", e);
        }

        function CCTAWrapper_checkIfLoaded() {
            try {
                if (typeof webfrontend.Application != 'undefined' && !operafixed) {
                    operafix();
                    operafixed = true;
                }
                if (typeof qx != 'undefined') {
                    phefix();
                    blankfix();
                    createCCTAWrapper();
                } else {
                    window.setTimeout(CCTAWrapper_checkIfLoaded, 200);
                }
            } catch (e) {
                CCTAWrapper_IsInstalled = false;
                console.log("CCTAWrapper_checkIfLoaded: ", e);
            }
        }


        window.setTimeout(CCTAWrapper_checkIfLoaded, 200);

    }

    try {
        var CCTAWrapper = document.createElement("script");
        CCTAWrapper.textContent = "var CCTAWrapper_IsInstalled = true; (" + CCTAWrapper_main.toString() + ")();";
        CCTAWrapper.type = "text/javascript";
        if (/commandandconquer\.com/i.test(document.domain)) {
            document.getElementsByTagName("head")[0].appendChild(CCTAWrapper);
        }
    } catch (e) {
        console.log("CCTAWrapper: init error: ", e);
    }
})();