// ==UserScript==
// @name            MovableMailMessage
// @description     Make Mail Messages Movable
// @author          Netquik [SoO] (https://github.com/netquik)
// @version         1.0
// @namespace       https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @include         https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @updateURL       https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_MovableMailMessage.user.js
// ==/UserScript==
/**
 *  License: CC-BY-NC-SA 3.0
 */
(function () {
    var injectFunction = function () {
        function ModMailMessage() {
            qx.Class.define("MMovableMail", {
                type: "singleton",
                extend: qx.ui.container.Composite,
                include: qx.ui.core.MMovable,
                construct: function (layout) {
                    this.base(arguments);
                    try {
                        this.setLayout(layout);
                    } catch (e) {
                        console.group("SoO - MovableMailMessage");
                        console.error("Error setting up MovagleMailMessage", e);
                        console.groupEnd();
                    }
                }
            });
            var qxA = qx.core.Init.getApplication();
            var MOW = webfrontend.gui.MenuOverlayWidget.prototype;
            var MOW_open = "var A=qx.core.Init.getApplication();var C=A.getDesktop().getBounds();var B=A.getMenuBar().getBounds();if(A.getCurrentMenuOverlay()!==this)m=new MMovableMail(new qx.ui.layout.Basic()); this.toggle(); m.add(this,{top:0,left:0});m._activateMoveHandle(this.getChildren()[13]);m.hide();var x=Math.floor((C.width-webfrontend.gui.MenuOverlayWidget.OverlayWidth)/2);var y=B.height;A.getDesktop().add(m, {left:x,top:y});m.fadeIn();m.show();";
            MOW.open = new Function('', MOW_open);

            var source = qxA.switchMenuOverlay.toString()
            var oOmember = source.match(/deactivate\(\)\;this\.([A-Za-z_]+)\(/)[1];
            var oOMod = "if (this.__nN) {if (this.__nN instanceof webfrontend.gui.OverlayWindow) this.__nN.close();else {if (this.__nN instanceof webfrontend.gui.MenuOverlayWidget) this.__nN.setActive(false);};if (this.__nN.getLayoutParent() instanceof MMovableMail){this.__nN.getLayoutParent().remove(this.__nN);}this.__np.focus();};if (this.__nN != iF) {this.__nN = iF;if (this.__nN) {if (this.__nN instanceof webfrontend.gui.OverlayWindow) this.__nN.open();else {this.__np.add(this.__nN, {left: 0,top: 0});if (this.__nN instanceof webfrontend.gui.MenuOverlayWidget) this.__nN.setActive(true);};} else this.__nv.reset();};";
            qxA[oOmember] = new Function('iF', oOMod);
            // Mod for centerposition function - should not center what is already centered
            var centerMod = "if (this.getLayoutParent() instanceof MMovableMail === false) {var A=qx.core.Init.getApplication();var C=A.getDesktop().getBounds();var B=A.getMenuBar().getBounds();var z=A.getCurrentBottomOverlay();var x=Math.floor((C.width-webfrontend.gui.MenuOverlayWidget.OverlayWidth)/2);var y=B.height;if(z&&z.isVisible())this.setLayoutProperties({left:x,top:y,bottom:webfrontend.Application.legacySocHeight+webfrontend.gui.notifications.Ticker.TickerHeight});else this.setLayoutProperties({left:x,top:y,bottom:webfrontend.gui.notifications.Ticker.TickerHeight});}";
            MOW.centerPosition = new Function('', centerMod);

        }



        function waitForGame() {
            try {
                if (typeof qx !== "undefined" && typeof qx.core !== "undefined" && typeof qx.core.Init !== "undefined" && typeof typeof webfrontend.gui !== "undefined" && typeof phe !== "undefined") {
                    var app = qx.core.Init.getApplication();
                    if (app.initDone === true) {
                        try {
                            ModMailMessage();
                            console.time("loaded in");
                            console.group("SoO - MovableMailMessage");
                            console.timeEnd("loaded in");
                            console.groupEnd();
                        } catch (e) {
                            console.group("SoO - MovableMailMessage");
                            console.error("Error in waitForGame", e);
                            console.groupEnd();
                        }
                    } else
                        window.setTimeout(waitForGame, 1000);
                } else {
                    window.setTimeout(waitForGame, 1000);
                }
            } catch (e) {
                console.group("SoO - MovableMailMessage");
                console.error("Error in waitForGame", e);
                console.groupEnd();
            }
        }
        window.setTimeout(waitForGame, 1000);
    };
    var script = document.createElement("script");
    var txt = injectFunction.toString();
    script.innerHTML = "(" + txt + ")();";
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);
})();