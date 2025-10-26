// ==UserScript==
// @name         CENTER DRIVEN Base Info (Basic)
// @namespace    https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @include      https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @description  Provides basic offense and defense information regarding the player bases around you. It also displays your own bases repair time.
// @version      3.23
// @author       XDaast
// @contributor  NetquiK (https://github.com/netquik) - (see first comments for changelog)
// @updateURL    https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_CD_Player_Base_Info.user.js
// @downloadURL  https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_CD_Player_Base_Info.user.js
// ==/UserScript==

/* 
codes by NetquiK
----------------
- Marker Fix 4 (REVERTED MAJOR CHANGES - now uses get_CurrentCity() and global activation flag)
----------------
*/

// --- Global activation flag ---
window.SoO_CD_BaseInfo_Patched = { Enemy: false, Alliance: false, Own: false };

(function () {
	var EnemyInfo_mainFunction = function () {
		function createTweak() {
			webfrontend.gui.region.RegionCityStatusInfoEnemy.prototype.onCitiesChange_EnemyInfo =
				webfrontend.gui.region.RegionCityStatusInfoEnemy.prototype.onCitiesChange;
			webfrontend.gui.region.RegionCityStatusInfoEnemy.prototype.onCitiesChange = function () {
				var widget = webfrontend.gui.region.RegionCityStatusInfoEnemy.getInstance();

				//var city = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(ClientLib.Vis.VisMain.GetInstance().get_SelectedObject().get_Id());
				// Marker Fix 4 by NetquiK
				var city = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity();
				if (!widget.hasOwnProperty('offLevel')) {
					var offWidget = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 0));
					offWidget.setTextColor('orange');
					offWidget.setThemedFont('bold');
					offWidget.add(new qx.ui.basic.Label('-Basic Base Info-'), {
						row: 1,
						column: 0
					});
					offWidget.add(new qx.ui.basic.Label('Offense Level:'), {
						row: 2,
						column: 0
					});
					widget.offLevel = new qx.ui.basic.Label('');
					offWidget.add(widget.offLevel, {
						row: 2,
						column: 1
					});
					offWidget.add(new qx.ui.basic.Label('Defense Level:'), {
						row: 3,
						column: 0
					});
					widget.defLevel = new qx.ui.basic.Label('');
					offWidget.add(widget.defLevel, {
						row: 3,
						column: 1
					});
					widget.add(offWidget);
				}

				widget.offLevel.setValue(city.get_LvlOffense().toFixed(2));
				widget.defLevel.setValue(city.get_LvlDefense().toFixed(2));
				return this.onCitiesChange_EnemyInfo();
			};

			// --- Activation flag ---
			window.SoO_CD_BaseInfo_Patched.Enemy = true;
			console.log('CENTER DRIVEN Base Info: Enemy patch applied.');
		}

		function EnemyInfo_checkIfLoaded() {
			try {
				if (
					typeof qx !== 'undefined' &&
					qx.core.Init.getApplication() !== null &&
					qx.core.Init.getApplication().getMenuBar() !== null
				) {
					createTweak();
				} else {
					setTimeout(EnemyInfo_checkIfLoaded, 1000);
				}
			} catch (e) {
				if (typeof console !== 'undefined') {
					console.log(e + ': ' + e.stack);
				} else if (window.opera) {
					opera.postError(e);
				} else {
					GM_log(e);
				}
			}
		}
		setTimeout(EnemyInfo_checkIfLoaded, 1000);
	};
	var EnemyInfoScript = document.createElement('script');
	var txt = EnemyInfo_mainFunction.toString();
	EnemyInfoScript.textContent = '(' + txt + ')();';
	EnemyInfoScript.type = 'text/javascript';
	document.getElementsByTagName('head')[0].appendChild(EnemyInfoScript);
})();
(function () {
	var AllianceInfo_mainFunction = function () {
		function createTweak() {
			/*
		function FormatTimespan(value) {
                            var i;
                            var t = ClientLib.Vis.VisMain.FormatTimespan(value);
                            var colonCount = 0;
                            for (i = 0; i < t.length; i++) {
                                if (t.charAt(i) == ':') colonCount++;
                            }
                            var r = "";
                            for (i = 0; i < t.length; i++) {
                                if (t.charAt(i) == ':') {
                                    if (colonCount > 2) {
                                        r += "d ";
                                    } else {
                                        r += t.charAt(i);
                                    }
                                    colonCount--;
                                } else {
                                    r += t.charAt(i);
                                }
                            }
                            return r;
                        }
            */
			webfrontend.gui.region.RegionCityStatusInfoAlliance.prototype.onCitiesChange_AllianceInfo =
				webfrontend.gui.region.RegionCityStatusInfoAlliance.prototype.onCitiesChange;
			webfrontend.gui.region.RegionCityStatusInfoAlliance.prototype.onCitiesChange = function () {
				var widget = webfrontend.gui.region.RegionCityStatusInfoAlliance.getInstance();
				//var city = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(ClientLib.Vis.VisMain.GetInstance().get_SelectedObject().get_Id());
				// Marker Fix 4 by NetquiK
				var city = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity();
				/*
				var rt =  Math.min(city.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeInf),
                                    city.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeVeh),
                                    city.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeAir));
            */
				if (!widget.hasOwnProperty('offLevel')) {
					var offWidget = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 0));
					offWidget.setTextColor('#00e92d');
					offWidget.setThemedFont('bold');
					offWidget.add(new qx.ui.basic.Label('-Basic Alliance Base Info-'), {
						row: 1,
						column: 0
					});
					offWidget.add(new qx.ui.basic.Label('Offense Level:'), {
						row: 2,
						column: 0
					});
					widget.offLevel = new qx.ui.basic.Label('');
					offWidget.add(widget.offLevel, {
						row: 2,
						column: 1
					});
					offWidget.add(new qx.ui.basic.Label('Defense Level:'), {
						row: 3,
						column: 0
					});
					widget.defLevel = new qx.ui.basic.Label('');
					offWidget.add(widget.defLevel, {
						row: 3,
						column: 1
					});
					widget.add(offWidget);
				}
				widget.offLevel.setValue(city.get_LvlOffense().toFixed(2));
				widget.defLevel.setValue(city.get_LvlDefense().toFixed(2));
				//widget.base.setValue(city.get_LvlBase().toFixed(2));
				//widget.rt.setValue(rt.toFixed(2));
				//this.rt.setValue(FormatTimespan(rt));
				return this.onCitiesChange_AllianceInfo();
			};
			// --- Activation flag ---
			window.SoO_CD_BaseInfo_Patched.Alliance = true;
			console.log('CENTER DRIVEN Base Info: Alliance patch applied.');
		}

		function AllianceInfo_checkIfLoaded() {
			try {
				if (
					typeof qx !== 'undefined' &&
					qx.core.Init.getApplication() !== null &&
					qx.core.Init.getApplication().getMenuBar() !== null
				) {
					createTweak();
				} else {
					setTimeout(AllianceInfo_checkIfLoaded, 1000);
				}
			} catch (e) {
				if (typeof console !== 'undefined') {
					console.log(e + ': ' + e.stack);
				} else if (window.opera) {
					opera.postError(e);
				} else {
					GM_log(e);
				}
			}
		}
		setTimeout(AllianceInfo_checkIfLoaded, 1000);
	};
	var AllianceInfoScript = document.createElement('script');
	var txt = AllianceInfo_mainFunction.toString();
	AllianceInfoScript.textContent = '(' + txt + ')();';
	AllianceInfoScript.type = 'text/javascript';
	document.getElementsByTagName('head')[0].appendChild(AllianceInfoScript);
})();
(function () {
	var OwnInfo_mainFunction = function () {
		function createTweak() {
			function FormatTimespan(value) {
				var i;
				var t = ClientLib.Vis.VisMain.FormatTimespan(value);
				var colonCount = 0;
				for (i = 0; i < t.length; i++) {
					if (t.charAt(i) == ':') colonCount++;
				}
				var r = '';
				for (i = 0; i < t.length; i++) {
					if (t.charAt(i) == ':') {
						if (colonCount > 2) {
							r += 'd ';
						} else {
							r += t.charAt(i);
						}
						colonCount--;
					} else {
						r += t.charAt(i);
					}
				}
				return r;
			}
			webfrontend.gui.region.RegionCityStatusInfoOwn.prototype.onCitiesChange_OwnInfo =
				webfrontend.gui.region.RegionCityStatusInfoOwn.prototype.onCitiesChange;
			webfrontend.gui.region.RegionCityStatusInfoOwn.prototype.onCitiesChange = function () {
				var widget = webfrontend.gui.region.RegionCityStatusInfoOwn.getInstance();
				//var city = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(ClientLib.Vis.VisMain.GetInstance().get_SelectedObject().get_Id());
				// Marker Fix 4 by NetquiK
				var city = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity();
				var rt = Math.min(
					city.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeInf),
					city.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeVeh),
					city.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeAir)
				);
				if (!widget.hasOwnProperty('offLevel')) {
					var offWidget = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 0));
					offWidget.setTextColor('#01fff4');
					offWidget.setThemedFont('bold');
					offWidget.add(new qx.ui.basic.Label('-My Base Info-'), {
						row: 1,
						column: 0
					});
					offWidget.add(new qx.ui.basic.Label('Offense Level:'), {
						row: 2,
						column: 0
					});
					widget.offLevel = new qx.ui.basic.Label('');
					offWidget.add(widget.offLevel, {
						row: 2,
						column: 1
					});
					offWidget.add(new qx.ui.basic.Label('Defense Level:'), {
						row: 3,
						column: 0
					});
					widget.defLevel = new qx.ui.basic.Label('');
					offWidget.add(widget.defLevel, {
						row: 3,
						column: 1
					});
					offWidget.add(new qx.ui.basic.Label('Base Level:'), {
						row: 4,
						column: 0
					});
					widget.base = new qx.ui.basic.Label('');
					offWidget.add(widget.base, {
						row: 4,
						column: 1
					});
					offWidget.add(new qx.ui.basic.Label('Repair Time'), {
						row: 5,
						column: 0
					});
					widget.rt = new qx.ui.basic.Label('');
					offWidget.add(widget.rt, {
						row: 5,
						column: 1
					});

					widget.add(offWidget);
				}

				widget.offLevel.setValue(city.get_LvlOffense().toFixed(2));
				widget.defLevel.setValue(city.get_LvlDefense().toFixed(2));
				widget.base.setValue(city.get_LvlBase().toFixed(2));
				widget.rt.setValue(rt.toFixed(2));
				this.rt.setValue(FormatTimespan(rt));
				return this.onCitiesChange_OwnInfo();
			};
			// --- Activation flag ---
			window.SoO_CD_BaseInfo_Patched.Own = true;
			console.log('CENTER DRIVEN Base Info: Own patch applied.');
		}

		function OwnInfo_checkIfLoaded() {
			try {
				if (
					typeof qx !== 'undefined' &&
					qx.core.Init.getApplication() !== null &&
					qx.core.Init.getApplication().getMenuBar() !== null
				) {
					createTweak();
				} else {
					setTimeout(OwnInfo_checkIfLoaded, 1000);
				}
			} catch (e) {
				if (typeof console !== 'undefined') {
					console.log(e + ': ' + e.stack);
				} else if (window.opera) {
					opera.postError(e);
				} else {
					GM_log(e);
				}
			}
		}
		setTimeout(OwnInfo_checkIfLoaded, 1000);
	};
	var OwnInfoScript = document.createElement('script');
	var txt = OwnInfo_mainFunction.toString();
	OwnInfoScript.textContent = '(' + txt + ')();';
	OwnInfoScript.type = 'text/javascript';
	document.getElementsByTagName('head')[0].appendChild(OwnInfoScript);
})();
