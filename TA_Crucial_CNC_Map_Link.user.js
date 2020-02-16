// ==UserScript==
// @name        CnC TA: Crucial Script CNC-Map.com link
// @description Adds a link in the Scripts menu so you can go directly to the current servers world map at cnc-map.com 
// @version     1.0.10
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
(function() {
	var main = function() {
		'use strict';

		function createCnCMapLink() {
			console.log('CnCMapLink loaded');

			Parse.initialize('PmNW9dH7wrTFQmYgInbDVgGqagUOVPIzENRwzfWu', 'ajepOC4n9K44jh89s5WKtEa4v0hh3OMokxNqLqt0');

			qx.Class.define('CnCMapLink', {
				type: 'singleton',
				extend: qx.core.Object,
				members: {
					window: null,

					initialize: function() {
						this.initializeEntryPoints();
					},

					initializeEntryPoints: function() {
						var scriptsButton = qx.core.Init.getApplication().getMenuBar().getScriptsButton();
						scriptsButton.Add('CnC TA: World Map', 'https://www.allyourbasesbelong2us.com/images/scripts/cncmap.png');
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

					onClickMap: function() {
					var WorldIDMap = ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId();
					var CnCMapIDLink = "http://cnc-map.com/" + WorldIDMap
						qx.core.Init.getApplication().showExternal(CnCMapIDLink);
					},
				}
			});

		}

		function waitForGame() {
			try {
				if (typeof Parse !== 'undefined' && typeof qx !== 'undefined' && qx.core.Init.getApplication() && qx.core.Init.getApplication().initDone) {
					createCnCMapLink();
					CnCMapLink.getInstance().initialize();
				}
				else {
					setTimeout(waitForGame, 1000);
				}
			}
			catch (e) {
				console.log('CnCMapLink: ', e.toString());
			}
		}

		setTimeout(waitForGame, 1000);
	};

	/*var parseScript = document.createElement('script');
	parseScript.src = 'https://www.parsecdn.com/js/parse-1.2.19.min.js';
	parseScript.type = 'text/javascript';
	document.getElementsByTagName('head')[0].appendChild(parseScript);*/

	var script = document.createElement('script');
	script.innerHTML = '(' + main.toString() + ')();';
	script.type = 'text/javascript';
	document.getElementsByTagName('head')[0].appendChild(script);
})();