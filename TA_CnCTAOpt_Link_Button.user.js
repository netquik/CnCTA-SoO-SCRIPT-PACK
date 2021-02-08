// ==UserScript==
// @version       1.0.7.3
// @name          CnC:TA CnCTAOpt Link
// @namespace     http://cnctaopt.com/
// @icon          http://cnctaopt.com/favicon.ico
// @description   Creates a "CnCTAOpt" button when selecting a base in Command & Conquer: Tiberium Alliances. The share button takes you to http://cnctaopt.com/ and fills in the selected base information so you can analyze or share the base.
// @author        zbluebugz
// @include       http*://*alliances*.com/*
// @include       https://prodgame*.alliances.commandandconquer.com/*/index.aspx*
// @grant         GM_log
// @grant         GM_setValue
// @grant         GM_getValue
// @grant         GM_registerMenuCommand
// @grant         GM_xmlhttpRequest
// @grant         GM_updatingEnabled
// @grant         unsafeWindow
// @contributor   zbluebugz (https://github.com/zbluebugz)
// ==/UserScript==
/*
    Original script for cncopt.com contributed by:
        @contributor   PythEch (http://userscripts.org/users/220246)
        @contributor   jerbri (http://userscripts.org/users/507954)
        @contributor   leo7044 (https://github.com/leo7044)
    Cloned and modified for cnctaopt.com

    2021-01: zbluebugz; rewrote/adapated various parts for cnctaopt.com;

    ***
    TODO:
        Infected units - needs testing.
    ***
*/

