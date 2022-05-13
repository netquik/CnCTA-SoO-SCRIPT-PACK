// ==UserScript==
// @name          PluginsLib - mhLoot - Tiberium Alliances
// @description   CROSS SERVERS Loot & troops & bases & distance info.
// @version       2.09
// @author        MrHIDEn (in game: PEEU) based on Yaeger & Panavia code.
// @contributor   NetquiK (https://github.com/netquik) - FIX for MENU REGISTERING
// @namespace     PluginsLib.mhLoot
// @match      https://*.alliances.commandandconquer.com/*/index.aspx*
// @grant         none
// @downloadURL   https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_PluginsLib_mhLoot.user.js
// @updateURL     https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_PluginsLib_mhLoot.user.js
// ==/UserScript==
/*TODO list
"function (){this.show();this.setActive(true);this.focus();}"
*/
(function () {
  var injectBody = function () {
    //TODO for debug purpose only. remove if you do not need.
    var ccl = console.log;
    var cci = console.info;
    var ccw = console.warn;
    var ccd = console.dir;
    var ccc = console.clear;
    var cce = console.error;
    var disable = 0;
    if (disable) {
      var f = function () {};
      ccl = f;
      cci = f;
      ccw = f;
      ccd = f;
      ccc = f;
      cce = f;
    }

    var pluginName = "mhLoot";
    var created = false;

    function CreateClasses() {
      //console.log('CreateClasses');
      // Classes
      //=======================================================      
      //Extending webfrontend.gui.options.OptionsPage with new ManagementOptionsPage
      function OptionsPage() {
        try //PluginsLib.mhOptionsPage
        {
          qx.Class.define("PluginsLib.mhOptionsPage", {
            type: 'singleton',
            extend: webfrontend.gui.options.OptionsPage,
            construct: function () {
              console.log('Create PluginsLib.mhOptionsPage at Loot+Info');
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
                    console.warn("PluginsLib.mhOptionsPage.extendOptionsWindow: ", e);
                  }
                };
              }
            }
          });
        } catch (e) {
          console.warn("qx.Class.define(PluginsLib.mhOptionsPage: ", e);
        }
      }
      //=======================================================  
      try // "PluginsLib.mhLoot"   
      {
        qx.Class.define("PluginsLib." + pluginName, {
          type: 'singleton',
          extend: qx.core.Object,
          statics: {
            NAME: 'LootInfo',
            PLUGIN: 'mhLoot',
            AUTHOR: 'MrHIDEn',
            VERSION: 2.06,
            REQUIRES: '',
            NEEDS: 'Menu',
            INFO: '',
            WWW: 'http://userscripts.org/scripts/show/160800',
            ONPLUGIN: null,
            ONOPTIONS: null,
            SIZE: 0
          },
          construct: function () {
            //console.log('Create PluginsLib.mhLoot');
            this.stats.src = "data:image/png;base64,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"; //2.0.x
            var version = PluginsLib.mhLoot.VERSION.toString();
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
            // reload bases stored in browser
            //this.lootList.reloadList();
            function Types(o) {
              var a = [];
              for (var k in o) a[o[k]] = k;
              return a;
            }
            this.LObjectType = Types(ClientLib.Vis.VisObject.EObjectType);
            this.LViewMode = Types(ClientLib.Vis.Mode);

            // window
            this.Self = this;
            var backColor = '#eef';
            var region = ClientLib.Vis.VisMain.GetInstance().get_Region();
            var viewW = region.get_ViewWidth();
            this.win = (new qx.ui.window.Window("Loot " + version));
            this.win.set({
              width: 350,
              showMinimize: false,
              showMaximize: false,
              showClose: true,
              contentPadding: 6,
              allowClose: true,
              resizable: false,
              toolTipText: "MrHIDEn tool - Loot " + version
            });
            //http://demo.qooxdoo.org/2.0.2/apiviewer/#qx.ui.mobile.core.Widget~dblclick!event
            //mouseover
            //qx.event.Timer.once(fun,obj,time)
            /*NOTE
            PluginsLib.mhLoot.getInstance().win.toggleActive();
            PluginsLib.mhLoot.getInstance().win.setUseMoveFrame(1)
            PluginsLib.mhLoot.getInstance().win.moveTo(100,100);
            PluginsLib.mhLoot.getInstance().win.setLayoutProperties({left:200,top:100});
            lp=PluginsLib.mhLoot.getInstance().win.getLayoutProperties();
            //Object { left=586, top=112}
            */
            this.win.addListener("mouseover", function (e) {
              //TODO stop timer. message STOPED
              //this.extTimer.stop();
              //this.win.close(); 
            }, this);
            this.win.addListener("click", function (e) {
              //webfrontend.gui.UtilView.centerCoordinatesOnRegionViewWindow(this.Data.Selected.X,this.Data.Selected.Y);
            }, this);
            this.win.addListener("dblclick", function (e) {
              this.extTimer.stop();
              this.win.close();
            }, this);
            this.win.addListener("close", function (e) {
              this.extTimer.stop();
              //this.win.close(); 
            }, this);
            this.win.addListener("minimize", function (e) {
              if (this.extMinimized) {
                this.extMinimized = false;
                this.extPrint();
              } else {
                this.extMinimized = true;
                this.win.removeAll();
              }
              this.win.restore(); //trick
            }, this);
            this.win.addListener("move", function (e) {
              var pos = {
                left: e.getData().left,
                top: e.getData().top
              };
              this.saveToStorage('winpos', pos);
            }, this);
            var pos = {
              left: (viewW - 10 - this.win.getWidth()),
              top: 35
            };
            pos = this.loadFromStorage('winpos', pos);
            this.win.moveTo(pos.left, pos.top);
            var winLayout = new qx.ui.layout.Grid(5, 5);
            this.win.setLayout(winLayout);
            this.win.setTextColor('yellow');

            //this.extTimer = new qx.event.Timer.once(this.extOnTimer,this,500);
            this.extTimer = new qx.event.Timer(1000);
            this.extTimer.addListener("interval", this.extOnTimer, this);

            this.extendSelectionChange();
            this.extendViewModeChange();
            //options
            this.addLootPage();
            //bypass
            this.loadBypass();


            //REGISTER PLUGIN
            //this.constructor.ONPLUGIN = function(){this.constructor.getInstance().open();};
            //this.constructor.ONOPTIONS = function(){this.constructor.getInstance().open();};//test
            //PluginsLib.Menu.getInstance().RegisterPlugin(this);

            //READY
            console.info("Plugin '" + pluginName + "' LOADED");
          },
          members: {
            Self: null,
            loadFromStorage: function (key, preval) {
              var S = ClientLib.Base.LocalStorage;
              if (S.get_IsSupported()) {
                var val = S.GetItem(this.classname + '.' + key);
                if (val !== null) {
                  preval = val;
                }
              }
              return preval;
            },
            saveToStorage: function (key, val) {
              if (val !== null) {
                var S = ClientLib.Base.LocalStorage;
                if (S.get_IsSupported()) S.SetItem(this.classname + '.' + key, val);
              }
            },
            win: null,
            //winStoreName: this.classname+'.winpos',
            extItems: [],
            extMinimized: false,
            extTimer: null,
            extAdd: function (l, p) {
              this.extItems.push(l, p);
            },
            extPrint: function (type) {
              this.win.removeAll();
              if (!this.extMinimized) {
                for (var i = 0; i < this.extItems.length; i += 2) {
                  this.win.add(this.extItems[i], this.extItems[i + 1]);
                }
              }
              this.win.open();
            },
            extOnTimer: function () {
              //console.log('extOnTimer');
              this.onSelectionChange('Timer');
              this.extPrint();
            },
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
              //,showMeasure:             {v:true,  d:true,  l:'Shows distance from locked object to the selected object'}
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
            // store v3
            lootList: {
              storeName: 'MHToolsLootList3',
              list: {
                d: {},
                c: 0
              },
              exist: function (xy) {
                return typeof (this.list.d[xy]) == "object";
              },
              save: function (xy, d) { //in use
                //console.info("lootList.save");
                try {
                  if (xy < 0) return;
                  //id could be not actual after some patch
                  var fprint = false;
                  var id = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId();
                  if (!this.exist(xy)) { //new item
                    this.list.c++;
                    fprint = true;
                  }
                  this.list.d[xy] = {
                    id: id,
                    Data: d,
                    xy: xy
                  };
                  //if(fprint) console.dir(this.list.d);
                  // JSON - disabled
                  //var S = ClientLib.Base.LocalStorage;
                  //if (S.get_IsSupported()) S.SetItem(this.storeName, this.list);  
                } catch (e) {
                  console.warn("lootList.save: ", e);
                }
              },
              load: function (xy) { //in use
                //console.info("lootList.load");
                try {
                  if (xy < 0) return {
                    id: id,
                    Data: {}
                  };
                  var id = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId();
                  if (this.exist(xy)) return this.list.d[xy];
                  return {
                    id: id,
                    Data: {}
                  };
                } catch (e) {
                  console.warn("lootList.load: ", e);
                }
              },
              store: function (xy, k, d) { //in use
                //console.info("lootList.store key:",k);
                try {
                  var mem = this.load(xy).Data;
                  mem[k] = d;
                  this.save(xy, mem);
                } catch (e) {
                  console.warn("lootList.store: ", e);
                }
              },
              restore: function (xy, k) { //?? NOT in use
                //console.info("lootList.restore");
                try {
                  var mem = this.load(xy).Data;
                  if (typeof (mem[k]) == 'undefined') return 'undefined';
                  return mem[k];
                } catch (e) {
                  console.warn("lootList.restore: ", e);
                }
              }
            },
            // bases
            Data: {
              lastSelectedBaseId: -1,
              selectedBaseId: -1
            },
            // display containers
            lootWindowPlayer: null,
            lootWindowBase: null,
            lootWindowCamp: null,
            lootWindowOwn: null,
            lootWindowAlly: null,
            lootWindowPOI: null,
            lootWindowRUIN: null,
            lootWindowHUBServer: null,
            waiting: [1, '0', '_', '1', '_', '2', '_', '3', '_', '4', '_', '5', '_', '6', '_', '7', '_', '8', '_', '9', '_'],
            Display: {
              troopsArray: [],
              lootArray: [],
              iconArrays: [],
              infoArrays: [],
              twoLineInfoArrays: [],
              distanceArray: []
            },
            LObjectType: [],
            LViewMode: [],
            viewMode: 0, //"None"
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
                    ClientLib.Data.City.prototype.kBuildings = d.Keys.Buildings;
                    ClientLib.Data.City.prototype.get_Buildings = function () {
                      return this.get_CityBuildingsData()[this.kBuildings];
                    };
                  }
                  if (typeof (d.Keys.Offences) != 'undefined') {
                    ClientLib.Data.City.prototype.kOffenseUnits = d.Keys.Offences;
                    ClientLib.Data.City.prototype.get_OffenseUnits = function () {
                      return this.get_CityUnitsData()[this.kOffenseUnits];
                    };
                  }
                  if (typeof (d.Keys.Defences) != 'undefined') {
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
                  console.log('PluginsLib.mhLoot Helpers are ready:');
                  console.log(d.Keys);
                  delete d.Keys;
                  this.getBypass = function () {
                    return true;
                  };
                  return true;
                } else console.log('#Keys(!=3): ', cnt);
              } catch (e) {
                console.warn("PluginsLib.mhLoot.", arguments.callee.name, ': ', e);
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
                console.warn("PluginsLib.mhLoot.", arguments.callee.name, ': ', e);
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
                console.warn("PluginsLib.mhLoot.", arguments.callee.name, ': ', e);
              }
              return l;
            },
            loadBase: function () {
              try {
                //if (typeof(this.Data.lastSelectedBaseId)=='undefined') this.Data.lastSelectedBaseId = -1;//, Bypass: {}};

                var d = this.Data;
                //console.info("loot.loadBase.lastID:",d.lastSelectedBaseId);      

                d.selectedBaseId = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId();
                d.selectedOwnBaseId = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCityId();

                if (d.lastSelectedBaseId !== d.selectedBaseId) d.loaded = false;

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
                if (typeof (d.ol) == 'undefined') return false;
                if (typeof (d.el) == 'undefined') return false;

                if (d.el.Buildings.c === 0) return false;
                if (d.ol.Buildings.c === 0) return false;

                //console.info("loot.loadBase.ID:",d.selectedBaseId); 
                d.lastSelectedBaseId = d.selectedBaseId;
                d.loaded = true;
                return true;
              } catch (e) {
                console.warn("PluginsLib.mhLoot.", arguments.callee.name, ': ', e);
                console.dir("PluginsLib.mhLoot.Data: ", this.Data);
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
            //NEW API for LOOTS
            getLoots2: function (r) {
              r = r || {};
              var t = {
                1: 'T',
                2: 'C',
                3: 'G',
                6: 'RP',
                7: 'RCB',
                8: 'RCA',
                9: 'RCI',
                10: 'RCV'
              };
              var l = ClientLib.API.Battleground.GetInstance().GetLootFromCurrentCity();
              for (var i in l) {
                var c = l[i]; //Requirement/Cost
                if (typeof (c) != 'object') continue;
                var k = (typeof (t[c.Type]) == 'undefined') ? c.Type : t[c.Type]; //translate if possible
                if (typeof (r[k]) == 'undefined') r[k] = 0; //add branch
                r[k] += c.Count;
              }
              return r;
            },
            calcResources: function (xy) {
              //console.info("loot.calcResources"); 
              try {
                if (!this.settings.showLoot.v) return;

                if (!this.Data.loaded) return;

                this.Display.lootArray = [];

                var el = this.Data.el;
                var ec = this.Data.ec;

                // NEW
                // ClientLib.API.Battleground.GetInstance().GetLootFromCurrentCity()
                var loots2 = this.getLoots2();

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

                this.lootList.store(xy, 'lootArray', this.Display.lootArray);
              } catch (e) {
                console.warn("PluginsLib.mhLoot.calcResources: ", e);
                console.dir("PluginsLib.mhLoot.~.Data:", this.Data);
              }
            },
            calcTroops: function (xy) {
              //console.info("loot.calcTroops"); 
              try {
                if (!this.settings.showTroops.v) return;

                if (!this.Data.loaded) return;

                var troops = [0, 0, 0, 0, 0];

                var el = this.Data.el;

                // enemy defence units
                for (var j in el.Defences.d) {
                  var unit = el.Defences.d[j];
                  var h = unit.get_Health(); //EA API
                  troops[0] += h;
                  if (this.settings.showTroopsExtra.v) {
                    switch (unit.get_UnitGameData_Obj().mt) { //keyTroop // TODO check .mt
                      case ClientLib.Base.EUnitMovementType.Feet:
                        troops[1] += h;
                        break;
                      case ClientLib.Base.EUnitMovementType.Track:
                      case ClientLib.Base.EUnitMovementType.Wheel:
                        troops[2] += h;
                        break;
                      case ClientLib.Base.EUnitMovementType.Structure:
                        troops[3] += h;
                        break;
                      case ClientLib.Base.EUnitMovementType.Air:
                      case ClientLib.Base.EUnitMovementType.Air2:
                        troops[4] += h;
                        break;
                    }
                  }
                }
                this.Display.troopsArray = troops;
                this.lootList.store(xy, 'troopsArray', this.Display.troopsArray);
              } catch (e) {
                console.warn("PluginsLib.mhLoot.calcTroops: ", e);
                console.dir("PluginsLib.mhLoot.~.Data:", this.Data);
              }
            },
            calcInfo: function (xy) {
              //console.info("loot.calcInfo"); 
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
                  this.lootList.store(xy, 'infoArrays', this.Display.infoArrays);
                } catch (e) {
                  console.log("PluginsLib.mhLoot.calcInfo 1: ", e);
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
                  var dfhp = tbhp;

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
                  this.lootList.store(xy, 'infoArrays', this.Display.infoArrays);
                } catch (e) {
                  console.log("PluginsLib.mhLoot.calcInfo 2: ", e);
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
                  ohp = oc.GetOffenseConditionInPercent();

                  var ool = this.numberFormat(oc.get_LvlOffense(), 1);

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
                  this.lootList.store(xy, 'twoLineInfoArrays', this.Display.twoLineInfoArrays);
                } catch (e) {
                  console.log("PluginsLib.mhLoot.calcInfo 3: ", e);
                }
              }
            },
            calcFriendlyInfo: function (xy) {
              //console.info("loot.calcFriendlyInfo"); 
              this.Display.twoLineInfoArrays = [];
              if (!this.settings.showLevels.v && !this.settings.showAllyRepairTimeInfo.v) return;

              try {
                if (!this.Data.loaded) return;

                var hp;
                var t;

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
                  if (el.Buildings.c > 0) t.push(this.numberFormat(ec.get_LvlBase(), 1));
                  else t.push('--');
                  if (el.Defences.c > 0) t.push(this.numberFormat(ec.get_LvlDefense(), 1));
                  else t.push('--');
                  if (el.Offences.c > 0) t.push(this.numberFormat(ec.get_LvlOffense(), 1));
                  else t.push('--');
                  if (sd !== null) t.push(this.numberFormat(sl, 1));
                  else t.push('--');
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
                    ofl = this.numberFormat(ec.get_LvlOffense(), 1);
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
                this.lootList.store(xy, 'twoLineInfoArrays', this.Display.twoLineInfoArrays);
              } catch (e) {
                console.warn("PluginsLib.mhLoot.calcFriendlyInfo: ", e);
              }
            },

            //NOTE
            //ClientLib.Vis.VisMain.GetInstance().GetObjectFromPosition
            //ClientLib.Data.WorldSector.WorldObject GetObjectFromPosition (System.Int32 x ,System.Int32 y)
            //ClientLib.Vis.City.CityObject GetObjectFromPosition (System.Single x ,System.Single y)
            //ClientLib.Vis.Region.RegionObject GetObjectFromPosition (System.Single x ,System.Single y)
            //ClientLib.Vis.VisObject GetObjectFromPosition (System.Single x ,System.Single y)
            //ClientLib.Data.Hub GetObjectFromPosition (System.Int32 x ,System.Int32 y)
            calcDistance: function () {
              //console.info("loot.calcDistance"); 
              this.Display.distanceArray = [];

              var hp;

              if (!this.settings.showDistance.v) return;
              //console.log('calcDistance');              
              try {
                var visObject = ClientLib.Vis.VisMain.GetInstance().get_SelectedObject();
                if (visObject !== null) {
                  var oc = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity();
                  var t = visObject.get_VisObjectType();
                  switch (t) {
                    case ClientLib.Vis.VisObject.EObjectType.RegionCityType:
                    case ClientLib.Vis.VisObject.EObjectType.RegionNPCBase:
                    case ClientLib.Vis.VisObject.EObjectType.RegionNPCCamp:
                    case ClientLib.Vis.VisObject.EObjectType.RegionPointOfInterest:
                    case ClientLib.Vis.VisObject.EObjectType.RegionRuin:
                    case ClientLib.Vis.VisObject.EObjectType.RegionHubControl:
                    case ClientLib.Vis.VisObject.EObjectType.RegionHubCenter:
                      var ser = ClientLib.Data.MainData.GetInstance().get_Server();
                      var selX = visObject.get_RawX();
                      var selY = visObject.get_RawY();
                      var ocX = oc.get_X();
                      var ocY = oc.get_Y();
                      var cenX = ser.get_ContinentWidth() / 2;
                      var cenY = ser.get_ContinentHeight() / 2;
                      //target is locked by button
                      // if(typeof(this.Data.Lock)=='undefined') {
                      // this.Data.Lock={X:ocX,Y:ocY};//{X:0,Y:0};
                      // }
                      //var locX = this.Data.Lock.X;                    
                      //var locY = this.Data.Lock.Y;
                      if (typeof (this.Data.Selected) == 'undefined') {
                        this.Data.Selected = {};
                      }
                      this.Data.Selected = {
                        X: selX,
                        Y: selY
                      };
                      var dis = ClientLib.Base.Util.CalculateDistance(ocX, ocY, selX, selY).toString();
                      var cen = ClientLib.Base.Util.CalculateDistance(cenX, cenY, selX, selY);
                      //var loc = ClientLib.Base.Util.CalculateDistance(locX, locY, selX, selY);
                      var cdt = oc.GetCityMoveCooldownTime(selX, selY); //cool down time
                      var stp = dis / 20; //steps
                      this.Data.Distance = dis;
                      //this.Data.MeasureDistance = loc;                      
                      var hp = {};
                      hp.name = '<b>Movement</b>';
                      hp.lbs = ['Distance:', 'EMT:', 'Steps:', 'To center:'];
                      var t = [];
                      t.push(dis);
                      t.push(this.dhms2(cdt));
                      t.push(stp);
                      t.push(cen);
                      hp.val = t;
                      this.Display.distanceArray.push(hp);
                      break;
                    default:
                      break;
                  } //switch (t) 
                } //if (visObject               
                //DISABLED this.lootList.store(xy,'distanceArray',this.Display.distanceArray);               
              } catch (e) {
                console.warn("PluginsLib.mhLoot.calcDistance: ", e);
              }
            },

            onSelectionChange: function (oldObject, newObject) {
              try {
                if (qx.core.Init.getApplication().getChat().getFocused() || (qx.core.Init.getApplication().getPlayArea().getViewMode() != ClientLib.Data.PlayerAreaViewMode.pavmNone)) {
                  //TODO something is wrong
                  //this.extTimer.stop();
                  //this.win.close();
                  //return;
                }
                this.extItems = [];
                this.win.removeAll();
                this.win.close();

                if (oldObject == "Timer") {
                  //console.log("@Timer");
                } else {
                  //console.log("@Select");
                  this.Data.lastSelectedBaseId = -2;
                  this.waiting[0] = 1;
                }
                //ClientLib.Vis.SelectionChange
                //console.clear();
                var visObject = ClientLib.Vis.VisMain.GetInstance().get_SelectedObject();
                if (visObject !== null) {
                  var vt = visObject.get_VisObjectType();
                  //console.log('onSelectionChange.Object: ',this.LObjectType[vt]);
                } else {
                  //console.log('onSelectionChange.Object: ','null');
                  this.Data.lastSelectedBaseId = -3;
                }

                if (visObject !== null) {
                  var t = visObject.get_VisObjectType();
                  //console.log('Vis Object Type:',t,', ',this.LObjectType[t]);
                  //console.log('!=null: Object type: ',this.LObjectType[t]);
                  //window.PluginsLib.visObject = visObject;
                  //window.visObject = visObject;
                  this.Data.visObject = visObject;
                  this.extTimer.start();
                  var xy = -1;
                  if (typeof (visObject.get_RawX) != 'undefined') {
                    var xy = 10000 * visObject.get_RawX() + visObject.get_RawY();
                  }
                  switch (t) {
                    // Own bases, ally base
                    case ClientLib.Vis.VisObject.EObjectType.RegionCityType:
                      //this.extTimer.setEnabled(true);
                      //this.extTimer.start();// does not work
                      var oc = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity();
                      var aid = oc.get_AllianceId();
                      var sid = visObject.get_AllianceId();

                      this.calcDistance();
                      if (aid == sid) {
                        // Own, Ally
                        //clear                  
                        //self.Display.distanceArray = [];
                        if (this.loadBase() && oldObject == "Timer") {
                          this.extTimer.stop();
                          this.calcFriendlyInfo(xy);
                          this.addFriendlyLabel();
                        } else {
                          //this.addLoadingLabel();         
                          if (this.restoreDisplay(xy)) {
                            this.addResourcesLabel("r");
                          } else {
                            this.addLoadingLabel();
                          }
                        }
                      } else {
                        // Enemy
                        if (this.loadBase() && oldObject == "Timer") {
                          this.extTimer.stop();
                          this.calcResources(xy);
                          this.calcTroops(xy);
                          this.calcInfo(xy);
                          this.addResourcesLabel();
                        } else {
                          if (this.restoreDisplay(xy)) {
                            this.addResourcesLabel("r");
                          } else {
                            this.addLoadingLabel();
                          }
                        }
                      }
                      break;
                      // CAMP OUTPOST BASE
                    case ClientLib.Vis.VisObject.EObjectType.RegionNPCCamp:
                    case ClientLib.Vis.VisObject.EObjectType.RegionNPCBase:
                      this.calcDistance();
                      if (this.loadBase() && oldObject == "Timer") {
                        this.extTimer.stop();
                        this.calcResources(xy);
                        this.calcTroops(xy);
                        this.calcInfo(xy);
                        this.addResourcesLabel();
                      } else {
                        if (this.restoreDisplay(xy)) {
                          this.addResourcesLabel("r");
                        } else {
                          this.addLoadingLabel();
                        }
                      }
                      break;
                    case ClientLib.Vis.VisObject.EObjectType.RegionPointOfInterest:
                    case ClientLib.Vis.VisObject.EObjectType.RegionRuin:
                    case ClientLib.Vis.VisObject.EObjectType.RegionHubControl:
                    case ClientLib.Vis.VisObject.EObjectType.RegionHubCenter:
                      this.extTimer.stop();
                      //clear
                      this.Display.lootArray = [];
                      this.Display.troopsArray = [];
                      this.Display.infoArrays = [];
                      this.Display.twoLineInfoArrays = [];
                      this.calcDistance();
                      this.addResourcesLabel();
                      break;
                    default:
                      this.extTimer.stop();
                      this.win.close();
                      break;
                  }
                  // console.log('focusable: false');
                  // this.win.set({focusable: false});
                } else {
                  this.extTimer.stop();
                  this.win.close();
                }
                this.win.setActive(false);
              } catch (e) {
                console.warn('PluginsLib.mhLoot.onSelectionChange: ', e);
              }
            },
            onViewChanged: function (oldMode, newMode) {
              //console.log('onViewChanged: ');
              // var p = qx.core.Init.getApplication().getPlayArea();
              // console.log('getViewMode',p.getViewMode());//0-map,1-base,2-def,3-off
              // qx.core.Init.getApplication().getPlayArea().getViewMode();
              // case ClientLib.Data.PlayerAreaViewMode.pavmCombatAttacker:
              // console.log('getViewCity',p.getViewCity());//id
              // var fH = ClientLib.Data.MainData.GetInstance().get_Combat();
              // qx.core.Init.getApplication().getPlayArea().getCurrentViewMode()
              // var c = qx.core.Init.getApplication().getChat();
              // c.getFocused();//good
              // c.getFocusedOrMoused();//good
              // qx.core.Init.getApplication().getChat().getFocusedOrMoused();
              try {
                //console.log('newMode: ',newMode);
                console.log('onViewChanged: ', this.LViewMode[newMode]);
                this.viewMode = newMode;
                if (newMode != ClientLib.Vis.Mode.Region) {
                  this.extTimer.stop();
                  this.win.close();
                }
              } catch (e) {
                console.warn('PluginsLib.mhLoot.onViewChanged: ', e);
              }
            },
            extendSelectionChange: function () {
              phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance(), "SelectionChange", ClientLib.Vis.SelectionChange, this, this.onSelectionChange);
            },
            extendViewModeChange: function () {
              //disabled
              //phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance(), "ViewModeChange", ClientLib.Vis.ViewModeChange, this , this.onViewChanged);

            },
            restoreDisplay: function (xy) {
              //console.info("loot.restoreDisplay");              
              var id = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId();
              if (this.lootList.exist(xy)) {
                var d = this.lootList.list.d[xy].Data;
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
                this.extItems = [];
                //widget.removeAll();
                var r = 0,
                  c = 0;
                var a;

                // DISTANCE
                //console.log('DISTANCE');
                a = this.Display.distanceArray;
                if (typeof (a) != 'undefined' && a.length > 0) {
                  for (var i in this.Display.distanceArray) {
                    c = 0;
                    this.extAdd(new qx.ui.basic.Label(this.Display.distanceArray[i].name).set({
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
                      this.extAdd(new qx.ui.basic.Label(this.Display.distanceArray[i].lbs[j]), {
                        row: r,
                        column: c
                      });
                      this.extAdd(new qx.ui.basic.Label(this.Display.distanceArray[i].val[j]), {
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
                c = 0;
                var w = this.waiting[this.waiting[0]];
                if (++this.waiting[0] >= this.waiting.length) this.waiting[0] = 1;
                this.extAdd(new qx.ui.basic.Label("<b style='color:white;font-size:10pt'>SCANNING... " + w + "</b>").set({
                  rich: true
                }), {
                  row: r++,
                  column: c,
                  colSpan: 6
                }); //, allowGrowX: true, colSpan: 6

                this.extPrint();
              } catch (e) {
                console.warn('PluginsLib.mhLoot.addLoadingLabel: ', e);
              }
            },
            addResourcesLabel: function (type) {
              //console.log('addResourcesLabel');
              try {
                this.extItems = [];
                var r = 0,
                  c = 0;
                var hp;
                var a;

                // DISTANCE
                a = this.Display.distanceArray;
                if (typeof (a) != 'undefined' && a.length > 0) {
                  for (var i in this.Display.distanceArray) {
                    c = 0;
                    this.extAdd(new qx.ui.basic.Label(this.Display.distanceArray[i].name).set({
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
                      this.extAdd(new qx.ui.basic.Label(this.Display.distanceArray[i].lbs[j]), {
                        row: r,
                        column: c
                      });
                      this.extAdd(new qx.ui.basic.Label(this.Display.distanceArray[i].val[j]), {
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
                    this.extAdd(new qx.ui.basic.Label(hp.name).set({
                      width: 200,
                      rich: true
                    }), {
                      row: r++,
                      column: c,
                      colSpan: 6
                    });
                    for (var j in hp.val) {
                      this.extAdd(hp.img[j], {
                        row: r,
                        column: c++
                      });
                      this.extAdd(new qx.ui.basic.Label(this.kMG(hp.val[j])).set({
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
                    this.extAdd(new qx.ui.basic.Label(hp.name).set({
                      width: 200,
                      rich: true
                    }), {
                      row: r++,
                      column: c,
                      colSpan: 6
                    });
                    this.extAdd(new qx.ui.basic.Label(this.kMG(hp.val[0])).set({
                      textAlign: 'left'
                    }), {
                      row: r,
                      column: c++
                    });
                    c = 2;
                    for (var j = 1; j < hp.val.length; j++) {
                      this.extAdd(hp.img[j - 1], {
                        row: r,
                        column: c++
                      });
                      this.extAdd(new qx.ui.basic.Label(this.kMG(hp.val[j])).set({
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
                    this.extAdd(new qx.ui.basic.Label(this.Display.infoArrays[i].name).set({
                      width: 200,
                      rich: true
                    }), {
                      row: r++,
                      column: c,
                      colSpan: 6
                    });
                    c = 1;
                    for (var j in this.Display.infoArrays[i].lbs) {
                      this.extAdd(new qx.ui.basic.Label(this.Display.infoArrays[i].lbs[j] + ' ' + this.Display.infoArrays[i].val[j]), {
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
                    this.extAdd(new qx.ui.basic.Label(this.Display.twoLineInfoArrays[i].name).set({
                      width: 200,
                      rich: true
                    }), {
                      row: r++,
                      column: c,
                      colSpan: 6
                    });
                    c = 1;
                    for (var j in this.Display.twoLineInfoArrays[i].lbs) {
                      this.extAdd(new qx.ui.basic.Label(this.Display.twoLineInfoArrays[i].lbs[j]), {
                        row: r,
                        column: c
                      });
                      this.extAdd(new qx.ui.basic.Label(this.Display.twoLineInfoArrays[i].val[j]), {
                        row: r + 1,
                        column: c
                      });
                      c += 2;
                    }
                    r += 2;
                  }
                }

                // WARNING
                c = 0;
                if (type == "r") {
                  this.extAdd(new qx.ui.basic.Label("<b style='color:white;font-size:10pt'>[*STORED DATA. WAIT...]</b>").set({
                    width: 200,
                    rich: true,
                    allowGrowX: true
                  }), {
                    row: r++,
                    column: c,
                    colSpan: 6
                  });
                }

                this.extPrint();

              } catch (e) {
                console.warn('PluginsLib.mhLoot.addResourcesLabel(): ', e);
              }
            },
            addFriendlyLabel: function (widget) {
              //console.log('addFriendlyLabel');
              try {
                this.extItems = [];
                var a;
                var r = 0,
                  c = 0;

                // DISTANCE
                a = this.Display.distanceArray;
                if (typeof (a) != 'undefined' && a.length > 0) {
                  for (var i in this.Display.distanceArray) {
                    c = 0;
                    this.extAdd(new qx.ui.basic.Label(this.Display.distanceArray[i].name).set({
                      width: 200,
                      rich: true
                    }), {
                      row: r++,
                      column: c,
                      colSpan: 6
                    });
                    c = 1;
                    for (var j in this.Display.distanceArray[i].lbs) {
                      this.extAdd(new qx.ui.basic.Label(this.Display.distanceArray[i].lbs[j]), {
                        row: r,
                        column: c
                      });
                      this.extAdd(new qx.ui.basic.Label(this.Display.distanceArray[i].val[j]), {
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
                    this.extAdd(new qx.ui.basic.Label(this.Display.twoLineInfoArrays[i].name).set({
                      width: 200,
                      rich: true
                    }), {
                      row: r++,
                      column: c,
                      colSpan: 6
                    });
                    c = 1;
                    for (var j in this.Display.twoLineInfoArrays[i].lbs) {
                      this.extAdd(new qx.ui.basic.Label(this.Display.twoLineInfoArrays[i].lbs[j]), {
                        row: r,
                        column: c
                      });
                      this.extAdd(new qx.ui.basic.Label(this.Display.twoLineInfoArrays[i].val[j]), {
                        row: r + 1,
                        column: c
                      });
                      c += 2;
                    }
                    r += 2;
                  }
                }

                this.extPrint();

              } catch (e) {
                console.warn('PluginsLib.mhLoot.addFriendlyLabel: ', e);
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
                if (!PluginsLib.mhOptionsPage) OptionsPage();

                if (!this.optionsTab) {
                  //Create Tab
                  this.optionsTab = PluginsLib.mhOptionsPage.getInstance();
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
                console.warn("MHTool.mhLoot.addLootPage: ", e);
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
                console.warn("MHTool.mhLoot.addButtons: ", e);
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
                console.warn("MHTool.mhLoot.loadOptions: ", e);
              }
            }
          } //members
        }); //Class     
      } catch (e) {
        console.warn("qx.Class.define(PluginsLib.mhLoot: ", e);
      }
      //======================================================= 
      // START
      // PluginsLib.mhLoot.getInstance();

      created = true;
    } //CreateClasses
    //=======================================================   
    // function LoadExtension() {
    // try {
    // if (typeof(qx) != 'undefined') {
    // //if (qx.core.Init.getApplication().getMenuBar() !== null) {
    // if (!!qx.core.Init.getApplication().getMenuBar()) {
    // CreateClasses();
    // return; // done
    // } 
    // }
    // } catch (e) {
    // if (typeof(console) != 'undefined') console.log('LoadExtension:',e);
    // else if (window.opera) opera.postError(e);
    // else GM_log(e);
    // }
    // window.setTimeout(LoadExtension, 1000); // force it
    // }
    // LoadExtension();
    function WaitForGame() {
      try {
        //if (typeof(PluginsLib) != 'undefined' && typeof(qx) != 'undefined' && typeof(qx.core) != 'undefined' && typeof(qx.core.Init) != 'undefined')
        if (typeof (qx) != 'undefined' && typeof (qx.core) != 'undefined' && typeof (qx.core.Init) != 'undefined') {
          var app = qx.core.Init.getApplication();
          if (app.initDone === true) {
            if (!created) CreateClasses();

            var plugin = PluginsLib[pluginName];
            var ready = true;
            if (plugin.REQUIRES.length > 0) {
              var req = plugin.REQUIRES.split(',');
              //check all requires
              for (var i in req) {
                //cci(req[i]);
                if (typeof (PluginsLib[req[i]]) == 'undefined') {
                  console.log(pluginName, '.WaitForGame.REQUIRES ', req[i], typeof (PluginsLib[req[i]]));
                  ready = false;
                  break; //WAIT
                }
              }
            }
            if (ready) {
              plugin.getInstance();
              plugin.SIZE = scriptSize;
              console.info("Plugin '" + plugin.getInstance().basename + "' READY");
              return; //DONE
            }
          }
        }
      } catch (e) {
        console.error('PluginsLib.' + pluginName, '.WaitForGame: ', e);
      }
      window.setTimeout(WaitForGame, 3000);
    }
    window.setTimeout(WaitForGame, 3000);
  }
  //=======================================================
  function Inject() {
    var script = document.createElement('script');
    var txt = injectBody.toString();
    txt = txt.replace('{', '{\r\n  var scriptSize=' + (txt.length + 22).toString() + ';');
    script.textContent = '(' + txt + ')();';
    script.type = 'text/javascript';
    document.head.appendChild(script);
  }
  Inject();
})();