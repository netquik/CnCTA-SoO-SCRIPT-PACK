// ==UserScript==
// @name infernal wrapper
// @description Supplies some wrapper functions for public use
// @downloadURL    https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_infernal_wrapper.user.js
// @updateURL      https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_infernal_wrapper.user.js
// @match          https://*.alliances.commandandconquer.com/*/index.aspx*
// @version 1.45
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
----------------
*/

(function () {
    var CCTAWrapper_main = function () {
        // 22.2 New Framework Fixes issue #9182: new unified pointer input model since Chrome 55
        if (parseFloat(GameVersion) < 22.2) window.navigator.pointerEnabled = "PointerEvent" in window;
        // see https://github.com/qooxdoo/qooxdoo/issues/9182

        try {
            _log = function () {
                if (typeof console != 'undefined') console.log(arguments);
                else if (window.opera) opera.postError(arguments);
                else GM_log(arguments);
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
                //this\.([a-zA-Z]+)=\(new \$I\.([a-zA-Z]+)\)\..+{this\.\1\.([a-zA-Z]+)\(false\)
                //ClientLib.Vis.Battleground.Battleground.prototype.StartBattle.toString()
                //Match 2 && 3
                /* for (var x in $I) {
                    for (var key in $I[x].prototype) {
                        if ($I[x].prototype.hasOwnProperty(key) && typeof ($I[x].prototype[key]) === 'function') { // reduced iterations from 20K to 12K
                            strFunction = $I[x].prototype[key].toString();
                            if (strFunction.indexOf("().l;var b;for (var d = 0 ; d < c.length ; d++){b = c[d];if((b.") > -1) {
                                $I[x].prototype.DoStep = $I[x].prototype[key];
                                console.log("SharedLib.Combat.CbtSimulation.prototype.DoStep = $I." + x + ".prototype." + key);
                                break;
                            }
                        }
                    }
                } */
                var subM = StartBattle_Source.match(/this\.([a-zA-Z]+)=\(new \$I\.([a-zA-Z]+)\)\..+{this\.\1\.([a-zA-Z]+)\((false|!1\))/);
                $I[subM[2]].prototype.DoStep = $I[subM[2]].prototype[subM[3]];
                console.log("SharedLib.Combat.CbtSimulation.prototype.DoStep = $I." + subM[2] + ".prototype." + subM[3]);
                /*// ClientLib.Data.CityRepair.prototype.CanRepair
                for (var key in ClientLib.Data.CityRepair.prototype) {
                    if (typeof ClientLib.Data.CityRepair.prototype[key] === 'function') {
                        strFunction = ClientLib.Data.CityRepair.prototype[key].toString();
                        if (strFunction.indexOf("DefenseSetup") > -1 && strFunction.indexOf("DamagedEntity") > -1) {  // order important to reduce iterations
                            ClientLib.Data.CityRepair.prototype.CanRepair = ClientLib.Data.CityRepair.prototype[key];
                            console.log("ClientLib.Data.CityRepair.prototype.CanRepair = ClientLib.Data.CityRepair.prototype." + key);
                            break;
                        }
                    }
                }
                // ClientLib.Data.CityRepair.prototype.UpdateCachedFullRepairAllCost
                for (var key in ClientLib.Data.CityRepair.prototype) {
                    if (typeof ClientLib.Data.CityRepair.prototype[key] === 'function') {
                        strFunction = ClientLib.Data.CityRepair.prototype[key].toString();
                        if (strFunction.indexOf("Type==7") > -1 && strFunction.indexOf("var a=0;if") > -1) {  // order important to reduce iterations
                            ClientLib.Data.CityRepair.prototype.UpdateCachedFullRepairAllCost = ClientLib.Data.CityRepair.prototype[key];
                            console.log("ClientLib.Data.CityRepair.prototype.UpdateCachedFullRepairAllCost = ClientLib.Data.CityRepair.prototype." + key);
                            break;
                        }
                    }
                }*/

                // ClientLib.Data.CityUnits.prototype.get_OffenseUnits edited by Netquik
                //strFunction = ClientLib.Data.CityUnits.prototype.HasUnitMdbId.toString();
                /*var searchString = "for(var b in {d:this.";
                var startPos = strFunction.indexOf(searchString) + searchString.length;
                var fn_name = strFunction.slice(startPos, startPos + 6);*/
                //var fn_name = strFunction.match(/for {0,1}\(var b in {d:this.([A-Z]{6})/)[1];
                var get_UnitsF = HasUnitMdbId_Source.match(/for ?\(.+[a-z]:this.([A-Z]{6}).+[a-z]:this.([A-Z]{6})/);

                var get_OffenseUnitsF = get_UnitsF[1];
                //strFunction = "var $createHelper;return this." + fn_name + ";";
                //var fn = Evil('', strFunction);
                /* var get_OffenseUnits = function(){
                    var $createHelper;
                    return this[get_OffenseUnitsF];
                } */
                //ClientLib.Data.CityUnits.prototype.get_OffenseUnits = fn;
                ClientLib.Data.CityUnits.prototype.get_OffenseUnits = function () {
                    return this[get_OffenseUnitsF];
                };
                //console.log("ClientLib.Data.CityUnits.prototype.get_OffenseUnits = function(){var $createHelper;return this." + fn_name + ";}");
                console.log("ClientLib.Data.CityUnits.prototype.get_OffenseUnits = function(){var $createHelper;return this." + get_OffenseUnitsF + ";}");

                // ClientLib.Data.CityUnits.prototype.get_DefenseUnits edited by Netquik
                //strFunction = ClientLib.Data.CityUnits.prototype.HasUnitMdbId.toString();
                /*searchString = "for(var c in {d:this.";
                startPos = strFunction.indexOf(searchString) + searchString.length;
                fn_name = strFunction.slice(startPos, startPos + 6);*/
                //var fn_name = strFunction.match(/for {0,1}\(var c in {d:this.([A-Z]{6})/)[1];

                var get__DefenseUnitsF = get_UnitsF[2];
                //strFunction = "var $createHelper;return this." + fn_name + ";";
                //var fn = Evil('', strFunction);
                //ClientLib.Data.CityUnits.prototype.get_DefenseUnits = fn;
                ClientLib.Data.CityUnits.prototype.get_DefenseUnits = function () {
                    return this[get__DefenseUnitsF];
                };
                //console.log("ClientLib.Data.CityUnits.prototype.get_DefenseUnits = function(){var $createHelper;return this." + fn_name + ";}");
                console.log("ClientLib.Data.CityUnits.prototype.get_DefenseUnits = function(){var $createHelper;return this." + get__DefenseUnitsF + ";}");
                // ClientLib.Vis.Battleground.Battleground.prototype.get_Simulation edited by Netquik
                //strFunction = ClientLib.Vis.Battleground.Battleground.prototype.StartBattle.toString();
                /*searchString = "=0;for(var a=0;(a<9);a++){this.";
                startPos = strFunction.indexOf(searchString) + searchString.length;
                fn_name = strFunction.slice(startPos, startPos + 6);*/
                //var regee = new RegExp(/=0;for\(var a=0; {0,1}\(a<9\); {0,1}a\+\+\){this.([A-Z]{6})/);
                //fn_name = strFunction.match(regee)[1];
                //strFunction = "return this." + fn_name + ";";
                //fn = Evil('', strFunction);
                //ClientLib.Vis.Battleground.Battleground.prototype.get_Simulation = fn;
                ClientLib.Vis.Battleground.Battleground.prototype.get_Simulation = function () {
                    return this[subM[1]];
                };
                //console.log("ClientLib.Vis.Battleground.Battleground.prototype.get_Simulation = function(){return this." + fn_name + ";}");
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
                if (typeof qx != 'undefined' && typeof webfrontend.phe != 'undefined')
                {
                // MOD FIX GLOBAL PHE for 22.3 PATCH
                window.phe = webfrontend.phe;
                    createCCTAWrapper();
                } else {
                    window.setTimeout(CCTAWrapper_checkIfLoaded, 500);
                }
            } catch (e) {
                CCTAWrapper_IsInstalled = false;
                console.log("CCTAWrapper_checkIfLoaded: ", e);
            }
        }

        if (/commandandconquer\.com/i.test(document.domain)) {
            window.setTimeout(CCTAWrapper_checkIfLoaded, 1000);
        }
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
