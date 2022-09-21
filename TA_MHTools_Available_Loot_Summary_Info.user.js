// ==UserScript==
// @name          CnC: MHTools Tiberium Alliances Available Loot Summary + Info
// @description   CROSS SERVERS Loot & troops & bases & distance info.
// @downloadURL   https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_MHTools_Available_Loot_Summary_Info.user.js
// @updateURL     https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_MHTools_Available_Loot_Summary_Info.user.js
// @match      https://*.alliances.commandandconquer.com/*/index.aspx*
// @author        MrHIDEn based on Yaeger & Panavia code. Totaly recoded.
// @contributor   leo7044 (https://github.com/leo7044)
// @contributor   NetquiK (https://github.com/netquik) url res free version
// @version       1.8.3.8
// @grant         none
// ==/UserScript==

(function () {
    var MHLootMain = function () {
        function MHToolsLootCreate() {
            //console.log('MHToolsLootCreate');
            // Classes
            //=======================================================
            //Extending webfrontend.gui.options.OptionsPage with new ManagementOptionsPage
            function OptionsPage() {
                try {
                    qx.Class.define("MHTools.OptionsPage", {
                        type: 'singleton',
                        extend: webfrontend.gui.options.OptionsPage,
                        construct: function () {
                            console.log('Create MHTools.OptionsPage at Loot+Info');
                            this.base(arguments);
                            this.setLabel('MHTools');

                            this.extendOptionsWindow();

                            //Add Content
                            var container = this.getContentContainer();
                            this.tabView = new qx.ui.tabview.TabView();
                            container.add(this.tabView); //, {left:40, top:40});

                            this.removeButtons();
                            this.addPageAbout();
                            console.log('MHTools: OptionsPage loaded.');
                        },
                        statics: {
                            VERSION: '1.0.0',
                            AUTHOR: 'MrHIDEn',
                            CLASS: 'OptionsPage'
                        },
                        members: {
                            pageCreated: null,
                            tabView: null,
                            getTabView: function () {
                                return this.tabView;
                            },
                            addPage: function (name) {
                                var c = this.tabView.getChildren();
                                this.tabView.remove(c[c.length - 1]); //remove PageAbout
                                var page = new qx.ui.tabview.Page(name);
                                page.set({
                                    height: 220
                                });
                                this.tabView.add(page);
                                this.addPageAbout();
                                return page;
                            },
                            addPageAbout: function () {
                                var page = new qx.ui.tabview.Page("About");
                                page.set({
                                    height: 220
                                });
                                this.tabView.add(page);
                                page.setLayout(new qx.ui.layout.VBox());
                                page.add(new qx.ui.basic.Label("<b>MHTools</b>").set({
                                    rich: true
                                })); //, textColor: red
                                page.add(new qx.ui.basic.Label("Created: <span style='color:blue'>2012</span>").set({
                                    rich: true,
                                    marginLeft: 10
                                }));
                                page.add(new qx.ui.basic.Label("Author: <span style='color:blue'><b>MrHIDEn</b></span>").set({
                                    rich: true,
                                    marginLeft: 10
                                }));
                                page.add(new qx.ui.basic.Label("Email: <a href='mailto:mrhiden@outlook.com'>mrhiden@outlook.com</a>").set({
                                    rich: true,
                                    marginLeft: 10
                                }));
                                page.add(new qx.ui.basic.Label("Public: <a href='https://userscripts.org/users/471241'>userscripts.org - MrHIDEn</a></br> ").set({
                                    rich: true,
                                    marginLeft: 10
                                }));
                                page.add(new qx.ui.basic.Label("<b>Scripts:</b>").set({
                                    rich: true,
                                    marginTop: 5
                                }));
                                page.add(new qx.ui.basic.Label("<a href='https://userscripts.org/scripts/show/137978'>Aviable Loot +Info</a>").set({
                                    rich: true,
                                    marginLeft: 10
                                }));
                                page.add(new qx.ui.basic.Label("<a href='https://userscripts.org/scripts/show/135806'>Shortcuts +Coords</a>").set({
                                    rich: true,
                                    marginLeft: 10
                                }));
                                page.add(new qx.ui.basic.Label("<b>Shorten Scripts:</b>").set({
                                    rich: true,
                                    marginTop: 5
                                }));
                                page.add(new qx.ui.basic.Label("<a href='https://userscripts.org/scripts/show/136743'>Coords 500:500</a>").set({
                                    rich: true,
                                    marginLeft: 10
                                }));
                                page.add(new qx.ui.basic.Label("<a href='https://userscripts.org/scripts/show/145657'>Pure Loot summary</a>").set({
                                    rich: true,
                                    marginLeft: 10
                                }));
                                page.add(new qx.ui.basic.Label("<a href='https://userscripts.org/scripts/show/137955'>Login x9 + Logout</a>").set({
                                    rich: true,
                                    marginLeft: 10
                                }));
                            },
                            removeButtons: function () {
                                this.getChildren()[2].removeAll();
                            },
                            getContentContainer: function () {
                                if (!this.contentCnt) {
                                    this.contentCnt = this.getChildren()[0].getChildren()[0];
                                }
                                return this.contentCnt;
                            },
                            extendOptionsWindow: function () {
                                var self = this;
                                if (!webfrontend.gui.options.OptionsWidget.prototype.baseShow) {
                                    webfrontend.gui.options.OptionsWidget.prototype.baseShow = webfrontend.gui.options.OptionsWidget.prototype.show;
                                }
                                webfrontend.gui.options.OptionsWidget.prototype.show = function () {
                                    try {
                                        var tabView = this.clientArea.getChildren()[0];
                                        tabView.add(self);
                                        webfrontend.gui.options.OptionsWidget.prototype.show = webfrontend.gui.options.OptionsWidget.prototype.baseShow;
                                        self.pageCreated = true;
                                        this.show();
                                    } catch (e) {
                                        console.warn("MHTools.OptionsPage.extendOptionsWindow: ", e);
                                    }
                                };
                            }
                        }
                    });
                } catch (e) {
                    console.warn("qx.Class.define(MHTools.OptionsPage: ", e);
                }
            }
            //=======================================================
            try {
                qx.Class.define("MHTools.Loot", {
                    type: 'singleton',
                    extend: qx.core.Object,
                    construct: function () {
                        console.log('Create MHTools.Loot');
                        this.stats.src = "data:image/png;base64,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"; //1.8.0
                        //this.base(arguments);
                        for (var k in this.resPaths) {
                            this.resImages.push(new qx.ui.basic.Image("webfrontend/ui/common/" + this.resPaths[k]).set({
                                Scale: true,
                                Width: 16,
                                Height: 16
                            }));
                        }
                        for (var k in this.troopPaths) {
                            this.troopImages.push(new qx.ui.basic.Image(this.troopPaths[k]).set({
                                Scale: true,
                                Width: 16,
                                Height: 16
                            }));
                        }
                        //this.reloadList();
                        this.lootList.reloadList();
                        //console.log(this.lootList);
                        // extend
                        this.extendOwnBase();
                        this.extendAllianceBase();
                        this.extendForgottenCamp();
                        this.extendForgottenBase();
                        this.extendPlayerBase();
                        //this.extendOptionsWindow();
                        this.extendPOI();
                        this.extendHUB();
                        this.extendHUBServer();
                        this.extendRUIN();
                        this.extendSelectionChange();
                        this.addLootPage();
                        //bypass
                        this.loadBypass();
                        //rdy
                        console.log('MHTools: Loot+Info loaded.');
                    },
                    statics: {
                        VERSION: '1.8.3',
                        AUTHOR: 'MrHIDEn',
                        CLASS: 'Loot',
                        DATA: this.Data
                    },
                    properties: {},
                    members: {
                        // setttings
                        settings: {
                            showLoot: {
                                v: true,
                                d: true,
                                l: 'Shows Loot resources info'
                            },
                            showTroops: {
                                v: false,
                                d: false,
                                l: 'Shows overall Hitpoints for Troops'
                            },
                            showTroopsExtra: {
                                v: false,
                                d: false,
                                l: 'Shows Troops Hitpoints for Vehicles/Aircrafts/Infantry'
                            },
                            showInfo: {
                                v: true,
                                d: true,
                                l: 'Shows HP/HC/DF/CY info'
                            },
                            showColumnCondition: {
                                v: false,
                                d: false,
                                l: 'Shows your progress against DF/CY'
                            },
                            showRepairTime: {
                                v: true,
                                d: true,
                                l: 'Shows Repair Times info for Enemy Base/Camp/Outpost'
                            },
                            showAllyRepairTimeInfo: {
                                v: true,
                                d: true,
                                l: 'Shows Ally/Your Repair Times info'
                            },
                            showLevels: {
                                v: true,
                                d: true,
                                l: 'Shows Levels of Base/Defence/Offence info'
                            },
                            showProd: {
                                v: true,
                                d: true,
                                l: 'Shows Prod of Base'
                            },
                            showColumnLetter: {
                                v: false,
                                d: false,
                                l: 'Shows columns letters for DF/CY position Ex A-1 or E-4. If \'false\' shows only 1 or 4'
                            },
                            showDistance: {
                                v: true,
                                d: true,
                                l: 'Shows distance from selected base to the selected object'
                            }
                        },
                        // pictures
                        stats: document.createElement('img'),
                        resPaths: [
                            "icn_res_research_mission.png",
                            "icn_res_tiberium.png",
                            "icn_res_chrystal.png",
                            "icn_res_dollar.png"
                        ],
                        resImages: [],
                        troopPaths: [
                            "FactionUI/icons/icon_arsnl_off_squad.png", //inf
                            "FactionUI/icons/icon_arsnl_off_vehicle.png", //veh
                            "FactionUI/icons/icon_arsnl_def_building.png", //stu
                            "FactionUI/icons/icon_arsnl_off_plane.png" //air
                          ],
                        troopImages: [],

                        // store v2 - compact
                        //UNDERCONSTRUCTION
                        lootList: {
                            list: {
                                l: [],
                                max: 50, //na
                                idx: 0, //na
                            },
                            storeName: 'MHToolsLootList2',
                            getIndex: function () { //in use
                                var res = -1;
                                try {
                                    var l = this.list.l;
                                    var id = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId();
                                    for (i = 0; i < this.list.max; i++) {
                                        if (typeof (l[i]) == 'undefined') continue;
                                        if (l[i] === null) continue;
                                        if (l[i].id == id) {
                                            res = i;
                                            break;
                                        }
                                    }
                                } catch (e) {
                                    console.warn("save: ", e);
                                }
                                return res;
                            },
                            reloadList: function () { //in use
                                var S = ClientLib.Base.LocalStorage;
                                var l;
                                if (S.get_IsSupported()) l = S.GetItem(this.storeName);
                                if (l !== null) this.list = l;
                                console.log('MHTools: LootList reloaded/created');
                            },
                            save: function (d) { //in use
                                try {
                                    var l = this.list.l;
                                    var id = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId();
                                    var c = {
                                        id: id,
                                        Data: d
                                    };
                                    var S = ClientLib.Base.LocalStorage;
                                    for (var i = 0; i < this.list.max; i++) {
                                        if (typeof (l[i]) == 'undefined') continue;
                                        if (l[i] === null) continue;
                                        if (l[i].id == id) {
                                            // found
                                            l[i] = c;
                                            // JSON
                                            if (S.get_IsSupported()) S.SetItem(this.storeName, this.list);
                                            // done
                                            return;
                                        }
                                    }
                                    // new
                                    l[this.list.idx] = c;
                                    if (++this.list.idx >= this.list.max) this.list.idx = 0;
                                    // JSON
                                    if (S.get_IsSupported()) S.SetItem(this.storeName, this.list);
                                } catch (e) {
                                    console.warn("save: ", e);
                                }
                            },
                            load: function () { //in use
                                try {
                                    var id = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId();
                                    var i = this.getIndex();
                                    if (i >= 0) return this.list.l[i];
                                    return {
                                        id: id,
                                        Data: {}
                                    };
                                } catch (e) {
                                    console.warn("load: ", e);
                                }
                            },
                            store: function (k, d) { //in use
                                try {
                                    var mem = this.load().Data;
                                    mem[k] = d;
                                    this.save(mem);
                                } catch (e) {
                                    console.warn("store: ", e);
                                }
                            },
                            restore: function (k) { //?? not in use
                                console.log('this.lootList.restore');
                                try {
                                    var mem = this.load().Data;
                                    if (typeof (mem[k]) == 'undefined') return 'undefined';
                                    return mem[k];
                                } catch (e) {
                                    console.warn("restore: ", e);
                                }
                            }
                        },
                        // store
                        /*
            // list: [],
            // listStoreName: 'MHToolsLootList',
            // reloadList: function() {
              // var S = ClientLib.Base.LocalStorage;
              // var l;
              // if (S.get_IsSupported()) l = S.GetItem(this.listStoreName);
              // if(l!==null) this.list = l;
              // this.list.max = 50;
              // this.list.idx = 0;
              // for(var i=0;i<this.list.max;i++) {
                // this.list.idx = i;
                // if(typeof(this.list[i])=='undefined') break;
              // }
              // console.log('MHTools: LootList reloaded/created');
            // },
            // getIndex: function() {
              // var l = this.list;
              // var id = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId();
              // //console.log('getIndex id=',id);
              // for(i=0;i<this.list.max;i++) {
                // if(typeof(l[i])=='undefined') continue;
                // if(l[i]===null) continue;
                // if(l[i].id == id) return i;
              // }
              // return -1;
            // },
            // save: function(d) {
            // //TODO some problems with refreshing
              // try {
                // var l = this.list;
                // var id = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId();
                // var c = {id:id, Data:d};
                // var S = ClientLib.Base.LocalStorage;
                // for(var i=0;i<l.max;i++) {
                  // if(typeof(l[i])=='undefined') continue;
                  // if(l[i]===null) continue;
                  // if(l[i].id == id) 
                  // {
                    // // found
                    // l[i] = c;
                    // // JSON
                    // if (S.get_IsSupported()) S.SetItem(this.listStoreName, l);
                    // // done
                    // return;
                  // }
                // }
                // // new
                // l[l.idx] = c;
                // if(++l.idx >= l.max) l.idx = 0;
                // // JSON
                // if (S.get_IsSupported()) S.SetItem(this.listStoreName, l);   
              // } catch (e) {
                // console.warn("save: ", e);
              // }
            // },
            // load: function() {
              // try {
                // var l = this.list;
                // var id = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId();
                // for(var i=0;i<l.max;i++) {
                  // if(typeof(l[i])=='undefined') continue;
                  // if(l[i]===null) continue;
                  // if(l[i].id == id) return l[i];
                // }
                // return {id:id,Data:{}};     
              // } catch (e) {
                // console.warn("load: ", e);
              // }
            // },
            // store: function(k, d) {
              // try {
                // var mem = this.load().Data;
                // mem[k] = d;
                // this.save(mem);        
              // } catch (e) {
                // console.warn("store: ", e);
              // }
            // },
            // restore: function(k) {//?? not in use
              // try {
                // var mem = this.load().Data;
                // if(typeof(mem[k])=='undefined') return 'undefined';
                // return mem[k];    
              // } catch (e) {
                // console.warn("restore: ", e);
              // }
            // },
            */
                        // bases
                        Data: {},
                        // display containers
                        lootWindowPlayer: null,
                        lootWindowBase: null,
                        lootWindowCamp: null,
                        lootWindowOwn: null,
                        lootWindowAlly: null,
                        lootWindowPOI: null,
                        lootWindowRUIN: null,
                        lootWindowHUBServer: null,
                        //waiting: [1,'','.','..','...','...?'],
                        waiting: [1, '>-', '->', '--', '-<', '<-', '??'],
                        Display: {
                            troopsArray: [],
                            lootArray: [],
                            iconArrays: [],
                            infoArrays: [],
                            twoLineInfoArrays: [],
                            distanceArray: []
                        },
                        // HELPERS
                        kMG: function (v) {
                            var t = ['', 'k', 'M', 'G', 'T', 'P'];
                            var i = 0;
                            while (v > 1000 && i < t.length) {
                                v = (v / 1000).toFixed(1);
                                i++;
                            }
                            return v.toString().replace('.', ',') + t[i];
                        },
                        numberFormat: function (val, fixed) {
                            return val.toFixed(fixed).replace('.', ',');
                        },
                        hms: function (s) {
                            var h = Math.floor(s / 3600);
                            s %= 3600;
                            var m = Math.floor(s / 60);
                            s %= 60;
                            var r = (h < 10 ? "0" + h.toString() : h.toString()) + ":";
                            r += (m < 10 ? "0" + m.toString() : m.toString()) + ":";
                            s = s.toFixed(0);
                            r += (s < 10 ? "0" + s.toString() : s.toString());
                            return r;
                        },
                        dhms: function (s) {
                            var d = Math.floor(s / 86400);
                            s %= 86400;
                            var h = Math.floor(s / 3600);
                            s %= 3600;
                            var m = Math.floor(s / 60);
                            s %= 60;
                            var r = (d < 1 ? "" : d.toString() + ":");
                            r += (h < 10 ? "0" + h.toString() : h.toString()) + ":";
                            r += (m < 10 ? "0" + m.toString() : m.toString()) + ":";
                            s = s.toFixed(0);
                            r += (s < 10 ? "0" + s.toString() : s.toString());
                            return r;
                        },
                        dhms2: function (s) {
                            var d = Math.floor(s / 86400);
                            s %= 86400;
                            var h = Math.floor(s / 3600);
                            s %= 3600;
                            var m = Math.floor(s / 60);
                            s %= 60;
                            var r = (d < 1 ? "" : d.toString() + "d "); //  3:01:23:45
                            r += (h < 10 ? "0" + h.toString() : h.toString()) + ":";
                            r += (m < 10 ? "0" + m.toString() : m.toString()) + ":";
                            s = s.toFixed(0);
                            r += (s < 10 ? "0" + s.toString() : s.toString()) + "";
                            return r;
                        },
                        hmsRT: function (city, type) {
                            var nextLevelFlag = false;
                            var s = city.get_CityUnitsData().GetRepairTimeFromEUnitGroup(type, nextLevelFlag);
                            var h = Math.floor(s / 3600);
                            s %= 3600;
                            var m = Math.floor(s / 60);
                            s %= 60;
                            var r = (h < 10 ? "0" + h.toString() : h.toString()) + ":";
                            r += (m < 10 ? "0" + m.toString() : m.toString()) + ":";
                            r += (s < 10 ? "0" + s.toString() : s.toString());
                            return r;
                        },
                        // BYPASS
                        getBypass: function (c, d) {
                            try {
                                function getKeys(obj, d) {
                                    for (var k in obj) {
                                        var o = obj[k];
                                        if (o === null) continue;
                                        if (typeof (o.c) == 'undefined') continue; //count
                                        if (o.c === 0) continue; //empty
                                        if (typeof (o.d) == 'undefined') continue; //data {}
                                        var ks = Object.keys(o.d);
                                        if (ks.length != o.c) continue;
                                        var u = o.d[ks[0]];
                                        if (typeof (u) != 'object') continue;
                                        if (typeof (u.get_UnitLevelRepairRequirements) != 'function') continue;
                                        if (typeof (u.GetUnitGroupType) == 'undefined') {
                                            // buildings
                                            d.Keys.Buildings = k;
                                            //c.GetNumBuildings.toString()==return this.XUQAIB.YYZSYN().c; //YYZSYN()==return this.GBZDQJ; //==this.XUQAIB.GBZDQJ.c
                                        } else {
                                            // units 3-attack
                                            if (u.GetUnitGroupType()) {
                                                d.Keys.Offences = k;
                                            } else {
                                                // units 0-defend
                                                d.Keys.Defences = k;
                                            }
                                        }
                                    }
                                    if (typeof (d.Keys.Buildings) != 'undefined') {
                                        //ClientLib.Data.CityBuildings.prototype.kBuildings = d.Keys.Buildings;
                                        //ClientLib.Data.CityBuildings.prototype.get_Buildings = function(){return this[this.kBuildings];};
                                        ClientLib.Data.City.prototype.kBuildings = d.Keys.Buildings;
                                        ClientLib.Data.City.prototype.get_Buildings = function () {
                                            return this.get_CityBuildingsData()[this.kBuildings];
                                        };
                                    }
                                    if (typeof (d.Keys.Offences) != 'undefined') {
                                        //ClientLib.Data.CityUnits.prototype.kOffenseUnits = d.Keys.Offences;
                                        //ClientLib.Data.CityUnits.prototype.get_OffenseUnits = function(){return this[this.kOffenseUnits];};
                                        ClientLib.Data.City.prototype.kOffenseUnits = d.Keys.Offences;
                                        ClientLib.Data.City.prototype.get_OffenseUnits = function () {
                                            return this.get_CityUnitsData()[this.kOffenseUnits];
                                        };
                                    }
                                    if (typeof (d.Keys.Defences) != 'undefined') {
                                        //ClientLib.Data.CityUnits.prototype.kDefenseUnits = d.Keys.Defences;
                                        //ClientLib.Data.CityUnits.prototype.get_DefenseUnits = function(){return this[this.kDefenseUnits];};
                                        ClientLib.Data.City.prototype.kDefenseUnits = d.Keys.Defences;
                                        ClientLib.Data.City.prototype.get_DefenseUnits = function () {
                                            return this.get_CityUnitsData()[this.kDefenseUnits];
                                        };
                                    }
                                }
                                if (typeof (d.Keys) == 'undefined') d.Keys = {};
                                getKeys(c.get_CityBuildingsData(), d);
                                getKeys(c.get_CityUnitsData(), d);
                                var cnt = Object.keys(d.Keys).length;
                                if (cnt == 3) {
                                    //console.log('MHTools.Loot Helpers are ready');
                                    //console.log('MHTools.Loot Helpers are ready:',d.Keys.Buildings,d.Keys.Defences,d.Keys.Offences);
                                    console.log('MHTools.Loot Helpers are ready:');
                                    console.log(d.Keys);
                                    delete d.Keys;
                                    this.getBypass = function () {
                                        return true;
                                    };
                                    return true;
                                } else console.log('#Keys(!=3): ', cnt);
                            } catch (e) {
                                console.warn("MHTools.Loot.", arguments.callee.name, ': ', e);
                            }
                            //return d.Bypass.Rdy;
                            return false;
                        },
                        loadBypass: function (self) {
                            try {
                                if (typeof (self) == 'undefined') self = this;
                                var ac = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d;
                                if (Object.keys(ac).length < 1) {
                                    window.setTimeout(self.loadBypass, 5000, self); // check again
                                    return;
                                }
                                for (k in ac)
                                    if (self.getBypass(ac[k], self.Data)) break;
                            } catch (e) {
                                console.warn("MHTools.Loot.", arguments.callee.name, ': ', e);
                            }
                        },
                        getData: function (city) {
                            try {
                                var l = {};
                                if (!this.getBypass(city, this.Data)) return l;

                                l.Buildings = city.get_Buildings();
                                l.Defences = city.get_DefenseUnits();
                                l.Offences = city.get_OffenseUnits();

                                l.rdy = true;
                            } catch (e) {
                                console.warn("MHTools.Loot.", arguments.callee.name, ': ', e);
                            }
                            return l;
                        },
                        loadBase: function () {
                            try {
                                if (typeof (this.Data.lastSelectedBaseId) == 'undefined') this.Data.lastSelectedBaseId = -1; //, Bypass: {}};

                                var d = this.Data;

                                d.selectedBaseId = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId();
                                d.selectedOwnBaseId = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCityId();

                                if (d.lastSelectedBaseId !== d.selectedBaseId) d.loaded = false;
                                d.lastSelectedBaseId = d.selectedBaseId;

                                d.IsOwnBase = d.selectedBaseId === d.selectedOwnBaseId;

                                d.cc = ClientLib.Data.MainData.GetInstance().get_Cities();

                                //d.ec = d.cc.GetCity(d.selectedBaseId);// this is very nice function
                                d.ec = d.cc.get_CurrentCity();
                                if (d.ec === null) return false;
                                if (d.ec.get_CityBuildingsData() === null) return false;
                                if (d.ec.get_CityUnitsData() === null) return false;

                                d.oc = d.cc.get_CurrentOwnCity();
                                if (d.oc === null) return false;
                                if (d.oc.get_CityBuildingsData() === null) return false;
                                if (d.oc.get_CityUnitsData() === null) return false;

                                d.ol = this.getData(d.oc);
                                d.el = this.getData(d.ec); // Buildings Defence Offence
                                if (typeof (d.ol) == 'undefined' || Object.keys(d.ol).length === 0) return false;
                                if (typeof (d.el) == 'undefined' || Object.keys(d.el).length === 0) return false;

                                if (d.el.Buildings.c === 0) return false;
                                if (d.ol.Buildings.c === 0) return false;

                                //TEST
                                //console.log('loadBase.el:',d.el);
                                //console.log('loadBase.ol:',d.ol);

                                d.loaded = true;
                                return true;
                            } catch (e) {
                                console.warn("MHTools.Loot.", arguments.callee.name, ': ', e);
                                console.dir("MHTools.Loot.Data: ", this.Data);
                                return false;
                            }
                        },
                        getImportants: function (list) {
                            list.Support = {
                                Condition: '-',
                                Row: '-',
                                Column: '-'
                            };
                            list.CY = {
                                Condition: '-',
                                Row: '-',
                                Column: '-'
                            };
                            list.DF = {
                                Condition: '-',
                                Row: '-',
                                Column: '-'
                            };
                            if (!this.settings.showInfo.v) return;
                            for (var j in list.Buildings.d) {
                                var building = list.Buildings.d[j];
                                var mod = building.get_HitpointsPercent();
                                var id = building.get_MdbUnitId();
                                if (id >= 200 && id <= 205) {
                                    list.Support.Condition = 100 * mod;
                                    list.Support.Row = 8 - parseInt(building.get_CoordY());
                                    list.Support.Column = building.get_CoordX();
                                } else {
                                    switch (id) {
                                        case 112: // CONSTRUCTION YARD
                                        case 151:
                                        case 177:
                                            list.CY.Condition = 100 * mod;
                                            list.CY.Row = 8 - parseInt(building.get_CoordY());
                                            list.CY.Column = building.get_CoordX();
                                            break;
                                        case 158: // DEFENSE FACILITY
                                        case 131:
                                        case 195:
                                            list.DF.Condition = 100 * mod;
                                            list.DF.Row = 8 - parseInt(building.get_CoordY());
                                            list.DF.Column = building.get_CoordX();
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }
                        },
                        getLoots: function (ul, r) {
                            if (typeof (r) == 'undefined') r = {};
                            //console.log('r',r);
                            var t = {
                                1: 'T',
                                2: 'C',
                                3: 'G',
                                6: 'RP',
                                7: 'RCB',
                                8: 'RCA',
                                9: 'RCI',
                                10: 'RCV'
                            }; //translate, ClientLib.Base.EResourceType.XXX
                            for (var j in ul.d) {
                                var u = ul.d[j]; // unit/building
                                //here are key infos about units ranges and behavior and more
                                //console.log(u.get_UnitGameData_Obj().n,u.get_UnitGameData_Obj());// unit/building
                                var p = u.get_HitpointsPercent(); // 0-1 , 1 means 100%
                                var cl = u.get_UnitLevelRepairRequirements(); // EA API Resources/Repair Costs
                                for (var i in cl) {
                                    var c = cl[i]; //Requirement/Cost
                                    if (typeof (c) != 'object') continue;
                                    var k = (typeof (t[c.Type]) == 'undefined') ? c.Type : t[c.Type]; //translate if possible
                                    if (typeof (r[k]) == 'undefined') r[k] = 0; //add branch
                                    r[k] += p * c.Count;
                                }
                            }
                            return r;
                        },
                        calcResources: function () {
                            try {
                                if (!this.settings.showLoot.v) return;

                                if (!this.Data.loaded) return;

                                this.Display.lootArray = [];

                                var el = this.Data.el;
                                var ec = this.Data.ec;

                                var loots = {
                                    RP: 0,
                                    T: 0,
                                    C: 0,
                                    G: 0
                                }; //for getLoots

                                this.getLoots(el.Buildings, loots);
                                this.getLoots(el.Defences, loots);

                                if (el.Offences.c > 0) {
                                    var off = this.getLoots(el.Offences);
                                    //console.log('Offences: ',off);
                                }

                                this.Display.lootArray[0] = loots.RP;
                                this.Display.lootArray[1] = loots.T;
                                this.Display.lootArray[2] = loots.C;
                                this.Display.lootArray[3] = loots.G;

                                this.lootList.store('lootArray', this.Display.lootArray);
                            } catch (e) {
                                console.warn("MHTools.Loot.calcResources: ", e);
                                console.dir("MHTools.Loot.~.Data:", this.Data);
                            }
                        },
                        calcTroops: function () {
                            try {
                                if (!this.settings.showTroops.v) return;

                                if (!this.Data.loaded) return;

                                var troops = [0, 0, 0, 0, 0];

                                var el = this.Data.el;

                                // enemy defence units
                                for (var j in el.Defences.d) {
                                    var unit = el.Defences.d[j];
                                    var current_hp = unit.get_Health(); //EA API
                                    troops[0] += current_hp;
                                    if (this.settings.showTroopsExtra.v) {
                                        switch (unit.get_UnitGameData_Obj().mt) { //keyTroop // TODO check .mt
                                            case ClientLib.Base.EUnitMovementType.Feet:
                                                troops[1] += current_hp;
                                                break;
                                            case ClientLib.Base.EUnitMovementType.Track:
                                            case ClientLib.Base.EUnitMovementType.Wheel:
                                                troops[2] += current_hp;
                                                break;
                                            case ClientLib.Base.EUnitMovementType.Structure:
                                                troops[3] += current_hp;
                                                break;
                                            case ClientLib.Base.EUnitMovementType.Air:
                                            case ClientLib.Base.EUnitMovementType.Air2:
                                                troops[4] += current_hp;
                                                break;
                                        }
                                    }
                                }
                                this.Display.troopsArray = troops;
                                this.lootList.store('troopsArray', this.Display.troopsArray);
                            } catch (e) {
                                console.warn("MHTools.Loot.calcTroops: ", e);
                                console.dir("MHTools.Loot.~.Data:", this.Data);
                            }
                        },
                        calcInfo: function () {
                            this.Display.infoArrays = [];
                            this.Display.twoLineInfoArrays = [];

                            if (!this.Data.loaded) return;

                            var hp;
                            var t;

                            //var cc = this.Data.cc;
                            var oc = this.Data.oc;
                            var ec = this.Data.ec;

                            var ol = this.Data.ol;
                            var el = this.Data.el;

                            if (this.settings.showInfo.v) {
                                try {
                                    var ohp = 0,
                                        dhp = 0;
                                    for (var k in ol.Offences.d) ohp += ol.Offences.d[k].get_Health(); //own of units
                                    for (var k in el.Defences.d) dhp += el.Defences.d[k].get_Health(); //ene df units

                                    // find CY & DF row/line
                                    this.getImportants(el);

                                    hp = {};
                                    hp.name = '<b>Info</b> (HP,HC - D/O ratio. Row.)';
                                    hp.lbs = ['HP:', 'HC:', 'DF:', 'CY:'];
                                    t = [];
                                    t.push(this.numberFormat(dhp / ohp, 2));
                                    t.push(this.numberFormat(ec.get_TotalDefenseHeadCount() / oc.get_TotalOffenseHeadCount(), 2));
                                    var abc = "ABCDEFGHI"; //abc[column]
                                    if (this.settings.showColumnLetter.v) {
                                        if (el.DF !== undefined) {
                                            t.push(abc[el.DF.Column] + '-' + el.DF.Row);
                                        } else {
                                            t.push('??');
                                        }
                                        if (el.CY !== undefined) {
                                            t.push(abc[el.CY.Column] + '-' + el.CY.Row);
                                        } else {
                                            t.push('??');
                                        }
                                    } else {
                                        if (el.DF !== undefined) {
                                            t.push(el.DF.Row);
                                        } else {
                                            t.push('??');
                                        }
                                        if (el.CY !== undefined) {
                                            t.push(el.CY.Row);
                                        } else {
                                            t.push('??');
                                        }
                                    }
                                    hp.val = t;
                                    this.Display.infoArrays.push(hp);
                                    // store
                                    this.lootList.store('infoArrays', this.Display.infoArrays);
                                } catch (e) {
                                    console.log("MHTools.Loot.calcInfo 1: ", e);
                                }
                            }
                            if (this.settings.showColumnCondition.v) {
                                try {
                                    var bl = el.Buildings.d;
                                    var dl = el.Defences.d;

                                    for (var k in bl) {
                                        var b = bl[k];
                                        if (b.get_TechName() == ClientLib.Base.ETechName.Defense_Facility) df = b;
                                        if (b.get_TechName() == ClientLib.Base.ETechName.Construction_Yard) cy = b;
                                    }

                                    var tb;
                                    var tbhp;
                                    var cnt;
                                    var mi;
                                    var ma;
                                    var dc;

                                    // CY
                                    tb = cy;
                                    cnt = 0;
                                    tbhp = 0;
                                    dc = 1;
                                    mi = tb.get_CoordX() - dc;
                                    ma = tb.get_CoordX() + dc;
                                    // scan
                                    for (var k in bl) {
                                        var o = bl[k];
                                        if (o.get_CoordX() >= mi && o.get_CoordX() <= ma) {
                                            if (o.get_CoordY() >= tb.get_CoordY()) {
                                                cnt++;
                                                tbhp += o.get_HitpointsPercent();
                                            }
                                        }
                                    }
                                    for (var k in dl) {
                                        var o = dl[k];
                                        //if(o.get_CoordX() == tb.get_CoordX()) {
                                        if (o.get_CoordX() >= mi && o.get_CoordX() <= ma) {
                                            if (o.get_CoordY() >= tb.get_CoordY()) {
                                                cnt++;
                                                tbhp += o.get_HitpointsPercent();
                                            }
                                        }
                                    }
                                    tbhp = 100 * tbhp / cnt;
                                    var cyhp = tbhp;

                                    // DF
                                    var dfhp = 0
                                    if (typeof df != 'undefined'){
                                    tb = df;
                                    cnt = 0;
                                    tbhp = 0;
                                    dc = 1;
                                    mi = tb.get_CoordX() - dc;
                                    ma = tb.get_CoordX() + dc;
                                    for (var k in bl) {
                                        var o = bl[k];
                                        if (o.get_CoordX() >= mi && o.get_CoordX() <= ma) {
                                            if (o.get_CoordY() >= tb.get_CoordY()) {
                                                cnt++;
                                                tbhp += o.get_HitpointsPercent();
                                            }
                                        }
                                    }
                                    for (var k in dl) {
                                        var o = dl[k];
                                        if (o.get_CoordX() >= mi && o.get_CoordX() <= ma) {
                                            if (o.get_CoordY() >= tb.get_CoordY()) {
                                                cnt++;
                                                tbhp += o.get_HitpointsPercent();
                                            }
                                        }
                                    }
                                    tbhp = 100 * tbhp / cnt;
                                    dfhp = tbhp;
                                }

                                    hp = {};
                                    hp.name = '<b>CY & DF column HP [%]</b>';
                                    hp.lbs = ['CY:', 'DF:'];
                                    t = [];
                                    t.push(this.numberFormat(cyhp, 0));
                                    t.push(this.numberFormat(dfhp, 0));
                                    hp.val = t;
                                    this.Display.infoArrays.push(hp);
                                    //this.Display.twoLineInfoArrays.push(hp);
                                    // store
                                    this.lootList.store('infoArrays', this.Display.infoArrays);
                                } catch (e) {
                                    console.log("MHTools.Loot.calcInfo 2: ", e);
                                }
                            }
                            if (this.settings.showRepairTime.v) {
                                try {
                                    var a = oc.get_CityUnitsData().GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Aircraft, false); //false // RT Defense
                                    var v = oc.get_CityUnitsData().GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Vehicle, false); //false // RT Defense
                                    var i = oc.get_CityUnitsData().GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Infantry, false); //false // RT Defense
                                    var m = Math.max(a, v, i);

                                    var aa = oc.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeAir);
                                    var av = oc.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeVeh);
                                    var ai = oc.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeInf);
                                    var am = Math.min(aa, av, ai);

                                    var ohp = 0;
                                    //CHECK
                                    //my
                                    //for (var k in ol.Offences.d) ohp += ol.Offences.d[k].get_HitpointsPercent();//0-1 means 0-100%
                                    //ohp = 100.0 * ohp / ol.Offences.c;
                                    //console.log('Health',ohp,oc.GetOffenseConditionInPercent());
                                    //ohp = this.numberFormat(ohp, 0);
                                    //ea
                                    ohp = oc.GetOffenseConditionInPercent();

                                    var ool = this.numberFormat(oc.get_LvlOffense(), 1);
                                    //console.log('oc',oc,'oc.get_LvlOffense()',oc.get_LvlOffense());

                                    hp = {};
                                    hp.name = '<b>Repair time (Your offence)</b>';
                                    hp.lbs = ['Maximum:', 'Available:', 'Health:', 'Level:'];
                                    t = [];
                                    t.push(this.hms(m));
                                    t.push(this.hms(am));
                                    t.push(ohp);
                                    t.push(ool);
                                    hp.val = t;
                                    //this.Display.infoArrays.push(hp);
                                    this.Display.twoLineInfoArrays.push(hp);
                                    // store
                                    this.lootList.store('twoLineInfoArrays', this.Display.twoLineInfoArrays);
                                } catch (e) {
                                    console.log("MHTools.Loot.calcInfo 3: ", e);
                                }
                            }
                        },
                        calcFriendlyInfo: function () {
                            this.Display.twoLineInfoArrays = [];
                            if (!this.settings.showLevels.v && !this.settings.showAllyRepairTimeInfo.v) return;

                            try {
                                if (!this.Data.loaded) return;


                                //var cc = this.Data.cc;
                                var oc = this.Data.oc;
                                var ec = this.Data.ec;

                                var ol = this.Data.ol;
                                var el = this.Data.el;

                                var IsOwn = this.Data.IsOwnBase;



                                if (this.settings.showLevels.v) {
                                    var sd = ec.get_SupportData();
                                    var sn;
                                    var sl;
                                    if (sd !== null) {
                                        sl = sd.get_Level();
                                        sn = ec.get_SupportWeapon().dn;
                                    }

                                    hp = {};
                                    hp.name = '<b>Levels</b>';
                                    hp.lbs = ['Base:', 'Defence:', 'Offence:', 'Support:'];
                                    t = [];
                                    if (el.Buildings.c > 0) t.push(this.numberFormat(ec.get_LvlBase(), 2));
                                    else t.push('--');
                                    if (el.Defences.c > 0) t.push(this.numberFormat(ec.get_LvlDefense(), 2));
                                    else t.push('--');
                                    if (el.Offences.c > 0) t.push(this.numberFormat(ec.get_LvlOffense(), 2));
                                    else t.push('--');
                                    if (sd !== null) t.push(this.numberFormat(sl, 0));
                                    else t.push('--');
                                    hp.val = t;
                                    this.Display.twoLineInfoArrays.push(hp);
                                }
                                if (this.settings.showProd.v) {
                                    hp = {};
                                    hp.name = '<b>Production</b>';
                                    hp.lbs = ['Tiberium:', 'Crystal:', 'Power:', 'Credits:'];
                                    t = [];
                                    t.push(parseInt(ec.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Tiberium, true, true)).toLocaleString());
                                    t.push(parseInt(ec.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Crystal, true, true)).toLocaleString());
                                    t.push(parseInt(ec.GetResourceGrowPerHour(ClientLib.Base.EResourceType.Power, true, true)).toLocaleString());
                                    t.push(parseInt(ClientLib.Base.Resource.GetResourceGrowPerHour(ec.get_CityCreditsProduction(), true)).toLocaleString());
                                    hp.val = t;
                                    this.Display.twoLineInfoArrays.push(hp);
                                }
                                if (this.settings.showAllyRepairTimeInfo.v) {

                                    var a = ec.get_CityUnitsData().GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Aircraft, false); //false // RT Defense
                                    var v = ec.get_CityUnitsData().GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Vehicle, false); //false // RT Defense
                                    var i = ec.get_CityUnitsData().GetRepairTimeFromEUnitGroup(ClientLib.Data.EUnitGroup.Infantry, false); //false // RT Defense
                                    var m = Math.max(a, v, i);

                                    var aa = ec.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeAir);
                                    var av = ec.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeVeh);
                                    var ai = ec.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeInf);
                                    var am = Math.min(aa, av, ai);

                                    var ofl;
                                    var ohp = 0;
                                    if (el.Offences.c > 0) {
                                        //my
                                        //for (var k in el.Offences.d) ohp += el.Offences.d[k].get_HitpointsPercent();//get_Health();//Health - hitpoints
                                        //ohp = 100.0 * ohp / el.Offences.c;
                                        //console.log('Health',ohp,ec.GetOffenseConditionInPercent());
                                        //ohp = this.numberFormat(ohp, 0);
                                        //ea
                                        ohp = ec.GetOffenseConditionInPercent();
                                        //ohp = ec.GetOffenseConditionInPercent();//GetOffenseConditionInPercent ()
                                        ofl = this.numberFormat(ec.get_LvlOffense(), 2);
                                        //console.log('ec',ec,'ec.get_LvlOffense()',ec.get_LvlOffense());
                                    } else {
                                        ohp = '---';
                                        ofl = '---';
                                    }

                                    hp = {};
                                    hp.name = IsOwn ? '<b>Repair time (Your offence)</b>' : '<b>Repair time (Ally offence)</b>';
                                    hp.lbs = ['Maximum:', 'Available:', 'Health:', 'Level:'];
                                    t = [];
                                    t.push(this.hms(m));
                                    //t.push('---');
                                    t.push(this.hms(am));
                                    t.push(ohp);
                                    t.push(ofl);
                                    hp.val = t;
                                    this.Display.twoLineInfoArrays.push(hp);
                                }
                                //this.Display.twoLineInfoArrays = twoLineInfoArrays;
                                this.lootList.store('twoLineInfoArrays', this.Display.twoLineInfoArrays);
                            } catch (e) {
                                console.warn("MHTools.Loot.calcFriendlyInfo: ", e);
                            }
                        },
                        calcDistance: function () {
                            this.Display.distanceArray = [];

                            if (!this.settings.showDistance.v) return;
                            //console.log('calcDistance');
                            try {
                                var visObject = ClientLib.Vis.VisMain.GetInstance().get_SelectedObject();
                                if (visObject != null) // && visObject.get_VisObjectType() == ClientLib.Vis.VisObject.EObjectType.RegionCityType)
                                {
                                    //if (this.Data === null) this.Data = {};
                                    var t = visObject.get_VisObjectType();

                                    var LObjectType = [];
                                    for (k in ClientLib.Vis.VisObject.EObjectType)
                                        LObjectType[ClientLib.Vis.VisObject.EObjectType[k]] = k;
                                    //console.log('Vis Object Type:',t,', ',LObjectType[t]);

                                    var oc = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity();
                                    switch (t) {
                                        /* RegionCityType
                    RegionSuperWeaponType
                    RegionTerrainType
                    RegionMoveTarget
                    RegionFreeSlotType
                    RegionNPCBase
                    RegionNPCCamp
                    RegionPointOfInterest
                    RegionRuin
                    RegionGhostCity
                    RegionNewPlayerSpot
                    RegionHub  */
                                        case ClientLib.Vis.VisObject.EObjectType.RegionCityType:
                                        case ClientLib.Vis.VisObject.EObjectType.RegionNPCBase:
                                        case ClientLib.Vis.VisObject.EObjectType.RegionNPCCamp:
                                        case ClientLib.Vis.VisObject.EObjectType.RegionPointOfInterest:
                                        case ClientLib.Vis.VisObject.EObjectType.RegionRuin:
                                            //var city = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity();
                                            //var pixelX = visObject.get_X();
                                            //var pixelY = visObject.get_Y();
                                            var ser = ClientLib.Data.MainData.GetInstance().get_Server();
                                            var ecX = visObject.get_RawX();
                                            var ecY = visObject.get_RawY();
                                            var ocX = oc.get_X();
                                            var ocY = oc.get_Y();
                                            var cenX = ser.get_ContinentWidth() / 2;
                                            var cenY = ser.get_ContinentHeight() / 2;

                                            var dis = ClientLib.Base.Util.CalculateDistance(ocX, ocY, ecX, ecY);
                                            var cen = ClientLib.Base.Util.CalculateDistance(cenX, cenY, ecX, ecY);
                                            var cdt = oc.GetCityMoveCooldownTime(ecX, ecY); //cool down time
                                            var stp = dis / 20; //steps
                                            this.Data.Distance = dis;
                                            //console.log('Distance:',dis,'EMT:',this.dhms2(cdt),'Steps:',stp);
                                            hp = {};
                                            hp.name = '<b>Movement</b>';
                                            hp.lbs = ['Distance:', 'EMT:', 'Steps:', 'To center:'];
                                            t = [];
                                            t.push(dis);
                                            t.push(this.dhms2(cdt));
                                            t.push(stp);
                                            t.push(cen);
                                            hp.val = t;
                                            this.Display.distanceArray.push(hp);
                                            //NOTE
                                            //ClientLib.Vis.VisMain.GetInstance().GetObjectFromPosition
                                            //ClientLib.Data.WorldSector.WorldObject GetObjectFromPosition (System.Int32 x ,System.Int32 y)
                                            //ClientLib.Vis.City.CityObject GetObjectFromPosition (System.Single x ,System.Single y)
                                            //ClientLib.Vis.Region.RegionObject GetObjectFromPosition (System.Single x ,System.Single y)
                                            //ClientLib.Vis.VisObject GetObjectFromPosition (System.Single x ,System.Single y)
                                            //ClientLib.Data.Hub GetObjectFromPosition (System.Int32 x ,System.Int32 y)
                                            break;
                                        default:
                                            break;
                                    }
                                }
                                //DISABLED this.lootList.store('distanceArray',this.Display.distanceArray);
                            } catch (e) {
                                console.warn("MHTools.Loot.calcDistance: ", e);
                            }
                        },
                        onSelectionChange: function (last, curr) {
                            //return;
                            try {
                                //
                                //TODO I rather move this to calcDistance and call it from extended widgets.
                                //

                                //ClientLib.Vis.SelectionChange
                                //console.clear();
                                //console.log('onSelectionChange, curr:',curr);
                                var visObject = ClientLib.Vis.VisMain.GetInstance().get_SelectedObject();
                                if (visObject != null) {
                                    var t = visObject.get_VisObjectType();
                                    //ClientLib.Vis.VisObject.EObjectType
                                    var LObjectType = [];
                                    for (k in ClientLib.Vis.VisObject.EObjectType)
                                        LObjectType[ClientLib.Vis.VisObject.EObjectType[k]] = k;
                                    console.log('Vis Object Type:', t, ', ', LObjectType[t]);
                                    //window.MHTools.visObject = visObject;
                                    this.Data.visObject = visObject;
                                    /* NOTE
                  UnknownType
                  CityBuildingType
                  CityResourceFieldType
                  CityWallType
                  RegionCityType
                  RegionSuperWeaponType
                  RegionTerrainType
                  BattlegroundUnit
                  ArmyUnitType
                  ArmyDismissArea
                  DefenseUnitType
                  DefenseTerrainFieldType
                  RegionMoveTarget
                  RegionFreeSlotType
                  RegionNPCBase
                  RegionNPCCamp
                  RegionPointOfInterest
                  RegionRuin
                  RegionGhostCity
                  RegionNewPlayerSpot
                  DefenseTerrainFieldAdditionalSlosType
                  DefenseOffScreenUnit
                  WorldObject
                  WorldMapMarker
                  RegionHub
                   */
                                    switch (t) {
                                        /* NOTE
                    RegionCityType
                    RegionSuperWeaponType
                    RegionTerrainType
                    RegionMoveTarget
                    RegionFreeSlotType
                    RegionNPCBase
                    RegionNPCCamp
                    RegionPointOfInterest
                    RegionRuin
                    RegionGhostCity
                    RegionNewPlayerSpot
                    RegionHub  */
                                        // case ClientLib.Vis.VisObject.EObjectType.RegionCityType:
                                        // case ClientLib.Vis.VisObject.EObjectType.RegionNPCBase:
                                        // case ClientLib.Vis.VisObject.EObjectType.RegionNPCCamp:
                                        // case ClientLib.Vis.VisObject.EObjectType.RegionPointOfInterest:
                                        // case ClientLib.Vis.VisObject.EObjectType.RegionRuin:
                                        // this.calcDistance();
                                        // break;
                                        // TEST
                                        case ClientLib.Vis.VisObject.EObjectType.RegionHub:
                                            //console.log('Vis Object Type:',t,', ',LObjectType[t],visObject);
                                            //console.log(visObject.get_BuildingName());
                                            //window.visObject = visObject;
                                            break;
                                            // // TEST
                                            // case ClientLib.Vis.VisObject.EObjectType.DefenseUnitType:
                                            // console.log('Vis Object Type:',t,', ',LObjectType[t],visObject);
                                            // console.log(visObject.get_BuildingName());
                                            // window.visObject = visObject;
                                            // break;
                                            // // TEST
                                            // case ClientLib.Vis.VisObject.EObjectType.CityBuildingType:
                                            // console.log('Vis Object Type:',t,', ',LObjectType[t],visObject);
                                            // console.log(visObject.get_BuildingName());
                                            // window.visObject = visObject;
                                            // break;
                                        default:
                                            break;
                                    }
                                }
                            } catch (e) {
                                console.warn('MHTools.Loot.onSelectionChange: ', e);
                            }
                        },
                        extendSelectionChange: function () {
                            return; //disabled
                            //webfrontend.Util.attachNetEvent(/*instance of object which calls the event*/, /*name of the event*/, /*type of the event*/, /*context object*/, /*callback function*/);
                            webfrontend.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance(), "SelectionChange", ClientLib.Vis.SelectionChange, this, this.onSelectionChange);
                        },
                        restoreDisplay: function () {
                            //var idx = this.getIndex();
                            var idx = this.lootList.getIndex();
                            if (idx > -1) {
                                var d = this.lootList.list.l[idx].Data;
                                var da = this.Display.distanceArray;
                                this.Display = {};
                                for (var k in d) this.Display[k] = d[k];
                                this.Display.distanceArray = da;
                                return true;
                            }
                            return false;
                        },
                        // DISPLAY data
                        addLoadingLabel: function (widget) {
                            //console.log('addLoadingLabel');
                            try {
                                widget.removeAll();
                                var r = 0,
                                    c = 0;
                                var a;

                                // DISTANCE
                                //console.log('DISTANCE');
                                a = this.Display.distanceArray;
                                if (typeof (a) != 'undefined' && a.length > 0) {
                                    for (var i in this.Display.distanceArray) {
                                        c = 0;
                                        widget.add(new qx.ui.basic.Label(this.Display.distanceArray[i].name).set({
                                            width: 230,
                                            rich: true,
                                            allowGrowX: true
                                        }), {
                                            row: r++,
                                            column: c,
                                            colSpan: 6
                                        });
                                        c = 1;
                                        for (var j in this.Display.distanceArray[i].lbs) {
                                            widget.add(new qx.ui.basic.Label(this.Display.distanceArray[i].lbs[j]), {
                                                row: r,
                                                column: c
                                            });
                                            widget.add(new qx.ui.basic.Label(this.Display.distanceArray[i].val[j]), {
                                                row: r + 1,
                                                column: c
                                            });
                                            c += 2;
                                        }
                                        r += 2;
                                    }
                                }

                                // AWAITING
                                //console.log('AWAITING');
                                // a = this.Data.Distance;
                                // if(typeof(a)!='undefined' && a<=10) {
                                c = 0;
                                var w = this.waiting[this.waiting[0]];
                                if (++this.waiting[0] >= this.waiting.length) this.waiting[0] = 1;
                                //if (this.settings.showLoot.v) widget.add(new qx.ui.basic.Label('<b>Lootable Resources</b>').set({width: 230, rich: true, allowGrowX: true}), {row: r++,column: c, colSpan: 6});
                                widget.add(new qx.ui.basic.Label('Transmission ' + w).set({
                                    rich: true
                                }), {
                                    row: r++,
                                    column: c,
                                    colSpan: 6
                                }); //, allowGrowX: true, colSpan: 6
                                // } else {
                                // c=0;
                                // widget.add(new qx.ui.basic.Label('<span style="color:yellow">Base is out of range.</span>').set({width: 230, rich: true, allowGrowX: true}), {row: r++,column: c, colSpan: 6});//, allowGrowX: true
                                // }
                            } catch (e) {
                                console.warn('MHTools.Loot.addLoadingLabel: ', e);
                            }
                        },
                        addResourcesLabel: function (widget) {
                            //console.log('addResourcesLabel');
                            try {
                                widget.removeAll();
                                var r = 0,
                                    c = 0;
                                var hp;
                                var a;

                                // DISTANCE
                                a = this.Display.distanceArray;
                                if (typeof (a) != 'undefined' && a.length > 0) {
                                    for (var i in this.Display.distanceArray) {
                                        c = 0;
                                        widget.add(new qx.ui.basic.Label(this.Display.distanceArray[i].name).set({
                                            width: 200,
                                            rich: true,
                                            allowGrowX: true
                                        }), {
                                            row: r++,
                                            column: c,
                                            colSpan: 6
                                        });
                                        c = 1;
                                        for (var j in this.Display.distanceArray[i].lbs) {
                                            widget.add(new qx.ui.basic.Label(this.Display.distanceArray[i].lbs[j]), {
                                                row: r,
                                                column: c
                                            });
                                            widget.add(new qx.ui.basic.Label(this.Display.distanceArray[i].val[j]), {
                                                row: r + 1,
                                                column: c
                                            });
                                            c += 2;
                                        }
                                        r += 2;
                                    }
                                }

                                // LOOT
                                if (this.settings.showLoot.v) {
                                    a = this.Display.lootArray;
                                    if (typeof (a) != 'undefined' && a.length > 0) {
                                        hp = {};
                                        hp.name = '<b>Lootable Resources</b>';
                                        hp.img = this.resImages;
                                        t = [];
                                        t.push(this.Display.lootArray[0]); //Research 6
                                        t.push(this.Display.lootArray[1]); //Tiberium 1
                                        t.push(this.Display.lootArray[2]); //Crystal 2
                                        t.push(this.Display.lootArray[3]); //Credits 3
                                        hp.val = t;
                                        //iconArrays.push(hp);  //store !!

                                        // draw icon's info
                                        c = 0;
                                        widget.add(new qx.ui.basic.Label(hp.name).set({
                                            width: 200,
                                            rich: true
                                        }), {
                                            row: r++,
                                            column: c,
                                            colSpan: 6
                                        });
                                        //console.log('A) i',i);
                                        for (var j in hp.val) {
                                            //console.log('B) i',i,'j',j);
                                            widget.add(hp.img[j], {
                                                row: r,
                                                column: c++
                                            });
                                            widget.add(new qx.ui.basic.Label(this.kMG(hp.val[j])).set({
                                                textAlign: 'left'
                                            }), {
                                                row: r,
                                                column: c++
                                            });
                                        }
                                        r++;
                                    }
                                }

                                // TROOP
                                if (this.settings.showTroops.v) { //to do
                                    a = this.Display.troopsArray;
                                    if (typeof (a) != 'undefined' && a.length > 0) {
                                        hp = {};
                                        hp.name = '<b>Troop Strength</b>';
                                        hp.img = this.troopImages;
                                        t = [];
                                        t.push(this.Display.troopsArray[0]);
                                        if (this.settings.showTroopsExtra.v) {
                                            t.push(this.Display.troopsArray[1]); //inf
                                            t.push(this.Display.troopsArray[2]); //veh
                                            t.push(this.Display.troopsArray[3]); //stu
                                            //t.push(this.Display.troopsArray[4]);//air
                                        }
                                        hp.val = t;
                                        // draw icon's info
                                        c = 0;
                                        widget.add(new qx.ui.basic.Label(hp.name).set({
                                            width: 200,
                                            rich: true
                                        }), {
                                            row: r++,
                                            column: c,
                                            colSpan: 6
                                        });
                                        widget.add(new qx.ui.basic.Label(this.kMG(hp.val[0])).set({
                                            textAlign: 'left'
                                        }), {
                                            row: r,
                                            column: c++
                                        });
                                        //console.log('A) i',i);
                                        c = 2;
                                        for (var j = 1; j < hp.val.length; j++) {
                                            //console.log('B) i',i,'j',j);
                                            widget.add(hp.img[j - 1], {
                                                row: r,
                                                column: c++
                                            });
                                            widget.add(new qx.ui.basic.Label(this.kMG(hp.val[j])).set({
                                                textAlign: 'left'
                                            }), {
                                                row: r,
                                                column: c++
                                            });
                                        }
                                        r++;
                                    }
                                }

                                // INFO
                                a = this.Display.infoArrays;
                                if (typeof (a) != 'undefined' && a.length > 0) {
                                    for (var i in this.Display.infoArrays) {
                                        c = 0;
                                        widget.add(new qx.ui.basic.Label(this.Display.infoArrays[i].name).set({
                                            width: 200,
                                            rich: true
                                        }), {
                                            row: r++,
                                            column: c,
                                            colSpan: 6
                                        });
                                        c = 1;
                                        for (var j in this.Display.infoArrays[i].lbs) {
                                            widget.add(new qx.ui.basic.Label(this.Display.infoArrays[i].lbs[j] + ' ' + this.Display.infoArrays[i].val[j]), {
                                                row: r,
                                                column: c
                                            });
                                            c += 2;
                                        }
                                        r++;
                                    }
                                }

                                // 2 lines INFO
                                a = this.Display.twoLineInfoArrays;
                                if (typeof (a) != 'undefined' && a.length > 0) {
                                    for (var i in this.Display.twoLineInfoArrays) {
                                        c = 0;
                                        widget.add(new qx.ui.basic.Label(this.Display.twoLineInfoArrays[i].name).set({
                                            width: 200,
                                            rich: true
                                        }), {
                                            row: r++,
                                            column: c,
                                            colSpan: 6
                                        });
                                        c = 1;
                                        for (var j in this.Display.twoLineInfoArrays[i].lbs) {
                                            widget.add(new qx.ui.basic.Label(this.Display.twoLineInfoArrays[i].lbs[j]), {
                                                row: r,
                                                column: c
                                            });
                                            widget.add(new qx.ui.basic.Label(this.Display.twoLineInfoArrays[i].val[j]), {
                                                row: r + 1,
                                                column: c
                                            });
                                            c += 2;
                                        }
                                        r += 2;
                                    }
                                }

                            } catch (e) {
                                console.warn('MHTools.Loot.addResourcesLabel(): ', e);
                            }
                        },
                        addFriendlyLabel: function (widget) {
                            //console.log('addFriendlyLabel');
                            try {
                                widget.removeAll();
                                var a;
                                var r = 0,
                                    c = 0;

                                // DISTANCE
                                a = this.Display.distanceArray;
                                if (typeof (a) != 'undefined' && a.length > 0) {
                                    for (var i in this.Display.distanceArray) {
                                        c = 0;
                                        widget.add(new qx.ui.basic.Label(this.Display.distanceArray[i].name).set({
                                            width: 200,
                                            rich: true
                                        }), {
                                            row: r++,
                                            column: c,
                                            colSpan: 6
                                        });
                                        c = 1;
                                        for (var j in this.Display.distanceArray[i].lbs) {
                                            widget.add(new qx.ui.basic.Label(this.Display.distanceArray[i].lbs[j]), {
                                                row: r,
                                                column: c
                                            });
                                            widget.add(new qx.ui.basic.Label(this.Display.distanceArray[i].val[j]), {
                                                row: r + 1,
                                                column: c
                                            });
                                            c += 2;
                                        }
                                        r += 2;
                                    }
                                }

                                // 2 lines INFO
                                a = this.Display.twoLineInfoArrays;
                                if (typeof (a) != 'undefined' && a.length > 0) {
                                    c = 0;
                                    for (var i in this.Display.twoLineInfoArrays) {
                                        c = 0;
                                        widget.add(new qx.ui.basic.Label(this.Display.twoLineInfoArrays[i].name).set({
                                            width: 200,
                                            rich: true
                                        }), {
                                            row: r++,
                                            column: c,
                                            colSpan: 6
                                        });
                                        c = 1;
                                        for (var j in this.Display.twoLineInfoArrays[i].lbs) {
                                            widget.add(new qx.ui.basic.Label(this.Display.twoLineInfoArrays[i].lbs[j]), {
                                                row: r,
                                                column: c
                                            });
                                            widget.add(new qx.ui.basic.Label(this.Display.twoLineInfoArrays[i].val[j]), {
                                                row: r + 1,
                                                column: c
                                            });
                                            c += 2;
                                        }
                                        r += 2;
                                    }
                                }

                            } catch (e) {
                                console.warn('MHTools.Loot.addFriendlyLabel: ', e);
                            }
                        },
                        // EXTEND UI
                        /* NOTE
            RegionCityMenu
            RegionCityFoundInfo
            RegionGhostStatusInfo
            RegionCityStatusInfo
            RegionNPCBaseStatusInfo
            RegionHubStatusInfo
            RegionPointOfInterestStatusInfo
            RegionCityStatusInfoEnemy
            RegionCityList
            RegionCityInfo
            RegionNewPlayerSpotStatusInfo
            RegionRuinStatusInfo
            RegionCityStatusInfoOwn
            RegionCitySupportInfo
            RegionCityStatusInfoAlliance
            RegionCityMoveInfo
            RegionNPCCampStatusInfo
            */
                        extendOwnBase: function () { // BASE - Own
                            var self = this;
                            if (!webfrontend.gui.region.RegionCityStatusInfoOwn.prototype.__mhloot_showLootOwnBase) {
                                webfrontend.gui.region.RegionCityStatusInfoOwn.prototype.__mhloot_showLootOwnBase = webfrontend.gui.region.RegionCityStatusInfoOwn.prototype.onCitiesChange;
                            }
                            webfrontend.gui.region.RegionCityStatusInfoOwn.prototype.onCitiesChange = function () {
                                try {
                                    if (!self.lootWindowOwn) {
                                        self.lootWindowOwn = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 5));
                                        self.lootWindowOwn.setTextColor('yellow'); //yellow white

                                        var w = webfrontend.gui.region.RegionCityStatusInfoOwn.getInstance();
                                        w.add(self.lootWindowOwn);
                                    }
                                    //clear
                                    self.Display.distanceArray = [];
                                    if (self.loadBase()) {
                                        self.calcFriendlyInfo();
                                        self.addFriendlyLabel(self.lootWindowOwn);
                                    } else {
                                        self.addLoadingLabel(self.lootWindowOwn);
                                    }
                                } catch (e) {
                                    console.warn("MHTool.Loot.RegionCityStatusInfoOwn: ", e);
                                }
                                this.__mhloot_showLootOwnBase(); // run base function
                            }
                        },
                        extendAllianceBase: function () { // BASE - Alliance
                            var self = this;
                            if (!webfrontend.gui.region.RegionCityStatusInfoAlliance.prototype.__mhloot_showLootAllianceBase) {
                                webfrontend.gui.region.RegionCityStatusInfoAlliance.prototype.__mhloot_showLootAllianceBase = webfrontend.gui.region.RegionCityStatusInfoAlliance.prototype.onCitiesChange;
                            } // ^inject
                            webfrontend.gui.region.RegionCityStatusInfoAlliance.prototype.onCitiesChange = function () {
                                //console.log('RegionCityStatusInfoAlliance:');
                                try {
                                    //todo wrap in function
                                    if (!self.lootWindowAlly) {
                                        self.lootWindowAlly = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 5));
                                        self.lootWindowAlly.setTextColor('yellow'); //yellow

                                        var w = webfrontend.gui.region.RegionCityStatusInfoAlliance.getInstance();
                                        w.add(self.lootWindowAlly);
                                    }
                                    self.calcDistance();
                                    if (self.loadBase()) {
                                        self.calcFriendlyInfo();
                                        self.calcDistance();
                                        self.addFriendlyLabel(self.lootWindowAlly);
                                    } else {
                                        self.addLoadingLabel(self.lootWindowAlly);
                                    }
                                } catch (e) {
                                    console.warn("MHTools.Loot.RegionCityStatusInfoAlliance: ", e);
                                }
                                this.__mhloot_showLootAllianceBase();
                            }
                        },
                        extendForgottenCamp: function () { // CAMP - Forgotten
                            var self = this;
                            if (!webfrontend.gui.region.RegionNPCCampStatusInfo.prototype.__mhloot_showLootNPCCamp) {
                                webfrontend.gui.region.RegionNPCCampStatusInfo.prototype.__mhloot_showLootNPCCamp = webfrontend.gui.region.RegionNPCCampStatusInfo.prototype.onCitiesChange;
                            }
                            webfrontend.gui.region.RegionNPCCampStatusInfo.prototype.onCitiesChange = function () {
                                //console.log('RegionNPCCampStatusInfo:');
                                try {
                                    if (!self.lootWindowCamp) {
                                        //TODO does it have , allowGrowX: true property?
                                        self.lootWindowCamp = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 5));
                                        self.lootWindowCamp.setTextColor('white');

                                        var widget = webfrontend.gui.region.RegionNPCCampStatusInfo.getInstance();
                                        widget.add(self.lootWindowCamp);
                                    }
                                    self.calcDistance();
                                    if (self.loadBase()) {
                                        self.calcResources();
                                        self.calcTroops();
                                        self.calcInfo();
                                        self.addResourcesLabel(self.lootWindowCamp);
                                    } else {
                                        if (self.restoreDisplay()) {
                                            self.addResourcesLabel(self.lootWindowCamp);
                                        } else {
                                            self.addLoadingLabel(self.lootWindowCamp);
                                        }
                                    }
                                } catch (e) {
                                    console.warn("MHTool.Loot.RegionNPCCampStatusInfo: ", e);
                                }
                                this.__mhloot_showLootNPCCamp();
                            }
                        },
                        extendForgottenBase: function () { // BASE - Forgotten
                            var self = this;
                            if (!webfrontend.gui.region.RegionNPCBaseStatusInfo.prototype.__mhloot_showLootNPCBase) {
                                webfrontend.gui.region.RegionNPCBaseStatusInfo.prototype.__mhloot_showLootNPCBase = webfrontend.gui.region.RegionNPCBaseStatusInfo.prototype.onCitiesChange;
                            }
                            webfrontend.gui.region.RegionNPCBaseStatusInfo.prototype.onCitiesChange = function () {
                                //console.log('RegionNPCBaseStatusInfo:');
                                try {
                                    if (!self.lootWindowBase) {
                                        self.lootWindowBase = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 5));
                                        self.lootWindowBase.setTextColor('white');

                                        var widget = webfrontend.gui.region.RegionNPCBaseStatusInfo.getInstance();
                                        widget.add(self.lootWindowBase);
                                    }
                                    self.calcDistance();
                                    if (self.loadBase()) {
                                        self.calcResources();
                                        self.calcTroops();
                                        self.calcInfo();
                                        self.addResourcesLabel(self.lootWindowBase);
                                    } else {
                                        if (self.restoreDisplay()) {
                                            self.addResourcesLabel(self.lootWindowBase);
                                        } else {
                                            self.addLoadingLabel(self.lootWindowBase);
                                        }
                                    }
                                } catch (e) {
                                    console.warn("MHTool.Loot.RegionNPCBaseStatusInfo: ", e);
                                }
                                this.__mhloot_showLootNPCBase();
                            }
                        },
                        extendPlayerBase: function () { // BASE - PvP
                            var self = this;
                            if (!webfrontend.gui.region.RegionCityStatusInfoEnemy.prototype.__mhloot_showLootPlayerBase) {
                                webfrontend.gui.region.RegionCityStatusInfoEnemy.prototype.__mhloot_showLootPlayerBase = webfrontend.gui.region.RegionCityStatusInfoEnemy.prototype.onCitiesChange;
                            }
                            webfrontend.gui.region.RegionCityStatusInfoEnemy.prototype.onCitiesChange = function () {
                                //console.log('RegionCityStatusInfoEnemy:');
                                try {
                                    if (!self.lootWindowPlayer) {
                                        self.lootWindowPlayer = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 5));
                                        self.lootWindowPlayer.setTextColor('white');

                                        var widget = webfrontend.gui.region.RegionCityStatusInfoEnemy.getInstance();
                                        widget.add(self.lootWindowPlayer);
                                    }
                                    self.calcDistance();
                                    if (self.loadBase()) {
                                        self.calcResources();
                                        self.calcTroops();
                                        self.calcInfo();
                                        self.addResourcesLabel(self.lootWindowPlayer);
                                    } else {
                                        if (self.restoreDisplay()) {
                                            self.addResourcesLabel(self.lootWindowPlayer);
                                        } else {
                                            self.addLoadingLabel(self.lootWindowPlayer);
                                        }
                                    }
                                } catch (e) {
                                    console.warn("MHTool.Loot.RegionCityStatusInfoEnemy: ", e);
                                }

                                this.__mhloot_showLootPlayerBase();
                            }
                        },
                        extendPOI: function () { // POI
                            var self = this;
                            if (!webfrontend.gui.region.RegionPointOfInterestStatusInfo.prototype.__mhloot_showLootPOI) {
                                webfrontend.gui.region.RegionPointOfInterestStatusInfo.prototype.__mhloot_showLootPOI = webfrontend.gui.region.RegionPointOfInterestStatusInfo.prototype.onCitiesChange;
                            }
                            webfrontend.gui.region.RegionPointOfInterestStatusInfo.prototype.onCitiesChange = function () {
                                //console.log('RegionPointOfInterestStatusInfo:');
                                try {
                                    if (!self.lootWindowPOI) {
                                        self.lootWindowPOI = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 5));
                                        self.lootWindowPOI.setTextColor('white');

                                        var widget = webfrontend.gui.region.RegionPointOfInterestStatusInfo.getInstance();
                                        widget.add(self.lootWindowPOI);
                                    }
                                    //clear
                                    self.Display.lootArray = [];
                                    self.Display.troopsArray = [];
                                    self.Display.infoArrays = [];
                                    self.Display.twoLineInfoArrays = [];
                                    self.calcDistance();
                                    self.addResourcesLabel(self.lootWindowPOI);
                                } catch (e) {
                                    console.warn("MHTool.Loot.RegionPointOfInterestStatusInfo: ", e);
                                }
                                this.__mhloot_showLootPOI();
                            }
                        },
                        extendHUB: function () { // HUB
                            var self = this;
                            if (!webfrontend.gui.region.RegionHubStatusInfo.prototype.__mhloot_showLootHUB) {
                                webfrontend.gui.region.RegionHubStatusInfo.prototype.__mhloot_showLootHUB = webfrontend.gui.region.RegionHubStatusInfo.prototype.onCitiesChange;
                            }
                            webfrontend.gui.region.RegionHubStatusInfo.prototype.onCitiesChange = function () {
                                console.log('RegionHubStatusInfo:');
                                try {
                                    if (!self.lootWindowHUB) {
                                        self.lootWindowHUB = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 5));
                                        self.lootWindowHUB.setTextColor('white');

                                        var widget = webfrontend.gui.region.RegionHubStatusInfo.getInstance();
                                        widget.add(self.lootWindowHUB);
                                    }
                                    //clear
                                    self.Display.lootArray = [];
                                    self.Display.troopsArray = [];
                                    self.Display.infoArrays = [];
                                    self.Display.twoLineInfoArrays = [];
                                    self.calcDistance();
                                    self.addResourcesLabel(self.lootWindowHUB);
                                } catch (e) {
                                    console.warn("MHTool.Loot.RegionHubStatusInfo: ", e);
                                }
                                this.__mhloot_showLootHUB();
                            }
                        },
                        extendHUBServer: function () {
                            var self = this;
                            if (!webfrontend.gui.region.RegionHubServerStatusInfo.prototype.__mhloot_showLootHUB) {
                                webfrontend.gui.region.RegionHubServerStatusInfo.prototype.__mhloot_showLootHUB = webfrontend.gui.region.RegionHubServerStatusInfo.prototype.onCitiesChange;
                            }
                            webfrontend.gui.region.RegionHubServerStatusInfo.prototype.onCitiesChange = function () {
                                console.log('RegionHubServerStatusInfo:');
                                try {
                                    if (!self.lootWindowHUBServer) {
                                        self.lootWindowHUBServer = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 5));
                                        self.lootWindowHUBServer.setTextColor('white');

                                        var widget = webfrontend.gui.region.RegionHubServerStatusInfo.getInstance();
                                        widget.add(self.lootWindowHUBServer);
                                    }
                                    //clear
                                    self.Display.lootArray = [];
                                    self.Display.troopsArray = [];
                                    self.Display.infoArrays = [];
                                    self.Display.twoLineInfoArrays = [];
                                    self.calcDistance();
                                    self.addResourcesLabel(self.lootWindowHUBServer);
                                } catch (e) {
                                    console.warn("MHTool.Loot.RegionHubStatusInfo: ", e);
                                }
                                this.__mhloot_showLootHUB();
                            }
                        },
                        extendRUIN: function () { // RUIN
                            var self = this;
                            if (!webfrontend.gui.region.RegionRuinStatusInfo.prototype.__mhloot_showLootRUIN) {
                                webfrontend.gui.region.RegionRuinStatusInfo.prototype.__mhloot_showLootRUIN = webfrontend.gui.region.RegionRuinStatusInfo.prototype.onCitiesChange;
                            }
                            webfrontend.gui.region.RegionRuinStatusInfo.prototype.onCitiesChange = function () {
                                //console.log('RegionRuinStatusInfo:');
                                try {
                                    if (!self.lootWindowRUIN) {
                                        self.lootWindowRUIN = new qx.ui.container.Composite(new qx.ui.layout.Grid(5, 5));
                                        self.lootWindowRUIN.setTextColor('white');

                                        var widget = webfrontend.gui.region.RegionRuinStatusInfo.getInstance();
                                        widget.add(self.lootWindowRUIN);
                                    }
                                    //clear
                                    self.Display.lootArray = [];
                                    self.Display.troopsArray = [];
                                    self.Display.infoArrays = [];
                                    self.Display.twoLineInfoArrays = [];
                                    self.calcDistance();
                                    self.addResourcesLabel(self.lootWindowRUIN);
                                } catch (e) {
                                    console.warn("MHTool.Loot.RegionRuinStatusInfo: ", e);
                                }
                                this.__mhloot_showLootRUIN();
                            }
                        },
                        // OPTIONS
                        optionsTab: null,
                        optionsPage: null,
                        btnApply: null,
                        optionsStoreName: 'MHToolLootOptions',
                        addLootPage: function () {
                            //console.log('addLootPage');
                            try {
                                if (!MHTools.OptionsPage) OptionsPage();

                                if (!this.optionsTab) {
                                    //Create Tab
                                    this.optionsTab = MHTools.OptionsPage.getInstance();
                                }
                                this.optionsPage = this.optionsTab.addPage("Loot");
                                this.optionsPage.setLayout(new qx.ui.layout.VBox());
                                // ...
                                this.optionsPage.add(new qx.ui.basic.Label("<b>Options:</b></br>").set({
                                    rich: true
                                })); //, textColor: red
                                var i = 0;
                                for (var k in this.settings) {
                                    this.settings[k].cb = new qx.ui.form.CheckBox(this.settings[k].l).set({
                                        value: this.settings[k].v,
                                        paddingLeft: 10
                                    });
                                    this.settings[k].cb.addListener("execute", this.optionsChanged, this);
                                    this.optionsPage.add(this.settings[k].cb); //, {row:1+i++, column:3});
                                }
                                //typeGet
                                //this.optionsPage.add(new qx.ui.basic.Label("<b>Obf:"+this.typeGet()+"</b>").set({rich: true}));//, textColor: red
                                //  container.add(new qx.ui.core.Spacer(50));
                                this.loadOptions();
                                this.addButtons();
                            } catch (e) {
                                console.warn("MHTool.Loot.addLootPage: ", e);
                            }
                        },
                        addButtons: function () {
                            try {
                                this.btnApply = new qx.ui.form.Button("Apply");
                                this.btnApply.set({
                                    width: 150,
                                    height: 30,
                                    toolTipText: "Apply changes.",
                                    allowGrowX: false,
                                    enabled: false
                                }); //, marginTop:20});

                                var c = new qx.ui.container.Composite(new qx.ui.layout.HBox(0, 'right'));
                                c.setMarginTop(20);
                                c.add(this.btnApply);
                                this.optionsPage.add(c);

                                this.btnApply.addListener("execute", this.applyOptions, this);
                                this.btnApply.setEnabled(false);
                            } catch (e) {
                                console.warn("MHTool.Loot.addButtons: ", e);
                            }
                        },
                        optionsChanged: function () {
                            var c = false;
                            for (var k in this.settings) {
                                c = c || (this.settings[k].v != this.settings[k].cb.getValue());
                            }
                            this.btnApply.setEnabled(c);
                        },
                        applyOptions: function (e) {
                            //console.log("applyOptions e:",e);
                            this.saveOptions();
                            this.btnApply.setEnabled(false);
                        },
                        saveOptions: function () {
                            var c = {};
                            var i = 0;
                            for (var k in this.settings) {
                                c[k] = this.settings[k].cb.getValue();
                                this.settings[k].v = c[k];
                            }
                            var S = ClientLib.Base.LocalStorage;
                            if (S.get_IsSupported()) S.SetItem(this.optionsStoreName, c);
                        },
                        loadOptions: function () {
                            try {
                                var c = {};
                                var S = ClientLib.Base.LocalStorage;
                                if (S.get_IsSupported()) c = S.GetItem(this.optionsStoreName);
                                //console.log('loadOptions c:',c);
                                if (c === null) c = {};
                                var i = 0;
                                for (var k in this.settings) {
                                    if (typeof (c[k]) != 'undefined') {
                                        this.settings[k].cb.setValue(c[k]);
                                        this.settings[k].v = c[k];
                                    } else {
                                        this.settings[k].cb.setValue(this.settings[k].d);
                                        this.settings[k].v = this.settings[k].d;
                                    }
                                }
                                //console.log('loadOptions settings:',this.settings);
                            } catch (e) {
                                console.warn("MHTool.Loot.loadOptions: ", e);
                            }
                        }
                    } //members
                });
            } catch (e) {
                console.warn("qx.Class.define(MHTools.Loot: ", e);
            }
            //=======================================================
            // START
            MHTools.Loot.getInstance();
        } //function MHToolsLootCreate
        //=======================================================
        function LoadExtension() {
            try {
                if (typeof (qx) != 'undefined') {
                    //if (qx.core.Init.getApplication().getMenuBar() !== null) {
                    if (!!qx.core.Init.getApplication().getMenuBar()) {
                        MHToolsLootCreate();
                        return; // done
                    }
                }
            } catch (e) {
                if (typeof (console) != 'undefined') console.log('LoadExtension:', e);
                else if (window.opera) opera.postError(e);
                else GM_log(e);
            }
            window.setTimeout(LoadExtension, 1000); // force it
        }
        LoadExtension();
    }
    //=======================================================
    function Inject() {
        var script = document.createElement('script');
        txt = MHLootMain.toString();
        script.textContent = '(' + txt + ')();';
        script.type = 'text/javascript';
        document.getElementsByTagName('head')[0].appendChild(script);
    }
    Inject();
})();