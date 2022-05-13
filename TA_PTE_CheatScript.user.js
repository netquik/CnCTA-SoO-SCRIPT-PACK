// ==UserScript==
// @name        PTE_CheatScript
// @version     2022.05.11
// @author      leo7044 (https://github.com/leo7044)
// @contributor Netquik (https://github.com/netquik) Changes for browser extension include
// @description PTE_CheatScript
// @downloadURL https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_PTE_CheatScript.user.js
// @updateURL   https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_PTE_CheatScript.user.js
// @match     https://*.alliances.commandandconquer.com/320/index.aspx*
// @grant       none
// ==/UserScript==

(function () {
    var PTECheatMain = function ()
    {
        function PTECheatCreate()
        {
            console.log('PTE_CheatScript Loaded');
            try
            {
                var cheat_setcommandpoints = false;
                var cheat_resetmovecooldownpte = true;
                var cheat_repairallpte = false;
                var cheat_repairoff = false;
                var cheat_maxresources = false;
                function makeCheat()
                {
                    var bases = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d;
                    // var wishLevel = 65;
                    var i = 0;
                    // CP-Cheat
                    if (cheat_setcommandpoints && ClientLib.Data.MainData.GetInstance().get_Player().GetCommandPointCount() < 9999)
                    {
                        qx.core.Init.getApplication().getChat().getChatWidget().send("/cheat setcommandpoints 9999");
                    }
                    for (var key in bases)
                    {
                        // Basis verlegen
                        if (cheat_resetmovecooldownpte && bases[key].get_hasCooldown() === true)
                        {
                            qx.core.Init.getApplication().getChat().getChatWidget().send("/cheat resetmovecooldownpte");
                        }
                        // RepTime (Base)
                        if (cheat_repairallpte && !bases[key].get_IsGhostMode() && bases[key].GetFullConditionInPercent() < 100)
                        {
                            qx.core.Init.getApplication().getChat().getChatWidget().send("/cheat repairallpte " + i);
                        }
                        // RepTime (Off)
                        if (cheat_repairoff && !bases[key].get_IsGhostMode() && bases[key].GetOffenseConditionInPercent() < 100 && bases[key].get_LvlOffense() > 0)
                        {
                            qx.core.Init.getApplication().getChat().getChatWidget().send("/cheat repairoff " + key);
                        }
                        else if (!cheat_repairoff && !cheat_repairallpte && bases[key].get_CityRepairData().CanRepairAll(ClientLib.Vis.Mode.ArmySetup))
                        {
                            bases[key].get_CityRepairData().RepairAll(ClientLib.Vis.Mode.ArmySetup);
                        }
                        // maximale Ressourcen
                        if (cheat_maxresources && (bases[key].GetResourceCount(ClientLib.Base.EResourceType.Tiberium) < bases[key].GetResourceMaxStorage(ClientLib.Base.EResourceType.Tiberium) || bases[key].GetResourceCount(ClientLib.Base.EResourceType.Crystal) < bases[key].GetResourceMaxStorage(ClientLib.Base.EResourceType.Crystal) || bases[key].GetResourceCount(ClientLib.Base.EResourceType.Power) < bases[key].GetResourceMaxStorage(ClientLib.Base.EResourceType.Power)))
                        {
                            qx.core.Init.getApplication().getChat().getChatWidget().send("/cheat maxresources " + key);
                        }
                        // Pakete einsammeln
                        if (bases[key].get_CityBuildingsData().get_HasCollectableBuildings())
                        {
                            bases[key].CollectAllResources();
                        }
                        // Ressources
                        /*if (bases[key].get_LvlBase() < wishLevel && bases[key].GetBuildingSlotCount() == 40)
                            {
                                qx.core.Init.getApplication().getChat().getChatWidget().send("/cheat setlevelbasepte " + i + " " + wishLevel);
                            }
                            if (bases[key].get_LvlOffense() < wishLevel && bases[key].get_TotalOffenseHeadCount() == 200)
                            {
                                qx.core.Init.getApplication().getChat().getChatWidget().send("/cheat setleveloffensepte " + i + " " + wishLevel);
                            }
                            if (bases[key].get_LvlDefense() < wishLevel  && bases[key].get_TotalDefenseHeadCount() == 300)
                            {
                                qx.core.Init.getApplication().getChat().getChatWidget().send("/cheat setleveldefensepte " + i + " " + wishLevel);
                            }*/
                        i++;
                    }
                }
				window.setInterval(makeCheat, 1000);
            }
            catch(e)
            {
                console.log(e);
				window.setTimeout(PTECheatCreate, 1000);
            }
        }
        function LoadExtension()
        {
            try
            {
                if (typeof(qx)!='undefined')
                {
                    if (!!qx.core.Init.getApplication().getMenuBar())
                    {
                        //MOD Fix for extension script include
                        if (/320/.test(window.location.pathname))   PTECheatCreate();
                        else console.log('PTE_CheatScript Not Loaded (NOT PTE SERVER)');
                        return;
                    }
                }
            }
            catch (e)
            {
                if (console !== undefined) console.log(e);
                else if (window.opera) opera.postError(e);
                else GM_log(e);
            }
            window.setTimeout(LoadExtension, 1000);
        }
        LoadExtension();
    };
    function Inject()
    {
        if (window.location.pathname != ("/login/auth"))
        {
            var Script = document.createElement("script");
            Script.textContent = "(" + PTECheatMain.toString() + ")();";
            Script.type = "text/javascript";
            document.getElementsByTagName("head")[0].appendChild(Script);
        }
    }
    Inject();
})();
