// ==UserScript==
// @name            MovableMenuOverlay
// @description     Make Overlay Menu Windows Movable including Forum and Mail
// @author          Netquik [SoO] (https://github.com/netquik)
// @version         1.0.4
// @namespace       https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @include         https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @updateURL       https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_MovableMenuOverlay.user.js
// ==/UserScript==
/**
 *  License: CC-BY-NC-SA 4.0
 */

/* 
codes by NetquiK
----------------
- Original code
- Bug Fix for Paste Coords
- Rewritten Inject Functions
----------------
*/

(function () {
    var injectFunction = function () {
        function ModMenuOverlay() {
            qx.Class.define("MMOverlay", {
                type: "singleton",
                extend: qx.ui.container.Composite,
                include: qx.ui.core.MMovable,
                construct: function (layout) {
                    this.base(arguments);
                    try {
                        this.setLayout(layout);
                    } catch (e) {
                        console.group("SoO -MovableMenuOverlay");
                        console.error("Error setting up MovableMenuOverlay", e);
                        console.groupEnd();
                    }
                },
                members: {
                    createMM: function () {
                        var A = qx.core.Init.getApplication();
                        var C = A.getDesktop().getBounds();
                        var B = A.getMenuBar().getBounds();
                        var x = Math.floor((C.width - webfrontend.gui.MenuOverlayWidget.OverlayWidth) / 2);
                        var y = B.height;
                        var position = {
                            left: x,
                            top: y
                        };
                        if (this.MMO) {
                            position = this.MMO.getLayoutProperties();
                            this.MMO.toggleMovable();
                            A.getDesktop().remove(this.MMO);
                        };
                        this.MMO = new MMOverlay(new qx.ui.layout.Basic());
                        A.getDesktop().add(this.MMO, position);
                        return this.MMO;
                    },
                    activateMM: function () {
                        if (this.MMO && this.MMO.getChildren()[0].getChildren().length > 0) {
                            this.MMO._activateMoveHandle(this.MMO.getChildren()[0].getChildren()[13]);
                        }
                    }
                }
            });
            var qxA = qx.core.Init.getApplication();
            var MOW = webfrontend.gui.MenuOverlayWidget.prototype;
            var oOMethod = qxA.switchMenuOverlay.toString().match(/deactivate\(\)\;this\.([A-Za-z_]+)\(/)[1];
            var source = qxA[oOMethod].toString();
            // MOD injecting MMOverlay in switchMenuOverlay->oO
            var oOArg = source.match(/function\(([a-zA-Z]+)\)/)[1];
            var oOMod = source.replace(/function\([a-zA-Z]+\){(if.+setActive\(false\);}})(this\.[_a-zA-Z]+\.focus.+open\(\);}else{).+\.(add.+0}\);)(.+)}/, '$1if(this.__nN.getLayoutParent()instanceof MMOverlay){var t=MMOverlay.getInstance().MMO;this.__nN._deactivate();-1!=t.indexOf(this.__nN)&&t.remove(this.__nN);t.exclude();}$2var MM=MMOverlay.getInstance();m=MM.createMM();m.$3MM.activateMM();m.fadeIn(250);this.__nN.setMinHeight(625);this.__nN.addListener("move",function(e){this.setLayoutProperties({top:0,left:0})});this.__nN.addListener("appear",function(e){this.setLayoutProperties({top:0,left:0})});$4');
            qxA[oOMethod] = new Function(oOArg, oOMod);
            // MOD for centerposition function - should not center what is already centered
            var centerMod = MOW.centerPosition.toString().replace(/function\(\){(var.+;})}/, 'if (this.getLayoutParent() instanceof MMOverlay === false){$1}');
            MOW.centerPosition = new Function('', centerMod);
        }

        function waitForGame() {
            try {
                if (typeof qx !== "undefined" && typeof qx.core !== "undefined" && typeof qx.core.Init !== "undefined" && typeof typeof webfrontend.gui !== "undefined" && typeof phe !== "undefined") {
                    var app = qx.core.Init.getApplication();
                    if (app.initDone === true) {
                        try {
                            ModMenuOverlay();
                            console.time("loaded in");
                            console.group("SoO - MovableMenuOverlay");
                            console.timeEnd("loaded in");
                            console.groupEnd();
                        } catch (e) {
                            console.group("SoO - MovableMenuOverlay");
                            console.error("Error in waitForGame", e);
                            console.groupEnd();
                        }
                    } else
                        window.setTimeout(waitForGame, 1000);
                } else {
                    window.setTimeout(waitForGame, 1000);
                }
            } catch (e) {
                console.group("SoO - MovableMenuOverlay");
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