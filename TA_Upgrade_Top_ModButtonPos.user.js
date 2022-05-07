// ==UserScript==
// @name           Tiberium Alliances Upgrade Top (ModButtonPos)
// @version        0.9.2
// @namespace      https://openuserjs.org/users/tb23911
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @author         tb23911
// @description    Upgrades highest building of selected building types.
// @include        http*://*.alliances.commandandconquer.com/*/index.aspx*
// @updateURL      https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_Upgrade_Top_ModButtonPos.user.js
// ==/UserScript==

(function () {
	var UpgradeTop_main = function () {
		try {
			function createUpgradeTop() {
				console.log('UpgradeTop createUpgradeTop');

				qx.Class.define("UpgradeTop.Main", {
					type: "singleton",
					extend: qx.core.Object,
					members: {
						UTbutton: null,
						UTpopup: null,
						UTBuildingsButton: null,
						UTautoUpdateHandle: null,
						p: 0,
						h: 0,
						h1: 0,
						r: 0,
						s: 0,
						s1: 0,
						a: 0,

						initialize: function () {

							console.log('UpgradeTop initialize');
							UTBuildingsButton = new qx.ui.form.Button("Building", null).set({
								toolTipText: "Upgrades Highest Buildings",
								width: 63,
								height: 30,
								maxWidth: 60,
								maxHeight: 30,
								appearance: ("button-text-small"), //"button-standard-"+factionText), button-playarea-mode-red-frame
								center: true,

							});
							UTPowerBuildingChoice = new qx.ui.form.Button("PP's", null).set({
								toolTipText: "P = 0 stops power plants from upgrading, P = 1 allows highest power plant to upgrade.",
								width: 63,
								height: 30,
								maxWidth: 60,
								maxHeight: 30,
								appearance: ("button-text-small"), //"button-standard-"+factionText), button-playarea-mode-red-frame
								center: true,

							});
							UTHarvBuildingChoice = new qx.ui.form.Button("TibHar", null).set({
								toolTipText: "T.H = 0 stops Tib harvesters from upgrading, T.H = 1 allows highest Tib harvester to upgrade.",
								width: 63,
								height: 30,
								maxWidth: 60,
								maxHeight: 30,
								appearance: ("button-text-small"), //"button-standard-"+factionText), button-playarea-mode-red-frame
								center: true,

							});

							UTHarv1BuildingChoice = new qx.ui.form.Button("CryHar", null).set({
								toolTipText: "C.H = 0 stops Crystal harvesters from upgrading, C.H = 1 allows highest crystal harvester to upgrade.",
								width: 63,
								height: 30,
								maxWidth: 60,
								maxHeight: 30,
								appearance: ("button-text-small"), //"button-standard-"+factionText), button-playarea-mode-red-frame
								center: true,

							});

							UTRefBuildingChoice = new qx.ui.form.Button("Ref's", null).set({
								toolTipText: "R = 0 stops refineries from upgrading, R = 1 allows highest refinery to upgrade.",
								width: 63,
								height: 30,
								maxWidth: 60,
								maxHeight: 30,
								appearance: ("button-text-small"), //"button-standard-"+factionText), button-playarea-mode-red-frame
								center: true,

							});

							UTSiloBuildingChoice = new qx.ui.form.Button("TibSilo's", null).set({
								toolTipText: "T.S = 0 stops Tib silos from upgrading, T.S = 1 allows highest Tib silo to upgrade.",
								width: 63,
								height: 30,
								maxWidth: 60,
								maxHeight: 30,
								appearance: ("button-text-small"), //"button-standard-"+factionText), button-playarea-mode-red-frame
								center: true,

							});

							UTSilo1BuildingChoice = new qx.ui.form.Button("CrySilo's", null).set({
								toolTipText: "C.S = 0 stops Cry silos from upgrading, C.S = 1 allows highest Cry silo to upgrade.",
								width: 63,
								height: 30,
								maxWidth: 60,
								maxHeight: 30,
								appearance: ("button-text-small"), //"button-standard-"+factionText), button-playarea-mode-red-frame
								center: true,

							});

							UTAccBuildingChoice = new qx.ui.form.Button("Acc's", null).set({
								toolTipText: "A = 0 stops accumulators from upgrading, A = 1 allows highest accumulator to upgrade.",
								width: 63,
								height: 30,
								maxWidth: 60,
								maxHeight: 30,
								appearance: ("button-text-small"), //"button-standard-"+factionText), button-playarea-mode-red-frame
								center: true,
							});

							UTbutton = new qx.ui.form.Button("Upg.Top");
							UTbutton1 = new qx.ui.form.Button("Options");
							UTpopup = new qx.ui.popup.Popup(new qx.ui.layout.Grid(5)).set({
								width: 120,
								height: 30,
								allowGrowY: false,
								allowGrowX: false,
								padding: 5,
								position: "top-left"
							});
							UTpopup1 = new qx.ui.popup.Popup(new qx.ui.layout.Grid(5)).set({
								width: 120,
								height: 30,
								allowGrowY: false,
								allowGrowX: false,
								padding: 5,
								position: "top-left"
							});

							UTBuildingsButton.addListener("click", function (e) {
								if (window.UpgradeTop.Main.getInstance().UTautoUpdateHandle != null) {
									window.UpgradeTop.Main.getInstance().BstopAutoUpdate();
									UTBuildingsButton.setLabel("B.OFF");
								} else {
									window.UpgradeTop.Main.getInstance().BuildingstartAutoUpdate();
									UTBuildingsButton.setLabel("B.ON");
								}
							}, this);

							UTPowerBuildingChoice.addListener("click", function (e) {
								var _this = window.UpgradeTop.Main.getInstance();
								if (_this.p == 1) {
									UTPowerBuildingChoice.setLabel("P = 0");
									_this.p = 0;
									console.log(_this.p + " Power off mode");
								} else {
									UTPowerBuildingChoice.setLabel("P = 1");
									_this.p = 1;
									console.log(_this.p + " Power On mode");
								}
							}, this);

							UTHarvBuildingChoice.addListener("click", function (e) {
								var _this = window.UpgradeTop.Main.getInstance();
								if (_this.h == 1) {
									UTHarvBuildingChoice.setLabel("T.H = 0");
									_this.h = 0;
									console.log(_this.h + " Tib Harvester off mode");
								} else {
									UTHarvBuildingChoice.setLabel("T.H = 1");
									_this.h = 1;
									console.log(_this.h + " Tib Harvester On mode");
								}
							}, this);

							UTHarv1BuildingChoice.addListener("click", function (e) {
								var _this = window.UpgradeTop.Main.getInstance();
								if (_this.h1 == 1) {
									UTHarv1BuildingChoice.setLabel("C.H = 0");
									_this.h1 = 0;
									console.log(_this.h1 + " Crystal Harvester off mode");
								} else {
									UTHarv1BuildingChoice.setLabel("C.H = 1");
									_this.h1 = 1;
									console.log(_this.h1 + " Crystal Harvester On mode");
								}
							}, this);

							UTRefBuildingChoice.addListener("click", function (e) {
								var _this = window.UpgradeTop.Main.getInstance();
								if (_this.r == 1) {
									UTRefBuildingChoice.setLabel("R = 0");
									_this.r = 0;
									console.log(_this.r + " Refinery off mode");
								} else {
									UTRefBuildingChoice.setLabel("R = 1");
									_this.r = 1;
									console.log(_this.r + " Refinery On mode");
								}
							}, this);

							UTSiloBuildingChoice.addListener("click", function (e) {
								var _this = window.UpgradeTop.Main.getInstance();
								if (_this.s == 1) {
									UTSiloBuildingChoice.setLabel("T.S = 0");
									_this.s = 0;
									console.log(_this.s + " Silo off mode");
								} else {
									UTSiloBuildingChoice.setLabel("T.S = 1");
									_this.s = 1;
									console.log(_this.s + " Silo On mode");
								}
							}, this);

							UTSilo1BuildingChoice.addListener("click", function (e) {
								var _this = window.UpgradeTop.Main.getInstance();
								if (_this.s1 == 1) {
									UTSilo1BuildingChoice.setLabel("C.S = 0");
									_this.s1 = 0;
									console.log(_this.s + " Silo off mode");
								} else {
									UTSilo1BuildingChoice.setLabel("C.S = 1");
									_this.s1 = 1;
									console.log(_this.s + " Silo On mode");
								}
							}, this);

							UTAccBuildingChoice.addListener("click", function (e) {
								var _this = window.UpgradeTop.Main.getInstance();
								if (_this.a == 1) {
									UTAccBuildingChoice.setLabel("A = 0");
									_this.a = 0;
									console.log(_this.a + " Accumulator off mode");
								} else {
									UTAccBuildingChoice.setLabel("A = 1");
									_this.a = 1;
									console.log(_this.p + " Accumulator On mode");
								}
							}, this);

							UTpopup.add(UTbutton1, { //Options button
								row: 0,
								column: 0
							});
							UTpopup.add(UTBuildingsButton, {
								row: 0,
								column: 1
							});
							UTpopup1.add(UTPowerBuildingChoice, {
								row: 0,
								column: 0
							});
							UTpopup1.add(UTRefBuildingChoice, {
								row: 0,
								column: 1
							});
							UTpopup1.add(UTHarvBuildingChoice, {
								row: 0,
								column: 2
							});
							UTpopup1.add(UTHarv1BuildingChoice, {
								row: 0,
								column: 3
							});
							UTpopup1.add(UTSiloBuildingChoice, {
								row: 0,
								column: 4
							});
							UTpopup1.add(UTSilo1BuildingChoice, {
								row: 0,
								column: 5
							});
							UTpopup1.add(UTAccBuildingChoice, {
								row: 0,
								column: 6
							});
							UTbutton.addListener("click", function (e) {
								UTpopup.placeToPointer(e);
								UTpopup.show();
							}, this);
							UTbutton1.addListener("click", function (e) {
								UTpopup1.placeToPointer(e);
								UTpopup1.show();
							}, this);

							var app = qx.core.Init.getApplication();

							// Mod Button Position by Netquik original left:128 x compatibility

							app.getDesktop().add(UTbutton, {
								left: 200,
								top: 3
							});

						},

						getMissingTechIndexesFromTechLevelRequirement: function (levelRequirements, breakAtFirst, city) {
							var reqTechIndexes = [];
							if (levelRequirements != null && levelRequirements.length > 0) {
								for (var lvlIndex = 0;
									(lvlIndex < levelRequirements.length); lvlIndex++) {
									var lvlReq = levelRequirements[lvlIndex];
									var requirementsMet = false;
									var amountCounter = lvlReq.Amount;
									for (var buildingIndex in city.get_Buildings().d) {
										if (city.get_Buildings().d[buildingIndex].get_MdbBuildingId() == lvlReq.RequiredTechId && city.get_Buildings().d[buildingIndex].get_CurrentLevel() >= lvlReq.Level) {
											amountCounter--;
											if (amountCounter <= 0) {
												requirementsMet = true;
												break;
											}
										}
									}
									if (!requirementsMet) {
										requirementsMet = ClientLib.Data.MainData.GetInstance().get_Player().get_PlayerResearch().IsResearchMinLevelAvailable(lvlReq.RequiredTechId, lvlReq.Level);
									}
									if (!requirementsMet) {
										reqTechIndexes.push(lvlIndex);
										if (breakAtFirst) {
											return reqTechIndexes;
										}
									}
								}
							}
							return reqTechIndexes;
						},

						//Thanks to KRS_L
						canUpgradeBuilding: function (gameDataTech, buildingLevel, buildingDamaged, city) {
							//console.log("canUpgrade function - nextLevel: " + nextLevel);
							var buildingNextLvl = buildingLevel + 1;
							var hasEnoughResources = city.HasEnoughResources(ClientLib.Base.Util.GetTechLevelResourceRequirements_Obj(buildingLevel, gameDataTech));
							return (!buildingDamaged && !city.get_IsLocked() && hasEnoughResources);
						},

						BuildingstartAutoUpdate: function () {
							this.UTautoUpdateHandle = window.setInterval(this.BuildingautoUpgrade, 1000);
						},

						BstopAutoUpdate: function () {
							if (this.UTautoUpdateHandle != null) {
								window.clearInterval(this.UTautoUpdateHandle);
								this.UTautoUpdateHandle = null;
							}
						},

						/* ///////////////////////////////////////////////////////////////////
						The Upgrade highest Building Function
						//////////////////////////////////////////////////////////////////////*/
						BuildingautoUpgrade: function () {
							var _this = window.UpgradeTop.Main.getInstance();
							var basenum = 0;
							for (var nCity in ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d) {
								basenum++;
								var city = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[nCity];
								var buildings = city.get_Buildings();
								var baseName = city.m_SupportDedicatedBaseName;
								//console.log(baseName,  _this.x, _this.y, _this.z);
								var baselvl = city.get_LvlBase();
								var blvlLow = baselvl + 3;

								var refarr = [];
								var refnum = 0;
								var powarr = [];
								var pownum = 0;
								var hararr = [];
								var hararr1 = [];
								var harnum = 0;
								var harnum1 = 0;
								var accarr = [];
								var accnum = 0;
								var silarr = [];
								var silnum = 0;
								var sil1arr = [];
								var sil1num = 0;
								var maxarr = [];
								var maxacc = 0;
								var maxsilo = 0;
								var maxref = 0;
								var buildingarr = [];
								var baseBuildingarr = [];
								var nBuilding = 0;
								var siltibprod = 0;
								var silcryprod = 0;

								for (var nBuildings in buildings.d) {

									var building = buildings.d[nBuildings];

									var name = building.get_UnitGameData_Obj().dn;
									var buildinglvlup1 = building.get_CurrentLevel() + 1;
									var bulid = building.get_Id();
									var tech = building.get_TechName();
									var gameDataTech = building.get_TechGameData_Obj();
									/*
									**************************************************************************************************************************************************************************************************************************************************************************************************************************************
									Add all buildings into Building Type array
									**************************************************************************************************************************************************************************************************************************************************************************************************************************************
									 */
									if (building.get_CurrentLevel() < 65) { // highest you can upgrade to is 65 if you are mor than this don't add building to array
										switch (building.get_UnitGameData_Obj().dn) {
											case "Power Plant":
												powarr.push({
													cityid: city.get_Id(),
													buildingid: building.get_Id(),
													basename: city.m_SupportDedicatedBaseName,
													building: building.get_UnitGameData_Obj().dn,
													buildingLevel: building.get_CurrentLevel(),
													buildTibCost: ClientLib.Base.Util.GetUnitLevelResourceRequirements_Obj(buildinglvlup1, building.get_UnitGameData_Obj())[0].Count,
													buildPowCost: ClientLib.Base.Util.GetUnitLevelResourceRequirements_Obj(buildinglvlup1, building.get_UnitGameData_Obj())[1].Count,
													gameDataTech: gameDataTech,
													buildingDamaged: building.get_IsDamaged(),
													posX: building.get_CoordX(),
													posY: building.get_CoordY()
												});
												break;
											case "Refinery":
												refarr.push({
													cityid: city.get_Id(),
													buildingid: building.get_Id(),
													basename: city.m_SupportDedicatedBaseName,
													building: building.get_UnitGameData_Obj().dn,
													buildingLevel: building.get_CurrentLevel(),
													buildTibCost: ClientLib.Base.Util.GetUnitLevelResourceRequirements_Obj(buildinglvlup1, building.get_UnitGameData_Obj())[0].Count,
													buildPowCost: ClientLib.Base.Util.GetUnitLevelResourceRequirements_Obj(buildinglvlup1, building.get_UnitGameData_Obj())[1].Count,
													gameDataTech: gameDataTech,
													buildingDamaged: building.get_IsDamaged(),
													posX: building.get_CoordX(),
													posY: building.get_CoordY()
												});
												break;
											case "Harvester":
												try {
													if (city.GetBuildingCache(bulid).DetailViewInfo.OwnProdModifiers.d[ClientLib.Base.EModifierType.TiberiumProduction] != undefined) {
														//console.log("PosX: " + building.get_CoordX() + " PosY: " + building.get_CoordY() + " Tib Harvester:- Yes");
														hararr.push({
															cityid: city.get_Id(),
															buildingid: building.get_Id(),
															basename: city.m_SupportDedicatedBaseName,
															building: building.get_UnitGameData_Obj().dn,
															buildingLevel: building.get_CurrentLevel(),
															buildTibCost: ClientLib.Base.Util.GetUnitLevelResourceRequirements_Obj(buildinglvlup1, building.get_UnitGameData_Obj())[0].Count,
															buildPowCost: ClientLib.Base.Util.GetUnitLevelResourceRequirements_Obj(buildinglvlup1, building.get_UnitGameData_Obj())[1].Count,
															gameDataTech: gameDataTech,
															buildingDamaged: building.get_IsDamaged(),
															posX: building.get_CoordX(),
															posY: building.get_CoordY()
														});
													}
													if (city.GetBuildingCache(bulid).DetailViewInfo.OwnProdModifiers.d[ClientLib.Base.EModifierType.CrystalProduction] != undefined) {
														//console.log("PosX: " + building.get_CoordX() + " PosY: " + building.get_CoordY() + " Cry Harvester:- Yes");
														hararr1.push({
															cityid: city.get_Id(),
															buildingid: building.get_Id(),
															basename: city.m_SupportDedicatedBaseName,
															building: building.get_UnitGameData_Obj().dn,
															buildingLevel: building.get_CurrentLevel(),
															buildTibCost: ClientLib.Base.Util.GetUnitLevelResourceRequirements_Obj(buildinglvlup1, building.get_UnitGameData_Obj())[0].Count,
															buildPowCost: ClientLib.Base.Util.GetUnitLevelResourceRequirements_Obj(buildinglvlup1, building.get_UnitGameData_Obj())[1].Count,
															gameDataTech: gameDataTech,
															buildingDamaged: building.get_IsDamaged(),
															posX: building.get_CoordX(),
															posY: building.get_CoordY()
														});
													}
												} catch (e) {
													console.log(e);
												}
												break;
											case "Silo":
												//console.log("PosX: " + building.get_CoordX() + " PosY: " + building.get_CoordY() + " Tib Prod - " + city.GetBuildingCache(bulid).DetailViewInfo.OwnProdModifiers.d[ClientLib.Base.EModifierType.TiberiumProduction].TotalValue);
												//console.log("PosX: " + building.get_CoordX() + " PosY: " + building.get_CoordY() + " Tib Prod - " + city.GetBuildingCache(bulid).DetailViewInfo.OwnProdModifiers.d[ClientLib.Base.EModifierType.CrystalProduction].TotalValue);
												siltibprod = city.GetBuildingCache(bulid).DetailViewInfo.OwnProdModifiers.d[ClientLib.Base.EModifierType.TiberiumProduction].TotalValue;
												silcryprod = city.GetBuildingCache(bulid).DetailViewInfo.OwnProdModifiers.d[ClientLib.Base.EModifierType.CrystalProduction].TotalValue;
												//Tib Silo
												if (siltibprod > silcryprod) {
													silarr.push({
														cityid: city.get_Id(),
														buildingid: building.get_Id(),
														basename: city.m_SupportDedicatedBaseName,
														building: building.get_UnitGameData_Obj().dn,
														buildingLevel: building.get_CurrentLevel(),
														buildTibCost: ClientLib.Base.Util.GetUnitLevelResourceRequirements_Obj(buildinglvlup1, building.get_UnitGameData_Obj())[0].Count,
														buildPowCost: ClientLib.Base.Util.GetUnitLevelResourceRequirements_Obj(buildinglvlup1, building.get_UnitGameData_Obj())[1].Count,
														gameDataTech: gameDataTech,
														buildingDamaged: building.get_IsDamaged(),
														posX: building.get_CoordX(),
														posY: building.get_CoordY()
													});
												} else { // Cry Silo
													sil1arr.push({
														cityid: city.get_Id(),
														buildingid: building.get_Id(),
														basename: city.m_SupportDedicatedBaseName,
														building: building.get_UnitGameData_Obj().dn,
														buildingLevel: building.get_CurrentLevel(),
														buildTibCost: ClientLib.Base.Util.GetUnitLevelResourceRequirements_Obj(buildinglvlup1, building.get_UnitGameData_Obj())[0].Count,
														buildPowCost: ClientLib.Base.Util.GetUnitLevelResourceRequirements_Obj(buildinglvlup1, building.get_UnitGameData_Obj())[1].Count,
														gameDataTech: gameDataTech,
														buildingDamaged: building.get_IsDamaged(),
														posX: building.get_CoordX(),
														posY: building.get_CoordY()
													});
												}
												break;
											case "Accumulator":
												accarr.push({
													cityid: city.get_Id(),
													buildingid: building.get_Id(),
													basename: city.m_SupportDedicatedBaseName,
													building: building.get_UnitGameData_Obj().dn,
													buildingLevel: building.get_CurrentLevel(),
													buildTibCost: ClientLib.Base.Util.GetUnitLevelResourceRequirements_Obj(buildinglvlup1, building.get_UnitGameData_Obj())[0].Count,
													buildPowCost: ClientLib.Base.Util.GetUnitLevelResourceRequirements_Obj(buildinglvlup1, building.get_UnitGameData_Obj())[1].Count,
													gameDataTech: gameDataTech,
													buildingDamaged: building.get_IsDamaged(),
													posX: building.get_CoordX(),
													posY: building.get_CoordY()
												});
												break;
											default:
												baseBuildingarr.push({
													cityid: city.get_Id(),
													buildingid: building.get_Id(),
													basename: city.m_SupportDedicatedBaseName,
													building: building.get_UnitGameData_Obj().dn,
													buildingLevel: building.get_CurrentLevel(),
													buildTibCost: ClientLib.Base.Util.GetUnitLevelResourceRequirements_Obj(buildinglvlup1, building.get_UnitGameData_Obj())[0].Count,
													buildPowCost: ClientLib.Base.Util.GetUnitLevelResourceRequirements_Obj(buildinglvlup1, building.get_UnitGameData_Obj())[1].Count,
													gameDataTech: gameDataTech,
													buildingDamaged: building.get_IsDamaged(),
													posX: building.get_CoordX(),
													posY: building.get_CoordY()
												});
										}
									}
								}
								// Sort the arrays largest first so we attempt to upgrade only the largest
								powarr.sort(function (a, b) {
									return parseInt(b.buildingLevel) - parseInt(a.buildingLevel)
								});
								refarr.sort(function (a, b) {
									return parseInt(b.buildingLevel) - parseInt(a.buildingLevel)
								});
								hararr.sort(function (a, b) {
									return parseInt(b.buildingLevel) - parseInt(a.buildingLevel)
								});
								hararr1.sort(function (a, b) {
									return parseInt(b.buildingLevel) - parseInt(a.buildingLevel)
								});
								silarr.sort(function (a, b) {
									return parseInt(b.buildingLevel) - parseInt(a.buildingLevel)
								});
								sil1arr.sort(function (a, b) {
									return parseInt(b.buildingLevel) - parseInt(a.buildingLevel)
								});
								accarr.sort(function (a, b) {
									return parseInt(b.buildingLevel) - parseInt(a.buildingLevel)
								});
								baseBuildingarr.sort(function (a, b) {
									return parseInt(b.buildingLevel) - parseInt(a.buildingLevel)
								});

								//**************************************************************************************************************************************************************************************************************************************************************************************************************************************
								//Upgrade decisions
								//**************************************************************************************************************************************************************************************************************************************************************************************************************************************

								if ((_this.r == 1) && (refarr[0] != undefined) && (_this.canUpgradeBuilding(refarr[0].gameDataTech, refarr[0].buildingLevel, refarr[0].buildingDamaged, city))) {
									//console.log("Upgrading Refinery - Base: " + refarr[0].basename + " Building: " + refarr[0].building + " Level: " + refarr[0].buildingLevel + " posX: " + refarr[0].posX + " posY: " + refarr[0].posY + " TibCost: " + refarr[0].buildTibCost + " PowCost: " + refarr[0].buildPowCost);
									ClientLib.Net.CommunicationManager.GetInstance().SendCommand("UpgradeBuilding", refarr[0], null, null, true);
									refarr = [];
									//break;
								}

								if ((_this.p == 1) && (powarr[0] != undefined) && (_this.canUpgradeBuilding(powarr[0].gameDataTech, powarr[0].buildingLevel, powarr[0].buildingDamaged, city))) {
									//console.log("Upgrading Power Plant - Base: " + powarr[0].basename + " Building: " + powarr[0].building + " Level: " + powarr[0].buildingLevel + " posX: " + powarr[0].posX + " posY: " + powarr[0].posY + " TibCost: " + powarr[0].buildTibCost + " PowCost: " + powarr[0].buildPowCost);
									ClientLib.Net.CommunicationManager.GetInstance().SendCommand("UpgradeBuilding", powarr[0], null, null, true);
									powarr = [];
									//break;
								}

								if ((_this.h == 1) && (hararr[0] != undefined) && (_this.canUpgradeBuilding(hararr[0].gameDataTech, hararr[0].buildingLevel, hararr[0].buildingDamaged, city))) {
									//console.log("Upgrading Tib Harvester - Base: " + hararr[0].basename + " Building: " + hararr[0].building + " Level: " + hararr[0].buildingLevel + " posX: " + hararr[0].posX + " posY: " + hararr[0].posY + " TibCost: " + hararr[0].buildTibCost + " PowCost: " + hararr[0].buildPowCost);
									ClientLib.Net.CommunicationManager.GetInstance().SendCommand("UpgradeBuilding", hararr[0], null, null, true);
									hararr = [];
									//break;
								}

								if ((_this.h1 == 1) && (hararr1[0] != undefined) && (_this.canUpgradeBuilding(hararr1[0].gameDataTech, hararr1[0].buildingLevel, hararr1[0].buildingDamaged, city))) {
									//console.log("Upgrading Cry Harvester - Base: " + hararr1[0].basename + " Building: " + hararr1[0].building + " Level: " + hararr1[0].buildingLevel + " posX: " + hararr1[0].posX + " posY: " + hararr1[0].posY + " TibCost: " + hararr1[0].buildTibCost + " PowCost: " + hararr1[0].buildPowCost);
									ClientLib.Net.CommunicationManager.GetInstance().SendCommand("UpgradeBuilding", hararr1[0], null, null, true);
									hararr1 = [];
									//break;
								}

								if ((_this.a == 1) && (accarr[0] != undefined) && (_this.canUpgradeBuilding(accarr[0].gameDataTech, accarr[0].buildingLevel, accarr[0].buildingDamaged, city))) {
									//console.log("Upgrading Accumulator - Base: " + accarr[0].basename + " Building: " + accarr[0].building + " Level: " + accarr[0].buildingLevel + " posX: " + accarr[0].posX + " posY: " + accarr[0].posY + " TibCost: " + accarr[0].buildTibCost + " PowCost: " + accarr[0].buildPowCost);
									ClientLib.Net.CommunicationManager.GetInstance().SendCommand("UpgradeBuilding", accarr[0], null, null, true);
									accarr = [];
									//break;
								}

								if ((_this.s == 1) && (silarr[0] != undefined) && (_this.canUpgradeBuilding(silarr[0].gameDataTech, silarr[0].buildingLevel, silarr[0].buildingDamaged, city))) {
									//console.log("Upgrading Tib Silo - Base: " + silarr[0].basename + " Building: " + silarr[0].building + " Level: " + silarr[0].buildingLevel + " posX: " + silarr[0].posX + " posY: " + silarr[0].posY + " TibCost: " + silarr[0].buildTibCost + " PowCost: " + silarr[0].buildPowCost);
									ClientLib.Net.CommunicationManager.GetInstance().SendCommand("UpgradeBuilding", silarr[0], null, null, true);
									silarr = [];
									//break;
								}
								if ((_this.s1 == 1) && (sil1arr[0] != undefined) && (_this.canUpgradeBuilding(sil1arr[0].gameDataTech, sil1arr[0].buildingLevel, sil1arr[0].buildingDamaged, city))) {
									//console.log("Upgrading Cry Silo - Base: " + sil1arr[0].basename + " Building: " + sil1arr[0].building + " Level: " + sil1arr[0].buildingLevel + " posX: " + sil1arr[0].posX + " posY: " + sil1arr[0].posY + " TibCost: " + sil1arr[0].buildTibCost + " PowCost: " + sil1arr[0].buildPowCost);
									ClientLib.Net.CommunicationManager.GetInstance().SendCommand("UpgradeBuilding", sil1arr[0], null, null, true);
									sil1arr = [];
									//break;
								}
								/*
								 **************************************************************************************************************************************************************************************************************************************************************************************************************************************
								Upgrade decisions end
								 **************************************************************************************************************************************************************************************************************************************************************************************************************************************
								 */

							}

						}

					}
				});
			}
		} catch (e) {
			console.log("createUpgradeTop: ", e);
		}

		function UpgradeTop_checkIfLoaded() {
			try {
				if (typeof qx != 'undefined' && qx.core.Init.getApplication() && qx.core.Init.getApplication().getUIItem(ClientLib.Data.Missions.PATH.BAR_NAVIGATION) && qx.core.Init.getApplication().getUIItem(ClientLib.Data.Missions.PATH.BAR_NAVIGATION).isVisible()) {
					createUpgradeTop();
					if (typeof ClientLib.API.Util.GetUnitMaxHealth == 'undefined') {
						for (var key in ClientLib.Base.Util) {
							var strFunction = ClientLib.Base.Util[key].toString();
							if ((strFunction.indexOf("function (a,b,c)") == 0 || strFunction.indexOf("function (a,b)") == 0) &&
								strFunction.indexOf("*=1.1") > -1) {
								UpgradeTop.Main.getInstance().GetUnitMaxHealth = ClientLib.Base.Util[key];
								console.log("UpgradeTop.Main.getInstance().GetUnitMaxHealth = ClientLib.Base.Util[" + key + "]");
								break;
							}
						}
					} else {
						UpgradeTop.Main.getInstance().GetUnitMaxHealth = ClientLib.API.Util.GetUnitMaxHealth;

					}
					/*// ClientLib.Data.CityUnits.prototype.get_OffenseUnits
					strFunction = ClientLib.Data.CityUnits.prototype.HasUnitMdbId.toString();
					var searchString = "for(var b in {d:this.";
					var startPos = strFunction.indexOf(searchString) + searchString.length;
					var fn_name = strFunction.slice(startPos, startPos + 6);
					strFunction = "var $createHelper;return this." + fn_name + ";";
					var fn =  Evil('', strFunction);
					ClientLib.Data.CityUnits.prototype.get_OffenseUnits = fn;
					console.log("ClientLib.Data.CityUnits.prototype.get_OffenseUnits = function(){var $createHelper;return this." + fn_name + ";}");

					// ClientLib.Data.CityUnits.prototype.get_DefenseUnits
					strFunction = ClientLib.Data.CityUnits.prototype.HasUnitMdbId.toString();
					searchString = "for(var c in {d:this.";
					startPos = strFunction.indexOf(searchString) + searchString.length;
					fn_name = strFunction.slice(startPos, startPos + 6);
					strFunction = "var $createHelper;return this." + fn_name + ";";
					fn = Evil('', strFunction);
					ClientLib.Data.CityUnits.prototype.get_DefenseUnits = fn;
					console.log("ClientLib.Data.CityUnits.prototype.get_DefenseUnits = function(){var $createHelper;return this." + fn_name + ";}");*/

					UpgradeTop.Main.getInstance();
					window.UpgradeTop.Main.getInstance().initialize();
				} else {
					window.setTimeout(UpgradeTop_checkIfLoaded, 1000);
				}
			} catch (e) {
				console.log("UpgradeTop_checkIfLoaded: ", e);
			}
		}
		if (/commandandconquer\.com/i.test(document.domain)) {
			window.setTimeout(UpgradeTop_checkIfLoaded, 1000);
		}
	}

	try {
		var UpgradeTopScript = document.createElement("script");
		UpgradeTopScript.textContent = "(" + UpgradeTop_main.toString() + ")();";
		UpgradeTopScript.type = "text/javascript";
		if (/commandandconquer\.com/i.test(document.domain)) {
			document.getElementsByTagName("head")[0].appendChild(UpgradeTopScript);
		}
	} catch (e) {
		console.log("UpgradeTop: init error: ", e);
	}
})();