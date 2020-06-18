// ==UserScript==
// @name        leoStats
// @version     2020.02.02.2
// @author      leo7044 (https://github.com/leo7044)
// @homepage    https://cnc.indyserver.info/
// @downloadURL https://cnc.indyserver.info/js/leostats.user.js
// @updateURL   https://cnc.indyserver.info/js/leostats.user.js
// @description leoStats und BaseScanner vereint
// @include     https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @require		https://code.jquery.com/jquery-3.3.1.min.js
// @icon        https://cnc.indyserver.info/img/icon_32.png
// @grant       none
// ==/UserScript==

// Hinweise:
// Dieses Script befindet sich in einer Umbauphase
// Dieses Script ist für alle Welten freigeschaltet.
// Wenn ihr mit mir Kontakt aufnehmen wollt, schreibt mir eine Email: cc.ta.leo7044@gmail.com
// Das Script ist verschlüsselt, da ich Scriptmanipulationen ausschließen möchte. Wer der Sache misstraut: Es steht euch frei, mit mir Kontakt aufzunehmen.
// Ansonsten bleibt mir nur zu sagen: Viel Spaß!

(function () {
    var leoStatsMain = function ()
    {
        function leoStatsCreate()
        {
            function setButtons()
            {
                var linkToRoot = "https://cnc.indyserver.info/";
                var scriptVersionLocal = '2020.03.07';
                qx.Class.define('leoStats',
                {
                    type: 'singleton',
                    extend: qx.core.Object,
                    construct: function ()
                    {
                        console.log('create leoStats...');
                    },
                    members:
                    {
                        initialize: function()
                        {
                            this.sendChatInfoStatus = true;
                            this.ObjectData = {};
                            this.ObjectDataNotSend = {};
                            this.linkBase = '';
                            this.ObjectReportData = {};
                            this.timeoutArrayReportDataManager = [];
                            this.ReportsAreLoading = false;
                            this.app = qx.core.Init.getApplication();
                            this.GuiButtonLeoStats = new qx.ui.form.Button('leoStats').set(
                            {
                                center: true,
                                rich: true
                            });
                            this.setCncOptVars();
                            this.getCurrentStats();
                            this.buildGUI();
                        },
                        buildGUI: function()
                        {
                            // GUI-Fenster
                            this.GuiFenster = new qx.ui.window.Window('leoStats ' + scriptVersionLocal + ' by leo7044').set({
                                padding: 5,
                                paddingRight: 0,
                                width: 350,
                                showMaximize:false,
                                showMinimize:false,
                                showClose:true,
                                allowClose:true,
                                resizable:false
                            });
                            this.GuiFenster.setTextColor('black');
                            this.GuiFenster.setLayout(new qx.ui.layout.HBox());
                            this.GuiFenster.moveTo(200, 48);

                            // Tab-Reihe
                            this.GuiTab = new qx.ui.tabview.TabView().set({
                                contentPaddingTop: 3,
                                contentPaddingBottom: 6,
                                contentPaddingRight: 7,
                                contentPaddingLeft: 3
                            });
                            this.GuiFenster.add(this.GuiTab);

                            // Tab 1: Info
                            this.GuiInfoPage = new qx.ui.tabview.Page("Info");
                            this.GuiInfoPage.setLayout(new qx.ui.layout.Grow());
                            this.GuiTab.add(this.GuiInfoPage);
                            this.GuiInfoVBox = new qx.ui.container.Composite();
                            this.GuiInfoVBox.setLayout(new qx.ui.layout.VBox(5));
                            this.GuiInfoVBox.setThemedPadding(10);
                            this.GuiInfoVBox.setThemedBackgroundColor("#eef");
                            this.GuiInfoPage.add(this.GuiInfoVBox);

                            // Tab 2: Bases
                            this.GuiBasesPage = new qx.ui.tabview.Page("Bases");
                            this.GuiBasesPage.setLayout(new qx.ui.layout.Grow());
                            this.GuiTab.add(this.GuiBasesPage);
                            this.GuiBasesVBox = new qx.ui.container.Composite();
                            this.GuiBasesVBox.setLayout(new qx.ui.layout.VBox(5));
                            this.GuiBasesVBox.setThemedPadding(10);
                            this.GuiBasesVBox.setThemedBackgroundColor("#eef");
                            this.GuiBasesPage.add(this.GuiBasesVBox);

                            // Tab 3: Player
                            this.GuiPlayerPage = new qx.ui.tabview.Page("Player");
                            this.GuiPlayerPage.setLayout(new qx.ui.layout.Grow());
                            this.GuiTab.add(this.GuiPlayerPage);
                            this.GuiPlayerVBox = new qx.ui.container.Composite();
                            this.GuiPlayerVBox.setLayout(new qx.ui.layout.VBox(5));
                            this.GuiPlayerVBox.setThemedPadding(10);
                            this.GuiPlayerVBox.setThemedBackgroundColor("#eef");
                            this.GuiPlayerPage.add(this.GuiPlayerVBox);

                            // Tab 4: Alliance
                            this.GuiAlliancePage = new qx.ui.tabview.Page("Alliance");
                            this.GuiAlliancePage.setLayout(new qx.ui.layout.Grow());
                            this.GuiTab.add(this.GuiAlliancePage);
                            this.GuiAllianceVBox = new qx.ui.container.Composite();
                            this.GuiAllianceVBox.setLayout(new qx.ui.layout.VBox(5));
                            this.GuiAllianceVBox.setThemedPadding(10);
                            this.GuiAllianceVBox.setThemedBackgroundColor("#eef");
                            this.GuiAlliancePage.add(this.GuiAllianceVBox);

                            // Tab 5: POIs
                            this.GuiPoisPage = new qx.ui.tabview.Page("POIs");
                            this.GuiPoisPage.setLayout(new qx.ui.layout.Grow());
                            this.GuiTab.add(this.GuiPoisPage);
                            this.GuiPoisVBox = new qx.ui.container.Composite();
                            this.GuiPoisVBox.setLayout(new qx.ui.layout.VBox(5));
                            this.GuiPoisVBox.setThemedPadding(10);
                            this.GuiPoisVBox.setThemedBackgroundColor("#eef");
                            this.GuiPoisPage.add(this.GuiPoisVBox);

                            // Tab 6: POI-Data
                            this.GuiPoiDataPage = new qx.ui.tabview.Page("POI-Data");
                            this.GuiPoiDataPage.setLayout(new qx.ui.layout.Grow());
                            this.GuiTab.add(this.GuiPoiDataPage);
                            this.GuiPoiDataVBox = new qx.ui.container.Composite();
                            this.GuiPoiDataVBox.setLayout(new qx.ui.layout.VBox(5));
                            this.GuiPoiDataVBox.setThemedPadding(10);
                            this.GuiPoiDataVBox.setThemedBackgroundColor("#eef");
                            this.GuiPoiDataPage.add(this.GuiPoiDataVBox);

                            // Tab 7: Resources
                            this.GuiResourcesPage = new qx.ui.tabview.Page("Resources");
                            this.GuiResourcesPage.setLayout(new qx.ui.layout.Grow());
                            this.GuiTab.add(this.GuiResourcesPage);
                            this.GuiResourcesVBox = new qx.ui.container.Composite();
                            this.GuiResourcesVBox.setLayout(new qx.ui.layout.VBox(5));
                            this.GuiResourcesVBox.setThemedPadding(10);
                            this.GuiResourcesVBox.setThemedBackgroundColor("#eef");
                            this.GuiResourcesPage.add(this.GuiResourcesVBox);

                            // Tab 8: Sell Base
                            this.GuiSellBasePage = new qx.ui.tabview.Page("Sell Base");
                            this.GuiSellBasePage.setLayout(new qx.ui.layout.Grow());
                            this.GuiTab.add(this.GuiSellBasePage);
                            this.GuiSellBaseVBox = new qx.ui.container.Composite();
                            this.GuiSellBaseVBox.setLayout(new qx.ui.layout.VBox(5));
                            this.GuiSellBaseVBox.setThemedPadding(10);
                            this.GuiSellBaseVBox.setThemedBackgroundColor("#eef");
                            this.GuiSellBasePage.add(this.GuiSellBaseVBox);

                            // Button
                            this.GuiButtonLeoStats.addListener('click', function()
                            {
                                // qx.core.Init.getApplication().showExternal(linkToRoot);
                                this.GuiInfoVBox.removeAll();
                                this.GuiBasesVBox.removeAll();
                                this.GuiPlayerVBox.removeAll();
                                this.GuiAllianceVBox.removeAll();
                                this.GuiPoisVBox.removeAll();
                                this.GuiPoiDataVBox.removeAll();
                                this.GuiResourcesVBox.removeAll();
                                this.GuiSellBaseVBox.removeAll();
                                this.getCurrentStats();
                                this.showGui();
                                this.GuiFenster.show();
                            }, this);

                            // set Button to position
                            this.app.getDesktop().add(this.GuiButtonLeoStats,
                            {
                                right: 125,
                                top: 0
                            });
                        },
                        showGui: function()
                        {
                            // Tab 1: Info
                            var HeaderTableInfoInformation = new qx.ui.container.Composite(new qx.ui.layout.HBox(50).set({alignX: "center"}));                            
                            var HeadLineInfo = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            // Tabelle: Alliance
                            /*if (this.ObjectData.alliance.AllianceId > 0)
                            {
                                HeadLineInfo.add(new qx.ui.basic.Label('<big><u><b>Alliance</b></u></big>').set({rich: true}));
                                HeadLineInfo.add(new qx.ui.basic.Label('').set({rich: true}));
                                var TableInfoAlliance = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({alignX: "center"}));
                                var TextKey = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "right"}));
                                var TextValue = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "left"}));
                                TextKey.add(new qx.ui.basic.Label('<b>Name</b>').set({rich: true}));
                                TextValue.add(new qx.ui.basic.Label(this.ObjectData.alliance.AllianceName).set({rich: true}));
                                TextKey.add(new qx.ui.basic.Label('<b>Rank</b>').set({rich: true}));
                                TextValue.add(new qx.ui.basic.Label(this.ObjectData.alliance.AllianceRank.toLocaleString()).set({rich: true}));*/
                                /*TextKey.add(new qx.ui.basic.Label('<b>Members</b>').set({rich: true}));
                                var ArrayMemberNames = [];
                                for (var i = 0; i < ClientLib.Data.MainData.GetInstance().get_Alliance().get_MemberDataAsArray().length; i++)
                                {
                                    ArrayMemberNames.push(ClientLib.Data.MainData.GetInstance().get_Alliance().get_MemberDataAsArray()[i].Name);
                                }
                                ArrayMemberNames.sort();
                                TextValue.add(new qx.ui.basic.Label(ArrayMemberNames.join(', ')).set({rich: true, width: 500, selectable: true}));*/
                                /*TableInfoAlliance.add(TextKey);
                                TableInfoAlliance.add(TextValue);
                                HeadLineInfo.add(TableInfoAlliance);
                                HeadLineInfo.add(new qx.ui.basic.Label('').set({rich: true}));
                            }*/
                            // Tabelle: Information
                            HeadLineInfo.add(new qx.ui.basic.Label('<big><u><b>Information</b></u></big>').set({rich: true}));
                            HeadLineInfo.add(new qx.ui.basic.Label('').set({rich: true}));
                            var TableInfoInformation = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({alignX: "center"}));
                            var TextKey = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "right"}));
                            var TextValue = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "left"}));
                            TextKey.add(new qx.ui.basic.Label('<b>Scriptname</b>').set({rich: true}));
                            TextValue.add(new qx.ui.basic.Label('leoStats').set({rich: true}));
                            TextKey.add(new qx.ui.basic.Label('<b>Version</b>').set({rich: true}));
                            TextValue.add(new qx.ui.basic.Label(scriptVersionLocal).set({rich: true}));
                            TextKey.add(new qx.ui.basic.Label('<b>Autor</b>').set({rich: true}));
                            TextValue.add(new qx.ui.basic.Label('leo7044').set({rich: true}));
                            TextKey.add(new qx.ui.basic.Label('<b>Website</b>').set({rich: true}));
                            TextValue.add(new qx.ui.basic.Label('<a href="' + linkToRoot + '" target="_blank">' + linkToRoot + '</a>').set({rich: true}));
                            TextKey.add(new qx.ui.basic.Label('<b>BaseScanner</b>').set({rich: true}));
                            TextValue.add(new qx.ui.basic.Label('<a href="' + linkToRoot + 'BaseScanner/?WorldId=' + this.ObjectData.server.WorldId + '" target="_blank">' + linkToRoot + 'BaseScanner/?WorldId=' + this.ObjectData.server.WorldId + '</a>').set({rich: true}));
                            TextKey.add(new qx.ui.basic.Label('<b>E-Mail</b>').set({rich: true}));
                            TextValue.add(new qx.ui.basic.Label('<a href="mailto:cc.ta.leo7044@gmail.com">cc.ta.leo7044@gmail.com</a>').set({rich: true}));
                            TableInfoInformation.add(TextKey);
                            TableInfoInformation.add(TextValue);
                            HeadLineInfo.add(TableInfoInformation);
                            // Field: Button
                            var FieldInfoTransmitData = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            FieldInfoTransmitData.add(new qx.ui.basic.Label('').set({rich: true}));
                            FieldInfoTransmitData.add(new qx.ui.basic.Label('<form><input type="button" value="Transmit data" onclick="leoStats.getInstance().getCurrentStats();"/></form>').set({rich: true}));
                            HeadLineInfo.add(FieldInfoTransmitData);
                            HeaderTableInfoInformation.add(HeadLineInfo);
                            this.GuiInfoVBox.add(HeaderTableInfoInformation);

                            // Tab 2: Bases
                            var HeaderTableBases = new qx.ui.container.Composite(new qx.ui.layout.HBox(50).set({alignX: "center"}));
                            var HeadLineBases = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            HeadLineBases.add(new qx.ui.basic.Label('<big><u><b>Playerbases</b></u></big>').set({rich: true}));
                            HeadLineBases.add(new qx.ui.basic.Label('').set({rich: true}));
                            var TableBases = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({alignX: "center"}));
                            var TextBaseName = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var TextTiberium = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var TextLvlCY = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var TextLvlBase = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var TextLvlOff = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var TextLvlDef = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var TextLvlDF = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var TextLvlSup = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var TextCrystal = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var TextPower = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var TextCredits = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextBaseName.add(new qx.ui.basic.Label('<b>BaseName</b>').set({rich: true}));
                            TextLvlCY.add(new qx.ui.basic.Label('<b>CY</b>').set({rich: true}));
                            TextLvlBase.add(new qx.ui.basic.Label('<b>Base</b>').set({rich: true}));
                            TextLvlOff.add(new qx.ui.basic.Label('<b>Off</b>').set({rich: true}));
                            TextLvlDef.add(new qx.ui.basic.Label('<b>Def</b>').set({rich: true}));
                            TextLvlDF.add(new qx.ui.basic.Label('<b>DF</b>').set({rich: true}));
                            TextLvlSup.add(new qx.ui.basic.Label('<b>Sup</b>').set({rich: true}));
                            TextTiberium.add(new qx.ui.basic.Label('<b>Tiberium</b>').set({rich: true}));
                            TextCrystal.add(new qx.ui.basic.Label('<b>Crystal</b>').set({rich: true}));
                            TextPower.add(new qx.ui.basic.Label('<b>Power</b>').set({rich: true}));
                            TextCredits.add(new qx.ui.basic.Label('<b>Credits</b>').set({rich: true}));
                            for (var i in this.ObjectData.bases)
                            {
                                TextBaseName.add(new qx.ui.basic.Label(this.ObjectData.bases[i].BaseName).set({rich: true, alignX: "left"}));
                                TextLvlCY.add(new qx.ui.basic.Label((this.ObjectData.bases[i].LvLCY).toLocaleString()).set({rich: true, alignX: "right"}));
                                TextLvlBase.add(new qx.ui.basic.Label((this.ObjectData.bases[i].LvLBase).toFixed(2).toLocaleString()).set({rich: true, alignX: "right"}));
                                TextLvlOff.add(new qx.ui.basic.Label((this.ObjectData.bases[i].LvLOffense).toFixed(2).toLocaleString()).set({rich: true, alignX: "right"}));
                                TextLvlDef.add(new qx.ui.basic.Label((this.ObjectData.bases[i].LvLDefense).toFixed(2).toLocaleString()).set({rich: true, alignX: "right"}));
                                TextLvlDF.add(new qx.ui.basic.Label((this.ObjectData.bases[i].LvLDF).toLocaleString()).set({rich: true, alignX: "right"}));
                                if (this.ObjectData.bases[i].LvLSupport > 0)
                                {
                                    TextLvlSup.add(new qx.ui.basic.Label((this.ObjectData.bases[i].LvLSupport).toLocaleString() + ' (' + this.ObjectData.bases[i].SupArt + ')').set({rich: true, alignX: "right"}));
                                }
                                else
                                {
                                    TextLvlSup.add(new qx.ui.basic.Label('---').set({rich: true, alignX: "right"}));
                                }
                                TextTiberium.add(new qx.ui.basic.Label((this.ObjectData.bases[i].TiberiumPerHour).toLocaleString()).set({rich: true, alignX: "right"}));
                                TextCrystal.add(new qx.ui.basic.Label((this.ObjectData.bases[i].CrystalPerHour).toLocaleString()).set({rich: true, alignX: "right"}));
                                TextPower.add(new qx.ui.basic.Label((this.ObjectData.bases[i].PowerPerHour).toLocaleString()).set({rich: true, alignX: "right"}));
                                TextCredits.add(new qx.ui.basic.Label((this.ObjectData.bases[i].CreditsPerHour).toLocaleString()).set({rich: true, alignX: "right"}));
                            }
                            TextBaseName.add(new qx.ui.basic.Label('<b>Overall</b>').set({rich: true}));
                            TextLvlCY.add(new qx.ui.basic.Label((this.ObjectData.player.AverageCY).toFixed(2).toLocaleString()).set({rich: true, alignX: "right"}));
                            TextLvlBase.add(new qx.ui.basic.Label((this.ObjectData.player.AverageBase).toFixed(2).toLocaleString()).set({rich: true, alignX: "right"}));
                            TextLvlOff.add(new qx.ui.basic.Label((this.ObjectData.player.AverageOff).toFixed(2).toLocaleString()).set({rich: true, alignX: "right"}));
                            TextLvlDef.add(new qx.ui.basic.Label((this.ObjectData.player.AverageDef).toFixed(2).toLocaleString()).set({rich: true, alignX: "right"}));
                            TextLvlDF.add(new qx.ui.basic.Label((this.ObjectData.player.AverageDF).toFixed(2).toLocaleString()).set({rich: true, alignX: "right"}));
                            TextLvlSup.add(new qx.ui.basic.Label((this.ObjectData.player.AverageSup).toFixed(2).toLocaleString()).set({rich: true, alignX: "right"}));
                            TextTiberium.add(new qx.ui.basic.Label((this.ObjectData.player.ProductionTiberium).toLocaleString()).set({rich: true, alignX: "right"}));
                            TextCrystal.add(new qx.ui.basic.Label((this.ObjectData.player.ProductionCrystal).toLocaleString()).set({rich: true, alignX: "right"}));
                            TextPower.add(new qx.ui.basic.Label((this.ObjectData.player.ProductionPower).toLocaleString()).set({rich: true, alignX: "right"}));
                            TextCredits.add(new qx.ui.basic.Label((this.ObjectData.player.ProductionCredits).toLocaleString()).set({rich: true, alignX: "right"}));
                            TableBases.add(TextBaseName);
                            TableBases.add(TextLvlCY);
                            TableBases.add(TextLvlBase);
                            TableBases.add(TextLvlOff);
                            TableBases.add(TextLvlDef);
                            TableBases.add(TextLvlDF);
                            TableBases.add(TextLvlSup);
                            TableBases.add(TextTiberium);
                            TableBases.add(TextCrystal);
                            TableBases.add(TextPower);
                            TableBases.add(TextCredits);
                            HeadLineBases.add(TableBases);
                            HeaderTableBases.add(HeadLineBases);
                            this.GuiBasesVBox.add(HeaderTableBases);

                            this.createTabPlayer();
                            this.createTabAlliance();

                            // Tab 5: POIs
                            var HeaderTablePois = new qx.ui.container.Composite(new qx.ui.layout.HBox(50).set({alignX: "center"}));
                            var HeadLinePois = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            HeadLinePois.add(new qx.ui.basic.Label('<big><u><b>POIs</b></u></big>').set({rich: true}));
                            HeadLinePois.add(new qx.ui.basic.Label('').set({rich: true}));
                            var HeadLinePoisScroll = new qx.ui.container.Scroll().set({width: 627, height: 560});
                            var TablePois = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({alignX: "center"}));
                            var TextTib = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var TextCry = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var TextPow = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var TextInf = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var TextVeh = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var TextAir = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var TextDef = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            var IconTib = null;
                            var IconCry = null;
                            var IconPow = null;
                            var IconInf = null;
                            var IconVeh = null;
                            var IconAir = null;
                            var IconDef = null;
                            TextTib.add(IconTib = new qx.ui.basic.Atom('<b>Tiberium</b>', 'webfrontend/ui/common/icn_res_tiberium.png').set({rich: true}));
                            IconTib.getChildControl('icon').set({ width: 18, height: 18, scale: true, alignY: "middle" });
                            TextCry.add(IconCry = new qx.ui.basic.Atom('<b>Crystal</b>', 'webfrontend/ui/common/icn_res_chrystal.png').set({rich: true}));
                            IconCry.getChildControl('icon').set({ width: 18, height: 18, scale: true, alignY: "middle" });
                            TextPow.add(IconPow = new qx.ui.basic.Atom('<b>Power</b>', 'webfrontend/ui/common/icn_res_power.png').set({rich: true}));
                            IconPow.getChildControl('icon').set({ width: 18, height: 18, scale: true, alignY: "middle" });
                            TextInf.add(IconInf = new qx.ui.basic.Atom('<b>Infantry</b>', 'FactionUI/icons/icon_arsnl_off_squad.png').set({rich: true}));
                            IconInf.getChildControl('icon').set({ width: 18, height: 18, scale: true, alignY: "middle" });
                            TextVeh.add(IconVeh = new qx.ui.basic.Atom('<b>Vehicle</b>', 'FactionUI/icons/icon_arsnl_off_vehicle.png').set({rich: true}));
                            IconVeh.getChildControl('icon').set({ width: 18, height: 18, scale: true, alignY: "middle" });
                            TextAir.add(IconAir = new qx.ui.basic.Atom('<b>Aircraft</b>', 'FactionUI/icons/icon_arsnl_off_plane.png').set({rich: true}));
                            IconAir.getChildControl('icon').set({ width: 18, height: 18, scale: true, alignY: "middle" });
                            TextDef.add(IconDef = new qx.ui.basic.Atom('<b>Defense</b>', 'FactionUI/icons/icon_def_army_points.png').set({rich: true}));
                            IconDef.getChildControl('icon').set({ width: 18, height: 18, scale: true, alignY: "middle" });
                            var ArrayPois = [];
                            if (this.ObjectData.alliance.AllianceId)
                            {
                                ArrayPois = ClientLib.Data.MainData.GetInstance().get_Alliance().get_OwnedPOIs();
                            }
                            ArrayPois.reverse(); // destructive, Originalarray wird gedreht
                            for (var i in ArrayPois)
                            {
                                switch(ArrayPois[i].t)
                                {
                                    case 2:
                                    {
                                        TextTib.add(new qx.ui.basic.Label(ArrayPois[i].l + ' (<a style="cursor: pointer; color: #1d79ff" onclick="webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(parseInt(' + ArrayPois[i].x + '), parseInt(' + ArrayPois[i].y + '));">' + ArrayPois[i].x + ':' + ArrayPois[i].y + '</a>)').set({rich: true, alignX: "left"}));
                                        break;
                                    }
                                    case 3:
                                    {
                                        TextCry.add(new qx.ui.basic.Label(ArrayPois[i].l + ' (<a style="cursor: pointer; color: #1d79ff" onclick="webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(parseInt(' + ArrayPois[i].x + '), parseInt(' + ArrayPois[i].y + '));">' + ArrayPois[i].x + ':' + ArrayPois[i].y + '</a>)').set({rich: true, alignX: "left"}));
                                        break;
                                    }
                                    case 4:
                                    {
                                        TextPow.add(new qx.ui.basic.Label(ArrayPois[i].l + ' (<a style="cursor: pointer; color: #1d79ff" onclick="webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(parseInt(' + ArrayPois[i].x + '), parseInt(' + ArrayPois[i].y + '));">' + ArrayPois[i].x + ':' + ArrayPois[i].y + '</a>)').set({rich: true, alignX: "left"}));
                                        break;
                                    }
                                    case 5:
                                    {
                                        TextInf.add(new qx.ui.basic.Label(ArrayPois[i].l + ' (<a style="cursor: pointer; color: #1d79ff" onclick="webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(parseInt(' + ArrayPois[i].x + '), parseInt(' + ArrayPois[i].y + '));">' + ArrayPois[i].x + ':' + ArrayPois[i].y + '</a>)').set({rich: true, alignX: "left"}));
                                        break;
                                    }
                                    case 6:
                                    {
                                        TextVeh.add(new qx.ui.basic.Label(ArrayPois[i].l + ' (<a style="cursor: pointer; color: #1d79ff" onclick="webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(parseInt(' + ArrayPois[i].x + '), parseInt(' + ArrayPois[i].y + '));">' + ArrayPois[i].x + ':' + ArrayPois[i].y + '</a>)').set({rich: true, alignX: "left"}));
                                        break;
                                    }
                                    case 7:
                                    {
                                        TextAir.add(new qx.ui.basic.Label(ArrayPois[i].l + ' (<a style="cursor: pointer; color: #1d79ff" onclick="webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(parseInt(' + ArrayPois[i].x + '), parseInt(' + ArrayPois[i].y + '));">' + ArrayPois[i].x + ':' + ArrayPois[i].y + '</a>)').set({rich: true, alignX: "left"}));
                                        break;
                                    }
                                    case 8:
                                    {
                                        TextDef.add(new qx.ui.basic.Label(ArrayPois[i].l + ' (<a style="cursor: pointer; color: #1d79ff" onclick="webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(parseInt(' + ArrayPois[i].x + '), parseInt(' + ArrayPois[i].y + '));">' + ArrayPois[i].x + ':' + ArrayPois[i].y + '</a>)').set({rich: true, alignX: "left"}));
                                        break;
                                    }
                                    default:
                                    {
                                        break;
                                    }
                                }
                            }
                            ArrayPois.reverse(); // notwendig, weil das Originalarray gedreht wird
                            TablePois.add(TextTib);
                            TablePois.add(TextCry);
                            TablePois.add(TextPow);
                            TablePois.add(TextInf);
                            TablePois.add(TextVeh);
                            TablePois.add(TextAir);
                            TablePois.add(TextDef);
                            HeadLinePoisScroll.add(TablePois);
                            HeadLinePois.add(HeadLinePoisScroll);
                            HeaderTablePois.add(HeadLinePois);
                            this.GuiPoisVBox.add(HeaderTablePois);

                            // Tab 6: POI-Data
                            var HeaderTablePoiData = new qx.ui.container.Composite(new qx.ui.layout.HBox(50).set({alignX: "center"}));
                            // Tabelle: Poi-Level:
                            var HeadLinePoiDataPoiLevel = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            HeadLinePoiDataPoiLevel.add(new qx.ui.basic.Label('<big><u><b>POI-Level</b></u></big>').set({rich: true}));
                            HeadLinePoiDataPoiLevel.add(new qx.ui.basic.Label('').set({rich: true}));
                            var HeadLinePoiDataPoiLevelScroll = new qx.ui.container.Scroll().set({width: 137, height: 560});
                            var TablePoiDataPoiLevel = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({alignX: "center"}));
                            var TextPoiLevel = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextPoiLevel.add(new qx.ui.basic.Label('<b>Level</b>').set({rich: true}));
                            var TextPoints = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextPoints.add(new qx.ui.basic.Label('<b>Points</b>').set({rich: true}));
                            var maxPoiLevel = ClientLib.Data.MainData.GetInstance().get_Server().get_MaxCenterLevel();
                            for (var i = 12; i <= maxPoiLevel; i++)
                            {
                                var points = ClientLib.Base.PointOfInterestTypes.GetScoreByLevel(i);
                                TextPoiLevel.add(new qx.ui.basic.Label(i.toLocaleString()).set({rich: true, alignX: "right"}));
                                TextPoints.add(new qx.ui.basic.Label(points.toLocaleString()).set({rich: true, alignX: "right"}));
                            }
                            TablePoiDataPoiLevel.add(TextPoiLevel);
                            TablePoiDataPoiLevel.add(TextPoints);
                            HeadLinePoiDataPoiLevelScroll.add(TablePoiDataPoiLevel);
                            HeadLinePoiDataPoiLevel.add(HeadLinePoiDataPoiLevelScroll);
                            HeaderTablePoiData.add(HeadLinePoiDataPoiLevel);

                            // Tabelle: Tier
                            var HeadLinePoiDataTier = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            HeadLinePoiDataTier.add(new qx.ui.basic.Label('<big><u><b>POI-Tiers</b></u></big>').set({rich: true}));
                            HeadLinePoiDataTier.add(new qx.ui.basic.Label('').set({rich: true}));
                            var HeadLinePoiDataTierScroll = new qx.ui.container.Scroll().set({width: 237, height: 560});
                            var TablePoiDataTier = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({alignX: "center"}));
                            var TextScorePoints = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextScorePoints.add(new qx.ui.basic.Label('<b>Points</b>').set({rich: true}));
                            var TextPoiBonusRes = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextPoiBonusRes.add(new qx.ui.basic.Label('<b>Resources</b>').set({rich: true}));
                            var TextPoiBonusFight = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextPoiBonusFight.add(new qx.ui.basic.Label('<b>Fight</b>').set({rich: true}));
                            var poiGlobalBonusFactor = ClientLib.Data.MainData.GetInstance().get_Server().get_POIGlobalBonusFactor();
                            var ArrayScorePoints = [];
                            var previousScorePoints = -1;
                            var currentScorePoints = 0;
                            var currentPoiBonusRes = 0;
                            var currentPoiBonusFight = 0;
                            while (previousScorePoints != currentScorePoints)
                            {
                                previousScorePoints = currentScorePoints;
                                currentScorePoints = ClientLib.Base.PointOfInterestTypes.GetNextScore(previousScorePoints);
                                currentPoiBonusRes = ClientLib.Base.PointOfInterestTypes.GetBoostsByScore(currentScorePoints, ClientLib.Data.Ranking.ERankingType.BonusTiberium, poiGlobalBonusFactor);
                                currentPoiBonusFight = ClientLib.Base.PointOfInterestTypes.GetBoostsByScore(currentScorePoints, ClientLib.Data.Ranking.ERankingType.BonusInfantry, poiGlobalBonusFactor);
                                if (currentScorePoints != previousScorePoints)
                                {
                                    ArrayScorePoints.push(currentScorePoints);
                                    TextScorePoints.add(new qx.ui.basic.Label(currentScorePoints.toLocaleString()).set({rich: true, alignX: "right"}));
                                    TextPoiBonusRes.add(new qx.ui.basic.Label(currentPoiBonusRes.toLocaleString()).set({rich: true, alignX: "right"}));
                                    TextPoiBonusFight.add(new qx.ui.basic.Label(currentPoiBonusFight.toLocaleString()).set({rich: true, alignX: "right"}));
                                }
                                else
                                {
                                    break;
                                }
                            }
                            TablePoiDataTier.add(TextScorePoints);
                            TablePoiDataTier.add(TextPoiBonusRes);
                            TablePoiDataTier.add(TextPoiBonusFight);
                            HeadLinePoiDataTierScroll.add(TablePoiDataTier);
                            HeadLinePoiDataTier.add(HeadLinePoiDataTierScroll);
                            HeaderTablePoiData.add(HeadLinePoiDataTier);

                            // Tabelle: Multiplier
                            if (!this.ObjectData.server.SeasonServer)
                            {
                                var HeadLinePoiDataMultiplier = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                HeadLinePoiDataMultiplier.add(new qx.ui.basic.Label('<big><u><b>Multiplier</b></u></big>').set({rich: true}));
                                HeadLinePoiDataMultiplier.add(new qx.ui.basic.Label('').set({rich: true}));
                                var HeadLinePoiDataMultiplierScroll = new qx.ui.container.Scroll().set({width: 113, height: 560});
                                var TablePoiDataMultiplier = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({alignX: "center"}));
                                var TextRank = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextRank.add(new qx.ui.basic.Label('<b>Rank</b>').set({rich: true}));
                                var TextMultiplier = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextMultiplier.add(new qx.ui.basic.Label('<b>Multiplier</b>').set({rich: true}));
                                for (var i = 1; i <= 40; i++)
                                {
                                    var points = ClientLib.Base.PointOfInterestTypes.GetBoostModifierByRank(i);
                                    TextRank.add(new qx.ui.basic.Label(i.toLocaleString()).set({rich: true, alignX: "right"}));
                                    TextMultiplier.add(new qx.ui.basic.Label(points.toLocaleString()).set({rich: true, alignX: "right"}));
                                }
                                TablePoiDataMultiplier.add(TextRank);
                                TablePoiDataMultiplier.add(TextMultiplier);
                                HeadLinePoiDataMultiplierScroll.add(TablePoiDataMultiplier);
                                HeadLinePoiDataMultiplier.add(HeadLinePoiDataMultiplierScroll);
                                HeaderTablePoiData.add(HeadLinePoiDataMultiplier);
                            }
                            this.GuiPoiDataVBox.add(HeaderTablePoiData);

                            // Tab 7: Resources
                            var HeaderTableResources = new qx.ui.container.Composite(new qx.ui.layout.HBox(50).set({alignX: "center"}));
                            var HeadLineOwnResources = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            HeadLineOwnResources.add(new qx.ui.basic.Label('<big><u><b>Own Resources</b></u></big>').set({rich: true}));
                            HeadLineOwnResources.add(new qx.ui.basic.Label('').set({rich: true}));
                            var TableOwnResources = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({alignX: "center"}));
                            var TextBaseName = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextBaseName.add(new qx.ui.basic.Label('<b>BaseName</b>').set({rich: true}));
                            var TextOwnTiberium = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextOwnTiberium.add(new qx.ui.basic.Label('<b>Tiberium</b>').set({rich: true}));
                            var TextOwnCrystal = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextOwnCrystal.add(new qx.ui.basic.Label('<b>Crystal</b>').set({rich: true}));
                            var TextOwnPower = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextOwnPower.add(new qx.ui.basic.Label('<b>Power</b>').set({rich: true}));
                            var valueOverallTiberium = 0;
                            var valueOverallCrystal = 0;
                            var valueOverallPower = 0;
                            for (var i in this.ObjectData.bases)
                            {
                                TextBaseName.add(new qx.ui.basic.Label(this.ObjectData.bases[i].BaseName).set({rich: true, alignX: "left"}));
                                var valueTiberium = parseInt(ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[this.ObjectData.bases[i].BaseId].GetResourceCount(ClientLib.Base.EResourceType.Tiberium));
                                var valueCrystal = parseInt(ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[this.ObjectData.bases[i].BaseId].GetResourceCount(ClientLib.Base.EResourceType.Crystal));
                                var valuePower = parseInt(ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[this.ObjectData.bases[i].BaseId].GetResourceCount(ClientLib.Base.EResourceType.Power));
                                valueOverallTiberium += valueTiberium;
                                valueOverallCrystal += valueCrystal;
                                valueOverallPower += valuePower;
                                TextOwnTiberium.add(new qx.ui.basic.Label(valueTiberium.toLocaleString()).set({rich: true, alignX: "right"}));
                                TextOwnCrystal.add(new qx.ui.basic.Label(valueCrystal.toLocaleString()).set({rich: true, alignX: "right"}));
                                TextOwnPower.add(new qx.ui.basic.Label(valuePower.toLocaleString()).set({rich: true, alignX: "right"}));
                            }
                            TextBaseName.add(new qx.ui.basic.Label('<b>Overall</b>').set({rich: true}));
                            TextOwnTiberium.add(new qx.ui.basic.Label(valueOverallTiberium.toLocaleString()).set({rich: true, alignX: "right"}));
                            TextOwnCrystal.add(new qx.ui.basic.Label(valueOverallCrystal.toLocaleString()).set({rich: true, alignX: "right"}));
                            TextOwnPower.add(new qx.ui.basic.Label(valueOverallPower.toLocaleString()).set({rich: true, alignX: "right"}));
                            TableOwnResources.add(TextBaseName);
                            TableOwnResources.add(TextOwnTiberium);
                            TableOwnResources.add(TextOwnCrystal);
                            TableOwnResources.add(TextOwnPower);
                            HeadLineOwnResources.add(TableOwnResources);
                            HeaderTableResources.add(HeadLineOwnResources);
                            this.GuiResourcesVBox.add(HeaderTableResources);

                            // Tab 8: Sell Base
                            var HeaderTableResources = new qx.ui.container.Composite(new qx.ui.layout.HBox(50).set({alignX: "center"}));
                            var HeadLineSellResources = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            HeadLineSellResources.add(new qx.ui.basic.Label('<big><u><b>Resources through sell</b></u></big>').set({rich: true}));
                            var TableSellRow = new qx.ui.container.Composite(new qx.ui.layout.HBox(15).set({alignX: "center"}));
                            // Column BaseName
                            var TableSellColBaseName = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TableSellColBaseName.add(new qx.ui.basic.Label('').set({rich: true}));
                            var TableSellResources = new qx.ui.container.Composite(new qx.ui.layout.HBox(5).set({alignX: "center"}));
                            var TextSellBaseName = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextSellBaseName.add(new qx.ui.basic.Label('<b>BaseName</b>').set({rich: true}));
                            for (var i in this.ObjectData.bases)
                            {
                                TextSellBaseName.add(new qx.ui.basic.Label(this.ObjectData.bases[i].BaseName).set({rich: true, alignX: "right"}));
                            }
                            TextSellBaseName.add(new qx.ui.basic.Label('<b>Overall</b>').set({rich: true}));
                            TableSellResources.add(TextSellBaseName);
                            TableSellColBaseName.add(TableSellResources);
                            TableSellRow.add(TableSellColBaseName);
                            // Column Buildings
                            var TableSellColBuildings = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TableSellColBuildings.add(new qx.ui.basic.Label('<b><u>Buildings</u></b>').set({rich: true}));
                            var TableSellResources = new qx.ui.container.Composite(new qx.ui.layout.HBox(5).set({alignX: "center"}));
                            var TextSellTiberium = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextSellTiberium.add(new qx.ui.basic.Label('<b>Tiberium</b>').set({rich: true}));
                            var TextSellPower = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextSellPower.add(new qx.ui.basic.Label('<b>Power</b>').set({rich: true}));
                            var valueOverallTiberium = 0;
                            var valueOverallPower = 0;
                            for (var i in this.ObjectData.bases)
                            {
                                var valueTiberium = this.calculateValueOfBase(this.ObjectData.bases[i].BaseId)[0];
                                var valuePower = this.calculateValueOfBase(this.ObjectData.bases[i].BaseId)[1];
                                valueOverallTiberium += valueTiberium;
                                valueOverallPower += valuePower;
                                TextSellTiberium.add(new qx.ui.basic.Label(valueTiberium.toLocaleString()).set({rich: true, alignX: "right"}));
                                TextSellPower.add(new qx.ui.basic.Label(valuePower.toLocaleString()).set({rich: true, alignX: "right"}));
                            }
                            TextSellTiberium.add(new qx.ui.basic.Label(valueOverallTiberium.toLocaleString()).set({rich: true, alignX: "right"}));
                            TextSellPower.add(new qx.ui.basic.Label(valueOverallPower.toLocaleString()).set({rich: true, alignX: "right"}));
                            TableSellResources.add(TextSellTiberium);
                            TableSellResources.add(TextSellPower);
                            TableSellColBuildings.add(TableSellResources);
                            TableSellRow.add(TableSellColBuildings);
                            // Column Defense
                            var TableSellColDefense = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TableSellColDefense.add(new qx.ui.basic.Label('<b><u>Defense</u></b>').set({rich: true}));
                            var TableSellResources = new qx.ui.container.Composite(new qx.ui.layout.HBox(5).set({alignX: "center"}));
                            var TextSellTiberium = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextSellTiberium.add(new qx.ui.basic.Label('<b>Tiberium</b>').set({rich: true}));
                            var TextSellCrystal = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextSellCrystal.add(new qx.ui.basic.Label('<b>Crystal</b>').set({rich: true}));
                            var TextSellPower = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextSellPower.add(new qx.ui.basic.Label('<b>Power</b>').set({rich: true}));
                            var valueOverallTiberium = 0;
                            var valueOverallCrystal = 0;
                            var valueOverallPower = 0;
                            for (var i in this.ObjectData.bases)
                            {
                                var valueTiberium = this.calculateValueOfDefense(this.ObjectData.bases[i].BaseId)[0];
                                var valueCrystal = this.calculateValueOfDefense(this.ObjectData.bases[i].BaseId)[1];
                                var valuePower = this.calculateValueOfDefense(this.ObjectData.bases[i].BaseId)[2];
                                valueOverallTiberium += valueTiberium;
                                valueOverallCrystal += valueCrystal;
                                valueOverallPower += valuePower;
                                TextSellTiberium.add(new qx.ui.basic.Label(valueTiberium.toLocaleString()).set({rich: true, alignX: "right"}));
                                TextSellCrystal.add(new qx.ui.basic.Label(valueCrystal.toLocaleString()).set({rich: true, alignX: "right"}));
                                TextSellPower.add(new qx.ui.basic.Label(valuePower.toLocaleString()).set({rich: true, alignX: "right"}));
                            }
                            TextSellTiberium.add(new qx.ui.basic.Label(valueOverallTiberium.toLocaleString()).set({rich: true, alignX: "right"}));
                            TextSellCrystal.add(new qx.ui.basic.Label(valueOverallCrystal.toLocaleString()).set({rich: true, alignX: "right"}));
                            TextSellPower.add(new qx.ui.basic.Label(valueOverallPower.toLocaleString()).set({rich: true, alignX: "right"}));
                            TableSellResources.add(TextSellTiberium);
                            TableSellResources.add(TextSellCrystal);
                            TableSellResources.add(TextSellPower);
                            TableSellColDefense.add(TableSellResources);
                            TableSellRow.add(TableSellColDefense);
                            // Column Offense
                            var TableSellColOffense = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TableSellColOffense.add(new qx.ui.basic.Label('<b><u>Offense</u></b>').set({rich: true}));
                            var TableSellResources = new qx.ui.container.Composite(new qx.ui.layout.HBox(5).set({alignX: "center"}));
                            var TextSellCrystal = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextSellCrystal.add(new qx.ui.basic.Label('<b>Crystal</b>').set({rich: true}));
                            var TextSellPower = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            TextSellPower.add(new qx.ui.basic.Label('<b>Power</b>').set({rich: true}));
                            var valueOverallCrystal = 0;
                            var valueOverallPower = 0;
                            for (var i in this.ObjectData.bases)
                            {
                                var valueCrystal = this.calculateValueOfOffense(this.ObjectData.bases[i].BaseId)[0];
                                var valuePower = this.calculateValueOfOffense(this.ObjectData.bases[i].BaseId)[1];
                                valueOverallCrystal += valueCrystal;
                                valueOverallPower += valuePower;
                                TextSellCrystal.add(new qx.ui.basic.Label(valueCrystal.toLocaleString()).set({rich: true, alignX: "right"}));
                                TextSellPower.add(new qx.ui.basic.Label(valuePower.toLocaleString()).set({rich: true, alignX: "right"}));
                            }
                            TextSellCrystal.add(new qx.ui.basic.Label(valueOverallCrystal.toLocaleString()).set({rich: true, alignX: "right"}));
                            TextSellPower.add(new qx.ui.basic.Label(valueOverallPower.toLocaleString()).set({rich: true, alignX: "right"}));
                            TableSellResources.add(TextSellCrystal);
                            TableSellResources.add(TextSellPower);
                            TableSellColOffense.add(TableSellResources);
                            TableSellRow.add(TableSellColOffense);
                            // End Columns
                            HeadLineSellResources.add(TableSellRow);
                            HeaderTableResources.add(HeadLineSellResources);
                            this.GuiSellBaseVBox.add(HeaderTableResources);
                        },
                        createTabPlayer: function()
                        {
                            // Tab 3: Player
                            var HeaderTablePlayer = new qx.ui.container.Composite(new qx.ui.layout.HBox(50).set({alignX: "center"}));
                            var HeadLinePlayer = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            HeadLinePlayer.add(new qx.ui.basic.Label('<big><u><b>Player</b></u></big>').set({rich: true}));
                            HeadLinePlayer.add(new qx.ui.basic.Label('').set({rich: true}));
                            var TablePlayer = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({alignX: "center"}));
                            var TextKey = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "right"}));
                            var TextValue = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "left"}));
                            TextKey.add(new qx.ui.basic.Label('<b>Name</b>').set({rich: true}));
                            TextValue.add(new qx.ui.basic.Label(this.ObjectData.player.PlayerName).set({rich: true}));
                            TextKey.add(new qx.ui.basic.Label('<b>Rank</b>').set({rich: true}));
                            TextValue.add(new qx.ui.basic.Label(this.ObjectData.player.PlayerRank.toLocaleString()).set({rich: true}));
                            TextKey.add(new qx.ui.basic.Label('<b>Creation Date</b>').set({rich: true}));
                            TextValue.add(new qx.ui.basic.Label((new  Date(ClientLib.Data.MainData.GetInstance().get_Player().get_CreationDate())).toLocaleString()).set({rich: true}));
                            TextKey.add(new qx.ui.basic.Label('<b>ScorePoints</b>').set({rich: true}));
                            TextValue.add(new qx.ui.basic.Label(this.ObjectData.player.PlayerScorePoints.toLocaleString()).set({rich: true}));
                            if (this.ObjectData.server.SeasonServer == true)
                            {
                                TextKey.add(new qx.ui.basic.Label('<b>Event-Rank</b>').set({rich: true}));
                                TextValue.add(new qx.ui.basic.Label(this.ObjectData.player.PlayerEventRank.toLocaleString()).set({rich: true}));
                                TextKey.add(new qx.ui.basic.Label('<b>LegacyPoints</b>').set({rich: true}));
                                TextValue.add(new qx.ui.basic.Label(this.ObjectData.player.LegacyPoints.toLocaleString()).set({rich: true}));
                                TextKey.add(new qx.ui.basic.Label('<b>VeteranPoints</b>').set({rich: true}));
                                TextValue.add(new qx.ui.basic.Label(this.ObjectData.player.PlayerVeteranPoints.toLocaleString()).set({rich: true}));
                            }
                            if (this.ObjectData.alliance.AllianceId > 0)
                            {
                                TextKey.add(new qx.ui.basic.Label('<b>AllianceRole</b>').set({rich: true}));
                                TextValue.add(new qx.ui.basic.Label(ClientLib.Data.MainData.GetInstance().get_Alliance().get_MemberData().d[ClientLib.Data.MainData.GetInstance().get_Player().get_Id()].RoleName).set({rich: true}));
                            }
                            if (this.ObjectData.player.Shoot != undefined)
                            {
                                TextKey.add(new qx.ui.basic.Label('<b>PvE</b>').set({rich: true}));
                                TextValue.add(new qx.ui.basic.Label(this.ObjectData.player.PvE.toLocaleString()).set({rich: true}));
                                TextKey.add(new qx.ui.basic.Label('<b>PvP</b>').set({rich: true}));
                                TextValue.add(new qx.ui.basic.Label(this.ObjectData.player.PvP.toLocaleString()).set({rich: true}));
                                TextKey.add(new qx.ui.basic.Label('<b>Overall</b>').set({rich: true}));
                                TextValue.add(new qx.ui.basic.Label(this.ObjectData.player.Shoot.toLocaleString()).set({rich: true}));
                            }
                            else
                            {
                                setTimeout(function(_self){_self.createTabPlayer();}, 1000, this);
                            }
                            TablePlayer.add(TextKey);
                            TablePlayer.add(TextValue);
                            HeadLinePlayer.add(TablePlayer);
                            HeadLinePlayer.add(new qx.ui.basic.Label('').set({rich: true}));
                            HeadLinePlayer.add(new qx.ui.basic.Label('').set({rich: true}));
                            if (this.ObjectDataNotSend.Endgames && this.ObjectDataNotSend.Challenges)
                            {
                                if (this.ObjectDataNotSend.Endgames.length > 0 || this.ObjectDataNotSend.Challenges.length > 0)
                                {
                                    var HeaderTableEndgames = new qx.ui.container.Composite(new qx.ui.layout.HBox(50).set({alignX: "center"}));
                                    if (this.ObjectDataNotSend.Endgames.length > 0)
                                    {
                                        var ObjectEndgamesRank = {};
                                        for (var i = 0; i < this.ObjectDataNotSend.Endgames.length; i++)
                                        {
                                            if (ObjectEndgamesRank[this.ObjectDataNotSend.Endgames[i].r])
                                            {
                                                ObjectEndgamesRank[this.ObjectDataNotSend.Endgames[i].r] += 1;
                                            }
                                            else
                                            {
                                                ObjectEndgamesRank[this.ObjectDataNotSend.Endgames[i].r] = 1;
                                            }
                                        }
                                        var HeadLineEndgames = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                        HeadLineEndgames.add(new qx.ui.basic.Label('<big><u><b>Endgames</b></u></big>').set({rich: true}));
                                        HeadLineEndgames.add(new qx.ui.basic.Label('').set({rich: true}));
                                        var TableChallenges = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({alignX: "center"}));
                                        var TextKey = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "right"}));
                                        var TextValue = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "right"}));
                                        TextKey.add(new qx.ui.basic.Label('<b>Rank</b>').set({rich: true, alignX: 'center'}));
                                        TextValue.add(new qx.ui.basic.Label('<b>Count</b>').set({rich: true, alignX: 'center'}));
                                        for (var rank in ObjectEndgamesRank)
                                        {
                                            TextKey.add(new qx.ui.basic.Label(rank.toLocaleString()).set({rich: true}));
                                            TextValue.add(new qx.ui.basic.Label(ObjectEndgamesRank[rank].toLocaleString()).set({rich: true}));
                                        }
                                        TextKey.add(new qx.ui.basic.Label('<b>Overall</b>').set({rich: true, alignX: 'center'}));
                                        TextValue.add(new qx.ui.basic.Label('<b>' + this.ObjectDataNotSend.Endgames.length.toLocaleString() + '</b>').set({rich: true}));
                                        TableChallenges.add(TextKey);
                                        TableChallenges.add(TextValue);
                                        HeadLineEndgames.add(TableChallenges);
                                        HeadLineEndgames.add(new qx.ui.basic.Label('').set({rich: true}));
                                        HeaderTableEndgames.add(HeadLineEndgames);
                                    }
                                    if (this.ObjectDataNotSend.Challenges.length > 0)
                                    {
                                        var ObjectChallengesRank = {Player: {1: 0, 10: 0, 100: 0}, Alliance: {1: 0, 2: 0, 3: 0}};
                                        for (var i = 0; i < this.ObjectDataNotSend.Challenges.length; i++)
                                        {
                                            if (this.ObjectDataNotSend.Challenges[i].ia) // is alliance
                                            {
                                                ObjectChallengesRank['Alliance'][this.ObjectDataNotSend.Challenges[i].r] += 1;
                                            }
                                            else // is player
                                            {
                                                if (this.ObjectDataNotSend.Challenges[i].r == 1)
                                                {
                                                    ObjectChallengesRank['Player'][1] += 1;
                                                }
                                                else if (this.ObjectDataNotSend.Challenges[i].r <= 10)
                                                {
                                                    ObjectChallengesRank['Player'][10] += 1;
                                                }
                                                else if (this.ObjectDataNotSend.Challenges[i].r <= 100)
                                                {
                                                    ObjectChallengesRank['Player'][100] += 1;
                                                }
                                            }
                                        }
                                        var HeadLineChallenges = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                        HeadLineChallenges.add(new qx.ui.basic.Label('<big><u><b>Challenges</b></u></big>').set({rich: true}));
                                        HeadLineChallenges.add(new qx.ui.basic.Label('').set({rich: true}));
                                        var TableChallenges = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({alignX: "center"}));
                                        var TextKey = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "left"}));
                                        var TextValue = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "right"}));
                                        TextKey.add(new qx.ui.basic.Label('<b>Rank</b>').set({rich: true, alignX: 'center'}));
                                        TextValue.add(new qx.ui.basic.Label('<b>Count</b>').set({rich: true, alignX: 'center'}));
                                        for (var type in ObjectChallengesRank)
                                        {
                                            for (var rank in ObjectChallengesRank[type])
                                            {
                                                TextKey.add(new qx.ui.basic.Label((type + ' Top ' + rank).toLocaleString()).set({rich: true}));
                                                TextValue.add(new qx.ui.basic.Label(ObjectChallengesRank[type][rank].toLocaleString()).set({rich: true}));
                                            }
                                        }
                                        TextKey.add(new qx.ui.basic.Label('<b>Overall</b>').set({rich: true, alignX: 'center'}));
                                        TextValue.add(new qx.ui.basic.Label('<b>' + this.ObjectDataNotSend.Challenges.length.toLocaleString() + '</b>').set({rich: true}));
                                        TableChallenges.add(TextKey);
                                        TableChallenges.add(TextValue);
                                        HeadLineChallenges.add(TableChallenges);
                                        HeadLineChallenges.add(new qx.ui.basic.Label('').set({rich: true}));
                                        HeaderTableEndgames.add(HeadLineChallenges);
                                    }
                                    HeadLinePlayer.add(HeaderTableEndgames);
                                }
                            }
                            HeaderTablePlayer.add(HeadLinePlayer);
                            this.GuiPlayerVBox.removeAll();
                            this.GuiPlayerVBox.add(HeaderTablePlayer);
                        },
                        createTabAlliance: function()
                        {
                            // Tab 4: Alliance
                            var HeaderTableAlliance = new qx.ui.container.Composite(new qx.ui.layout.HBox(50).set({alignX: "center"}));
                            var HeadLineAlliance = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                            HeadLineAlliance.add(new qx.ui.basic.Label('<big><u><b>Alliance</b></u></big>').set({rich: true}));
                            HeadLineAlliance.add(new qx.ui.basic.Label('').set({rich: true}));
                            if (this.ObjectData.alliance.AllianceId > 0)
                            {
                                var TableAlliance = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({alignX: "center"}));
                                var TextKey = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "right"}));
                                var TextValue = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "left"}));
                                TextKey.add(new qx.ui.basic.Label('<b>Name</b>').set({rich: true}));
                                TextValue.add(new qx.ui.basic.Label(this.ObjectData.alliance.AllianceName).set({rich: true}));
                                TextKey.add(new qx.ui.basic.Label('<b>Rank</b>').set({rich: true}));
                                TextValue.add(new qx.ui.basic.Label(this.ObjectData.alliance.AllianceRank.toLocaleString()).set({rich: true}));
                                TextKey.add(new qx.ui.basic.Label('<b>ScorePoints</b>').set({rich: true}));
                                TextValue.add(new qx.ui.basic.Label(this.ObjectData.alliance.AllianceTotalScore.toLocaleString()).set({rich: true}));
                                TextKey.add(new qx.ui.basic.Label('<b>AverageScore</b>').set({rich: true}));
                                TextValue.add(new qx.ui.basic.Label(this.ObjectData.alliance.AllianceAverageScore.toLocaleString()).set({rich: true}));
                                if (this.ObjectData.server.SeasonServer == true)
                                {
                                    TextKey.add(new qx.ui.basic.Label('<b>VeteranPoints</b>').set({rich: true}));
                                    TextValue.add(new qx.ui.basic.Label(this.ObjectData.alliance.AllianceVeteranPoints.toLocaleString()).set({rich: true}));
                                    TextKey.add(new qx.ui.basic.Label('<b>VP/h</b>').set({rich: true}));
                                    TextValue.add(new qx.ui.basic.Label(this.ObjectData.alliance.AllianceProdVetPoints.toLocaleString()).set({rich: true}));
                                }
                                if (this.ObjectData.alliance.Shoot != undefined)
                                {
                                    TextKey.add(new qx.ui.basic.Label('<b>PvE</b>').set({rich: true}));
                                    TextValue.add(new qx.ui.basic.Label(this.ObjectData.alliance.PvE.toLocaleString()).set({rich: true}));
                                    TextKey.add(new qx.ui.basic.Label('<b>PvP</b>').set({rich: true}));
                                    TextValue.add(new qx.ui.basic.Label(this.ObjectData.alliance.PvP.toLocaleString()).set({rich: true}));
                                    TextKey.add(new qx.ui.basic.Label('<b>Overall</b>').set({rich: true}));
                                    TextValue.add(new qx.ui.basic.Label(this.ObjectData.alliance.Shoot.toLocaleString()).set({rich: true}));
                                }
                                else
                                {
                                    setTimeout(function(_self){_self.createTabAlliance();}, 1000, this);
                                }
                                TableAlliance.add(TextKey);
                                TableAlliance.add(TextValue);
                                HeadLineAlliance.add(TableAlliance);
                                HeadLineAlliance.add(new qx.ui.basic.Label('').set({rich: true}));
                                HeadLineAlliance.add(new qx.ui.basic.Label('<big><u><b>Bonus</b></u></big>').set({rich: true}));
                                HeadLineAlliance.add(new qx.ui.basic.Label('').set({rich: true}));
                                var TableBonus = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({alignX: "center"}));
                                var TextPoiClass = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                var IconTib = null;
                                var IconCry = null;
                                var IconPow = null;
                                var IconInf = null;
                                var IconVeh = null;
                                var IconAir = null;
                                var IconDef = null;
                                var ArrayScorePoints = [0];
                                var previousScorePoints = -1;
                                var currentScorePoints = 0;
                                while (previousScorePoints != currentScorePoints)
                                {
                                    previousScorePoints = currentScorePoints;
                                    currentScorePoints = ClientLib.Base.PointOfInterestTypes.GetNextScore(previousScorePoints);
                                    if (currentScorePoints != previousScorePoints)
                                    {
                                        ArrayScorePoints.push(currentScorePoints);
                                    }
                                    else
                                    {
                                        break;
                                    }
                                }
                                var poiRankScore = ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIRankScore();
                                var ArrayAbbDesc =
                                    [
                                        [
                                            '<b>POI-Class</b>',
                                            '<b>Score</b>',
                                            '<b>PrevScore</b>',
                                            '<b>NextScore</b>',
                                            '<b>DiffPrev</b>',
                                            '<b>DiffNext</b>',
                                            '<b>PDP</b>',
                                            '<b>PNP</b>',
                                            '<b>PS</b>',
                                            '<b>NS</b>',
                                            '<b>DPS</b>',
                                            '<b>DNS</b>',
                                            '<b>PP</b>',
                                            '<b>NP</b>',
                                            '<b>Bonus</b>',
                                            '<b>Rank</b>'
                                        ],
                                        [
                                            'POI-Class',
                                            'own POI-Score',
                                            'POI-Score of previous bonus tier',
                                            'POI-Score of next bonus tier',
                                            'Difference between previos POI-Score and current POI-Score',
                                            'Difference between current POI-Score and next POI-Score',
                                            'POI-Level allowed to loose without loosing preview bonus tier',
                                            'POI-Level needed to get next bonus tier',
                                            'POI-Score of subsequent alliance',
                                            'POI-Score of previous alliance',
                                            'Difference of own POI-Score and POI-Score of subsequent alliance',
                                            'Difference of own POI-Score and POI-Score of previous alliance',
                                            'POI-Level allowed to loose without loosing current ranking',
                                            'POI-Level needed to get the next better ranking',
                                            'own Bonus',
                                            'own Rank',
                                        ]
                                    ];
                                TextPoiClass.add(new qx.ui.basic.Label(ArrayAbbDesc[0][0]).set({rich: true, toolTipText: ArrayAbbDesc[1][0]}));
                                TextPoiClass.add(IconTib = new qx.ui.basic.Atom('Tiberium', 'webfrontend/ui/common/icn_res_tiberium.png').set({rich: true}));
                                IconTib.getChildControl('icon').set({ width: 18, height: 18, scale: true, alignY: "middle" });
                                TextPoiClass.add(IconCry = new qx.ui.basic.Atom('Crystal', 'webfrontend/ui/common/icn_res_chrystal.png').set({rich: true}));
                                IconCry.getChildControl('icon').set({ width: 18, height: 18, scale: true, alignY: "middle" });
                                TextPoiClass.add(IconPow = new qx.ui.basic.Atom('Power', 'webfrontend/ui/common/icn_res_power.png').set({rich: true}));
                                IconPow.getChildControl('icon').set({ width: 18, height: 18, scale: true, alignY: "middle" });
                                TextPoiClass.add(IconInf = new qx.ui.basic.Atom('Infantry', 'FactionUI/icons/icon_arsnl_off_squad.png').set({rich: true}));
                                IconInf.getChildControl('icon').set({ width: 18, height: 18, scale: true, alignY: "middle" });
                                TextPoiClass.add(IconVeh = new qx.ui.basic.Atom('Vehicle', 'FactionUI/icons/icon_arsnl_off_vehicle.png').set({rich: true}));
                                IconVeh.getChildControl('icon').set({ width: 18, height: 18, scale: true, alignY: "middle" });
                                TextPoiClass.add(IconAir = new qx.ui.basic.Atom('Aircraft', 'FactionUI/icons/icon_arsnl_off_plane.png').set({rich: true}));
                                IconAir.getChildControl('icon').set({ width: 18, height: 18, scale: true, alignY: "middle" });
                                TextPoiClass.add(IconDef = new qx.ui.basic.Atom('Defense', 'FactionUI/icons/icon_def_army_points.png').set({rich: true}));
                                IconDef.getChildControl('icon').set({ width: 18, height: 18, scale: true, alignY: "middle" });
                                TableBonus.add(TextPoiClass);
                                var TextScore = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextScore.add(new qx.ui.basic.Label(ArrayAbbDesc[0][1]).set({rich: true, height: 17, toolTipText: ArrayAbbDesc[1][1]}));
                                var TextPrevScore = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextPrevScore.add(new qx.ui.basic.Label(ArrayAbbDesc[0][2]).set({rich: true, height: 17, toolTipText: ArrayAbbDesc[1][2]}));
                                var TextNextScore = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextNextScore.add(new qx.ui.basic.Label(ArrayAbbDesc[0][3]).set({rich: true, height: 17, toolTipText: ArrayAbbDesc[1][3]}));
                                var TextDiffPrev = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextDiffPrev.add(new qx.ui.basic.Label(ArrayAbbDesc[0][4]).set({rich: true, height: 17, toolTipText: ArrayAbbDesc[1][4]}));
                                var TextDiffNext = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextDiffNext.add(new qx.ui.basic.Label(ArrayAbbDesc[0][5]).set({rich: true, height: 17, toolTipText: ArrayAbbDesc[1][5]}));
                                var TextPoiLevelDiffPrev = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextPoiLevelDiffPrev.add(new qx.ui.basic.Label(ArrayAbbDesc[0][6]).set({rich: true, height: 17, toolTipText: ArrayAbbDesc[1][6]}));
                                var TextPoiLevelDiffNext = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextPoiLevelDiffNext.add(new qx.ui.basic.Label(ArrayAbbDesc[0][7]).set({rich: true, height: 17, toolTipText: ArrayAbbDesc[1][7]}));
                                var TextSubsequentAlliance = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextSubsequentAlliance.add(new qx.ui.basic.Label(ArrayAbbDesc[0][8]).set({rich: true, height: 17, toolTipText: ArrayAbbDesc[1][8]}));
                                var TextPreviousAlliance = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextPreviousAlliance.add(new qx.ui.basic.Label(ArrayAbbDesc[0][9]).set({rich: true, height: 17, toolTipText: ArrayAbbDesc[1][9]}));
                                var TextDiffSubsequentAlliance = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextDiffSubsequentAlliance.add(new qx.ui.basic.Label(ArrayAbbDesc[0][10]).set({rich: true, height: 17, toolTipText: ArrayAbbDesc[1][10]}));
                                var TextDiffPreviousAlliance = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextDiffPreviousAlliance.add(new qx.ui.basic.Label(ArrayAbbDesc[0][11]).set({rich: true, height: 17, toolTipText: ArrayAbbDesc[1][11]}));
                                var TextPoiLevelDiffSubsequentAlliance = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextPoiLevelDiffSubsequentAlliance.add(new qx.ui.basic.Label(ArrayAbbDesc[0][12]).set({rich: true, height: 17, toolTipText: ArrayAbbDesc[1][12]}));
                                var TextPoiLevelDiffPreviousAlliance = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextPoiLevelDiffPreviousAlliance.add(new qx.ui.basic.Label(ArrayAbbDesc[0][13]).set({rich: true, height: 17, toolTipText: ArrayAbbDesc[1][13]}));
                                var TextBonus = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextBonus.add(new qx.ui.basic.Label(ArrayAbbDesc[0][14]).set({rich: true, height: 17, toolTipText: ArrayAbbDesc[1][14]}));
                                var TextRank = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                TextRank.add(new qx.ui.basic.Label(ArrayAbbDesc[0][15]).set({rich: true, height: 17, toolTipText: ArrayAbbDesc[1][15]}));
                                var maxPoiLevel = ClientLib.Data.MainData.GetInstance().get_Server().get_MaxCenterLevel();
                                var ArrayPOILevelPoints = [];
                                for (var i = 12; i <= maxPoiLevel; i++)
                                {
                                    ArrayPOILevelPoints.push(ClientLib.Base.PointOfInterestTypes.GetScoreByLevel(i));
                                }
                                for (var i = 0; i < poiRankScore.length; i++)
                                {
                                    TextScore.add(new qx.ui.basic.Label(poiRankScore[i].s.toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                    var indexArrayScorePoints = 1;
                                    while (poiRankScore[i].s > ArrayScorePoints[indexArrayScorePoints])
                                    {
                                        indexArrayScorePoints++;
                                    }
                                    var indexArrayPOILevelPointsPrev = 0;
                                    while ((poiRankScore[i].s - ArrayScorePoints[indexArrayScorePoints - 1]) > ArrayPOILevelPoints[indexArrayPOILevelPointsPrev])
                                    {
                                        indexArrayPOILevelPointsPrev++;
                                    }
                                    indexArrayPOILevelPointsPrev--;
                                    var indexArrayPOILevelPointsNext = 0;
                                    while ((ArrayScorePoints[indexArrayScorePoints] - poiRankScore[i].s) > ArrayPOILevelPoints[indexArrayPOILevelPointsNext])
                                    {
                                        indexArrayPOILevelPointsNext++;
                                    }
                                    var indexArrayPOILevelPointsPrevRanking = 0;
                                    while ((poiRankScore[i].s - poiRankScore[i].ps) > ArrayPOILevelPoints[indexArrayPOILevelPointsPrevRanking])
                                    {
                                        indexArrayPOILevelPointsPrevRanking++;
                                    }
                                    indexArrayPOILevelPointsPrevRanking--;
                                    var indexArrayPOILevelPointsNextRanking = 0;
                                    while ((poiRankScore[i].ns - poiRankScore[i].s) > ArrayPOILevelPoints[indexArrayPOILevelPointsNextRanking])
                                    {
                                        indexArrayPOILevelPointsNextRanking++;
                                    }
                                    TextPrevScore.add(new qx.ui.basic.Label(ArrayScorePoints[indexArrayScorePoints - 1].toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                    TextNextScore.add(new qx.ui.basic.Label(ArrayScorePoints[indexArrayScorePoints].toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                    TextDiffPrev.add(new qx.ui.basic.Label((poiRankScore[i].s - ArrayScorePoints[indexArrayScorePoints - 1]).toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                    TextDiffNext.add(new qx.ui.basic.Label((ArrayScorePoints[indexArrayScorePoints] - poiRankScore[i].s).toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                    if (indexArrayPOILevelPointsPrev + 12 < maxPoiLevel && indexArrayPOILevelPointsPrev >= 12)
                                    {
                                        TextPoiLevelDiffPrev.add(new qx.ui.basic.Label((indexArrayPOILevelPointsPrev + 12).toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                    }
                                    else
                                    {
                                        TextPoiLevelDiffPrev.add(new qx.ui.basic.Label('n.a.').set({rich: true, alignX: 'right', height: 18}));
                                    }
                                    if (indexArrayPOILevelPointsNext + 12 < maxPoiLevel)
                                    {
                                        TextPoiLevelDiffNext.add(new qx.ui.basic.Label((indexArrayPOILevelPointsNext + 12).toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                    }
                                    else
                                    {
                                        TextPoiLevelDiffNext.add(new qx.ui.basic.Label('n.a.').set({rich: true, alignX: 'right', height: 18}));
                                    }
                                    TextSubsequentAlliance.add(new qx.ui.basic.Label(poiRankScore[i].ps.toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                    TextDiffSubsequentAlliance.add(new qx.ui.basic.Label((poiRankScore[i].s - poiRankScore[i].ps).toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                    if (indexArrayPOILevelPointsPrevRanking + 12 < maxPoiLevel && indexArrayPOILevelPointsPrevRanking  + 12 >= 12)
                                    {
                                        TextPoiLevelDiffSubsequentAlliance.add(new qx.ui.basic.Label((indexArrayPOILevelPointsPrevRanking + 12).toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                    }
                                    else if (indexArrayPOILevelPointsPrevRanking + 12 < maxPoiLevel && indexArrayPOILevelPointsPrevRanking + 12 >= 11)
                                    {
                                        TextPoiLevelDiffSubsequentAlliance.add(new qx.ui.basic.Label('n.a.').set({rich: true, alignX: 'right', height: 18}));
                                    }
                                    else
                                    {
                                        TextPoiLevelDiffSubsequentAlliance.add(new qx.ui.basic.Label(maxPoiLevel.toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                    }
                                    if (poiRankScore[i].r > 1)
                                    {
                                        TextPreviousAlliance.add(new qx.ui.basic.Label(poiRankScore[i].ns.toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                        TextDiffPreviousAlliance.add(new qx.ui.basic.Label((poiRankScore[i].ns - poiRankScore[i].s).toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                        if (indexArrayPOILevelPointsNextRanking + 12 < maxPoiLevel)
                                        {
                                            TextPoiLevelDiffPreviousAlliance.add(new qx.ui.basic.Label((indexArrayPOILevelPointsNextRanking + 12).toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                        }
                                        else
                                        {
                                            TextPoiLevelDiffPreviousAlliance.add(new qx.ui.basic.Label('n.a.').set({rich: true, alignX: 'right', height: 18}));
                                        }
                                    }
                                    else
                                    {
                                        TextPreviousAlliance.add(new qx.ui.basic.Label('n.a.').set({rich: true, alignX: 'right', height: 18}));
                                        TextDiffPreviousAlliance.add(new qx.ui.basic.Label('n.a.').set({rich: true, alignX: 'right', height: 18}));
                                        TextPoiLevelDiffPreviousAlliance.add(new qx.ui.basic.Label('n.a.').set({rich: true, alignX: 'right', height: 18}));
                                    }
                                    TextRank.add(new qx.ui.basic.Label(poiRankScore[i].r).set({rich: true, alignX: 'right', height: 18}));
                                }
                                TextBonus.add(new qx.ui.basic.Label(ClientLib.Data.MainData.GetInstance().get_Alliance().get_POITiberiumBonus().toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                TextBonus.add(new qx.ui.basic.Label(ClientLib.Data.MainData.GetInstance().get_Alliance().get_POICrystalBonus().toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                TextBonus.add(new qx.ui.basic.Label(ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIPowerBonus().toLocaleString()).set({rich: true, alignX: 'right', height: 18}));
                                TextBonus.add(new qx.ui.basic.Label(ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIInfantryBonus().toLocaleString() + ' %').set({rich: true, alignX: 'right', height: 18}));
                                TextBonus.add(new qx.ui.basic.Label(ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIVehicleBonus().toLocaleString() + ' %').set({rich: true, alignX: 'right', height: 18}));
                                TextBonus.add(new qx.ui.basic.Label(ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIAirBonus().toLocaleString() + ' %').set({rich: true, alignX: 'right', height: 18}));
                                TextBonus.add(new qx.ui.basic.Label(ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIDefenseBonus().toLocaleString() + ' %').set({rich: true, alignX: 'right', height: 18}));
                                TableBonus.add(TextScore);
                                TableBonus.add(TextPrevScore);
                                TableBonus.add(TextNextScore);
                                TableBonus.add(TextDiffPrev);
                                TableBonus.add(TextDiffNext);
                                TableBonus.add(TextPoiLevelDiffPrev);
                                TableBonus.add(TextPoiLevelDiffNext);
                                TableBonus.add(TextSubsequentAlliance);
                                TableBonus.add(TextPreviousAlliance);
                                TableBonus.add(TextDiffSubsequentAlliance);
                                TableBonus.add(TextDiffPreviousAlliance);
                                TableBonus.add(TextPoiLevelDiffSubsequentAlliance);
                                TableBonus.add(TextPoiLevelDiffPreviousAlliance);
                                TableBonus.add(TextBonus);
                                TableBonus.add(TextRank);
                                HeadLineAlliance.add(TableBonus);
                                HeadLineAlliance.add(new qx.ui.basic.Label('').set({rich: true}));
                                HeadLineAlliance.add(new qx.ui.basic.Label('<big><u><b>Description</b></u></big>').set({rich: true}));
                                HeadLineAlliance.add(new qx.ui.basic.Label('').set({rich: true}));
                                var HeadLineDescriptionScroll = new qx.ui.container.Scroll().set({height: 180});
                                if (this.ObjectData.server.SeasonServer)
                                {
                                    HeadLineDescriptionScroll = new qx.ui.container.Scroll().set({height: 146});
                                }
                                var TableDescription = new qx.ui.container.Composite(new qx.ui.layout.HBox(10).set({alignX: "center"}));
                                var TextAbbreviation = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                var TextDescription = new qx.ui.container.Composite(new qx.ui.layout.VBox(1).set({alignX: "center"}));
                                for (var i = 0; i < ArrayAbbDesc[0].length; i++)
                                {
                                    TextAbbreviation.add(new qx.ui.basic.Label(ArrayAbbDesc[0][i]).set({rich: true, alignX: 'right'}));
                                    TextDescription.add(new qx.ui.basic.Label(ArrayAbbDesc[1][i]).set({rich: true, alignX: 'left'}));
                                }
                                TableDescription.add(TextAbbreviation);
                                TableDescription.add(TextDescription);
                                HeadLineDescriptionScroll.add(TableDescription);
                                HeadLineAlliance.add(HeadLineDescriptionScroll);
                            }
                            else
                            {
                                HeadLineAlliance.add(new qx.ui.basic.Label('You are in no alliance...').set({rich: true}));
                            }
                            HeaderTableAlliance.add(HeadLineAlliance);
                            this.GuiAllianceVBox.removeAll();
                            this.GuiAllianceVBox.add(HeaderTableAlliance);
                        },
                        calculateValueOfBase: function(_BaseId)
                        {
                            var valueTiberium = 0;
                            var valuePower = 0;
                            var ArrayBuildingIds = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_BaseId].get_Buildings().d;
                            for (var key in ArrayBuildingIds)
                            {
                                if (ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_BaseId].get_Buildings().d[key].get_TechGameData_Obj().dn != 'Construction Yard')
                                {
                                    var ArrayRes = this.calculateValueOfBuilding(_BaseId, key);
                                    valueTiberium += ArrayRes[0];
                                    valuePower += ArrayRes[1];
                                }
                            }
                            return [valueTiberium, valuePower];
                        },
                        calculateValueOfBuilding: function(_BaseId, _BuildingId)
                        {
                            var minLevelBuilding = ClientLib.Data.MainData.GetInstance().get_Server().get_CityMinLevelBuilding();
                            var upgradeFactor = ClientLib.Data.MainData.GetInstance().get_Server().get_TechLevelUpgradeFactorResource();
                            var levelBuilding = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_BaseId].get_Buildings().d[_BuildingId].get_CurrentLevel();
                            var valueTiberium = 0;
                            var valuePower = 0;
                            for (var i = 1; i <= levelBuilding; i++)
                            {
                                if (ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_BaseId].get_Buildings().d[_BuildingId].get_TechGameData_Obj().r[i].rr[0] != undefined)
                                {
                                    valueTiberium += ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_BaseId].get_Buildings().d[_BuildingId].get_TechGameData_Obj().r[i].rr[0].c;
                                }
                                if (ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_BaseId].get_Buildings().d[_BuildingId].get_TechGameData_Obj().r[i].rr[1] != undefined)
                                {
                                    valuePower += ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_BaseId].get_Buildings().d[_BuildingId].get_TechGameData_Obj().r[i].rr[1].c;
                                }
                                if (i == 12)
                                {
                                    break;
                                }
                            }
                            for (var i = 13; i <= levelBuilding; i++)
                            {
                                valueTiberium += parseInt(ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_BaseId].get_Buildings().d[_BuildingId].get_TechGameData_Obj().r[12].rr[0].c * Math.pow(upgradeFactor, i - 12));
                                valuePower += parseInt(ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_BaseId].get_Buildings().d[_BuildingId].get_TechGameData_Obj().r[12].rr[1].c * Math.pow(upgradeFactor, i - 12));
                            }
                            if (minLevelBuilding > 0)
                            {
                                for (var i = 1; i <= minLevelBuilding; i++)
                                {
                                    if (ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_BaseId].get_Buildings().d[_BuildingId].get_TechGameData_Obj().r[i].rr[0] != undefined)
                                    {
                                        valueTiberium -= ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_BaseId].get_Buildings().d[_BuildingId].get_TechGameData_Obj().r[i].rr[0].c;
                                    }
                                    if (ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_BaseId].get_Buildings().d[_BuildingId].get_TechGameData_Obj().r[i].rr[1] != undefined)
                                    {
                                        valuePower -= ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_BaseId].get_Buildings().d[_BuildingId].get_TechGameData_Obj().r[i].rr[1].c;
                                    }
                                    if (i == 12)
                                    {
                                        break;
                                    }
                                }
                                for (var i = 13; i <= minLevelBuilding; i++)
                                {
                                    valueTiberium -= parseInt(ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_BaseId].get_Buildings().d[_BuildingId].get_TechGameData_Obj().r[12].rr[0].c * Math.pow(upgradeFactor, i - 12));
                                    valuePower -= parseInt(ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_BaseId].get_Buildings().d[_BuildingId].get_TechGameData_Obj().r[12].rr[1].c * Math.pow(upgradeFactor, i - 12));
                                }
                            }
                            var refundFactor = ClientLib.Data.MainData.GetInstance().get_Server().get_BuildingRefundPercent();
                            return [parseInt(refundFactor * valueTiberium), parseInt(refundFactor * valuePower)];
                        },
                        calculateValueOfDefense: function(_BaseId)
                        {
                            var valueTiberium = 0;
                            var valueCrystal = 0;
                            var valuePower = 0;
                            var city = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(_BaseId);
                            var defUnits = this.getDefenseUnits(city);
                            for (var keyDefUnit in defUnits)
                            {
                                var defUnit = defUnits[keyDefUnit];
                                var levelDefUnit = defUnit.get_CurrentLevel();
                                for (var key in defUnit)
                                {
                                    if (typeof(defUnit[key]) == 'object' && defUnit[key] && 'i' in defUnit[key])
                                    {
                                        var ObjectUnit = defUnit[key];
                                        var ArrayRes = this.calculateValueUnitDefense(ObjectUnit, levelDefUnit);
                                        valueTiberium += ArrayRes[0];
                                        valueCrystal += ArrayRes[1];
                                        valuePower += ArrayRes[2];
                                    }
                                }
                            }
                            return [valueTiberium, valueCrystal, valuePower];
                        },
                        calculateValueOfOffense: function(_BaseId)
                        {
                            var valueCrystal = 0;
                            var valuePower = 0;
                            var city = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(_BaseId);
                            var offUnits = this.getOffenseUnits(city);
                            for (var keyOffUnit in offUnits)
                            {
                                var offUnit = offUnits[keyOffUnit];
                                var levelOffUnit = offUnit.get_CurrentLevel();
                                for (var key in offUnit)
                                {
                                    if (typeof(offUnit[key]) == 'object' && offUnit[key] && 'i' in offUnit[key])
                                    {
                                        var ObjectUnit = offUnit[key];
                                        var ArrayRes = this.calculateValueUnitOffense(ObjectUnit, levelOffUnit);
                                        valueCrystal += ArrayRes[0];
                                        valuePower += ArrayRes[1];
                                    }
                                }
                            }
                            return [valueCrystal, valuePower];
                        },
                        calculateValueUnitDefense: function(_ObjectUnit, _levelUnit)
                        {
                            var minLevelUnit = ClientLib.Data.MainData.GetInstance().get_Server().get_CityMinLevelDefense();
                            var upgradeFactor = ClientLib.Data.MainData.GetInstance().get_Server().get_UnitLevelUpgradeFactorResource();
                            var valueTiberium = 0;
                            var valueCrystal = 0;
                            var valuePower = 0;
                            for (var i = 1; i <= _levelUnit; i++)
                            {
                                if (_ObjectUnit.r[i].rr[0] != undefined)
                                {
                                    switch(_ObjectUnit.r[i].rr[0].t)
                                    {
                                        case 1:
                                        {
                                            valueTiberium += _ObjectUnit.r[i].rr[0].c;
                                            break;
                                        }
                                        case 2:
                                        {
                                            valueCrystal += _ObjectUnit.r[i].rr[0].c;
                                            break;
                                        }
                                        default:
                                        {
                                            break;
                                        }
                                    }
                                }
                                if (_ObjectUnit.r[i].rr[1] != undefined)
                                {
                                    valuePower += _ObjectUnit.r[i].rr[1].c;
                                }
                                if (i == 12)
                                {
                                    break;
                                }
                            }
                            for (var i = 13; i <= _levelUnit; i++)
                            {
                                if (valueTiberium)
                                {
                                    valueTiberium += parseInt(_ObjectUnit.r[12].rr[0].c * Math.pow(upgradeFactor, i - 12));
                                }
                                else if (valueCrystal)
                                {
                                    valueCrystal += parseInt(_ObjectUnit.r[12].rr[0].c * Math.pow(upgradeFactor, i - 12));
                                }
                                valuePower += parseInt(_ObjectUnit.r[12].rr[1].c * Math.pow(upgradeFactor, i - 12));
                            }
                            if (minLevelUnit > 0)
                            {
                                for (var i = 1; i <= minLevelUnit; i++)
                                {
                                    if (_ObjectUnit.r[i].rr[0] != undefined)
                                    {
                                        switch(_ObjectUnit.r[i].rr[0].t)
                                        {
                                            case 1:
                                            {
                                                valueTiberium += _ObjectUnit.r[i].rr[0].c;
                                                break;
                                            }
                                            case 2:
                                            {
                                                valueCrystal += _ObjectUnit.r[i].rr[0].c;
                                                break;
                                            }
                                            default:
                                            {
                                                break;
                                            }
                                        }
                                    }
                                    if (_ObjectUnit.r[i].rr[1] != undefined)
                                    {
                                        valuePower -= _ObjectUnit.r[i].rr[1].c;
                                    }
                                    if (i == 12)
                                    {
                                        break;
                                    }
                                }
                                for (var i = 13; i <= minLevelUnit; i++)
                                {
                                    if (valueTiberium)
                                    {
                                        valueTiberium -= parseInt(_ObjectUnit.r[12].rr[0].c * Math.pow(upgradeFactor, i - 12));
                                    }
                                    else if (valueCrystal)
                                    {
                                        valueCrystal -= parseInt(_ObjectUnit.r[12].rr[0].c * Math.pow(upgradeFactor, i - 12));
                                    }
                                    valuePower -= parseInt(_ObjectUnit.r[12].rr[1].c * Math.pow(upgradeFactor, i - 12));
                                }
                            }
                            var refundFactor = ClientLib.Data.MainData.GetInstance().get_Server().get_UnitRefundPercent();
                            return [parseInt(refundFactor * valueTiberium), parseInt(refundFactor * valueCrystal), parseInt(refundFactor * valuePower)];
                        },
                        calculateValueUnitOffense: function(_ObjectUnit, _levelUnit)
                        {
                            var minLevelUnit = ClientLib.Data.MainData.GetInstance().get_Server().get_CityMinLevelOffense();
                            var upgradeFactor = ClientLib.Data.MainData.GetInstance().get_Server().get_UnitLevelUpgradeFactorResource();
                            var valueCrystal = 0;
                            var valuePower = 0;
                            for (var i = 1; i <= _levelUnit; i++)
                            {
                                if (_ObjectUnit.r[i].rr[0] != undefined)
                                {
                                    valueCrystal += _ObjectUnit.r[i].rr[0].c;
                                }
                                if (_ObjectUnit.r[i].rr[1] != undefined)
                                {
                                    valuePower += _ObjectUnit.r[i].rr[1].c;
                                }
                                if (i == 12)
                                {
                                    break;
                                }
                            }
                            for (var i = 13; i <= _levelUnit; i++)
                            {
                                valueCrystal += parseInt(_ObjectUnit.r[12].rr[0].c * Math.pow(upgradeFactor, i - 12));
                                valuePower += parseInt(_ObjectUnit.r[12].rr[1].c * Math.pow(upgradeFactor, i - 12));
                            }
                            if (minLevelUnit > 0)
                            {
                                for (var i = 1; i <= minLevelUnit; i++)
                                {
                                    if (_ObjectUnit.r[i].rr[0] != undefined)
                                    {
                                        valueCrystal -= _ObjectUnit.r[i].rr[0].c;
                                    }
                                    if (_ObjectUnit.r[i].rr[1] != undefined)
                                    {
                                        valuePower -= _ObjectUnit.r[i].rr[1].c;
                                    }
                                    if (i == 12)
                                    {
                                        break;
                                    }
                                }
                                for (var i = 13; i <= minLevelUnit; i++)
                                {
                                    valueCrystal -= parseInt(_ObjectUnit.r[12].rr[0].c * Math.pow(upgradeFactor, i - 12));
                                    valuePower -= parseInt(_ObjectUnit.r[12].rr[1].c * Math.pow(upgradeFactor, i - 12));
                                }
                            }
                            var refundFactor = ClientLib.Data.MainData.GetInstance().get_Server().get_UnitRefundPercent();
                            return [parseInt(refundFactor * valueCrystal), parseInt(refundFactor * valuePower)];
                        },
                        setCncOptVars: function()
                        {
                            this.Defense_unit_map = {
                                /* GDI Defense Units */
                                "GDI_Wall": "w",
                                "GDI_Cannon": "c",
                                "GDI_Antitank Barrier": "t",
                                "GDI_Barbwire": "b",
                                "GDI_Turret": "m",
                                "GDI_Flak": "f",
                                "GDI_Art Inf": "r",
                                "GDI_Art Air": "e",
                                "GDI_Art Tank": "a",
                                "GDI_Def_APC Guardian": "g",
                                "GDI_Def_Missile Squad": "q",
                                "GDI_Def_Pitbull": "p",
                                "GDI_Def_Predator": "d",
                                "GDI_Def_Sniper": "s",
                                "GDI_Def_Zone Trooper": "z",

                                /* Nod Defense Units */
                                "NOD_Def_Antitank Barrier": "t",
                                "NOD_Def_Art Air": "e",
                                "NOD_Def_Art Inf": "r",
                                "NOD_Def_Art Tank": "a",
                                "NOD_Def_Attack Bike": "p",
                                "NOD_Def_Barbwire": "b",
                                "NOD_Def_Black Hand": "z",
                                "NOD_Def_Cannon": "c",
                                "NOD_Def_Confessor": "s",
                                "NOD_Def_Flak": "f",
                                "NOD_Def_MG Nest": "m",
                                "NOD_Def_Militant Rocket Soldiers": "q",
                                "NOD_Def_Reckoner": "g",
                                "NOD_Def_Scorpion Tank": "d",
                                "NOD_Def_Wall": "w",
                                "": ""
                            };
                            this.offense_unit_map = {
                                /* GDI Offense Units */
                                "GDI_APC Guardian": "g",
                                "GDI_Commando": "c",
                                "GDI_Firehawk": "f",
                                "GDI_Juggernaut": "j",
                                "GDI_Kodiak": "k",
                                "GDI_Mammoth": "m",
                                "GDI_Missile Squad": "q",
                                "GDI_Orca": "o",
                                "GDI_Paladin": "a",
                                "GDI_Pitbull": "p",
                                "GDI_Predator": "d",
                                "GDI_Riflemen": "r",
                                "GDI_Sniper Team": "s",
                                "GDI_Zone Trooper": "z",

                                /* Nod Offense Units */
                                "NOD_Attack Bike": "b",
                                "NOD_Avatar": "a",
                                "NOD_Black Hand": "z",
                                "NOD_Cobra": "r",
                                "NOD_Commando": "c",
                                "NOD_Confessor": "s",
                                "NOD_Militant Rocket Soldiers": "q",
                                "NOD_Militants": "m",
                                "NOD_Reckoner": "k",
                                "NOD_Salamander": "l",
                                "NOD_Scorpion Tank": "o",
                                "NOD_Specter Artilery": "p",
                                "NOD_Venom": "v",
                                "NOD_Vertigo": "t",
                                "": ""
                            };
                        },
                        findTechLayout: function(_city) {
                            for (var k in _city) {
                                //console.log(typeof(_city[k]), "1._city[", k, "]", _city[k])
                                if ((typeof (_city[k]) == "object") && _city[k] && 0 in _city[k] && 8 in _city[k]) {
                                    if ((typeof (_city[k][0]) == "object") && _city[k][0] && _city[k][0] && 0 in _city[k][0] && 15 in _city[k][0]) {
                                        if ((typeof (_city[k][0][0]) == "object") && _city[k][0][0] && "BuildingIndex" in _city[k][0][0]) {
                                            return _city[k];
                                        }
                                    }
                                }
                            }
                            return null;
                        },
                        findBuildings: function(_city) {
                            var cityBuildings = _city.get_CityBuildingsData();
                            for (var k in cityBuildings) {
                                if (PerforceChangelist >= 376877) {
                                    if ((typeof (cityBuildings[k]) === "object") && cityBuildings[k] && "d" in cityBuildings[k] && "c" in cityBuildings[k] && cityBuildings[k].c > 0) {
                                        return cityBuildings[k].d;
                                    }
                                } else {
                                    if ((typeof (cityBuildings[k]) === "object") && cityBuildings[k] && "l" in cityBuildings[k]) {
                                        return cityBuildings[k].l;
                                    }
                                }
                            }
                        },
                        isOffenseUnit: function(_unit) {
                            return (_unit.get_UnitGameData_Obj().n in this.offense_unit_map);
                        },
                        isDefenseUnit: function(_unit) {
                            return (_unit.get_UnitGameData_Obj().n in this.Defense_unit_map);
                        },
                        getUnitArrays: function(_city) {
                            var ret = [];
                            for (var k in _city) {
                                if ((typeof (_city[k]) == "object") && _city[k]) {
                                    for (var k2 in _city[k]) {
                                        if (PerforceChangelist >= 376877) {
                                            if ((typeof (_city[k][k2]) == "object") && _city[k][k2] && "d" in _city[k][k2]) {
                                                var lst = _city[k][k2].d;
                                                if ((typeof (lst) == "object") && lst) {
                                                    for (var i in lst) {
                                                        if (typeof (lst[i]) == "object" && lst[i] && "get_CurrentLevel" in lst[i]) {
                                                            ret.push(lst);
                                                        }
                                                    }
                                                }
                                            }
                                        } else {
                                            if ((typeof (_city[k][k2]) == "object") && _city[k][k2] && "l" in _city[k][k2]) {
                                                var lst = _city[k][k2].l;
                                                if ((typeof (lst) == "object") && lst) {
                                                    for (var i in lst) {
                                                        if (typeof (lst[i]) == "object" && lst[i] && "get_CurrentLevel" in lst[i]) {
                                                            ret.push(lst);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                            return ret;
                        },
                        getDefenseUnits: function(_city) {
                            var arr = this.getUnitArrays(_city);
                            for (var i = 0; i < arr.length; ++i) {
                                for (var j in arr[i]) {
                                    if (this.isDefenseUnit(arr[i][j])) {
                                        return arr[i];
                                    }
                                }
                            }
                            return [];
                        },
                        getOffenseUnits: function(_city) {
                            var arr = this.getUnitArrays(_city);
                            for (var i = 0; i < arr.length; ++i) {
                                for (var j in arr[i]) {
                                    if (this.isOffenseUnit(arr[i][j])) {
                                        return arr[i];
                                    }
                                }
                            }
                            return [];
                        },
                        CnCOpt: function(_baseId, _baseName, _faction)
                        {
                            var _self = this;
                            var cncopt = {
                                keymap: {
                                    /* GDI Buildings */
                                    "GDI_Accumulator": "a",
                                    "GDI_Refinery": "r",
                                    "GDI_Trade Center": "u",
                                    "GDI_Silo": "s",
                                    "GDI_Power Plant": "p",
                                    "GDI_Construction Yard": "y",
                                    "GDI_Airport": "d",
                                    "GDI_Barracks": "b",
                                    "GDI_Factory": "f",
                                    "GDI_Defense HQ": "q",
                                    "GDI_Defense Facility": "w",
                                    "GDI_Command Center": "e",
                                    "GDI_Support_Art": "z",
                                    "GDI_Support_Air": "x",
                                    "GDI_Support_Ion": "i",

                                    /* Forgotten Buildings */
                                    "FOR_Silo": "s",
                                    "FOR_Refinery": "r",
                                    "FOR_Tiberium Booster": "b",
                                    "FOR_Crystal Booster": "v",
                                    "FOR_Trade Center": "u",
                                    "FOR_Defense Facility": "w",
                                    "FOR_Construction Yard": "y",
                                    "FOR_EVENT_Construction Yard": "y",
                                    "FOR_Harvester_Tiberium": "h",
                                    "FOR_Defense HQ": "q",
                                    "FOR_Harvester_Crystal": "n",

                                    /* Nod Buildings */
                                    "NOD_Refinery": "r",
                                    "NOD_Power Plant": "p",
                                    "NOD_Harvester": "h",
                                    "NOD_Construction Yard": "y",
                                    "NOD_Airport": "d",
                                    "NOD_Trade Center": "u",
                                    "NOD_Defense HQ": "q",
                                    "NOD_Barracks": "b",
                                    "NOD_Silo": "s",
                                    "NOD_Factory": "f",
                                    "NOD_Harvester_Crystal": "n",
                                    "NOD_Command Post": "e",
                                    "NOD_Support_Art": "z",
                                    "NOD_Support_Ion": "i",
                                    "NOD_Accumulator": "a",
                                    "NOD_Support_Air": "x",
                                    "NOD_Defense Facility": "w",
                                    //"NOD_Tech Lab": "",
                                    //"NOD_Recruitment Hub": "X",
                                    //"NOD_Temple of Nod": "X",

                                    /* GDI Defense Units */
                                    "GDI_Wall": "w",
                                    "GDI_Cannon": "c",
                                    "GDI_Antitank Barrier": "t",
                                    "GDI_Barbwire": "b",
                                    "GDI_Turret": "m",
                                    "GDI_Flak": "f",
                                    "GDI_Art Inf": "r",
                                    "GDI_Art Air": "e",
                                    "GDI_Art Tank": "a",
                                    "GDI_Def_APC Guardian": "g",
                                    "GDI_Def_Missile Squad": "q",
                                    "GDI_Def_Pitbull": "p",
                                    "GDI_Def_Predator": "d",
                                    "GDI_Def_Sniper": "s",
                                    "GDI_Def_Zone Trooper": "z",

                                    /* Nod Defense Units */
                                    "NOD_Def_Antitank Barrier": "t",
                                    "NOD_Def_Art Air": "e",
                                    "NOD_Def_Art Inf": "r",
                                    "NOD_Def_Art Tank": "a",
                                    "NOD_Def_Attack Bike": "p",
                                    "NOD_Def_Barbwire": "b",
                                    "NOD_Def_Black Hand": "z",
                                    "NOD_Def_Cannon": "c",
                                    "NOD_Def_Confessor": "s",
                                    "NOD_Def_Flak": "f",
                                    "NOD_Def_MG Nest": "m",
                                    "NOD_Def_Militant Rocket Soldiers": "q",
                                    "NOD_Def_Reckoner": "g",
                                    "NOD_Def_Scorpion Tank": "d",
                                    "NOD_Def_Wall": "w",

                                    /* GDI Offense Units */
                                    "GDI_APC Guardian": "g",
                                    "GDI_Commando": "c",
                                    "GDI_Firehawk": "f",
                                    "GDI_Juggernaut": "j",
                                    "GDI_Kodiak": "k",
                                    "GDI_Mammoth": "m",
                                    "GDI_Missile Squad": "q",
                                    "GDI_Orca": "o",
                                    "GDI_Paladin": "a",
                                    "GDI_Pitbull": "p",
                                    "GDI_Predator": "d",
                                    "GDI_Riflemen": "r",
                                    "GDI_Sniper Team": "s",
                                    "GDI_Zone Trooper": "z",

                                    /* Nod Offense Units */
                                    "NOD_Attack Bike": "b",
                                    "NOD_Avatar": "a",
                                    "NOD_Black Hand": "z",
                                    "NOD_Cobra": "r",
                                    "NOD_Commando": "c",
                                    "NOD_Confessor": "s",
                                    "NOD_Militant Rocket Soldiers": "q",
                                    "NOD_Militants": "m",
                                    "NOD_Reckoner": "k",
                                    "NOD_Salamander": "l",
                                    "NOD_Scorpion Tank": "o",
                                    "NOD_Specter Artilery": "p",
                                    "NOD_Venom": "v",
                                    "NOD_Vertigo": "t",

                                    "<last>": "."
                                },
                                make_sharelink: function (_baseId, _baseName, _faction) {
                                    try {
                                        var city = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(_baseId);
                                        var own_city = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity();
                                        var alliance = ClientLib.Data.MainData.GetInstance().get_Alliance();
                                        var server = ClientLib.Data.MainData.GetInstance().get_Server();
                                        // var tbase = base;
                                        // var tcity = city;
                                        // var scity = own_city;
                                        var link = "http://cncopt.com/?map=3|";
                                        switch(_faction)
                                        {
                                            case 1:
                                                /* GDI */
                                                link += "G|G|";
                                                break;
                                            case 2:
                                                /* NOD */
                                                link += "N|N|";
                                                break;
                                        }
                                        link += _baseName + "|";
                                        var Defense_units = [];
                                        for (var i = 0; i < 20; ++i) {
                                            var col = [];
                                            for (var j = 0; j < 9; ++j) {
                                                col.push(null);
                                            }
                                            Defense_units.push(col);
                                        }
                                        var Defense_unit_list = _self.getDefenseUnits(city);
                                        if (PerforceChangelist >= 376877) {
                                            for (var i in Defense_unit_list) {
                                                var unit = Defense_unit_list[i];
                                                Defense_units[unit.get_CoordX()][unit.get_CoordY() + 8] = unit;
                                            }
                                        } else {
                                            for (var i = 0; i < Defense_unit_list.length; ++i) {
                                                var unit = Defense_unit_list[i];
                                                Defense_units[unit.get_CoordX()][unit.get_CoordY() + 8] = unit;
                                            }
                                        }

                                        var offense_units = [];
                                        for (var i = 0; i < 20; ++i) {
                                            var col = [];
                                            for (var j = 0; j < 9; ++j) {
                                                col.push(null);
                                            }
                                            offense_units.push(col);
                                        }

                                        if (city.get_CityFaction() == 1 || city.get_CityFaction() == 2) {
                                            var offense_unit_list = _self.getOffenseUnits(city);
                                        }
                                        else {
                                            var offense_unit_list = _self.getOffenseUnits(own_city);
                                        }
                                        if (PerforceChangelist >= 376877) {
                                            for (var i in offense_unit_list) {
                                                var unit = offense_unit_list[i];
                                                offense_units[unit.get_CoordX()][unit.get_CoordY() + 16] = unit;
                                            }
                                        } else {
                                            for (var i = 0; i < offense_unit_list.length; ++i) {
                                                var unit = offense_unit_list[i];
                                                offense_units[unit.get_CoordX()][unit.get_CoordY() + 16] = unit;
                                            }
                                        }

                                        var techLayout = _self.findTechLayout(city);
                                        var buildings = _self.findBuildings(city);
                                        for (var i = 0; i < 20; ++i) {
                                            // row = [];
                                            for (var j = 0; j < 9; ++j) {
                                                var spot = i > 16 ? null : techLayout[j][i];
                                                var level = 0;
                                                var building = null;
                                                if (spot && spot.BuildingIndex >= 0) {
                                                    building = buildings[spot.BuildingIndex];
                                                    level = building.get_CurrentLevel();
                                                }
                                                var Defense_unit = Defense_units[j][i];
                                                if (Defense_unit) {
                                                    level = Defense_unit.get_CurrentLevel();
                                                }
                                                var offense_unit = offense_units[j][i];
                                                if (offense_unit) {
                                                    level = offense_unit.get_CurrentLevel();
                                                }
                                                if (level > 1) {
                                                    link += level;
                                                }

                                                switch (i > 16 ? 0 : city.GetResourceType(j, i)) {
                                                    case 0:
                                                        if (building) {
                                                            var techId = building.get_MdbBuildingId();
                                                            if (GAMEDATA.Tech[techId].n in cncopt.keymap) {
                                                                link += cncopt.keymap[GAMEDATA.Tech[techId].n];
                                                            } else {
                                                                console.log("cncopt [5]: Unhandled building: " + techId, building);
                                                                link += ".";
                                                            }
                                                        } else if (Defense_unit) {
                                                            if (Defense_unit.get_UnitGameData_Obj().n in cncopt.keymap) {
                                                                link += cncopt.keymap[Defense_unit.get_UnitGameData_Obj().n];
                                                            } else {
                                                                console.log("cncopt [5]: Unhandled unit: " + Defense_unit.get_UnitGameData_Obj().n);
                                                                link += ".";
                                                            }
                                                        } else if (offense_unit) {
                                                            if (offense_unit.get_UnitGameData_Obj().n in cncopt.keymap) {
                                                                link += cncopt.keymap[offense_unit.get_UnitGameData_Obj().n];
                                                            } else {
                                                                console.log("cncopt [5]: Unhandled unit: " + offense_unit.get_UnitGameData_Obj().n);
                                                                link += ".";
                                                            }
                                                        } else {
                                                            link += ".";
                                                        }
                                                        break;
                                                    case 1:
                                                        /* Crystal */
                                                        if (spot.BuildingIndex < 0) link += "c";
                                                        else link += "n";
                                                        break;
                                                    case 2:
                                                        /* Tiberium */
                                                        if (spot.BuildingIndex < 0) link += "t";
                                                        else link += "h";
                                                        break;
                                                    case 4:
                                                        /* Woods */
                                                        link += "j";
                                                        break;
                                                    case 5:
                                                        /* Scrub */
                                                        link += "h";
                                                        break;
                                                    case 6:
                                                        /* Oil */
                                                        link += "l";
                                                        break;
                                                    case 7:
                                                        /* Swamp */
                                                        link += "k";
                                                        break;
                                                    default:
                                                        console.log("cncopt [4]: Unhandled resource type: " + city.GetResourceType(j, i));
                                                        link += ".";
                                                        break;
                                                }
                                            }
                                        }
                                        /* Tack on our alliance bonuses */
                                        if (alliance && own_city.get_AllianceId() == city.get_AllianceId()) {
                                            link += "|" + alliance.get_POITiberiumBonus();
                                            link += "|" + alliance.get_POICrystalBonus();
                                            link += "|" + alliance.get_POIPowerBonus();
                                            link += "|" + alliance.get_POIInfantryBonus();
                                            link += "|" + alliance.get_POIVehicleBonus();
                                            link += "|" + alliance.get_POIAirBonus();
                                            link += "|" + alliance.get_POIDefenseBonus();
                                        }
                                        if (server.get_TechLevelUpgradeFactorBonusAmount() != 1.20) {
                                            link += "|newEconomy";
                                        }
                                        _self.linkBase = link;
                                    } catch (e) {
                                        console.log("cncopt [1]: ", e);
                                    }
                                }
                            };
                            cncopt.make_sharelink(_baseId, _baseName, _faction);
                        },
                        getCurrentStats: function()
                        {
                            try
                            {
                                var PlayerId = ClientLib.Data.MainData.GetInstance().get_Player().get_Id();
                                if (PlayerId > 0)
                                {
                                    this.ObjectData.server = {};
                                    this.ObjectData.alliance = {};
                                    this.ObjectData.player = {};
                                    this.ObjectData.bases = [];
                                    this.ObjectData.substitution = {};
                                    this.ObjectData.substitution.incoming = [];
                                    this.ObjectData.substitution.outgoing = '';
                                    this.ObjectData.substitution.active = [];
                                    var WorldId = ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId();
                                    var ServerName = ClientLib.Data.MainData.GetInstance().get_Server().get_Name().trim();
                                    var SeasonServer = ClientLib.Data.MainData.GetInstance().get_Server().get_IsSeasonServer();
                                    // Alliance
                                    var AllianceId = ClientLib.Data.MainData.GetInstance().get_Alliance().get_Id();
                                    if (AllianceId > 0)
                                    {
                                        var AllianceName = ClientLib.Data.MainData.GetInstance().get_Alliance().get_Name();
                                        var AllianceRank = ClientLib.Data.MainData.GetInstance().get_Alliance().get_Rank();
                                        var AllianceEventRank = ClientLib.Data.MainData.GetInstance().get_Alliance().get_EventRank();
                                        var AllianceTotalScore = ClientLib.Data.MainData.GetInstance().get_Alliance().get_TotalScore();
                                        var AllianceAverageScore = ClientLib.Data.MainData.GetInstance().get_Alliance().get_AverageScore();
                                        var AllianceVeteranPoints = ClientLib.Data.MainData.GetInstance().get_Alliance().get_EventScore();
                                        var AllianceProdVetPoints = 0;
                                        try
                                        {
                                            for (i = 0; i < ClientLib.Data.MainData.GetInstance().get_Alliance().get_OwnShieldHubs().length; i++)
                                            {
                                                AllianceProdVetPoints += ClientLib.Data.MainData.GetInstance().get_Server().GetControlHubVeteranPointsProduction(ClientLib.Data.MainData.GetInstance().get_Alliance().get_OwnShieldHubs()[i].l);
                                            }
                                        }
                                        catch(e){}
                                        // Bonus
                                        var BonusTiberium = ClientLib.Data.MainData.GetInstance().get_Alliance().get_POITiberiumBonus();
                                        var BonusCrystal = ClientLib.Data.MainData.GetInstance().get_Alliance().get_POICrystalBonus();
                                        var BonusPower = ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIPowerBonus();
                                        var BonusInfantrie = ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIInfantryBonus();
                                        var BonusVehicle = ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIVehicleBonus();
                                        var BonusAir = ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIAirBonus();
                                        var BonusDef = ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIDefenseBonus();
                                        var Ranks = ClientLib.Data.MainData.GetInstance().get_Alliance().get_POIRankScore();
                                        var RankTib = Ranks[0].r;
                                        var RankCry = Ranks[1].r;
                                        var RankPow = Ranks[2].r;
                                        var RankInf = Ranks[3].r;
                                        var RankVeh = Ranks[4].r;
                                        var RankAir = Ranks[5].r;
                                        var RankDef = Ranks[6].r;
                                        var ScoreTib = Ranks[0].s;
                                        var ScoreCry = Ranks[1].s;
                                        var ScorePow = Ranks[2].s;
                                        var ScoreInf = Ranks[3].s;
                                        var ScoreVeh = Ranks[4].s;
                                        var ScoreAir = Ranks[5].s;
                                        var ScoreDef = Ranks[6].s;
                                    }
                                    // Player
                                    var AccountId = ClientLib.Data.MainData.GetInstance().get_Player().get_AccountId();
                                    var PlayerName = ClientLib.Data.MainData.GetInstance().get_Player().get_Name();
                                    var PlayerScorePoints = ClientLib.Data.MainData.GetInstance().get_Player().get_ScorePoints();
                                    var PlayerRank = ClientLib.Data.MainData.GetInstance().get_Player().get_OverallRank();
                                    var PlayerEventRank = ClientLib.Data.MainData.GetInstance().get_Player().get_EventRank();
                                    var PlayerVeteranPoints = ClientLib.Data.MainData.GetInstance().get_Player().get_EventScore();
                                    var ResearchPoints = ClientLib.Data.MainData.GetInstance().get_Player().get_ResearchPoints();
                                    var Credits = ClientLib.Data.MainData.GetInstance().get_Player().get_Credits().Base;
                                    var Funds = ClientLib.Data.MainData.GetInstance().get_Inventory().get_PlayerFunds();
                                    var LegacyPoints = ClientLib.Data.MainData.GetInstance().get_Player().get_LegacyPoints();
                                    var CommandPointsMaxStorage = ClientLib.Data.MainData.GetInstance().get_Player().GetCommandPointMaxStorage();
                                    var CommandPointsCurrent = ClientLib.Data.MainData.GetInstance().get_Player().GetCommandPointCount();
                                    var Faction = ClientLib.Data.MainData.GetInstance().get_Player().get_Faction();
                                    var MemberRole = ClientLib.Data.MainData.GetInstance().get_Alliance().get_CurrentMemberRoleInfo().SortOrder;
                                    // Basen
                                    var bases = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d;
                                    var CountBases = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().c;
                                    var LvLSumCY = 0;
                                    var LvLSumBase = 0;
                                    var LvLSumOff = 0;
                                    var LvLSumDef = 0;
                                    var LvLHighestOff = 0;
                                    var LvLHighestDef = 0;
                                    var LvLSumDF = 0;
                                    var LvLSumSup = 0;
                                    var CountSup = 0;
                                    var ProductionTiberium = 0;
                                    var ProductionCrystal = 0;
                                    var ProductionPower = 0;
                                    var ProductionCredits = 0;
                                    var repairMaxTime = 0;
                                    for (var key in bases)
                                    {
                                        var base = bases[key];
                                        var BaseId = base.get_Id();
                                        var BaseName = base.get_Name();
                                        var PosX = base.get_PosX();
                                        var PosY = base.get_PosY();
                                        var LvLCY = base.get_ConstructionYardLevel();
                                        var LvLBase = base.get_LvlBase();
                                        var LvLOffense = base.get_LvlOffense();
                                        var LvLDefense = base.get_LvlDefense();
                                        if (base.GetResourceMaxStorage(ClientLib.Base.EResourceType.RepairChargeInf) > repairMaxTime)
                                        {
                                            repairMaxTime = base.GetResourceMaxStorage(ClientLib.Base.EResourceType.RepairChargeInf);
                                        }
                                        var repairCurrentTime = base.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeInf);
                                        var LvLDF = 0;
                                        var df = base.get_CityBuildingsData().GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Defense_Facility);
                                        if (df !== null)
                                        {
                                            LvLDF = df.get_CurrentLevel();
                                            LvLSumDF += LvLDF;
                                        }
                                        LvLSumCY += LvLCY;
                                        LvLSumBase += LvLBase;
                                        LvLSumOff += LvLOffense;
                                        LvLSumDef += LvLDefense;
                                        if (LvLOffense > LvLHighestOff)
                                        {
                                            LvLHighestOff = LvLOffense;
                                        }
                                        if (LvLDefense > LvLHighestDef)
                                        {
                                            LvLHighestDef = LvLDefense;
                                        }
                                        var LvLSupport = 0;
                                        var SupArt = "";
                                        if (base.get_SupportData() !== null)
                                        {
                                            LvLSupport = base.get_SupportData().get_Level();
                                            SupArt = base.get_SupportWeapon().n.replace(/NOD_SUPPORT_/gi,"").replace(/GDI_SUPPORT_/gi,"").replace(/FOR_SUPPORT_/gi,"");
                                            LvLSumSup += base.get_SupportData().get_Level();
                                            CountSup++;
                                        }
                                        var TiberiumPerHour = Math.round(base.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Tiberium, true, true));
                                        var CrystalPerHour = Math.round(base.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Crystal, true, true));
                                        var PowerPerHour = Math.round(base.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Power, true, true));
                                        var CreditsPerHour = parseInt(ClientLib.Base.Resource.GetResourceGrowPerHour(base.get_CityCreditsProduction(), false) + ClientLib.Base.Resource.GetResourceBonusGrowPerHour(base.get_CityCreditsProduction(), false));
                                        ProductionTiberium += TiberiumPerHour;
                                        ProductionCrystal += CrystalPerHour;
                                        ProductionPower += PowerPerHour;
                                        ProductionCredits += CreditsPerHour;
                                        // Basen
                                        var ObjectBase = {};
                                        ObjectBase.BaseId = BaseId;
                                        ObjectBase.BaseName = BaseName;
                                        ObjectBase.PosX = PosX;
                                        ObjectBase.PosY = PosY;
                                        ObjectBase.LvLCY = LvLCY;
                                        ObjectBase.LvLBase = LvLBase;
                                        ObjectBase.LvLOffense = LvLOffense;
                                        ObjectBase.LvLDefense = LvLDefense;
                                        ObjectBase.LvLDF = LvLDF;
                                        ObjectBase.LvLSupport = LvLSupport;
                                        ObjectBase.SupArt = SupArt;
                                        ObjectBase.TiberiumPerHour = TiberiumPerHour;
                                        ObjectBase.CrystalPerHour = CrystalPerHour;
                                        ObjectBase.PowerPerHour = PowerPerHour;
                                        ObjectBase.CreditsPerHour = CreditsPerHour;
                                        ObjectBase.CurrentRepairTime = repairCurrentTime;
                                        this.CnCOpt(BaseId, BaseName, Faction);
                                        ObjectBase.CnCOpt = this.linkBase;
                                        this.ObjectData.bases.push(ObjectBase);
                                        this.linkBase = '';
                                    }
                                    var AverageCY = LvLSumCY / CountBases;
                                    var AverageBase = LvLSumBase / CountBases;
                                    var AverageOff = LvLSumOff / CountBases;
                                    var AverageDef = LvLSumDef / CountBases;
                                    var AverageDF = LvLSumDF / CountBases;
                                    var AverageSup = LvLSumSup / CountBases;
                                    // Server
                                    this.ObjectData.server.WorldId = WorldId;
                                    this.ObjectData.server.ServerName = ServerName;
                                    this.ObjectData.server.SeasonServer = SeasonServer;
                                    // Alliance
                                    this.ObjectData.alliance.AllianceId = AllianceId;
                                    if (AllianceId > 0)
                                    {
                                        this.ObjectData.alliance.AllianceName = AllianceName;
                                        this.ObjectData.alliance.AllianceRank = AllianceRank;
                                        this.ObjectData.alliance.AllianceEventRank = AllianceEventRank;
                                        this.ObjectData.alliance.AllianceTotalScore = AllianceTotalScore;
                                        this.ObjectData.alliance.AllianceAverageScore = AllianceAverageScore;
                                        this.ObjectData.alliance.AllianceVeteranPoints = AllianceVeteranPoints;
                                        this.ObjectData.alliance.AllianceProdVetPoints = AllianceProdVetPoints;
                                        this.ObjectData.alliance.BonusTiberium = BonusTiberium;
                                        this.ObjectData.alliance.BonusCrystal = BonusCrystal;
                                        this.ObjectData.alliance.BonusPower = BonusPower;
                                        this.ObjectData.alliance.BonusInfantrie = BonusInfantrie;
                                        this.ObjectData.alliance.BonusVehicle = BonusVehicle;
                                        this.ObjectData.alliance.BonusAir = BonusAir;
                                        this.ObjectData.alliance.BonusDef = BonusDef;
                                        this.ObjectData.alliance.RankTib = RankTib;
                                        this.ObjectData.alliance.RankCry = RankCry;
                                        this.ObjectData.alliance.RankPow = RankPow;
                                        this.ObjectData.alliance.RankInf = RankInf;
                                        this.ObjectData.alliance.RankVeh = RankVeh;
                                        this.ObjectData.alliance.RankAir = RankAir;
                                        this.ObjectData.alliance.RankDef = RankDef;
                                        this.ObjectData.alliance.ScoreTib = ScoreTib;
                                        this.ObjectData.alliance.ScoreCry = ScoreCry;
                                        this.ObjectData.alliance.ScorePow = ScorePow;
                                        this.ObjectData.alliance.ScoreInf = ScoreInf;
                                        this.ObjectData.alliance.ScoreVeh = ScoreVeh;
                                        this.ObjectData.alliance.ScoreAir = ScoreAir;
                                        this.ObjectData.alliance.ScoreDef = ScoreDef;
                                    }
                                    // Player
                                    this.ObjectData.player.AccountId = AccountId;
                                    this.ObjectData.player.PlayerName = PlayerName;
                                    this.ObjectData.player.PlayerScorePoints = PlayerScorePoints;
                                    this.ObjectData.player.CountBases = CountBases;
                                    this.ObjectData.player.CountSup = CountSup;
                                    this.ObjectData.player.PlayerRank = PlayerRank;
                                    this.ObjectData.player.PlayerEventRank = PlayerEventRank;
                                    this.ObjectData.player.PlayerVeteranPoints = PlayerVeteranPoints;
                                    this.ObjectData.player.ResearchPoints = ResearchPoints;
                                    this.ObjectData.player.Credits = Credits;
                                    this.ObjectData.player.Funds = Funds;
                                    this.ObjectData.player.LegacyPoints = LegacyPoints;
                                    this.ObjectData.player.CommandPointsMaxStorage = CommandPointsMaxStorage;
                                    this.ObjectData.player.CommandPointsCurrent = CommandPointsCurrent;
                                    this.ObjectData.player.Faction = Faction;
                                    this.ObjectData.player.MemberRole = MemberRole;
                                    this.ObjectData.player.LvLHighestOff = LvLHighestOff;
                                    this.ObjectData.player.LvLHighestDef = LvLHighestDef;
                                    this.ObjectData.player.AverageCY = AverageCY;
                                    this.ObjectData.player.AverageBase = AverageBase;
                                    this.ObjectData.player.AverageOff = AverageOff;
                                    this.ObjectData.player.AverageDef = AverageDef;
                                    this.ObjectData.player.AverageDF = AverageDF;
                                    this.ObjectData.player.AverageSup = AverageSup;
                                    this.ObjectData.player.ProductionTiberium = ProductionTiberium;
                                    this.ObjectData.player.ProductionCrystal = ProductionCrystal;
                                    this.ObjectData.player.ProductionPower = ProductionPower;
                                    this.ObjectData.player.ProductionCredits = ProductionCredits;
                                    this.ObjectData.player.MaxRepairTime = repairMaxTime;
                                    // Vertretung
                                    if (ClientLib.Data.MainData.GetInstance().get_PlayerSubstitution().getOutgoing())
                                    {
                                        this.ObjectData.substitution.outgoing = ClientLib.Data.MainData.GetInstance().get_PlayerSubstitution().getOutgoing().n;
                                    }
                                    var incomingSubs = ClientLib.Data.MainData.GetInstance().get_PlayerSubstitution().getIncoming();
                                    for (var i = 0; i < incomingSubs.length; i++)
                                    {
                                        this.ObjectData.substitution.incoming.push(incomingSubs[i].n);
                                    }
                                    var activeSubs = ClientLib.Data.MainData.GetInstance().get_PlayerSubstitution().getSubstitution();
                                    for (var i = 0; i < activeSubs.length; i++)
                                    {
                                        this.ObjectData.substitution.active.push(activeSubs[i].n);
                                    }
                                    ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("GetPublicPlayerInfo", {
                                        id : PlayerId
                                    }, phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, this.getPublicPlayerInfo), null);
                                    if (AllianceId > 0)
                                    {
                                        ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("GetPublicAllianceInfo", {
                                            id : AllianceId
                                        }, phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, this.getPublicAllianceInfo), null);
                                    }
                                    // Anfrage absenden
                                    this.sendDataFromInGame();
                                    // ab hier clever Timeouten
                                    // Abschüsse für Player
                                    if (!this.ReportsAreLoading)
                                    {
                                        this.ReportsAreLoading = true;
                                        // console.log(this.ReportsAreLoading);
                                        // getReportCount (Offensive)
                                        var ObjectSend = {action: 'getExistingReportIds', WorldId: WorldId, AccountId: AccountId};
                                        var _self = this;
                                        $.post(linkToRoot + 'php/manageBackend.php', ObjectSend)
                                        .always(function(_data)
                                        {
                                            for (var i = 0; i < _data.length; i++)
                                            {
                                                _self.ObjectReportData[_data[i].ReportId] = _data[i].ReportId; // create fake-report
                                            }
                                            _self.killReportTimeouts();
                                        });
                                    }
                                    setTimeout(function(_self){_self.getCurrentStats();}, 3600000, this);
                                }
                                else
                                {
                                    setTimeout(function(_self){_self.getCurrentStats();}, 1000, this);
                                }
                            }
                            catch(e)
                            {
                                console.log(e);
                            }
                        },
                        getPublicPlayerInfo: function(_context, _data)
                        {
                            var bases = _data.c;
                            for (var i = 0; i < bases.length; i++)
                            {
                                this.ObjectData.bases[i].BasePoints = bases[i].p;
                            }
                            this.ObjectData.player.Shoot = _data.bd;
                            this.ObjectData.player.PvP = _data.bd - _data.bde;
                            this.ObjectData.player.PvE = _data.bde;
                            this.ObjectDataNotSend.Endgames = _data.ew;
                            this.ObjectDataNotSend.Challenges = _data.cw;
                            // this.ObjectDataNotSend.OtherAchievements = _data.mw;
                        },
                        getPublicAllianceInfo: function(_context, _data)
                        {
                            this.ObjectData.alliance.Shoot = _data.bd;
                            this.ObjectData.alliance.PvP = _data.bdp;
                            this.ObjectData.alliance.PvE = _data.bde;
                        },
                        killReportTimeouts: function()
                        {
                            this.timeoutArrayReportDataManager.push([]);
                            for (var i = 0; i < this.timeoutArrayReportDataManager.length; i++)
                            {
                                for (var j = 0; j < this.timeoutArrayReportDataManager[i].length; j++)
                                {
                                    clearTimeout(this.timeoutArrayReportDataManager[i][j]);
                                }
                            }
                            this.getReportHeaderAllManager();
                        },
                        getReportHeaderAllManager: function()
                        {
                            // getReportHeaderAll (Offensive)
                            ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("GetReportHeaderAll", {
                                type: 1,
                                skip: 0,
                                take: 1000, // ersetzen durch ReportCount nicht erforderlich, da bei weniger Berichten auch nur weniger abgeholt werden
                                sort: 1,
                                ascending: false
                            }, phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, this.getReportHeaderAll), null);
                        },
                        getReportHeaderAll: function(_context, _data)
                        {
                            // console.log(this.ObjectReportData);
                            var ArrayReportHeader = _data;
                            var ArrayReportIds = [];
                            for (var i = 0; i < ArrayReportHeader.length; i++)
                            {
                                if (this.ObjectReportData[ArrayReportHeader[i].i] == undefined)
                                {
                                    ArrayReportIds.push(ArrayReportHeader[i].i);
                                }
                            }
                            for (var i = 0; i < ArrayReportIds.length; i++)
                            {
                                this.getReportDataManager(ArrayReportIds[i], i);
                            }
                            this.ReportsAreLoading = false;
                        },
                        getReportDataManager: function(_curReportId, _curReportCount)
                        {
                            // getReportData
                            this.timeoutArrayReportDataManager[this.timeoutArrayReportDataManager.length - 1].push(setTimeout(function(_self)
                            {
                                ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("GetReportData", {
                                    playerReportId: _curReportId
                                }, phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, _self, _self.getReportData), null);
                            }, _curReportCount * 1000, this));
                        },
                        getReportData: function(_context, _data)
                        {
                            if (_data.i) // existiert Report noch? (könnte gelöscht worden sein von User oder automatisch nach 1 Woche gelöscht)
                            {
                                var report = {};
                                report.WorldId = this.ObjectData.server.WorldId;
                                report.AccountId = this.ObjectData.player.AccountId;
                                report.ReportId = _data.i;
                                report.OwnBaseId = _data.d.abi;
                                report.AttackTime = _data.d.t;
                                report.TargetLevel = _data.d.dbl;
                                report.TargetFaction = _data.d.dpf;
                                report.BattleStatus = _data.d.cr;
                                report.GainTib = 0;
                                report.GainCry = 0;
                                report.GainCre = 0;
                                report.GainRp = 0;
                                if (_data.tp == 2) // Attack against forgotten
                                {
                                    for (var i = 0; i < _data.d.arr.length; i++)
                                    {
                                        var typeOfResources = _data.d.arr[i].t;
                                        switch(typeOfResources)
                                        {
                                            case 1:
                                            {
                                                report.GainTib = parseInt(_data.d.arr[i].a);
                                                break;
                                            }
                                            case 2:
                                            {
                                                report.GainCry = parseInt(_data.d.arr[i].a);
                                                break;
                                            }
                                            case 3:
                                            {
                                                report.GainCre = parseInt(_data.d.arr[i].a);
                                                break;
                                            }
                                            case 6:
                                            {
                                                report.GainRp = parseInt(_data.d.arr[i].a);
                                                break;
                                            }
                                            default:
                                            {
                                                break;
                                            }
                                        }
                                    }
                                }
                                else if (_data.tp == 1) // Attack against player
                                {
                                    for (var i = 0; i < _data.d.arp.length; i++)
                                    {
                                        var typeOfResources = _data.d.arp[i].t;
                                        switch(typeOfResources)
                                        {
                                            case 1:
                                            {
                                                report.GainTib = parseInt(_data.d.arp[i].a);
                                                break;
                                            }
                                            case 2:
                                            {
                                                report.GainCry = parseInt(_data.d.arp[i].a);
                                                break;
                                            }
                                            case 3:
                                            {
                                                report.GainCre = parseInt(_data.d.arp[i].a);
                                                break;
                                            }
                                            case 6:
                                            {
                                                report.GainRp = parseInt(_data.d.arp[i].a);
                                                break;
                                            }
                                            default:
                                            {
                                                break;
                                            }
                                        }
                                    }
                                }
                                report.CostCry = 0;
                                report.CostRep = 0;
                                for (var i = 0; i < _data.d.arca.length; i++)
                                {
                                    var typeOfResources = _data.d.arca[i].t;
                                    switch(typeOfResources)
                                    {
                                        case 2:
                                        {
                                            report.CostCry = parseInt(_data.d.arca[i].a);
                                            break;
                                        }
                                        case 8:
                                        {
                                            report.CostRep = parseInt(_data.d.arca[i].a);
                                            break;
                                        }
                                        default:
                                        {
                                            break;
                                        }
                                    }
                                }
                                for (var i = 0; i < _data.d.arci.length; i++)
                                {
                                    var typeOfResources = _data.d.arci[i].t;
                                    switch(typeOfResources)
                                    {
                                        case 2:
                                        {
                                            report.CostCry = parseInt(_data.d.arci[i].a);
                                            break;
                                        }
                                        case 9:
                                        {
                                            report.CostRep = parseInt(_data.d.arci[i].a);
                                            break;
                                        }
                                        default:
                                        {
                                            break;
                                        }
                                    }
                                }
                                this.ObjectReportData[_data.i] = report;
                                this.sendReportData(_data.i);
                            }
                        },
                        sendReportData: function(_reportId)
                        {
                            // console.log(this.ObjectReportData[_reportId]);
                            var ArrayReports = [this.ObjectReportData[_reportId]];
                            var ObjectSend = {action:"sendDataFromInGameReport", ObjectData:ArrayReports, ScriptVersionLocal: scriptVersionLocal};
                            $.post(linkToRoot + 'php/manageBackend.php', ObjectSend);
                        },
                        sendChatInfo: function(_dataAnswer)
                        {
                            var stringChat = '';
                            if (_dataAnswer[0] == 0 && !ClientLib.Data.MainData.GetInstance().get_Player().get_IsSubstituted())
                            {
                                stringChat = "/w " + this.ObjectData.player.PlayerName + " Hallo " + this.ObjectData.player.PlayerName + ", um zu leoStats zu gelangen, klicke auf [url]" + linkToRoot + "[/url]. Dein Benutzername ist \"" + this.ObjectData.player.PlayerName + "\" und dein Standardpasswort: \"" + this.ObjectData.player.PlayerName + "_" + this.ObjectData.player.AccountId + "\"";
                            }
                            else
                            {
                                stringChat = "/w " + this.ObjectData.player.PlayerName + " Hallo " + this.ObjectData.player.PlayerName + ", um zu leoStats zu gelangen, klicke auf [url]" + linkToRoot + "[/url].";
                            }
                            qx.core.Init.getApplication().getChat().getChatWidget().send(stringChat);
                        },
                        sendDataFromInGame: function()
                        {
                            if (this.ObjectData != undefined && this.ObjectData.player != undefined && this.ObjectData.player.Shoot != undefined && this.ObjectData.alliance != undefined && (this.ObjectData.alliance.AllianceId == 0 || this.ObjectData.alliance.Shoot != undefined))
                            {
                                // funktioniert nicht
                                /*var requestLogin = new qx.io.request.Xhr(linkToRoot + 'php/manageBackend.php', 'post');
                                requestLogin.setRequestData(ObjectSend);
                                requestLogin.addListener('success', function(e)
                                {
                                    var req = e.getTarget();
                                    var response = req.getResponse();
                                    console.log(response);
                                    if (_self.sendChatInfoStatus)
                                    {
                                        _self.sendChatInfo(response);
                                        _self.sendChatInfoStatus = false;
                                    }
                                }, this);
                                requestLogin.send();*/
                                var ObjectSend = {action:"sendDataFromInGame", ObjectData:this.ObjectData, ScriptVersionLocal: scriptVersionLocal};
                                var _self = this;
                                $.post(linkToRoot + 'php/manageBackend.php', ObjectSend)
                                .always(function(_data)
                                {
                                    if (_self.sendChatInfoStatus)
                                    {
                                        _self.sendChatInfo(_data);
                                        _self.sendChatInfoStatus = false;
                                    }
                                });
                            }
                            else
                            {
                                setTimeout(function(_self){_self.sendDataFromInGame();}, 1000, this);
                            }
                        }
                    }
                });
                leoStats.getInstance().initialize();
                qx.Class.define('BaseScanner',
                {
                    type: 'singleton',
                    extend: qx.core.Object,
                    construct: function ()
                    {
                        console.log('create BaseScanner...');
                    },
                    members:
                    {
                        initialize: function()
                        {
                            this.app = qx.core.Init.getApplication();
                            this.ArrayLayouts = [];
                            this.ArrayScannedIds = [];
                            this.ArrayIdsForScan = [];
                            this.ScriptIsRunning = false;
                            this.buildGUI();
                            this.autoScanByClickOnBase();
                        },
                        buildGUI: function()
                        {
                            // Button
                            this.GuiButtonBaseScanner = new qx.ui.form.Button('Start BaseScanner...').set(
                            {
                                center: true,
                                rich: true
                            });
                            this.GuiButtonBaseScanner.addListener('click', function()
                            {
                                if (this.ScriptIsRunning)
                                {
                                    this.stopBaseScan();
                                }
                                else
                                {
                                    this.startBaseScan();
                                }
                            }, this);

                            // set Button to position
                            this.app.getDesktop().add(this.GuiButtonBaseScanner,
                            {
                                right: 125,
                                top: 24
                            });
                        },
                        autoScanByClickOnBase: function()
                        {
                            this.initializeDefaultValues();
                            var _self = this;
                            phe.cnc.Util.attachNetEvent(ClientLib.Data.MainData.GetInstance().get_Cities(), "CurrentChange", ClientLib.Data.CurrentCityChange, this, _self.scanClickedBase);
                        },
                        scanClickedBase: function(_oldId, _newId)
                        {
                            if (!this.ScriptIsRunning) // soll nur aktiv werden, wenn der Benutzer selbst ein Camp anklickt, hat nichts mit dem komplett BasenScan zu tun
                            {
                                // console.log(ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity());
                                if (ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity())
                                {
                                    // console.log(_newId);
                                    var cityFaction = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity().get_CityFaction();
                                    if ((cityFaction == 4|| cityFaction == 5 || cityFaction == 6 || cityFaction == 8) && this.ArrayScannedIds.indexOf(_newId) == -1 && this.ArrayIdsForScan.indexOf(_newId) == -1)
                                    {
                                        // console.log(cityFaction);
                                        this.errorRangeCounter = 0;
                                        if (typeof(timeoutScanClickedBase) !== 'undefined')
                                        {
                                            clearTimeout(timeoutScanClickedBase);
                                        }
                                        this.ArrayIdsForScan = []; // fraglich, ob es was bringt - macht Sinn, da nicht 
                                        this.ArrayIdsForScan.push(_newId);
                                        this.scanFirstLayout();
                                    }
                                    else if (cityFaction == 0 && this.errorRangeCounter < 5)
                                    {
                                        this.errorRangeCounter++;
                                        timeoutScanClickedBase = setTimeout(function(_self){_self.scanClickedBase(_oldId, _newId);}, 1000, this);
                                    }
                                    else
                                    {
                                        if (typeof(timeoutScanClickedBase) !== 'undefined')
                                        {
                                            clearTimeout(timeoutScanClickedBase);
                                        }
                                        this.errorRangeCounter = 0;
                                    }
                                }
                            }
                        },
                        startBaseScan: function()
                        {
                            this.ScriptIsRunning = true;
                            var numberHasToScan = this.ArrayLayouts.length + this.ArrayIdsForScan.length;
                            this.GuiButtonBaseScanner.setLabel('Scan Base... (' + this.ArrayLayouts.length + ' / ' + numberHasToScan + ')');
                            this.startScan();
                        },
                        stopBaseScan: function()
                        {
                            this.ScriptIsRunning = false;
                            this.GuiButtonBaseScanner.setLabel('Start BaseScanner...');
                            this.stopScan();
                        },
                        initializeDefaultValues: function()
                        {
                            this.attRange = ClientLib.Data.MainData.GetInstance().get_Server().get_MaxAttackDistance();
                            this.ArrayPrototypeGameObjectType2 = [];
                            this.ArrayPrototypeGameObjectType3 = [];
                            this.ArrayIdsForScan = [];
                            this.errorExistsCounter = 0;
                            this.errorRangeCounter = 0;
                        },
                        getArrayPrototypeGameObject: function()
                        {
                            var bases = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d;
                            for (var key in bases)
                            {
                                var baseX = bases[key].get_X();
                                var baseY = bases[key].get_Y();
                                var goalXType2 = 0;
                                var goalYType2 = 0;
                                var goalXType3 = 0;
                                var goalYType3 = 0;
                                for (var x = baseX - 10; x < baseX + 10; x++)
                                {
                                    for (var y = baseY - 10; y < baseY + 10; y++)
                                    {
                                        var curObject = ClientLib.Data.MainData.GetInstance().get_World().GetObjectFromPosition(x, y);
                                        if (curObject != null)
                                        {
                                            if (curObject.Type == 2 && !goalXType2 && !goalYType2)
                                            {
                                                goalXType2 = x;
                                                goalYType2 = y;
                                            }
                                            else if (curObject.Type == 3 && !goalXType3 && !goalYType3)
                                            {
                                                goalXType3 = x;
                                                goalYType3 = y;
                                            }
                                            else if (goalXType2 && goalYType2 && goalXType3 && goalYType3)
                                            {
                                                break;
                                            }
                                        }
                                    }
                                    if (goalXType2 && goalYType2 && goalXType3 && goalYType3)
                                    {
                                        break;
                                    }
                                }
                                if (goalXType2 && goalYType2 && goalXType3 && goalYType3)
                                {
                                    break;
                                }
                            }
                            for (var key in ClientLib.Data.MainData.GetInstance().get_World().GetObjectFromPosition(goalXType2, goalYType2))
                            {
                                this.ArrayPrototypeGameObjectType2.push(key);
                            }
                            for (var key in ClientLib.Data.MainData.GetInstance().get_World().GetObjectFromPosition(goalXType3, goalYType3))
                            {
                                this.ArrayPrototypeGameObjectType3.push(key);
                            }
                        },
                        returnLayoutOfCurBaseAndEvaluateIt: function()
                        {
                            var ArrayBaseResourceFields = new Array(16).fill().map(x => new Array(9).fill(''));
                            var curCity = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity();
                            for (var y = 0; y < 16; y++)
                            {
                                for (var x = 0; x < 9; x++)
                                {
                                    if (curCity.GetResourceType(x, y))
                                    {
                                        // 1 = Crystal
                                        // 2 = Tiberium
                                        ArrayBaseResourceFields[y][x] = curCity.GetResourceType(x, y);
                                    }
                                }
                            }
                            var posX = curCity.get_X();
                            var posY = curCity.get_Y();
                            var counterFieldsTib = 0;
                            var counterFieldsCry = 0;
                            var Tiberium6 = 0;
                            var Tiberium5 = 0;
                            var Tiberium4 = 0;
                            var Tiberium3 = 0;
                            var Tiberium2 = 0;
                            var Tiberium1 = 0;
                            var Crystal6 = 0;
                            var Crystal5 = 0;
                            var Crystal4 = 0;
                            var Crystal3 = 0;
                            var Crystal2 = 0;
                            var Crystal1 = 0;
                            var Mixed6 = 0;
                            var Mixed5 = 0;
                            var Mixed4 = 0;
                            var Mixed3 = 0;
                            var Mixed2 = 0;
                            var Mixed1 = 0;
                            var Power8 = 0;
                            var Power7 = 0;
                            var Power6 = 0;
                            var Power5 = 0;
                            var Power4 = 0;
                            var Power3 = 0;
                            var Power2 = 0;
                            for (var y = 0; y < 8; y++)
                            {
                                for (var x = 0; x < 9; x++)
                                {
                                    if (ArrayBaseResourceFields[y][x] == '') // das Feld darf nicht belegt sein - schließlich kann man auf belegte Felder nichts stellen
                                    {
                                        var curTibConn = 0;
                                        var curCryConn = 0;
                                        var curMixConn = 0;
                                        var curPowConn = 0;
                                        // Feld links oben
                                        if (x == 0 && y == 0)
                                        {
                                            // Feld rechts
                                            if (ArrayBaseResourceFields[y][x + 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y][x + 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld rechts unten
                                            if (ArrayBaseResourceFields[y + 1][x + 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y + 1][x + 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld unten
                                            if (ArrayBaseResourceFields[y + 1][x] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y + 1][x] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                        }
                                        // Feld rechts oben
                                        else if (x == 8 && y == 0)
                                        {
                                            // Feld links
                                            if (ArrayBaseResourceFields[y][x - 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y][x - 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld links unten
                                            if (ArrayBaseResourceFields[y + 1][x - 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y + 1][x - 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld unten
                                            if (ArrayBaseResourceFields[y + 1][x] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y + 1][x] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                        }
                                        // Felder oben
                                        else if (y == 0)
                                        {
                                            // Feld links
                                            if (ArrayBaseResourceFields[y][x - 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y][x - 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld links unten
                                            if (ArrayBaseResourceFields[y + 1][x - 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y + 1][x - 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld unten
                                            if (ArrayBaseResourceFields[y + 1][x] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y + 1][x] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld rechts unten
                                            if (ArrayBaseResourceFields[y + 1][x + 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y + 1][x + 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld rechts
                                            if (ArrayBaseResourceFields[y][x + 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y][x + 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                        }
                                        // Feld links unten
                                        else if (x == 0 && y == 7)
                                        {
                                            // Feld oben
                                            if (ArrayBaseResourceFields[y - 1][x] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y - 1][x] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld rechts oben
                                            if (ArrayBaseResourceFields[y - 1][x + 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y - 1][x + 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld rechts
                                            if (ArrayBaseResourceFields[y][x + 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y][x + 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                        }
                                        // Felder links
                                        else if (x == 0)
                                        {
                                            // Feld oben
                                            if (ArrayBaseResourceFields[y - 1][x] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y - 1][x] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld rechts oben
                                            if (ArrayBaseResourceFields[y - 1][x + 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y - 1][x + 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld rechts
                                            if (ArrayBaseResourceFields[y][x + 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y][x + 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld rechts unten
                                            if (ArrayBaseResourceFields[y + 1][x + 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y + 1][x + 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld unten
                                            if (ArrayBaseResourceFields[y + 1][x] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y + 1][x] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                        }
                                        // Feld rechts unten
                                        else if (x == 8 && y == 7)
                                        {
                                            // Feld links
                                            if (ArrayBaseResourceFields[y][x - 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y][x - 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld links oben
                                            if (ArrayBaseResourceFields[y - 1][x - 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y - 1][x - 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld oben
                                            if (ArrayBaseResourceFields[y - 1][x] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y - 1][x] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                        }
                                        // Felder unten
                                        else if (y == 7)
                                        {
                                            // Feld links
                                            if (ArrayBaseResourceFields[y][x - 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y][x - 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld links oben
                                            if (ArrayBaseResourceFields[y - 1][x - 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y - 1][x - 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld oben
                                            if (ArrayBaseResourceFields[y - 1][x] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y - 1][x] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld rechts oben
                                            if (ArrayBaseResourceFields[y - 1][x + 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y - 1][x + 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld rechts
                                            if (ArrayBaseResourceFields[y][x + 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y][x + 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                        }
                                        // Felder rechts
                                        else if (x == 8)
                                        {
                                            // Feld oben
                                            if (ArrayBaseResourceFields[y - 1][x] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y - 1][x] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld links oben
                                            if (ArrayBaseResourceFields[y - 1][x - 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y - 1][x - 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld links
                                            if (ArrayBaseResourceFields[y][x - 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y][x - 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld links unten
                                            if (ArrayBaseResourceFields[y + 1][x - 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y + 1][x - 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld unten
                                            if (ArrayBaseResourceFields[y + 1][x] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y + 1][x] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                        }
                                        // Felder Mitte
                                        else
                                        {
                                            // Feld oben
                                            if (ArrayBaseResourceFields[y - 1][x] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y - 1][x] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld rechts oben
                                            if (ArrayBaseResourceFields[y - 1][x + 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y - 1][x + 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld rechts
                                            if (ArrayBaseResourceFields[y][x + 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y][x + 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }// Feld rechts unten
                                            if (ArrayBaseResourceFields[y + 1][x + 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y + 1][x + 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld unten
                                            if (ArrayBaseResourceFields[y + 1][x] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y + 1][x] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld links unten
                                            if (ArrayBaseResourceFields[y + 1][x - 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y + 1][x - 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld links
                                            if (ArrayBaseResourceFields[y][x - 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y][x - 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                            // Feld links oben
                                            if (ArrayBaseResourceFields[y - 1][x - 1] == 1)
                                            {
                                                curCryConn++;
                                                curMixConn++;
                                            }
                                            else if (ArrayBaseResourceFields[y - 1][x - 1] == 2)
                                            {
                                                curTibConn++;
                                                curMixConn++;
                                            }
                                            else
                                            {
                                                curPowConn++;
                                            }
                                        }
                                        switch(curTibConn)
                                        {
                                            case 6:
                                            {
                                                Tiberium6++;
                                                break;
                                            }
                                            case 5:
                                            {
                                                Tiberium5++;
                                                break;
                                            }
                                            case 4:
                                            {
                                                Tiberium4++;
                                                break;
                                            }
                                            case 3:
                                            {
                                                Tiberium3++;
                                                break;
                                            }
                                            case 2:
                                            {
                                                Tiberium2++;
                                                break;
                                            }
                                            case 1:
                                            {
                                                Tiberium1++;
                                                break;
                                            }
                                            default:
                                            {
                                                break;
                                            }
                                        }
                                        switch(curCryConn)
                                        {
                                            case 6:
                                            {
                                                Crystal6++;
                                                break;
                                            }
                                            case 5:
                                            {
                                                Crystal5++;
                                                break;
                                            }
                                            case 4:
                                            {
                                                Crystal4++;
                                                break;
                                            }
                                            case 3:
                                            {
                                                Crystal3++;
                                                break;
                                            }
                                            case 2:
                                            {
                                                Crystal2++;
                                                break;
                                            }
                                            case 1:
                                            {
                                                Crystal1++;
                                                break;
                                            }
                                            default:
                                            {
                                                break;
                                            }
                                        }
                                        switch(curMixConn)
                                        {
                                            case 6:
                                            {
                                                Mixed6++;
                                                break;
                                            }
                                            case 5:
                                            {
                                                Mixed5++;
                                                break;
                                            }
                                            case 4:
                                            {
                                                Mixed4++;
                                                break;
                                            }
                                            case 3:
                                            {
                                                Mixed3++;
                                                break;
                                            }
                                            case 2:
                                            {
                                                Mixed2++;
                                                break;
                                            }
                                            case 1:
                                            {
                                                Mixed1++;
                                                break;
                                            }
                                            default:
                                            {
                                                break;
                                            }
                                        }
                                        switch(curPowConn)
                                        {
                                            case 8:
                                            {
                                                Power8++;
                                                break;
                                            }
                                            case 7:
                                            {
                                                Power7++;
                                                break;
                                            }
                                            case 6:
                                            {
                                                Power6++;
                                                break;
                                            }
                                            case 5:
                                            {
                                                Power5++;
                                                break;
                                            }
                                            case 4:
                                            {
                                                Power4++;
                                                break;
                                            }
                                            case 3:
                                            {
                                                Power3++;
                                                break;
                                            }
                                            case 2:
                                            {
                                                Power2++;
                                                break;
                                            }
                                            default:
                                            {
                                                break;
                                            }
                                        }
                                    }
                                    else if (ArrayBaseResourceFields[y][x] == 2)
                                    {
                                        counterFieldsTib++;
                                    }
                                    else if (ArrayBaseResourceFields[y][x] == 1)
                                    {
                                        counterFieldsCry++;
                                    }
                                }
                            }
                            return {
                                'Zeit': Date.now(),
                                'PosX': posX,
                                'PosY': posY,
                                'FieldsTib': counterFieldsTib,
                                'FieldsCry': counterFieldsCry,
                                'Layout': JSON.stringify(ArrayBaseResourceFields),
                                'EvaluatedFields': [Tiberium6, Tiberium5, Tiberium4, Tiberium3, Tiberium2, Tiberium1, Crystal6, Crystal5, Crystal4, Crystal3, Crystal2, Crystal1, Mixed6, Mixed5, Mixed4, Mixed3, Mixed2, Mixed1, Power8, Power7, Power6, Power5, Power4, Power3, Power2]
                            };
                        },
                        scanFirstLayout: function()
                        {
                            for (var key in this.ArrayIdsForScan)
                            {
                                var curScanId = this.ArrayIdsForScan[key];
                                if (this.ScriptIsRunning)
                                {
                                    ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentCityId(curScanId);
                                }
                                setTimeout(function(_self)
                                {
                                    if (ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity())
                                    {
                                        if (ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity().get_Buildings().c && ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity().get_OwnerId() < 0)
                                        {
                                            _self.errorExistsCounter = 0
                                            _self.ArrayLayouts.push(_self.returnLayoutOfCurBaseAndEvaluateIt());
                                            if (_self.ScriptIsRunning)
                                            {
                                                _self.ArrayScannedIds.push(curScanId);
                                            }
                                            else
                                            {
                                                _self.ArrayScannedIds.push(ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId());
                                            }
                                            _self.ArrayIdsForScan.splice(0,1);
                                            console.log(_self.ArrayLayouts.length + ' / ' + _self.ArrayIdsForScan.length);
                                            var numberHasToScan = _self.ArrayLayouts.length + _self.ArrayIdsForScan.length;
                                            if (_self.ScriptIsRunning)
                                            {
                                                _self.GuiButtonBaseScanner.setLabel('Scan Base... (' + _self.ArrayLayouts.length + ' / ' + numberHasToScan + ')');
                                            }
                                            _self.sendDataOnlyFromLastLayout();
                                            _self.scanFirstLayout();
                                        }
                                        else if (_self.errorExistsCounter < 5)
                                        {
                                            _self.errorExistsCounter++;
                                            console.log('Layout not found (' + _self.errorExistsCounter + ')');
                                            _self.scanFirstLayout();
                                        }
                                        else
                                        {
                                            console.log('Layout not found (' + _self.errorExistsCounter + '), removing it from scan');
                                            _self.ArrayIdsForScan.splice(0,1);
                                            _self.errorExistsCounter = 0;
                                            _self.scanFirstLayout();
                                        }
                                    }
                                    else if (_self.errorExistsCounter < 5)
                                    {
                                        _self.errorExistsCounter += 1;
                                    }
                                    else
                                    {
                                        console.log('Layout not found (' + _self.errorExistsCounter + '), removing it from scan');
                                        _self.ArrayIdsForScan.splice(0,1);
                                        _self.errorExistsCounter = 0;
                                        _self.scanFirstLayout();
                                    }
                                }, 1000, this);
                                break;
                            }
                            if (!this.ArrayIdsForScan.length)
                            {
                                // this.sendDataAllLayouts();
                                // this.sendDataOnlyFromLastLayout();
                                setTimeout(function(_self){_self.stopBaseScan();}, 1000, this);
                            }
                        },
                        scanAroundOwnBase: function(_ownBaseId)
                        {
                            var x = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_ownBaseId].get_PosX();
                            var y = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d[_ownBaseId].get_PosY();
                            for (var i = parseInt(x - this.attRange); i <= parseInt(x + this.attRange); i++)
                            {
                                for (var j = parseInt(y - this.attRange); j <= parseInt(y + this.attRange); j++)
                                {
                                    var distance = Math.sqrt(Math.pow((i - x), 2) + Math.pow((j - y), 2));
                                    if (distance <= this.attRange)
                                    {
                                        var curObject = ClientLib.Data.MainData.GetInstance().get_World().GetObjectFromPosition(i,j);
                                        if (curObject)
                                        {
                                            // if (curObject.Type == 2 || curObject.Type == 3) // Basen oder Camps/Vorposten
                                            // curObject[this.ArrayPrototypeGameObjectType3[9]] == 2 // Camp
                                            // curObject[this.ArrayPrototypeGameObjectType3[9]] == 3 // Vorposten
                                            if (curObject.Type == 3 && (curObject[this.ArrayPrototypeGameObjectType3[10]] > 0 || curObject[this.ArrayPrototypeGameObjectType3[11]] > 0)) // Camps/Vorposten, (health)
                                            {
                                                var curBaseId = curObject[this.ArrayPrototypeGameObjectType3[12]];
                                                if (this.ArrayIdsForScan.indexOf(curBaseId) == -1 && this.ArrayScannedIds.indexOf(curBaseId) == -1)
                                                {
                                                    this.ArrayIdsForScan.push(curBaseId);
                                                }
                                            }
                                            else if (curObject.Type == 2) // Basen
                                            {
                                                var curBaseId = curObject[this.ArrayPrototypeGameObjectType2[12]];
                                                if (this.ArrayIdsForScan.indexOf(curBaseId) == -1 && this.ArrayScannedIds.indexOf(curBaseId) == -1)
                                                {
                                                    this.ArrayIdsForScan.push(curBaseId);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        iterateThroughOwnBases: function()
                        {
                            var ownBases = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d;
                            for (var key in ownBases)
                            {
                                var ownBase = ownBases[key];
                                var ownBaseId = ownBase.get_Id();
                                this.scanAroundOwnBase(ownBaseId);
                            }
                        },
                        /*sendDataAllLayouts: function()
                        {
                            var WorldId = ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId();
                            var PlayerName = ClientLib.Data.MainData.GetInstance().get_Player().get_Name();
                            var packageSize = 30;
                            // $.ajaxSetup({async: false});
                            for (var packageNumber = 0; packageNumber < Math.ceil(this.ArrayLayouts.length / packageSize); packageNumber++)
                            {
                                var ArrayPackageLayouts = [];
                                if (packageNumber == Math.ceil(this.ArrayLayouts.length / packageSize) - 1) // last round / letztes Paket
                                {
                                    for (var layoutNumber = (packageNumber * packageSize); layoutNumber < this.ArrayLayouts.length; layoutNumber++)
                                    {
                                        ArrayPackageLayouts.push(this.ArrayLayouts[layoutNumber]);
                                    }
                                }
                                else
                                {
                                    for (var layoutNumber = (packageNumber * packageSize); layoutNumber < ((packageNumber + 1) * packageSize); layoutNumber++)
                                    {
                                        ArrayPackageLayouts.push(this.ArrayLayouts[layoutNumber]);
                                    }
                                }
                                var ObjectSend = {action:"sendDataFromInGameBaseScanner", ObjectData:ArrayPackageLayouts, WorldId: WorldId, PlayerName: PlayerName, ScriptVersionLocal: scriptVersionLocal};
                                $.post(linkToRoot + 'php/manageBackend.php', ObjectSend);
                            }
                            // $.ajaxSetup({async: true});
                            var ObjectSend = {action:"sendDataFromInGame", ObjectData:this.ArrayLayouts, WorldId: WorldId, ScriptVersionLocal: scriptVersionLocal};
                            $.post('https://leostats.000webhostapp.com/BaseScanner/php/manageBackend.php', ObjectSend)
                            .always(function(_data)
                            {
                                console.log(_data);
                            });
                        },*/
                        sendDataOnlyFromLastLayout: function()
                        {
                            var WorldId = ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId();
                            var AccountId = ClientLib.Data.MainData.GetInstance().get_Player().get_AccountId();
                            var layout = this.ArrayLayouts[this.ArrayLayouts.length - 1];
                            var ArrayLayout = [layout];
                            var ObjectSend = {action:"sendDataFromInGameBaseScanner", ObjectData:ArrayLayout, WorldId: WorldId, AccountId: AccountId, ScriptVersionLocal: scriptVersionLocal};
                            $.post(linkToRoot + 'php/manageBackend.php', ObjectSend);
                        },
                        stopScan: function()
                        {
                            console.log('Stop...');
                            this.initializeDefaultValues();
                        },
                        startScan: function()
                        {
                            console.log('Start...');
                            this.initializeDefaultValues();
                            this.getArrayPrototypeGameObject();
                            this.iterateThroughOwnBases();
                            this.scanFirstLayout();
                        }
                    }
                });
                BaseScanner.getInstance().initialize();
            }
            setButtons();
        }
        function LoadExtension()
        {
            try
            {
                if (typeof(qx)!='undefined')
                {
                    if (!!qx.core.Init.getApplication().getMenuBar())
                    {
                        leoStatsCreate();
                        return;
                    }
                }
            }
            catch (e)
            {
                if (console !== undefined) console.log(e);
                else if (window.opera) opera.postError(e);
                else GM_log(e);
            }
            setTimeout(LoadExtension, 1000);
        }
        LoadExtension();
    };
    function Inject()
    {
        var Script = document.createElement("script");
        Script.innerHTML = "(" + leoStatsMain.toString() + ")();";
        Script.type = "text/javascript";
        document.getElementsByTagName("head")[0].appendChild(Script);
    }
    Inject();
})();