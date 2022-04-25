// ==UserScript==
// @name            MovableMenuOverlay
// @description     Make Overlay Menu Windows Movable including Forum and Mail
// @author          Netquik [SoO] (https://github.com/netquik)
// @version         1.0.6
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
- Rewritten InjectFunctions
- Patch for 22.2
- Removed 'Evil' code_eval
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
                    },
                    oOModF: null,
                    centerMod:null
                }
            });
            var qxA = qx.core.Init.getApplication();
            var MOW = webfrontend.gui.MenuOverlayWidget.prototype;
            var oOMethod = qxA.switchMenuOverlay.toString().match(/deactivate\(\)\;this\.([A-Za-z_]+)\(/)[1];
            var source = qxA[oOMethod].toString().replace(/[\r\n]/g, "");
            // MOD injecting MMOverlay in switchMenuOverlay->oOMethod
            //var oOArg = source.match(/function\(([a-zA-Z]+)\)/)[1];
            var oOEMatch = source.match(/if\(this\.([_a-zA-Z]+)\){.+this\.([_a-zA-Z]+)\.focus.+this\.([_a-zA-Z]+)\.reset/);
            var oOE = oOEMatch[1];
            /* var oOEl = 'this.' + source.match(/if\(this.([_a-zA-Z]+)\){/)[1];
            var oOMod = source.replace(/function\([a-zA-Z]+\){(if.+setActive\(false\);};{0,1}}{0,1})(this\.[_a-zA-Z]+\.focus.+open\(\);}{0,1}else {0,1}{).+\.(add.+0}\);)(.+)}/, '$1if('+oOEl+'.getLayoutParent()instanceof MMOverlay){var t=MMOverlay.getInstance().MMO;'+oOEl+'._deactivate();-1!=t.indexOf(this.__nN)&&t.remove('+oOEl+');t.exclude();}$2var MM=MMOverlay.getInstance();m=MM.createMM();m.$3MM.activateMM();m.fadeIn(250);'+oOEl+'.setMinHeight(625);'+oOEl+'.addListener("move",function(e){this.setLayoutProperties({top:0,left:0})});'+oOEl+'.addListener("appear",function(e){this.setLayoutProperties({top:0,left:0})});$4'); 
            qxA[oOMethod] = new Evil(oOArg, oOMod); */
            /* this.oOModF = function (a) {
                if (qxA[oOE]) {
                    if (qxA[oOE] instanceof webfrontend.gui.OverlayWindow)
                        qxA[oOE].close();
                    else {
                        if (qxA[oOE] instanceof webfrontend.gui.MenuOverlayWidget)
                            qxA[oOE].setActive(false);
                    }
                    if (qxA[oOE].getLayoutParent() instanceof MMOverlay) {
                        var t = MMOverlay.getInstance().MMO;
                        t.remove(qxA[oOE]);
                        t.exclude();
                    }
                    qxA[oOEMatch[2]].focus();
                }
                if (qxA[oOE] != a) {
                    qxA[oOE] = a;
                    if (qxA[oOE]) {
                        if (qxA[oOE] instanceof webfrontend.gui.OverlayWindow)
                            qxA[oOE].open();
                        else {
                            var MM = MMOverlay.getInstance();
                            m = MM.createMM();
                            m.add(qxA[oOE], {
                                left: 0,
                                top: 0
                            });
                            MM.activateMM();
                            m.fadeIn(250);
                            qxA[oOE].setMinHeight(625);
                            qxA[oOE].addListener("move", function (e) {
                                this.setLayoutProperties({
                                    top: 0,
                                    left: 0
                                })
                            });
                            qxA[oOE].addListener("appear", function (e) {
                                this.setLayoutProperties({
                                    top: 0,
                                    left: 0
                                })
                            });
                            if (qxA[oOE] instanceof webfrontend.gui.MenuOverlayWidget)
                                qxA[oOE].setActive(true);
                        };
                    } else
                        qxA[oOEMatch[3]].reset();
                };
            } */
            this.oOModF = function(a) {
                if (qxA[oOE]) {
                  qxA[oOE] instanceof webfrontend.gui.OverlayWindow ? qxA[oOE].close() : qxA[oOE] instanceof webfrontend.gui.MenuOverlayWidget && qxA[oOE].setActive(!1);
                  if (qxA[oOE].getLayoutParent() instanceof MMOverlay) {
                    var b = MMOverlay.getInstance().MMO;
                    b.remove(qxA[oOE]);
                    b.exclude();
                  }
                  qxA[oOEMatch[2]].focus();
                }
                qxA[oOE] != a && (qxA[oOE] = a, qxA[oOE] ? qxA[oOE] instanceof webfrontend.gui.OverlayWindow ? qxA[oOE].open() : (a = MMOverlay.getInstance(), m = a.createMM(), m.add(qxA[oOE], {left:0, top:0}), a.activateMM(), m.fadeIn(250), qxA[oOE].setMinHeight(625), qxA[oOE].addListener("move", function(c) {
                  this.setLayoutProperties({top:0, left:0});
                }), qxA[oOE].addListener("appear", function(c) {
                  this.setLayoutProperties({top:0, left:0});
                }), qxA[oOE] instanceof webfrontend.gui.MenuOverlayWidget && qxA[oOE].setActive(!0)) : qxA[oOEMatch[3]].reset());
              };
            qxA[oOMethod] = this.oOModF;
            // MOD for centerposition function - should not center what is already centered
            /* var centerMod = MOW.centerPosition.toString().replace(/function\(\){(var.+)}/, 'if (this.getLayoutParent() instanceof MMOverlay === false){$1}');
            MOW.centerPosition = new Evil('', centerMod); */
/*             this.centerModF = function () {
                if (this.getLayoutParent() instanceof MMOverlay === false) {
                    var A = qx.core.Init.getApplication();
                    var C = A.getDesktop().getBounds();
                    var B = A.getMenuBar().getBounds();
                    var z = A.getCurrentBottomOverlay();
                    var x = Math.floor((C.width - webfrontend.gui.MenuOverlayWidget.OverlayWidth) / 2);
                    var y = B.height;
                    if (z && z.isVisible()) {
                        this.setLayoutProperties({
                            left: x,
                            top: y,
                            bottom: webfrontend.Application.legacySocHeight + webfrontend.gui.notifications.Ticker.TickerHeight
                        });
                    } else
                        this.setLayoutProperties({
                            left: x,
                            top: y,
                            bottom: webfrontend.gui.notifications.Ticker.TickerHeight
                        });
                }
            } */
            this.centerModF = function() {
                if (!1 === this.getLayoutParent() instanceof MMOverlay) {
                  var a = qx.core.Init.getApplication(), b = a.getDesktop().getBounds(), c = a.getMenuBar().getBounds();
                  a = a.getCurrentBottomOverlay();
                  b = Math.floor((b.width - webfrontend.gui.MenuOverlayWidget.OverlayWidth) / 2);
                  c = c.height;
                  a && a.isVisible() ? this.setLayoutProperties({left:b, top:c, bottom:webfrontend.Application.legacySocHeight + webfrontend.gui.notifications.Ticker.TickerHeight}) : this.setLayoutProperties({left:b, top:c, bottom:webfrontend.gui.notifications.Ticker.TickerHeight});
                }
              };
            MOW.centerPosition = this.centerModF;
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