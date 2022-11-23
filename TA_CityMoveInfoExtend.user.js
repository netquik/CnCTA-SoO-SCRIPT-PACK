// ==UserScript==
// @name CityMoveInfoExtend
// @version 22.11.22
// @description Extended move info.
// @namespace   https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @match       https://*.alliances.commandandconquer.com/*/index.aspx*
// @author Nogrod
// @contributor     NetquiK (https://github.com/netquik) (see first comment for changelog)
// @updateURL       https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_CityMoveInfoExtend.user.js
// ==/UserScript==

/* 
codes by NetquiK
----------------
- !!NOEVIL!! code
- 22.3 Fix
- 22.3 fix2
----------------
*/

(function () {
	var c = document.createElement("script");
	c.textContent = "(" + function () {
		function c() {
			console.log('CityMoveInfoExtend Loaded')
			if ("undefined" == typeof webfrontend.gui.region.RegionCityMoveInfo.prototype.updateBases) {
				var a = null,
					b = webfrontend.gui.region.RegionCityMoveInfo.prototype,
					d;
				for (d in b)
					if ("function" === typeof b[d] && /GetCityMoveCooldownTime/.test(b[d].toString())) {
						a = d;
						break
					}
				null !== a && (webfrontend.gui.region.RegionCityMoveInfo.prototype[a + "Orig"] = webfrontend.gui.region.RegionCityMoveInfo.prototype[a], webfrontend.gui.region.RegionCityMoveInfo.prototype.updateBases = function (a, b) {
						if ("undefined" === typeof this.basesCount) {
							var e = new qx.ui.container.Composite(new qx.ui.layout.HBox(6)),
								c = (new qx.ui.basic.Label(this.tr("tnf:bases:") + " ")).set({
									rich: !0,
									textColor: "text-region-tooltip",
									alignY: "middle"
								});
							this.basesCount = (new qx.ui.basic.Label("")).set({
								rich: !0,
								textColor: "text-region-value",
								font: "bold",
								alignY: "middle"
							});
							e.add(c);
							e.add(this.basesCount);
							this.add(e)
						}

						var x = a;
						var y = b;
						var levelCount = [];
						var count = 0;
						var countw = 0;
						var maxAttack = ClientLib.Data.MainData.GetInstance().get_Server().get_MaxAttackDistance();
						var maxAttackceil = Math.ceil(maxAttack);

						var world = ClientLib.Data.MainData.GetInstance().get_World();
						for (var scanY = y - maxAttackceil; scanY <= y + maxAttackceil; scanY++) {
							for (var scanX = x - maxAttackceil; scanX <= x + maxAttackceil; scanX++) {
								var distX = Math.abs(x - scanX);
								var distY = Math.abs(y - scanY);
								var distance = Math.sqrt((distX * distX) + (distY * distY));
								// too far away to scan
								if (distance >= maxAttack) {
									continue;
								}
								var object = world.GetObjectFromPosition(scanX, scanY);
								// Nothing to scan
								if (object === null) {
									continue;
								}
								// Object isnt a NPC Base
								if (object.Type !== ClientLib.Data.WorldSector.ObjectType.NPCBase) {
									continue;
								}
								if (typeof object.getCampType === 'function' && object.getCampType() === ClientLib.Data.Reports.ENPCCampType.Destroyed) {
									continue;
								}
								try {
									var level = object.get_BaseLevel();
									levelCount[level] = (levelCount[level] || 0) + 1;
								} catch (a) {
									console.error('Error - ' + a);
								}
								count++;
								if (distance <= Math.floor(maxAttack)) {
									countw++;
								}
							}
						}
						var output = [];
						for (var i = 0; i < levelCount.length; i++) {
							var lvl = levelCount[i];
							if (lvl !== undefined) {
								output.push(lvl + ' x ' + i);
							}
						}
						// calculate waves
						//Bis 20 Basen -- 1 Angriff
						//21 - 25 -- max 2 Angriffe
						//25 - 30 -- 2 Angriffe
						//31 - 35 -- max. 3 Angriffe
						//35 - 40 -- 3 Angriffe
						//ab 41 Basen in Range bis zu 4 Angriffe ab 45 Basen in Range 4 Angriffe...
						var waves = '';
						if (countw <= 20) {
							waves = ' - 1 wave';
						} else if (countw <= 25) {
							waves = ' - max 2 waves';
						} else if (countw <= 30) {
							waves = ' - 2 waves';
						} else if (countw <= 35) {
							waves = ' - max 3 waves';
						} else if (countw <= 40) {
							waves = ' - 3 waves';
						} else if (countw <= 44) {
							waves = ' - max 4 waves';
						} else if (countw <= 50) {
							waves = ' - 4 waves';
						} else {
							waves = ' - are u crazy???';
						}
						//console.log(count + ' - ' + output.join(', '));
						this.basesCount.setValue(count + ' (' + countw + ')' + ' - ' + output.join(', ') + waves)

						//for (
						//		 var e = 0,
						//		     c = ClientLib.Data.MainData.GetInstance().get_World(),
						//				 f = ClientLib.Data.MainData.GetInstance().get_Server().get_MaxAttackDistance(),
						//				 d = b - Math.ceil(f)
						//		; d <= b + Math.ceil(f); d++)
						//	for (var k = a - Math.ceil(f); k <= a + Math.ceil(f); k++) {
						//		var g = Math.abs(a - k),
						//			h = Math.abs(b - d);
						//		g * g + h * h <= f * f && (g = c.GetObjectFromPosition(k, d), null !== g && g.Type == ClientLib.Data.WorldSector.ObjectType.NPCBase && e++)
						//	}

						// MOD 22.3
					}, b = /this\.(__\w{3})\.setValue\(webfrontend.phe\.cnc\.Util\.getTimespanString\(\w\.GetTimeSpan\(\w+\)\)/.exec(webfrontend.gui.region.RegionCityMoveInfo.prototype[a]),
					/* webfrontend.gui.region.RegionCityMoveInfo.prototype[a] = (new Evil("return function (x,y){this." +
					a + "Orig(x,y);var time=ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity().GetCityMoveCooldownTime(x,y);this." + b[1] + ".setValue(this." + b[1] + ".getValue()+' ('+phe.cnc.Util.getDateTimeString(new Date(Date.now()+(time*1000)))+')');this.updateBases(x,y);}"))()) */
					//MOD NOEVIL
					webfrontend.gui.region.RegionCityMoveInfo.prototype[a] = function (x, y) {
						this[a + "Orig"](x, y);
						var time = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity().GetCityMoveCooldownTime(x, y);
						this[b[1]].setValue(this[b[1]].getValue() + ' (' + phe.cnc.Util.getDateTimeString(new Date(Date.now() + (time * 1000))) + ')');
						this.updateBases(x, y);
					})
			}
		}

		function h() {
			try {
				"undefined" !== typeof qx && "" !== ClientLib.Data.MainData.GetInstance().get_Player().get_Name() ? c() : setTimeout(h, 1E3)
			} catch (a) {
				"undefined" !== typeof console ? console.log(a + ": " + a.stack) : window.opera ? opera.postError(a) :
					console.log(a)
			}
		}
		setTimeout(h, 1E3)
	}.toString() + ")();";

	c.type = "text/javascript";
	document.getElementsByTagName("head")[0].appendChild(c)
})();