// ==UserScript==
// @name           OPERA BLANKGIF GAMEFIX
// @description    Opera browser support and blank.gif fix
// @downloadURL    https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_opera_blank_gif.user.js
// @updateURL      https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_opera_blank_gif.user.js
// @match          https://*.alliances.commandandconquer.com/*/index.aspx*
// @version 1.0
// @author NetquiK
// ==/UserScript==

(function () {
    var opera_main = function () {
        console.log('OPERA BLANKGIF GAMEFIX loaded');

        function OPERAFIX_checkIfLoaded() {
            try {
                if (typeof qx != 'undefined') {
                    qx.html.Image.prototype.resetSource = function () {
                        if ((qx.core.Environment.get("engine.name") == "webkit")) {
                            this._setProperty("source", "webfrontend/ui/common/blank.gif");
                        } else {
                            this._removeProperty("source", true);
                        };
                        return this;
                    }

                    webfrontend.Application.prototype.checkBrowserSupport = function () {
                        var n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_PART,
                            t = parseFloat(qx.core.Environment.get("browser.version")),
                            i = parseFloat(qx.core.Environment.get("browser.documentmode"));
                        switch (qx.core.Environment.get('browser.name')) {
                            case 'opera':
                                t < 15 && (n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_NONE);
                                t >= 15 && (n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_OK);
                                break;
                            case 'firefox':
                                t < 3.6 && (n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_NONE);
                                t >= 4 && (n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_OK);
                                break;
                            case 'ie':
                                (t <= 9 || i <= 9) && (n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_NONE);
                                t >= 10 && (n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_OK);
                                break;
                            case 'chrome':
                                n = t < 14 ? webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_NONE : webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_OK;
                                break;
                            case 'safari':
                                n = t < 4 ? webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_NONE : webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_OK;
                                break;
                            case 'edge':
                                n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_OK
                        }
                        if (n == webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_OK && ClientLib.Draw.WebGL.SceneFactory.CheckWebGL() == -1 && (n = webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_NOGFX),
                            n == webfrontend.gui.BadBrowserWindow.EBadBrowserMode.EBBM_SUPPORT_OK) {
                            this.waitForAssetPreload();
                            return
                        }
                        (new webfrontend.gui.BadBrowserWindow).set({
                            BrowserMode: n
                        }).show()
                    }

                } else {
                    window.setTimeout(OPERAFIX_checkIfLoaded, 200);
                }
            } catch (e) {
                console.log("OPERAFIX_checkIfLoaded: ", e);
            }
        }

        if (/commandandconquer\.com/i.test(document.domain)) {
            window.setTimeout(OPERAFIX_checkIfLoaded, 200);
        }
    }

    try {
        var OPERAFIX = document.createElement("script");
        OPERAFIX.textContent = "(" + opera_main.toString() + ")();";
        OPERAFIX.type = "text/javascript";
        if (/commandandconquer\.com/i.test(document.domain)) {
            document.getElementsByTagName("head")[0].appendChild(OPERAFIX);
        }
    } catch (e) {
        console.log("OPERAFIX: init error: ", e);
    }
})();
