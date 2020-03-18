// ==UserScript==
// @name         Tiberium Alliances Info Sticker
// @namespace    TAInfoSticker
// @version      1.11.10.4
// @description  Based on Maelstrom Dev Tools. Modified MCV timer, repair time label, resource labels.
// @include      https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @author       unicode
// @contributor  NetquiK (https://github.com/netquik) GUI FIX
// @updateURL    https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_Info_Sticker.user.js
// ==/UserScript==
(function () {
    var InfoSticker_main = function () {
        try {
            function createInfoSticker() {
                console.log('InfoSticker loaded');
                // define Base
                qx.Class.define("InfoSticker.Base", {
                    type: "singleton",
                    extend: qx.core.Object,
                    members: {
                        /* Desktop */
                        dataTimerInterval: 1000,
                        positionInterval: 500,
                        tibIcon: null,
                        cryIcon: null,
                        powIcon: null,
                        creditIcon: null,
                        repairIcon: null,
                        hasStorage: false,

                        initialize: function () {
                            try {
                                this.hasStorage = 'localStorage' in window && window['localStorage'] !== null;
                            } catch (se) {}
                            try {
                                //var fileManager = ClientLib.File.FileManager.GetInstance();
                                this.tibIcon = "ui/common/icn_res_tiberium.png";
                                this.cryIcon = "ui/common/icn_res_chrystal.png";
                                this.powIcon = "ui/common/icn_res_power.png";
                                this.creditIcon = "ui/common/icn_res_dollar.png";
                                this.repairIcon = "ui/icons/icn_repair_off_points.png";

                                if (typeof phe.cnc.Util.attachNetEvent == 'undefined')
                                    this.attachEvent = webfrontend.gui.Util.attachNetEvent;
                                else
                                    this.attachEvent = phe.cnc.Util.attachNetEvent;

                                this.runMainTimer();
                            } catch (e) {
                                console.log("InfoSticker.initialize: ", e.toString());
                            }
                        },
                        runMainTimer: function () {
                            try {
                                var self = this;
                                this.calculateInfoData();
                                window.setTimeout(function () {
                                    self.runMainTimer();
                                }, this.dataTimerInterval);
                            } catch (e) {
                                console.log("InfoSticker.runMainTimer: ", e.toString());
                            }
                        },
                        runPositionTimer: function () {
                            try {
                                var self = this;
                                this.repositionSticker();
                                window.setTimeout(function () {
                                    self.runPositionTimer();
                                }, this.positionInterval);
                            } catch (e) {
                                console.log("InfoSticker.runPositionTimer: ", e.toString());
                            }
                        },
                        infoSticker: null,
                        mcvPopup: null,
                        mcvTimerLabel: null,
                        mcvResearchLabel: null,
                        mcvInfoLabel: null,
                        mcvPane: null,

                        repairPopup: null,
                        repairTimerLabel: null,

                        resourcePane: null,
                        resourceHidden: false,
                        resourceTitleLabel: null,
                        resourceHideButton: null,
                        resourceLabel1: null,
                        resourceLabel2: null,
                        resourceLabel3: null,

                        resourceLabel1per: null,
                        resourceLabel2per: null,
                        resourceLabel3per: null,

                        productionTitleLabel: null,
                        productionLabelPower: null,
                        productionLabelCredit: null,

                        repairInfoLabel: null,

                        lastButton: null,

                        top_image: null,
                        bot_image: null,

                        toFlipH: [],

                        pinButton: null,
                        pinned: false,

                        pinTop: 130,
                        pinButtonDecoration: null,
                        pinPane: null,

                        pinIconFix: false,

                        lockButton: null,
                        locked: false,

                        lockButtonDecoration: null,
                        lockPane: null,

                        lockIconFix: false,

                        mcvHide: false,
                        repairHide: false,
                        resourceHide: false,
                        productionHide: false,
                        contProductionHide: false,
                        stickerBackground: null,

                        mcvPane: null,

                        pinLockPos: 0,

                        attachEvent: function () {},

                        isNull: function (e) {
                            return typeof e == "undefined" || e == null;
                        },

                        getApp: function () {
                            return qx.core.Init.getApplication();
                        },

                        getBaseListBar: function () {
                            var app = this.getApp();
                            var b;
                            if (!this.isNull(app)) {
                                b = app.getBaseNavigationBar();
                                if (!this.isNull(b)) {
                                    if (b.getChildren().length > 0) {
                                        b = b.getChildren()[0];
                                        if (b.getChildren().length > 0) {
                                            b = b.getChildren()[0];
                                            return b;
                                        }
                                    }
                                }
                            }
                            return null;
                        },

                        repositionSticker: function () {
                            try {
                                var i;

                                if (this.infoSticker && !this.mcvInfoLabel.isDisposed() && !this.mcvPopup.isDisposed()) {
                                    var baseListBar = this.getBaseListBar();
                                    if (baseListBar != null) {
                                        var baseCont = baseListBar.getChildren();
                                        for (i = 0; i < baseCont.length; i++) {
                                            var baseButton = baseCont[i];
                                            if (typeof baseButton.getBaseId === 'function') {
                                                if (baseButton.getBaseId() == ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity().get_Id() &&
                                                    baseButton.getBounds() != null && baseButton.getBounds().top != null) {
                                                    //var baseButtonDecorator = baseButton.getDecorator();
                                                    //if (baseButton!=this.mcvPopup && baseButtonDecorator != null && typeof baseButtonDecorator === "string" && baseButton.getBounds() != null && baseButton.getBounds().top!=null) {
                                                    //if (baseButtonDecorator.indexOf("focused") >= 0 || baseButtonDecorator.indexOf("pressed") >= 0) {
                                                    if (this.locked) {
                                                        if (!this.pinned) {
                                                            if (baseListBar.indexOf(this.mcvPopup) >= 0) {
                                                                baseListBar.remove(this.mcvPopup);
                                                            }
                                                            this.pinLockPos = baseListBar.indexOf(baseButton) + 1;
                                                            baseListBar.addAt(this.mcvPopup, this.pinLockPos);
                                                        } else if (baseListBar.indexOf(this.mcvPopup) < 0) {
                                                            baseListBar.addAt(this.mcvPopup, Math.max(0, Math.min(this.pinLockPos, baseCont.length)));
                                                        }
                                                    } else {
                                                        if (baseListBar.indexOf(this.mcvPopup) >= 0) {
                                                            baseListBar.remove(this.mcvPopup);
                                                        }
                                                        if (!this.pinned) {
                                                            var top = baseButton.getBounds().top;
                                                            var infoTop;
                                                            try {
                                                                var stickerHeight = this.infoSticker.getContentElement().getDomElement().style.height;
                                                                stickerHeight = stickerHeight.substring(0, stickerHeight.indexOf("px"));
                                                                infoTop = Math.min(130 + top, Math.max(660, window.innerHeight) - parseInt(stickerHeight, 10) - 130);
                                                            } catch (heighterror) {
                                                                infoTop = 130 + top;
                                                            }
                                                            if (this.infoSticker.getContentElement().getDomElement() != null)
                                                                this.infoSticker.setDomTop(infoTop);

                                                            this.pinTop = infoTop;
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                    }

                                }
                            } catch (ex) {
                                console.log("InfoSticker.repositionSticker: ", ex.toString());
                            }
                        },
                        toLock: function (e) {
                            try {
                                this.locked = !this.locked;
                                if (!this.locked) {
                                    this.infoSticker.show();
                                    this.stickerBackground.add(this.mcvPopup);
                                } else this.infoSticker.hide();
                                this.lockButton.setIcon(this.locked ? "FactionUI/icons/icn_thread_locked_active.png" : "FactionUI/icons/icn_thread_locked_inactive.png");
                                this.updateLockButtonDecoration();
                                if (this.hasStorage) {
                                    if (this.locked) {
                                        localStorage["infoSticker-locked"] = "true";
                                        if (this.pinned) localStorage["infoSticker-pinLock"] = this.pinLockPos.toString();
                                    } else {
                                        localStorage["infoSticker-locked"] = "false";
                                    }
                                }
                                if (this.locked && this.pinned) {
                                    this.menuUpButton.setEnabled(true);
                                    this.menuDownButton.setEnabled(true);
                                } else {
                                    this.menuUpButton.setEnabled(false);
                                    this.menuDownButton.setEnabled(false);
                                }
                                this.repositionSticker();
                            } catch (e) {
                                console.log("InfoSticker.toLock: ", e.toString());
                            }
                        },
                        updateLockButtonDecoration: function () {
                            var light = "#CDD9DF";
                            var mid = "#9CA4A8";
                            var dark = "#8C9499";
                            this.lockPane.setDecorator(null);
                            this.lockButtonDecoration = new qx.ui.decoration.Decorator();
                            this.lockButtonDecoration.setBackgroundColor(this.locked ? dark : light);
                            this.lockPane.setDecorator(this.lockButtonDecoration);
                        },
                        toPin: function (e) {
                            try {
                                this.pinned = !this.pinned;
                                this.pinButton.setIcon(this.pinned ? "FactionUI/icons/icn_thread_pin_active.png" : "FactionUI/icons/icn_thread_pin_inactive.png");
                                this.updatePinButtonDecoration();
                                if (this.hasStorage) {
                                    if (this.pinned) {
                                        localStorage["infoSticker-pinned"] = "true";
                                        localStorage["infoSticker-top"] = this.pinTop.toString();
                                        if (this.locked) {
                                            localStorage["infoSticker-pinLock"] = this.pinLockPos.toString();
                                        }
                                    } else {
                                        localStorage["infoSticker-pinned"] = "false";
                                    }
                                }
                                if (this.locked && this.pinned) {
                                    this.menuUpButton.setEnabled(true);
                                    this.menuDownButton.setEnabled(true);
                                } else {
                                    this.menuUpButton.setEnabled(false);
                                    this.menuDownButton.setEnabled(false);
                                }
                            } catch (e) {
                                console.log("InfoSticker.toPin: ", e.toString());
                            }
                        },
                        updatePinButtonDecoration: function () {
                            var light = "#CDD9DF";
                            var mid = "#9CA4A8";
                            var dark = "#8C9499";
                            this.pinPane.setDecorator(null);
                            this.pinButtonDecoration = new qx.ui.decoration.Decorator().set({
                                //innerOpacity: 0.5
                            });
                            //this.pinButtonDecoration.setInnerColor(this.pinned ? mid : light);
                            //this.pinButtonDecoration.setOuterColor(this.pinned ? light : mid);
                            this.pinButtonDecoration.setBackgroundColor(this.pinned ? dark : light);
                            this.pinPane.setDecorator(this.pinButtonDecoration);
                        },
                        hideResource: function () {
                            try {
                                //if(this.resourceHidden) 
                                if (this.resourcePane.isVisible()) {
                                    //this.resourcePane.hide();
                                    this.resourcePane.exclude();
                                    this.resourceHideButton.setLabel("+");
                                } else {
                                    this.resourcePane.show();
                                    this.resourceHideButton.setLabel("-");
                                }
                            } catch (e) {
                                console.log("InfoSticker.hideResource: ", e.toString());
                            }
                        },
                        lastPane: null,
                        createSection: function (parent, titleLabel, visible, visibilityStorageName) {
                            try {
                                var pane = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    padding: [5, 0, 5, 5],
                                    width: 124,
                                    decorator: new qx.ui.decoration.Decorator().set({
                                        //backgroundImage: "decoration/pane_messaging_item/messaging_items_pane.png",
                                        backgroundImage: "decoration2/button-missionbar/button-missionbar.png",
                                        backgroundRepeat: "scale",
                                    }),
                                    alignX: "right"
                                });

                                var labelStyle = {
                                    font: "bold",
                                    textColor: '#595969'
                                };
                                titleLabel.set(labelStyle);

                                var hidePane = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    
                                    alignX: "right"
                                });

                                var hideButton = new qx.ui.form.Button("-").set({
                                    decorator: null,
                                    paddingBottom: 2,
                                    paddingLeft: 2,
                                    paddingRight: 2,
                                    width: 15,
                                    maxWidth: 15,
                                    maxHeight: 10,
                                });
                                var hideButtonLabel = hideButton.getChildControl("label");
                                hideButtonLabel.setTextColor("#4a0c0c");
                                hideButtonLabel.setFont("font_size_14_bold");
                                var self = this;
                                //resourceHideButton.addListener("execute", this.hideResource, this);
                                hideButton.addListener("execute", function () {
                                    if (hidePane.isVisible()) {
                                        hidePane.exclude();
                                        hideButton.setLabel("+");
                                    } else {
                                        hidePane.show();
                                        hideButton.setLabel("-");
                                    }
                                    if (self.hasStorage)
                                        localStorage["infoSticker-" + visibilityStorageName] = !hidePane.isVisible();
                                });

                                var titleBar = new qx.ui.container.Composite(new qx.ui.layout.HBox(0));
                                titleBar.add(hideButton);
                                titleBar.add(titleLabel);
                                pane.add(titleBar);
                                pane.add(hidePane);

                                if (!visible) hidePane.exclude(), hideButton.setLabel("+");

                                this.toFlipH.push(pane);

                                this.lastPane = pane;
                                parent.add(pane);

                                return hidePane;
                            } catch (e) {
                                console.log("InfoSticker.createSection: ", e.toString());
                                throw e;
                            }
                        },
                        createHBox: function (ele1, ele2, ele3) {
                            var cnt;
                            cnt = new qx.ui.container.Composite();
                            cnt.setLayout(new qx.ui.layout.HBox(0));
                            if (ele1 != null) {
                                cnt.add(ele1);
                                ele1.setAlignY("middle");
                            }
                            if (ele2 != null) {
                                cnt.add(ele2);
                                ele2.setAlignY("bottom");
                            }
                            if (ele3 != null) {
                                cnt.add(ele3);
                                ele3.setAlignY("bottom");
                            }

                            return cnt;
                        },

                        formatCompactTime: function (time) {
                            var comps = time.split(":");

                            var i = 0;
                            var value = Math.round(parseInt(comps[i], 10)).toString();
                            var len = comps.length;
                            while (value == 0) {
                                value = Math.round(parseInt(comps[++i], 10)).toString();
                                len--;
                            }
                            var unit;
                            switch (len) {
                                case 1:
                                    unit = "s";
                                    break;
                                case 2:
                                    unit = "m";
                                    break;
                                case 3:
                                    unit = "h";
                                    break;
                                case 4:
                                    unit = "d";
                                    break;
                            }
                            return value + unit;
                        },
                        createImage: function (icon, w, p) {
                            w||(w=20);
                            var image = new qx.ui.basic.Image(icon);
                            image.setScale(true);
                            image.setWidth(20);
                            image.setHeight(20);
                            p||(p=0);
                            image.setPadding([0, p, 0, 0,]);
                            return image;
                        },

                        createMCVPane: function () {
                            try {
                                this.mcvInfoLabel = new qx.ui.basic.Label().set({
                                    font: "bold",
                                    marginLeft:2,
                                    alignY: "middle"
                                });
                                this.mcvTimerLabel = new qx.ui.basic.Label().set({
                                    font: "bold",
                                    textColor: '#282828',
                                    height: 20,
                                    width: 114,
                                    textAlign: 'center'
                                });
                                this.mcvResearchLabel = new qx.ui.basic.Label().set({
                                    font: "bold",
                                    textColor: '#282828',
                                    height: 20,
                                    width: 114,
                                    textAlign: 'center'
                                });
                                this.mcvTimerCreditProdLabel = new qx.ui.basic.Label().set({
                                    font: "bold",
                                    textColor: '#282828',
                                    height: 20,
                                    width: 114,
                                    textAlign: 'center',
                                    /* marginTop: 4,
                                    marginBottom: -4 */
                                });
                                var app = qx.core.Init.getApplication();
                                var b3 = app.getBaseNavigationBar().getChildren()[0].getChildren()[0];


                                var pane = this.createSection(b3, this.mcvInfoLabel, !this.mcvHide, "mcvHide");
                                pane.add(this.mcvTimerLabel);
                                pane.add(this.mcvResearchLabel);
                                pane.add(this.mcvTimerCreditProdLabel);
                                this.mcvPane = this.lastPane;
                                this.lastPane.setMarginLeft(5);

                            } catch (e) {
                                console.log("InfoSticker.createMCVPopup", e.toString());
                            }
                        },
                        moveStickerUp: function () {
                            try {
                                var baseListBar = this.getBaseListBar();
                                this.pinLockPos = Math.max(0, this.pinLockPos - 1);
                                if (baseListBar.indexOf(this.mcvPopup) >= 0) {
                                    baseListBar.remove(this.mcvPopup);
                                }
                                if (this.hasStorage) {
                                    localStorage["infoSticker-pinLock"] = this.pinLockPos.toString();
                                }
                            } catch (e) {
                                console.log("InfoSticker.moveStickerUp", e.toString());
                            }
                        },
                        moveStickerDown: function () {
                            try {
                                var baseListBar = this.getBaseListBar();
                                this.pinLockPos = Math.min(baseListBar.getChildren().length, this.pinLockPos + 1);
                                if (baseListBar.indexOf(this.mcvPopup) >= 0) {
                                    baseListBar.remove(this.mcvPopup);
                                }
                                if (this.hasStorage) {
                                    localStorage["infoSticker-pinLock"] = this.pinLockPos.toString();
                                }
                            } catch (e) {
                                console.log("InfoSticker.moveStickerDown", e.toString());
                            }
                        },
                        menuUpButton: null,
                        menuDownButton: null,
                        createMCVPopup: function () {
                            try {
                                var self = this;
                                this.mcvPopup = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
                                    spacing: 3
                                })).set({
                                    paddingLeft: 5,
                                    //width: 105,
                                    decorator: null
                                });

                                var menu = new qx.ui.menu.Menu();
                                var menuPinButton = new qx.ui.menu.Button("Pin", "FactionUI/icons/icn_thread_pin_inactive.png");
                                menuPinButton.addListener("execute", this.toPin, this);
                                menu.add(menuPinButton);
                                var menuLockButton = new qx.ui.menu.Button("Lock", "FactionUI/icons/icn_thread_locked_inactive.png");
                                menuLockButton.addListener("execute", this.toLock, this);
                                menu.add(menuLockButton);
                                //var fileManager = ClientLib.File.FileManager.GetInstance();
                                this.menuUpButton = new qx.ui.menu.Button("Move up", "ui/icons/icon_tracker_arrow_up.png");
                                //ui/icons/icon_tracker_arrow_up.png ui/gdi/icons/cht_opt_arrow_down.png
                                this.menuUpButton.addListener("execute", this.moveStickerUp, this);
                                menu.add(this.menuUpButton);
                                this.menuDownButton = new qx.ui.menu.Button("Move down", "ui/icons/icon_tracker_arrow_down.png");
                                this.menuDownButton.addListener("execute", this.moveStickerDown, this);
                                menu.add(this.menuDownButton);
                                this.mcvPopup.setContextMenu(menu);
                                if (!this.locked) {
                                    this.stickerBackground.add(this.mcvPopup);
                                }

                                ////////////////////////////----------------------------------------------------------
                                this.pinButton = new webfrontend.ui.SoundButton().set({
                                    decorator: "button-forum-light",
                                    icon: this.pinned ? "FactionUI/icons/icn_thread_pin_active.png" : "FactionUI/icons/icn_thread_pin_inactive.png",
                                    iconPosition: "top",
                                    show: "icon",
                                    cursor: "pointer",
                                    height: 23,
                                    width: 50,
                                    //maxHeight: 25,
                                    maxWidth: 33,
                                    maxHeight: 19,
                                    alignX: "center"
                                });
                                this.pinButton.addListener("execute", this.toPin, this);

                                this.pinPane = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    //width: 50,
                                    maxWidth: 37,
                                    alignY: "middle",
                                    allowGrowY:false
                                });

                                this.updatePinButtonDecoration();

                                this.pinPane.setDecorator(this.pinButtonDecoration);
                                this.pinPane.add(this.pinButton);
                                //this.mcvPopup.add(this.pinPane);
                                //this.toFlipH.push(this.pinPane);

                                var icon = this.pinButton.getChildControl("icon");
                                icon.setWidth(15);
                                icon.setHeight(15);
                                icon.setScale(true);
                                ////////////////////////////----------------------------------------------------------
                                this.lockButton = new webfrontend.ui.SoundButton().set({
                                    decorator: "button-forum-light",
                                    icon: this.pinned ? "FactionUI/icons/icn_thread_locked_active.png" : "FactionUI/icons/icn_thread_locked_inactive.png",
                                    iconPosition: "top",
                                    show: "icon",
                                    cursor: "pointer",
                                    height: 23,
                                    width: 50,
                                    //maxHeight: 25,
                                    maxWidth: 33,
                                    maxHeight: 19,
                                    alignX: "center"
                                });
                                this.lockButton.addListener("execute", this.toLock, this);

                                this.lockPane = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    //width: 50,
                                    maxWidth: 37,
                                    alignY: "middle",
                                    allowGrowY:false
                                });

                                this.updateLockButtonDecoration();

                                this.lockPane.setDecorator(this.lockButtonDecoration);
                                this.lockPane.add(this.lockButton);
                                //this.mcvPopup.add(this.pinPane);
                                //this.toFlipH.push(this.pinPane);

                                icon = this.lockButton.getChildControl("icon");
                                icon.setWidth(15);
                                icon.setHeight(15);
                                icon.setScale(true);
                                ////////////////////////////----------------------------------------------------------
                                this.resourceTitleLabel = new qx.ui.basic.Label();
                                this.resourceTitleLabel.setValue("Base");
                                this.resourceTitleLabel.setAlignY("middle");
                                this.resourceTitleLabel.setMarginRight(5);
                                var resStyle = {
                                    font: "bold",
                                    textColor: '#282828',
                                    height: 20,
                                    width: 65,
                                    marginLeft: -10,
                                    textAlign: 'right'
                                };

                                this.resourceLabel1 = new qx.ui.basic.Label().set(resStyle);
                                this.resourceLabel2 = new qx.ui.basic.Label().set(resStyle);
                                this.resourceLabel3 = new qx.ui.basic.Label().set(resStyle);

                                var perStyle = {
                                    font: "bold-small",
                                    textColor: '#282828',
                                    height: 18,
                                    width: 33,
                                    textAlign: 'right'
                                };
                                this.resourceLabel1per = new qx.ui.basic.Label().set(perStyle);
                                this.resourceLabel2per = new qx.ui.basic.Label().set(perStyle);
                                this.resourceLabel3per = new qx.ui.basic.Label().set(perStyle);


                                var pane3 = this.createSection(this.mcvPopup, this.resourceTitleLabel, !this.resourceHide, "resourceHide");
                                var mcvC = this.mcvPopup.getChildren();
                                mcvC[mcvC.length - 1].getChildren()[0].add(this.pinPane);
                                mcvC[mcvC.length - 1].getChildren()[0].add(this.lockPane);

                                this.repairTimerLabel = new qx.ui.basic.Label().set({
                                    font: "font_size_14_bold", //bigger
                                    textColor: '#282828',
                                    height: 20,
                                    width: 85,
                                    marginLeft: 0,
                                    textAlign: 'center'
                                });
                                pane3.add(this.createHBox(this.createImage(this.repairIcon, 18), this.repairTimerLabel));

                                pane3.add(this.createHBox(this.createImage(this.tibIcon, 20), this.resourceLabel1, this.resourceLabel1per));
                                pane3.add(this.createHBox(this.createImage(this.cryIcon, 20), this.resourceLabel2, this.resourceLabel2per));
                                pane3.add(this.createHBox(this.createImage(this.powIcon, 20, 4), this.resourceLabel3, this.resourceLabel3per));

                                
                                ////////////////////////////----------------------------------------------------------

                                this.productionTitleLabel = new qx.ui.basic.Label();
                                this.productionTitleLabel.setValue("db.Produce");
                                this.productionTitleLabel.setAlignY("middle");
                                var productionStyle = {
                                    font: "bold",
                                    textColor: '#282828',
                                    height: 20,
                                    width: 85,
                                    textAlign: 'right',
                                    /* marginTop: 2,
                                    marginBottom: -2 */
                                };
                                this.productionLabelTiberium = new qx.ui.basic.Label().set(productionStyle);
                                this.productionLabelCrystal = new qx.ui.basic.Label().set(productionStyle);

                                this.productionLabelPower1 = new qx.ui.basic.Label().set(productionStyle);
                                this.productionLabelCredit = new qx.ui.basic.Label().set(productionStyle);

                                var pane4 = this.createSection(this.mcvPopup, this.productionTitleLabel, !this.productionHide, "productionHide");
                                pane4.add(this.createHBox(this.createImage(this.tibIcon), this.productionLabelTiberium));
                                pane4.add(this.createHBox(this.createImage(this.cryIcon), this.productionLabelCrystal));

                                pane4.add(this.createHBox(this.createImage(this.powIcon, 20, 4), this.productionLabelPower1));
                                pane4.add(this.createHBox(this.createImage(this.creditIcon, 20, 4), this.productionLabelCredit));
                                ////////////////////////////----------------------------------------------------------

                                this.contProductionTitleLabel = new qx.ui.basic.Label();
                                this.contProductionTitleLabel.setValue("Cont'+Ally");
                                this.contProductionTitleLabel.setAlignY("middle");
                                var contProductionStyle = {
                                    font: "bold",
                                    textColor: '#282828',
                                    height: 20,
                                    width: 85,
                                    textAlign: 'right',
                                    /* marginTop: 2,
                                    marginBottom: -2 */
                                };
                                this.contProductionLabelTiberium = new qx.ui.basic.Label().set(contProductionStyle);
                                this.contProductionLabelCrystal = new qx.ui.basic.Label().set(contProductionStyle);
                                this.contProductionLabelPower = new qx.ui.basic.Label().set(contProductionStyle);

                                this.contProductionLabelCredit = new qx.ui.basic.Label().set(contProductionStyle);

                                var pane5 = this.createSection(this.mcvPopup, this.contProductionTitleLabel, !this.contProductionHide, "contProductionHide");
                                pane5.add(this.createHBox(this.createImage(this.tibIcon), this.contProductionLabelTiberium));
                                pane5.add(this.createHBox(this.createImage(this.cryIcon), this.contProductionLabelCrystal));
                                pane5.add(this.createHBox(this.createImage(this.powIcon, 20, 4), this.contProductionLabelPower));
                                pane5.add(this.createHBox(this.createImage(this.creditIcon, 20, 4), this.contProductionLabelCredit));
                                ////////////////////////////----------------------------------------------------------								
                                this.repairTimeTitleLabel = new qx.ui.basic.Label();
                                this.repairTimeTitleLabel.setValue("RepairTimes");
                                this.repairTimeTitleLabel.setAlignY("middle");
                                this.repairTimeStyle = {
                                    font: "bold",
                                    textColor: '#282828',
                                    height: 20,
                                    width: 85,
                                    textAlign: 'center',
                                    /* marginTop: 2,
                                    marginBottom: -2 */
                                };

                                this.repairTimeLabel0 = new qx.ui.basic.Label().set(this.repairTimeStyle);
                                this.repairTimeLabel1 = new qx.ui.basic.Label().set(this.repairTimeStyle);
                                this.repairTimeLabel2 = new qx.ui.basic.Label().set(this.repairTimeStyle);

                                var pane6 = this.createSection(this.mcvPopup, this.repairTimeTitleLabel, !this.rtHide, "repairHide");
                                pane6.add(this.createHBox(this.createImage(this.repairIcon, 18), this.repairTimeLabel0));
                                pane6.add(this.createHBox(this.createImage(this.repairIcon, 18), this.repairTimeLabel1));
                                pane6.add(this.createHBox(this.createImage(this.repairIcon, 18), this.repairTimeLabel2));
                                //pane6.add(this.createHBox(this.createImage(this.creditIcon), this.productionLabelCredit));
                                ////////////////////////////----------------------------------------------------------



                            } catch (e) {
                                console.log("InfoSticker: createMCVPopup", e.toString());
                            }
                        },
                        currentCityChange: function () {
                            this.calculateInfoData();
                            this.repositionSticker();
                        },
                        disposeRecover: function () {

                            try {
                                if (this.mcvPane.isDisposed()) {
                                    this.createMCVPane();
                                }

                                if (this.mcvPopup.isDisposed()) {
                                    this.createMCVPopup();

                                    this.repositionSticker();
                                }
                                this.waitingRecovery = false;
                            } catch (e) {
                                console.log("InfoSticker: disposeRecover", e.toString());
                            }

                        },
                        waitingRecovery: false,
                        citiesChange: function () {
                            try {
                                var self = this;
                                var baseListBar = this.getBaseListBar();
                                this.disposeRecover();

                                if (baseListBar.indexOf(this.mcvPopup) >= 0) {
                                    baseListBar.remove(this.mcvPopup);
                                    this.mcvPopup.dispose();
                                }

                                if (baseListBar.indexOf(this.mcvPane) >= 0) {
                                    baseListBar.remove(this.mcvPane);
                                    this.mcvPane.dispose();
                                }
                                if (!this.waitingRecovery) {
                                    this.waitingRecovery = true;
                                    window.setTimeout(function () {
                                        self.disposeRecover();
                                    }, 10);
                                }
                            } catch (e) {
                                console.log("InfoSticker: citiesChange", e.toString());
                            }
                        },
                        calculateInfoData: function () {
                            try {
                                var self = this;
                                var player = ClientLib.Data.MainData.GetInstance().get_Player();
                                var cw = player.get_Faction();
                                var cj = ClientLib.Base.Tech.GetTechIdFromTechNameAndFaction(ClientLib.Base.ETechName.Research_BaseFound, cw);
                                var cr = player.get_PlayerResearch();
                                var cd = cr.GetResearchItemFomMdbId(cj);

                                var app = qx.core.Init.getApplication();
                                var b3 = app.getBaseNavigationBar().getChildren()[0].getChildren()[0];
                                if (b3.getChildren().length == 0) return;
                                if (!this.infoSticker) {
                                    this.infoSticker = new qx.ui.container.Composite(new qx.ui.layout.VBox().set({
                                        alignX: "right"
                                    })).set({
                                        width: 105,
                                    });

                                    var top = 130;
                                    if (this.hasStorage) {
                                        var l = localStorage["infoSticker-locked"] == "true";
                                        if (l != null) {
                                            this.locked = l;
                                            var pl = localStorage["infoSticker-pinLock"];
                                            if (pl != null) {
                                                try {
                                                    this.pinLockPos = parseInt(pl, 10);
                                                } catch (etm) {}
                                            }
                                        }

                                        var p = localStorage["infoSticker-pinned"];
                                        var t = localStorage["infoSticker-top"];
                                        if (p != null && t != null) {
                                            var tn;
                                            try {
                                                this.pinned = p == "true";
                                                if (this.pinned) {
                                                    tn = parseInt(t, 10);
                                                    top = tn;
                                                }
                                            } catch (etn) {}
                                        }
                                        this.mcvHide = localStorage["infoSticker-mcvHide"] == "true";
                                        this.repairHide = localStorage["infoSticker-repairHide"] == "true";
                                        this.rtHide = localStorage["infoSticker-repairHide"] == "true";
                                        this.resourceHide = localStorage["infoSticker-resourceHide"] == "true";
                                        this.productionHide = localStorage["infoSticker-productionHide"] == "true";
                                        this.contProductionHide = localStorage["infoSticker-contProductionHide"] == "true";
                                    }


                                    app.getDesktop().add(this.infoSticker, {
                                        right: 124,
                                        top: top
                                    });
                                    if (this.locked) {
                                        this.infoSticker.hide();
                                    }

                                    this.stickerBackground = new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                        //paddingLeft: 5,
                                        //width: 105,
                                        paddingTop: 9,
                                        paddingLeft: -4,
                                        decorator: new qx.ui.decoration.Decorator().set({
                                            backgroundImage: "webfrontend/ui/common/bgr_region_world_select_scaler.png",
                                            backgroundRepeat: "scale",
                                            widthLeft: 1,
                                            widthRight : 1,
                                            colorLeft: "#7F0707",
                                            colorRight : "#7F0707"
                                            
                                        })
                                    });

                                    this.createMCVPane();
                                    this.createMCVPopup();

                                    if (this.locked && this.pinned) {
                                        this.menuUpButton.setEnabled(true);
                                        this.menuDownButton.setEnabled(true);
                                    } else {
                                        this.menuUpButton.setEnabled(false);
                                        this.menuDownButton.setEnabled(false);
                                    }

                                    this.top_image = new qx.ui.basic.Image("ui/common/bgr_messaging_t.png").set({
                                     zIndex: 12,
                                     marginBottom: -10,
                                     marginLeft: 2,
                                     width:  124
                                    });
                                    this.top_image.setZIndex(12);
                                    this.top_image.setMarginBottom(-10);
                                    this.infoSticker.add(this.top_image);

                                    this.infoSticker.add(this.stickerBackground);
                                    //this.infoSticker.add(this.mcvPopup);

                                    this.bot_image = new qx.ui.basic.Image("ui/common/bgr_messaging_b.png").set({
                                        zIndex: 12,
                                        marginLeft: 2,
                                        width:  124
                                       });;
                                    this.infoSticker.add(this.bot_image);

                                    this.runPositionTimer();

                                    try {
                                        this.attachEvent(ClientLib.Data.MainData.GetInstance().get_Cities(), "CurrentOwnChange", ClientLib.Data.CurrentOwnCityChange, this, this.currentCityChange);
                                        this.attachEvent(ClientLib.Data.MainData.GetInstance().get_Cities(), "Change", ClientLib.Data.CitiesChange, this, this.citiesChange);
                                    } catch (eventError) {
                                        console.log("InfoSticker.EventAttach:", eventError);
                                        console.log("The script will continue to run, but with slower response speed.");
                                    }
                                }
                                this.disposeRecover();

                                if (cd == null) {
                                    if (this.mcvPopup) {
                                        //this.mcvInfoLabel.setValue("MCV ($???)");
                                        this.mcvInfoLabel.setValue("MCV<br>$???");
                                        this.mcvTimerLabel.setValue("Loading");
                                        this.mcvResearchLabel.setValue("Loading");
                                    }
                                } else {
                                    var nextLevelInfo = cd.get_NextLevelInfo_Obj();
                                    var resourcesNeeded = [];
                                    for (var i in nextLevelInfo.rr) {
                                        if (nextLevelInfo.rr[i].t > 0) {
                                            resourcesNeeded[nextLevelInfo.rr[i].t] = nextLevelInfo.rr[i].c;
                                        }
                                    }
                                    var researchNeeded = resourcesNeeded[ClientLib.Base.EResourceType.ResearchPoints];
                                    var currentResearchPoints = player.get_ResearchPoints();
                                    var XY = 100 / researchNeeded;
                                    var XYX = currentResearchPoints;
                                    var PercentageOfResearchPoints = XYX * XY;
                                    var creditsNeeded = resourcesNeeded[ClientLib.Base.EResourceType.Gold];
                                    var creditsResourceData = player.get_Credits();
                                    var creditGrowthPerHour = (creditsResourceData.Delta + creditsResourceData.ExtraBonusDelta) * ClientLib.Data.MainData.GetInstance().get_Time().get_StepsPerHour();
                                    var creditTimeLeftInHours = (creditsNeeded - player.GetCreditsCount()) / creditGrowthPerHour;
                                    this.mcvInfoLabel.setValue("MCV ($ " + this.formatNumbersCompact(creditsNeeded) + ")");
                                    //this.mcvInfoLabel.setValue("MCV<br>$" + this.formatNumbersCompact(creditsNeeded));
                                    this.mcvTimerCreditProdLabel.setValue("at " + this.formatNumbersCompact(creditGrowthPerHour * 24) + "/1d");
                                    if (creditTimeLeftInHours <= 0) {
                                        this.mcvTimerLabel.setValue("Ready");
                                    } else if (creditGrowthPerHour == 0) {
                                        this.mcvTimerLabel.setValue("No Production");
                                    } else {
                                        if (creditTimeLeftInHours >= 24 * 100) {
                                            this.mcvTimerLabel.setValue("> 99 days");
                                        } else {
                                            this.mcvTimerLabel.setValue(this.FormatTimespan(creditTimeLeftInHours * 60 * 60));
                                        }
                                    }

                                    if (PercentageOfResearchPoints >= 100) {
                                        this.mcvResearchLabel.setValue("RP: 100%");
                                    } else {
                                        this.mcvResearchLabel.setValue("RP: " + (PercentageOfResearchPoints).toFixed(2) + "%");
                                    }
                                }

                                var ncity = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity();
                                if (ncity == null) {
                                    if (this.mcvPopup) {
                                        this.repairTimerLabel.setValue("Select a base");
                                        this.repairTimeLabel0.setValue("Select a base");
                                        this.repairTimeLabel1.setValue("Select a base");
                                        this.repairTimeLabel2.setValue("Select a base");
                                        this.resourceLabel1.setValue("N/A");
                                        this.resourceLabel2.setValue("N/A");
                                        this.resourceLabel3.setValue("N/A");
                                    }
                                } else {

                                    var rt = Math.min(ncity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeInf),
                                        ncity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeVeh),
                                        ncity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeAir));
                                    if (ncity.get_CityUnitsData().get_UnitLimitOffense() == 0) {
                                        this.repairTimerLabel.setValue("No army");
                                    } else {
                                        this.repairTimerLabel.setValue(this.FormatTimespan(rt));
                                    }

                                    var airRT = ncity.get_CityUnitsData().GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Aircraft, false);
                                    if (ncity.get_CityUnitsData().GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Aircraft, false) == 0) {
                                        this.repairTimeLabel0.setValue("No birds");
                                    } else {
                                        this.repairTimeLabel0.setValue(this.FormatTimespan(airRT) + " AIR");
                                    }

                                    var vehRT = ncity.get_CityUnitsData().GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Vehicle, false);
                                    if (ncity.get_CityUnitsData().GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Vehicle, false) == 0) {
                                        this.repairTimeLabel1.setValue("No cars");
                                    } else {
                                        this.repairTimeLabel1.setValue(this.FormatTimespan(vehRT) + " VEH");
                                    }
                                    var infRT = ncity.get_CityUnitsData().GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Infantry, false);
                                    if (ncity.get_CityUnitsData().GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Aircraft, false) == 0) {
                                        this.repairTimeLabel2.setValue("No dudes");
                                    } else {
                                        this.repairTimeLabel2.setValue(this.FormatTimespan(infRT) + " INF");
                                    }
                                    //this.repairTimerLabel0.setValue(this.FormatTimespan(airRT));
                                    //this.repairTimerLabel1.setValue(this.FormatTimespan(vehRT));
                                    //this.repairTimerLabel2.setValue(this.FormatTimespan(infRT));

                                    var tib = ncity.GetResourceCount(ClientLib.Base.EResourceType.Tiberium);
                                    var tibMax = ncity.GetResourceMaxStorage(ClientLib.Base.EResourceType.Tiberium);
                                    var tibRatio = tib / tibMax;
                                    this.resourceLabel1.setTextColor(this.formatNumberColor(tib, tibMax));
                                    this.resourceLabel1.setValue(this.formatNumbersCompact(tib));
                                    this.resourceLabel1per.setValue(this.formatPercent(tibRatio));

                                    var cry = ncity.GetResourceCount(ClientLib.Base.EResourceType.Crystal);
                                    var cryMax = ncity.GetResourceMaxStorage(ClientLib.Base.EResourceType.Crystal);
                                    var cryRatio = cry / cryMax;
                                    this.resourceLabel2.setTextColor(this.formatNumberColor(cry, cryMax));
                                    this.resourceLabel2.setValue(this.formatNumbersCompact(cry));
                                    this.resourceLabel2per.setValue(this.formatPercent(cryRatio));

                                    var power = ncity.GetResourceCount(ClientLib.Base.EResourceType.Power);
                                    var powerMax = ncity.GetResourceMaxStorage(ClientLib.Base.EResourceType.Power);
                                    var powerRatio = power / powerMax;
                                    this.resourceLabel3.setTextColor(this.formatNumberColor(power, powerMax));
                                    this.resourceLabel3.setValue(this.formatNumbersCompact(power));
                                    this.resourceLabel3per.setValue(this.formatPercent(powerRatio));


                                    var powerCont = ncity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Power, false, false);
                                    var powerBonus = ncity.GetResourceBonusGrowPerHour(ClientLib.Base.EResourceType.Power);
                                    var alliance = ClientLib.Data.MainData.GetInstance().get_Alliance();
                                    var powerAlly = alliance.GetPOIBonusFromResourceType(ClientLib.Base.EResourceType.Power);
                                    var powerProd = (powerCont + powerAlly);
                                    var powerPac = (powerCont + powerAlly + powerBonus) * 6;
                                    if (powerRatio >= 1) {
                                        powerProd = 0;
                                        powerPac = (powerBonus) * 6;

                                    }


                                    var tiberiumCont = ncity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Tiberium, false, false);
                                    var tiberiumBonus = ncity.GetResourceBonusGrowPerHour(ClientLib.Base.EResourceType.Tiberium);
                                    //var alliance = ClientLib.Data.MainData.GetInstance().get_Alliance();
                                    var tiberiumAlly = alliance.GetPOIBonusFromResourceType(ClientLib.Base.EResourceType.Tiberium);
                                    var tiberiumPac = (tiberiumCont + tiberiumAlly + tiberiumBonus) * 6;
                                    var tiberiumProd = (tiberiumCont + tiberiumAlly);
                                    if (tibRatio >= 1) {
                                        tiberiumProd = 0;
                                        tiberiumPac = (tiberiumBonus) * 6;

                                    }

                                    var crystalCont = ncity.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Crystal, false, false);
                                    var crystalBonus = ncity.GetResourceBonusGrowPerHour(ClientLib.Base.EResourceType.Crystal);
                                    //var alliance = ClientLib.Data.MainData.GetInstance().get_Alliance();
                                    var crystalAlly = alliance.GetPOIBonusFromResourceType(ClientLib.Base.EResourceType.Crystal);
                                    var crystalPac = (crystalCont + crystalAlly + crystalBonus) * 6;
                                    var crystalProd = (crystalCont + crystalAlly);

                                    if (cryRatio >= 1) {
                                        crystalProd = 0;
                                        crystalPac = (crystalBonus) * 6;

                                    }


                                    var creditCont = ClientLib.Base.Resource.GetResourceGrowPerHour(ncity.get_CityCreditsProduction(), false);
                                    var creditBonus = ClientLib.Base.Resource.GetResourceBonusGrowPerHour(ncity.get_CityCreditsProduction(), false);
                                    var creditProd = (creditCont + creditBonus) * 6;

                                    if (ncity.get_hasCooldown() == true) {

                                        powerPac = (powerCont + powerAlly) * 6;
                                        creditProd = (creditCont) * 6;
                                        crystalPac = (crystalCont + crystalAlly) * 6;
                                        tiberiumPac = (tiberiumCont + tiberiumAlly) * 6;
                                    }

                                    this.productionLabelTiberium.setValue(this.formatNumbersCompact(tiberiumPac) + "/6h");
                                    this.productionLabelCrystal.setValue(this.formatNumbersCompact(crystalPac) + "/6h");
                                    this.productionLabelPower1.setValue(this.formatNumbersCompact(powerPac) + "/6h");
                                    this.productionLabelCredit.setValue(this.formatNumbersCompact(creditProd) + "/6h");

                                    this.contProductionLabelTiberium.setValue(this.formatNumbersCompact(tiberiumProd) + "/h");
                                    this.contProductionLabelCrystal.setValue(this.formatNumbersCompact(crystalProd) + "/h");
                                    this.contProductionLabelPower.setValue(this.formatNumbersCompact(powerProd) + "/h");
                                    this.contProductionLabelCredit.setValue(this.formatNumbersCompact(creditCont) + "/h");


                                }
                            } catch (e) {
                                console.log("InfoSticker.calculateInfoData", e.toString());
                            }
                        },
                        formatPercent: function (value) {
                            return value > 999 / 100 ? ">999%" : this.formatNumbersCompact(value * 100, 0) + "%";
                            //return this.formatNumbersCompact(value*100, 0) + "%";
                        },
                        formatNumberColor: function (value, max) {
                            var ratio = value / max;

                            var color;
                            var green = [40, 150, 40];
                            var middle = [181, 151, 0];
                            var red = [157, 43, 43];

                            if (ratio < 0.5) color = green;
                            else if (ratio < 0.75) color = this.interpolateColor(green, middle, (ratio - 0.5) / 0.25);
                            else if (ratio < 1) color = this.interpolateColor(middle, red, (ratio - 0.75) / 0.25);
                            else color = red;

                            //console.log(qx.util.ColorUtil.rgbToHexString(color));
                            return qx.util.ColorUtil.rgbToHexString(color);
                        },
                        interpolateColor: function (color1, color2, s) {
                            //console.log("interp "+s+ " " + color1[1]+" " +color2[1]+" " +(color1[1]+s*(color2[1]-color1[1])));
                            return [Math.floor(color1[0] + s * (color2[0] - color1[0])),
                                Math.floor(color1[1] + s * (color2[1] - color1[1])),
                                Math.floor(color1[2] + s * (color2[2] - color1[2]))
                            ];
                        },
                        formatNumbersCompact: function (value, decimals) {
                            if (decimals == undefined) decimals = 2;
                            var valueStr;
                            var unit = "";
                            if (value < 1000) valueStr = value.toString();
                            else if (value < 1000 * 1000) {
                                valueStr = (value / 1000).toString();
                                unit = "k";
                            } else if (value < 1000 * 1000 * 1000) {
                                valueStr = (value / 1000000).toString();
                                unit = "M";
                            } else {
                                valueStr = (value / 1000000000).toString();
                                unit = "G";
                            }
                            if (valueStr.indexOf(".") >= 0) {
                                var whole = valueStr.substring(0, valueStr.indexOf("."));
                                if (decimals === 0) {
                                    valueStr = whole;
                                } else {
                                    var fraction = valueStr.substring(valueStr.indexOf(".") + 1);
                                    if (fraction.length > decimals) fraction = fraction.substring(0, decimals);
                                    valueStr = whole + "." + fraction;
                                }
                            }

                            valueStr = valueStr + unit;
                            return valueStr;
                        },
                        FormatTimespan: function (value) {
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
                    }
                });
            }
        } catch (e) {
            console.log("InfoSticker: createInfoSticker: ", e.toString());
        }

        function InfoSticker_checkIfLoaded() {
            try {
                if (typeof qx != 'undefined' && qx.core.Init.getApplication() && qx.core.Init.getApplication().getUIItem(ClientLib.Data.Missions.PATH.BAR_NAVIGATION) && qx.core.Init.getApplication().getUIItem(ClientLib.Data.Missions.PATH.BAR_NAVIGATION).isVisible()) {
                    createInfoSticker();
                    window.InfoSticker.Base.getInstance().initialize();
                } else {
                    window.setTimeout(InfoSticker_checkIfLoaded, 1000);
                }
            } catch (e) {
                console.log("InfoSticker_checkIfLoaded: ", e.toString());
            }
        }
        if (/commandandconquer\.com/i.test(document.domain)) {
            window.setTimeout(InfoSticker_checkIfLoaded, 1000);
        }
    }
    try {
        var InfoStickerScript = document.createElement("script");
        InfoStickerScript.innerHTML = "(" + InfoSticker_main.toString() + ")();";
        InfoStickerScript.type = "text/javascript";
        if (/commandandconquer\.com/i.test(document.domain)) {
            document.getElementsByTagName("head")[0].appendChild(InfoStickerScript);
        }
    } catch (e) {
        console.log("InfoSticker: init error: ", e.toString());
    }
})();