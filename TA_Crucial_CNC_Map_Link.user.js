// ==UserScript==
// @name        CnC TA: Crucial Script CNC-Map.com link
// @description Adds a link in the Scripts menu so you can go directly to the current servers world map at cnc-map.com 
// @version     1.0.11
// @author      DebitoSphere
// @homepage    https://www.allyourbasesbelong2us.com
// @namespace   AllYourBasesbelong2UsCrucialScriptCnCMapLink
// @include     http*://*alliances*.com/*
// @include     https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @grant       GM_log
// @grant       GM_setValue
// @grant       GM_getValue
// @grant       GM_openInTab
// @grant       GM_registerMenuCommand
// @grant       GM_xmlhttpRequest
// @grant       GM_updatingEnabled
// @grant       unsafeWindow
// ==/UserScript==
(function () {
	var main = function () {
		'use strict';

		function createCnCMapLink() {
			console.log('CnCMapLink loaded');

			//Parse.initialize('PmNW9dH7wrTFQmYgInbDVgGqagUOVPIzENRwzfWu', 'ajepOC4n9K44jh89s5WKtEa4v0hh3OMokxNqLqt0');

			qx.Class.define('CnCMapLink', {
				type: 'singleton',
				extend: qx.core.Object,
				members: {
					window: null,

					initialize: function () {
						this.initializeEntryPoints();
					},

					initializeEntryPoints: function () {
						var scriptsButton = qx.core.Init.getApplication().getMenuBar().getScriptsButton();
						scriptsButton.Add('CnC TA: World Map', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAXCAYAAAARIY8tAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAPiSURBVHjaxFZNb1tVED1z7dpx/JkmaVwF4pQqRCWqQFBYNuzCjgpWZceyaxCwhB2g7hF/oN2m6oZukMKyAokVEq1aaKKQpE5w7MRx/By/4cy9L5ZBNC0Sgkij9971PXPmzpyZGymt3MAJf5O0t2iLtNdo55P1B7QfaCu0b5qXr9af5EBOILiKXvqG1nPQLSB+fARtHPElhpQFMpmCO8vnVA/I9N8jyc1nJajQPtbN4if9ewq9twvsN4DOHhAdegI4R6cjQK4ImT8Nt5CDm4k+J+4LEu2eRFCgfRk/KF3r320DG+tAYwu6t0OCVkLQJ0EqIShBiuNAtYrU5SrcRf2K+I9Isn/sMP2X6D+MH9L5CoPY+hVaXyPBBrRNgkMS9LuAkkBIkMoCIyUgT4L2LvotBoRz19xFecyXT//uBG9rPb989C2jfHgfusE6bq8y+k2g24CqOWC+oQajnYJIHsiO8RRVYGIGcv5FpN6ZhXter/AUt4ZPkIHKcnyfb+vrIXJz3lyDRiYQOmfASgODhx2iy6J3OzwZLe55Sk3TzY9lYLqyXP7uZpYk0THBkm6PIv6p6XPu08LIvXPXhhKDCYRnhhbRuBXbJGryd/ve44myecR3K5CXyyy6LHH1tksIFnVLvFqsoD7nTItFbk51hnaB9iojfH0kPC8k60ZqJ7Q0Eufxj9pIemeQokumcy9FUwsL6nOeDZGjRkcLeei5HFAkZI97f+kwLdxzAG/abUNMCMTrassEeWmYYF5/7wcZmplaWFDLuT9BNeOd60IRGGeOdqKA2mHRf4t8INLtBRzxuulVOj9MMImDODSR6dykaGpJJTnPuRD5eCCygvpvW88khbf9hjP8fu94zAwI6hh1Vd+h1kSmc3PTTwraiUNaGLl3biewb1uPgqr8fsMZvnAq+Bwi+FlOp6pq3WlmTWQ6pxS9WjYjn3McR07nYjXgujQtPfD7PY54qRa8z2GC792Z9GKfs8Xa3zpUDvNB55QiHiEU1HJuaWHk5tzW/e8k8E1nnW3jY6bkfQ4TrMiUfoDCWJgtbH/t7PomMp1jNSjFFzTpAxn0gcGTjibO8FLLIxnlA4I7MnEA91IZcWvKzxah7KxDrYmkkcjxT50cIjfnkpkM42LsLNwbNbjnfKXuDBMwmXrFzWE5Xpsm+AB6lBSUHeqbyHTefcosqs1CXhljof0s8lpOZd9/F4NC53sio8U3dZuFElNUGuJC8US45hitK0DSHAcZprJQhVSmKcgaL55ZpJY46ObwGZ1//aRxfd290DoDrfA+mONsGWUGeP/8s/vg+v96o/0nd/K/+l/FHwIMAFKJ9LER3U7iAAAAAElFTkSuQmCC');
						var children = scriptsButton.getMenu().getChildren();
						var lastChild = children[children.length - 1];
						lastChild.addListener('execute', this.onClickMap, this);

						var mapButton = new qx.ui.form.Button('CnCMaps').set({
							appearance: 'button-text-small',
							toolTipText: 'Opens Current World Map from CnC Maps',
							width: 80
						});

						mapButton.addListener('execute', this.onClickMap, this);

					},

					onClickMap: function () {
						var WorldIDMap = ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId();
						var CnCMapIDLink = "http://cnc-map.com/" + WorldIDMap
						qx.core.Init.getApplication().showExternal(CnCMapIDLink);
					},
				}
			});

		}

		function waitForGame() {
			try {
				if (typeof qx !== 'undefined' && qx.core.Init.getApplication() && qx.core.Init.getApplication().initDone) {
					createCnCMapLink();
					CnCMapLink.getInstance().initialize();
				} else {
					setTimeout(waitForGame, 1000);
				}
			} catch (e) {
				console.log('CnCMapLink: ', e.toString());
			}
		}

		setTimeout(waitForGame, 1000);
	};

	

	var script = document.createElement('script');
	script.textContent = '(' + main.toString() + ')();';
	script.type = 'text/javascript';
	document.getElementsByTagName('head')[0].appendChild(script);
})();