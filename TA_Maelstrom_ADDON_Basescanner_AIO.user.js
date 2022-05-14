// ==UserScript==
// @name        Maelstrom ADDON Basescanner AIO
// @match     https://*.alliances.commandandconquer.com/*/index.aspx*
// @description Maelstrom ADDON Basescanner All in One (Infected Camps + Growth Rate + New Layout Info)
// @version     1.8.21
// @author      BlinDManX + chertosha + Netquik
// @contributor AlkalyneD4 Patch 19.3 fix
// @contributor nefrontheone ES Translation
// @contributor Netquik (https://github.com/netquik) 
// @grant       none
// @copyright   2012+, Claus Neumann
// @license     CC BY-NC-ND 3.0 - http://creativecommons.org/licenses/by-nc-nd/3.0/
// @updateURL   https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_Maelstrom_ADDON_Basescanner_AIO.user.js
// ==/UserScript==


/* 
codes by NetquiK
----------------
- Sync with Base Scanner Basic code
- Layout Scan Modding 2
- Save window pos and dimension
- Fix needcp when cached city
- Sort for Growrate
- All Layouts selection + Highlight
- NOEVIL
- Disable GrowRate Opt
- New Rule Out check for base list
- Reorder Columns Save State
- Sorting Columns fixed
- SpeedUP+
- Fix WorldCity Wrappers Regex
----------------
*/

