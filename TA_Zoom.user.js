// ==UserScript==
// @name    		    Tiberium Alliances Zoom
// @description    	Allows you to zoom out further
// @namespace   	  https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @include       	https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @version        	1.0.2
// @author         	Original: Panavia -- Updated By: Gryphon -- New code by NetquiK (https://github.com/netquik)
// @updateURL       https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_Zoom.user.js
// ==/UserScript==

(function () {
  var tazoom_main = function () {
    function initialize() {
      console.log("Zoom Loaded");

      var zoomMin = 1.2; // Larger number means able to zoom in closer.
      var zoomMax = 0.45; // Smaller number means able to zoom out further.
      var zoomInc = 0.07; // Larger number for faster zooming, Smaller number for slower zooming.
      var zoomIncLarge = 0.02; // Larger number for faster zooming, Smaller number for slower zooming.
      var backgroundArea = qx.core.Init.getApplication().getBackgroundArea();


      var getMaxZoomMethod = backgroundArea.activeSceneView.get_MaxZoomFactor.toString().match(/this\.([A-Z+]{6});}/)[1];
      var getMinZoomMethod = backgroundArea.activeSceneView.get_MinZoomFactor.toString().match(/\$I\.[A-Z+]{6}\.([A-Z+]{6});}/)[1];

      backgroundArea.activeSceneView[getMaxZoomMethod] = zoomMin;
      ClientLib.Vis.Region.Region[getMinZoomMethod] = zoomMax;


      var onHotKeyPressMod = webfrontend.gui.BackgroundArea.prototype.onHotKeyPress.toString().replace(/(?<=,Math\.max\()(\d*\.?\d*)(?=,)/g, zoomMax).replace(/(?<=Math\.min\()(\d*\.?\d*)(?=,)/g, zoomMin).replace(/(?<=\(\))(([+|-])\d\.\d)(?=;)/g, '$2' + zoomInc);
      var fnBody = onHotKeyPressMod.substring(onHotKeyPressMod.indexOf('{') + 1, onHotKeyPressMod.lastIndexOf('}'));
      var args = onHotKeyPressMod.substring(onHotKeyPressMod.indexOf("(") + 1, onHotKeyPressMod.indexOf(")"));
      webfrontend.gui.BackgroundArea.prototype.onHotKeyPress = new Function(args, fnBody);

      var onMouseWheelMod = webfrontend.gui.BackgroundArea.prototype._onMouseWheel.toString().replace(/(?<=get_ZoomFactor\(\);.*\<)(\d.*\d)(?=\);)/, Math.round((zoomMin / 3) * 2 * 100) / 100 + '?' + zoomIncLarge + ':' + zoomInc);
      fnBody = onMouseWheelMod.substring(onMouseWheelMod.indexOf('{') + 1, onMouseWheelMod.lastIndexOf('}'));
      args = onMouseWheelMod.substring(onMouseWheelMod.indexOf("(") + 1, onMouseWheelMod.indexOf(")"));
      qx.bom.Element.removeListener(backgroundArea.mapContainer, "mousewheel", backgroundArea._onMouseWheel, backgroundArea);
      qx.bom.Element.removeListener(backgroundArea.mapBlocker, "mousewheel", backgroundArea._onMouseWheel, backgroundArea);
      webfrontend.gui.BackgroundArea.prototype._onMouseWheel = new Function(args, fnBody);
      qx.bom.Element.addListener(backgroundArea.mapContainer, "mousewheel", backgroundArea._onMouseWheel, backgroundArea);
      qx.bom.Element.addListener(backgroundArea.mapBlocker, "mousewheel", backgroundArea._onMouseWheel, backgroundArea);

    }

    function tazoom_checkIfLoaded() {
      try {
        if (typeof qx !== 'undefined' && qx.core.Init.getApplication() && qx.core.Init.getApplication().initDone && qx.core.Init.getApplication().getBackgroundArea()) {
          if (qx.core.Init.getApplication().getBackgroundArea().activeSceneView) {
            initialize();
          } else
            window.setTimeout(tazoom_checkIfLoaded, 1000);
        } else {
          window.setTimeout(tazoom_checkIfLoaded, 1000);
        }
      } catch (e) {
        if (typeof console != 'undefined') console.log(e);
        else if (window.opera) opera.postError(e);
        else GM_log(e);
      }
    }

    if (/commandandconquer\.com/i.test(document.domain)) {
      window.setTimeout(tazoom_checkIfLoaded, 1000);
    }
  }

  // injecting, because there seem to be problems when creating game interface with unsafeWindow
  var tazoomScript = document.createElement("script");
  tazoomScript.innerHTML = "(" + tazoom_main.toString() + ")();";
  tazoomScript.type = "text/javascript";
  if (/commandandconquer\.com/i.test(document.domain)) {
    document.getElementsByTagName("head")[0].appendChild(tazoomScript);
  }
})();