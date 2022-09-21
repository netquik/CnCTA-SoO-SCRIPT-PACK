// ==UserScript==
// @name    		    Tiberium Alliances Zoom
// @description    	Allows you to zoom out further
// @namespace   	  https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @match           https://*.alliances.commandandconquer.com/*/index.aspx*
// @version        	1.0.5
// @author         	Original: Panavia -- Updated By: Gryphon -- New code by NetquiK (https://github.com/netquik)
// @updateURL       https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_Zoom.user.js
// ==/UserScript==

/* 
codes by NetquiK
----------------
- New Code
- !!NOEVIL!! from 1.0.3
- 22.3 Fix
----------------
*/


(function () {
  var tazoom_main = function () {
    function initialize() {
      console.log("Zoom Loaded");

      var zoomMin = 1.2; // Larger number means able to zoom in closer.
      var zoomMax = 0.45; // Smaller number means able to zoom out further.
      var zoomInc = 0.07; // Larger number for faster zooming, Smaller number for slower zooming.
      var zoomIncLarge = 0.02; // Larger number for faster zooming, Smaller number for slower zooming.
      var backgroundArea = qx.core.Init.getApplication().getBackgroundArea();


      var getMaxZoomMethod = backgroundArea.activeSceneView.get_MaxZoomFactor.toString().match(/this\.([A-Z+]{6});?}/)[1];
      var getMinZoomMethod = backgroundArea.activeSceneView.get_MinZoomFactor.toString().match(/\$I\.[A-Z+]{6}\.([A-Z+]{6});?}/)[1];

      backgroundArea.activeSceneView[getMaxZoomMethod] = zoomMin;
      ClientLib.Vis.Region.Region[getMinZoomMethod] = zoomMax;

      //MOD NOEVIL 1
      webfrontend.gui.BackgroundArea.prototype.onHotKeyPress = function (a) {
        var b = ClientLib.Vis.VisMain.GetInstance();
        if (!b.get_LockMove() && this.active) {
          var c = !1;
          switch (a.getKeyIdentifier()) {
            case webfrontend.gui.ShortkeyMapper.keys.zoomIn:
              a = b.get_Region().get_ZoomFactor() + zoomInc;
              b.get_Region().set_ZoomFactor(Math.min(zoomMin, Math.max(.6, a)));
              c = !0;
              break;
            case webfrontend.gui.ShortkeyMapper.keys.zoomOut:
              a = b.get_Region().get_ZoomFactor() - zoomInc, b.get_Region().set_ZoomFactor(Math.min(zoomMin, Math.max(.6, a))),
                c = !0
          }
          c && (this.closeCityInfo(), this.closeCityList())
        }
      };
      //MOD NOEVIL 2
      qx.bom.Element.removeListener(backgroundArea.mapContainer, "mousewheel", backgroundArea._onMouseWheel, backgroundArea);
      qx.bom.Element.removeListener(backgroundArea.mapBlocker, "mousewheel", backgroundArea._onMouseWheel, backgroundArea);
      webfrontend.gui.BackgroundArea.prototype._onMouseWheel = function (b) {
        if (!ClientLib.Vis.VisMain.GetInstance().get_LockMove() && null != this.activeSceneView) {
          var c = b.getWheelDelta(),
            a = this.activeSceneView.get_ZoomFactor();
          a += -c * (a < Math.round(zoomMin / 3 * 200) / 100 ? zoomIncLarge : zoomInc);
          a = Math.min(this.activeSceneView.get_MaxZoomFactor(), Math.max(this.activeSceneView.get_MinZoomFactor(), a));
          this.activeSceneView.set_ZoomFactor(a);
          b.stop()
        }
      };
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
  tazoomScript.textContent = "(" + tazoom_main.toString() + ")();";
  tazoomScript.type = "text/javascript";
  if (/commandandconquer\.com/i.test(document.domain)) {
    document.getElementsByTagName("head")[0].appendChild(tazoomScript);
  }
})();