try {
    unsafeWindow.__cnctaoptv3_version = "1.0.3";
    (function () {
        const cnctaopt_v3 = function () {
            // base / defense / offense - map units with cnctaopt's hotkeys.
            const base_unit_map = {
                /* GDI Buildings */
                "GDI_Construction Yard": "y",   // construction yard
                "GDI_Power Plant": "p",         // power plant
                "GDI_Refinery": "r",            // refinery
                // "GDI_Trade Center": "u",
                "GDI_Silo": "s",                // silo
                "GDI_Accumulator": "a",         // accumulator
                "GDI_Command Center": "e",      // command centre
                "GDI_Barracks": "b",            // barracks
                "GDI_Factory": "f",             // factory
                "GDI_Airport": "d",             // airport
                "GDI_Defense HQ": "q",          // defense hq
                "GDI_Defense Facility": "w",    // defense facility
                "GDI_Support_Air": "i",         // skystrike support
                "GDI_Support_Ion": "x",         // ion cannon support
                "GDI_Support_Art": "z",         // falcon support
                "GDI_Harvester": "h",           // harvester (not in url - must be on tiberium or crystal)
                "GDI_Harvester_Crystal": "n",   // harvester on crystal
                "GDI_Harvester_Tiberium": "j",   // harvester on tiberium

                /* Nod Buildings */
                "NOD_Construction Yard": "y",   // construction yard
                "NOD_Power Plant": "p",         // power plant
                "NOD_Refinery": "r",            // refinery
                // "NOD_Trade Center": "u",
                "NOD_Silo": "s",                // silo
                "NOD_Accumulator": "a",         // accumulator
                "NOD_Command Post": "e",        // command centre
                "NOD_Barracks": "b",            // hand of nod (barracks)
                "NOD_Factory": "f",             // war factory (factory)
                "NOD_Airport": "d",             // airfield / airport
                "NOD_Defense HQ": "q",          // defense hq
                "NOD_Defense Facility": "w",    // defense facility
                "NOD_Support_Air": "i",         // fist of kane
                "NOD_Support_Ion": "x",         // eye of kane
                "NOD_Support_Art": "z",         // blade of kane
                "NOD_Harvester": "h",           // harvester (not in url - must be on tiberium or crystal)
                "NOD_Harvester_Crystal": "n",   // harvester on crystal
                "NOD_Harvester_Tiberium": "j",  // harvester on tiberium

                /* Forgotten Buildings */
                "FOR_Construction Yard": "y",   // construction yard
                "FOR_Refinery": "r",            // refinery
                "FOR_Trade Center": "u",        // trade centre
                "FOR_Silo": "s",                // silo
                "FOR_Defense HQ": "q",          // defense hq
                "FOR_Defense Facility": "w",    // defense facility
                "FOR_Harvester_Crystal": "n",   // harvester on crystal
                "FOR_Harvester_Tiberium": "j",  // harvester on tiberium
                "FOR_Crystal Booster": "v",     // adv crystal silo (booster)
                "FOR_Tiberium Booster": "o",    // adv tiberium silo (booster)

                /* Forgotten Infected Buildings */
                "FOR_EVENT_Construction_Yard": "y",
                "FOR_GDI_Construction Yard": "y",   // construction yard
                "FOR_GDI_Power Plant": "p",         // power plant
                "FOR_GDI_Refinery": "r",            // refinery
                // "GDI_Trade Center": "u",
                "FOR_GDI_Silo": "s",                // silo
                "FOR_GDI_Accumulator": "a",         // accumulator
                "FOR_GDI_Command Center": "e",      // command centre
                "FOR_GDI_Barracks": "b",            // barracks
                "FOR_GDI_Factory": "f",             // factory
                "FOR_GDI_Airport": "d",             // airport
                "FOR_GDI_Defense HQ": "q",          // defense hq
                "FOR_GDI_Defense Facility": "w",    // defense facility
                "FOR_GDI_Support_Air": "i",         // skystrike support
                "FOR_GDI_Support_Ion": "x",         // ion cannon support
                "FOR_GDI_Support_Art": "z",         // falcon support
                "FOR_GDI_Harvester": "h",           // harvester (not in url - must be on tiberium or crystal)
                "FOR_GDI_Harvester_Crystal": "n",   // harvester on crystal
                "FOR_GDI_Harvester_Tiberium": "j",   // harvester on tiberium

                "FOR_NOD_Construction Yard": "y",   // construction yard
                "FOR_NOD_Power Plant": "p",         // power plant
                "FOR_NOD_Refinery": "r",            // refinery
                // "NOD_Trade Center": "u",
                "FOR_NOD_Silo": "s",                // silo
                "FOR_NOD_Accumulator": "a",         // accumulator
                "FOR_NOD_Command Post": "e",        // command centre
                "FOR_NOD_Barracks": "b",            // hand of nod (barracks)
                "FOR_NOD_Factory": "f",             // war factory (factory)
                "FOR_NOD_Airport": "d",             // airfield / airport
                "FOR_NOD_Defense HQ": "q",          // defense hq
                "FOR_NOD_Defense Facility": "w",    // defense facility
                "FOR_NOD_Support_Air": "i",         // fist of kane
                "FOR_NOD_Support_Ion": "x",         // eye of kane
                "FOR_NOD_Support_Art": "z",         // blade of kane
                "FOR_NOD_Harvester": "h",           // harvester (not in url - must be on tiberium or crystal)
                "FOR_NOD_Harvester_Crystal": "n",   // harvester on crystal
                "FOR_NOD_Harvester_Tiberium": "j",  // harvester on tiberium

                /* blanks */
                "": ""
            }

            const defense_unit_map = {
                /* GDI Defense Units */
                "GDI_Wall": "w",                // wall
                "GDI_Def_Predator": "d",        // predator
                "GDI_Turret": "m",              // mg nest
                "GDI_Def_Pitbull": "p",         // pitbull
                "GDI_Barbwire": "b",            // barbwire
                "GDI_Def_Zone Trooper": "z",    // zone trooper
                "GDI_Flak": "f",                // flak
                "GDI_Def_Missile Squad": "q",   // missile squad
                "GDI_Antitank Barrier": "t",    // anti-tank barrier
                "GDI_Def_Sniper": "s",          // sniper team
                "GDI_Cannon": "c",              // guardian cannon
                "GDI_Def_APC Guardian": "g",    // guardian
                "GDI_Art Tank": "a",            // titan artillery (anti vehicle)
                "GDI_Art Air": "e",             // sam site (anti air)
                "GDI_Art Inf": "r",             // watchtower (anti infantry)

                /* Nod Defense Units */
                "NOD_Def_Wall": "w",            // wall
                "NOD_Def_Scorpion Tank": "d",   // scorpion
                "NOD_Def_MG Nest": "m",         // mg nest
                "NOD_Def_Attack Bike": "p",     // attack bike
                "NOD_Def_Barbwire": "b",        // barbwire
                "NOD_Def_Black Hand": "z",      // black hand
                "NOD_Def_Flak": "f",            // flak
                "NOD_Def_Militant Rocket Soldiers": "q",    // militant rocket squad
                "NOD_Def_Antitank Barrier": "t",    // anti-tank barrier
                "NOD_Def_Confessor": "s",       // confessor
                "NOD_Def_Cannon": "c",          // beam cannon
                "NOD_Def_Reckoner": "g",        // reckoner
                "NOD_Def_Art Tank": "a",        // obelisk artillery (anti vehicle)
                "NOD_Def_Art Air": "e",         // sam site (anti air)
                "NOD_Def_Art Inf": "r",         // gatling cannon

                /* Forgotten Defense Units */
                "FOR_Wall": "w",                // wall
                "FOR_Mammoth": "d",             // mammoth
                "FOR_Turret_VS_Inf": "m",       // mg nest
                "FOR_Veh_VS_Air": "p",          // scrap bus
                "FOR_Barbwire_VS_Inf": "b",     // barbwire
                "FOR_Inf_VS_Veh": "z",          // rocket fist
                "FOR_Turret_VS_Air": "f",       // flak
                "FOR_Inf_VS_Air": "q",          // missile squad
                "FOR_Barrier_VS_Veh": "t",      // anti-tank barrier
                "FOR_Sniper": "s",              // sniper team
                "FOR_Turret_VS_Veh": "c",       // buster
                "FOR_Veh_VS_Inf": "g",          // bowler
                "FOR_Turret_VS_Veh_ranged": "a", // demolisher artillery  (anti vehicle)
                "FOR_Turret_VS_Air_ranged": "e", // sam site (anti air)
                "FOR_Turret_VS_Inf_ranged": "r", // reaper artillery (anti infantry)
                // extras
                "FOR_Inf_VS_Inf": "i",          // forgotten (anti infantry)
                "FOR_Veh_VS_Veh": "o",          // scooper (anti vehicle)

                /* Forgotten Fortress Defense Units (50+?) */
                "FOR_Fortress_DEF_Sniper": "s",
                "FOR_Fortress_DEF_Inf_VS_Inf": "i",
                "FOR_Fortress_DEF_Veh_VS_Air": "p",
                "FOR_Fortress_DEF_Turret_VS_Inf": "m",
                "FOR_Fortress_DEF_Turret_VS_Veh": "c",
                "FOR_Fortress_DEF_Turret_VS_Air": "f",
                "FOR_Fortress_DEF_Turret_VS_Veh_ranged": "a",
                "FOR_Fortress_DEF_Turret_VS_Air_ranged": "e",
                "FOR_Fortress_DEF_Turret_VS_Inf_ranged": "r",
                "FOR_Fortress_DEF_Mammoth": "d",

                /* Forgotten Infected GDI Defense Units */
                "FOR_GDI_Wall": "w",                // wall
                "FOR_GDI_Def_Predator": "d",        // predator
                "FOR_GDI_Turret": "m",              // mg nest
                "FOR_GDI_Def_Pitbull": "p",         // pitbull
                "FOR_GDI_Barbwire": "b",            // barbwire
                "FOR_GDI_Def_Zone Trooper": "z",    // zone trooper
                "FOR_GDI_Flak": "f",                // flak
                "FOR_GDI_Def_Missile Squad": "q",   // missile squad
                "FOR_GDI_Antitank Barrier": "t",    // anti-tank barrier
                "FOR_GDI_Def_Sniper": "s",          // sniper team
                "FOR_GDI_Cannon": "c",              // guardian cannon
                "FOR_GDI_Def_APC Guardian": "g",    // guardian
                "FOR_GDI_Art Tank": "a",            // titan artillery (anti vehicle)
                "FOR_GDI_Art Air": "e",             // sam site (anti air)
                "FOR_GDI_Art Inf": "r",             // watchtower (anti infantry)

                /* Forgotten Infected NOD Defense Units */
                "FOR_NOD_Def_Wall": "w",            // wall
                "FOR_NOD_Def_Scorpion Tank": "d",   // scorpion
                "FOR_NOD_Def_MG Nest": "m",         // mg nest
                "FOR_NOD_Def_Attack Bike": "p",     // attack bike
                "FOR_NOD_Def_Barbwire": "b",        // barbwire
                "FOR_NOD_Def_Black Hand": "z",      // black hand
                "FOR_NOD_Def_Flak": "f",            // flak
                "FOR_NOD_Def_Militant Rocket Soldiers": "q",    // militant rocket squad
                "FOR_NOD_Def_Antitank Barrier": "t",    // anti-tank barrier
                "FOR_NOD_Def_Confessor": "s",       // confessor
                "FOR_NOD_Def_Cannon": "c",          // beam cannon
                "FOR_NOD_Def_Reckoner": "g",        // reckoner
                "FOR_NOD_Def_Art Tank": "a",        // obelisk artillery (anti vehicle)
                "FOR_NOD_Def_Art Air": "e",         // sam site (anti air)
                "FOR_NOD_Def_Art Inf": "r",         // gatling cannon

                /* blanks */
                "": ""
            };

            const offense_unit_map = {
                /* GDI Offense Units */
                "GDI_Riflemen": "i",            // rifleman squad
                "GDI_Missile Squad": "q",       // missile squad
                "GDI_Zone Trooper": "z",        // zone troooper
                "GDI_Commando": "c",            // commando
                "GDI_Sniper Team": "s",         // sniper team
                "GDI_APC Guardian": "g",        // guardian
                "GDI_Pitbull": "p",             // pitbull
                "GDI_Predator": "d",            // predator
                "GDI_Juggernaut": "j",          // juggernaut
                "GDI_Mammoth": "a",             // mammoth
                "GDI_Orca": "v",                // orca
                "GDI_Firehawk": "f",            // firehawk
                "GDI_Paladin": "o",             // paladin
                "GDI_Kodiak": "k",              // kodiak

                /* Nod Offense Units */
                "NOD_Militants": "i",           // militants
                "NOD_Militant Rocket Soldiers": "q", // militant rocket squad
                "NOD_Black Hand": "z",          // black hand
                "NOD_Commando": "c",            // commando
                "NOD_Confessor": "s",           // confessor
                "NOD_Reckoner": "g",            // reckoner
                "NOD_Attack Bike": "p",         // attack bike
                "NOD_Scorpion Tank": "d",       // scorpion
                "NOD_Specter Artilery": "j",    // specter
                "NOD_Avatar": "a",              // avatar
                "NOD_Venom": "v",               // venom
                "NOD_Vertigo": "f",             // vertigo
                "NOD_Cobra": "o",               // cobra
                "NOD_Salamander": "k",          // salamander

                /* blanks */
                "": ""
            };

            function findTechLayout(city) {
                for (let k in city) {
                    if ((typeof (city[k]) == "object") && city[k] && (0 in city[k]) && (8 in city[k])) {
                        if ((typeof (city[k][0]) == "object") && city[k][0] && (0 in city[k][0]) && (15 in city[k][0])) {
                            if ((typeof (city[k][0][0]) == "object") && city[k][0][0] && ("BuildingIndex" in city[k][0][0])) {
                                //console.info("-- findTechLayout:", city[k]);
                                return city[k];
                            }
                        }
                    }
                }
                return null;
            }

            function findBuildings(city) {
                let cityBuildings = city.get_CityBuildingsData();
                for (let k in cityBuildings) {
                    if (PerforceChangelist >= 376877) {
                        if ((typeof (cityBuildings[k]) === "object") && cityBuildings[k] && ("d" in cityBuildings[k]) && ("c" in cityBuildings[k]) && (cityBuildings[k].c > 0)) {
                            //console.info("-- findBuildings(1):", cityBuildings[k].d);
                            return cityBuildings[k].d;
                        }
                    }
                    else {
                        if ((typeof (cityBuildings[k]) === "object") && cityBuildings[k] && "l" in cityBuildings[k]) {
                            //console.info("-- findBuildings(2):", cityBuildings[k].l);
                            return cityBuildings[k].l;
                        }
                    }
                }
            }

            function isDefenseUnit(unit) {
                //console.info("-- isDefenseUnits:", unit.get_UnitGameData_Obj().n);
                return (unit.get_UnitGameData_Obj().n in defense_unit_map);
            }

            function isOffenseUnit(unit) {
                //console.info("-- isOffenseUnits:", unit.get_UnitGameData_Obj().n);
                return (unit.get_UnitGameData_Obj().n in offense_unit_map);
            }

            function getUnitArrays(city) {
                let ret = [];
                for (let k in city) {
                    if ((typeof (city[k]) == "object") && city[k]) {
                        for (let k2 in city[k]) {
                            if (PerforceChangelist >= 376877) {
                                if ((typeof (city[k][k2]) == "object") && city[k][k2] && "d" in city[k][k2]) {
                                    let lst = city[k][k2].d;
                                    if ((typeof (lst) == "object") && lst) {
                                        for (let i in lst) {
                                            if (typeof (lst[i]) == "object" && lst[i] && "get_CurrentLevel" in lst[i]) {
                                                ret.push(lst);
                                            }
                                        }
                                    }
                                }
                            }
                            else {
                                if ((typeof (city[k][k2]) == "object") && city[k][k2] && "l" in city[k][k2]) {
                                    let lst = city[k][k2].l;
                                    if ((typeof (lst) == "object") && lst) {
                                        for (let i in lst) {
                                            if (typeof (lst[i]) == "object" && lst[i] && "get_CurrentLevel" in lst[i]) {
                                                ret.push(lst);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                return ret;
            }

            function getDefenseUnits(city) {
                let arr = getUnitArrays(city);
                //console.info("-- getDefenseUnits:", arr);
                for (let i = 0; i < arr.length; ++i) {
                    for (let j in arr[i]) {
                        if (isDefenseUnit(arr[i][j])) {
                            return arr[i];
                        }
                    }
                }
                return [];
            }

            function getOffenseUnits(city) {
                let arr = getUnitArrays(city);
                for (let i = 0; i < arr.length; ++i) {
                    for (let j in arr[i]) {
                        if (isOffenseUnit(arr[i][j])) {
                            return arr[i];
                        }
                    }
                }
                return [];
            }


            function cnctaopt3_create() {
                console.log("CnCTAOpt Link Button v" + window.__cnctaoptv3_version + " loaded");
                const cnctaopt = {
                    selected_base: null,
                    make_sharelink: function () {
                        try {
                            let selected_base = cnctaopt.selected_base;
                            let city_id = selected_base.get_Id();
                            let city = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(city_id);
                            let own_city = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity();
                            let server = ClientLib.Data.MainData.GetInstance().get_Server();
                            let coordX = city.get_X();
                            let coordY = city.get_Y();
                            let worldName = server.get_Name().trim();
                            let worldId = server.get_WorldId();
                            let maxLevel = server.get_PlayerUpgradeCap();
                            let economy = (server.get_TechLevelUpgradeFactorBonusAmount() != 1.20) ? "new" : "old";
                            //console.log("Target City: ", city);
                            //console.log("Own City: ", own_city);
                            // buid link..
                            // (ver)sion = cnctaopt's codebase version #3.
                            let link = "ver=3~";
                            // base and defense faction (of base being viewed)
                            let faction = city.get_CityFaction();
                            if (faction === 1) {
                                link += "G~";   // GDI
                            }
                            else if (faction === 2) {
                                link += "N~";   // NOD
                            }
                            else if (faction > 2 && faction < 9) {
                                // 3: FOR faction, unseen, but in GAMEDATA
                                // 4, 5, 6, 8: Forgotten base, camp, outpost, infected camp
                                link += "F~";
                            }
                            else {
                                console.log("cnctaopt: Unknown faction (1): " + faction);
                                link += "E~";
                            }
                            // offense faction
                            // - if viewing another player's base, get their offense setup
                            // - if view forgotton, get player's offense setup.
                            faction = city.get_CityFaction();
                            if (faction > 2) {
                                faction = own_city.get_CityFaction();
                            }
                            if (faction === 1) {
                                link += "G~";   // GDI
                            }
                            else if (faction === 2) {
                                link += "N~";   // NOD
                            }
                            else {
                                console.log("cnctaopt: Unknown faction (2): " + faction);
                                link += "E~";
                            }
                            // city's name
                            link += city.get_Name().trim() + "~";

                            // create an empty 2d array for defense units
                            let defense_units = [];
                            for (let i = 0; i < 20; ++i) {
                                let col = [];
                                for (let j = 0; j < 9; ++j) {
                                    col.push(null);
                                }
                                defense_units.push(col);
                            }
                            // populate the defense units array
                            let defense_unit_list = getDefenseUnits(city);
                            if (PerforceChangelist >= 376877) {
                                for (let i in defense_unit_list) {
                                    let unit = defense_unit_list[i];
                                    defense_units[unit.get_CoordX()][unit.get_CoordY() + 8] = unit;
                                }
                            } else {
                                for (let i = 0; i < defense_unit_list.length; ++i) {
                                    let unit = defense_unit_list[i];
                                    defense_units[unit.get_CoordX()][unit.get_CoordY() + 8] = unit;
                                }
                            }
                            // create empty array for offense units
                            let offense_units = [];
                            for (let i = 0; i < 20; ++i) {
                                let col = [];
                                for (let j = 0; j < 9; ++j) {
                                    col.push(null);
                                }
                                offense_units.push(col);
                            }
                            // populate the offense units array
                            let offense_unit_list;
                            if (city.get_CityFaction() == 1 || city.get_CityFaction() == 2) {
                                // another player's base
                                offense_unit_list = getOffenseUnits(city);
                            }
                            else {
                                // player's base (viewing Forgotten base/camp/outpost/infected)
                                offense_unit_list = getOffenseUnits(own_city);
                            }
                            if (PerforceChangelist >= 376877) {
                                for (let i in offense_unit_list) {
                                    let unit = offense_unit_list[i];
                                    offense_units[unit.get_CoordX()][unit.get_CoordY() + 16] = unit;
                                }
                            } else {
                                for (let i = 0; i < offense_unit_list.length; ++i) {
                                    let unit = offense_unit_list[i];
                                    offense_units[unit.get_CoordX()][unit.get_CoordY() + 16] = unit;
                                }
                            }
                            // base ...
                            let techLayout = findTechLayout(city);
                            let buildings = findBuildings(city);
                            for (let i = 0; i < 20; ++i) {
                                let row = [];
                                for (let j = 0; j < 9; ++j) {
                                    let spot = i > 16 ? null : techLayout[j][i];
                                    let level = 0;
                                    let building = null;
                                    if (spot && spot.BuildingIndex >= 0) {
                                        building = buildings[spot.BuildingIndex];
                                        level = building.get_CurrentLevel();
                                    }
                                    let defense_unit = defense_units[j][i];
                                    if (defense_unit) {
                                        level = defense_unit.get_CurrentLevel();
                                    }
                                    let offense_unit = offense_units[j][i];
                                    if (offense_unit) {
                                        level = offense_unit.get_CurrentLevel();
                                    }
                                    if (level > 0) {
                                        link += level;
                                    }

                                    switch (i > 16 ? 0 : city.GetResourceType(j, i)) {
                                        case 0:
                                            if (building) {
                                                let techId = building.get_MdbBuildingId();
                                                if (GAMEDATA.Tech[techId].n in base_unit_map) {
                                                    link += base_unit_map[GAMEDATA.Tech[techId].n];
                                                } else {
                                                    console.log("cnctaopt [5b]: Unhandled building: " + techId, building);
                                                    link += ".";
                                                }
                                            } else if (defense_unit) {
                                                if (defense_unit.get_UnitGameData_Obj().n in defense_unit_map) {
                                                    link += defense_unit_map[defense_unit.get_UnitGameData_Obj().n];
                                                } else {
                                                    console.log("cnctaopt [5d]: Unhandled unit: " + defense_unit.get_UnitGameData_Obj().n);
                                                    link += ".";
                                                }
                                            } else if (offense_unit) {
                                                if (offense_unit.get_UnitGameData_Obj().n in offense_unit_map) {
                                                    link += offense_unit_map[offense_unit.get_UnitGameData_Obj().n];
                                                } else {
                                                    console.log("cnctaopt [5o]: Unhandled unit: " + offense_unit.get_UnitGameData_Obj().n);
                                                    link += ".";
                                                }
                                            } else {
                                                link += ".";
                                            }
                                            break;
                                        case 1:
                                            /* Crystal ... < 0 means no harvester */
                                            link += (spot.BuildingIndex < 0) ? "c" : "n";
                                            break;
                                        case 2:
                                            /* Tiberium .. < 0 means no harvester */
                                            link += (spot.BuildingIndex < 0) ? "t" : "j";
                                            break;
                                        case 4:
                                            /* Woods */
                                            link += "j";
                                            break;
                                        case 5:
                                            /* Scrub */
                                            link += "h";
                                            break;
                                        case 6:
                                            /* Oil */
                                            link += "l";
                                            break;
                                        case 7:
                                            /* Swamp */
                                            link += "k";
                                            break;
                                        default:
                                            console.log("cnctaopt [4]: Unhandled resource type: " + city.GetResourceType(j, i));
                                            link += ".";
                                            break;
                                    }
                                }
                            }

                            link += "~E=" + economy;

                            // console.log("cnctaopt: get_TechLevelUpgradeFactorBonusAmount = ", server.get_TechLevelUpgradeFactorBonusAmount());
                            // window.server = server;
                            // append base's coords to link
                            link += "~X=" + coordX + "~Y=" + coordY;
                            // append world id and world name
                            link += "~WID=" + worldId;
                            link += "~WN=" + worldName;
                            // append world's maximum level
                            link += "~ML=" + maxLevel;
                            link = "http://www.cnctaopt.com/index.html?" + encodeURI(link);
                            // console.log(link);
                            window.open(link, "_blank");
                        } catch (e) {
                            console.log("cnctaopt [1]: ", e);
                        }
                    }
                };
                if (!webfrontend.gui.region.RegionCityMenu.prototype.__cnctaopt_real_showMenu) {
                    webfrontend.gui.region.RegionCityMenu.prototype.__cnctaopt_real_showMenu = webfrontend.gui.region.RegionCityMenu.prototype.showMenu;
                }

                let check_ct = 0;
                let check_timer = null;
                let button_enabled = 123456;
                /* Wrap showMenu so we can inject our Sharelink at the end of menus and
                * sync Base object to our cnctaopt.selected_base variable  */
                webfrontend.gui.region.RegionCityMenu.prototype.showMenu = function (selected_base) {
                    try {
                        let self = this;
                        //console.log(selected_base);
                        cnctaopt.selected_base = selected_base;
                        if (this.__cnctaopt_initialized != 1) {
                            this.__cnctaopt_initialized = 1;
                            this.__cnctaopt_links = [];
                            for (let i in this) {
                                try {
                                    if (this[i] && this[i].basename == "Composite") {
                                        // let link = new qx.ui.form.Button("CnCTAOpt", "http://cnctaopt.com/favicon.ico");
                                        let link = new qx.ui.form.Button("CnCTAOpt");
                                        link.addListener("execute", function () {
                                            let bt = qx.core.Init.getApplication();
                                            bt.getBackgroundArea().closeCityInfo();
                                            cnctaopt.make_sharelink();
                                        });
                                        this[i].add(link);
                                        this.__cnctaopt_links.push(link);
                                    }
                                } catch (e) {
                                    console.log("cnctaopt [2]: ", e);
                                }
                            }
                        }
                        let tf = false;
                        switch (selected_base.get_VisObjectType()) {
                            case ClientLib.Vis.VisObject.EObjectType.RegionCityType:
                                switch (selected_base.get_Type()) {
                                    case ClientLib.Vis.Region.RegionCity.ERegionCityType.Own:
                                        tf = true;
                                        break;
                                    case ClientLib.Vis.Region.RegionCity.ERegionCityType.Alliance:
                                    case ClientLib.Vis.Region.RegionCity.ERegionCityType.Enemy:
                                        tf = true;
                                        break;
                                }
                                break;
                            case ClientLib.Vis.VisObject.EObjectType.RegionGhostCity:
                                tf = false;
                                console.log("cnctaopt: Ghost City selected.. ignoring because we don't know what to do here");
                                break;
                            case ClientLib.Vis.VisObject.EObjectType.RegionNPCBase:
                                tf = true;
                                break;
                            case ClientLib.Vis.VisObject.EObjectType.RegionNPCCamp:
                                tf = true;
                                break;
                        }

                        let orig_tf = tf;

                        function check_if_button_should_be_enabled() {
                            try {
                                tf = orig_tf;
                                let selected_base = cnctaopt.selected_base;
                                let still_loading = false;
                                if (check_timer !== null) {
                                    clearTimeout(check_timer);
                                }

                                /* When a city is selected, the data for the city is loaded in the background.. once the
                                * data arrives, this method is called again with these fields set, but until it does
                                * we can't actually generate the link.. so this section of the code grays out the button
                                * until the data is ready, then it'll light up. */
                                if (selected_base && selected_base.get_Id) {
                                    let city_id = selected_base.get_Id();
                                    let city = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(city_id);
                                    //if (!city || !city.m_CityUnits || !city.m_CityUnits.m_DefenseUnits) {
                                    //console.log("City", city);
                                    //console.log("get_OwnerId", city.get_OwnerId());
                                    if (!city || city.get_OwnerId() === 0) {
                                        still_loading = true;
                                        tf = false;
                                    }
                                } else {
                                    tf = false;
                                }
                                if (tf != button_enabled) {
                                    button_enabled = tf;
                                    for (let i = 0; i < self.__cnctaopt_links.length; ++i) {
                                        self.__cnctaopt_links[i].setEnabled(tf);
                                    }
                                }
                                if (!still_loading) {
                                    check_ct = 0;
                                } else {
                                    if (check_ct > 0) {
                                        check_ct--;
                                        check_timer = setTimeout(check_if_button_should_be_enabled, 100);
                                    } else {
                                        check_timer = null;
                                    }
                                }
                            } catch (e) {
                                console.log("cnctaopt [3]: ", e);
                                tf = false;
                            }
                        }

                        check_ct = 50;
                        check_if_button_should_be_enabled();
                    } catch (e) {
                        console.log("cnctaopt [3]: ", e);
                    }
                    this.__cnctaopt_real_showMenu(selected_base);
                };
            }

            /* Nice load check (ripped from AmpliDude's LoU Tweak script) */
            function cnc_check_if_loaded3() {
                try {
                    if (typeof qx != 'undefined') {
                        let a = qx.core.Init.getApplication(); // application
                        if (a) {
                            cnctaopt3_create();
                        } else {
                            window.setTimeout(cnc_check_if_loaded3, 1000);
                        }
                    } else {
                        window.setTimeout(cnc_check_if_loaded3, 1000);
                    }
                } catch (e) {
                    if (typeof console != 'undefined') console.log(e);
                    else if (window.opera) opera.postError(e);
                    else GM_log(e);
                }
            }
            if (/commandandconquer\.com/i.test(document.domain)) {
                window.setTimeout(cnc_check_if_loaded3, 1000);
            }
        };

        // injecting because we can't seem to hook into the game interface via unsafeWindow
        //   (Ripped from AmpliDude's LoU Tweak script)
        let script_block = document.createElement("script");
        script_block.type = "text/javascript";
        script_block.innerHTML = "(" + cnctaopt_v3.toString() + ")();";
        if (/commandandconquer\.com/i.test(document.domain)) {
            document.getElementsByTagName("head")[0].appendChild(script_block);
        }
    })();
} catch (e) {
    GM_log(e);
}

/*
End of CnCTAOpt Link Button
*/