(function () {
    var MaelstromTools_Basescanner = function () {
        window.__msbs_version = "1.8.20 AIO";

        function createMaelstromTools_Basescanner() {
            // MOD new rowrender for new rule out
            qx.Class.define("AIORowR", {
                extend: qx.ui.table.rowrenderer.Default,
                implement: qx.ui.table.IRowRenderer,
                members: {

                    /** Overridden to handle our custom logic for row colouring */
                    updateDataRowElement: function (rowInfo, rowElem) {
                        this.base(arguments, rowInfo, rowElem);
                        var style = rowElem.style;
                        // Don't overwrite the style on the focused / selected row
                        if (!(rowInfo.focusedRow && this.getHighlightFocusRow()) && !rowInfo.selected) {
                            style.backgroundColor = (rowInfo.rowData[24] == !0) ? '#999' : this._colors.bgcolOdd;
                        }
                    },

                    /** Overridden to handle our custom logic for row colouring */
                    createRowStyle: function (rowInfo) {
                        var rowStyle = [];
                        rowStyle.push(";");
                        if (this._fontStyleString) {
                            rowStyle.push(this._fontStyleString);
                        } else {
                            rowStyle.push(qx.bom.element.Style.compile(qx.theme.manager.Font.getInstance().resolve('default').getStyles()).replace(/"/g, "'"));
                        }
                        rowStyle.push("background-color:");
                        if (rowInfo.focusedRow && this.getHighlightFocusRow()) {
                            rowStyle.push(rowInfo.selected ? this._colors.bgcolFocusedSelected : this._colors.bgcolFocused);
                        } else {
                            if (rowInfo.selected) {
                                rowStyle.push(this._colors.bgcolSelected);
                            } else {
                                rowStyle.push((rowInfo.rowData[24] == !0) ? '#999' : this._colors.bgcolOdd);
                            }
                        }
                        // Finish off the style string
                        rowStyle.push(';color:');
                        rowStyle.push(rowInfo.selected ? this._colors.colSelected : this._colors.colNormal);
                        rowStyle.push(';border-bottom: 1px solid ', this._colors.horLine);
                        return rowStyle.join("");

                    }
                }

            });
            qx.Class.define("Addons.BaseScannerGUI", {
                type: "singleton",
                extend: qx.ui.window.Window,
                construct: function () {
                    try {
                        this.base(arguments);
                        console.info("Addons.BaseScannerGUI " + window.__msbs_version);
                        this.T = Addons.Language.getInstance();
                        this.setWidth(Addons.LocalStorage.getserver("Basescanner_GUIWidth_", 1550)); // width from saved
                        this.setHeight(Addons.LocalStorage.getserver("Basescanner_GUIHeight_", 400)); // height from saved
                        this.setContentPadding(10);
                        this.setShowMinimize(true);
                        this.setShowMaximize(true);
                        this.setShowClose(true);
                        this.setResizable(true);
                        this.setAllowMaximize(true);
                        this.setAllowMinimize(true);
                        this.setAllowClose(true);
                        this.setShowStatusbar(false);
                        this.setDecorator(null);
                        this.setPadding(5);
                        this.setLayout(new qx.ui.layout.VBox(3));
                        this.FI();
                        this.FH();
                        this.FD();
                        if (this.ZE == null) {
                            this.ZE = [];
                        }
                        this.setPadding(0);
                        this.removeAll();
                        this.add(this.ZF);
                        this.add(this.ZN);
                        this.add(this.ZP);
                        this.ZL.setData(this.ZE);
                    } catch (e) {
                        console.debug("Addons.BaseScannerGUI.construct: ", e);
                    }
                },
                members: {
                    // pictures
                    T: null,
                    ZA: 0,
                    ZB: null,
                    ZC: null,
                    ZD: null,
                    ZE: null,
                    ZF: null,
                    ZG: null,
                    ZH: false,
                    ZI: true,
                    ZJ: null,
                    ZK: null,
                    ZL: null,
                    ZM: null,
                    crysCounter: null,
                    tibCounter: null,
                    ZN: null,
                    ZO: null,
                    ZP: null,
                    ZQ: null,
                    ZR: [],
                    ZT: true,
                    ZU: null,
                    ZV: null,
                    ZX: null,
                    ZY: null,
                    ZZ: [],
                    ZS: {},
                    YZ: null,
                    YY: null,
                    openWindow: function (title) {
                        try {
                            this.setCaption(title);
                            if (this.isVisible()) {
                                this.close();
                            } else {
                                MT_Cache.updateCityCache();
                                MT_Cache = window.MaelstromTools.Cache.getInstance();
                                var cname;
                                this.ZC.removeAll();
                                for (cname in MT_Cache.Cities) {
                                    var item = new qx.ui.form.ListItem(cname, null, MT_Cache.Cities[cname].Object);
                                    this.ZC.add(item);
                                    if (Addons.LocalStorage.getserver("Basescanner_LastCityID") == MT_Cache.Cities[cname].Object.get_Id()) {
                                        this.ZC.setSelection([item]);
                                    }
                                }
                                this.open();
                                this.moveTo(Addons.LocalStorage.getserver("Basescanner_GUILeft_", 100), Addons.LocalStorage.getserver("Basescanner_GUITop_", 100));
                            }
                        } catch (e) {
                            console.log("MaelstromTools.DefaultObject.openWindow: ", e);
                        }
                    },
                    FI: function () {
                        try {
                            this.ZL = new qx.ui.table.model.Simple();
                            this.ZL.setColumns(["ID", "LoadState", this.T.get("City"), this.T.get("Location"), this.T.get("Level"), this.T.get("Tiberium"), this.T.get("Crystal"), this.T.get("Dollar"), this.T.get("Research"), "Crystalfields", "Tiberiumfields", this.T.get("Building state"), this.T.get("Defense state"), this.T.get("CP"), "Growth Rate", "Sum Tib+Cry+Cre", "(Tib+Cry+Cre)/CP", "CY", "DF", this.T.get("base set up at"), "Power8", "7 | 6 | 5 | 4 Tib", "7 | 6 | 5 | 4 Cry", "7 | 6 | 5 | 4 Mix", "Rule OUT"]);
                            this.YY = ClientLib.Data.MainData.GetInstance().get_Player();
                            this.ZN = new qx.ui.table.Table(this.ZL);
                            //this.ZN.setAlwaysUpdateCells(true);
                            this.ZN.setColumnVisibilityButtonVisible(false);
                            this.ZN.setDataRowRenderer(new AIORowR(this.ZN));
                            this.ZN.setColumnWidth(0, 0);
                            this.ZN.setColumnWidth(1, 0);
                            this.ZN.setColumnWidth(2, Addons.LocalStorage.getserver("Basescanner_ColWidth_2", 120));
                            this.ZN.setColumnWidth(3, Addons.LocalStorage.getserver("Basescanner_ColWidth_3", 70));
                            this.ZN.setColumnWidth(4, Addons.LocalStorage.getserver("Basescanner_ColWidth_4", 50));
                            this.ZN.setColumnWidth(5, Addons.LocalStorage.getserver("Basescanner_ColWidth_5", 60));
                            this.ZN.setColumnWidth(6, Addons.LocalStorage.getserver("Basescanner_ColWidth_6", 60));
                            this.ZN.setColumnWidth(7, Addons.LocalStorage.getserver("Basescanner_ColWidth_7", 60));
                            this.ZN.setColumnWidth(8, Addons.LocalStorage.getserver("Basescanner_ColWidth_8", 60));
                            this.ZN.setColumnWidth(9, Addons.LocalStorage.getserver("Basescanner_ColWidth_9", 30));
                            this.ZN.setColumnWidth(10, Addons.LocalStorage.getserver("Basescanner_ColWidth_10", 30));
                            this.ZN.setColumnWidth(11, Addons.LocalStorage.getserver("Basescanner_ColWidth_11", 50));
                            this.ZN.setColumnWidth(12, Addons.LocalStorage.getserver("Basescanner_ColWidth_12", 50));
                            this.ZN.setColumnWidth(13, Addons.LocalStorage.getserver("Basescanner_ColWidth_13", 30));
                            this.ZN.setColumnWidth(14, Addons.LocalStorage.getserver("Basescanner_ColWidth_14", 60));
                            this.ZN.setColumnWidth(15, Addons.LocalStorage.getserver("Basescanner_ColWidth_15", 60));
                            this.ZN.setColumnWidth(16, Addons.LocalStorage.getserver("Basescanner_ColWidth_16", 60));
                            this.ZN.setColumnWidth(17, Addons.LocalStorage.getserver("Basescanner_ColWidth_17", 50));
                            this.ZN.setColumnWidth(18, Addons.LocalStorage.getserver("Basescanner_ColWidth_18", 50));
                            this.ZN.setColumnWidth(19, Addons.LocalStorage.getserver("Basescanner_ColWidth_19", 40));
                            this.ZN.setColumnWidth(20, Addons.LocalStorage.getserver("Basescanner_ColWidth_20", 60));
                            this.ZN.setColumnWidth(21, Addons.LocalStorage.getserver("Basescanner_ColWidth_21", 100));
                            this.ZN.setColumnWidth(22, Addons.LocalStorage.getserver("Basescanner_ColWidth_22", 100));
                            this.ZN.setColumnWidth(23, Addons.LocalStorage.getserver("Basescanner_ColWidth_23", 150));
                            this.ZN.setColumnWidth(24, Addons.LocalStorage.getserver("Basescanner_ColWidth_24", 64));
                            var c = 0;
                            var tcm = this.ZN.getTableColumnModel();
                            // MOD coloring layout filtering

                            var high5 = new qx.ui.table.cellrenderer.Conditional();
                            var high4 = new qx.ui.table.cellrenderer.Conditional();
                            var highPow = new qx.ui.table.cellrenderer.Conditional();
                            var highGrow = new qx.ui.table.cellrenderer.Conditional();
                            high5.addRegex("(?:([0-9]) \\| [1-9] \\| [0-9] \\| [0-9])|(?:([1-9]) \\| [0-9] \\| [0-9] \\| [0-9])|(?:([0-9]) \\| [0-9] \\| [1-9] \\| [0-9])", null, "#DD0022", null, "700", null);
                            high4.addRegex("(?:([0-9]) \\| [1-9] \\| [0-9] \\| [0-9])|(?:([1-9]) \\| [0-9] \\| [0-9] \\| [0-9])|(?:([0-9]) \\| [0-9] \\| [1-9] \\| [0-9])", null, "#DD0022", null, "700", null);
                            high5.addRegex("(?:0 \\| 0 \\| 0 \\| [2-9])", null, "#f48115", null, "700", null);
                            high5.addRegex("(?:0 \\| 0 \\| 0 \\| [0-1])", null, "#0a6ba4", null, "700", null);
                            high4.addRegex("(?:0 \\| 0 \\| 0 \\| [0-9])", null, "#0a6ba4", null, "700", null);
                            highPow.addNumericCondition(">", 1, null, "#DD0022", null, "700", null);
                            highPow.addNumericCondition("<=", 1, null, "#0a6ba4", null, "700", null);
                            highGrow.addNumericCondition(">", 4, null, "#DD0022", null, "700", null);
                            highGrow.addBetweenCondition("between", 3, 4, null, "#f48115", null, "700", null);
                            highGrow.addNumericCondition("<", 3, null, "#0a6ba4", null, "700", null);
                            tcm.setDataCellRenderer(20, highPow);
                            tcm.setDataCellRenderer(21, high5);
                            tcm.setDataCellRenderer(22, high4);
                            tcm.setDataCellRenderer(23, high4);
                            tcm.setDataCellRenderer(14, highGrow);
                            // MOD new colorder save for new rule out
                            var col_order = Addons.LocalStorage.getserver("Basescanner_Col_Order", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 24, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
                            for (c = 0; c < this.ZL.getColumnCount(); c++) {
                                if (c == 11 || c == 12) {
                                    tcm.setColumnVisible(c, Addons.LocalStorage.getserver("Basescanner_Column_" + c, false));
                                } else {
                                    tcm.setColumnVisible(c, Addons.LocalStorage.getserver("Basescanner_Column_" + c, true));
                                }
                            }
                            tcm.setColumnVisible(0, false);
                            tcm.setColumnVisible(1, false);
                            tcm.setColumnsOrder(col_order);

                            tcm.setHeaderCellRenderer(9, new qx.ui.table.headerrenderer.Icon(MT_Base.images[MaelstromTools.Statics.Crystal]), "Crystalfields");
                            tcm.setHeaderCellRenderer(10, new qx.ui.table.headerrenderer.Icon(MT_Base.images[MaelstromTools.Statics.Tiberium], "Tiberiumfields"));
                            tcm.setDataCellRenderer(5, new qx.ui.table.cellrenderer.Replace().set({
                                ReplaceFunction: this.FA
                            }));
                            tcm.setDataCellRenderer(6, new qx.ui.table.cellrenderer.Replace().set({
                                ReplaceFunction: this.FA
                            }));
                            tcm.setDataCellRenderer(7, new qx.ui.table.cellrenderer.Replace().set({
                                ReplaceFunction: this.FA
                            }));
                            tcm.setDataCellRenderer(8, new qx.ui.table.cellrenderer.Replace().set({
                                ReplaceFunction: this.FA
                            }));
                            tcm.setDataCellRenderer(15, new qx.ui.table.cellrenderer.Replace().set({
                                ReplaceFunction: this.FA
                            }));
                            tcm.setDataCellRenderer(16, new qx.ui.table.cellrenderer.Replace().set({
                                ReplaceFunction: this.FA
                            }));
                            tcm.setDataCellRenderer(19, new qx.ui.table.cellrenderer.Boolean());
                            tcm.setDataCellRenderer(24, new qx.ui.table.cellrenderer.Boolean());
                            if (PerforceChangelist >= 436669) { // 15.3 patch
                                var eventType = "cellDbltap";
                            } else { //old
                                var eventType = "cellDblclick";
                            }
                            this.ZN.addListener(eventType, function (e) {
                                Addons.BaseScannerGUI.getInstance().FB(e);
                            }, this);
                            this.ZN.addListener("cellTap",
                                function (cellEvent) {
                                    var col = cellEvent.getColumn();
                                    var row = cellEvent.getRow();
                                    if (col == 24) {
                                        var t = Addons.BaseScannerGUI.getInstance();
                                        oldValue = t.ZL.getValue(col, row);
                                        t.ZL.setValue(col, row, !oldValue);
                                        t.ZN.getSelectionModel().resetSelection();
                                        t.ZN.clearFocusedRowHighlight();
                                    }
                                });
                            tcm.addListener("widthChanged", function (e) {
                                //console.log(e, e.getData());
                                var col = e.getData().col;
                                var width = e.getData().newWidth;
                                Addons.LocalStorage.setserver("Basescanner_ColWidth_" + col, width);
                            }, tcm);
                            tcm.addListener("orderChanged", function (e) {
                                var neworder = Addons.LocalStorage.getserver("Basescanner_Col_Order", [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 24, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);

                                let a = typeof e.getData() != 'undefined' ? e.getData().fromOverXPos : null
                                let b = typeof e.getData() != 'undefined' ? e.getData().toOverXPos : null
                                if (a && b) {
                                    neworder.splice(b, 0, neworder.splice(a, 1)[0]);
                                    Addons.LocalStorage.setserver("Basescanner_Col_Order", neworder);
                                }
                                //tcm.setColumnsOrder(neworder);
                            }, tcm);
                        } catch (e) {
                            console.debug("Addons.BaseScannerGUI.FI: ", e);
                        }
                    },
                    FB: function (e) {
                        try {
                            console.log("e", e.getRow(), this.ZE);
                            var cityId = this.ZE[e.getRow()][0];
                            var posData = this.ZE[e.getRow()][3]; /* center screen */
                            if (posData != null && posData.split(':').length == 2) {
                                var posX = parseInt(posData.split(':')[0]);
                                var posY = parseInt(posData.split(':')[1]);
                                ClientLib.Vis.VisMain.GetInstance().CenterGridPosition(posX, posY);
                            } /* and highlight base */
                            if (cityId && !(this.ZK[4].getValue())) {
                                //ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentCityId(cityId);
                                //webfrontend.gui.UtilView.openCityInMainWindow(cityId);
                                //webfrontend.gui.UtilView.openVisModeInMainWindow(1, cityId, false);
                                var bk = qx.core.Init.getApplication();
                                bk.getBackgroundArea().closeCityInfo();
                                bk.getPlayArea().setView(ClientLib.Data.PlayerAreaViewMode.pavmCombatSetupDefense, cityId, 0, 0);
                            }
                            var q = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity();
                            if (q != null) q.get_CityArmyFormationsManager().set_CurrentTargetBaseId(cityId);
                        } catch (ex) {
                            console.debug("Addons.BaseScannerGUI FB error: ", ex);
                        }
                    },
                    FN: function (e) {
                        this.ZG.setLabel(this.T.get("Scan"));
                        this.ZH = false;
                    },
                    CBChanged: function (e) {
                        this.ZH = false;
                    },
                    FA: function (oValue) {
                        var f = new qx.util.format.NumberFormat();
                        f.setGroupingUsed(true);
                        f.setMaximumFractionDigits(3);
                        if (!isNaN(oValue)) {
                            if (Math.abs(oValue) < 100000) oValue = f.format(Math.floor(oValue));
                            else if (Math.abs(oValue) >= 100000 && Math.abs(oValue) < 1000000) oValue = f.format(Math.floor(oValue / 100) / 10) + "k";
                            else if (Math.abs(oValue) >= 1000000 && Math.abs(oValue) < 10000000) oValue = f.format(Math.floor(oValue / 1000) / 1000) + "M";
                            else if (Math.abs(oValue) >= 10000000 && Math.abs(oValue) < 100000000) oValue = f.format(Math.floor(oValue / 10000) / 100) + "M";
                            else if (Math.abs(oValue) >= 100000000 && Math.abs(oValue) < 1000000000) oValue = f.format(Math.floor(oValue / 100000) / 10) + "M";
                            else if (Math.abs(oValue) >= 1000000000 && Math.abs(oValue) < 10000000000) oValue = f.format(Math.floor(oValue / 1000000) / 1000) + "G";
                            else if (Math.abs(oValue) >= 10000000000 && Math.abs(oValue) < 100000000000) oValue = f.format(Math.floor(oValue / 10000000) / 100) + "G";
                            else if (Math.abs(oValue) >= 100000000000 && Math.abs(oValue) < 1000000000000) oValue = f.format(Math.floor(oValue / 100000000) / 10) + "G";
                            else if (Math.abs(oValue) >= 1000000000000 && Math.abs(oValue) < 10000000000000) oValue = f.format(Math.floor(oValue / 1000000000) / 1000) + "T";
                            else if (Math.abs(oValue) >= 10000000000000 && Math.abs(oValue) < 100000000000000) oValue = f.format(Math.floor(oValue / 10000000000) / 100) + "T";
                            else if (Math.abs(oValue) >= 100000000000000 && Math.abs(oValue) < 1000000000000000) oValue = f.format(Math.floor(oValue / 100000000000) / 10) + "T";
                            else if (Math.abs(oValue) >= 1000000000000000) oValue = f.format(Math.floor(oValue / 1000000000000)) + "T";
                        };
                        return oValue.toString();
                    },
                    // updateCache : function () {
                    // try {}
                    // catch (e) {
                    // console.debug("Addons.BaseScannerGUI.updateCache: ", e);
                    // }
                    // },
                    // setWidgetLabels : function () {
                    // try {
                    // if (!this.ZL) {
                    // this.FC();
                    // }
                    // this.ZL.setData(this.ZE);
                    // } catch (e) {
                    // console.debug("Addons.BaseScannerGUI.setWidgetLabels: ", e);
                    // }
                    // },
                    FH: function () {
                        // FIXME buttons positions
                        //mod GUI by Netquik
                        try {
                            var oBox = new qx.ui.layout.Flow();
                            var oOptions = new qx.ui.container.Composite(oBox);
                            this.ZC = new qx.ui.form.SelectBox();
                            this.ZC.setHeight(25);
                            this.ZC.setMargin(5);
                            this.ZC.setMarginTop(0);
                            MT_Cache.updateCityCache();
                            MT_Cache = window.MaelstromTools.Cache.getInstance();
                            var cname;
                            for (cname in MT_Cache.Cities) {
                                var item = new qx.ui.form.ListItem(cname, null, MT_Cache.Cities[cname].Object);
                                this.ZC.add(item);
                                if (Addons.LocalStorage.getserver("Basescanner_LastCityID") == MT_Cache.Cities[cname].Object.get_Id()) {
                                    this.ZC.setSelection([item]);
                                }
                            }
                            this.ZC.addListener("changeSelection", function (e) {
                                this.FP(0, 1, 200);
                                this.ZH = false;
                                this.ZG.setLabel(this.T.get("Scan"));
                            }, this);
                            oOptions.add(this.ZC);
                            var l = new qx.ui.basic.Label().set({
                                value: this.T.get("CP Limit"),
                                textColor: "white",
                                margin: 5
                            });
                            oOptions.add(l);
                            this.ZQ = new qx.ui.form.SelectBox();
                            this.ZQ.setWidth(50);
                            this.ZQ.setHeight(25);
                            this.ZQ.setMargin(5);
                            this.ZQ.setMarginTop(0);
                            var limiter = Addons.LocalStorage.getserver("Basescanner_Cplimiter", 25);
                            for (var m = 11; m < 42; m += 1) {
                                item = new qx.ui.form.ListItem("" + m, null, m);
                                this.ZQ.add(item);
                                if (limiter == m) {
                                    this.ZQ.setSelection([item]);
                                }
                            }
                            this.ZQ.addListener("changeSelection", function (e) {
                                this.ZE = [];
                                this.FP(0, 1, 200);
                                this.ZH = false;
                                this.ZG.setLabel(this.T.get("Scan"));
                            }, this);
                            oOptions.add(this.ZQ);
                            var la = new qx.ui.basic.Label().set({
                                value: this.T.get("min Level"),
                                textColor: "white",
                                margin: 5
                            });
                            oOptions.add(la);
                            var minlevel = Addons.LocalStorage.getserver("Basescanner_minLevel", "1");
                            this.ZY = new qx.ui.form.TextField(minlevel).set({
                                width: 50
                            });
                            oOptions.add(this.ZY);
                            this.ZK = [];
                            this.ZK[0] = new qx.ui.form.CheckBox(this.T.get("Player"));
                            this.ZK[0].setMargin(5);
                            this.ZK[0].setTextColor("white");
                            this.ZK[0].setGap(3);
                            this.ZK[0].setValue(Addons.LocalStorage.getserver("Basescanner_Show0", false));
                            this.ZK[0].addListener("changeValue", function (e) {
                                this.ZE = [];
                                this.FP(0, 1, 200);
                                this.ZH = false;
                                this.ZG.setLabel(this.T.get("Scan"));
                            }, this);
                            oOptions.add(this.ZK[0]);
                            this.ZK[1] = new qx.ui.form.CheckBox(this.T.get("Bases"));
                            this.ZK[1].setMargin(5);
                            this.ZK[1].setGap(3);
                            this.ZK[1].setTextColor("white");
                            this.ZK[1].setValue(Addons.LocalStorage.getserver("Basescanner_Show1", false));
                            this.ZK[1].addListener("changeValue", function (e) {
                                this.ZE = [];
                                this.FP(0, 1, 200);
                                this.ZH = false;
                                this.ZG.setLabel(this.T.get("Scan"));
                            }, this);
                            oOptions.add(this.ZK[1]);
                            this.ZK[2] = new qx.ui.form.CheckBox(this.T.get("Outpost"));
                            this.ZK[2].setMargin(5);
                            this.ZK[2].setGap(3);
                            this.ZK[2].setTextColor("white");
                            this.ZK[2].setValue(Addons.LocalStorage.getserver("Basescanner_Show2", false));
                            this.ZK[2].addListener("changeValue", function (e) {
                                this.ZE = [];
                                this.FP(0, 1, 200);
                                this.ZH = false;
                                this.ZG.setLabel(this.T.get("Scan"));
                            }, this);
                            oOptions.add(this.ZK[2]);
                            this.ZK[3] = new qx.ui.form.CheckBox(this.T.get("Camp"));
                            this.ZK[3].setMargin(5);
                            this.ZK[3].setGap(3);
                            this.ZK[3].setTextColor("white");
                            this.ZK[3].setValue(Addons.LocalStorage.getserver("Basescanner_Show3", true));
                            this.ZK[3].addListener("changeValue", function (e) {
                                this.ZE = [];
                                this.FP(0, 1, 200);
                                this.ZH = false;
                                this.ZG.setLabel(this.T.get("Scan"));
                            }, this);
                            oOptions.add(this.ZK[3], {
                                lineBreak: true
                            });
                            this.ZG = new qx.ui.form.Button(this.T.get("Scan")).set({
                                width: 100,
                                minWidth: 100,
                                maxWidth: 100,
                                height: 25,
                                margin: 5,
                                marginTop: 0
                            });
                            this.ZG.addListener("execute", function () {
                                this.FE();
                            }, this);
                            oOptions.add(this.ZG);
                            var border = new qx.ui.decoration.Decorator(2, "solid", "blue");
                            this.ZV = new qx.ui.container.Composite(new qx.ui.layout.Basic()).set({
                                decorator: border,
                                backgroundColor: "red",
                                allowGrowX: false,
                                height: 20,
                                width: 200,
                                marginTop: 2
                            });
                            this.ZU = new qx.ui.core.Widget().set({
                                decorator: null,
                                backgroundColor: "green",
                                width: 0
                            });
                            this.ZV.add(this.ZU);
                            this.ZX = new qx.ui.basic.Label("").set({
                                decorator: null,
                                textAlign: "center",
                                width: 200,
                            });
                            this.ZV.add(this.ZX, {
                                left: 0,
                                top: 1
                            });
                            oOptions.add(this.ZV);
                            this.YZ = new qx.ui.form.Button(this.T.get("clear Cache")).set({
                                minWidth: 100,
                                height: 25,
                                margin: 5,
                                marginTop: 0
                            });
                            this.YZ.addListener("execute", function () {
                                this.ZZ = [];
                            }, this);
                            oOptions.add(this.YZ);
                            this.ZK[4] = new qx.ui.form.CheckBox(this.T.get("Only center on World"));
                            this.ZK[4].setMargin(5);
                            this.ZK[4].setGap(2);
                            this.ZK[4].setTextColor("white");
                            oOptions.add(this.ZK[4], {
                                lineBreak: false
                            });
                            this.ZK[5] = new qx.ui.form.CheckBox(this.T.get("Disable Growth Rate"));
                            this.ZK[5].setMargin(5);
                            this.ZK[5].setGap(2);
                            this.ZK[5].setTextColor("white");
                            this.ZK[5].setValue(Addons.LocalStorage.getserver("Basescanner_ShowGrow", false));
                            //MOD Disable GrowRate Opt
                            this.ZK[5].addListener("changeValue", function (e) {
                                this.GR_Fill = !e.getData();
                                this.ZH = false;
                                this.ZG.setLabel(this.T.get("Scan"));
                            }, this);
                            oOptions.add(this.ZK[5], {
                                lineBreak: true
                            });
                            this.ZJ = new qx.ui.form.SelectBox();
                            this.ZJ.setWidth(150);
                            this.ZJ.setHeight(25);
                            this.ZJ.setMargin(5);
                            var item = new qx.ui.form.ListItem(this.T.get("All Layouts"), null, 0);
                            this.ZJ.add(item);
                            item = new qx.ui.form.ListItem("7 " + this.T.get(MaelstromTools.Statics.Tiberium) + " 5 " + this.T.get(MaelstromTools.Statics.Crystal), null, 7);
                            this.ZJ.add(item);
                            item = new qx.ui.form.ListItem("6 " + this.T.get(MaelstromTools.Statics.Tiberium) + " 6 " + this.T.get(MaelstromTools.Statics.Crystal), null, 6);
                            this.ZJ.add(item);
                            item = new qx.ui.form.ListItem("5 " + this.T.get(MaelstromTools.Statics.Tiberium) + " 7 " + this.T.get(MaelstromTools.Statics.Crystal), null, 5);
                            this.ZJ.add(item);
                            oOptions.add(this.ZJ);
                            this.ZD = new qx.ui.form.Button(this.T.get("Get Layouts")).set({
                                width: 120,
                                minWidth: 120,
                                maxWidth: 120,
                                height: 25,
                                margin: 5
                            });
                            this.ZD.addListener("execute", function () {
                                var layout = window.Addons.BaseScannerLayout.getInstance();
                                layout.openWindow(this.T.get("BaseScanner Layout"));
                            }, this);
                            this.ZD.setEnabled(false);
                            oOptions.add(this.ZD);

                            var columnsel = new qx.ui.layout.Flow();
                            this.ZB = new qx.ui.container.Composite(columnsel);
                            this.ZB.setWidth(this.getWidth() - 44);
                            //oOptions.add(this.ZB, {flex:1});
                            //var J = webfrontend.gui.layout.Loader.getInstance();
                            //var L = J.getLayout("playerbar", this);
                            //this._ZZ = J.getElement(L, "objid", 'lblplayer');
                            //this.tableSettings = new qx.ui.groupbox.GroupBox("Visable Columns");
                            //box.add(this.tableSettings, {flex:1});
                            var k = 2;
                            for (k = 2; k < this.ZL.getColumnCount(); k++) {
                                var index = k - 2;
                                this.ZR[index] = new qx.ui.form.CheckBox(this.ZL.getColumnName(k));
                                this.ZR[index].setValue(this.ZN.getTableColumnModel().isColumnVisible(k));
                                this.ZR[index].setTextColor("white");
                                this.ZR[index].setMarginRight(10);
                                this.ZR[index].setGap(3);
                                this.ZR[index].index = k;
                                this.ZR[index].table = this.ZN;
                                this.ZR[index].addListener("changeValue", function (e) {
                                    //console.log("click", e, e.getData(), this.index);
                                    var tcm = this.table.getTableColumnModel();
                                    tcm.setColumnVisible(this.index, e.getData());
                                    Addons.LocalStorage.setserver("Basescanner_Column_" + this.index, e.getData());
                                });
                                this.ZB.add(this.ZR[index]);
                                //this.tableSettings.add( this.ZR[index] );
                            }
                            this.ZO = new qx.ui.form.Button("+").set({
                                margin: 5
                            });
                            this.ZO.addListener("execute", function () {
                                if (this.ZI) {
                                    oOptions.addAfter(this.ZB, this.ZO);
                                    this.ZB.setWidth(this.getWidth() - 44);
                                    this.ZO.setLabel("-");
                                } else {
                                    oOptions.remove(this.ZB);
                                    this.ZO.setLabel("+");
                                }
                                this.ZI = !this.ZI;
                            }, this);
                            this.ZO.setAlignX("right");
                            oOptions.add(this.ZO, {
                                lineBreak: true
                            });
                            this.ZF = oOptions;
                        } catch (e) {
                            console.debug("Addons.BaseScannerGUI.createOptions: ", e);
                        }
                    },
                    FD: function () {
                        //0.7
                        //var n = ClientLib.Data.MainData.GetInstance().get_Cities();
                        //var i = n.get_CurrentOwnCity();
                        var st = '<a href="https://sites.google.com/site/blindmanxdonate" target="_blank">Support Development of BlinDManX Addons</a>';
                        var l = new qx.ui.basic.Label().set({
                            value: st,
                            rich: true,
                            width: 800
                        });
                        this.ZP = l;
                    },
                    FE: function () {
                        var selectedBase = this.ZC.getSelection()[0].getModel();
                        ClientLib.Vis.VisMain.GetInstance().CenterGridPosition(selectedBase.get_PosX(), selectedBase.get_PosY()); //Load data of region
                        ClientLib.Vis.VisMain.GetInstance().Update();
                        ClientLib.Vis.VisMain.GetInstance().ViewUpdate();
                        ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentCityId(selectedBase.get_Id());
                        if (this.ZT) {
                            var obj = ClientLib.Data.WorldSector.WorldObjectCity.prototype;
                            //MOD FIX FOR PLAYER WRAPPERS
                            var fa = foundfnkstring(obj['$ctor'], /this\.([A-Z]{6})=\(?\(?\(?g>>9\)?\&.*d\+=f;this\.([A-Z]{6})=\(.*d\+=f;this\.[A-Z]{6}=\(/, "ClientLib.Data.WorldSector.WorldObjectCity", 2);
                            if (fa != null && fa[1].length == 6) {
                                obj.getLevel = function () {
                                    return this[fa[1]];
                                };
                            } else {
                                console.error("Error - ClientLib.Data.WorldSector.WorldObjectCity.Level undefined");
                            }
                            if (fa != null && fa[2].length == 6) {
                                obj.getID = function () {
                                    return this[fa[2]];
                                };
                            } else {
                                console.error("Error - ClientLib.Data.WorldSector.WorldObjectCity.ID undefined");
                            }
                            obj = ClientLib.Data.WorldSector.WorldObjectNPCBase.prototype;
                            var fb = foundfnkstring(obj['$ctor'], /100\){0,1};this\.(.{6})=Math.floor.*d\+=f;this\.(.{6})=\(/, "ClientLib.Data.WorldSector.WorldObjectNPCBase", 2);
                            if (fb != null && fb[1].length == 6) {
                                obj.getLevel = function () {
                                    return this[fb[1]];
                                };
                            } else {
                                console.error("Error - ClientLib.Data.WorldSector.WorldObjectNPCBase.Level undefined");
                            }
                            if (fb != null && fb[2].length == 6) {
                                obj.getID = function () {
                                    return this[fb[2]];
                                };
                            } else {
                                console.error("Error - ClientLib.Data.WorldSector.WorldObjectNPCBase.ID undefined");
                            }
                            obj = ClientLib.Data.WorldSector.WorldObjectNPCCamp.prototype;
                            var fc = foundfnkstring(obj['$ctor'], /100\){0,1};this\.(.{6})=Math.floor.*this\.(.{6})=\(*g\>\>(22|0x16)\)*\&.*=-1;\}this\.(.{6})=\(/, "ClientLib.Data.WorldSector.WorldObjectNPCCamp", 4);
                            if (fc != null && fc[1].length == 6) {
                                obj.getLevel = function () {
                                    return this[fc[1]];
                                };
                            } else {
                                console.error("Error - ClientLib.Data.WorldSector.WorldObjectNPCCamp.Level undefined");
                            }
                            if (fc != null && fc[2].length == 6) {
                                obj.getCampType = function () {
                                    return this[fc[2]];
                                };
                            } else {
                                console.error("Error - ClientLib.Data.WorldSector.WorldObjectNPCCamp.CampType undefined");
                            }
                            if (fc != null && fc[4].length == 6) {
                                obj.getID = function () {
                                    return this[fc[4]];
                                };
                            } else {
                                console.error("Error - ClientLib.Data.WorldSector.WorldObjectNPCCamp.ID undefined");
                            }
                            this.ZT = false;
                        }
                        //Firstscan
                        if (this.ZE == null) {
                            this.ZH = false;
                            this.ZG.setLabel("Pause");
                            this.ZD.setEnabled(false);
                            qx.event.Timer.once(function () {
                                this.FJ()
                            }, window.Addons.BaseScannerGUI.getInstance(), 1000);
                            return;
                        }
                        //After Pause
                        var c = 0;
                        var g = 0;
                        for (i = 0; i < this.ZE.length; i++) {
                            if (this.ZE[i][1] == -1) {
                                c++;
                            }
                            if (this.ZE[i][14] == "-") {
                                g++;
                            }
                        }
                        // GR only setvalues
                        if (this.GR_Fill && g > 0) {
                            qx.event.Timer.once(function () {
                                this.GR()
                            }, window.Addons.BaseScannerGUI.getInstance(), 1000);
                            return;
                        }
                        if (!this.ZH) {
                            this.ZG.setLabel("Pause");
                            this.ZD.setEnabled(false);
                            if (c > 0) {
                                this.ZH = true;
                                qx.event.Timer.once(function () {
                                    this.FG()
                                }, window.Addons.BaseScannerGUI.getInstance(), 1000);
                                return;
                            } else {
                                this.ZH = false;
                                //this.ZL.setData(this.ZE);
                                qx.event.Timer.once(function () {
                                    this.FJ()
                                }, window.Addons.BaseScannerGUI.getInstance(), 1000);
                            }
                        } else {
                            this.ZH = false;
                            this.ZG.setLabel(this.T.get("Scan"));
                        }
                    },
                    FP: function (value, max, maxwidth) {
                        if (this.ZU != null && this.ZX != null) {
                            this.ZU.setWidth(parseInt(value / max * maxwidth, 10));
                            this.ZX.setValue(value + "/" + max);
                        }
                    },
                    GR: function () { //MOD GR only fill
                        if (!this.GR_to_Fill) {
                            this.GR_to_Fill = []
                            for (i = 0; i < this.ZE.length; i++) {
                                if (this.ZE[i][1] == -1) {
                                    break;
                                }
                                if (this.ZE[i][14] == "-") {
                                    this.GR_to_Fill.push({
                                        "index": i,
                                        "id": this.ZE[i][0]
                                    });
                                }

                            }
                        }

                        let index = this.GR_to_Fill[0]['index'];
                        let id = this.GR_to_Fill[0]['id'];
                        if (this.ZS[id]) {
                            this.FP(index + 1, this.ZE.length, 200); //Progressbar
                            this.ZM[id] = this.ZS[id];
                            //this.ZZ[index][14] = this.maaain(id);
                            this.ZL.setValue(14, index, this.maaain(id));
                            this.ZN.updateContent();
                        }
                        this.GR_to_Fill.shift();
                        if (this.GR_to_Fill.length > 0) {
                            qx.event.Timer.once(function () {
                                this.GR()
                            }, window.Addons.BaseScannerGUI.getInstance(), 200);
                        } else {
                            this.GR_Fill = false;
                            this.GR_to_Fill = null;
                            this.FE();
                        }




                    },
                    FJ: function () {
                        try {
                            this.ZM = {};
                            this.crysCounter = {};
                            this.tibCounter = {};
                            this.ZE = [];
                            var selectedBase = this.ZC.getSelection()[0].getModel();
                            Addons.LocalStorage.setserver("Basescanner_LastCityID", selectedBase.get_Id());
                            var ZQ = this.ZQ.getSelection()[0].getModel();
                            Addons.LocalStorage.setserver("Basescanner_Cplimiter", ZQ);
                            Addons.LocalStorage.setserver("Basescanner_minLevel", this.ZY.getValue());
                            var c1 = this.ZK[0].getValue();
                            var c2 = this.ZK[1].getValue();
                            var c3 = this.ZK[2].getValue();
                            var c4 = this.ZK[3].getValue();
                            var c5 = parseInt(this.ZY.getValue(), 10);
                            var c6 = this.ZK[5].getValue();
                            //console.log("Select", c1, c2, c3,c4,c5);
                            Addons.LocalStorage.setserver("Basescanner_Show0", c1);
                            Addons.LocalStorage.setserver("Basescanner_Show1", c2);
                            Addons.LocalStorage.setserver("Basescanner_Show2", c3);
                            Addons.LocalStorage.setserver("Basescanner_Show3", c4);
                            Addons.LocalStorage.setserver("Basescanner_ShowGrow", c6);
                            var posX = selectedBase.get_PosX();
                            var posY = selectedBase.get_PosY();
                            var scanX = 0;
                            var scanY = 0;
                            var world = ClientLib.Data.MainData.GetInstance().get_World();
                            console.info("Scanning from: " + selectedBase.get_Name());
                            // world.CheckAttackBase (System.Int32 targetX ,System.Int32 targetY) -> ClientLib.Data.EAttackBaseResult
                            // world.CheckAttackBaseRegion (System.Int32 targetX ,System.Int32 targetY) -> ClientLib.Data.EAttackBaseResult
                            var t1 = true;
                            var t2 = true;
                            var t3 = true;
                            var maxAttackDistance = ClientLib.Data.MainData.GetInstance().get_Server().get_MaxAttackDistance();
                            let colsort = this.ZL.getSortColumnIndex();
                            let colsort_ASC = this.ZL.isSortAscending();
                            for (scanY = posY - Math.floor(maxAttackDistance + 1); scanY <= posY + Math.floor(maxAttackDistance + 1); scanY++) {
                                for (scanX = posX - Math.floor(maxAttackDistance + 1); scanX <= posX + Math.floor(maxAttackDistance + 1); scanX++) {
                                    var distX = Math.abs(posX - scanX);
                                    var distY = Math.abs(posY - scanY);
                                    var distance = Math.sqrt((distX * distX) + (distY * distY));
                                    if (distance <= maxAttackDistance) {
                                        var object = world.GetObjectFromPosition(scanX, scanY);
                                        var loot = {};
                                        if (object) {
                                            //console.log(object);
                                            if (object.Type == 1 && t1) {
                                                //console.log("object typ 1");
                                                //objfnkstrON(object);
                                                //t1 = !t1;
                                            }
                                            if (object.Type == 2 && t2) {
                                                //console.log("object typ 2");
                                                //objfnkstrON(object);
                                                //t2 = !t2;
                                            }
                                            if (object.Type == 3 && t3) {
                                                //console.log("object typ 3");
                                                //objfnkstrON(object);
                                                //t3 = !t3;
                                            }
                                            if (object.Type == 3) {
                                                if (c5 <= parseInt(object.getLevel(), 10)) {
                                                    //console.log(object);
                                                }
                                            }
                                            //if(object.ConditionBuildings>0){
                                            var needcp = selectedBase.CalculateAttackCommandPointCostToCoord(scanX, scanY);
                                            if (needcp <= ZQ && typeof object.getLevel == 'function') {
                                                if (c5 <= parseInt(object.getLevel(), 10)) {
                                                    // 0:ID , 1:Scanned, 2:Name, 3:Location, 4:Level, 5:Tib, 6:Kristal, 7:Credits, 8:Forschung, 9:Kristalfelder, 10:Tiberiumfelder,
                                                    // 11:ConditionBuildings,12:ConditionDefense,13: CP pro Angriff , 14: defhp/offhp , 15:sum tib,krist,credits, 16: sum/cp
                                                    var d = this.FL(object.getID(), 0);
                                                    //MOD Fix needcp when cached city by Netquik
                                                    null != d && d[13] !== needcp && (d[13] = needcp);
                                                    var e = this.FL(object.getID(), 1);
                                                    if (e != null) {
                                                        this.ZM[object.getID()] = e;
                                                    }
                                                    if (object.Type == 1 && c1) { //User
                                                        //console.log("object ID LEVEL", object.getID() ,object.getLevel() );
                                                        if (d != null) {
                                                            this.ZE.push(d);
                                                        } else {
                                                            this.ZE.push([object.getID(), -1, this.T.get("Player"), scanX + ":" + scanY, object.getLevel(), 0, 0, 0, 0, 0, 0, 0, 0, needcp, "-", 0, 0, 0, 0, 0, 0]);
                                                        }
                                                    }
                                                    if (object.Type == 2 && c2) { //basen
                                                        //console.log("object ID LEVEL", object.getID() ,object.getLevel() );
                                                        if (d != null) {
                                                            this.ZE.push(d);
                                                        } else {
                                                            this.ZE.push([object.getID(), -1, this.T.get("Bases"), scanX + ":" + scanY, object.getLevel(), 0, 0, 0, 0, 0, 0, 0, 0, needcp, "-", 0, 0, 0, 0, 0, 0]);
                                                        }
                                                    }
                                                    if (object.Type == 3 && (c3 || c4)) { //Lager Vposten
                                                        //console.log("object ID LEVEL", object.getID() ,object.getLevel() );
                                                        if (d != null) {
                                                            if ((object.getCampType() == 2 || object.getCampType() == 1) && c4) {
                                                                this.ZE.push(d);
                                                            } else if ((object.getCampType() == 7) && c4) {
                                                                this.ZE.push(d);
                                                            } else if (object.getCampType() == 3 && c3) {
                                                                this.ZE.push(d);
                                                            }
                                                        } else {
                                                            if ((object.getCampType() == 7 || object.getCampType() == 2 || object.getCampType() == 1) && c4) {
                                                                this.ZE.push([object.getID(), -1, this.T.get("Camp"), scanX + ":" + scanY, object.getLevel(), 0, 0, 0, 0, 0, 0, 0, 0, needcp, "-", 0, 0, 0, 0, 0, 0]);
                                                            }
                                                            if ((object.getCampType() == 7) && c4) {
                                                                this.ZE.push([object.getID(), -1, this.T.get("Infected Camp"), scanX + ":" + scanY, object.getLevel(), 0, 0, 0, 0, 0, 0, 0, 0, needcp, "-", 0, 0, 0, 0, 0, 0]);
                                                            }
                                                            if (object.getCampType() == 3 && c3) {
                                                                this.ZE.push([object.getID(), -1, this.T.get("Outpost"), scanX + ":" + scanY, object.getLevel(), 0, 0, 0, 0, 0, 0, 0, 0, needcp, "-", 0, 0, 0, 0, 0, 0]);
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                            //}
                                        }
                                    }
                                }
                            }
                            this.ZH = true;
                            this.ZL.setData(this.ZE);
                            if (colsort == -1) {
                                if (!this.ZK[5].getValue()) {
                                    this.ZL.sortByColumn(14, false); //Sort for Growth Rate
                                } else {
                                    this.ZL.sortByColumn(4, false); //Sort form Highlevel to Lowlevel
                                }
                            } else {
                                this.ZL.sortByColumn(colsort, colsort_ASC); //Sort User Choice
                            }
                            this.FP(0, this.ZE.length, 200);

                            if (this.YY.name != "DR01D") qx.event.Timer.once(function () {
                                window.Addons.BaseScannerGUI.getInstance().FG()
                            }, 50);
                        } catch (ex) {
                            console.debug("Maelstrom_Basescanner FJ error: ", ex);
                        }
                    },
                    checkFieldFree: function (x, y, map) {
                        var tKey = x + ',' + y;
                        if (tKey in map) {
                            return false;
                        } else {
                            return true;
                        }
                    },
                    FG: function () {
                        try {
                            var retry = false;
                            var loops = 0;
                            var maxLoops = 10;
                            var i = 0;
                            var sleeptime = 150;
                            while (!retry) {
                                var ncity = null;
                                var selectedid = 0;
                                var id = 0;
                                if (this.ZE == null) {
                                    console.warn("data null: ");
                                    this.ZH = false;
                                    break;
                                }
                                for (i = 0; i < this.ZE.length; i++) {
                                    // 1= "LoadState"
                                    if (this.ZE[i][1] == -1) {
                                        break;
                                    }
                                }
                                if (i == this.ZE.length) {
                                    this.ZH = false;
                                }
                                this.FP(i, this.ZE.length, 200); //Progressbar
                                if (this.ZE[i] == null) {
                                    console.warn("data[i] null: ");
                                    this.ZH = false;
                                    this.ZG.setLabel(this.T.get("Scan"));
                                    this.ZD.setEnabled(true);
                                    break;
                                }
                                posData = this.ZE[i][3]; /* make sure coordinates are well-formed enough */
                                if (posData != null && posData.split(':').length == 2) {
                                    posX = parseInt(posData.split(':')[0]);
                                    posY = parseInt(posData.split(':')[1]); /* check if there is any base */
                                    var playerbase = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity();
                                    var world = ClientLib.Data.MainData.GetInstance().get_World();
                                    var foundbase = world.CheckFoundBase(posX, posY, playerbase.get_PlayerId(), playerbase.get_AllianceId());
                                    //console.log("foundbase",foundbase);
                                    this.ZE[i][19] = (foundbase == 0) ? true : false;
                                    //var obj = ClientLib.Vis.VisMain.GetInstance().get_SelectedObject();
                                    //console.log("obj", obj);
                                    id = this.ZE[i][0];
                                    ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentCityId(id);
                                    ncity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(id);
                                    //console.log("ncity", ncity);
                                    if (ncity != null) {
                                        if (!ncity.get_IsGhostMode()) {
                                            //if(ncity.get_Name() != null)
                                            //console.log("ncity.get_Name ", ncity.get_Name() , ncity.get_CityBuildingsData().get_Buildings());
                                            //var cityBuildings = ncity.get_CityBuildingsData();
                                            var cityUnits = ncity.get_CityUnitsData();
                                            if (cityUnits != null) { // cityUnits !=null können null sein
                                                //console.log("ncity.cityUnits", cityUnits );
                                                var selectedBase = this.ZC.getSelection()[0].getModel();
                                                var buildings = ncity.get_Buildings().d;
                                                var defenseUnits = cityUnits.get_DefenseUnits().d;
                                                var offensivUnits = selectedBase.get_CityUnitsData().get_OffenseUnits().d;
                                                //console.log(buildings,defenseUnits,offensivUnits);
                                                if (buildings != null) //defenseUnits !=null können null sein
                                                {
                                                    var buildingLoot = getResourcesPart(buildings);
                                                    var unitLoot = getResourcesPart(defenseUnits);
                                                    //console.log("buildingLoot", buildingLoot);
                                                    //console.log("unitLoot", unitLoot);
                                                    this.ZE[i][2] = ncity.get_Name();
                                                    this.ZE[i][5] = buildingLoot[ClientLib.Base.EResourceType.Tiberium] + unitLoot[ClientLib.Base.EResourceType.Tiberium];
                                                    this.ZE[i][6] = buildingLoot[ClientLib.Base.EResourceType.Crystal] + unitLoot[ClientLib.Base.EResourceType.Crystal];
                                                    this.ZE[i][7] = buildingLoot[ClientLib.Base.EResourceType.Gold] + unitLoot[ClientLib.Base.EResourceType.Gold];
                                                    this.ZE[i][8] = buildingLoot[ClientLib.Base.EResourceType.ResearchPoints] + unitLoot[ClientLib.Base.EResourceType.ResearchPoints];
                                                    //console.log(posX,posY,"GetBuildingsConditionInPercent", ncity.GetBuildingsConditionInPercent() );
                                                    if (ncity.GetBuildingsConditionInPercent() != 0) {
                                                        this.ZA = 0;
                                                        if (this.ZE[i][5] != 0) {
                                                            var c = 0;
                                                            var t = 0;
                                                            var m = 0;
                                                            this.ZM[id] = new Array(9);
                                                            this.crysCounter[id] = new Array(9);
                                                            this.tibCounter[id] = new Array(9);
                                                            for (m = 0; m < 9; m++) {
                                                                this.ZM[id][m] = new Array(8);
                                                                this.crysCounter[id][m] = new Array(9).join('0').split('').map(parseFloat);
                                                                this.tibCounter[id][m] = new Array(9).join('0').split('').map(parseFloat);
                                                            }

                                                            var tib4 = 0;
                                                            var tib5 = 0;
                                                            var tib6 = 0;
                                                            var tib7 = 0;
                                                            var cry4 = 0;
                                                            var cry5 = 0;
                                                            var cry6 = 0;
                                                            var cry7 = 0;
                                                            var mix4 = 0;
                                                            var mix5 = 0;
                                                            var mix6 = 0;
                                                            var mix7 = 0;
                                                            var mix8 = 0;
                                                            var pow8 = 0;
                                                            var powL = {};
                                                            var totT = 0; // count total tib
                                                            var totC = 0; // count total cry
                                                            this.ZM[id] = new Array(9);
                                                            this.crysCounter[id] = new Array(9);
                                                            this.tibCounter[id] = new Array(9);
                                                            for (m = 0; m < 9; m++) {
                                                                this.ZM[id][m] = new Array(8);
                                                                this.crysCounter[id][m] = new Array(9).join('0').split('').map(parseFloat);
                                                                this.tibCounter[id][m] = new Array(9).join('0').split('').map(parseFloat);
                                                            }
                                                            for (var y = 0; 8 > y; y++) {
                                                                for (var x = 0; 9 > x; x++) {
                                                                    var aKey = x + "," + y;
                                                                    switch (ncity.GetResourceType(x, y)) {
                                                                        case 0:
                                                                            var cntT = 0,
                                                                                cntC = 0,
                                                                                cntM = 0,
                                                                                cntP = 0;
                                                                            0 < y && 7 > y && 0 < x && 8 > x && (2 === ncity.GetResourceType(x - 1, y - 1) && (cntC++, cntM++), 2 === ncity.GetResourceType(x, y - 1) && (cntC++, cntM++), 2 === ncity.GetResourceType(x + 1, y - 1) && (cntC++, cntM++), 2 === ncity.GetResourceType(x - 1, y) && (cntC++, cntM++), 2 === ncity.GetResourceType(x + 1, y) && (cntC++, cntM++), 2 === ncity.GetResourceType(x - 1, y + 1) && (cntC++, cntM++), 2 === ncity.GetResourceType(x, y + 1) && (cntC++, cntM++), 2 === ncity.GetResourceType(x +
                                                                                1, y + 1) && (cntC++, cntM++), 1 === ncity.GetResourceType(x - 1, y - 1) && (cntT++, cntM++), 1 === ncity.GetResourceType(x, y - 1) && (cntT++, cntM++), 1 === ncity.GetResourceType(x + 1, y - 1) && (cntT++, cntM++), 1 === ncity.GetResourceType(x - 1, y) && (cntT++, cntM++), 1 === ncity.GetResourceType(x + 1, y) && (cntT++, cntM++), 1 === ncity.GetResourceType(x - 1, y + 1) && (cntT++, cntM++), 1 === ncity.GetResourceType(x, y + 1) && (cntT++, cntM++), 1 === ncity.GetResourceType(x + 1, y +
                                                                                1) && (cntT++, cntM++), 0 === ncity.GetResourceType(x - 1, y - 1) && this.checkFieldFree(x - 1, y - 1, powL) && cntP++, 0 === ncity.GetResourceType(x, y - 1) && this.checkFieldFree(x, y - 1, powL) && cntP++, 0 === ncity.GetResourceType(x + 1, y - 1) && this.checkFieldFree(x + 1, y - 1, powL) && cntP++, 0 === ncity.GetResourceType(x - 1, y) && this.checkFieldFree(x - 1, y, powL) && cntP++, 0 === ncity.GetResourceType(x + 1, y) && this.checkFieldFree(x + 1, y, powL) && cntP++, 0 === ncity.GetResourceType(x -
                                                                                1, y + 1) && this.checkFieldFree(x - 1, y + 1, powL) && cntP++, 0 === ncity.GetResourceType(x, y + 1) && this.checkFieldFree(x, y + 1, powL) && cntP++, 0 === ncity.GetResourceType(x + 1, y + 1) && this.checkFieldFree(x + 1, y + 1, powL) && cntP++);
                                                                            4 === cntC && (tib4++, mix4--);
                                                                            5 === cntC && (tib5++, mix5--);
                                                                            6 === cntC && (tib6++, mix6--);
                                                                            7 === cntC && (tib7++, mix7--);
                                                                            4 === cntT && (cry4++, mix4--);
                                                                            5 === cntT && (cry5++, mix5--);
                                                                            6 === cntT && (cry6++, mix6--);
                                                                            7 === cntT && (cry7++, mix7--);
                                                                            4 === cntM && mix4++;
                                                                            5 === cntM && mix5++;
                                                                            6 === cntM && mix6++;
                                                                            7 === cntM && mix7++;
                                                                            8 === cntM && mix8++;
                                                                            8 === cntP && (pow8++, powL[aKey] = 1);
                                                                            break;
                                                                        case 1:
                                                                            totC++;
                                                                            this.ZM[id][x][y] = 1;
                                                                            break;
                                                                        case 2:
                                                                            this.ZM[id][x][y] = 2, totT++;
                                                                    }
                                                                }
                                                            }

                                                            this.ZE[i][9] = totC;
                                                            this.ZE[i][10] = totT;
                                                            this.ZE[i][11] = ncity.GetBuildingsConditionInPercent();
                                                            this.ZE[i][12] = ncity.GetDefenseConditionInPercent();
                                                            this.ZE[i][21] = tib7 + " | " + tib6 + " | " + tib5 + " | " + tib4;
                                                            this.ZE[i][22] = cry7 + " | " + cry6 + " | " + cry5 + " | " + cry4;
                                                            this.ZE[i][23] = mix7 + " | " + mix6 + " | " + mix5 + " | " + mix4;
                                                            this.ZE[i][20] = pow8;
                                                            try {
                                                                var u = offensivUnits;
                                                                //console.log("OffenseUnits",u);
                                                                var offhp = 0;
                                                                var defhp = 0;
                                                                for (var g in u) {
                                                                    offhp += u[g].get_Health();
                                                                }
                                                                u = defenseUnits;
                                                                //console.log("DefUnits",u);
                                                                for (var g in u) {
                                                                    defhp += u[g].get_Health();
                                                                }
                                                                u = buildings;
                                                                //console.log("DefUnits",u);
                                                                for (var g in u) {
                                                                    //var id=0;
                                                                    //console.log("MdbUnitId",u[g].get_MdbUnitId());
                                                                    var mid = u[g].get_MdbUnitId();
                                                                    //DF
                                                                    if (mid == 158 || mid == 131 || mid == 195) {
                                                                        this.ZE[i][18] = 8 - u[g].get_CoordY();
                                                                    }
                                                                    //CY
                                                                    if (mid == 112 || mid == 151 || mid == 177) {
                                                                        this.ZE[i][17] = 8 - u[g].get_CoordY();
                                                                    }
                                                                }
                                                                //console.log("HPs",offhp,defhp, (defhp/offhp) );
                                                            } catch (x) {
                                                                console.debug("HPRecord", x);
                                                            }
                                                            this.ZE[i][14] = this.ZK[5].getValue() ? "-" : this.maaain(id);
                                                            this.ZE[i][15] = this.ZE[i][5] + this.ZE[i][6] + this.ZE[i][7];
                                                            this.ZE[i][16] = this.ZE[i][15] / this.ZE[i][13];
                                                            this.ZE[i][1] = 0;
                                                            this.ZE[i][24] = !1;
                                                            retry = true;
                                                            console.info(ncity.get_Name(), " finish");
                                                            this.ZA = 0;
                                                            this.countlastidchecked = 0;
                                                            //console.log(this.ZE[i],this.ZM[id],id);
                                                            this.FK(this.ZE[i], this.ZM[id], id);
                                                            //update table + retain sorting 
                                                            let colsort = this.ZL.getSortColumnIndex();
                                                            let colsort_ASC = this.ZL.isSortAscending();
                                                            this.ZL.setData(this.ZE);
                                                            if (colsort == -1) {
                                                                if (!this.ZK[5].getValue()) {
                                                                    this.ZL.sortByColumn(14, false); //Sort for Growth Rate
                                                                } else {
                                                                    this.ZL.sortByColumn(4, false); //Sort form Highlevel to Lowlevel
                                                                }
                                                            } else {
                                                                this.ZL.sortByColumn(colsort, colsort_ASC); //Sort User Choice
                                                            }
                                                        }
                                                    } else {
                                                        if (this.ZA > 250) {
                                                            console.info(this.ZE[i][2], " on ", posX, posY, " removed (GetBuildingsConditionInPercent == 0)");
                                                            this.ZE.splice(i, 1); //entfernt element aus array
                                                            this.ZA = 0;
                                                            this.countlastidchecked = 0;
                                                            break;
                                                        }
                                                        this.ZA++;
                                                    }
                                                }
                                            }
                                        } else {
                                            console.info(this.ZE[i][2], " on ", posX, posY, " removed (IsGhostMode)");
                                            this.ZE.splice(i, 1); //entfernt element aus array
                                            break;
                                        }
                                    }
                                }
                                loops++;
                                if (loops >= maxLoops) {
                                    retry = true;
                                    break;
                                }
                            }
                            //console.log("getResourcesByID end ", this.ZH, Addons.BaseScannerGUI.getInstance().isVisible());
                            if (this.lastid != i) {
                                this.lastid = i;
                                this.countlastidchecked = 0;
                                this.ZA = 0;
                            } else {
                                if (this.countlastidchecked > 16) {
                                    console.info(this.ZE[i][2], " on ", posX, posY, " removed (found no data)");
                                    this.ZE.splice(i, 1); //entfernt element aus array
                                    this.countlastidchecked = 0;
                                } else if (this.countlastidchecked > 10) {
                                    sleeptime = 500;
                                } else if (this.countlastidchecked > 4) {
                                    sleeptime = 250;
                                }
                                this.countlastidchecked++;
                            }
                            //console.log("this.ZH", this.ZH);
                            if (this.ZH && Addons.BaseScannerGUI.getInstance().isVisible()) {
                                //console.log("loop");
                                qx.event.Timer.once(function () {
                                    this.FG()
                                }, window.Addons.BaseScannerGUI.getInstance(), sleeptime);
                            } else {
                                this.ZG.setLabel(this.T.get("Scan"));
                                this.ZH = false;
                            }
                        } catch (e) {
                            console.debug("MaelstromTools_Basescanner getResources", e);
                        }
                    },
                    FK: function (dataa, datab, id) {
                        this.ZZ.push(dataa);
                        this.ZS[id] = datab;
                    },
                    FL: function (id, t) {
                        if (t == 0) {
                            for (var i = 0; i < this.ZZ.length; i++) {
                                if (this.ZZ[i][0] == id) {
                                    return this.ZZ[i];
                                }
                            }
                        } else {
                            if (this.ZS[id]) {
                                return this.ZS[id];
                            }
                        }
                        return null;
                    },
                    maaain: function (l) {
                        var u = this.initializ(),
                            r = [1, 1.25, 2.5],
                            t = [1, 1.15],
                            v = Math.pow(1.09594661, 1),
                            e;
                        var g = [3.5, .8, 1, 5, .5, 2, 1, 20];
                        var p = [
                            [3, 1, .8],
                            [3.5, 1, .8],
                            [4, 1, .8],
                            [4, 2, .3]
                        ];
                        iqll = 0;
                        var h = [".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split("")];
                        for (jj2 = 0; 8 > jj2; jj2++)
                            for (kk2 = 0; 9 > kk2; kk2++) 2 === this.ZM[l][kk2][jj2] && (h[jj2][kk2] = "t"), 1 === this.ZM[l][kk2][jj2] && (h[jj2][kk2] = "c");
                        this.fillin_v2(h,
                            g);
                        l = [];
                        for (var m = [], n = 0; n < p.length; n++) {
                            var k = p[n][0];
                            g = p[n][1];
                            var f = p[n][2];
                            g = [k, f, 1, 5, .5, g, 1, 20];
                            var b = this.fillin_v2(h, g);
                            f = b[0];
                            k = b[1];
                            mmin = 10;
                            if (0 < iqll)
                                for (e = 0; e < iqll; e++) {
                                    var d = 0;
                                    for (jj2 = 0; 8 > jj2; jj2++)
                                        for (kk2 = 0; 9 > kk2; kk2++) f[jj2][kk2] !== l[e] && d++;
                                    0 === d && (mmin = 0)
                                }
                            if (0 < mmin) {
                                e = [1, 1, 1, v];
                                d = [];
                                for (var q = [], a = 0; a < r.length; a++) {
                                    e[1] = r[a];
                                    for (jj2 = 0; 8 > jj2; jj2++)
                                        for (kk2 = 0; 9 > kk2; kk2++) k[jj2][kk2] = "." === f[jj2][kk2] || "t" === f[jj2][kk2] || "c" === f[jj2][kk2] ? 0 : 12;
                                    b = this.operate_v2(f, k, h, e, u, g);
                                    d[a] = [100 * b[3],
                                        b[8] / 24
                                    ];
                                    q[a] = b[0]
                                }
                                for (var c = a = b = 0; c < d.length; c++) d[c][0] > b && (b = d[c][0], a = c);
                                e[1] = r[a];
                                d = [];
                                q = [];
                                for (a = 0; a < t.length; a++) {
                                    e[2] = t[a];
                                    for (jj2 = 0; 8 > jj2; jj2++)
                                        for (kk2 = 0; 9 > kk2; kk2++) k[jj2][kk2] = "." === f[jj2][kk2] || "t" === f[jj2][kk2] || "c" === f[jj2][kk2] ? 0 : 12;
                                    b = this.operate_v2(f, k, h, e, u, g);
                                    d[a] = [100 * b[3], b[8] / 24];
                                    q[a] = b[0]
                                }
                                for (c = a = b = 0; c < d.length; c++) d[c][0] > b && (b = d[c][0], a = c);
                                e[2] = t[a];
                                l[iqll] = q[a];
                                m[iqll] = d[a];
                                iqll += 1
                            }
                        }
                        for (c = a = b = 0; c < m.length; c++) m[c][0] > b && (b = m[c][0], a = c);
                        return m[a][0].toFixed(2)
                    },

                    maxx: function (a) {
                        for (var b = [], c = 0; c < a.length; c++) b[c] = a[c].sort()[a[c].length - 1];
                        return b.sort()[b.length - 1]
                    },

                    summ: function (a) {
                        var b = 0;
                        for (jj2 = 0; jj2 < a.length; jj2++)
                            for (kk2 = 0; kk2 < a[jj2].length; kk2++) b += a[jj2][kk2];
                        return b
                    },

                    transpose: function (c) {
                        for (var f = c.length, g = c[0].length, d = [], a = 0; a < g; a++) {
                            for (var e = [], b = 0; b < f; b++) e[b] = c[b][a];
                            d[a] = e
                        }
                        return d
                    },

                    interp1: function (a, c, d) {
                        if (a.length !== c.length) return 0;
                        if (d <= a[0]) return c[0];
                        if (d >= a[a.length - 1]) return c[a.length - 1];
                        for (var b = 0; b < a.length - 1; b++)
                            if (d > a[b] && d <= a[b + 1]) return c[b] + (c[b + 1] - c[b]) * (d - a[b]) / (a[b + 1] - a[b])
                    },

                    operate_v2: function (A, w, k, x, M, I) {
                        var c = [".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split("")];
                        for (jj2 = 0; jj2 < c.length; jj2++)
                            for (kk2 = 0; kk2 < c[jj2].length; kk2++) c[jj2][kk2] = A[jj2][kk2];
                        A = [".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split("")];
                        for (jj2 = 0; jj2 < A.length; jj2++)
                            for (kk2 =
                                0; kk2 < A[jj2].length; kk2++) A[jj2][kk2] = k[jj2][kk2];
                        k = [
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0]
                        ];
                        for (jj2 = 0; jj2 < k.length; jj2++)
                            for (kk2 = 0; kk2 < k[jj2].length; kk2++) k[jj2][kk2] = w[jj2][kk2];
                        var b = [0, 0, 0, 0],
                            l = w = 0,
                            f = 12,
                            S = I[7],
                            a = this.payoff(c, k, A, x, l, f, M, I),
                            d = a[0],
                            u = a[1],
                            r = a[2],
                            v = a[3],
                            y = a[4],
                            D = a[5],
                            E = a[6],
                            p = a[7],
                            m = a[8],
                            n = a[9],
                            F, G;
                        a = [
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0]
                        ];
                        var H = [
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0]
                        ];
                        for (jj2 = 0; 8 > jj2; jj2++)
                            for (kk2 = 0; 9 > kk2; kk2++) a[jj2][kk2] = "h" === c[jj2][kk2] || "s" === c[jj2][kk2] ? NaN : d[jj2][kk2], H[jj2][kk2] = "a" === c[jj2][kk2] || "p" === c[jj2][kk2] ? NaN : d[jj2][kk2];
                        var W = M[15];
                        mcv = [
                            [1, 0, 0],
                            [2, 18E5, 0],
                            [3, 12E6, 0],
                            [4, 6E7, 0],
                            [5,
                                25E7, 0
                            ],
                            [6, 1E9, 0],
                            [7, 39E8, 0],
                            [8, 148E8, 0],
                            [9, 52E9, 0],
                            [10, 184E9, 0],
                            [11, 53E10, 0]
                        ];
                        mcv[0][2] = 0;
                        for (var g = 1; 11 > g; g++) mcv[g][2] = mcv[g - 1][2] + mcv[g][1];
                        mcv2 = [
                            [1, 8],
                            [2, 12],
                            [3, 18],
                            [5, 26],
                            [8, 40],
                            [10, 50]
                        ];
                        movrec = [
                            [7, 1],
                            [20, 6],
                            [30, 12],
                            [42, 24]
                        ];
                        var B = Math.exp(7 + .2121 * (f + 1 - S));
                        u = this.summ(u) + B;
                        r = this.summ(r) + B;
                        v = this.summ(v) + B;
                        y = this.summ(y);
                        var h = [u, r, v, y];
                        p = [this.summ(p), this.summ(m), this.summ(n)];
                        var e = 0;
                        g = [];
                        g[e] = [p[0] + b[0], p[1] + b[1], p[2] + b[2], 0 + b[3]];
                        var J = [];
                        J[e] = g[e][0] + g[e][1] + g[e][2] + g[e][3];
                        var N = [];
                        N[e] =
                            2;
                        var O = [];
                        O[e] = 0;
                        var P = [];
                        P[e] = 12;
                        for (jj2 = n = m = 0; jj2 < c.length; jj2++)
                            for (kk2 = 0; kk2 < c[jj2].length; kk2++)
                                if ("h" === c[jj2][kk2] || "n" === c[jj2][kk2]) m += k[jj2][kk2], n++;
                        var Q = [];
                        Q[e] = m / n;
                        for (jj2 = n = m = 0; jj2 < c.length; jj2++)
                            for (kk2 = 0; kk2 < c[jj2].length; kk2++) "." !== c[jj2][kk2] && "t" !== c[jj2][kk2] && "c" !== c[jj2][kk2] && (m += k[jj2][kk2], n++);
                        var K = [];
                        K[e] = [b[0] / h[0], b[1] / h[1], b[2] / h[2], b[3] / h[3]];
                        var z = [];
                        z[e] = w;
                        for (var C = 1, R = 0; 43 > f && 9600 > w;) {
                            var q = [0, 0],
                                t = [0, 0];
                            h = [0, 0];
                            var L = F = G = 1E14;
                            for (jj2 = 0; jj2 < c.length; jj2++)
                                for (kk2 =
                                    0; kk2 < c[jj2].length; kk2++) d[jj2][kk2] < G && (q[0] = jj2, q[1] = kk2, G = d[jj2][kk2]), H[jj2][kk2] < F && (t[0] = jj2, t[1] = kk2, F = H[jj2][kk2]), a[jj2][kk2] < L && (h[0] = jj2, h[1] = kk2, L = a[jj2][kk2]);
                            d = 24 < K[e][0] ? [h[0], h[1]] : 24 < K[e][1] ? [t[0], t[1]] : [q[0], q[1]];
                            "q" !== c[d[0]][d[1]] ? (a = [(D[d[0]][d[1]] - b[0]) / u, (E[d[0]][d[1]] - b[1]) / r, 0], a = a[0] > a[1] && 0 < a[0] ? a[0] : a[1] > a[0] && 0 < a[1] ? a[1] : 0, w += a, b[0] = b[0] + a * u - D[d[0]][d[1]], b[1] = b[1] + a * r - E[d[0]][d[1]], b[2] += a * v) : (a = [(D[d[0]][d[1]] - b[2]) / v, (E[d[0]][d[1]] - b[1]) / r, 0], a = a[0] > a[1] && 0 < a[0] ?
                                a[0] : a[1] > a[0] && 0 < a[1] ? a[1] : 0, w += a, b[0] += a * u, b[1] = b[1] + a * r - E[d[0]][d[1]], b[2] = b[2] + a * v - D[d[0]][d[1]]);
                            b[3] += a * y;
                            k[d[0]][d[1]] += 1;
                            a = this.payoff(c, k, A, x, l, f, M, I);
                            d = a[0];
                            u = a[1];
                            r = a[2];
                            v = a[3];
                            y = a[4];
                            D = a[5];
                            E = a[6];
                            p = a[7];
                            m = a[8];
                            n = a[9];
                            L = a[10];
                            F = a[11];
                            h = a[12];
                            G = a[13];
                            a = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ];
                            H = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0,
                                    0, 0, 0
                                ],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ];
                            for (jj2 = 0; 8 > jj2; jj2++)
                                for (kk2 = 0; 9 > kk2; kk2++) a[jj2][kk2] = "h" === c[jj2][kk2] || "s" === c[jj2][kk2] ? NaN : d[jj2][kk2], H[jj2][kk2] = "a" === c[jj2][kk2] || "p" === c[jj2][kk2] ? NaN : d[jj2][kk2];
                            p = [this.summ(p), this.summ(m), this.summ(n)];
                            e += 1;
                            g[e] = [p[0] + b[0], p[1] + b[1], p[2] + b[2], 0 + b[3]];
                            J[e] = g[e][0] + g[e][1] + g[e][2] + g[e][3];
                            for (jj2 = n = m = 0; jj2 < c.length; jj2++)
                                for (kk2 = 0; kk2 < c[jj2].length; kk2++)
                                    if ("h" === c[jj2][kk2] || "n" === c[jj2][kk2]) m +=
                                        k[jj2][kk2], n++;
                            Q[e] = m / n;
                            for (jj2 = n = m = 0; jj2 < c.length; jj2++)
                                for (kk2 = 0; kk2 < c[jj2].length; kk2++) "." !== c[jj2][kk2] && "t" !== c[jj2][kk2] && "c" !== c[jj2][kk2] && (m += k[jj2][kk2], n++);
                            l = [];
                            q = [];
                            for (f = 0; 60 > f; f++) l[f] = W[f][0], q[f] = f + 1;
                            f = this.interp1(l, q, p[0] + b[0]);
                            t = this.interp1(this.transpose(mcv2)[1], this.transpose(mcv2)[0], f);
                            q = this.interp1(l, q, b[2] * (t - 1));
                            t = this.interp1(this.transpose(mcv)[2], this.transpose(mcv)[0], b[3] * (t - 1));
                            l = this.interp1(this.transpose(movrec)[0], this.transpose(movrec)[1], f);
                            24 < l && (l = 24);
                            l *= I[4];
                            B = Math.exp(7 + .2121 * (f + 1 - S));
                            u = this.summ(u) - l / 24 * this.summ(L) + B;
                            r = this.summ(r) - l / 24 * this.summ(F) + B;
                            v = this.summ(v) - l / 24 * this.summ(h) + B;
                            y = this.summ(y) - l / 24 * this.summ(G);
                            h = [u, r, v, y];
                            N[e] = t;
                            O[e] = q;
                            P[e] = f;
                            K[e] = [b[0] / h[0], b[1] / h[1], b[2] / h[2], b[3] / h[3]];
                            z[e] = w;
                            19 < f && 1 === C && (C = e);
                            if (43200 < w && 0 === R) {
                                R = 1;
                                var T = q,
                                    U = f,
                                    V = t
                            }
                        }
                        0 === R && (T = q, U = f, V = t);
                        x = e;
                        return [c, k, [V, U, T], Math.log(J[x] / J[C]) / ((z[x] - z[C]) / 24), Math.log(g[x][0] / g[C][0]) / ((z[x] - z[C]) / 24), C, x, z, w, N, O, P, z, Q]
                    },



                    payoff: function (k, c, P, x, y, D, g, p) {
                        var f = g[0],
                            l = g[1],
                            z = g[2],
                            A = g[3],
                            B = g[4],
                            E = g[5],
                            Q = g[6],
                            R = g[7];
                        D = g[8];
                        var F = g[9],
                            C = g[10],
                            S = g[11],
                            T = g[12];
                        g = g[13];
                        var M = p[2],
                            N = p[3];
                        p = [
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0]
                        ];
                        for (var G = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ], H = [
                                [0,
                                    0, 0, 0, 0, 0, 0, 0, 0
                                ],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ], I = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ], m = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ], n = [
                                [0, 0, 0, 0, 0, 0,
                                    0, 0, 0
                                ],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ], u = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ], q = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ], U = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0,
                                    0, 0, 0, 0, 0, 0, 0, 0
                                ],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ], J = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ], K = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ], L = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0,
                                    0, 0, 0
                                ],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ], O = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ], r = 0, v = 0, t = 0, w = 0, a = 0; 8 > a; a++)
                            for (var b = 0; 9 > b; b++) switch (k[a][b]) {
                                case "s":
                                    var d = this.countadj(k, [a, b], "h"),
                                        e = d[0] + 1,
                                        h = 0 < e ? 1 : 0;
                                    d = this.countadj(k, [a, b], "n");
                                    d = d[0] + 1;
                                    var V = 0 < d ? 1 : 0;
                                    p[a][b] = f[c[a][b] - 1][2] + e * f[c[a][b] -
                                        1][3] + h * f[c[a][b] - 1][4];
                                    J[a][b] = f[c[a][b] - 1][2];
                                    H[a][b] = f[c[a][b] - 1][2] + d * f[c[a][b] - 1][3] + V * f[c[a][b] - 1][4];
                                    L[a][b] = f[c[a][b] - 1][2];
                                    m[a][b] = f[c[a][b] - 1][0];
                                    n[a][b] = f[c[a][b] - 1][1];
                                    u[a][b] = B[c[a][b] - 1][0];
                                    q[a][b] = B[c[a][b] - 1][1];
                                    break;
                                case "h":
                                    d = this.countadj(k, [a, b], "s");
                                    e = d[0] + 1;
                                    h = 0 < e ? 1 : 0;
                                    p[a][b] = l[c[a][b] - 1][2] + e * l[c[a][b] - 1][3] + h * l[c[a][b] - 1][4];
                                    J[a][b] = l[c[a][b] - 1][2];
                                    m[a][b] = l[c[a][b] - 1][0];
                                    n[a][b] = l[c[a][b] - 1][1];
                                    u[a][b] = E[c[a][b] - 1][0];
                                    q[a][b] = E[c[a][b] - 1][1];
                                    break;
                                case "y":
                                    e = 3;
                                    h = 0 < e ? 1 : 0;
                                    d =
                                        c[a][b];
                                    10 < d && (d = c[a][b] + M);
                                    p[a][b] = f[d - 1][2] + e * f[d - 1][3] + h * f[d - 1][4];
                                    m[a][b] = f[d - 1][0];
                                    n[a][b] = f[d - 1][1];
                                    u[a][b] = B[d - 1][0];
                                    q[a][b] = B[d - 1][1];
                                    r = a;
                                    v = b;
                                    break;
                                case "q":
                                    e = 3;
                                    h = 0 < e ? 1 : 0;
                                    d = c[a][b];
                                    10 < d && (d = c[a][b] + N);
                                    p[a][b] = f[d - 1][2] + e * f[d - 1][3] + h * f[d - 1][4];
                                    m[a][b] = f[d - 1][0];
                                    n[a][b] = f[d - 1][1];
                                    u[a][b] = B[d - 1][0];
                                    q[a][b] = B[d - 1][1];
                                    t = a;
                                    w = b;
                                    break;
                                case "n":
                                    d = this.countadj(k, [a, b], "s");
                                    e = d[0] + 1;
                                    h = 0 < e ? 1 : 0;
                                    H[a][b] = l[c[a][b] - 1][2] + e * l[c[a][b] - 1][3] + h * l[c[a][b] - 1][4];
                                    L[a][b] = l[c[a][b] - 1][2];
                                    m[a][b] = l[c[a][b] - 1][0];
                                    n[a][b] = l[c[a][b] - 1][1];
                                    u[a][b] = E[c[a][b] - 1][0];
                                    q[a][b] = E[c[a][b] - 1][1];
                                    break;
                                case "a":
                                    d = this.countadj(k, [a, b], "p");
                                    e = d[0] + 1;
                                    h = 0 < e ? 1 : 0;
                                    G[a][b] = A[c[a][b] - 1][2] + e * A[c[a][b] - 1][3] + h * A[c[a][b] - 1][4];
                                    K[a][b] = A[c[a][b] - 1][2];
                                    m[a][b] = A[c[a][b] - 1][0];
                                    n[a][b] = A[c[a][b] - 1][1];
                                    u[a][b] = R[c[a][b] - 1][0];
                                    q[a][b] = R[c[a][b] - 1][1];
                                    break;
                                case "p":
                                    d = this.countadj(k, [a, b], "a");
                                    e = d[0] + 1;
                                    h = 0 < e ? 1 : 0;
                                    d = this.countadj(P, [a, b], "c");
                                    e = d[0] + 1;
                                    G[a][b] = z[c[a][b] - 1][2] + e * z[c[a][b] - 1][3] + h * z[c[a][b] - 1][4];
                                    K[a][b] = z[c[a][b] - 1][2];
                                    m[a][b] =
                                        z[c[a][b] - 1][0];
                                    n[a][b] = z[c[a][b] - 1][1];
                                    u[a][b] = Q[c[a][b] - 1][0];
                                    q[a][b] = Q[c[a][b] - 1][1];
                                    d = this.countadj(k, [a, b], "r");
                                    I[a][b] = (d[0] + 1) * z[c[a][b] - 1][5];
                                    break;
                                case "r":
                                    d = this.countadj(k, [a, b], "p"), e = d[0] + 1, h = 0 < e ? 1 : 0, d = this.countadj(P, [a, b], "t"), e = d[0] + 1, I[a][b] = C[c[a][b] - 1][2] + e * C[c[a][b] - 1][3] + h * C[c[a][b] - 1][4], O[a][b] = C[c[a][b] - 1][2], m[a][b] = C[c[a][b] - 1][0], n[a][b] = C[c[a][b] - 1][1], u[a][b] = S[c[a][b] - 1][0], q[a][b] = S[c[a][b] - 1][1]
                            }
                        k = [
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0,
                                0, 0, 0, 0, 0, 0
                            ],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0]
                        ];
                        for (jj2 = 0; 8 > jj2; jj2++)
                            for (kk2 = 0; 9 > kk2; kk2++) k[jj2][kk2] = (m[jj2][kk2] + n[jj2][kk2] * x[1]) / (p[jj2][kk2] - y / 24 * J[jj2][kk2] + (G[jj2][kk2] - y / 24 * K[jj2][kk2]) * x[1] + (H[jj2][kk2] - y / 24 * L[jj2][kk2]) * x[2] + (I[jj2][kk2] - y / 24 * O[jj2][kk2]) * x[3]) / 24 * 4; - 1 < r && (p[r][v] = 0, x = 10 < c[r][v] ? c[r][v] : 10, y = 10 < c[r][v] - (N - M) ? c[r][v] - (N - M) : 10, m[r][v] = 2 * D[x - 1][0] + 2 * D[y - 1][0], n[r][v] = 2 * D[x - 1][1] + 2 * D[y - 1][1], u[r][v] = 2 * F[x - 1][0] + 2 * F[y - 1][0], q[r][v] =
                            2 * F[x - 1][1] + 2 * F[y - 1][1]); - 1 < t && (p[t][w] = 0, m[t][w] = T[c[t][w] - 1][0], n[t][w] = T[c[t][w] - 1][1], U[t][w] = g[c[t][w] - 1][0], q[t][w] = g[c[t][w] - 1][1]);
                        return [k, p, G, H, I, m, n, u, q, U, J, K, L, O]
                    },

                    countadj: function (c, a, g) {
                        a = [
                            [a[0] - 1, a[1] - 1],
                            [a[0] - 1, a[1]],
                            [a[0] - 1, a[1] + 1],
                            [a[0], a[1] - 1],
                            [a[0], a[1] + 1],
                            [a[0] + 1, a[1] - 1],
                            [a[0] + 1, a[1]],
                            [a[0] + 1, a[1] + 1]
                        ];
                        var d = [],
                            e = [],
                            b = -1,
                            f = -1;
                        for (js = 0; 8 > js; js++) - 1 < a[js][0] && 8 > a[js][0] && -1 < a[js][1] && 9 > a[js][1] && (c[a[js][0]][a[js][1]] === g && (b++, d[b] = js), f++, e[f] = c[a[js][0]][a[js][1]]);
                        return [b, e, d, a]
                    },

                    initializ: function () {
                        for (var e = [
                                [2, 0, 0, 72, 0, 0],
                                [3, 1, 0, 90, 0, 0],
                                [4, 1, 0, 125, 0, 0],
                                [20, 5, 0, 170, 0, 0],
                                [110, 28, 0, 220, 0, 0],
                                [360, 90, 0, 275, 0, 0],
                                [1100, 275, 0, 335, 0, 0],
                                [3200, 800, 0, 400, 0, 0],
                                [8800, 2200, 0, 460, 0, 0],
                                [22400, 5600, 0, 530, 0, 0],
                                [48E3, 12E3, 0, 610, 0, 0],
                                [63360, 15840, 0, 710, 0, 0],
                                [83630, 20900, 0, 888, 0, 0],
                                [110390, 27600, 0, 1100, 0, 0],
                                [145720, 36430, 0, 1380, 0, 0],
                                [192350, 48090, 0, 1730, 0, 0],
                                [253910, 63470, 0, 2160, 0, 0],
                                [335160, 83790, 0, 2700, 0, 0],
                                [442410, 110600, 0, 3380, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0,
                                    0
                                ],
                                [0, 0, 0, 0, 0, 0]
                            ], a = 19; 60 > a; a++) e[a][0] = 1.32 * e[a - 1][0], e[a][1] = e[a][0] / 4, e[a][2] = 1.25 * e[a - 1][2], e[a][3] = 1.25 * e[a - 1][3], e[a][4] = 1.25 * e[a - 1][4];
                        var f = [];
                        for (a = 0; a < e.length; a++) {
                            f[a] = [0, 0, 0, 0, 0, 0];
                            for (var c = 0; c < e[a].length; c++) f[a][c] = e[a][c] + 0
                        }
                        c = [3, 4, 6, 15, 110, 360, 1100, 3200, 8800, 22400];
                        var d = [0, 1, 3, 12, 72, 234, 715, 2080, 5720, 14560],
                            g = [240, 300, 432, 570, 735, 920, 1120, 1330, 1560, 1800, 2050, 2360, 2950, 3680, 4600, 5760];
                        for (a = 1; 60 > a; a++) f[a][1] = 3 * f[a][0] / 4, f[a][2] = 10 * f[a][3] / 3, f[a][4] = f[a][3], f[a][3] = 0, 10 > a && (f[a][0] =
                            c[a], f[a][1] = d[a]), 16 > a && (f[a][2] = g[a]);
                        c = [
                            [3, 0, 120, 60, 72, 0],
                            [5, 0, 150, 75, 90, 0],
                            [10, 1, 198, 100, 120, 0],
                            [46, 5, 270, 135, 160, 0],
                            [286, 28, 360, 180, 215, 0],
                            [936, 90, 460, 230, 275, 0],
                            [2860, 275, 560, 280, 335, 0],
                            [8320, 800, 660, 330, 400, 0],
                            [22880, 2200, 780, 380, 460, 0],
                            [58240, 5600, 900, 440, 530, 0],
                            [124800, 12E3, 1020, 500, 610, 0],
                            [164730, 15840, 1160, 580, 700, 0],
                            [217450, 20900, 1450, 725, 875, 0],
                            [287030, 27600, 1820, 906, 1090, 0],
                            [378880, 36430, 2270, 1130, 1360, 0],
                            [500130, 48090, 2840, 1410, 1700, 0],
                            [660170, 63470, 3560, 1770, 2130, 0],
                            [871420, 83790,
                                4450, 2210, 2670, 0
                            ],
                            [115E4, 110600, 5560, 2760, 3330, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0,
                                0, 0, 0, 0, 0
                            ],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0]
                        ];
                        for (a = 19; 60 > a; a++) c[a][0] = 1.32 * c[a - 1][0], c[a][1] = 1.32 * c[a - 1][1], c[a][2] = 1.25 * c[a - 1][2], c[a][3] = 1.25 * c[a - 1][3], c[a][4] = 1.25 * c[a - 1][4];
                        d = [48, 60, 75, 100, 125, 160, 195, 230, 270, 315, 370, 430, 538, 672, 840, 1050, 1310, 1640, 2050];
                        for (a = 1; 60 > a; a++) c[a][5] = 19 > a ? d[a] : 1.25 * c[a - 1][5];
                        d = [
                            [2, 0, 0, 48, 0, 0],
                            [3, 1, 0, 60, 0, 0],
                            [4, 1, 0, 80, 0, 0],
                            [20, 5, 0, 110, 0, 0],
                            [110, 28, 0, 145, 0, 0],
                            [360, 90, 0, 185, 0, 0],
                            [1100, 275,
                                0, 225, 0, 0
                            ],
                            [3200, 800, 0, 265, 0, 0],
                            [8800, 2200, 0, 310, 0, 0],
                            [22400, 5600, 0, 355, 0, 0],
                            [48E3, 12E3, 0, 405, 0, 0],
                            [63360, 15840, 0, 465, 0, 0],
                            [83630, 20900, 0, 581, 0, 0],
                            [110390, 27600, 0, 727, 0, 0],
                            [145720, 36430, 0, 908, 0, 0],
                            [192350, 48090, 0, 1130, 0, 0],
                            [253910, 63470, 0, 1410, 0, 0],
                            [335160, 83790, 0, 1770, 0, 0],
                            [442410, 110600, 0, 2210, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0,
                                0, 0, 0, 0, 0
                            ],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0]
                        ];
                        for (a = 19; 60 > a; a++) d[a][0] = 1.32 * d[a - 1][0], d[a][1] = 1.32 * d[a - 1][1], d[a][2] = 1.25 * d[a - 1][2], d[a][3] = 1.25 * d[a - 1][3], d[a][4] = 1.25 * d[a -
                            1][4];
                        g = [
                            [3, 0, 120, 60, 72, 0],
                            [4, 1, 150, 75, 90, 0],
                            [8, 2, 180, 90, 110, 0],
                            [35, 9, 240, 120, 145, 0],
                            [220, 55, 315, 160, 190, 0],
                            [720, 180, 400, 200, 240, 0],
                            [2200, 550, 485, 240, 290, 0],
                            [6400, 1600, 575, 290, 345, 0],
                            [17600, 4400, 680, 340, 410, 0],
                            [44800, 11200, 790, 400, 475, 0],
                            [96E3, 24E3, 925, 460, 555, 0],
                            [126720, 31680, 1080, 540, 650, 0],
                            [167270, 41810, 1350, 675, 813, 0],
                            [220790, 55190, 1680, 844, 1010, 0],
                            [291450, 72860, 2100, 1050, 1270, 0],
                            [384710, 96170, 2630, 1310, 1580, 0],
                            [507820, 126950, 3290, 1640, 1980, 0],
                            [670330, 167580, 4110, 2060, 2480, 0],
                            [884830, 221200, 5140,
                                2570, 3090, 0
                            ],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0]
                        ];
                        var h = [1.31999808021389, 1.3199950274937, 1.25005273120801, 1.25005273120801, 1.25008568540486];
                        for (a = 19; 60 > a; a++) g[a][0] = g[a - 1][0] * h[0], g[a][1] = g[a - 1][1] * h[1], g[a][2] = g[a - 1][2] * h[2], g[a][3] = g[a - 1][3] * h[3], g[a][4] = g[a - 1][4] * h[4];
                        h = [
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1,
                                0
                            ],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0]
                        ];
                        var k = [
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0]
                            ],
                            l = [
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0]
                            ],
                            m = [
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1,
                                    0
                                ],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0]
                            ],
                            n = [
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1,
                                    0
                                ],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0]
                            ];
                        for (a = 1; 60 > a; a++) h[a][0] = h[a - 1][0] + f[a - 1][0], h[a][1] = h[a - 1][1] + f[a - 1][1], k[a][0] = k[a - 1][0] + e[a - 1][0], k[a][1] = k[a - 1][1] + e[a - 1][1], l[a][0] = l[a - 1][0] + d[a - 1][0], l[a][1] = l[a - 1][1] + d[a - 1][1], m[a][0] = m[a - 1][0] + c[a - 1][0], m[a][1] = m[a - 1][1] + c[a - 1][1], n[a][0] = n[a - 1][0] + g[a - 1][0], n[a][1] = n[a - 1][1] + g[a - 1][1];
                        var p = [
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1,
                                0
                            ],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0],
                            [1, 0]
                        ];
                        defoff = [
                            [10, 0],
                            [15, 0],
                            [30, 3],
                            [60, 15],
                            [440, 110],
                            [1440, 360],
                            [4400, 1100],
                            [12800, 3200],
                            [35200, 8800],
                            [89600, 22400],
                            [192E3, 48E3],
                            [253440, 63360],
                            [334540, 83630],
                            [441590, 110390],
                            [582900, 145720],
                            [769430, 192350],
                            [101E4, 253910],
                            [134E4, 335160],
                            [176E4, 442410],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0]
                        ];
                        for (a = 19; 60 > a; a++) defoff[a][1] = 1.32 * defoff[a - 1][1], defoff[a][0] = 4 * defoff[a][1];
                        a = [
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0]
                        ];
                        var q = [
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0,
                                0
                            ],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0],
                            [0, 0]
                        ];
                        a[35][0] = 4028442E3;
                        for (var b = 36; 60 > b; b++) a[b][0] = 1.32 * a[b - 1][0];
                        for (b = 34; 0 <= b; b--) a[b][0] = 11 > b ? a[b + 1][0] / 3.3 : a[b + 1][0] / 1.32;
                        var r = [
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0]
                            ],
                            t = [
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0],
                                [1, 0]
                            ];
                        for (b = 0; 60 > b; b++) a[b][1] = a[b][0] / 4, q[b][0] = a[b][0] / 2, q[b][1] = a[b][1] /
                            2, 0 < b && (t[b][0] = t[b - 1][0] + q[b - 1][0], t[b][1] = t[b - 1][1] + q[b - 1][1], r[b][0] = r[b - 1][0] + a[b - 1][0], r[b][1] = r[b - 1][1] + a[b - 1][1], p[b][0] = p[b - 1][0] + defoff[b - 1][0], p[b][1] = p[b - 1][1] + defoff[b - 1][1]);
                        return [e, f, c, d, k, h, m, l, defoff, p, g, n, q, t, a, r]
                    },

                    fillin_v2: function (q, v) {
                        var h = v[0],
                            n = v[1],
                            u = v[5],
                            d = v[6];
                        map2 = [".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split("")];
                        for (a = 0; 8 > a; a++)
                            for (b = 0; 9 > b; b++) "t" === q[a][b] ? map2[a][b] = "h" : "c" === q[a][b] && (map2[a][b] = "n");
                        var e = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ],
                            f = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ],
                            p = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ];
                        for (a = 0; 8 > a; a++)
                            for (b = 0; 9 > b; b++) {
                                var c = this.countadj(q, [a, b], "t");
                                e[a][b] = c[0] + 1;
                                c = this.countadj(q, [a, b], "c");
                                f[a][b] = c[0] + 1;
                                p[a][b] = e[a][b] + f[a][b];
                                e[a][b] + f[a][b] >= h && (map2[a][b] =
                                    "s")
                            }
                        for (a = 0; 8 > a; a++)
                            for (b = 0; 9 > b; b++)
                                if ("h" === map2[a][b] || "n" === map2[a][b])
                                    if (c = this.countadj(map2, [a, b], "s"), 0 === c[0] + 1) {
                                        c = this.countadj(p, [a, b], 3);
                                        f = c[2];
                                        var g = c[3];
                                        if (0 < c[0] + 1)
                                            if (1 === f.length) map2[g[f[0]][0]][g[f[0]][1]] = "s";
                                            else {
                                                var m = [
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0]
                                                ];
                                                for (jj1 = 0; 8 > jj1; jj1++)
                                                    for (kk1 = 0; 9 > kk1; kk1++)
                                                        if ("h" === map2[jj1][kk1] || "n" === map2[jj1][kk1]) c = this.countadj(map2,
                                                            [jj1, kk1], "s"), c = c[0] + 1, 0 === c && (m[jj1][kk1] = 1);
                                                var r = [
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                                    [0, 0, 0, 0, 0, 0, 0, 0, 0]
                                                ];
                                                for (jj1 = 0; 8 > jj1; jj1++)
                                                    for (kk1 = 0; 9 > kk1; kk1++) c = this.countadj(m, [jj1, kk1], 1), r[jj1][kk1] = c[0] + 1;
                                                c = -10;
                                                for (m = 0; m < f.length; m++)
                                                    if (r[g[f[m]][0]][g[f[m]][1]] > c) {
                                                        c = r[g[f[m]][0]][g[f[m]][1]];
                                                        var k = g[f[m]][0],
                                                            t = g[f[m]][1]
                                                    } map2[k][t] = "s"
                                            }
                                        else map2[a][b] = q[a][b]
                                    } if (3 < h)
                            for (a = 0; 8 > a; a++)
                                for (b = 0; 9 > b; b++)
                                    if ("s" ===
                                        map2[a][b] && 3 === p[a][b]) {
                                        k = [".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split("")];
                                        for (jj2 = 0; 8 > jj2; jj2++)
                                            for (kk2 = 0; 9 > kk2; kk2++) k[jj2][kk2] = map2[jj2][kk2];
                                        k[a][b] = ".";
                                        m = [
                                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                            [0, 0, 0, 0, 0, 0, 0, 0, 0]
                                        ];
                                        for (jj1 = f = 0; 8 > jj1; jj1++)
                                            for (kk1 = 0; 9 > kk1; kk1++) {
                                                if ("h" ===
                                                    map2[jj1][kk1] || "n" === map2[jj1][kk1]) c = this.countadj(k, [jj1, kk1], "s"), c = c[0] + 1, 0 === c && (m[jj1][kk1] = 1);
                                                f += m[jj1][kk1]
                                            }
                                        if (0 === f)
                                            for (jj2 = 0; 8 > jj2; jj2++)
                                                for (kk2 = 0; 9 > kk2; kk2++) map2[jj2][kk2] = k[jj2][kk2]
                                    } g = [
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0]
                        ];
                        for (a = 0; 8 > a; a++)
                            for (b = 0; 9 > b; b++) "." === map2[a][b] ? (c = this.countadj(map2, [a, b], "."), g[a][b] = c[0] + 1) : g[a][b] = 0;
                        f = [];
                        c = -1;
                        for (a = 0; 8 > a; a++)
                            for (b =
                                0; 9 > b; b++) 6 <= g[a][b] && (c++, f[c] = [a, b]);
                        g = [];
                        c = -1;
                        if (1 === u)
                            for (a = 0; a < f.length; a++) c++, g[c] = [a];
                        else
                            for (a = 0; a < f.length; a++)
                                for (b = a + 1; b < f.length; b++) c++, g[c] = [a, b];
                        t = [];
                        m = [];
                        r = [];
                        var w = [];
                        u = [];
                        for (var l = 0; l < g.length; l++) {
                            k = [".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split("")];
                            for (jj2 = 0; 8 > jj2; jj2++)
                                for (kk2 = 0; 9 > kk2; kk2++) k[jj2][kk2] = map2[jj2][kk2];
                            for (a = 0; a < g[l].length; a++) k[f[g[l][a]][0]][f[g[l][a]][1]] =
                                "a";
                            t[l] = 0;
                            for (a = m[l] = 0; 8 > a; a++)
                                for (b = 0; 9 > b; b++) "." === k[a][b] && (c = this.countadj(k, [a, b], "a"), wp = c[0] + 1, 0 < wp && (c = this.countadj(q, [a, b], "c"), t[l] = t[l] + c[0] + 1, m[l] += 1, k[a][b] = "p"));
                            for (a = r[l] = 0; a < g[l].length; a++) c = this.countadj(k, [f[g[l][a]][0], f[g[l][a]][1]], "p"), r[l] = r[l] + c[0] + 1;
                            var x = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ];
                            for (a = 0; 8 > a; a++)
                                for (b = 0; 9 > b; b++) "." === k[a][b] && (c = this.countadj(k,
                                    [a, b], "t"), x[a][b] = c[0] + 1);
                            for (a = w[l] = 0; 8 > a; a++)
                                for (b = 0; 9 > b; b++)
                                    if ("p" === k[a][b]) {
                                        var z = this.countadj(x, [a, b], 1);
                                        c = this.countadj(x, [a, b], 2);
                                        var y = this.countadj(x, [a, b], 3);
                                        w[l] = w[l] + z[0] + 1 + c[0] + 1 + y[0] + 1
                                    } u[l] = [".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split("")];
                            for (jj2 = 0; 8 > jj2; jj2++)
                                for (kk2 = 0; 9 > kk2; kk2++) u[l][jj2][kk2] = k[jj2][kk2]
                        }
                        a = [];
                        b = [];
                        f = -10;
                        for (c = 0; c < g.length; c++) a[c] = r[c] -
                            n * m[c], b[c] = t[c] + .1 * w[c], a[c] > f && (f = a[c]);
                        n = [];
                        k = -1;
                        for (c = 0; c < g.length; c++) a[c] === f && (k++, n[k] = c);
                        f = -10;
                        for (c = 0; c < n.length; c++) b[n[c]] > f && (f = b[n[c]], k = n[c]);
                        for (jj2 = 0; 8 > jj2; jj2++)
                            for (kk2 = 0; 9 > kk2; kk2++) map2[jj2][kk2] = u[k][jj2][kk2];
                        if (3.5 === h)
                            for (a = 0; 8 > a; a++)
                                for (b = 0; 9 > b; b++) 3 <= p[a][b] && 0 < e[a][b] && (map2[a][b] = "s");
                        if (0 !== d) {
                            for (a = h = 0; 8 > a; a++)
                                for (b = 0; 9 > b; b++) "." !== map2[a][b] && "t" !== map2[a][b] && "c" !== map2[a][b] && "y" !== map2[a][b] && h++;
                            h = 41 - h - 4;
                            d = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0,
                                    0, 0
                                ],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ];
                            for (a = 0; 8 > a; a++)
                                for (b = 0; 9 > b; b++) "." === map2[a][b] ? (c = this.countadj(q, [a, b], "t"), d[a][b] = c[0] + 1) : d[a][b] = 0, c = this.countadj(map2, [a, b], "p"), 0 < c[0] + 1 && (d[a][b] += .5, 2.5 === d[a][b] && (d[a][b] = 3.25));
                            e = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ];
                            for (jj2 = 0; 8 > jj2; jj2++)
                                for (kk2 = 0; 9 > kk2; kk2++) e[jj2][kk2] =
                                    d[jj2][kk2];
                            for (e = this.maxx(e); 3 < e && 0 < h;) {
                                for (var a = 0; 8 > a; a++)
                                    for (var b = 0; 9 > b; b++) d[a][b] === e && 0 < h && (d[a][b] = 0, --h, map2[a][b] = "r");
                                e = [
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0]
                                ];
                                for (jj2 = 0; 8 > jj2; jj2++)
                                    for (kk2 = 0; 9 > kk2; kk2++) e[jj2][kk2] = d[jj2][kk2];
                                e = this.maxx(e)
                            }
                            for (e = 1; 1 < h && 1 === e;) {
                                d = [
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0]
                                ];
                                for (a = 0; 8 > a; a++)
                                    for (b = 0; 9 > b; b++) "." === map2[a][b] ? (c = this.countadj(q, [a, b], "t"), d[a][b] = c[0] + 1) : d[a][b] = 0;
                                p = [
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0]
                                ];
                                for (a = 0; 8 > a; a++)
                                    for (b = 0; 9 > b; b++) "." === map2[a][b] ? (y = this.countadj(d, [a, b], 3), c = this.countadj(d, [a, b], 2), p[a][b] = c[0] + 1 + y[0] + 1) : p[a][b] = 0;
                                a = [
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0,
                                        0, 0, 0, 0
                                    ],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0]
                                ];
                                b = [
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0]
                                ];
                                n = 0;
                                f = [0, 0];
                                for (jj2 = 0; 8 > jj2; jj2++)
                                    for (kk2 = 0; 9 > kk2; kk2++) a[jj2][kk2] = p[jj2][kk2] - d[jj2][kk2], b[jj2][kk2] = p[jj2][kk2], a[jj2][kk2] > n && (n = a[jj2][kk2], f = [jj2, kk2]);
                                if (0 === n) {
                                    for (jj2 = 0; 8 > jj2; jj2++)
                                        for (kk2 = 0; 9 > kk2; kk2++) b[jj2][kk2] >
                                            n && (n = b[jj2][kk2], f = [jj2, kk2]);
                                    0 == n && (e = 0)
                                }
                                if (1 === e) {
                                    1 < h && (map2[f[0]][f[1]] = "p", --h);
                                    c = this.countadj(d, f, 3);
                                    p = c[2];
                                    a = c[3];
                                    for (ii = 0; ii < p.length; ii++) 0 < h && (map2[a[p[ii]][0]][a[p[ii]][1]] = "r", --h);
                                    c = this.countadj(d, f, 2);
                                    f = c[2];
                                    g = c[3];
                                    for (ii = 0; ii < f.length; ii++) 0 < h && (map2[g[f[ii]][0]][g[f[ii]][1]] = "r", --h)
                                }
                            }
                            d = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ];
                            for (a = 0; 8 > a; a++)
                                for (b = 0; 9 > b; b++) "." ===
                                    map2[a][b] ? (c = this.countadj(q, [a, b], "t"), d[a][b] = c[0] + 1) : d[a][b] = 0, c = this.countadj(map2, [a, b], "p"), 0 < c[0] + 1 && 0 < d[a][b] && (d[a][b] += .5);
                            e = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ];
                            for (jj2 = 0; 8 > jj2; jj2++)
                                for (kk2 = 0; 9 > kk2; kk2++) e[jj2][kk2] = d[jj2][kk2];
                            for (e = this.maxx(e); 1.5 === e && 0 < h;) {
                                for (a = 0; 8 > a; a++)
                                    for (b = 0; 9 > b; b++) d[a][b] === e && 0 < h && (d[a][b] = 0, --h, map2[a][b] = "r");
                                e = [
                                    [0, 0, 0, 0, 0, 0, 0, 0,
                                        0
                                    ],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0]
                                ];
                                for (jj2 = 0; 8 > jj2; jj2++)
                                    for (kk2 = 0; 9 > kk2; kk2++) e[jj2][kk2] = d[jj2][kk2];
                                e = this.maxx(e)
                            }
                            d = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ];
                            for (a = 0; 8 > a; a++)
                                for (b = 0; 9 > b; b++) "." === map2[a][b] ? (c = this.countadj(map2, [a, b], "p"), d[a][b] = c[0] + 1) : d[a][b] = 0;
                            e = [
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                [0, 0, 0, 0, 0, 0, 0, 0, 0]
                            ];
                            for (jj2 = 0; 8 > jj2; jj2++)
                                for (kk2 = 0; 9 > kk2; kk2++) e[jj2][kk2] = d[jj2][kk2];
                            for (e = this.maxx(e); 0 < e && 0 < h;) {
                                for (a = 0; 8 > a; a++)
                                    for (b = 0; 9 > b; b++) d[a][b] === e && 0 < h && (d[a][b] = 0, --h, map2[a][b] = "r");
                                e = [
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0, 0],
                                    [0, 0, 0, 0, 0, 0, 0, 0,
                                        0
                                    ]
                                ];
                                for (jj2 = 0; 8 > jj2; jj2++)
                                    for (kk2 = 0; 9 > kk2; kk2++) e[jj2][kk2] = d[jj2][kk2];
                                e = this.maxx(e)
                            }
                        }
                        h = [
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0],
                            [0, 0, 0, 0, 0, 0, 0, 0, 0]
                        ];
                        d = [".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split(""), ".........".split("")];
                        for (jj2 = e = 0; 8 > jj2; jj2++)
                            for (kk2 = 0; 9 > kk2; kk2++) d[jj2][kk2] = map2[jj2][kk2],
                                "." === d[jj2][kk2] && 0 === e ? (d[jj2][kk2] = "y", e++) : "." === d[jj2][kk2] && 1 === e ? (d[jj2][kk2] = "q", e++) : "." === d[jj2][kk2] && 2 === e ? (d[jj2][kk2] = "w", e++) : "." === d[jj2][kk2] && 3 === e && (d[jj2][kk2] = "z", e++), h[jj2][kk2] = "." === d[jj2][kk2] || "t" === d[jj2][kk2] || "c" === d[jj2][kk2] ? 0 : 12;
                        return [d, h]
                    }
                }
            });
            qx.Class.define("Addons.BaseScannerLayout", { //mod by Netquik FIXME
                type: "singleton",
                extend: qx.ui.window.Window,
                construct: function () {
                    try {
                        this.base(arguments);
                        console.info("Addons.BaseScannerLayout " + window.__msbs_version);
                        this.setWidth(Addons.LocalStorage.getserver("Basescanner_GUIWidth_", 1550)); // width from saved
                        this.setHeight(Addons.LocalStorage.getserver("Basescanner_GUIHeight_", 400)); // height from saved
                        this.setContentPadding(10);
                        this.setShowMinimize(false);
                        this.setShowMaximize(true);
                        this.setShowClose(true);
                        this.setResizable(true);
                        this.setAllowMaximize(true);
                        this.setAllowMinimize(false);
                        this.setAllowClose(true);
                        this.setShowStatusbar(false);
                        this.setDecorator(null);
                        this.setPadding(10);
                        this.setLayout(new qx.ui.layout.Grow());
                        this.ZW = [];
                        this.removeAll();
                        this.ZZ = new qx.ui.container.Scroll();
                        this.ZY = new qx.ui.container.Composite(new qx.ui.layout.Flow());
                        this.add(this.ZZ, {
                            flex: 3
                        });
                        this.ZZ.add(this.ZY);
                        //this.FO();
                    } catch (e) {
                        console.debug("Addons.BaseScannerLayout.construct: ", e);
                    }
                },
                members: {
                    ZW: null,
                    ZZ: null,
                    ZY: null,
                    ZX: null,
                    openWindow: function (title) {
                        try {
                            this.setCaption(title);
                            if (this.isVisible()) {
                                this.close();
                            } else {
                                this.open();
                                this.moveTo(Addons.LocalStorage.getserver("Basescanner_GUILeft_", 100), Addons.LocalStorage.getserver("Basescanner_GUITop_", 100));
                                this.FO();
                            }
                        } catch (e) {
                            console.log("Addons.BaseScannerLayout.openWindow: ", e);
                        }
                    },
                    FO: function () {
                        var ZM = window.Addons.BaseScannerGUI.getInstance().ZM;
                        var ZE = window.Addons.BaseScannerGUI.getInstance().ZE;
                        this.ZX = [];
                        var selectedtype = window.Addons.BaseScannerGUI.getInstance().ZJ.getSelection()[0].getModel();
                        //console.log("FO: " , ZM.length);
                        var rowDataLine = null;
                        if (ZE == null) {
                            console.info("ZE null: ");
                            return;
                        }
                        //console.log("FO: " , ZM);
                        this.ZW = [];
                        var id;
                        var i;
                        var x;
                        var y;
                        var a;
                        for (id in ZM) {
                            for (i = 0; i < ZE.length; i++) {
                                if (ZE[i][0] == id) {
                                    rowDataLine = ZE[i];
                                }
                            }
                            if (rowDataLine == null) {
                                continue;
                            }
                            //console.log("ST",selectedtype,rowDataLine[10]);
                            if (selectedtype > 4 && selectedtype < 8) {
                                if (selectedtype != rowDataLine[10]) {
                                    continue;
                                }
                            }
                            /* else {
                                                           continue;
                                                       } */
                            posData = rowDataLine[3];
                            if (posData != null && posData.split(':').length == 2) {
                                posX = parseInt(posData.split(':')[0]);
                                posY = parseInt(posData.split(':')[1]);
                            }
                            var highGrow = rowDataLine[14] > 3 ? "#f48115" : "#FFF";
                            var borderGrow = rowDataLine[14] > 3 ? "#f4811591" : "#808080";
                            var st = '<table border="2" cellspacing="0" cellpadding="0" style="border-color: ' + borderGrow + ' ;">';
                            var link = rowDataLine[2] + " - " + rowDataLine[3];

                            st = st + '<tr><td colspan="9" style="text-align: center"><font color="' + highGrow + '">' + link + '</font></td></tr>';
                            for (y = 0; y < 8; y++) {
                                st = st + "<tr>";
                                for (x = 0; x < 9; x++) {
                                    var img = "";
                                    var res = ZM[id][x][y];
                                    //console.log("Res ",res);
                                    switch (res == undefined ? 0 : res) {
                                        case 2:
                                            //console.log("Tiberium " , MT_Base.images[MaelstromTools.Statics.Tiberium] );
                                            img = '<img width="14" height="14" src="' + MT_Base.images[MaelstromTools.Statics.Tiberium] + '">';
                                            break;
                                        case 1:
                                            //console.log("Crystal ");
                                            img = '<img width="14" height="14" src="' + MT_Base.images[MaelstromTools.Statics.Crystal] + '">';
                                            break;
                                        default:
                                            img = '<img width="14" height="14" src="' + MT_Base.images["Emptypixels"] + '">';
                                            break;
                                    }
                                    st = st + "<td>" + img + "</td>";
                                }
                                st = st + "</tr>";
                            }
                            st = st + "</table>";
                            //console.log("setWidgetLabels ", st);
                            var l = new qx.ui.basic.Label().set({
                                backgroundColor: "#303030",
                                value: st,
                                rich: true
                            });
                            l.cid = id;
                            this.ZX.push(id);
                            l.addListener("click", function (e) {
                                //console.log("clickid ", this.cid, );
                                //webfrontend.gui.UtilView.openCityInMainWindow(this.cid);
                                var bk = qx.core.Init.getApplication();
                                bk.getBackgroundArea().closeCityInfo();
                                bk.getPlayArea().setView(ClientLib.Data.PlayerAreaViewMode.pavmCombatSetupDefense, this.cid, 0, 0);
                                var q = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity();
                                if (q != null) q.get_CityArmyFormationsManager().set_CurrentTargetBaseId(this.cid);
                            });
                            l.setReturnValue = id;
                            this.ZW.push(l);
                        }
                        this.ZY.removeAll();
                        var b = 0;
                        var c = 0;
                        //console.log("this.ZW.length",this.ZW.length);
                        for (a = 0; a < this.ZW.length; a++) {
                            this.ZY.add(this.ZW[a], {
                                row: b,
                                column: c
                            });
                            c++;
                            if (c > 4) {
                                c = 0;
                                b++;
                            }
                        }
                    }
                }
            });
            qx.Class.define("Addons.LocalStorage", {
                type: "static",
                extend: qx.core.Object,
                statics: {
                    isSupported: function () {
                        return typeof (localStorage) !== "undefined";
                    },
                    isdefined: function (key) {
                        return (localStorage[key] !== "undefined" && localStorage[key] != null);
                    },
                    isdefineddata: function (data, key) {
                        return (data[key] !== "undefined" && data[key] != null);
                    },
                    setglobal: function (key, value) {
                        try {
                            if (Addons.LocalStorage.isSupported()) {
                                localStorage[key] = JSON.stringify(value);
                            }
                        } catch (e) {
                            console.debug("Addons.LocalStorage.setglobal: ", e);
                        }
                    },
                    getglobal: function (key, defaultValue) {
                        try {
                            if (Addons.LocalStorage.isSupported()) {
                                if (Addons.LocalStorage.isdefined(key)) {
                                    return JSON.parse(localStorage[key]);
                                }
                            }
                        } catch (e) {
                            console.log("Addons.LocalStorage.getglobal: ", e);
                        }
                        return defaultValue;
                    },
                    setserver: function (key, value) {
                        try {
                            if (Addons.LocalStorage.isSupported()) {
                                var sn = ClientLib.Data.MainData.GetInstance().get_Server().get_Name();
                                var data;
                                if (Addons.LocalStorage.isdefined(sn)) {
                                    try {
                                        data = JSON.parse(localStorage[sn]);
                                        if (!(typeof data === "object")) {
                                            data = {};
                                            console.debug("LocalStorage data from server not null, but not object");
                                        }
                                    } catch (e) {
                                        console.debug("LocalStorage data from server not null, but parsererror", e);
                                        data = {};
                                    }
                                } else {
                                    data = {};
                                }
                                data[key] = value;
                                localStorage[sn] = JSON.stringify(data);
                            }
                        } catch (e) {
                            console.debug("Addons.LocalStorage.setserver: ", e);
                        }
                    },
                    getserver: function (key, defaultValue) {
                        try {
                            if (Addons.LocalStorage.isSupported()) {
                                var sn = ClientLib.Data.MainData.GetInstance().get_Server().get_Name();
                                if (Addons.LocalStorage.isdefined(sn)) {
                                    var data = JSON.parse(localStorage[sn]);
                                    if (Addons.LocalStorage.isdefineddata(data, key)) {
                                        return data[key];
                                    }
                                }
                            }
                        } catch (e) {
                            console.log("Addons.LocalStorage.getserver: ", e);
                        }
                        return defaultValue;
                    }
                }
            });
            if (typeof Addons.Language === 'undefined') {
                qx.Class.define("Addons.Language", {
                    type: "singleton",
                    extend: qx.core.Object,
                    members: {
                        d: {},
                        debug: false,
                        addtranslateobj: function (o) {
                            if (o.hasOwnProperty("main")) {
                                this.d[o.main.toString()] = o;
                                if (this.debug) {
                                    console.log("Translate Added ", o.main.toString());
                                }
                                delete o.main;
                            } else {
                                console.debug("Addons.Language.addtranslateobj main not define");
                            }
                        },
                        get: function (t) {
                            var locale = qx.locale.Manager.getInstance().getLocale();
                            var loc = locale.split("_")[0];
                            if (this.d.hasOwnProperty(t)) {
                                if (this.d[t].hasOwnProperty(loc)) {
                                    return this.d[t][loc];
                                }
                            }
                            if (this.debug) {
                                console.debug("Addons.Language.get ", t, " not translate for locale ", loc);
                            }
                            return t;
                        }
                    }
                });
            }
            qx.Class.define("qx.ui.table.cellrenderer.Replace", {
                extend: qx.ui.table.cellrenderer.Default,
                properties: {
                    replaceMap: {
                        check: "Object",
                        nullable: true,
                        init: null
                    },
                    replaceFunction: {
                        check: "Function",
                        nullable: true,
                        init: null
                    }
                },
                members: {
                    // overridden
                    _getContentHtml: function (cellInfo) {
                        var value = cellInfo.value;
                        var replaceMap = this.getReplaceMap();
                        var replaceFunc = this.getReplaceFunction();
                        var label;
                        // use map
                        if (replaceMap) {
                            label = replaceMap[value];
                            if (typeof label != "undefined") {
                                cellInfo.value = label;
                                return qx.bom.String.escape(this._formatValue(cellInfo));
                            }
                        }
                        // use function
                        if (replaceFunc) {
                            cellInfo.value = replaceFunc(value);
                        }
                        return qx.bom.String.escape(this._formatValue(cellInfo));
                    },
                    addReversedReplaceMap: function () {
                        var map = this.getReplaceMap();
                        for (var key in map) {
                            var value = map[key];
                            map[value] = key;
                        }
                        return true;
                    }
                }
            });
            console.info("Maelstrom_Basescanner initalisiert");
            var T = Addons.Language.getInstance();
            T.debug = false;
            T.addtranslateobj({
                main: "Point",
                de: "Position",
                pt: "Position",
                fr: "Position",
                es: "Posición"
            });
            T.addtranslateobj({
                main: "BaseScanner Overview",
                de: "Basescanner Übersicht",
                pt: "Visão geral do scanner de base",
                fr: "Aperçu du scanner de base",
                es: "Vista general"
            });
            T.addtranslateobj({
                main: "Scan",
                de: "Scannen",
                pt: "Esquadrinhar",
                fr: "Balayer",
                es: "Escanear"
            });
            T.addtranslateobj({
                main: "Location",
                de: "Lage",
                pt: "localização",
                fr: "Emplacement",
                es: "Ubicación"
            });
            T.addtranslateobj({
                main: "Player",
                de: "Spieler",
                pt: "Jogador",
                fr: "Joueur",
                es: "Jugador"
            });
            T.addtranslateobj({
                main: "Bases",
                de: "Bases",
                pt: "Bases",
                fr: "Bases",
                es: "Bases"
            });
            T.addtranslateobj({
                main: "Camp,Outpost",
                de: "Lager,Vorposten",
                pt: "Camp,posto avançado",
                fr: "Camp,avant-poste",
                es: "Camp.,puesto avanz."
            });
            T.addtranslateobj({
                main: "Camp",
                de: "Lager",
                pt: "Camp",
                fr: "Camp",
                es: "Campamento"
            });
            T.addtranslateobj({
                main: "Outpost",
                de: "Vorposten",
                pt: "posto avançado",
                fr: "avant-poste",
                es: "Puesto avanzado"
            });
            T.addtranslateobj({
                main: "BaseScanner Layout",
                de: "BaseScanner Layout",
                pt: "Layout da Base de Dados de Scanner",
                fr: "Mise scanner de base",
                es: "Diseños de BaseScanner"
            });
            T.addtranslateobj({
                main: "Show Layouts",
                de: "Layouts anzeigen",
                pt: "Mostrar Layouts",
                fr: "Voir Layouts",
                es: "Mostrar diseños"
            });
            T.addtranslateobj({
                main: "Building state",
                de: "Gebäudezustand",
                pt: "construção do Estado",
                fr: "construction de l'État",
                es: "Estado de construcción"
            });
            T.addtranslateobj({
                main: "Defense state",
                de: "Verteidigungszustand",
                pt: "de Defesa do Estado",
                fr: "défense de l'Etat",
                es: "Estado de defensa"
            });
            T.addtranslateobj({
                main: "CP",
                de: "KP",
                pt: "CP",
                fr: "CP",
                es: "PM"
            });
            T.addtranslateobj({
                main: "CP Limit",
                de: "KP begrenzen",
                pt: "CP limitar",
                fr: "CP limiter",
                es: "Límites de PM"
            });
            T.addtranslateobj({
                main: "min Level",
                de: "min. Level",
                pt: "nível mínimo",
                fr: "niveau minimum",
                es: "Nivel mínimo"
            });
            T.addtranslateobj({
                main: "clear Cache",
                de: "Cache leeren",
                pt: "limpar cache",
                fr: "vider le cache",
                es: "Borrar caché"
            });
            T.addtranslateobj({
                main: "Only center on World",
                de: "Nur auf Welt zentrieren",
                pt: "Único centro no Mundial",
                fr: "Seul centre sur World",
                es: "Sólo el centro del mundo"
            });
            T.addtranslateobj({
                main: "base set up at",
                de: "Basis errichtbar",
                pt: "base de configurar a",
                fr: "mis en place à la base",
                es: "configuración de base en"
            });
            T.addtranslateobj({
                main: "Infantry",
                de: "Infanterie",
                pt: "Infantaria",
                fr: "Infanterie",
                es: "Infantería"
            });
            T.addtranslateobj({
                main: "Vehicle",
                de: "Fahrzeuge",
                pt: "Veículos",
                fr: "Vehicule",
                es: "Vehículo"
            });
            T.addtranslateobj({
                main: "Aircraft",
                de: "Flugzeuge",
                pt: "Aeronaves",
                fr: "Aviation",
                es: "Aviación"
            });
            T.addtranslateobj({
                main: "Tiberium",
                de: "Tiberium",
                pt: "Tibério",
                fr: "Tiberium",
                es: "Tiberio"
            });
            T.addtranslateobj({
                main: "Crystal",
                de: "Kristalle",
                pt: "Cristal",
                fr: "Cristal",
                es: "Cristal"
            });
            T.addtranslateobj({
                main: "Power",
                de: "Strom",
                pt: "Potência",
                fr: "Energie",
                es: "Energía"
            });
            T.addtranslateobj({
                main: "Dollar",
                de: "Credits",
                pt: "Créditos",
                fr: "Crédit",
                es: "Créditos"
            });
            T.addtranslateobj({
                main: "Research",
                de: "Forschung",
                pt: "Investigação",
                fr: "Recherche",
                es: "Investigación"
            });
            T.addtranslateobj({
                main: "All Layouts",
                de: "Alle Layouts",
                pt: "Todos Layouts",
                fr: "Toutes Layouts",
                es: "Todos Layouts"
            });
            T.addtranslateobj({
                main: "-----",
                de: "--",
                pt: "--",
                fr: "--",
                es: "-----"
            });
            var MT_Lang = null;
            var MT_Cache = null;
            var MT_Base = null;
            var fileManager = null;
            var lastid = 0;
            var countlastidchecked = 0;
            fileManager = ClientLib.File.FileManager.GetInstance();
            MT_Lang = window.MaelstromTools.Language.getInstance();
            MT_Cache = window.MaelstromTools.Cache.getInstance();
            MT_Base = window.MaelstromTools.Base.getInstance();
            MT_Base.createNewImage("BaseScanner", "ui/icons/icon_item.png", fileManager);
            MT_Base.createNewImage("Emptypixels", "ui/menues/main_menu/misc_empty_pixel.png", fileManager);
            var openBaseScannerOverview = MT_Base.createDesktopButton(T.get("BaseScanner Overview") + "version " + window.__msbs_version, "BaseScanner", false, MT_Base.desktopPosition(2));
            openBaseScannerOverview.addListener("execute", function () {
                Addons.BaseScannerGUI.getInstance().openWindow(T.get("BaseScanner Overview") + " version " + window.__msbs_version);
            }, this);
            Addons.BaseScannerGUI.getInstance().addListener("close", Addons.BaseScannerGUI.getInstance().FN, Addons.BaseScannerGUI.getInstance());
            //this.addListener("resize", function(){ }, this );
            //REVIEW added window size save
            //By Netquik
            Addons.BaseScannerGUI.getInstance().addListener("resize", function (e) {
                var width = e.getData().width;
                var height = e.getData().height;
                Addons.LocalStorage.setserver("Basescanner_GUIWidth_", width);
                Addons.LocalStorage.setserver("Basescanner_GUIHeight_", height);
            }, this);

            Addons.BaseScannerGUI.getInstance().addListener("move", function (e) {
                var left = e.getData().left;
                var top = e.getData().top;
                Addons.LocalStorage.setserver("Basescanner_GUILeft_", left);
                Addons.LocalStorage.setserver("Basescanner_GUITop_", top);
            }, this);

            MT_Base.addToMainMenu("BaseScanner", openBaseScannerOverview);
            if (typeof Addons.AddonMainMenu !== 'undefined') {
                var addonmenu = Addons.AddonMainMenu.getInstance();
                addonmenu.AddMainMenu("Basescanner", function () {
                    Addons.BaseScannerGUI.getInstance().openWindow(T.get("BaseScanner Overview") + " version " + window.__msbs_version);
                }, "ALT+B");
            }
        }

        function getResourcesPart(cityEntities) {
            try {
                var loot = [0, 0, 0, 0, 0, 0, 0, 0];
                if (cityEntities == null) {
                    return loot;
                }
                for (var i in cityEntities) {
                    var cityEntity = cityEntities[i];
                    var unitLevelRequirements = MaelstromTools.Wrapper.GetUnitLevelRequirements(cityEntity);
                    for (var x = 0; x < unitLevelRequirements.length; x++) {
                        loot[unitLevelRequirements[x].Type] += unitLevelRequirements[x].Count * cityEntity.get_HitpointsPercent();
                        if (cityEntity.get_HitpointsPercent() < 1.0) {
                            // destroyed
                        }
                    }
                }
                return loot;
            } catch (e) {
                console.debug("MaelstromTools_Basescanner getResourcesPart", e);
            }
        }

        function objfnkstrON(obj) {
            var key;
            for (key in obj) {
                if (typeof (obj[key]) == "function") {
                    var s = obj[key].toString();
                    console.debug(key, s);
                    //var protostring = s.replace(/\s/gim, "");
                    //console.log(key, protostring);
                }
            }
        }

        function foundfnkstring(obj, redex, objname, n) {
            var redexfounds = [];
            var s = obj.toString();
            var protostring = s.replace(/\s/gim, "");
            redexfounds = protostring.match(redex);
            var i;
            for (i = 1; i < (n + 1); i++) {
                if (redexfounds != null && redexfounds[i].length == 6) {
                    console.debug(objname, i, redexfounds[i]);
                } else if (redexfounds != null && redexfounds[i].length > 0) {
                    console.warn(objname, i, redexfounds[i]);
                } else {
                    console.error("Error - ", objname, i, "not found");
                    console.warn(objname, protostring);
                }
            }
            return redexfounds;
        }

        function MaelstromTools_Basescanner_checkIfLoaded() {
            try {
                if (typeof qx != 'undefined' && typeof MaelstromTools != 'undefined') {
                    createMaelstromTools_Basescanner();
                } else {
                    window.setTimeout(MaelstromTools_Basescanner_checkIfLoaded, 1000);
                }
            } catch (e) {
                console.debug("MaelstromTools_Basescanner_checkIfLoaded: ", e);
            }
        }
        if (/commandandconquer\.com/i.test(document.domain)) {
            window.setTimeout(MaelstromTools_Basescanner_checkIfLoaded, 10000);
        }
    };
    try {
        var MaelstromScript_Basescanner = document.createElement("script");
        MaelstromScript_Basescanner.textContent = "(" + MaelstromTools_Basescanner.toString() + ")();";
        MaelstromScript_Basescanner.type = "text/javascript";
        if (/commandandconquer\.com/i.test(document.domain)) {
            document.getElementsByTagName("head")[0].appendChild(MaelstromScript_Basescanner);
        }
    } catch (e) {
        console.debug("MaelstromTools_Basescanner: init error: ", e);
    }
})();