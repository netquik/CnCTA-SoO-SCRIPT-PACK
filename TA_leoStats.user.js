// ==UserScript==
// @name        leoStats
// @version     2018.06.05
// @author      leo7044 (https://github.com/leo7044)
// @homepage    https://leostats.000webhostapp.com/index.php
// @downloadURL https://leostats.000webhostapp.com/leostats.min.user.js
// @updateURL   https://leostats.000webhostapp.com/leostats.min.user.js
// @description Dieses Script überträgt eure Werte.
// @include     http*://prodgame*.alliances.commandandconquer.com/*/index.aspx*
// @include     http*://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @require		https://code.jquery.com/jquery-3.3.1.min.js
// @icon        https://leostats.000webhostapp.com/img/icon_32.png
// @grant       none
// ==/UserScript==


// Hinweise:
// Dieses Script befindet sich in der Beta-Phase
// Dieses Script ist für alle Welten freigeschaltet.
// Wenn ihr mit mir Kontakt aufnehmen wollt, schreibt mir eine Email: cc.ta.leo7044@gmail.com
// Das Script ist verschlüsselt, da ich Scriptmanipulationen ausschließen möchte. Wer der Sache misstraut: Es steht euch frei, mit mir Kontakt aufzunehmen.
// Ansonsten bleibt mir nur zu sagen: Viel Spaß!
(function () {
    var leoStatsMain = function ()
	{
		var sendChatInfoStatus = true;
        function leoStatsCreate()
		{
			// globale Variablen
			var linkToRoot = "https://leostats.000webhostapp.com/";
			var ObjectData = {};
			ObjectData.server = {};
			ObjectData.alliance = {};
			ObjectData.player = {};
			ObjectData.bases = [];
			ObjectData.substitution = {};
			ObjectData.substitution.incoming = [];
			ObjectData.substitution.outgoing = '';
			ObjectData.substitution.active = [];
			var linkBase = '';

            // Abschüsse
            function Shoots(context, data)
            {
				ObjectData.player.Shoot = data.bd;
				ObjectData.player.PvP = data.bd - data.bde;
				ObjectData.player.PvE = data.bde;
            }

			// CnC-Opt
			var Defense_unit_map = {
                /* GDI Defense Units */
                "GDI_Wall": "w",
                "GDI_Cannon": "c",
                "GDI_Antitank Barrier": "t",
                "GDI_Barbwire": "b",
                "GDI_Turret": "m",
                "GDI_Flak": "f",
                "GDI_Art Inf": "r",
                "GDI_Art Air": "e",
                "GDI_Art Tank": "a",
                "GDI_Def_APC Guardian": "g",
                "GDI_Def_Missile Squad": "q",
                "GDI_Def_Pitbull": "p",
                "GDI_Def_Predator": "d",
                "GDI_Def_Sniper": "s",
                "GDI_Def_Zone Trooper": "z",

                /* Nod Defense Units */
                "NOD_Def_Antitank Barrier": "t",
                "NOD_Def_Art Air": "e",
                "NOD_Def_Art Inf": "r",
                "NOD_Def_Art Tank": "a",
                "NOD_Def_Attack Bike": "p",
                "NOD_Def_Barbwire": "b",
                "NOD_Def_Black Hand": "z",
                "NOD_Def_Cannon": "c",
                "NOD_Def_Confessor": "s",
                "NOD_Def_Flak": "f",
                "NOD_Def_MG Nest": "m",
                "NOD_Def_Militant Rocket Soldiers": "q",
                "NOD_Def_Reckoner": "g",
                "NOD_Def_Scorpion Tank": "d",
                "NOD_Def_Wall": "w",
                "": ""
            };

            var offense_unit_map = {
                /* GDI Offense Units */
                "GDI_APC Guardian": "g",
                "GDI_Commando": "c",
                "GDI_Firehawk": "f",
                "GDI_Juggernaut": "j",
                "GDI_Kodiak": "k",
                "GDI_Mammoth": "m",
                "GDI_Missile Squad": "q",
                "GDI_Orca": "o",
                "GDI_Paladin": "a",
                "GDI_Pitbull": "p",
                "GDI_Predator": "d",
                "GDI_Riflemen": "r",
                "GDI_Sniper Team": "s",
                "GDI_Zone Trooper": "z",

                /* Nod Offense Units */
                "NOD_Attack Bike": "b",
                "NOD_Avatar": "a",
                "NOD_Black Hand": "z",
                "NOD_Cobra": "r",
                "NOD_Commando": "c",
                "NOD_Confessor": "s",
                "NOD_Militant Rocket Soldiers": "q",
                "NOD_Militants": "m",
                "NOD_Reckoner": "k",
                "NOD_Salamander": "l",
                "NOD_Scorpion Tank": "o",
                "NOD_Specter Artilery": "p",
                "NOD_Venom": "v",
                "NOD_Vertigo": "t",
                "": ""
            };

            function findTechLayout(city) {
                for (var k in city) {
                    //console.log(typeof(city[k]), "1.city[", k, "]", city[k])
                    if ((typeof (city[k]) == "object") && city[k] && 0 in city[k] && 8 in city[k]) {
                        if ((typeof (city[k][0]) == "object") && city[k][0] && city[k][0] && 0 in city[k][0] && 15 in city[k][0]) {
                            if ((typeof (city[k][0][0]) == "object") && city[k][0][0] && "BuildingIndex" in city[k][0][0]) {
                                return city[k];
                            }
                        }
                    }
                }
                return null;
            }

            function findBuildings(city) {
                var cityBuildings = city.get_CityBuildingsData();
                for (var k in cityBuildings) {
                    if (PerforceChangelist >= 376877) {
                        if ((typeof (cityBuildings[k]) === "object") && cityBuildings[k] && "d" in cityBuildings[k] && "c" in cityBuildings[k] && cityBuildings[k].c > 0) {
                            return cityBuildings[k].d;
                        }
                    } else {
                        if ((typeof (cityBuildings[k]) === "object") && cityBuildings[k] && "l" in cityBuildings[k]) {
                            return cityBuildings[k].l;
                        }
                    }
                }
            }

            function isOffenseUnit(unit) {
                return (unit.get_UnitGameData_Obj().n in offense_unit_map);
            }

            function isDefenseUnit(unit) {
                return (unit.get_UnitGameData_Obj().n in Defense_unit_map);
            }

            function getUnitArrays(city) {
                var ret = [];
                for (var k in city) {
                    if ((typeof (city[k]) == "object") && city[k]) {
                        for (var k2 in city[k]) {
                            if (PerforceChangelist >= 376877) {
                                if ((typeof (city[k][k2]) == "object") && city[k][k2] && "d" in city[k][k2]) {
                                    var lst = city[k][k2].d;
                                    if ((typeof (lst) == "object") && lst) {
                                        for (var i in lst) {
                                            if (typeof (lst[i]) == "object" && lst[i] && "get_CurrentLevel" in lst[i]) {
                                                ret.push(lst);
                                            }
                                        }
                                    }
                                }
                            } else {
                                if ((typeof (city[k][k2]) == "object") && city[k][k2] && "l" in city[k][k2]) {
                                    var lst = city[k][k2].l;
                                    if ((typeof (lst) == "object") && lst) {
                                        for (var i in lst) {
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
                var arr = getUnitArrays(city);
                for (var i = 0; i < arr.length; ++i) {
                    for (var j in arr[i]) {
                        if (isDefenseUnit(arr[i][j])) {
                            return arr[i];
                        }
                    }
                }
                return [];
            }

            function getOffenseUnits(city) {
                var arr = getUnitArrays(city);
                for (var i = 0; i < arr.length; ++i) {
                    for (var j in arr[i]) {
                        if (isOffenseUnit(arr[i][j])) {
                            return arr[i];
                        }
                    }
                }
                return [];
            }

			function CnCOpt()
			{
				var cncopt = {
					keymap: {
						/* GDI Buildings */
						"GDI_Accumulator": "a",
						"GDI_Refinery": "r",
						"GDI_Trade Center": "u",
						"GDI_Silo": "s",
						"GDI_Power Plant": "p",
						"GDI_Construction Yard": "y",
						"GDI_Airport": "d",
						"GDI_Barracks": "b",
						"GDI_Factory": "f",
						"GDI_Defense HQ": "q",
						"GDI_Defense Facility": "w",
						"GDI_Command Center": "e",
						"GDI_Support_Art": "z",
						"GDI_Support_Air": "x",
						"GDI_Support_Ion": "i",

						/* Forgotten Buildings */
						"FOR_Silo": "s",
						"FOR_Refinery": "r",
						"FOR_Tiberium Booster": "b",
						"FOR_Crystal Booster": "v",
						"FOR_Trade Center": "u",
						"FOR_Defense Facility": "w",
						"FOR_Construction Yard": "y",
						"FOR_EVENT_Construction Yard": "y",
						"FOR_Harvester_Tiberium": "h",
						"FOR_Defense HQ": "q",
						"FOR_Harvester_Crystal": "n",

						/* Nod Buildings */
						"NOD_Refinery": "r",
						"NOD_Power Plant": "p",
						"NOD_Harvester": "h",
						"NOD_Construction Yard": "y",
						"NOD_Airport": "d",
						"NOD_Trade Center": "u",
						"NOD_Defense HQ": "q",
						"NOD_Barracks": "b",
						"NOD_Silo": "s",
						"NOD_Factory": "f",
						"NOD_Harvester_Crystal": "n",
						"NOD_Command Post": "e",
						"NOD_Support_Art": "z",
						"NOD_Support_Ion": "i",
						"NOD_Accumulator": "a",
						"NOD_Support_Air": "x",
						"NOD_Defense Facility": "w",
						//"NOD_Tech Lab": "",
						//"NOD_Recruitment Hub": "X",
						//"NOD_Temple of Nod": "X",

						/* GDI Defense Units */
						"GDI_Wall": "w",
						"GDI_Cannon": "c",
						"GDI_Antitank Barrier": "t",
						"GDI_Barbwire": "b",
						"GDI_Turret": "m",
						"GDI_Flak": "f",
						"GDI_Art Inf": "r",
						"GDI_Art Air": "e",
						"GDI_Art Tank": "a",
						"GDI_Def_APC Guardian": "g",
						"GDI_Def_Missile Squad": "q",
						"GDI_Def_Pitbull": "p",
						"GDI_Def_Predator": "d",
						"GDI_Def_Sniper": "s",
						"GDI_Def_Zone Trooper": "z",

						/* Nod Defense Units */
						"NOD_Def_Antitank Barrier": "t",
						"NOD_Def_Art Air": "e",
						"NOD_Def_Art Inf": "r",
						"NOD_Def_Art Tank": "a",
						"NOD_Def_Attack Bike": "p",
						"NOD_Def_Barbwire": "b",
						"NOD_Def_Black Hand": "z",
						"NOD_Def_Cannon": "c",
						"NOD_Def_Confessor": "s",
						"NOD_Def_Flak": "f",
						"NOD_Def_MG Nest": "m",
						"NOD_Def_Militant Rocket Soldiers": "q",
						"NOD_Def_Reckoner": "g",
						"NOD_Def_Scorpion Tank": "d",
						"NOD_Def_Wall": "w",

						/* GDI Offense Units */
						"GDI_APC Guardian": "g",
						"GDI_Commando": "c",
						"GDI_Firehawk": "f",
						"GDI_Juggernaut": "j",
						"GDI_Kodiak": "k",
						"GDI_Mammoth": "m",
						"GDI_Missile Squad": "q",
						"GDI_Orca": "o",
						"GDI_Paladin": "a",
						"GDI_Pitbull": "p",
						"GDI_Predator": "d",
						"GDI_Riflemen": "r",
						"GDI_Sniper Team": "s",
						"GDI_Zone Trooper": "z",

						/* Nod Offense Units */
						"NOD_Attack Bike": "b",
						"NOD_Avatar": "a",
						"NOD_Black Hand": "z",
						"NOD_Cobra": "r",
						"NOD_Commando": "c",
						"NOD_Confessor": "s",
						"NOD_Militant Rocket Soldiers": "q",
						"NOD_Militants": "m",
						"NOD_Reckoner": "k",
						"NOD_Salamander": "l",
						"NOD_Scorpion Tank": "o",
						"NOD_Specter Artilery": "p",
						"NOD_Venom": "v",
						"NOD_Vertigo": "t",

						"<last>": "."
					},
					make_sharelink: function () {
						try {
							var city = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(BaseId);
							var own_city = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity();
							var alliance = ClientLib.Data.MainData.GetInstance().get_Alliance();
							var server = ClientLib.Data.MainData.GetInstance().get_Server();
							tbase = base;
							tcity = city;
							scity = own_city;
							var link = "http://cncopt.com/?map=3|";
							switch(Faction)
							{
								case 1:
									/* GDI */
									link += "G|G|";
									break;
								case 2:
									/* NOD */
									link += "N|N|";
									break;
							}
							link += Name + "|";
							Defense_units = [];
							for (var i = 0; i < 20; ++i) {
								var col = [];
								for (var j = 0; j < 9; ++j) {
									col.push(null);
								}
								Defense_units.push(col);
							}
							var Defense_unit_list = getDefenseUnits(city);
							if (PerforceChangelist >= 376877) {
								for (var i in Defense_unit_list) {
									var unit = Defense_unit_list[i];
									Defense_units[unit.get_CoordX()][unit.get_CoordY() + 8] = unit;
								}
							} else {
								for (var i = 0; i < Defense_unit_list.length; ++i) {
									var unit = Defense_unit_list[i];
									Defense_units[unit.get_CoordX()][unit.get_CoordY() + 8] = unit;
								}
							}

							offense_units = [];
							for (var i = 0; i < 20; ++i) {
								var col = [];
								for (var j = 0; j < 9; ++j) {
									col.push(null);
								}
								offense_units.push(col);
							}

							if (city.get_CityFaction() == 1 || city.get_CityFaction() == 2) {
								var offense_unit_list = getOffenseUnits(city);
							}
							else {
								var offense_unit_list = getOffenseUnits(own_city);
							}
							if (PerforceChangelist >= 376877) {
								for (var i in offense_unit_list) {
									var unit = offense_unit_list[i];
									offense_units[unit.get_CoordX()][unit.get_CoordY() + 16] = unit;
								}
							} else {
								for (var i = 0; i < offense_unit_list.length; ++i) {
									var unit = offense_unit_list[i];
									offense_units[unit.get_CoordX()][unit.get_CoordY() + 16] = unit;
								}
							}

							var techLayout = findTechLayout(city);
							var buildings = findBuildings(city);
							for (var i = 0; i < 20; ++i) {
								row = [];
								for (var j = 0; j < 9; ++j) {
									var spot = i > 16 ? null : techLayout[j][i];
									var level = 0;
									var building = null;
									if (spot && spot.BuildingIndex >= 0) {
										building = buildings[spot.BuildingIndex];
										level = building.get_CurrentLevel();
									}
									var Defense_unit = Defense_units[j][i];
									if (Defense_unit) {
										level = Defense_unit.get_CurrentLevel();
									}
									var offense_unit = offense_units[j][i];
									if (offense_unit) {
										level = offense_unit.get_CurrentLevel();
									}
									if (level > 1) {
										link += level;
									}

									switch (i > 16 ? 0 : city.GetResourceType(j, i)) {
										case 0:
											if (building) {
												var techId = building.get_MdbBuildingId();
												if (GAMEDATA.Tech[techId].n in cncopt.keymap) {
													link += cncopt.keymap[GAMEDATA.Tech[techId].n];
												} else {
													console.log("cncopt [5]: Unhandled building: " + techId, building);
													link += ".";
												}
											} else if (Defense_unit) {
												if (Defense_unit.get_UnitGameData_Obj().n in cncopt.keymap) {
													link += cncopt.keymap[Defense_unit.get_UnitGameData_Obj().n];
												} else {
													console.log("cncopt [5]: Unhandled unit: " + Defense_unit.get_UnitGameData_Obj().n);
													link += ".";
												}
											} else if (offense_unit) {
												if (offense_unit.get_UnitGameData_Obj().n in cncopt.keymap) {
													link += cncopt.keymap[offense_unit.get_UnitGameData_Obj().n];
												} else {
													console.log("cncopt [5]: Unhandled unit: " + offense_unit.get_UnitGameData_Obj().n);
													link += ".";
												}
											} else {
												link += ".";
											}
											break;
										case 1:
											/* Crystal */
											if (spot.BuildingIndex < 0) link += "c";
											else link += "n";
											break;
										case 2:
											/* Tiberium */
											if (spot.BuildingIndex < 0) link += "t";
											else link += "h";
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
										Default:
											console.log("cncopt [4]: Unhandled resource type: " + city.GetResourceType(j, i));
											link += ".";
											break;
									}
								}
							}
							/* Tack on our alliance bonuses */
							if (alliance && scity.get_AllianceId() == tcity.get_AllianceId()) {
								link += "|" + alliance.get_POITiberiumBonus();
								link += "|" + alliance.get_POICrystalBonus();
								link += "|" + alliance.get_POIPowerBonus();
								link += "|" + alliance.get_POIInfantryBonus();
								link += "|" + alliance.get_POIVehicleBonus();
								link += "|" + alliance.get_POIAirBonus();
								link += "|" + alliance.get_POIDefenseBonus();
							}
							if (server.get_TechLevelUpgradeFactorBonusAmount() != 1.20) {
								link += "|newEconomy";
							}
							linkBase = link;
						} catch (e) {
							console.log("cncopt [1]: ", e);
						}
					}
				};
				cncopt.make_sharelink();
			}

			// End CnC-Opt

			try
			{
				var AllianceId = ClientLib.Data.MainData.GetInstance().get_Alliance().get_Id();
				if (AllianceId > 0)
				{
					var WorldId = ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId();
					var ServerName = ClientLib.Data.MainData.GetInstance().get_Server().get_Name().trim();
					var SeasonServer = ClientLib.Data.MainData.GetInstance().get_Server().get_IsSeasonServer();
					// Alliance
					var AllianceName = ClientLib.Data.MainData.GetInstance().get_Alliance().get_Name();
					var AllianceRank = ClientLib.Data.MainData.GetInstance().get_Alliance().get_Rank();
					var AllianceEventRank = ClientLib.Data.MainData.GetInstance().get_Alliance().get_EventRank();
					var AllianceTotalScore = ClientLib.Data.MainData.GetInstance().get_Alliance().get_TotalScore();
					var AllianceAverageScore = ClientLib.Data.MainData.GetInstance().get_Alliance().get_AverageScore();
					var AllianceVeteranPoints = ClientLib.Data.MainData.GetInstance().get_Alliance().get_EventScore();
					var AllianceProdVetPoints = 0;
					try
					{
						for (i = 0; i < ClientLib.Data.MainData.GetInstance().get_Alliance().get_OwnShieldHubs().length; i++)
						{
							AllianceProdVetPoints += ClientLib.Data.MainData.GetInstance().get_Server().GetControlHubVeteranPointsProduction(ClientLib.Data.MainData.GetInstance().get_Alliance().get_OwnShieldHubs()[i].l);
						}
					}
					catch(e){}
					// Bonus
					var BonusTiberium = ClientLib.Data.MainData.GetInstance().get_Alliance().GetPOIBonusFromResourceType(ClientLib.Base.EResourceType.Tiberium);
					var BonusCrystal = ClientLib.Data.MainData.GetInstance().get_Alliance().GetPOIBonusFromResourceType(ClientLib.Base.EResourceType.Crystal);
					var BonusPower = ClientLib.Data.MainData.GetInstance().get_Alliance().GetPOIBonusFromResourceType(ClientLib.Base.EResourceType.Power);
					var BonusInfantrie = ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIInfantryBonus();
					var BonusVehicle = ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIVehicleBonus();
					var BonusAir = ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIAirBonus();
					var BonusDef = ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIDefenseBonus();
					var Ranks = ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIRankScore();
					var RankTib = Ranks[0].r;
					var RankCry = Ranks[1].r;
					var RankPow = Ranks[2].r;
					var RankInf = Ranks[3].r;
					var RankVeh = Ranks[4].r;
					var RankAir = Ranks[5].r;
					var RankDef = Ranks[6].r;
					var ScoreTib = Ranks[0].s;
					var ScoreCry = Ranks[1].s;
					var ScorePow = Ranks[2].s;
					var ScoreInf = Ranks[3].s;
					var ScoreVeh = Ranks[4].s;
					var ScoreAir = Ranks[5].s;
					var ScoreDef = Ranks[6].s;
					// Player
					var AccountId = ClientLib.Data.MainData.GetInstance().get_Player().get_AccountId();
					var PlayerName = ClientLib.Data.MainData.GetInstance().get_Player().get_Name();
					var PlayerScorePoints = ClientLib.Data.MainData.GetInstance().get_Player().get_ScorePoints();
					var PlayerRank = ClientLib.Data.MainData.GetInstance().get_Player().get_OverallRank();
					var PlayerEventRank = ClientLib.Data.MainData.GetInstance().get_Player().get_EventRank();
					var PlayerVeteranPoints = ClientLib.Data.MainData.GetInstance().get_Player().get_EventScore();
					var ResearchPoints = ClientLib.Data.MainData.GetInstance().get_Player().get_ResearchPoints();
					var Credits = ClientLib.Data.MainData.GetInstance().get_Player().get_Credits().Base;
					var Funds = ClientLib.Data.MainData.GetInstance().get_Inventory().get_PlayerFunds();
					var LegacyPoints = ClientLib.Data.MainData.GetInstance().get_Player().get_LegacyPoints();
					var CommandPointsMaxStorage = ClientLib.Data.MainData.GetInstance().get_Player().GetCommandPointMaxStorage();
					var CommandPointsCurrent = ClientLib.Data.MainData.GetInstance().get_Player().GetCommandPointCount();
					var Faction = ClientLib.Data.MainData.GetInstance().get_Player().get_Faction();
					var MemberRole = ClientLib.Data.MainData.GetInstance().get_Alliance().get_CurrentMemberRoleInfo().SortOrder;
					// Basen
					var bases = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d;
					var CountBases = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().c;
					var LvLSumBase = 0;
					var LvLSumOff = 0;
					var LvLSumDef = 0;
					var LvLHighestOff = 0;
					var LvLHighestDef = 0;
					var LvLSumDF = 0;
					var LvLSumSup = 0;
					var CountSup = 0;
					var ProductionTiberium = 0;
					var ProductionCrystal = 0;
					var ProductionPower = 0;
					var ProductionCredits = 0;
					var repairMaxTime = 0;
					for (var key in bases)
					{
						var base = bases[key];
						var LvLDF = 0;
						var BaseId = base.get_Id();
						var Name = base.get_Name();
						var LvLCY = base.get_ConstructionYardLevel();
						var LvLBase = base.get_LvlBase();
						var LvLOffense = base.get_LvlOffense();
						var LvLDefense = base.get_LvlDefense();
						if (base.GetResourceMaxStorage(ClientLib.Base.EResourceType.RepairChargeInf) > repairMaxTime)
						{
							repairMaxTime = base.GetResourceMaxStorage(ClientLib.Base.EResourceType.RepairChargeInf);
						}
						var repairCurrentTime = base.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeInf);
						var unitData = base.get_CityBuildingsData();
						var df = unitData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Defense_Facility);
						if (df !== null)
						{
							LvLDF = df.get_CurrentLevel();
							LvLSumDF += df.get_CurrentLevel();
						}
						LvLSumBase += base.get_LvlBase();
						LvLSumOff += base.get_LvlOffense();
						LvLSumDef += base.get_LvlDefense();
						if (base.get_LvlOffense() > LvLHighestOff)
						{
							LvLHighestOff = base.get_LvlOffense();
						}
						if (base.get_LvlDefense() > LvLHighestDef)
						{
							LvLHighestDef = base.get_LvlDefense();
						}
						var LvLSupport = 0;
						var SupArt = "";
						if (base.get_SupportData() !== null)
						{
							LvLSupport = base.get_SupportData().get_Level();
							SupArt = base.get_SupportWeapon().n.replace(/NOD_SUPPORT_/gi,"").replace(/GDI_SUPPORT_/gi,"").replace(/FOR_SUPPORT_/gi,"");
							LvLSumSup += base.get_SupportData().get_Level();
							CountSup++;
						}
						var TiberiumPerHour = parseInt(base.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Tiberium, false, false) + base.GetResourceBonusGrowPerHour(ClientLib.Base.EResourceType.Tiberium) + ClientLib.Data.MainData.GetInstance().get_Alliance().GetPOIBonusFromResourceType(ClientLib.Base.EResourceType.Tiberium));
						var CrystalPerHour = parseInt(base.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Crystal, false, false) + base.GetResourceBonusGrowPerHour(ClientLib.Base.EResourceType.Crystal) + ClientLib.Data.MainData.GetInstance().get_Alliance().GetPOIBonusFromResourceType(ClientLib.Base.EResourceType.Crystal));
						var PowerPerHour = parseInt(base.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Power, false, false) + base.GetResourceBonusGrowPerHour(ClientLib.Base.EResourceType.Power) + ClientLib.Data.MainData.GetInstance().get_Alliance().GetPOIBonusFromResourceType(ClientLib.Base.EResourceType.Power));
						var CreditsPerHour = parseInt(ClientLib.Base.Resource.GetResourceGrowPerHour(base.get_CityCreditsProduction(), false) + ClientLib.Base.Resource.GetResourceBonusGrowPerHour(base.get_CityCreditsProduction(), false));
						ProductionTiberium += TiberiumPerHour;
						ProductionCrystal += CrystalPerHour;
						ProductionPower += PowerPerHour;
						ProductionCredits += CreditsPerHour;
						// Basen
						var ObjectBase = {};
						ObjectBase.BaseId = BaseId;
						ObjectBase.Name = Name;
						ObjectBase.LvLCY = LvLCY;
						ObjectBase.LvLBase = LvLBase;
						ObjectBase.LvLOffense = LvLOffense;
						ObjectBase.LvLDefense = LvLDefense;
						ObjectBase.LvLDF = LvLDF;
						ObjectBase.LvLSupport = LvLSupport;
						ObjectBase.SupArt = SupArt;
						ObjectBase.TiberiumPerHour = TiberiumPerHour;
						ObjectBase.CrystalPerHour = CrystalPerHour;
						ObjectBase.PowerPerHour = PowerPerHour;
						ObjectBase.CreditsPerHour = CreditsPerHour;
						ObjectBase.CurrentRepairTime = repairCurrentTime;
						CnCOpt();
						ObjectBase.CnCOpt = linkBase;
						ObjectData.bases.push(ObjectBase);
						linkBase = '';
					}
					var AverageBase = LvLSumBase / CountBases;
					var AverageOff = LvLSumOff / CountBases;
					var AverageDef = LvLSumDef / CountBases;
					var AverageDF = LvLSumDF / CountBases;
					var AverageSup = LvLSumSup / CountBases;
					// Server
					ObjectData.server.WorldId = WorldId;
					ObjectData.server.ServerName = ServerName;
					ObjectData.server.SeasonServer = SeasonServer;
					// Alliance
					ObjectData.alliance.AllianceId = AllianceId;
					ObjectData.alliance.AllianceName = AllianceName;
					ObjectData.alliance.AllianceRank = AllianceRank;
					ObjectData.alliance.AllianceEventRank = AllianceEventRank;
					ObjectData.alliance.AllianceTotalScore = AllianceTotalScore;
					ObjectData.alliance.AllianceAverageScore = AllianceAverageScore;
					ObjectData.alliance.AllianceVeteranPoints = AllianceVeteranPoints;
					ObjectData.alliance.AllianceProdVetPoints = AllianceProdVetPoints;
					ObjectData.alliance.BonusTiberium = BonusTiberium;
					ObjectData.alliance.BonusCrystal = BonusCrystal;
					ObjectData.alliance.BonusPower = BonusPower;
					ObjectData.alliance.BonusInfantrie = BonusInfantrie;
					ObjectData.alliance.BonusVehicle = BonusVehicle;
					ObjectData.alliance.BonusAir = BonusAir;
					ObjectData.alliance.BonusDef = BonusDef;
					ObjectData.alliance.RankTib = RankTib;
					ObjectData.alliance.RankCry = RankCry;
					ObjectData.alliance.RankPow = RankPow;
					ObjectData.alliance.RankInf = RankInf;
					ObjectData.alliance.RankVeh = RankVeh;
					ObjectData.alliance.RankAir = RankAir;
					ObjectData.alliance.RankDef = RankDef;
					ObjectData.alliance.ScoreTib = ScoreTib;
					ObjectData.alliance.ScoreCry = ScoreCry;
					ObjectData.alliance.ScorePow = ScorePow;
					ObjectData.alliance.ScoreInf = ScoreInf;
					ObjectData.alliance.ScoreVeh = ScoreVeh;
					ObjectData.alliance.ScoreAir = ScoreAir;
					ObjectData.alliance.ScoreDef = ScoreDef;
					// Player
					ObjectData.player.AccountId = AccountId;
					ObjectData.player.PlayerName = PlayerName;
					ObjectData.player.PlayerScorePoints = PlayerScorePoints;
					ObjectData.player.CountBases = CountBases;
					ObjectData.player.CountSup = CountSup;
					ObjectData.player.PlayerRank = PlayerRank;
					ObjectData.player.PlayerEventRank = PlayerEventRank;
					ObjectData.player.PlayerVeteranPoints = PlayerVeteranPoints;
					ObjectData.player.ResearchPoints = ResearchPoints;
					ObjectData.player.Credits = Credits;
					ObjectData.player.Funds = Funds;
					ObjectData.player.LegacyPoints = LegacyPoints;
					ObjectData.player.CommandPointsMaxStorage = CommandPointsMaxStorage;
					ObjectData.player.CommandPointsCurrent = CommandPointsCurrent;
					ObjectData.player.Faction = Faction;
					ObjectData.player.MemberRole = MemberRole;
					ObjectData.player.LvLHighestOff = LvLHighestOff;
					ObjectData.player.LvLHighestDef = LvLHighestDef;
					ObjectData.player.AverageBase = AverageBase;
					ObjectData.player.AverageOff = AverageOff;
					ObjectData.player.AverageDef = AverageDef;
					ObjectData.player.AverageDF = AverageDF;
					ObjectData.player.AverageSup = AverageSup;
					ObjectData.player.ProductionTiberium = ProductionTiberium;
					ObjectData.player.ProductionCrystal = ProductionCrystal;
					ObjectData.player.ProductionPower = ProductionPower;
					ObjectData.player.ProductionCredits = ProductionCredits;
					ObjectData.player.MaxRepairTime = repairMaxTime;
					// Vertretung
					if (ClientLib.Data.MainData.GetInstance().get_PlayerSubstitution().getOutgoing())
					{
						ObjectData.substitution.outgoing = ClientLib.Data.MainData.GetInstance().get_PlayerSubstitution().getOutgoing().n;
					}
					var incomingSubs = ClientLib.Data.MainData.GetInstance().get_PlayerSubstitution().getIncoming();
					for (var i = 0; i < incomingSubs.length; i++)
					{
						ObjectData.substitution.incoming.push(incomingSubs[i].n);
					}
					var activeSubs = ClientLib.Data.MainData.GetInstance().get_PlayerSubstitution().getSubstitution();
					for (var i = 0; i < activeSubs.length; i++)
					{
						ObjectData.substitution.active.push(activeSubs[i].n);
					}
					// Abschüsse für Player
					ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("GetPublicPlayerInfoByName", {
						name : PlayerName
					}, phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, Shoots), null);
					// Anfrage absenden
					sendDataFromInGame();
					window.setTimeout(leoStatsCreate, 3600000);
				}
				else
				{
					window.setTimeout(leoStatsCreate, 1000);
				}
			}
			catch(e)
			{
				console.log(e);
			}

			function sendChatInfo(dataAnswer)
			{
				var ChatString = '';
				if (dataAnswer[0] == 0 && !ClientLib.Data.MainData.GetInstance().get_Player().get_IsSubstituted())
				{
					ChatString = "/w " + PlayerName + " Hallo " + PlayerName + ", um zu leoStats zu gelangen, klicke auf [url]" + linkToRoot + "[/url]. Dein Benutzername ist \"" + PlayerName + "\" und dein Standardpasswort: \"" + PlayerName + "_" + AccountId + "\"";
				}
				else
				{
					ChatString = "/w " + PlayerName + " Hallo " + PlayerName + ", um zu leoStats zu gelangen, klicke auf [url]" + linkToRoot + "[/url].";
				}
				qx.core.Init.getApplication().getChat().getChatWidget().send(ChatString);
			}

			function sendDataFromInGame()
			{
				if (ObjectData.player.Shoot != undefined)
				{
					var ObjectSend = {action:"sendDataFromInGame", ObjectData:ObjectData};
					$.post(linkToRoot + 'php/manageBackend.php', ObjectSend)
					.always(function(data)
					{
						if (sendChatInfoStatus)
						{
							sendChatInfo(data);
							sendChatInfoStatus = false;
						}
					});
				}
				else
				{
					setTimeout(sendDataFromInGame, 1000);
				}
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
                        leoStatsCreate();
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
            Script.innerHTML = "(" + leoStatsMain.toString() + ")();";
            Script.type = "text/javascript";
            document.getElementsByTagName("head")[0].appendChild(Script);
        }
    }
    Inject();
})();