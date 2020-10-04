// ==UserScript==
// @name            Tiberium Alliances Report Summary
// @version         20.07.17
// @description     Tool to view gains/losses on selected date/base. The Summaries are extracted from your combat reports.
// @namespace   	https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @include     	https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @author          Nogrod / DLwarez
// @contributor     NetquiK (https://github.com/netquik) 20.2 FIX
// ==/UserScript==

(function () {
    var ReportSummary_main = function () {
    console.log('ReportSummary loaded');
    function g() {
        for (var a = document.getElementsByTagName("script"), b = 0; b < a.length; b++)
            if (-1 != a[b].innerHTML.search(/ReportSummary/g)) {
                document.getElementsByTagName("head")[0].removeChild(a[b]);
                break
            }
    }

    function l() {
        qx.Class.define("ReportSummary.ResourceContainer", {
            extend: qx.ui.container.Composite,
            construct: function (a, b) {
                this.base(arguments);
                this.labels = {};
                this.images = {};
                this.setLayout(new qx.ui.layout.VBox);
                this.setDecorator("pane-light-plain");
                this.container = (new qx.ui.container.Composite(new qx.ui.layout.Grid)).set({
                    paddingLeft: 5,
                    paddingBottom: 5
                });
                for (var c = Object.keys(ClientLib.Base["EResourceType"]), d = c.length, f, e, h = 1; h < d; h++) f = ClientLib.Base.EResourceType[c[h]], e = ClientLib.Res.ResMain.GetInstance().GetResource(f), e = (new qx.ui.basic.Image(ClientLib.File.FileManager.GetInstance().GetPhysicalPath(e["i"]))).set({
                    toolTipText: c[h],
                    width: 22,
                    height: 22,
                    scale: !0
                }), this.container.add(e, {
                    row: f,
                    column: 0
                }), this.images[f] = e, e = new qx.ui.basic.Label(""), this.container.add(e, {
                    row: f,
                    column: 1
                }), this.labels[f] = e;
                this.add((new qx.ui.basic.Label("undefined" !== typeof a ? a : "Resources:")).set({
                    padding: 5
                }));
                this.add(this["container"]);
                this.C(b)
            },
            members: {
                labels: null,
                images: null,
                container: null,
                C: function (a) {
                    for (var b = 0; b < this.container.getLayout().getRowCount(); b++)
                        for (var c = 0; c < this.container.getLayout().getColumnCount(); c++) {
                            var d = this.container.getLayout().getCellWidget(b, c);
                            null !== d && d.exclude()
                        }
                    for (var b = null !== a && "undefined" !== typeof a ? a.length : 0, f = 0; f < b; f++) c = a[f], 0 < c.Count && (d = ClientLib.Base.Resource.IsResourceTypeTimeValue(c["Type"]) ? phe.cnc.Util.getTimespanString(ClientLib.Data.MainData.GetInstance().get_Time().GetTimeSpan(c.Count, !0)) : phe.cnc.gui.util.Numbers.formatNumbersCompact(c["Count"]), this.labels[c.Type].setValue(d), this.images[c.Type].setVisibility("visible"), this.labels[c.Type].setVisibility("visible"))
                }
            }
        });
        qx.Class.define("ReportSummary.Window", {
            extend: qx.ui.window.Window,
            construct: function (a) {
                this.base(arguments);
                this.k = a;
                this.B = {};
                this.cities = {};
                this.set({
                    layout: new qx.ui.layout.VBox,
                    caption: "ReportSummary",
                    icon: "webfrontend/ui/icons/efficiency_icons/icon_efficiency_storage.png",
                    minWidth: 175,
                    minHeight: 100,
                    contentPadding: 4,
                    contentPaddingTop: 0,
                    contentPaddingBottom: 3,
                    allowMaximize: !1,
                    showMaximize: !1,
                    allowMinimize: !1,
                    showMinimize: !1,
                    resizable: !0,
                    resizableTop: !1,
                    resizableBottom: !1,
                    useResizeFrame: !1
                });
                this.getChildControl("icon").set({
                    maxWidth: 24,
                    maxHeight: 24,
                    scale: !0
                });
                this.addListener("appear", this.Z, this);
                this.addListener("close", this.onClose, this);
                this.add(this.q = new qx.ui.form["SelectBox"]);
                this.q.add(new qx.ui.form.ListItem("Forgotten Attacks", null, ClientLib.Data.Reports.EPlayerReportType["NPCPlayerCombat"]));
                this.q.add(new qx.ui.form.ListItem("Offense", null, ClientLib.Data.Reports.EPlayerReportType["CombatOffense"]));
                this.q.add(new qx.ui.form.ListItem("Defense", null, ClientLib.Data.Reports.EPlayerReportType["CombatDefense"]));
                this.add(this.F = new qx.ui.form["SelectBox"]);
                this.F.add(this.cities.All = new qx.ui.form.ListItem("All", null, "All"));
                this.add(this.A = new qx.ui.form["SelectBox"]);
                this.A.add(this.B.All = new qx.ui.form.ListItem("All", null, "All"));
                this.add(this.Q = new qx.ui.form.Button("Check"));
                this.Q.addListener("execute", function () {
                    this.k.R()
                }, this);
                this.add(this.G = new qx.ui.basic.Label("Reports: 0/0"));
                this.G.setDecorator("pane-light-plain");
                this.G.setPadding(5);
                this.add(this.p = new qx.ui.basic.Label("Attacks: 0"));
                this.p.setDecorator("pane-light-plain");
                this.p.setPadding(5);
                this.p.exclude();
                this.add(this.P = new ReportSummary.ResourceContainer("Rewards:"));
                this.add(this.J = new ReportSummary.ResourceContainer("Costs:"));
                this.q.addListener("changeSelection", function () {
                    this.Reset();
                    this.A.removeAll();
                    this.B = {};
                    this.A.add(this.B.All = new qx.ui.form.ListItem("All", null, "All"));
                    this.k.R()
                }, this)
            },
            destruct: function () {},
            members: {
                k: null,
                P: null,
                J: null,
                Q: null,
                q: null,
                F: null,
                A: null,
                G: null,
                p: null,
                B: null,
                cities: null,
                Reset: function () {
                    this.p.exclude();
                    this.P.C(null);
                    this.J.C(null)
                },
                Z: function () {
                    phe.cnc.base.Timer.getInstance().addListener("uiTick", this.onTick, this)
                },
                onClose: function () {
                    phe.cnc.base.Timer.getInstance().removeListener("uiTick", this.onTick, this)
                },
                onTick: function () {
                    this.fa();
                    this.G.setValue("Reports: " + this.k.L + "/" + this.k["K"]);
                    var a = this.A.getSelection(),
                        b = this.F.getSelection();
                    0 < a.length && 0 < b.length ? (b = this.q.getSelection()[0].getModel() == ClientLib.Data.Reports.EPlayerReportType.NPCPlayerCombat ? b[0].getModel() : b[0].getLabel(), "undefined" === typeof this.k.g[b] || "undefined" === typeof this.k.g[b][a[0].getModel()] ? this.Reset() : (this.p.setValue("Attacks: " + this.k.g[b][a[0].getModel()]["count"]), this.p.setVisibility("visible"), this.P.C(this.k.g[b][a[0].getModel()]["M"]), this.J.C(this.k.g[b][a[0].getModel()]["I"]))) : this.p.exclude()
                },
                fa: function () {
                    if ("undefined" !== typeof this.k.g && "undefined" !== typeof this.k.g["All"])
                        for (var a = Object.keys(this.k.g["All"]), b = a.length, c = 0; c < b; c++) this.B.hasOwnProperty(a[c]) || this.A.add(this.B[a[c]] = new qx.ui.form.ListItem(a[c], null, a[c]));
                    var a = ClientLib.Data.MainData.GetInstance().get_Cities().get_AllCities().d,
                        d;
                    for (d in a) b = a[d], this.cities.hasOwnProperty(b.get_Id()) || this.F.add(this.cities[b.get_Id()] = new qx.ui.form.ListItem(b.get_Name(), null, b.get_Id()));
                    this.Q.setEnabled(!this.k["scanning"])
                }
            }
        });
        qx.Class.define("ReportSummary.Tool", {
            type: "singleton",
            extend: qx.core.Object,
            members: {
                button: null,
                reports: null,
                window: null,
                g: null,
                K: 0,
                L: 0,
                scanning: !1,
                T: function () {
                    this.g = {};
                    this.window = new ReportSummary.Window(this);
                    this.reports = (new ClientLib.Data.Reports["Reports"]).$ctor();
                    this.reports.Init();
                    this.reports.add_ReportsDelivered(phe.cnc.Util.createEventDelegate(ClientLib.Data.Reports.ReportsDelivered, this, this["ea"]));
                    this.reports.add_ReportDelivered(phe.cnc.Util.createEventDelegate(ClientLib.Data.Reports.ReportDelivered, this, this["ca"]));
                    this.button = (new qx.ui.form.Button(null, "webfrontend/ui/icons/efficiency_icons/icon_efficiency_storage.png")).set({
                        padding: 0,
                        toolTipText: "ReportSummary"
                    });
                    this.V(this["button"]);
                    this.button.addListener("execute", function () {
                        this.R();
                        this.window.open()
                    }, this);
                    g()
                },
                V: function (a) {
                    var b = qx.core.Init.getApplication();
                    b.getDesktop().add(a, {
                        top: 230,
                        left: b.getLeftBar().getBounds().width + 5
                    })
                },
                R: function () {
                    this.scanning || (this.scanning = !0, this.g = {}, this.L = this.K = 0, this.window.Reset(), ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("GetReportCount", {
                        playerReportType: this.window.q.getSelection()[0].getModel()
                    }, phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, this["aa"]), null))
                },
                aa: function (a, b) {
                    null !== b && 0 < b ? (this.K = b, this.reports.RequestReportHeaderDataAll(this.window.q.getSelection()[0].getModel(), 0, b, ClientLib.Data.Reports.ESortColumn.Time, !0)) : this.scanning = !1
                },
                ea: function (a) {
                    for (var b = 0; null !== a && b < a.length; b++) this.reports.RequestReportData(a[b].get_Id());
                    this.scanning = !1
                },
                ca: function (a) {
                    this.L++;
                    for (var b = Object.keys(ClientLib.Base["EResourceType"]), c = b.length, d = phe.cnc.Util.getDateTimeString(new Date(a.get_Time())), f = [], e = [], h = 1; h < c; h++) {
                        var g = ClientLib.Base.EResourceType[b[h]];
                        f.push({
                            Type: g,
                            Count: a.get_ReportType() == ClientLib.Data.Reports.EReportType.NPCPlayerCombat ? a.GetDefenderTotalResourceCosts(g) : a.GetAttackerTotalResourceReceived(g)
                        });
                        a.get_ReportType() == ClientLib.Data.Reports.EReportType.NPCPlayerCombat && e.push({
                            Type: g,
                            Count: a.GetDefenderRepairCosts(g)
                        })
                    }
                    a.get_ReportType() != ClientLib.Data.Reports.EReportType.NPCPlayerCombat && (e = this.H(null, a.GetAttackerInfantryRepairCosts()), e = this.H(e, a.GetAttackerVehicleRepairCosts()), e = this.H(e, a.GetAttackerAirRepairCosts()));
                    a = a.get_ReportType() == ClientLib.Data.Reports.EReportType.NPCPlayerCombat ? a.get_DefenderBaseId() : a.get_AttackerBaseName();
                    this.U(a, d, f, e)
                },
                H: function (a, b) {
                    var c = [],
                        d;
                    for (d in b["d"]) c.push({
                        Type: d,
                        Count: b.d[d]
                    });
                    return ClientLib.API.Util.MergeResourceCosts(a, c)
                },
                U: function (a, b, c, d) {
                    this.D(a, b, c, d);
                    this.D(a, "All", c, d);
                    this.D("All", b, c, d);
                    this.D("All", "All", c, d)
                },
                D: function (a, b, c, d) {
                    this.g.hasOwnProperty(a) || (this.g[a] = {});
                    this.g[a].hasOwnProperty(b) || (this.g[a][b] = {
                        count: 0,
                        M: null,
                        I: null
                    });
                    this.g[a][b].M = ClientLib.API.Util.MergeResourceCosts(this.g[a][b].M, c);
                    this.g[a][b].I = ClientLib.API.Util.MergeResourceCosts(this.g[a][b].I, d);
                    this.g[a][b].count++
                }
            }
        })
    }

    function k() {
        try {
            "undefined" !== typeof qx && "" !== ClientLib.Data.MainData.GetInstance().get_Player().get_Name() ? (l(), ReportSummary.Tool.getInstance().T()) : setTimeout(k, 1E3)
        } catch (a) {
            "undefined" !== typeof console ? console.log(a + ": " + a["stack"]) : window.opera ? opera.postError(a) : GM_log(a)
        }
    }
    setTimeout(k, 1E3)
}
try {
    var ReportSummary_script = document.createElement("script");
    ReportSummary_script.innerHTML = "(" + ReportSummary_main.toString() + ")();";
    ReportSummary_script.type = "text/javascript";
    if (/commandandconquer\.com/i.test(document.domain)) {
        document.getElementsByTagName("head")[0].appendChild(ReportSummary_script);
    }
} catch (e) {
    console.log("ReportSummary_script: init error: ", e);
}
})();