// ==UserScript==
// @name            Tiberium Alliances Battle Simulator V2
// @description     Allows you to simulate combat before actually attacking.
// @author          Eistee & TheStriker & VisiG & Lobotommi & XDaast
// @version         22.05.04
// @contributor     zbluebugz (https://github.com/zbluebugz) changed cncopt.com code block to cnctaopt.com code block
// @contributor     NetquiK (https://github.com/netquik) (see first comment for changelog)
// @namespace       https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @include         https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @icon            http://eistee82.github.io/ta_simv2/icon.png
// @updateURL       https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/master/TA_Tiberium_Alliances_Battle_Simulator_V2.user.js
// ==/UserScript==

/* 
codes by NetquiK
----------------
- MovableBox Save Position
- New Top Bar Button
- Native Unit Enabling
- Skip Victory
- 20.2 FIX + MAP MOVE
- MovableBox in Battleground
- Some Sim Presets Fixes+
- Fix for Sim View with Autorepair
- Fix open/close stats for replays
- Back Button fix also for replays
- Skip Button removed
- Patch for 22.2
- NOEVIL for all code
- New Fixes for simulation + ReplayBar + Date hidden
- New SkipSimulation Function
----------------
*/

(function () {
    var script = document.createElement("script");
    script.innerHTML = "(" +
        function () {
            function createClasses() {
                qx.Class.define("qx.ui.form.ModelButton", { //				qx.ui.form.Button with model property
                    extend: qx.ui.form.Button,
                    include: [qx.ui.form.MModelProperty],
                    implement: [qx.ui.form.IModel]
                });
                qx.Class.define("TABS", { // [singleton]	Main Class
                    type: "singleton",
                    extend: qx.core.Object,
                    construct: function () {
                        try {
                            this.base(arguments);
                            this.self(arguments).Init();
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up TABS constructor", e);
                            console.groupEnd();
                        }
                    },
                    statics: {
                        _Init: [],
                        addInit: function (func) {
                            this._Init.push(func);
                        },
                        Init: function () {
                            for (var i in this._Init)
                                qx.Class.getByName(this._Init[i]).getInstance();
                        }
                    }
                });
                qx.Class.define("TABS.RES", { // [static]		Ressources
                    type: "static",
                    statics: {
                        getDisplayName: function (ETechName, EFactionType) {
                            return ClientLib.Base.Tech.GetTechDisplayNameFromTechId(ClientLib.Base.Tech.GetTechIdFromTechNameAndFaction(ETechName, EFactionType));
                        }
                    }
                });
                qx.Class.define("TABS.RES.IMG", { // [static]		Ressources: Images
                    type: "static",
                    statics: {
                        Menu: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAADAFBMVEUAAAAAAAAAAAAABgAAAgACDQAAAAAAAAAAAAAAAAAAAAAAAQCV3icGGAETNwQIDAIAAAABBgBwsi9KghoUKwZFih0YVQlpph4iZAksYg8AAQACCABlmxmr0ieayiuM3SFMsBR/wymM0CFtsSQ5bhVFfRgRNQaY1DOLzCZYiRVJqhSDuylc2RiQzCSb2S9epyqVzjOi4TgWZQwecxIGLQQEFgJJgB07exh3niGHwCSv0zG01y////9RkhuX+yaR/iGd2zj///2hpEb//vNllSRijx9yoS5s2RdpmyhorB6GpDjE5GKL2Spjoh9y5h1hqRd36h9nniGm/Stv6Rhc2BNn7hGs/yhwzh6ttUvy5Z24sFvD01vo3Y2zvk61r2X9+emoqEvHuXytqFv58cmswFG9x1JS3Q3DuXCTmkSgvUL49L6LqEaWr09osh2P/idTpxV3pym2ymr1/NqPuje3vV2ewFB2tSWWrEN8mjZupyv7+9iCsy3z+rpplCZs3hqjyUaFnDHY63uJzi6AvivP3W6On0KRrDlcsRDK32CY/yeS9SJitRSHwzHc5Y+Ot0JlmiOg7TWAozB4rSqC4huWp0qz2E1bxxNanR6s2Ex/+hZi4Q9zySKc0EB5zyFgqCOq8jJ4+xKf+yVVnRpMsBJooyij4D6F0iqr0lNt9BlzwyFz9hSM/Rt72CJo+g+ysVF3rivWxmyEqzLt3qJwvCPMw4O6r3BJihSwzE/Bw3fXzYja2I3QwHqpuFnj6Zd7oTCCmC+0ymbl04zLv2zx3qHz8Kzs3pehrUjK33ieskrp7ax99CK502j7/tDI2GdajhpHkhFquCNj1xSnsE/M6G7i8KJXkxl4nSajq1qz9jW+6FLL9Fjb9W2530+btEJhwxiS2jRsrx9/2yZGvQxy1h3L5mW24U1foRtSzg2oyVZWrhZevxFLnheO9x+B+xxo5hac4TyVyTt/yy5f0Bej9jGu/TS5/zJxqymF4ix86xxvwx168RNW0hGh4Cqb3yl69R2T+iQ+CJL9AAAAPHRSTlMAERguJDYNAQgEFSn2P1dIHDytf0uNaLV4iB8ypdnX6Lbe3sJ2gVDp6ZKoxufO9ann+JScbl2lpMXW4/FzYe/CAAACJklEQVQoz2IAA3YOAV4TYzNzI1NWLk4GBOBkEtE3/BIWFvb1s4EoKxs7TJyDRXRC59rQAL+A4BULgtTFmDih6pmFOlfVLVvmsNThvc/jYPv5qgLsYHEWoby02U1Nc2ZM9X7y1MHHfeYNFS6QDKPw/5DNPc3126NTzrZ03Lm11N1ughoHUANArDxpuWXVxZnREamxqS2Ntx18/Oy1WdgZ2IS78j3Xb0yJjViXEJN1ssP75tyHM+fzcTCw6D73rSwoL3Fyiop0trEpuux9f827hTJcDIKTFz8L3Od1LCFqQ7wNEFyZOmPu919yLAz8bxYF9ruVnig5FOkIkqhZPmf2mlBraQb+t7bTfUsLG48cPWwDAlUvPvwM//dXEDAG/tWv51X2HT9jE38wGajFubdv+crwVX+AEisWz1uSc7rIxjlm96bkrN671T0fw9daMTMw6zya7pJ9oMaxamdiemL6pbb65lefVltIMTBp+dl6uGQX7t21ZWtcklPDteL2lbOCJBkZOPhO5bvVuubs2RGXlJGxvy2zrPveAj1WTgZ2KYUAWw/XiorWKddbG8onTsrtBmkAxQavvPs2l3OutVO8vLwKPP3bL9orc4NjhI2PZ/L5q/1uHoG+kx74X6jLU+TlgEQ4o4hS17RFtkv8v3m+nBa6UJwVKA6RYZPW5LH7EfI7JNjeTkOChQMpNXCxSojLycpayogxM4LjFSHFJsDNzc3CxAZLPQCSE8MJTTlJqQAAAABJRU5ErkJggg==",
                        Stats: "FactionUI/icons/icn_build_slots.png",
                        Stop: "FactionUI/icons/icon_replay_stop_button.png",
                        Arrange: {
                            Left: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAMAAABBPP0LAAAA+VBMVEUAAABkZGT19fX39/fj4+MVFRXc3NwZGRlLS0sVFRXd3d0LCwvu7u7JycmioqKIiIgkJCSIiIj///9WVlb7+/vW1tbx8fHo6Ohqampubm7MzMx1dXX///+tra0eHh6srKyzs7N6enrNzc309PS7u7v7+/vQ0NC/v7/ExMT7+/tgYGChoaHu7u5bW1vs7OzAwMB0dHSsrKzS0tJ1dXWsrKxFRUUpKSkmJiahoaHAwMCampomJibV1dWJiYm5ubk0NDQ3Nzfp6en///+vr69BQUGTk5NBQUHj4+PX19f+/v7Jycnj4+PR0dHc3NyXl5eMjIz09PSCgoIyMjIoy70QAAAAU3RSTlMADweHhxMFCgIDhwUbAgsODh4UHoeHh4cFCgQUChQeD4cchw6HDw8ehx4vOoc8hzw6PDwKhxQaKB4UGh4ZKCgyHhQoNSgyOSiHNYc8hzU8PDw8EBrmavEAAACkSURBVAjXJYtVFoJQAEQfgoh0iYggIgJSit3dHftfjI/D/M3cO4DBddtxbNc1TY7rqwTQdJH2fZr2vIlgVSsEyImyjKKK0i5jZKmBqHDYXT/3XqcbHpeZQaNQiFIeSMNCEeS25yfkr28SHOb5dFgoUfZvNeuDHwXw6WofvpM4Pq3HtdTADQwjL48b5LBTBGBYYyZYkrQZpRiG0ViWQxCE5yGG/Q+LDRO5PtzwzwAAAABJRU5ErkJggg==",
                            Center: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAMAAABBPP0LAAAA51BMVEU6OjpTU1P///9MTEz39/f8/Pz+/v7///9TU1MAAADv7+/7+/uVlZWDg4MvLy/39/fj4+MvLy/9/f3e3t7X19c9PT3U1NStra2ZmZlkZGTo6Oj09PRxcXGVlZXOzs7Ly8t+fn7c3NyZmZnc3NyysrL8/Pyenp6JiYlZWVm/v7/Pz8+7u7vo6Oj4+PiTk5Pj4+PT09Ps7Ozv7+/JycnT09PAwMB+fn7b29t1dXWTk5P////j4+M+Pj5PT0////+kpKSFhYWenp7Kysq1tbX////+/v62trbBwcHf39/CwsLk5ORubm5TU1MeHJAiAAAATXRSTlMCHocFAgoPAw0AhwUNDw8NDR4eh4c7Hjs8O4eHCgoFChkDDxOHhx4eLw+Hhx6HOoeHhzqHOjw8hxQUFBkSGhoaIy8vhy8jHocvh4c8PH2ldZMAAACpSURBVAjXHYzXAkIAFECvvUIUJRWZmYnS3nv8//dEz2cAzhEiSYrNILAsvo8BUMR6L8uxqt4931z2ATjSdZNEZ6e9Sasd8hhQonzN89m80+2mJ69RJeQN1XW29261M/TIA4ya8bPm5UfTxggNMLTZul9kYfGInC1WGeq5k5baV1GUv4ETG7TaF6/o4qDmAIChCPvgI4gkSbuVQTHA4JzR4GlaEAR6MMSZHypxEyTcEZPmAAAAAElFTkSuQmCC",
                            Right: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAALCAMAAABBPP0LAAAA9lBMVEXw8PAODg7s7OzW1tbs7OxgYGD9/f0AAABPT08VFRUBAQHU1NTk5OQAAABwcHD9/f38/PxfX1/7+/v9/f3S0tKjo6MRERE/Pz/AwMDp6enIyMh0dHRubm709PTR0dGSkpKmpqZBQUFubm66urro6OjOzs6xsbH19fXd3d3Hx8dBQUGhoaGGhobw8PBWVlb///8AAAB1dXWenp6vr69nZ2cAAAAKCgoiIiIHBwetra1dXV2hoaFnZ2e1tbUpKSmxsbEVFRX39/fPz8+MjIw3Nze6uropKSnY2NjY2Njj4+NkZGTQ0NDe3t6ysrKvr6/R0dGXl5fDw8OkAsOLAAAAUnRSTlMCDoeHBQUKAAIGCQqHFAoPFBSHHg8PHhyHh4c7DQ4UHocPGh4ehyiHhx48OjyHPBoaFIcSCigZFDWHKB41hyiHPCiHMjWHPB4tMjyHhzI8OTw8yAOJWAAAAKdJREFUCNcli1UCgkAABVcBWVBBGglJQULs7u66/2UEfZ/zZgBACzpN6zwvCIJGYRCAQqXFce4pcGaG3aEgQGmWZX2/ma+WGkidwTKD21xen2cUq/PpH7jn7L8jN0WWCACKtcB7RO9YTcL9ckQAlM9nd9or8mIyJDPD8XbqNQmP6/GgnCZosWcgW0U+rEyzmwIcxyHF2JIkimK7TMIfwPqaZeXSkQT8Aiw9E02m3A8KAAAAAElFTkSuQmCC"
                        },
                        Arrows: {
                            Up: "webfrontend/theme/arrows/up.png",
                            Down: "webfrontend/theme/arrows/down.png",
                            Left: "webfrontend/theme/arrows/left.png",
                            Right: "webfrontend/theme/arrows/right.png"
                        },
                        //Added by Netquik
                        Arrows2: {
                            Up: "FactionUI/icons/icon_step_up_button.png",
                            Down: "FactionUI/icons/icon_step_down_button.png",
                            Left: "FactionUI/icons/icon_step_left_button.png",
                            Right: "FactionUI/icons/icon_step_right_button.png",
                        },
                        Flip: {
                            H: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOvgAADr4B6kKxwAAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAACo0lEQVQ4T2PABkJq+rjmH7nUdPrV119nXn/9s+7S/R1NCzc4rTx1a8ay41c7WuYsl5WRkWGEKicM4honSux7+Pb42Tdf/4LwwacfP7Wv3pOz8sydVavO3lk5f9cx15jCGhaocsJgys7jAUeffXiGZODn1lW7Claeub16xelb64C4Ma+lnx+qHD/wySpjXnnqeifQq79RDFy5qxBq4PqVp25Ombxmhw4QQHXhAdH1fWL77r++DDToD04Dz9xeteDAuajc1gn4ve0UkciU3zvT4vTrb79ghmEzEOTtNefvL8pomyrExsYG1Y0FxNT18my4dH8KKGYJGLgeGDkrJqzeoR9ZWMMM1Y4Jercctjr46N1NZMNwGQhy5YpTN/PzWvu5oNpRgUdGGdOc/WfST736guJdPAauX3HiekfH4vXyUCNQQVhtn8D2W8+2nEGKDEIGgrw9a+cxeyUlJdRE7pldxZjcOlXj6LOPj9ENw2cgkL9m2dHL2TGljZxQoyAgrKaHdfmZWxVA734jxUAQXnXm9tS6yXMlTG2doKYBQWrrZIHNVx4sBWrG8C4I4zNw5enbi+ftPuGSVNGMiO2edXstjz3/9BabYSBMwMC1y09cr2pbvFEIbJh/RinrlI1744CRAc9q6BifgSC8+tzdpT1rdmuAE3l80yTZ/UglCzZMyECQ+MID58NiyprYGGbuO5t1/MWn99gMgmFCBoLwytO3Wir6ZggzLDpycQJyyYINH3r66WP7mj25wPDCZ+DsSRv2WTAsPHCmChgh7068/PwTGz4OlFtz+npX7/p9LstP3WwA4hZseMXp2w3Td56wYyho6lSdsfNY6YzdJydM330CBYPEQHIVnROVIzMLOIvb+oVq+meIVPVOQ8EgsYqeqUJJpfWcAKWymA2EsiGlAAAAAElFTkSuQmCC",
                            V: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOvgAADr4B6kKxwAAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAAClklEQVQ4T2MgB/iVd7CH1/SI9G3YF7D4+JUlR59/+nH61dff8w6cnQBVgh+EN01hjGqZxpY9eYlI39YjNvMOni888Ojd0aNP3z8+8/rr77Nvvv498+brn/n7T0+HasEOIlpnMIc1TBIJq+vX3HjtSd/ma4/WnHj59TtQM9gQZAwycO7ekzOhWhHAo6CRKaymh6d69krVWfvOpO19+O700WcfYS75g24QDGMYCPQWS1TzFKmktmkmO26/XLHv3sujwHD5CVSM0xBkDDcwqLJLcMHxa/FLT17rOPz04/PTb779wqaBEIYbOHv/2ZxjLz6/BglgU0gshhu44MDZaUABigwDYbCB+07NZJi29WDFvrsvLu+78/waDnwdixgmBpoxbduhMgav6ETZyNxSm+j8creoPPJwdH4FkC6z9o1NlWaYsnGf0ZpzdyeuOnt3GSUYZMZUoFkMk7ceDV555s6KFadvrQPi9eRioBmrpu44EcLQvHijweJDFzJWnrrRu/LM7VVASbIMBupdPWX78TAGt8Bw1oSsfL6qCbMUp2855Lvk+LXGFaduTgcpACpci64RF4YbCALe3t6MLi4uTC6BEZwhqXnC3Us3ms7acSxi+YlrLaDwgRqO1SAYRjEQGYAMB2JmN08v9vCMAuGWafPVFu4/E7H8+NWaVWduz11x+vYakgyEAaChDEBXM3r5+rOGJmVwlzZ1Svav2m656NDFghWnbk0FGrAEaBAoSMBhTtBAdAByuZOrO4t7eDxfWlWz7IztR70WHDiXA3T1jFVn76wE4hVTtx8PhionDoBc7eDgwODq4ckcFJPEHp9TJNA0e5n6tPU77ZcfvZLaNnupClQpeQDkaktLS2Y3Hz9Ov8h4XltnV3YAMTRvewY5T1wAAAAASUVORK5CYII="
                        },
                        //Added by Netquik
                        Flip2: {
                            H: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOvgAADr4B6kKxwAAAABp0RVh0U29mdHdhcmUAUGFpbnQuTkVUIHYzLjUuMTAw9HKhAAACo0lEQVQ4T2PABkJq+rjmH7nUdPrV119nXn/9s+7S/R1NCzc4rTx1a8ay41c7WuYsl5WRkWGEKicM4honSux7+Pb42Tdf/4LwwacfP7Wv3pOz8sydVavO3lk5f9cx15jCGhaocsJgys7jAUeffXiGZODn1lW7Claeub16xelb64C4Ma+lnx+qHD/wySpjXnnqeifQq79RDFy5qxBq4PqVp25Ombxmhw4QQHXhAdH1fWL77r++DDToD04Dz9xeteDAuajc1gn4ve0UkciU3zvT4vTrb79ghmEzEOTtNefvL8pomyrExsYG1Y0FxNT18my4dH8KKGYJGLgeGDkrJqzeoR9ZWMMM1Y4Jercctjr46N1NZMNwGQhy5YpTN/PzWvu5oNpRgUdGGdOc/WfST736guJdPAauX3HiekfH4vXyUCNQQVhtn8D2W8+2nEGKDEIGgrw9a+cxeyUlJdRE7pldxZjcOlXj6LOPj9ENw2cgkL9m2dHL2TGljZxQoyAgrKaHdfmZWxVA734jxUAQXnXm9tS6yXMlTG2doKYBQWrrZIHNVx4sBWrG8C4I4zNw5enbi+ftPuGSVNGMiO2edXstjz3/9BabYSBMwMC1y09cr2pbvFEIbJh/RinrlI1744CRAc9q6BifgSC8+tzdpT1rdmuAE3l80yTZ/UglCzZMyECQ+MID58NiyprYGGbuO5t1/MWn99gMgmFCBoLwytO3Wir6ZggzLDpycQJyyYINH3r66WP7mj25wPDCZ+DsSRv2WTAsPHCmChgh7068/PwTGz4OlFtz+npX7/p9LstP3WwA4hZseMXp2w3Td56wYyho6lSdsfNY6YzdJydM330CBYPEQHIVnROVIzMLOIvb+oVq+meIVPVOQ8EgsYqeqUJJpfWcAKWymA2EsiGlAAAAAElFTkSuQmCC",
                            V: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAOCAMAAAD32Kf8AAAAA3NCSVQICAjb4U/gAAAA51BMVEX////u1ZNVVVVUVF5TU2Du1ZNVVVVUVF7u1ZNVVVVUVF5UVFlTU2Du1ZPs05LbxY21pXykl3t6dG5UVF5TU2Ds05JUVF5UVFnq0ZHp0ZHnz5BUVFpUVF5TU2Dnz5BUVF5TU2Dnz5DlzY/Zw4qaj3FUVFlTU2Dp0ZHlzY/jy45TU2JTU2DlzY+ckHeNhGyLgmt0b2tiYF1TU2BTU13lzY+EfGluamBTU2Dnz5DlzY/Uv4lva2hrZ2Tp0ZHnz5BsaGbp0ZHnz5DQvIe5qX6VinOPhnGFfmzu1ZPs05Lt05Pq0ZHWwYrUv4k2s1xpAAAATXRSTlMAERERESIiIjMzMzMzRERERERERERVVVVmZmZmZmZ3d3eIiIiIiIiZmZmZmaqqqqqqqqqqu7u7u8zMzMzM3d3d7u7u7u7u7v///////2WvYGIAAAAJcEhZcwAADpwAAA6cAQeUU90AAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzbovLKMAAAAqklEQVQYlV3O6RaBUBSG4UrpiMwyRqZMmTIlJBlOhvu/HmdLVnl/Pt/aa22K+kbTHELJcnPQTjMecBwSC5WWtjSsk212omCoVO9rW4uAe8cYO5MYUdQ7WPbDxX7OFFQ0cChPU+bzFey8As2ML9dgtzVodrY7BtvPQROKrm8CLbqgbF5WFFUd+o2q8C/F8ryQk2oymWBTPf3ERniBbGRqFBkqFAtHUvxPf70BysEmbzfULiYAAAAASUVORK5CYII="
                        },
                        DisableUnit: "FactionUI/icons/icon_disable_unit.png",
                        Undo: "FactionUI/icons/icon_refresh_funds.png",
                        Outcome: {
                            total_defeat: "FactionUI/icons/icon_reports_total_defeat.png",
                            victory: "FactionUI/icons/icon_reports_victory.png",
                            total_victory: "FactionUI/icons/icon_reports_total_victory.png"
                        },
                        Enemy: {
                            All: "FactionUI/icons/icon_arsnl_show_all.png",
                            Base: "FactionUI/icons/icon_arsnl_base_buildings.png",
                            Defense: "FactionUI/icons/icon_def_army_points.png"
                        },
                        Defense: {
                            Infantry: "FactionUI/icons/icon_arsnl_def_squad.png",
                            Vehicle: "FactionUI/icons/icon_arsnl_def_vehicle.png",
                            Building: "FactionUI/icons/icon_arsnl_def_building.png"
                        },
                        Offense: {
                            Infantry: "FactionUI/icons/icon_arsnl_off_squad.png",
                            Vehicle: "FactionUI/icons/icon_arsnl_off_vehicle.png",
                            Aircraft: "FactionUI/icons/icon_arsnl_off_plane.png",
                            //DS-MOd
                            ResetFormLine: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAAK/INwWK6QAAABl0RVh0U29mdHdhcmUAQWRvYmUgSW1hZ2VSZWFkeXHJZTwAAAAfSURBVHjaYvz//z8DJYCJgUIwasCoAaMGDBYDAAIMAGOaAx1bYuPGAAAAAElFTkSuQmCC",
                            ResetFormation: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAKOWlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAEjHnZZ3VFTXFofPvXd6oc0wAlKG3rvAANJ7k15FYZgZYCgDDjM0sSGiAhFFRJoiSFDEgNFQJFZEsRAUVLAHJAgoMRhFVCxvRtaLrqy89/Ly++Osb+2z97n77L3PWhcAkqcvl5cGSwGQyhPwgzyc6RGRUXTsAIABHmCAKQBMVka6X7B7CBDJy82FniFyAl8EAfB6WLwCcNPQM4BOB/+fpFnpfIHomAARm7M5GSwRF4g4JUuQLrbPipgalyxmGCVmvihBEcuJOWGRDT77LLKjmNmpPLaIxTmns1PZYu4V8bZMIUfEiK+ICzO5nCwR3xKxRoowlSviN+LYVA4zAwAUSWwXcFiJIjYRMYkfEuQi4uUA4EgJX3HcVyzgZAvEl3JJS8/hcxMSBXQdli7d1NqaQffkZKVwBALDACYrmcln013SUtOZvBwAFu/8WTLi2tJFRbY0tba0NDQzMv2qUP91829K3NtFehn4uWcQrf+L7a/80hoAYMyJarPziy2uCoDOLQDI3fti0zgAgKSobx3Xv7oPTTwviQJBuo2xcVZWlhGXwzISF/QP/U+Hv6GvvmckPu6P8tBdOfFMYYqALq4bKy0lTcinZ6QzWRy64Z+H+B8H/nUeBkGceA6fwxNFhImmjMtLELWbx+YKuGk8Opf3n5r4D8P+pMW5FonS+BFQY4yA1HUqQH7tBygKESDR+8Vd/6NvvvgwIH554SqTi3P/7zf9Z8Gl4iWDm/A5ziUohM4S8jMX98TPEqABAUgCKpAHykAd6ABDYAasgC1wBG7AG/iDEBAJVgMWSASpgA+yQB7YBApBMdgJ9oBqUAcaQTNoBcdBJzgFzoNL4Bq4AW6D+2AUTIBnYBa8BgsQBGEhMkSB5CEVSBPSh8wgBmQPuUG+UBAUCcVCCRAPEkJ50GaoGCqDqqF6qBn6HjoJnYeuQIPQXWgMmoZ+h97BCEyCqbASrAUbwwzYCfaBQ+BVcAK8Bs6FC+AdcCXcAB+FO+Dz8DX4NjwKP4PnEIAQERqiihgiDMQF8UeikHiEj6xHipAKpAFpRbqRPuQmMorMIG9RGBQFRUcZomxRnqhQFAu1BrUeVYKqRh1GdaB6UTdRY6hZ1Ec0Ga2I1kfboL3QEegEdBa6EF2BbkK3oy+ib6Mn0K8xGAwNo42xwnhiIjFJmLWYEsw+TBvmHGYQM46Zw2Kx8lh9rB3WH8vECrCF2CrsUexZ7BB2AvsGR8Sp4Mxw7rgoHA+Xj6vAHcGdwQ3hJnELeCm8Jt4G749n43PwpfhGfDf+On4Cv0CQJmgT7AghhCTCJkIloZVwkfCA8JJIJKoRrYmBRC5xI7GSeIx4mThGfEuSIemRXEjRJCFpB+kQ6RzpLuklmUzWIjuSo8gC8g5yM/kC+RH5jQRFwkjCS4ItsUGiRqJDYkjiuSReUlPSSXK1ZK5kheQJyeuSM1J4KS0pFymm1HqpGqmTUiNSc9IUaVNpf+lU6RLpI9JXpKdksDJaMm4ybJkCmYMyF2TGKQhFneJCYVE2UxopFykTVAxVm+pFTaIWU7+jDlBnZWVkl8mGyWbL1sielh2lITQtmhcthVZKO04bpr1borTEaQlnyfYlrUuGlszLLZVzlOPIFcm1yd2WeydPl3eTT5bfJd8p/1ABpaCnEKiQpbBf4aLCzFLqUtulrKVFS48vvacIK+opBimuVTyo2K84p6Ss5KGUrlSldEFpRpmm7KicpFyufEZ5WoWiYq/CVSlXOavylC5Ld6Kn0CvpvfRZVUVVT1Whar3qgOqCmrZaqFq+WpvaQ3WCOkM9Xr1cvUd9VkNFw08jT6NF454mXpOhmai5V7NPc15LWytca6tWp9aUtpy2l3audov2Ax2yjoPOGp0GnVu6GF2GbrLuPt0berCehV6iXo3edX1Y31Kfq79Pf9AAbWBtwDNoMBgxJBk6GWYathiOGdGMfI3yjTqNnhtrGEcZ7zLuM/5oYmGSYtJoct9UxtTbNN+02/R3Mz0zllmN2S1zsrm7+QbzLvMXy/SXcZbtX3bHgmLhZ7HVosfig6WVJd+y1XLaSsMq1qrWaoRBZQQwShiXrdHWztYbrE9Zv7WxtBHYHLf5zdbQNtn2iO3Ucu3lnOWNy8ft1OyYdvV2o/Z0+1j7A/ajDqoOTIcGh8eO6o5sxybHSSddpySno07PnU2c+c7tzvMuNi7rXM65Iq4erkWuA24ybqFu1W6P3NXcE9xb3Gc9LDzWepzzRHv6eO7yHPFS8mJ5NXvNelt5r/Pu9SH5BPtU+zz21fPl+3b7wX7efrv9HqzQXMFb0ekP/L38d/s/DNAOWBPwYyAmMCCwJvBJkGlQXlBfMCU4JvhI8OsQ55DSkPuhOqHC0J4wybDosOaw+XDX8LLw0QjjiHUR1yIVIrmRXVHYqLCopqi5lW4r96yciLaILoweXqW9KnvVldUKq1NWn46RjGHGnIhFx4bHHol9z/RnNjDn4rziauNmWS6svaxnbEd2OXuaY8cp40zG28WXxU8l2CXsTphOdEisSJzhunCruS+SPJPqkuaT/ZMPJX9KCU9pS8Wlxqae5Mnwknm9acpp2WmD6frphemja2zW7Fkzy/fhN2VAGasyugRU0c9Uv1BHuEU4lmmfWZP5Jiss60S2dDYvuz9HL2d7zmSue+63a1FrWWt78lTzNuWNrXNaV78eWh+3vmeD+oaCDRMbPTYe3kTYlLzpp3yT/LL8V5vDN3cXKBVsLBjf4rGlpVCikF84stV2a9021DbutoHt5turtn8sYhddLTYprih+X8IqufqN6TeV33zaEb9joNSydP9OzE7ezuFdDrsOl0mX5ZaN7/bb3VFOLy8qf7UnZs+VimUVdXsJe4V7Ryt9K7uqNKp2Vr2vTqy+XeNc01arWLu9dn4fe9/Qfsf9rXVKdcV17w5wD9yp96jvaNBqqDiIOZh58EljWGPft4xvm5sUmoqbPhziHRo9HHS4t9mqufmI4pHSFrhF2DJ9NProje9cv+tqNWytb6O1FR8Dx4THnn4f+/3wcZ/jPScYJ1p/0Pyhtp3SXtQBdeR0zHYmdo52RXYNnvQ+2dNt293+o9GPh06pnqo5LXu69AzhTMGZT2dzz86dSz83cz7h/HhPTM/9CxEXbvUG9g5c9Ll4+ZL7pQt9Tn1nL9tdPnXF5srJq4yrndcsr3X0W/S3/2TxU/uA5UDHdavrXTesb3QPLh88M+QwdP6m681Lt7xuXbu94vbgcOjwnZHokdE77DtTd1PuvriXeW/h/sYH6AdFD6UeVjxSfNTws+7PbaOWo6fHXMf6Hwc/vj/OGn/2S8Yv7ycKnpCfVEyqTDZPmU2dmnafvvF05dOJZ+nPFmYKf5X+tfa5zvMffnP8rX82YnbiBf/Fp99LXsq/PPRq2aueuYC5R69TXy/MF72Rf3P4LeNt37vwd5MLWe+x7ys/6H7o/ujz8cGn1E+f/gUDmPP8usTo0wAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB94DGA4iMlMW6PUAAAKdSURBVDjLdZM9aBRRFIW/efMyO+P+kayaoGJCIpLgLxgVA4KIgoWFWAgqGFRWwUoLwSoi2Asi/qCdQjBICgsLDaRTERENMSSKChrjGjZuJjs/m5nZGQvfShC88Jp37zncezhHK04ELK273b06YAAmYAESiIFFoKZeVJx8nQBoDYK73b0a0ATkgBVAG1BQRBGwAMwCJaAC+MXJ17FWnAgaYANoATqlJndaSeq4RN+gNkiAckD41MV/BEwBPwBXqs11IA+sszD7zcToV8Cl1WbQdEKi77BxLgMa8L0xZACthmbsNRPjNEBMPGMH1TIzYZqMSLFcZpvJ5QWiO0v6UlXzrpIkNY14c0rduy1P5ppArA0Iv7vPyz5v/BqlKARgnWFyOF9ozjWvBAgIn7n4AxLIAu3ABoFYC+B+tjV+1cGJx8mJQdqaplif6uBreKS6yTuaTZZZEn030CqBXJ7MANClzonpSuWtzlzKOCjrNs5bpf6c6m8EdgiEyVt/vwC0iPoHgehQA6I5yaZNjEJANKb+koaSqaTJ+Svr5OJWATgu/qNKZL9bKnmlZr/yb0z3cGb6kDLUCmCVRG8HiKhHlKOMUAb5xHhtqFKzywo8x82yxSuvh75l40AHsMXCPCAQXQDVwFngaxhKZc1ZtloPGHEqFele4Em1ykwY0Je+wsmCZyWpYxJ9j0TvBahqXol7v+YohdNCefoPyb7MIMP2FcZ8jyC5xbnCRDoxd5sYFyX6dkALCL9Ed37O8cZzWYgfCwBFsggscH31IF58lqH2QRWiQBlrthLZL9zr3xxeei6laJhTLfe1f9O4JJVCBauVD4u7GJo/z3w9YjoMmK+PcnvNQLE2Vpf8vxLABWYYmv/Ic88hTt4T8ZCRztFGnH8DG78cYDQ4ocoAAAAASUVORK5CYII="
                        },
                        //DS-MOD-END
                        RepairCharge: {
                            Base: "webfrontend/ui/icons/icn_repair_points.png",
                            Offense: "webfrontend/ui/icons/icn_repair_off_points.png",
                            Infantry: "webfrontend/ui/icons/icon_res_repair_inf.png",
                            Vehicle: "webfrontend/ui/icons/icon_res_repair_tnk.png",
                            Aircraft: "webfrontend/ui/icons/icon_res_repair_air.png"
                        },
                        Resource: {
                            Tiberium: "webfrontend/ui/common/icn_res_tiberium.png",
                            Crystal: "webfrontend/ui/common/icn_res_chrystal.png",
                            Credits: "webfrontend/ui/common/icn_res_dollar.png",
                            Power: "webfrontend/ui/common/icn_res_power.png",
                            ResearchPoints: "webfrontend/ui/common/icn_res_research_mission.png",
                            Transfer: "FactionUI/icons/icon_transfer_resource.png"
                        },
                        Simulate: "FactionUI/icons/icon_attack_simulate_combat.png",
                        CNCTAOpt: "data:image/gif;base64,R0lGODlhEAAQAJECAAAAzFZWzP///wAAACH5BAEAAAIALAAAAAAQABAAAAIplI+py+0PUQAgSGoNQFt0LWTVOE6GuX1H6onTVHaW2tEHnJ1YxPc+UwAAOw==",
                        one: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8zMC8xNsrVPP4AAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzbovLKMAAAEYElEQVQ4jbWVaWxUVRTHf/fN63Q6004X0BYsUsCiUJGA8AFESCoEEpe4IMpiQiQISJBaEFMFxfiBqIkFibIESEnrwpI0UYoYlsgmstWWpbUtrVOmbFNamNLpLJ33rh+4V0f0qyc5ue/Dub/3P/977ntCSomOxgohABfgBJIBE3AAQpVIwALiQBSIAZGhcxIgKoQGK2iKSrdKp4InguMKGAZ69HovXEgpE6FuIBVIPdtI9vafGH++mcJgiDwJDtMglJ1JbeFoqopnUAOEVIZVxvULREM5un03kAZ4SzZTuO80xT0RBmgFhsBKTuJm3MbVGyc9P5fte9ZQqsBaeURbY6pWXYAHSFu+galVJ1hjSxwADgex0flUlMzihz7pRBwGdsV+hnR04VZ7HECS4hiAaKwQYTPB19Rj53ngYDVFGpqcRGfxDN6bO43fla8WIN5+mVoFcta3kl7TjHtmIY2JZ6HVugH3tweZ2BOhv25/yhg2z51GQ4KPcaUqWe1xvbOR+U1tPB/oZN7S6ZxRB2wbSq0HSKnzMUlDM1Jp/nQhh++ZAu2jBbByK+Oa2ngBEBUHWNEVwqtYLgNIPlhNzqHf6NedoLZ/H+rrW3FfvYmp4HENBMSpejL3/spCXd8V4pHFa5mprTUAo3QXryz6nB3dPQzUhQ1+ps1YzY49J8hWQFu1aQDmqm0sCEXIJSGqm5j7ZSUFgNMA7HVLKPN6aLDlX+Zj2ZgD7ufHN56lSam1NXRLFQ/5A0x1GMR0vSGw4xaeymNMB4RjyYukZqUhOoJcP9/CFKkmwuvh0tYVfNjHyx3uXl9bjZYrJwuem8Bef4DI5QCjANI8+DYtY/6kkRx9MJtbhjqQUMlsTj42mDIAh0Hv7Mmsz88lpNpHQU3A7N+X+PCBhFquMUIrdprcGldAYMIIAkDUUKfcA/RsXs72jFQuFAziu6LpXEgAuvh73p2AWbqLR6/eZIwGD83liBYJhLXiMNDt9XD7+vWAXXtJvpY/K/a9UugGvEC6Wj2VR8k7F3j8fZ/PJ6SUSCk5fkEW5T61f5wSGdGjFAFEvyd3Dk9yuqJ2b/BsPHyjuWwfeVfayZr3NPUpTmR1E5lfH2DCyTrm7Ny9KsPn8+H3X7aGPTywOTMjoyspbXBfLVQAJHyIXINfurZSWpGkbn/lsbeWFmfsPsxHlo0HwLZJsWxM3X7fdM58sGjYhgUllWMN0x21orcOtVaN3K+EqrktR1ix25Olio5zH0+0YsHTkVB7jb+10Vd3saa9uOjNKzlZHCkYRNm7rw9ZFu6o3WLbvXeklFLaVjDcfmKYEvnPkFKuVUWtXX98M6o31FYau9OyPhps+Cp6u27jjVOLn2koZ3Tnxc9eta3olbulsbZ4tPOTYEt5v0SouAdcA4wE1jVWiBL+4xflHTTHmzO+7BeEIw1A2rHjQjhshOOQEGK1ZpkJ0DwFBfhZ+RQHerl74wxA3Df2i1kaCiAM5xPqcdu/LPg/4k/+d/H1IH1wmQAAAABJRU5ErkJggg==",
                        two: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8zMC8xNsrVPP4AAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzbovLKMAAAEcElEQVQ4jbWVWWxUVRjHf+fe2+msXSi0iG2hSIlawYg8gBYLDZsQoSiWsCRiDAoSBCuSYDDggyESIxhi1IaSEsYI8lCCLDaACyVBoJQ2IGW6QIdi0ZaltJ3pdGbuPT5wbhmJr37Jl/vynd/5f8v5rpBSYluTXwjACTiAZMAAdECoEAmYQBwYAKJAZOyyBIgyYYMV1KXcrdyh4InguAL2A2H7+yhcSCkToW7AC3gvNJG1p5oXLrVSfD/EKAm6oRHKSqeheAJHykqpB0LK+5XH7QtEYC92+m7AB6RsLKf4p/OUhSPk2Ao0gZmcxO24hTMWJzU/mz2Ht7JdgW3lEbs0hkrVCXgA3/qvmXXkDFstiQ6g60Qn5OPfuIQfM1KJ6BqW/zhP3OnBrc7oQJLiaIBo8ot+I6Gu3tOXePxkHetsaHISd8tK+Wj5bK6qupqAeP91GhTI0Rgktb4V9+JimhJ7Yat1A+7vT/JSOMIIO/0ZEylfPptAQh3jSlWyOuP88BtWNN+kpPMub61dSK1qsKUptR7AdaWNIhua5qV120p+e2QK7DqaAJsqmNx8kwWA8J9gQ0+IFMVyakDyyTqG/3yRx/oS1I7IoLExiLvjNoaCx20gIM41kn70d1ba8T0hnly9g8V2aTVA236ARau+YH9fmJF2YKCd2aVb2H/4DFkKaKk0NcD4eDfvhCJkk2B1zSz/qooCwKEB1pdrqEzxELDkYPExLYycTI69/QrNSq1lQ3cdYUx7J7N0jagdrwmsuImn6jQLAaGveRXvEB/izn3+unSNGVJNRIqHlooNbM5IoZcHz9dSo+UcPgTmFXK0vZPIjU6eA/B5aPv2A1YUPUtNbhb3NNWQ0MalnB0/mkoAXSO2dDo787MJqfRRUAMwRgwl/vRIQtduMc5W7DC4N7mAzsJxdAIDmupyGAiXr2dPmpfLBXnsW7eQywlAJw/n3QEY2w/wTMdtJtrgsdmcskUC/SKwlyQe7Aff6AXBTw1P7jI72Ir1trTsT3lDNU+qSxxVNeR9Usm2ZHfasIMHD1JUNDilWPG+6pZ9vlJ7lCJ5Ja1zdeewMVas9zxYmpSm1tcXdpUfzyua9/z1OpcDWddM+ncnKDx7hWXROGmLlpSg65p5p+tGa3paWo/QkuJCc3iBfgGQsIicgCtn5qn5ujNzfGPgWvakwjkTTQsPgGXhMi0MW93QVGpXzefzTTuvTtUM94AwvAMgL7T+kHFgMIXAXoQZ7Z5uWbEaqSzae93fETj0WXuwqe3KH/Vd586eCTXU13YX5FH55su821DBpFBH9XsywSwrNg0eLg2klDuAtQDSih2Odl/eFTw64WLunNolmuHLRZoaSGFGujraj089lP5UWaYrc0qmtGJdt2pKz49dGq9C6FOAaUKIX4WCbgE2qzuCQBvS1EId1av//GXu3/zHL2r0a7fWGa7hZUirB2QQoY8D7gOjhBDdNrgbSOXfFmzyi3we7FpN+SA4Z+apbNewF48htNwEQSVCiHr+T/sHWt7fucgXQnUAAAAASUVORK5CYII=",
                        three: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAWCAYAAADEtGw7AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABZ0RVh0Q3JlYXRpb24gVGltZQAwNi8zMC8xNsrVPP4AAAAcdEVYdFNvZnR3YXJlAEFkb2JlIEZpcmV3b3JrcyBDUzbovLKMAAAEdElEQVQ4jbWVa2wUZRSGn29mdrvdbbdbaChikQUtGstFkGAgjU2qCIlKRBCDYNJIQIwhYgUExUBMDKhENMaoBMjiVio0AYKAGq7ShluhtCm2bmtra7ElSyl2y17o7sznD77BDTHxlyc5mWRyvmfe854zM0JKiR0tFUIALsAJZAAGoANClUjABFLALWAQSIxdlAZRIWywgmaqdKt0Kng6OKWAcSBmX++GCyllOtQNZAFZF1vI3/kT0xvbKO2P4pegGxrR/FwaSidzqHw+9UBUZVxlyn6ACAWx23cD2YB37VZKf6ylPJZgpK1AE5gZDnpTFq5kipzCAnYe3MgWBbaVJ2xrDNWqC/AA2Su/ZOahM2y0JDqArjM4uZCKtS/x/dAcErqGVXGE+69HcKszOuBQHA0QLRUibqT5mlXTyL3H6lhhQzMc9JXP552yWfyqfDUB8eYLNCiQs7mTnPo23AtKaUmfha3WDbgrj/F4LMEIu/0ZU9haNotQmo8ppSpDnXGt+oolrVd4LtzH4jfmcUEN2NKUWg+Q2dRBiQ31ZdH20TJ+vmsLbB9NgHXbmdZ6hTmAqDjK6kgUr2K5NCDjWB3Dj1/inptpakcMpbm5E3d3L4aCp2wgIM43k3v4LMvs+kiUh17/lAW2tRqgbanixdc+YffNGKPswlAXs+ZvYPfBM+QroKXa1ADjvR28Gk1QQFrUtVL2xT6KAKcGWJ8tJ+D1ELLkHfMxLYyRw/hh6bO0KrWWDd12iAe6wszUNQbtek1gpUw8+2qYBwh9+fNkDclGXO/namM7M6TaCK+H37avZv1QLwPcfn0ttVqu4UNgdjGHu8Ik/ggzCSDbQ8fXb7GkZCLV9+VzQ1MDia5dyLkJYwgA6BrJhU/yeWEBUdU+CmoAxog8Ug+PItrew3hbsdPgxrQiwsXjCQO3NDXlGBDbupKdviwuF43muxXzuJwGdPHPvjsBY0sV47p7mWKDxxZwyhYJxAkFcYSC5PbULBpnDvbXyrRIxrqrQ0Gmh4I8FgoyNRRkWihIyaallGU6CQcCASmllFV7KgdObJsy2xyMnLdS8dN9TZtH2quUyJu0qURojpSVHKgFS5PS1KJxM++DIFMXP01zphNZ10rut0cpPtfEosEUPp/PR01NtWlFLn796BPleUIzTKTVce3iyqvGgy8jQ0ES7XsLdgC7xsztWSfNhENatxzVR/bLPSd5u/I4HgDLItO0MAD8fj89f7Z3TxjrPT0sY/M3Tl/jU5aZOCXN+HElVu1tEGElo3PTrYj8vuuV7tCBD7s6Wzqafqm/dv7cmWhD/YW/ikYTOHuyskr+S1hWcg5qykgp/YAfaGupEFrhwuQpIYxi3ZV/M9ebc0Mz5OFhOU4NHMJMXOve+z4H/JMmL7GSA7VCM0yEkS00RxGAEMYJUF8jKeUGYD3QD3QAE5FWpK/p4/G9l9Yk+I9fVOGC+Cqhu94FGoQQj9xRDASAMmAUMBHolDI1p/fSmh5uf2s1lelgS2VS6K5n1P39/N/xN04bEQuMNx/QAAAAAElFTkSuQmCC",
                        // SkipVictory Button graphic by Netquik
                        VictoryPop: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAA3NCSVQICAjb4U/gAAACClBMVEVfBgCuejziQyyPTyZ4LhTXpFTMZjPBlktiFwfgul//JibQcD2haDOHPx7WVjNdCgHPolPowWS6iURwIw71LieYXC3OiEbbtFx+ORnRlEyLRyJmAACocTfYr1rTYTdtGQrvyWnrOCplDgSZZjOyfj/WrVjPdj/UnVF5PBmTVCjht1/TqValbja9kEfdTS/Hn09mCgPLnlDVVjNzJhDtx2dqFAiFPx1tHQuNTCTQazuWXCuGQh9mDwXjvGDz0GzNfkKfbjRmAAC1g0F7MhZjCQLNdD7cr1rbr1l9NhiqdDnYp1Z2KBHEl0yCPRzdTTHQpVSjajTxzGretl1oFAeTUiiMSiJqFgnju2CJRiFsGgq9jUbBkkmbXCyPTiTQi0jJnE5wHAzXsFlmDARiCALsyWjasVvlvmGvfD7VqVftOCp9MRdyJA9nEgbPdD7iuV/atVyPSyS2hEKmbDaRUCZsFgjcUDKEQR50JRDbqVbSp1VmDgXPiEjXplbqw2WpcznZr1i/kEjNoVDHmUybXi70LijdTDFkCQLhuV+vejzTYTjrOirVnVHlu2DVq1bcsVvJnU+7i0VkCgN8MxdsHAqrdTqZXi2jaDLtyWbbsVrdtFx6LhXPpVKLSCLbr1puGAqzgD9mCgRvIA2JQh5mEgbPfkLbsVjZqVZ2KRLzzWpqGQloDQXPdj6nbzZ1JhG/XJyLAAAArnRSTlP///////////////////////////////////8A//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8Kf6MJAAAACXBIWXMAAAsSAAALEgHS3X78AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAAZZJREFUKJFjkMYJGAhIMYABQgzCAwnM49Ustgg1W7sKIpMwh8czYFEJSIqhIEPQVjxVWyUrGSRjGpNhEmgiwAvWWLSi1M9Pr7WPJxhk2qT4ai4ukfAQsFRzbSkXEFQ3zALyJk61ZeLiUquE6HKOlwRJyamGJkszZE9YxsXVosW4EOwMpWZORaBUSxpPDkOyRaocUJV2qAtYKnlSfxxIW02hMcPK9PAWLi43J2EGiL9yZLSAfC7XxjJ+idn2QE2ymlVQLydba1sCpZiCrDiUw4Fme0UtZ4AFlPl8d5CJcxk1dNW5uPy0pirBw9DFQpYPKCXG7pAIdIR6NAsDXIpBWAiomssoXx+oW5Gz2QYp5CeKtgM92pJi6wr0uo8HA5IUg3OTGFAbq50il2J4QBhKfAXrpAHdz93NxWVv6JuMIpVs5g80q6uUq2VmXSRaLEem54Hcz6XmH9GGJpUcKysHkupLX4ieNhiyhSqAMp2yzBMxkk1SsbaJgonWlHIGDClpeakAzzWa3gbSmFLSScGmplVt0tik0AAA+3Zy/SYJ5fgAAAAASUVORK5CYII=",
                        VictoryPop2: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAAA3NCSVQICAjb4U/gAAACkVBMVEUzAADStraGbkVsHAy2nI3UICD7xcNHIxSyfj9zXDHbyrdZAAD2zsZ7RCCnf3/tx2fzsrJ9VVE+Dw3GeHJ3LyDMZjNmMzPo2cm2SkrArIdJAACNdk3MZjNiEwf16tLUqFbguF9tRz2lGRmZXi3CpqZRMRjz48+NXTHWv7s8CAixn3KnbzaQFRX/Jiajj2TWnpPf0sLIrahmAADLt6SsmHXi1LRkUClEExNXNRmeiWFAAAB2KBHHkYJ3VUSIHx+KQzTt4M2lOCS6jEdaGAqAUCdPJR/5x8TNu51gRiWKYl+YcDvrIyNRAABmDARpPDmihkTm18eJa1eNUz98aDhoEhJeAAB0RETx2crTurjcycDXxr6MSiLjj4+9HBz47dO9mU6KXl49EBA0CQZnMReZZjNsIw9TMB5pEgdmMzNJBAB4LhRKGxmYa1FYDAQ+AAD/w8PPb2/QrZidf0FPLhiCRSDSwqKRelhBBADayb/i0sXx2sqKcDm7pJHz58+RIiJRBADaqFfv0sY8CgN8NCaTVCiLRyJ6TEzs38umhIGqdDnSu7mvmXxfBAA8FgtJCAS2hkPCsolyQUGRUCb779JqFAhVJSRWOBt7Wy1pGAyjajT369NkDwW4nJXv5c72JSXYrVk/DQ2OYWHz0cf4y8RBEBBaBAD16NGBWlQ+EwhOAABeMRdFAADbxr/v38rey8F9MRdFBACtlnrj18ZNAwBWAwB+RSFBCAjJsap3WT6LIxltKBSFPx1mAADv487GpqZUAABBEw/3srJpGAjvyWnj0sKmhoJWMRhNGxtMIhJZJCRmAADTv7r679Xo2sqNeUvTqVZZHAyKYWG6mlE5CghUNCB5MRg+AwDv18aqdT1lEAjgzsIQtHt1AAAA23RSTlP//////////////////////////////////////////////////////////////////wD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8hz8AoAAAACXBIWXMAAAsSAAALEgHS3X78AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAAhlJREFUKJFjMMIJGIA4NDQUTXT//lCwVKhm9rWlPUAAk+jJFBLaDJZavXxdYPHW6N3WvhAZ5lU7uIxPHAJKcV++VRs3ITj+PMd6sD5ZC8szZ85IJ/cwGOV5Bpzh4dEXcZyfkg6U2XLCZG1+Pptp8VKGleYRlXE8+fkH7dSdsnqMVibVzFqcn19Va7uaIa8tYs1ctXwgCKou6VkptL29FqhplvicawwrkxK6Kme5AaXYtKY1Td13a9mi/PxFtSwHfBiMQvP81sxdC9JW260YoXE2jo2NbVl370qwv8pduWaxAaXC567riqytAmrSO5YLDY3MtNJwoNTiWZWnQWYfZJq+qwciZdTj7CEJMnHZ2QoHtfyYZn/l2dAwNDLy5TWzAUqt3RuwbNHBEC+QL2BSS1eUgdy/SG7usvx84WCX2bCQN+LWFKwEeZTtTBzQzrXu7JkwKZ8kvog1e0Hurz3jlu8WF2AotBoitXLBvogIjQCgfwpygMZWzY2MiJhqFWrEEGp1EigTERFZGy6hs9P+IJucuAaQG8bAzeAjFgEGGlznlLznxdYV1q4D8xPy4FIdV4pEdXV1WTk3akCkrBhC8/jALM0L/Q1AKdH4Y34g/j5Nbgaj/QuALDEGbt9J8vyH+RU6U8uPAy0XkwK50GrivuN5wBTE3DqzU7sFmEKkFvDxMYSCQ36bphQ4tfmmT5kCTjo+SZo+sIDCCgA7QOw3tEIRUgAAAABJRU5ErkJggg=="

                    }
                });
                qx.Class.define("TABS.SETTINGS", { // [static]		Settings
                    type: "static",
                    statics: {
                        __name: null,
                        __store: null,
                        __upload: null,
                        __file: null,
                        __reader: null,
                        _Init: function () {
                            var localStorage = ClientLib.Base.LocalStorage,
                                player = ClientLib.Data.MainData.GetInstance().get_Player(),
                                server = ClientLib.Data.MainData.GetInstance().get_Server();
                            this.__name = "TABS.SETTINGS." + player.get_Id() + "." + server.get_WorldId();
                            if (this.__store === null) {
                                if (localStorage.get_IsSupported() && localStorage.GetItem(this.__name) !== null) this.__store = localStorage.GetItem(this.__name);
                                else this.__store = {};
                            }
                            this.__store.$$Player = player.get_Name();
                            this.__store.$$Server = server.get_Name();
                            this.__store.$$Update = Date.now();
                            if (localStorage.get_IsSupported()) localStorage.SetItem(this.__name, this.__store);
                        },
                        get: function (prop, init) { //get or initialize a prop
                            this._Init();
                            if (this.__store[prop] === undefined && init !== undefined) {
                                this.__store[prop] = init;
                                this._Init();
                            }
                            return this.__store[prop];
                        },
                        set: function (prop, value) {
                            this._Init();
                            this.__store[prop] = value;
                            this._Init();
                            return value;
                        },
                        "delete": function (prop) {
                            this._Init();
                            delete this.__store[prop];
                            this._Init();
                            return true;
                        },
                        reset: function () {
                            var player = ClientLib.Data.MainData.GetInstance().get_Player(),
                                server = ClientLib.Data.MainData.GetInstance().get_Server();
                            this.__name = "TABS.SETTINGS." + player.get_Id() + "." + server.get_WorldId();
                            window.localStorage.removeItem(this.__name);
                            this.__store = null;
                            this.__name = null;
                            this._Init();
                        },
                        save: function () {
                            var textFileAsBlob = new Blob([JSON.stringify(this.__store)], {
                                    type: 'text/plain'
                                }),
                                downloadLink = document.createElement("a");
                            downloadLink.download = "TABS_Backup.json";
                            if (window.webkitURL !== undefined) downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
                            else {
                                downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                                downloadLink.style.display = "none";
                                document.body.appendChild(downloadLink);
                            }
                            downloadLink.click();
                        },
                        load: function () {
                            if (this.__upload === null) {
                                this.__upload = document.createElement("input");
                                this.__upload.type = "file";
                                this.__upload.id = "files";
                                this.__upload.addEventListener('change', (function (e) {
                                    var files = e.target.files;
                                    if (files.length > 0) this.__reader.readAsText(files[0], 'UTF-8');
                                }).bind(this), false);
                                this.__upload.style.display = "none";
                                document.body.appendChild(this.__upload);
                            }
                            if (this.__reader === null) {
                                this.__reader = new FileReader();
                                this.__reader.addEventListener("load", (function (e) {
                                    var fileText = e.target.result;
                                    try {
                                        var fileObject = JSON.parse(fileText);
                                        this.reset();
                                        for (var i in fileObject)
                                            this.set(i, fileObject[i]);
                                        alert("Game will reload now.");
                                        window.location.reload();
                                    } catch (f) {
                                        console.group("Tiberium Alliances Battle Simulator V2");
                                        console.error("Error loading file", f);
                                        console.groupEnd();
                                    }
                                }).bind(this), false);
                            }
                            this.__upload.click();
                        }
                    }
                });
                qx.Class.define("TABS.UTIL.Formation", { // [static]		Utilities for Army Formation
                    type: "static",
                    statics: {
                        GetFormation: function (cityid, ownid) {
                            var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId()),
                                OwnCity = ((ownid !== undefined && ownid !== null) ? ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(ownid) : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity());
                            if (OwnCity !== null) return OwnCity.get_CityArmyFormationsManager().GetFormationByTargetBaseId(CityId);
                            else return null;
                        },
                        GetUnits: function (cityid, ownid) {
                            var formation = this.GetFormation(cityid, ownid);
                            if (formation !== null) {
                                var units = formation.get_ArmyUnits();
                                if (units !== null) return units.l;
                            }
                            return null;
                        },
                        GetUnitById: function (id, cityid, ownid) {
                            var units = this.GetUnits(cityid, ownid);
                            if (units !== null)
                                for (var i = 0; i < units.length; i++)
                                    if (units[i].get_Id() == id) return units[i];
                            return null;
                        },
                        Get: function (cityid, ownid) {
                            /**
                             *	[{
                             *		id: [Number],		// UnitId (internal)
                             *		gid: [Number],		// Garnison Id (internal)
                             *		gs: [Number],		// Garnison State
                             *		i: [Number],		// MdbId
                             *		l: [Number],		// Level
                             *		h: [Number],		// Health
                             *		enabled: [Bool],	// Enabled (internal)
                             *		x: [Number],		// CoordX
                             *		y: [Number],		// CoordY
                             *		t: [Bool]			// IsTransportedCityEntity (internal/todo:kommt weg)
                             *	},{...}]
                             */
                            var units = this.GetUnits(cityid, ownid),
                                formation = [];
                            if (units !== null) {
                                for (var i = 0; i < units.length; i++) {
                                    formation.push({
                                        id: units[i].get_Id(),
                                        gid: (units[i].get_IsTransportedCityEntity() ? units[i].get_TransporterCityEntity().get_Id() : (units[i].get_TransportedCityEntity() !== null ? units[i].get_TransportedCityEntity().get_Id() : 0)),
                                        gs: (units[i].get_IsTransportedCityEntity() ? 2 : (units[i].get_TransportedCityEntity() !== null ? 1 : 0)),
                                        i: units[i].get_MdbUnitId(),
                                        l: units[i].get_CurrentLevel(),
                                        h: Math.ceil(units[i].get_Health()),
                                        enabled: units[i].get_Enabled(),
                                        x: units[i].get_CoordX(),
                                        y: units[i].get_CoordY(),
                                        t: units[i].get_IsTransportedCityEntity()
                                    });
                                }
                                return formation;
                            }
                            return null;
                        },
                        Set: function (formation, cityid, ownid) {
                            /**
                             *	[{
                             *		id: [Number],		// UnitId
                             *		enabled: [Bool],	// Enabled
                             *		x: [Number],		// CoordX
                             *		y: [Number],		// CoordY
                             *		t: [Bool]			// IsTransportedCityEntity
                             *	},{...}]
                             */
                            var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId()),
                                OwnId = ((ownid !== undefined && ownid !== null) ? ownid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCityId()),
                                unit, target, /* freePos,*/ transported = [],
                                i, targetFormation = this.GetFormation(CityId, OwnId)
                            /*,
                                                            getFreePos = function (formation) {
                                                                for (var x = 0; x < ClientLib.Base.Util.get_ArmyMaxSlotCountX(); x++) {
                                                                    for (var y = 0; y < ClientLib.Base.Util.get_ArmyMaxSlotCountY(); y++) {
                                                                        if (formation.GetUnitByCoord(x, y) === null) return {
                                                                            x: x,
                                                                            y: y
                                                                        };
                                                                    }
                                                                }
                                                                return null;
                                                            },
                                                             freeTransported = function (unit, freePos) {
                                                                if (unit.get_TransportedCityEntity() !== null) unit = unit.get_TransportedCityEntity();
                                                                if (unit.get_IsTransportedCityEntity() && freePos !== null) unit.MoveBattleUnit(freePos.x, freePos.y);
                                                            }*/
                            ;
                            if (targetFormation !== null) {
                                for (i = 0; i < formation.length; i++) {
                                    unit = this.GetUnitById(formation[i].id, CityId, OwnId);
                                    if (formation[i].gs == 2) {
                                        transported.push(formation[i]);
                                        continue;
                                    }
                                    target = targetFormation.GetUnitByCoord(formation[i].x, formation[i].y);
                                    /* freePos = getFreePos(targetFormation);
                                    if (freePos !== null && target !== null) freeTransported(target, freePos);
                                    freePos = getFreePos(targetFormation);
                                    if (freePos !== null) freeTransported(unit, freePos); */
                                    unit.set_Enabled(formation[i].enabled);
                                    /* target = targetFormation.GetUnitByCoord(formation[i].x, formation[i].y);*/
                                    if (target !== null && ClientLib.Base.Unit.CanBeTransported(target.get_UnitGameData_Obj(), unit.get_UnitGameData_Obj())) target.MoveBattleUnit(unit.get_CoordX(), unit.get_CoordY());
                                    unit.MoveBattleUnit(formation[i].x, formation[i].y);
                                }
                                // MOD transported units  Functions Deactiveted
                                // Modded  by Nequik  for revert to native unit enabling
                                for (i = 0; i < transported.length; i++) {
                                    unit = this.GetUnitById(transported[i].id, CityId, OwnId); //unit being trasported
                                    target = targetFormation.GetUnitByCoord(transported[i].x, transported[i].y); //unit trasporter
                                    if (target !== null && target.get_Enabled()) unit.set_Enabled(true);
                                    /*freePos = getFreePos(targetFormation); //find free spaces
                                    if (freePos !== null && target !== null) freeTransported(target, freePos); //if trasporter and free space
                                    freePos = getFreePos(targetFormation); //find other free spaces
                                    if (freePos !== null) freeTransported(unit, freePos); // if other spaces so from function if trasported is also trasporter so unit = second unit trasported and if second unit trasported move it free
                                    target = targetFormation.GetUnitByCoord(transported[i].x, transported[i].y); // trasporter = xy original
                                    if (target !== null) target.set_Enabled(true); if xy exist xy enabled
                                    unit.set_Enabled(true); unit being trasported enabled 
                                    unit.MoveBattleUnit(transported[i].x, transported[i].y); unit being trasported move to xy
                                    
                                    
                                    if (target !== null) target.set_Enabled(transported[i].enabled); // if trasporter exist toggle enable with trasported state
                                    else unit.set_Enabled(transported[i].enabled); // if not exist unit being trasported toggle enable with trasported state
                                    if (target !== null) target.MoveBattleUnit(transported[i].x, transported[i].y); // if trasporter exist move to xy original
                                
                              */
                                }
                            }
                        },
                        Merge: function (formation, attacker) {
                            for (var i in formation) {
                                for (var j in attacker) {
                                    if (formation[i].gs == attacker[j].gs && formation[i].i == attacker[j].i && formation[i].l == attacker[j].l && formation[i].x == attacker[j].x && formation[i].y == attacker[j].y) {
                                        for (var k in attacker[j])
                                            formation[i][k] = attacker[j][k];
                                    }
                                }
                            }
                            return formation;
                        },
                        IsFormationInCache: function () {
                            var cache = TABS.CACHE.getInstance().check(this.Get());
                            return (cache.result !== null);
                        },
                        Mirror: function (formation, pos, sel) {
                            switch (pos) {
                                case "h":
                                case "v":
                                    break;
                                default:
                                    return;
                            }
                            for (var i = 0; i < formation.length; i++) {
                                if ((sel === null || formation[i].y == sel) && pos == "h") formation[i].x = Math.abs(formation[i].x - ClientLib.Base.Util.get_ArmyMaxSlotCountX() + 1);
                                if ((sel === null || formation[i].x == sel) && pos == "v") formation[i].y = Math.abs(formation[i].y - ClientLib.Base.Util.get_ArmyMaxSlotCountY() + 1);
                            }
                            return formation;
                        },
                        SwapLines: function (formation, lineA, lineB) {
                            lineAZoroBasedIndex = lineA - 1;
                            lineBZeroBasedIndex = lineB - 1;
                            for (var f = 0; f < formation.length; f++) {
                                switch (formation[f].y) {
                                    case lineAZoroBasedIndex:
                                        formation[f].y = lineBZeroBasedIndex;
                                        break;
                                    case lineBZeroBasedIndex:
                                        formation[f].y = lineAZoroBasedIndex;
                                        break;
                                }
                            }
                            return formation;
                        },
                        Shift: function (formation, pos, sel) {
                            var v_shift = 0,
                                h_shift = 0;
                            switch (pos) {
                                case "u":
                                    v_shift = -1;
                                    break;
                                case "d":
                                    v_shift = 1;
                                    break;
                                case "l":
                                    h_shift = -1;
                                    break;
                                case "r":
                                    h_shift = 1;
                                    break;
                                default:
                                    return;
                            }
                            for (var i = 0; i < formation.length; i++) {
                                if ((sel === null || formation[i].y === sel) && (pos == "l" || pos == "r")) formation[i].x += h_shift;
                                if ((sel === null || formation[i].x === sel) && (pos == "u" || pos == "d")) formation[i].y += v_shift;
                                switch (formation[i].x) {
                                    case ClientLib.Base.Util.get_ArmyMaxSlotCountX():
                                        formation[i].x = 0;
                                        break;
                                    case -1:
                                        formation[i].x = ClientLib.Base.Util.get_ArmyMaxSlotCountX() - 1;
                                        break;
                                }
                                switch (formation[i].y) {
                                    case ClientLib.Base.Util.get_ArmyMaxSlotCountY():
                                        formation[i].y = 0;
                                        break;
                                    case -1:
                                        formation[i].y = ClientLib.Base.Util.get_ArmyMaxSlotCountY() - 1;
                                        break;
                                }
                            }
                            return formation;
                        },
                        set_Enabled: function (formation, set, EUnitGroup) {
                            if (set === null) set = true;
                            var all = (EUnitGroup != ClientLib.Data.EUnitGroup.Infantry && EUnitGroup != ClientLib.Data.EUnitGroup.Vehicle && EUnitGroup != ClientLib.Data.EUnitGroup.Aircraft);
                            for (var i = 0; i < formation.length; i++) {
                                var unitGroup = this.GetUnitGroupTypeFromUnit(ClientLib.Res.ResMain.GetInstance().GetUnit_Obj(formation[i].i));
                                if (all || (EUnitGroup == unitGroup /* && formation[i].gs === 0 */ )) formation[i].enabled = set;
                            }
                            return formation;
                        },

                        // Mooded by Netquik

                        toggle_Enabled: function (formation, EUnitGroup) {
                            var all = (EUnitGroup != ClientLib.Data.EUnitGroup.Infantry && EUnitGroup != ClientLib.Data.EUnitGroup.Vehicle && EUnitGroup != ClientLib.Data.EUnitGroup.Aircraft);
                            for (var i = 0, num_total = 0, num_enabled = 0; i < formation.length; i++) {
                                var unitGroup = this.GetUnitGroupTypeFromUnit(ClientLib.Res.ResMain.GetInstance().GetUnit_Obj(formation[i].i));
                                if (all || (EUnitGroup == unitGroup /* && formation[i].gs === 0 */ )) {
                                    num_total++;
                                    if (formation[i].enabled) num_enabled++;
                                }
                            }
                            return this.set_Enabled(formation, (num_enabled < (num_total / 2)), EUnitGroup);
                        },
                        GetUnitGroupTypeFromUnit: function (unit) {
                            if (unit === null) return ClientLib.Data.EUnitGroup.None;
                            if (unit.pt == ClientLib.Base.EPlacementType.Offense) switch (unit.mt) {
                                    case ClientLib.Base.EUnitMovementType.Feet:
                                        return ClientLib.Data.EUnitGroup.Infantry;
                                    case ClientLib.Base.EUnitMovementType.Wheel:
                                    case ClientLib.Base.EUnitMovementType.Track:
                                        return ClientLib.Data.EUnitGroup.Vehicle;
                                    case ClientLib.Base.EUnitMovementType.Air:
                                    case ClientLib.Base.EUnitMovementType.Air2:
                                        return ClientLib.Data.EUnitGroup.Aircraft;
                                } else if (unit.pt == ClientLib.Base.EPlacementType.Defense) return ClientLib.Data.EUnitGroup.Defense;
                                else return ClientLib.Data.EUnitGroup.None;
                        }
                    }
                });
                qx.Class.define("TABS.UTIL.Stats", { // [static]		Utilities for Stats calculation
                    type: "static",
                    statics: {
                        get_LootFromCurrentCity: function () {
                            var LootFromCurrentCity = ClientLib.API.Battleground.GetInstance().GetLootFromCurrentCity(),
                                LootClass = new TABS.STATS.Entity.Resource(),
                                Loot = LootClass.getAny();
                            if (LootFromCurrentCity !== null) {
                                for (var i = 0; i < LootFromCurrentCity.length; i++)
                                    Loot[LootFromCurrentCity[i].Type] = LootFromCurrentCity[i].Count;
                                LootClass.setAny(Loot);
                                return LootClass;
                            } else return null;
                        },
                        get_RepairCosts: function (mdbId, level, HealthPoints, AttackCounter) {
                            var ResourcesClass = new TABS.STATS.Entity.Resource(),
                                Resources = ResourcesClass.getAny(),
                                unit = ClientLib.Res.ResMain.GetInstance().GetUnit_Obj(mdbId),
                                Health, dmgRatio, costs;
                            AttackCounter = (AttackCounter !== undefined && AttackCounter !== null ? AttackCounter : 0);
                            if (HealthPoints instanceof TABS.STATS.Entity.HealthPoints) Health = HealthPoints;
                            else Health = new TABS.STATS.Entity.HealthPoints(HealthPoints);
                            if (Health.getStart() != Health.getEnd()) {
                                dmgRatio = (Health.getStart() - Health.getEnd()) / Health.getMax();
                                if (unit.pt !== ClientLib.Base.EPlacementType.Offense || ClientLib.API.Util.GetOwnUnitRepairCosts === undefined) costs = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity() !== null ? ClientLib.API.Util.GetUnitRepairCosts(level, mdbId, dmgRatio) : null;
                                else costs = ClientLib.API.Util.GetOwnUnitRepairCosts(level, mdbId, dmgRatio);
                                for (var i = 0; costs !== null && i < costs.length; i++)
                                    switch (costs[i].Type) {
                                        case ClientLib.Base.EResourceType.Tiberium:
                                        case ClientLib.Base.EResourceType.Crystal:
                                        case ClientLib.Base.EResourceType.Gold:
                                        case ClientLib.Base.EResourceType.ResearchPoints:
                                            Resources[costs[i].Type] = costs[i].Count * Math.pow(0.7, AttackCounter);
                                            break;
                                        default:
                                            Resources[costs[i].Type] = costs[i].Count;
                                            break;
                                    }
                            }
                            if (Resources[ClientLib.Base.EResourceType.ResearchPoints] > 0) Resources[ClientLib.Base.EResourceType.ResearchPoints] = Math.max(1, Math.floor(Resources[ClientLib.Base.EResourceType.ResearchPoints] * dmgRatio));
                            ResourcesClass.setAny(Resources);
                            return ResourcesClass;
                        },
                        get_BuildingInfo: function (cityid) {
                            var BuildingInfo = {},
                                City = ((cityid !== undefined && cityid !== null) ? ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(cityid) : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity());
                            if (City !== null) {
                                var CityBuildingsData = City.get_CityBuildingsData(),
                                    get_BuildingInfo = function (Building) {
                                        if (Building !== null) return {
                                            MdbId: Building.get_TechGameData_Obj().c,
                                            x: Building.get_CoordX(),
                                            y: Building.get_CoordY()
                                        };
                                        else return null;
                                    };
                                BuildingInfo.Construction_Yard = get_BuildingInfo(CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Construction_Yard) || CityBuildingsData.GetBuildingByMDBId(ClientLib.Base.ETech.FOR_Fortress_ConstructionYard));
                                BuildingInfo.Command_Center = get_BuildingInfo(CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Command_Center));
                                BuildingInfo.Barracks = get_BuildingInfo(CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Barracks));
                                BuildingInfo.Factory = get_BuildingInfo(CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Factory));
                                BuildingInfo.Airport = get_BuildingInfo(CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Airport));
                                BuildingInfo.Defense_Facility = get_BuildingInfo(CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Defense_Facility));
                                BuildingInfo.Defense_HQ = get_BuildingInfo(CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Defense_HQ));
                                BuildingInfo.Support = get_BuildingInfo(CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Support_Air) || CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Support_Art) || CityBuildingsData.GetUniqueBuildingByTechName(ClientLib.Base.ETechName.Support_Ion));
                            }
                            return BuildingInfo;
                        },
                        _GetModuleByType: function (modules, type) {
                            for (var i = 0; i < modules.length; i++) {
                                if (modules[i].t == type) return modules[i];
                            }
                            return null;
                        },
                        _patchUnitLifePoints: function (unit, activeModules) {
                            var newUnit = qx.lang.Object.clone(unit, true),
                                module = this._GetModuleByType(newUnit.m, ClientLib.Base.EUnitModuleType.HitpointOverride);
                            if (module !== null && activeModules.indexOf(module.i) != -1) newUnit.lp = module.h;
                            return newUnit;
                        },
                        get_UnitMaxHealthByLevel: function (level, unit, bonus, activeModules) {
                            return Math.floor(ClientLib.API.Util.GetUnitMaxHealthByLevel(level, this._patchUnitLifePoints(unit, activeModules), bonus)) * 16;
                        },
                        get_Stats: function (data) {
                            try {
                                var StatsClass = new TABS.STATS(),
                                    Stats = StatsClass.getAny(),
                                    sim = {},
                                    buildings = data.d.s,
                                    buildingInfo = this.get_BuildingInfo(data.d.di),
                                    efficiency = 0,
                                    ve_level = 1,
                                    defender = data.d.d,
                                    attacker = data.d.a,
                                    unit, unitHealthPoints = new TABS.STATS.Entity.HealthPoints(),
                                    unitRepairCosts, unitMaxHealthPoints, i;

                                function addObject(a, b) {
                                    for (var i in a)
                                        a[i] += b[i];
                                    return a;
                                }
                                //simulation
                                for (i = 0; i < data.e.length; i++)
                                    sim[data.e[i].Key] = data.e[i].Value;
                                //BattleDuration
                                Stats.BattleDuration = (data.d.cs * 100) + (data.d.cs < (data.d.md * 10) ? 3000 : 0);
                                for (i = 0; i < buildings.length; i++) {
                                    unit = ClientLib.Res.ResMain.GetInstance().GetUnit_Obj(buildings[i].i);
                                    //maxHealth
                                    switch (data.d.df) {
                                        case ClientLib.Base.EFactionType.GDIFaction:
                                        case ClientLib.Base.EFactionType.NODFaction:
                                            unitMaxHealthPoints = this.get_UnitMaxHealthByLevel(buildings[i].l, unit, true, data.d.dm);
                                            unitHealthPoints.setMax(sim[buildings[i].ci].mh);
                                            unitHealthPoints.setStart(sim[buildings[i].ci].h);
                                            break;
                                        default:
                                            unitMaxHealthPoints = this.get_UnitMaxHealthByLevel(buildings[i].l, unit, false, data.d.dm);
                                            unitHealthPoints.setMax(Math.max(unitMaxHealthPoints, buildings[i].h * 16));
                                            unitHealthPoints.setStart(buildings[i].h * 16);
                                            break;
                                    }
                                    unitHealthPoints.setEnd(sim[buildings[i].ci].h);
                                    unitRepairCosts = this.get_RepairCosts(buildings[i].i, buildings[i].l, unitHealthPoints);
                                    addObject(Stats.Enemy.Overall.HealthPoints, unitHealthPoints.getAny());
                                    addObject(Stats.Enemy.Overall.Resource, unitRepairCosts.getAny());
                                    addObject(Stats.Enemy.Structure.HealthPoints, unitHealthPoints.getAny());
                                    addObject(Stats.Enemy.Structure.Resource, unitRepairCosts.getAny());
                                    switch (parseInt(ClientLib.Base.Tech.GetTechNameFromTechId(unit.tl, unit.f), 10)) {
                                        case ClientLib.Base.ETechName.Construction_Yard:
                                            addObject(Stats.Enemy.Construction_Yard.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Enemy.Construction_Yard.Resource, unitRepairCosts.getAny());
                                            break;
                                        case ClientLib.Base.ETechName.Command_Center:
                                            addObject(Stats.Enemy.Command_Center.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Enemy.Command_Center.Resource, unitRepairCosts.getAny());
                                            break;
                                        case ClientLib.Base.ETechName.Barracks:
                                            addObject(Stats.Enemy.Barracks.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Enemy.Barracks.Resource, unitRepairCosts.getAny());
                                            break;
                                        case ClientLib.Base.ETechName.Factory:
                                            addObject(Stats.Enemy.Factory.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Enemy.Factory.Resource, unitRepairCosts.getAny());
                                            break;
                                        case ClientLib.Base.ETechName.Airport:
                                            addObject(Stats.Enemy.Airport.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Enemy.Airport.Resource, unitRepairCosts.getAny());
                                            break;
                                        case ClientLib.Base.ETechName.Defense_Facility:
                                            addObject(Stats.Enemy.Defense_Facility.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Enemy.Defense_Facility.Resource, unitRepairCosts.getAny());
                                            efficiency = 0.7 * (unitHealthPoints.getEnd() / unitHealthPoints.getMax());
                                            ve_level = buildings[i].l;
                                            break;
                                        case ClientLib.Base.ETechName.Defense_HQ:
                                            addObject(Stats.Enemy.Defense_HQ.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Enemy.Defense_HQ.Resource, unitRepairCosts.getAny());
                                            break;
                                        case ClientLib.Base.ETechName.Support_Air:
                                        case ClientLib.Base.ETechName.Support_Ion:
                                        case ClientLib.Base.ETechName.Support_Art:
                                            addObject(Stats.Enemy.Support.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Enemy.Support.Resource, unitRepairCosts.getAny());
                                            break;
                                    }
                                    if (buildingInfo.Construction_Yard !== undefined) {
                                        if (buildingInfo.Construction_Yard !== null && buildingInfo.Construction_Yard.x == buildings[i].x && buildingInfo.Construction_Yard.y < buildings[i].y) {
                                            Stats.Enemy.Construction_Yard.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Construction_Yard.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Construction_Yard.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Command_Center !== null && buildingInfo.Command_Center.x == buildings[i].x && buildingInfo.Command_Center.y < buildings[i].y) {
                                            Stats.Enemy.Command_Center.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Command_Center.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Command_Center.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Barracks !== null && buildingInfo.Barracks.x == buildings[i].x && buildingInfo.Barracks.y < buildings[i].y) {
                                            Stats.Enemy.Barracks.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Barracks.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Barracks.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Factory !== null && buildingInfo.Factory.x == buildings[i].x && buildingInfo.Factory.y < buildings[i].y) {
                                            Stats.Enemy.Factory.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Factory.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Factory.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Airport !== null && buildingInfo.Airport.x == buildings[i].x && buildingInfo.Airport.y < buildings[i].y) {
                                            Stats.Enemy.Airport.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Airport.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Airport.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Defense_Facility !== null && buildingInfo.Defense_Facility.x == buildings[i].x && buildingInfo.Defense_Facility.y < buildings[i].y) {
                                            Stats.Enemy.Defense_Facility.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Defense_Facility.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Defense_Facility.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Defense_HQ !== null && buildingInfo.Defense_HQ.x == buildings[i].x && buildingInfo.Defense_HQ.y < buildings[i].y) {
                                            Stats.Enemy.Defense_HQ.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Defense_HQ.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Defense_HQ.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Support !== null && buildingInfo.Support.x == buildings[i].x && buildingInfo.Support.y < buildings[i].y) {
                                            Stats.Enemy.Support.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Support.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Support.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                    }
                                }
                                for (i = 0; i < defender.length; i++) {
                                    unit = ClientLib.Res.ResMain.GetInstance().GetUnit_Obj(defender[i].i);
                                    //maxHealth
                                    switch (data.d.df) {
                                        case ClientLib.Base.EFactionType.GDIFaction:
                                        case ClientLib.Base.EFactionType.NODFaction:
                                            unitMaxHealthPoints = this.get_UnitMaxHealthByLevel(defender[i].l, unit, true, data.d.dm);
                                            break;
                                        default:
                                            unitMaxHealthPoints = this.get_UnitMaxHealthByLevel(defender[i].l, unit, false, data.d.dm);
                                            break;
                                    }
                                    unitHealthPoints.setMax(Math.max(unitMaxHealthPoints, defender[i].h * 16));
                                    unitHealthPoints.setStart(defender[i].h * 16);
                                    unitHealthPoints.setEnd(sim[defender[i].ci].h);
                                    unitHealthPoints.setRep((((defender[i].h * 16) - (sim[defender[i].ci].h)) * efficiency * ve_level) / Math.max(ve_level, defender[i].l));
                                    unitRepairCosts = this.get_RepairCosts(defender[i].i, defender[i].l, unitHealthPoints, defender[i].ac);
                                    addObject(Stats.Enemy.Overall.HealthPoints, unitHealthPoints.getAny());
                                    addObject(Stats.Enemy.Overall.Resource, unitRepairCosts.getAny());
                                    addObject(Stats.Enemy.Defense.HealthPoints, unitHealthPoints.getAny());
                                    addObject(Stats.Enemy.Defense.Resource, unitRepairCosts.getAny());
                                    if (unit.ptt == ClientLib.Base.EArmorType.NONE) {
                                        addObject(Stats.Enemy.DefenseNonArmored.HealthPoints, unitHealthPoints.getAny());
                                        addObject(Stats.Enemy.DefenseNonArmored.Resource, unitRepairCosts.getAny());
                                    } else {
                                        addObject(Stats.Enemy.DefenseArmored.HealthPoints, unitHealthPoints.getAny());
                                        addObject(Stats.Enemy.DefenseArmored.Resource, unitRepairCosts.getAny());
                                    }
                                    if (buildingInfo.Construction_Yard !== undefined && unit.mt == ClientLib.Base.EUnitMovementType.Structure) {
                                        if (buildingInfo.Construction_Yard !== null && buildingInfo.Construction_Yard.x == defender[i].x) {
                                            Stats.Enemy.Construction_Yard.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Construction_Yard.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Construction_Yard.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Command_Center !== null && buildingInfo.Command_Center.x == defender[i].x) {
                                            Stats.Enemy.Command_Center.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Command_Center.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Command_Center.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Barracks !== null && buildingInfo.Barracks.x == defender[i].x) {
                                            Stats.Enemy.Barracks.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Barracks.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Barracks.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Factory !== null && buildingInfo.Factory.x == defender[i].x) {
                                            Stats.Enemy.Factory.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Factory.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Factory.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Airport !== null && buildingInfo.Airport.x == defender[i].x) {
                                            Stats.Enemy.Airport.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Airport.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Airport.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Defense_Facility !== null && buildingInfo.Defense_Facility.x == defender[i].x) {
                                            Stats.Enemy.Defense_Facility.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Defense_Facility.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Defense_Facility.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Defense_HQ !== null && buildingInfo.Defense_HQ.x == defender[i].x) {
                                            Stats.Enemy.Defense_HQ.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Defense_HQ.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Defense_HQ.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                        if (buildingInfo.Support !== null && buildingInfo.Support.x == defender[i].x) {
                                            Stats.Enemy.Support.HealthPoints.maxFront += unitHealthPoints.getMax();
                                            Stats.Enemy.Support.HealthPoints.startFront += unitHealthPoints.getStart();
                                            Stats.Enemy.Support.HealthPoints.endFront += unitHealthPoints.getEnd();
                                        }
                                    }
                                }
                                if (ClientLib.API.Util.GetOwnUnitRepairCosts === undefined) ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentCityId(data.d.ai);
                                for (i = 0; i < attacker.length; i++) {
                                    unit = ClientLib.Res.ResMain.GetInstance().GetUnit_Obj(attacker[i].i);
                                    //maxHealth
                                    unitMaxHealthPoints = this.get_UnitMaxHealthByLevel(attacker[i].l, unit, false, data.d.am);
                                    unitHealthPoints.setMax(Math.max(unitMaxHealthPoints, attacker[i].h * 16));
                                    unitHealthPoints.setStart(attacker[i].h * 16);
                                    if (sim[attacker[i].ci] !== undefined) unitHealthPoints.setEnd(sim[attacker[i].ci].h);
                                    else unitHealthPoints.setEnd(attacker[i].h * 16);
                                    unitRepairCosts = this.get_RepairCosts(attacker[i].i, attacker[i].l, unitHealthPoints);
                                    addObject(Stats.Offense.Overall.HealthPoints, unitHealthPoints.getAny());
                                    addObject(Stats.Offense.Overall.Resource, unitRepairCosts.getAny());
                                    switch (unit.mt) {
                                        case ClientLib.Base.EUnitMovementType.Feet:
                                            addObject(Stats.Offense.Infantry.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Offense.Infantry.Resource, unitRepairCosts.getAny());
                                            break;
                                        case ClientLib.Base.EUnitMovementType.Wheel:
                                        case ClientLib.Base.EUnitMovementType.Track:
                                            addObject(Stats.Offense.Vehicle.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Offense.Vehicle.Resource, unitRepairCosts.getAny());
                                            break;
                                        case ClientLib.Base.EUnitMovementType.Air:
                                        case ClientLib.Base.EUnitMovementType.Air2:
                                            addObject(Stats.Offense.Aircraft.HealthPoints, unitHealthPoints.getAny());
                                            addObject(Stats.Offense.Aircraft.Resource, unitRepairCosts.getAny());
                                            break;
                                    }
                                }
                                if (ClientLib.API.Util.GetOwnUnitRepairCosts === undefined) ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentCityId(data.d.di);
                                StatsClass.setAny(Stats);
                                return StatsClass;
                            } catch (e) {
                                console.group("Tiberium Alliances Battle Simulator V2");
                                console.error("Error in TABS.UTIL.Stats.get_Stats()", e);
                                console.groupEnd();
                            }
                        },
                        patchGetUnitRepairCosts: function () {
                            try {
                                /*  for (var i in ClientLib.Data.Cities.prototype) {
                                     if (typeof ClientLib.Data.Cities.prototype[i] === "function" && ClientLib.Data.Cities.prototype[i] == ClientLib.Data.Cities.prototype.get_CurrentCity && i !== "get_CurrentCity") break;
                                 }
                                 var GetOwnUnitRepairCosts = ClientLib.API.Util.GetUnitRepairCosts.toString().replace(i, "get_CurrentOwnCity"),
                                     args = GetOwnUnitRepairCosts.substring(GetOwnUnitRepairCosts.indexOf("(") + 1, GetOwnUnitRepairCosts.indexOf(")")),
                                     body = GetOwnUnitRepairCosts.substring(GetOwnUnitRepairCosts.indexOf("{") + 1, GetOwnUnitRepairCosts.lastIndexOf("}")); /*jslint evil: true */
                                //ClientLib.API.Util.GetOwnUnitRepairCosts = Evil(args, body); /*jslint evil: false */ 
                                //MOD NOEVIL 1
                                ClientLib.API.Util.GetOwnGetUnitRepairCosts = function (a, b, c) {
                                    var $createHelper;
                                    return ClientLib.API.Util.GetUnitRepairCostsForCity(ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity(), a, b, c);
                                }
                            } catch (e) {
                                console.group("Tiberium Alliances Battle Simulator V2");
                                console.error("Error setting up ClientLib.API.Util.GetOwnUnitRepairCosts", e);
                                console.groupEnd();
                            }
                        }
                    },
                    defer: function (statics) {
                        try {
                            statics.patchGetUnitRepairCosts();
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up UTIL.Stats defer", e);
                            console.groupEnd();
                        }
                    }
                });
                qx.Class.define("TABS.UTIL.Battleground", { // [static]		Battleground
                    type: "static",
                    statics: {
                        StartReplay: function (cityid, combat) {
                            qx.core.Init.getApplication().getPlayArea().setView(ClientLib.Data.PlayerAreaViewMode.pavmCombatReplay, cityid, 0, 0);
                            ClientLib.Vis.VisMain.GetInstance().get_Battleground().Init();
                            ClientLib.Vis.VisMain.GetInstance().get_Battleground().LoadCombatDirect(combat);
                            qx.event.Timer.once(function () {
                                ClientLib.Vis.VisMain.GetInstance().get_Battleground().RestartReplay();
                                //MOD FIX DATE APPEAR
                                _this = TABS.GUI.PlayArea.getInstance();
                                if (typeof _this._playAreaChildren[11].getChildren == 'function' && typeof Date.parse(_this._playAreaChildren[11].getChildren()[0].getValue()) == 'number') {
                                    _this._playAreaChildren[11].exclude();
                                }
                                //MOD FIX PLAY BUTTON
                                _this = TABS.GUI.ReportReplayOverlay.getInstance();
                                let r = _this.ReportReplayOverlay;
                                null != r[_this.PBIS] && r[_this.PBIS].setIcon('FactionUI/icons/icon_replay_pause_button.png');
                                null != r[_this.PBIS_S] && (r[_this.PBIS_S] = !1);
                                null != r[_this.PBIS_L] && r[_this.PBIS_L].setValue('x1.0');
                                null != r[_this.PBIS_SK] && r[_this.PBIS_SK].exclude();
                                ClientLib.Vis.VisMain.GetInstance().get_Battleground().set_ReplaySpeed(1);
                            }, this, 0);
                        }
                    }
                });
                qx.Class.define("TABS.UTIL.CNCTAOpt", { // [static]		CNCTAOpt
                    type: "static",
                    statics: {
                        keymap: {
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
                            "GDI_Harvester": "h",
                            "GDI_Harvester_Crystal": "n",
                            "FOR_Silo": "s",
                            "FOR_Refinery": "r",
                            "FOR_Tiberium Booster": "b",
                            "FOR_Crystal Booster": "v",
                            "FOR_Trade Center": "u",
                            "FOR_Defense Facility": "w",
                            "FOR_Construction Yard": "y",
                            "FOR_Harvester_Tiberium": "h",
                            "FOR_Defense HQ": "q",
                            "FOR_Harvester_Crystal": "n",
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
                            "FOR_Wall": "w",
                            "FOR_Barbwire_VS_Inf": "b",
                            "FOR_Barrier_VS_Veh": "t",
                            "FOR_Inf_VS_Inf": "g",
                            "FOR_Inf_VS_Veh": "r",
                            "FOR_Inf_VS_Air": "q",
                            "FOR_Sniper": "n",
                            "FOR_Mammoth": "y",
                            "FOR_Veh_VS_Inf": "o",
                            "FOR_Veh_VS_Veh": "s",
                            "FOR_Veh_VS_Air": "u",
                            "FOR_Turret_VS_Inf": "m",
                            "FOR_Turret_VS_Inf_ranged": "a",
                            "FOR_Turret_VS_Veh": "v",
                            "FOR_Turret_VS_Veh_ranged": "d",
                            "FOR_Turret_VS_Air": "f",
                            "FOR_Turret_VS_Air_ranged": "e",
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
                        createLink: function (city, own_city) {
                            city = ((city !== undefined && city !== null) ? city : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity());
                            own_city = ((own_city !== undefined && own_city !== null) ? own_city : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity());

                            function findTechLayout(city) {
                                for (var k in city)
                                    if ((typeof (city[k]) == "object") && city[k] && 0 in city[k] && 8 in city[k])
                                        if ((typeof (city[k][0]) == "object") && city[k][0] && city[k][0] && 0 in city[k][0] && 15 in city[k][0])
                                            if ((typeof (city[k][0][0]) == "object") && city[k][0][0] && "BuildingIndex" in city[k][0][0]) return city[k];
                                return null;
                            }

                            function findBuildings(city) {
                                var cityBuildings = city.get_CityBuildingsData();
                                for (var k in cityBuildings) {
                                    if ((typeof (cityBuildings[k]) === "object") && cityBuildings[k] && "d" in cityBuildings[k] && "c" in cityBuildings[k] && cityBuildings[k].c > 0) return cityBuildings[k].d;
                                }
                            }

                            function getUnitArrays(city) {
                                var ret = [];
                                for (var k in city)
                                    if ((typeof (city[k]) == "object") && city[k])
                                        for (var k2 in city[k])
                                            if ((typeof (city[k][k2]) == "object") && city[k][k2] && "d" in city[k][k2]) {
                                                var lst = city[k][k2].d;
                                                if ((typeof (lst) == "object") && lst)
                                                    for (var i in lst)
                                                        if (typeof (lst[i]) == "object" && lst[i] && "get_CurrentLevel" in lst[i]) ret.push(lst);
                                            }
                                return ret;
                            }

                            function getDefenseUnits(city) {
                                var arr = getUnitArrays(city);
                                for (var i = 0; i < arr.length; ++i)
                                    for (var j in arr[i])
                                        if (TABS.UTIL.Formation.GetUnitGroupTypeFromUnit(arr[i][j].get_UnitGameData_Obj()) == ClientLib.Data.EUnitGroup.Defense) return arr[i];
                                return [];
                            }

                            function getFactionKey(faction) {
                                switch (faction) {
                                    case ClientLib.Base.EFactionType.GDIFaction:
                                        return "G";
                                    case ClientLib.Base.EFactionType.NODFaction:
                                        return "N";
                                    case ClientLib.Base.EFactionType.FORFaction:
                                    case ClientLib.Base.EFactionType.NPCBase:
                                    case ClientLib.Base.EFactionType.NPCCamp:
                                    case ClientLib.Base.EFactionType.NPCOutpost:
                                    case ClientLib.Base.EFactionType.NPCFortress:
                                        return "F";
                                    default:
                                        console.log("cnctaopt: Unknown faction: " + city.get_CityFaction());
                                        return "E";
                                }
                            }

                            function getUnitKey(unit) {
                                if (typeof TABS.UTIL.CNCTAOpt.keymap[unit.n] !== "undefined") {
                                    return TABS.UTIL.CNCTAOpt.keymap[unit.n];
                                } else {
                                    return ".";
                                }
                            }
                            var link = "http://www.cnctaopt.com/?map=",
                                defense_units = [],
                                offense_units = [],
                                defense_unit_list = getDefenseUnits(city),
                                army = own_city.get_CityArmyFormationsManager().GetFormationByTargetBaseId(city.get_Id()),
                                offense_unit_list, techLayout = findTechLayout(city),
                                buildings = findBuildings(city),
                                row, spot, level, building, defense_unit, offense_unit, alliance = ClientLib.Data.MainData.GetInstance().get_Alliance(),
                                i;
                            link += "3~"; // link version
                            link += getFactionKey(city.get_CityFaction()) + "~";
                            link += getFactionKey(own_city.get_CityFaction()) + "~";
                            link += city.get_Name() + "~";
                            for (i = 0; i < 20; ++i) {
                                defense_units.push([null, null, null, null, null, null, null, null, null]);
                                offense_units.push([null, null, null, null, null, null, null, null, null]);
                            }
                            for (i in defense_unit_list)
                                defense_units[defense_unit_list[i].get_CoordX()][defense_unit_list[i].get_CoordY() + 8] = defense_unit_list[i];
                            if (army.get_ArmyUnits() !== null) offense_unit_list = army.get_ArmyUnits().l;
                            else offense_unit_list = city.get_CityUnitsData().get_OffenseUnits().d;
                            for (i in offense_unit_list)
                                if (offense_unit_list[i].get_Enabled() && !offense_unit_list[i].get_IsTransportedCityEntity()) offense_units[offense_unit_list[i].get_CoordX()][offense_unit_list[i].get_CoordY() + 16] = offense_unit_list[i];
                            for (i = 0; i < 20; ++i) {
                                row = [];
                                for (var j = 0; j < 9; ++j) {
                                    spot = i > 16 ? null : techLayout[j][i];
                                    level = 0;
                                    building = null;
                                    if (spot && spot.BuildingIndex >= 0) {
                                        building = buildings[spot.BuildingIndex];
                                        level = building.get_CurrentLevel();
                                    }
                                    defense_unit = defense_units[j][i];
                                    if (defense_unit) {
                                        level = defense_unit.get_CurrentLevel();
                                    }
                                    offense_unit = offense_units[j][i];
                                    if (offense_unit) {
                                        level = offense_unit.get_CurrentLevel();
                                    }
                                    if (level > 1) {
                                        link += level;
                                    }
                                    switch (i > 16 ? 0 : city.GetResourceType(j, i)) {
                                        case ClientLib.Data.ECityTerrainType.NONE:
                                            if (building) {
                                                link += getUnitKey(GAMEDATA.Tech[building.get_MdbBuildingId()]);
                                            } else if (defense_unit) {
                                                link += getUnitKey(defense_unit.get_UnitGameData_Obj());
                                            } else if (offense_unit) {
                                                link += getUnitKey(offense_unit.get_UnitGameData_Obj());
                                            } else {
                                                link += ".";
                                            }
                                            break;
                                        case ClientLib.Data.ECityTerrainType.CRYSTAL:
                                            if (spot.BuildingIndex < 0) link += "c";
                                            else link += "n";
                                            break;
                                        case ClientLib.Data.ECityTerrainType.TIBERIUM:
                                            if (spot.BuildingIndex < 0) link += "t";
                                            else link += "h";
                                            break;
                                        case ClientLib.Data.ECityTerrainType.FOREST:
                                            link += "j";
                                            break;
                                        case ClientLib.Data.ECityTerrainType.BRIAR:
                                            link += "h";
                                            break;
                                        case ClientLib.Data.ECityTerrainType.SWAMP:
                                            link += "l";
                                            break;
                                        case ClientLib.Data.ECityTerrainType.WATER:
                                            link += "k";
                                            break;
                                        default:
                                            console.log("cnctaopt [4]: Unhandled resource type: " + city.GetResourceType(j, i));
                                            link += ".";
                                            break;
                                    }
                                }
                            }
                            if (alliance) {
                                link += "~" + alliance.get_POITiberiumBonus();
                                link += "~" + alliance.get_POICrystalBonus();
                                link += "~" + alliance.get_POIPowerBonus();
                                link += "~" + alliance.get_POIInfantryBonus();
                                link += "~" + alliance.get_POIVehicleBonus();
                                link += "~" + alliance.get_POIAirBonus();
                                link += "~" + alliance.get_POIDefenseBonus();
                            }
                            if (ClientLib.Data.MainData.GetInstance().get_Server().get_TechLevelUpgradeFactorBonusAmount() != 1.20) {
                                link += "~newEconomy";
                            }
                            // append cnctaopt.com's extra parameters ...
                            var coordX = city.get_X();
                            var coordY = city.get_Y();
                            // append base's coords to link
                            link += "~X" + coordX + "Y" + coordY;
                            // append world id and world name
                            link += "~WID=" + ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId();
                            link += "~WN=" + ClientLib.Data.MainData.GetInstance().get_Server().get_Name();
                            return link;
                        },
                        parseLink: function (link) {
                            var formation = TABS.UTIL.Formation.Get();

                            function getFaction(faction) {
                                switch (faction) {
                                    case "G":
                                        return ClientLib.Base.EFactionType.GDIFaction;
                                    case "N":
                                        return ClientLib.Base.EFactionType.NODFaction;
                                    case "F":
                                        return ClientLib.Base.EFactionType.FORFaction;
                                    default:
                                        return ClientLib.Base.EFactionType.NotInitialized;
                                }
                            }

                            function initMapRev() {
                                var units = GAMEDATA.units,
                                    keys = Object.keys(GAMEDATA.units),
                                    len = keys.length,
                                    unit, data = {
                                        1: {
                                            0: {},
                                            1: {},
                                            2: {}
                                        },
                                        2: {
                                            0: {},
                                            1: {},
                                            2: {}
                                        },
                                        3: {
                                            0: {},
                                            1: {},
                                            2: {}
                                        }
                                    };
                                while (len--) {
                                    unit = units[keys[len]];
                                    if (typeof TABS.UTIL.CNCTAOpt.keymap[unit.n] !== "undefined") {
                                        switch (unit.pt) {
                                            case ClientLib.Base.EPlacementType.Offense:
                                                data[unit.f][2][TABS.UTIL.CNCTAOpt.keymap[unit.n]] = parseInt(keys[len], 10);
                                                break;
                                            case ClientLib.Base.EPlacementType.Defense:
                                                data[unit.f][1][TABS.UTIL.CNCTAOpt.keymap[unit.n]] = parseInt(keys[len], 10);
                                                break;
                                            case ClientLib.Base.EPlacementType.Structure:
                                                data[unit.f][0][TABS.UTIL.CNCTAOpt.keymap[unit.n]] = parseInt(keys[len], 10);
                                                break;
                                            default:
                                                console.log("Unknown map: " + unit.n);
                                                break;
                                        }
                                    }
                                }
                                return data;
                            }

                            function findFreePos(formation) {
                                var x, y, i, map = [];
                                for (x = 0; x < ClientLib.Base.Util.get_ArmyMaxSlotCountX(); x++) {
                                    map[x] = [];
                                    for (y = 0; y < ClientLib.Base.Util.get_ArmyMaxSlotCountY(); y++) {
                                        map[x][y] = false;
                                        for (i = 0; i < formation.length; i++) {
                                            if (formation[i].x === x && formation[i].y === y) map[x][y] = true;
                                        }
                                    }
                                }
                                for (x = 0; x < ClientLib.Base.Util.get_ArmyMaxSlotCountX(); x++) {
                                    for (y = 0; y < ClientLib.Base.Util.get_ArmyMaxSlotCountY(); y++) {
                                        if (map[x][y] === false) {
                                            return {
                                                'x': x,
                                                'y': y
                                            };
                                        }
                                    }
                                }
                                return null;
                            }
                            if (link !== null && link.indexOf("|") != -1) {
                                var parts = link.split("|");
                                if (parts === null | parts.length < 5) {
                                    console.log("Corrupt link");
                                    return formation;
                                }
                                var keymapRev = initMapRev(),
                                    faction1 = getFaction(parts[1]),
                                    faction2 = getFaction(parts[2]),
                                    re = /[chjklnt.]|[\d]+[^.]/g,
                                    count = -1,
                                    step, type, id, level, section, i, j, x, y, result, units = [],
                                    freePos;
                                while ((result = re.exec(parts[4]))) {
                                    result = result ? result[0] : null;
                                    step = ++count % 72;
                                    x = step % 9;
                                    y = Math.floor(step / 9);
                                    if (result.length !== 1) {
                                        type = result.substr(-1);
                                        level = parseInt(result.slice(0, -1), 10);
                                        section = Math.floor(count / 72);
                                        if (typeof keymapRev[section == 2 ? faction2 : faction1][section][type] === "undefined") {
                                            console.log("Unknown key: " + result + " at pos: " + count);
                                            continue;
                                        }
                                        id = keymapRev[section == 2 ? faction2 : faction1][section][type];
                                        switch (id) {
                                            case 175:
                                                id = 115;
                                                break;
                                            case 176:
                                                id = 155;
                                                break;
                                        }
                                        if (GAMEDATA.units[id].pt == ClientLib.Base.EPlacementType.Offense) {
                                            units.push({
                                                i: id,
                                                l: level,
                                                x: x,
                                                y: y
                                            });
                                        }
                                    }
                                }
                                formation = TABS.UTIL.Formation.set_Enabled(formation, false);
                                for (i = 0; i < formation.length; i++) {
                                    for (j = 0; j < units.length; j++) {
                                        if (units[j] !== null && formation[i].i == units[j].i && formation[i].l == units[j].l) {
                                            formation[i].x = units[j].x;
                                            formation[i].y = units[j].y;
                                            formation[i].enabled = true;
                                            units.splice(j, 1);
                                            break;
                                        }
                                    }
                                }
                                for (i = 0; i < formation.length; i++) {
                                    if (formation[i].enabled === false) {
                                        freePos = findFreePos(formation);
                                        if (freePos !== null) {
                                            formation[i].x = freePos.x;
                                            formation[i].y = freePos.y;
                                        }
                                    }
                                }
                            }
                            return formation;
                        }
                    }
                });
                qx.Class.define("TABS.MENU", { // [singleton]	Menu
                    type: "singleton",
                    extend: qx.core.Object,
                    include: [qx.locale.MTranslation],
                    construct: function () {
                        this.base(arguments);
                        var ScriptsButton = qx.core.Init.getApplication().getMenuBar().getScriptsButton();
                        this.Menu = new qx.ui.menu.Menu();
                        ScriptsButton.Add("Battle Simulator V2", TABS.RES.IMG.Menu, this.Menu);
                        //SETTINGS
                        var settingsMenu = new qx.ui.menu.Menu(),
                            settingsLoad = new qx.ui.menu.Button(this.tr("load"), null, null),
                            settingsSave = new qx.ui.menu.Button(this.tr("save"), null, null),
                            settingsReset = new qx.ui.menu.Button(this.tr("reset"), null, null);
                        settingsLoad.addListener("execute", function () {
                            TABS.SETTINGS.load();
                        }, this);
                        settingsSave.addListener("execute", function () {
                            TABS.SETTINGS.save();
                        }, this);
                        settingsReset.addListener("execute", function () {
                            TABS.SETTINGS.reset();
                            alert(this.tr("Game will reload now."));
                            window.location.reload();
                        }, this);
                        settingsMenu.add(settingsLoad);
                        settingsMenu.add(settingsSave);
                        settingsMenu.add(settingsReset);
                        this.Menu.add(new qx.ui.menu.Button("Settings", null, null, settingsMenu));
                        //Info
                        this.Menu.add(new qx.ui.menu.Separator());
                        var infoMenu = new qx.ui.menu.Menu(),
                            infoHomepage = new qx.ui.menu.Button(this.tr("Homepage"), "", null),
                            infoFacebook = new qx.ui.menu.Button(this.tr("Facebook"), "", null);
                        infoHomepage.addListener("execute", function () {
                            qx.core.Init.getApplication().showExternal("http://eistee82.github.io/ta_simv2");
                        }, this);
                        infoFacebook.addListener("execute", function () {
                            qx.core.Init.getApplication().showExternal("https://www.facebook.com/tasimv2");
                        }, this);
                        infoMenu.add(infoHomepage);
                        infoMenu.add(infoFacebook);
                        this.Menu.add(new qx.ui.menu.Button("Info", null, null, infoMenu));
                    },
                    members: {
                        Menu: null
                    },
                    defer: function () {
                        TABS.addInit("TABS.MENU");
                    }
                });
                qx.Class.define("TABS.STATS", { //				Stats Object
                    extend: qx.core.Object,
                    statics: {
                        Prio: {
                            Click: 0,
                            Enemy: 1,
                            Structure: 2,
                            Construction_Yard: 3,
                            Command_Center: 4,
                            Barracks: 5,
                            Factory: 6,
                            Airport: 7,
                            Defense_Facility: 8,
                            Defense_HQ: 9,
                            Support: 10,
                            Defense: 11,
                            DefenseArmored: 12,
                            DefenseNonArmored: 13,
                            Offense: 14,
                            Infantry: 15,
                            Vehicle: 16,
                            Aircraft: 17,
                            BattleDuration: 18,
                            AutoRepair: 19
                        },
                        Type: {
                            Click: 0,
                            HealthPointPercent: 1,
                            RepairChargeBase: 2,
                            RepairChargeOffense: 3,
                            RepairCosts: 4,
                            Loot: 5,
                            HealthPointAutoRepairPercent: 6
                        },
                        getPreset: function (num) {
                            switch (num) {
                                case 1:
                                    // Construction_Yard
                                    return {
                                        Name: "CY",
                                            Description: "Most priority to construction yard including all in front of it.<br>After this the best total enemy health from the cached simulations is selected.<br>If no better simulation is found, the best offence unit repair charge and<br>battle duration from the cached simulations is selected.",
                                            Prio: [
                                                [TABS.STATS.Prio.Construction_Yard, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.Enemy, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.RepairChargeOffense, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.BattleDuration, null, false, 0, false]
                                            ]
                                    };
                                case 2:
                                    // Defense_Facility
                                    return {
                                        Name: "DF",
                                            Description: "Most priority to defense facility including all in front of it.<br>After this the best armored defense health from the cached simulations is selected.<br>If no better simulation is found, the best offence unit repair charge and<br>battle duration from the cached simulations is selected.",
                                            Prio: [
                                                [TABS.STATS.Prio.Defense_Facility, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.DefenseArmored, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.RepairChargeOffense, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.BattleDuration, null, false, 0, false]
                                            ]
                                    };
                                case 3:
                                    // Defense
                                    return {
                                        Name: "Deff",
                                            Description: "Most priority to defense health including the auto repair after the battle.<br>If no better simulation is found, the best offence unit repair charge and<br>battle duration from the cached simulations is selected.",
                                            Prio: [
                                                [TABS.STATS.Prio.AutoRepair, TABS.STATS.Type.HealthPointAutoRepairPercent, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.RepairChargeOffense, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.BattleDuration, null, false, 0, false]
                                            ]
                                    };
                                case 4:
                                    // Command_Center
                                    return {
                                        Name: "CC",
                                            Description: "Most priority to command center including all in front of it.<br>After this the best total enemy health from the cached simulations is selected.<br>If no better simulation is found, the best offence unit repair charge and<br>battle duration from the cached simulations is selected.",
                                            Prio: [
                                                [TABS.STATS.Prio.Command_Center, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.Enemy, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.RepairChargeOffense, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.BattleDuration, null, false, 0, false]
                                            ]
                                    };
                                case 5:
                                    // Construction_Yard nokill 10%
                                    return {
                                        Name: "CY*",
                                            Description: "NoKill (farming) priorety.<br>Not working correctly yet.",
                                            Prio: [
                                                [TABS.STATS.Prio.DefenseArmored, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.Defense_Facility, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.Construction_Yard, TABS.STATS.Type.HealthPointPercent, false, 0.1, true],
                                                [TABS.STATS.Prio.Enemy, TABS.STATS.Type.HealthPointPercent, true, 0.8, true],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.RepairChargeOffense, false, 0, false],
                                                [TABS.STATS.Prio.Offense, TABS.STATS.Type.HealthPointPercent, false, 0, false],
                                                [TABS.STATS.Prio.BattleDuration, null, false, 0, false]
                                            ]
                                    };
                                default:
                                    return {
                                        Name: "live",
                                            Description: "Shows the current army formation.",
                                            Prio: []
                                    };
                            }
                        },
                        selectPrio: function (stats, prio /*[this.Prio, this.Type, Negate/Boolean, Limit/0.0-1.0/%, NoKill/Boolean]*/ ) {
                            switch (prio[0]) {
                                case this.Prio.Enemy:
                                    return this._selectType(stats.Enemy.Overall, prio);
                                case this.Prio.Structure:
                                    return this._selectType(stats.Enemy.Structure, prio);
                                case this.Prio.Construction_Yard:
                                    return this._selectType(stats.Enemy.Construction_Yard, prio);
                                case this.Prio.Command_Center:
                                    return this._selectType(stats.Enemy.Command_Center, prio);
                                case this.Prio.Barracks:
                                    return this._selectType(stats.Enemy.Barracks, prio);
                                case this.Prio.Factory:
                                    return this._selectType(stats.Enemy.Factory, prio);
                                case this.Prio.Airport:
                                    return this._selectType(stats.Enemy.Airport, prio);
                                case this.Prio.Defense_Facility:
                                    return this._selectType(stats.Enemy.Defense_Facility, prio);
                                case this.Prio.Defense_HQ:
                                    return this._selectType(stats.Enemy.Defense_HQ, prio);
                                case this.Prio.Support:
                                    return this._selectType(stats.Enemy.Support, prio);
                                case this.Prio.Defense:
                                    return this._selectType(stats.Enemy.Defense, prio);
                                case this.Prio.DefenseArmored:
                                    return this._selectType(stats.Enemy.DefenseArmored, prio);
                                case this.Prio.DefenseNonArmored:
                                    return this._selectType(stats.Enemy.DefenseNonArmored, prio);
                                case this.Prio.Offense:
                                    return this._selectType(stats.Offense.Overall, prio);
                                case this.Prio.Infantry:
                                    return this._selectType(stats.Offense.Infantry, prio);
                                case this.Prio.Vehicle:
                                    return this._selectType(stats.Offense.Vehicle, prio);
                                case this.Prio.Aircraft:
                                    return this._selectType(stats.Offense.Aircraft, prio);
                                case this.Prio.BattleDuration:
                                    return this._calcBattleDuration(stats.BattleDuration, prio);
                                case this.Prio.AutoRepair:
                                    return this._selectType(stats.Enemy.DefenseArmored, prio);
                                default:
                                    return Number.MAX_VALUE;
                            }
                        },
                        _selectType: function (entity, prio) {
                            switch (prio[1]) {
                                case this.Type.HealthPointPercent:
                                    return this._calcHealthPoints(entity.HealthPoints, prio);
                                case this.Type.RepairChargeBase:
                                    return entity.Resource[ClientLib.Base.EResourceType.RepairChargeBase] * (prio[2] ? -1 : 1); // Negate
                                case this.Type.RepairChargeOffense:
                                    return Math.max(
                                        entity.Resource[ClientLib.Base.EResourceType.RepairChargeAir], entity.Resource[ClientLib.Base.EResourceType.RepairChargeInf], entity.Resource[ClientLib.Base.EResourceType.RepairChargeVeh]) * (prio[2] ? -1 : 1); // Negate
                                case this.Type.RepairCosts:
                                case this.Type.Loot:
                                    return this._calcCosts(entity.Resource, prio);
                                case this.Type.HealthPointAutoRepairPercent:
                                    return this._calcHealthPointsAutoRepair(entity.HealthPoints, prio);
                                default:
                                    return Number.MAX_VALUE;
                            }
                        },
                        _calcCosts: function (Resource /*{ ClientLib.Base.EResourceType.Tiberium: 0, ClientLib.Base.EResourceType.Crystal: 0, ClientLib.Base.EResourceType.Credits: 0, ClientLib.Base.EResourceType.ResearchPoints: 0 }*/ , prio) {
                            var costs = Resource[ClientLib.Base.EResourceType.Tiberium] + Resource[ClientLib.Base.EResourceType.Crystal] + Resource[ClientLib.Base.EResourceType.Credits] + Resource[ClientLib.Base.EResourceType.ResearchPoints];
                            return costs * (prio[2] ? -1 : 1); // Negate
                        },
                        _calcHealthPoints: function (HealthPoints /*{ max: 0, end: 0 }*/ , prio) { //Todo: better front value selection
                            var result = HealthPoints.end + HealthPoints.endFront;
                            if (HealthPoints.end < (prio[3] * HealthPoints.max)) // Limit
                                result = (prio[3] * (HealthPoints.max + HealthPoints.maxFront));
                            if (prio[4] === true && !HealthPoints.end) // NoKill
                                result = HealthPoints.max + HealthPoints.maxFront;
                            if (result > (HealthPoints.max + HealthPoints.maxFront)) // max 1
                                result = (HealthPoints.max + HealthPoints.maxFront);
                            if (result < 0) // min 0
                                result = 0;
                            switch (prio[0]) { // Negate Offense
                                case this.Prio.Offense:
                                case this.Prio.Infantry:
                                case this.Prio.Vehicle:
                                case this.Prio.Aircraft:
                                    result = -1 * result;
                                    break;
                            }
                            return result * (prio[2] ? -1 : 1); // Negate
                        },
                        _calcHealthPointsAutoRepair: function (HealthPoints /*{ max: 0, end: 0 }*/ , prio) { //Todo: better front value selection
                            var result = HealthPoints.end + HealthPoints.rep + HealthPoints.endFront;
                            if ((HealthPoints.end + HealthPoints.rep) < (prio[3] * HealthPoints.max)) // Limit
                                result = (prio[3] * (HealthPoints.max + HealthPoints.maxFront));
                            if (prio[4] === true && (HealthPoints.end + HealthPoints.rep) !== 0) // NoKill
                                result = HealthPoints.max + HealthPoints.maxFront;
                            if (result > (HealthPoints.max + HealthPoints.maxFront)) // max 1
                                result = (HealthPoints.max + HealthPoints.maxFront);
                            if (result < 0) // min 0
                                result = 0;
                            switch (prio[0]) { // Negate Offense
                                case this.Prio.Offense:
                                case this.Prio.Infantry:
                                case this.Prio.Vehicle:
                                case this.Prio.Aircraft:
                                    result = -1 * result;
                                    break;
                            }
                            return result * (prio[2] ? -1 : 1); // Negate
                        },
                        _calcBattleDuration: function (BattleDuration /*int*/ , prio) {
                            var result = BattleDuration,
                                max = 120000;
                            if (result < (prio[3] * max)) // Limit
                                result = (prio[3] * max);
                            if (result > max) // max 1
                                result = max;
                            if (result < 0) // min 0
                                result = 0;
                            return result * (prio[2] ? -1 : 1); // Negate
                        }
                    },
                    properties: {
                        BattleDuration: {
                            check: "Number",
                            init: 0,
                            event: "changeBattleDuration"
                        }
                    },
                    members: {
                        Enemy: null,
                        Offense: null,
                        setAny: function (data) {
                            if (data.BattleDuration !== undefined && data.BattleDuration !== this.getBattleDuration()) this.setBattleDuration(data.BattleDuration);
                            //Entity.HealthPoints
                            if (data.Enemy.Overall.HealthPoints !== undefined) this.Enemy.Overall.HealthPoints.setAny(data.Enemy.Overall.HealthPoints);
                            if (data.Enemy.Structure.HealthPoints !== undefined) this.Enemy.Structure.HealthPoints.setAny(data.Enemy.Structure.HealthPoints);
                            if (data.Enemy.Construction_Yard.HealthPoints !== undefined) this.Enemy.Construction_Yard.HealthPoints.setAny(data.Enemy.Construction_Yard.HealthPoints);
                            if (data.Enemy.Command_Center.HealthPoints !== undefined) this.Enemy.Command_Center.HealthPoints.setAny(data.Enemy.Command_Center.HealthPoints);
                            if (data.Enemy.Barracks.HealthPoints !== undefined) this.Enemy.Barracks.HealthPoints.setAny(data.Enemy.Barracks.HealthPoints);
                            if (data.Enemy.Factory.HealthPoints !== undefined) this.Enemy.Factory.HealthPoints.setAny(data.Enemy.Factory.HealthPoints);
                            if (data.Enemy.Airport.HealthPoints !== undefined) this.Enemy.Airport.HealthPoints.setAny(data.Enemy.Airport.HealthPoints);
                            if (data.Enemy.Defense_Facility.HealthPoints !== undefined) this.Enemy.Defense_Facility.HealthPoints.setAny(data.Enemy.Defense_Facility.HealthPoints);
                            if (data.Enemy.Defense_HQ.HealthPoints !== undefined) this.Enemy.Defense_HQ.HealthPoints.setAny(data.Enemy.Defense_HQ.HealthPoints);
                            if (data.Enemy.Support.HealthPoints !== undefined) this.Enemy.Support.HealthPoints.setAny(data.Enemy.Support.HealthPoints);
                            if (data.Enemy.Defense.HealthPoints !== undefined) this.Enemy.Defense.HealthPoints.setAny(data.Enemy.Defense.HealthPoints);
                            if (data.Enemy.DefenseArmored.HealthPoints !== undefined) this.Enemy.DefenseArmored.HealthPoints.setAny(data.Enemy.DefenseArmored.HealthPoints);
                            if (data.Enemy.DefenseNonArmored.HealthPoints !== undefined) this.Enemy.DefenseNonArmored.HealthPoints.setAny(data.Enemy.DefenseNonArmored.HealthPoints);
                            if (data.Offense.Overall.HealthPoints !== undefined) this.Offense.Overall.HealthPoints.setAny(data.Offense.Overall.HealthPoints);
                            if (data.Offense.Infantry.HealthPoints !== undefined) this.Offense.Infantry.HealthPoints.setAny(data.Offense.Infantry.HealthPoints);
                            if (data.Offense.Vehicle.HealthPoints !== undefined) this.Offense.Vehicle.HealthPoints.setAny(data.Offense.Vehicle.HealthPoints);
                            if (data.Offense.Aircraft.HealthPoints !== undefined) this.Offense.Aircraft.HealthPoints.setAny(data.Offense.Aircraft.HealthPoints);
                            if (data.Offense.Crystal.HealthPoints !== undefined) this.Offense.Crystal.HealthPoints.setAny(data.Offense.Overall.HealthPoints);
                            //Entity.Resource
                            if (data.Enemy.Overall.Resource !== undefined) this.Enemy.Overall.Resource.setAny(data.Enemy.Overall.Resource);
                            if (data.Enemy.Structure.Resource !== undefined) this.Enemy.Structure.Resource.setAny(data.Enemy.Structure.Resource);
                            if (data.Enemy.Construction_Yard.Resource !== undefined) this.Enemy.Construction_Yard.Resource.setAny(data.Enemy.Construction_Yard.Resource);
                            if (data.Enemy.Command_Center.Resource !== undefined) this.Enemy.Command_Center.Resource.setAny(data.Enemy.Command_Center.Resource);
                            if (data.Enemy.Barracks.Resource !== undefined) this.Enemy.Barracks.Resource.setAny(data.Enemy.Barracks.Resource);
                            if (data.Enemy.Factory.Resource !== undefined) this.Enemy.Factory.Resource.setAny(data.Enemy.Factory.Resource);
                            if (data.Enemy.Airport.Resource !== undefined) this.Enemy.Airport.Resource.setAny(data.Enemy.Airport.Resource);
                            if (data.Enemy.Defense_Facility.Resource !== undefined) this.Enemy.Defense_Facility.Resource.setAny(data.Enemy.Defense_Facility.Resource);
                            if (data.Enemy.Defense_HQ.Resource !== undefined) this.Enemy.Defense_HQ.Resource.setAny(data.Enemy.Defense_HQ.Resource);
                            if (data.Enemy.Support.Resource !== undefined) this.Enemy.Support.Resource.setAny(data.Enemy.Support.Resource);
                            if (data.Enemy.Defense.Resource !== undefined) this.Enemy.Defense.Resource.setAny(data.Enemy.Defense.Resource);
                            if (data.Enemy.DefenseArmored.Resource !== undefined) this.Enemy.DefenseArmored.Resource.setAny(data.Enemy.DefenseArmored.Resource);
                            if (data.Enemy.DefenseNonArmored.Resource !== undefined) this.Enemy.DefenseNonArmored.Resource.setAny(data.Enemy.DefenseNonArmored.Resource);
                            if (data.Offense.Overall.Resource !== undefined) this.Offense.Overall.Resource.setAny(data.Offense.Overall.Resource);
                            if (data.Offense.Infantry.Resource !== undefined) this.Offense.Infantry.Resource.setAny(data.Offense.Infantry.Resource);
                            if (data.Offense.Vehicle.Resource !== undefined) this.Offense.Vehicle.Resource.setAny(data.Offense.Vehicle.Resource);
                            if (data.Offense.Aircraft.Resource !== undefined) this.Offense.Aircraft.Resource.setAny(data.Offense.Aircraft.Resource);
                            if (data.Offense.Crystal.Resource !== undefined) this.Offense.Crystal.Resource.setAny(data.Offense.Overall.Resource);
                        },
                        getAny: function () {
                            return {
                                BattleDuration: this.getBattleDuration(),
                                Enemy: {
                                    Overall: {
                                        HealthPoints: this.Enemy.Overall.HealthPoints.getAny(),
                                        Resource: this.Enemy.Overall.Resource.getAny()
                                    },
                                    Structure: {
                                        HealthPoints: this.Enemy.Structure.HealthPoints.getAny(),
                                        Resource: this.Enemy.Structure.Resource.getAny()
                                    },
                                    Construction_Yard: {
                                        HealthPoints: this.Enemy.Construction_Yard.HealthPoints.getAny(),
                                        Resource: this.Enemy.Construction_Yard.Resource.getAny()
                                    },
                                    Command_Center: {
                                        HealthPoints: this.Enemy.Command_Center.HealthPoints.getAny(),
                                        Resource: this.Enemy.Command_Center.Resource.getAny()
                                    },
                                    Barracks: {
                                        HealthPoints: this.Enemy.Barracks.HealthPoints.getAny(),
                                        Resource: this.Enemy.Barracks.Resource.getAny()
                                    },
                                    Factory: {
                                        HealthPoints: this.Enemy.Factory.HealthPoints.getAny(),
                                        Resource: this.Enemy.Factory.Resource.getAny()
                                    },
                                    Airport: {
                                        HealthPoints: this.Enemy.Airport.HealthPoints.getAny(),
                                        Resource: this.Enemy.Airport.Resource.getAny()
                                    },
                                    Defense_Facility: {
                                        HealthPoints: this.Enemy.Defense_Facility.HealthPoints.getAny(),
                                        Resource: this.Enemy.Defense_Facility.Resource.getAny()
                                    },
                                    Defense_HQ: {
                                        HealthPoints: this.Enemy.Defense_HQ.HealthPoints.getAny(),
                                        Resource: this.Enemy.Defense_HQ.Resource.getAny()
                                    },
                                    Support: {
                                        HealthPoints: this.Enemy.Support.HealthPoints.getAny(),
                                        Resource: this.Enemy.Support.Resource.getAny()
                                    },
                                    Defense: {
                                        HealthPoints: this.Enemy.Defense.HealthPoints.getAny(),
                                        Resource: this.Enemy.Defense.Resource.getAny()
                                    },
                                    DefenseArmored: {
                                        HealthPoints: this.Enemy.DefenseArmored.HealthPoints.getAny(),
                                        Resource: this.Enemy.DefenseArmored.Resource.getAny()
                                    },
                                    DefenseNonArmored: {
                                        HealthPoints: this.Enemy.DefenseNonArmored.HealthPoints.getAny(),
                                        Resource: this.Enemy.DefenseNonArmored.Resource.getAny()
                                    }
                                },
                                Offense: {
                                    Overall: {
                                        HealthPoints: this.Offense.Overall.HealthPoints.getAny(),
                                        Resource: this.Offense.Overall.Resource.getAny()
                                    },
                                    Infantry: {
                                        HealthPoints: this.Offense.Infantry.HealthPoints.getAny(),
                                        Resource: this.Offense.Infantry.Resource.getAny()
                                    },
                                    Vehicle: {
                                        HealthPoints: this.Offense.Vehicle.HealthPoints.getAny(),
                                        Resource: this.Offense.Vehicle.Resource.getAny()
                                    },
                                    Aircraft: {
                                        HealthPoints: this.Offense.Aircraft.HealthPoints.getAny(),
                                        Resource: this.Offense.Aircraft.Resource.getAny()
                                    },
                                    Crystal: {
                                        HealthPoints: this.Offense.Overall.HealthPoints.getAny(),
                                        Resource: this.Offense.Overall.Resource.getAny()
                                    }
                                }
                            };
                        }
                    },
                    construct: function (data) {
                        try {
                            this.base(arguments);
                            this.Enemy = {
                                Overall: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Structure: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Construction_Yard: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Command_Center: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Barracks: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Factory: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Airport: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Defense_Facility: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Defense_HQ: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Support: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Defense: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                DefenseArmored: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                DefenseNonArmored: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                }
                            };
                            this.Offense = {
                                Overall: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Infantry: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Vehicle: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Aircraft: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                                Crystal: {
                                    HealthPoints: new TABS.STATS.Entity.HealthPoints(),
                                    Resource: new TABS.STATS.Entity.Resource()
                                },
                            };
                            if (data !== undefined) this.setAny(data);
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up STATS constructor", e);
                            console.groupEnd();
                        }
                    },
                    events: {
                        "changeBattleDuration": "qx.event.type.Data"
                    }
                });
                qx.Class.define("TABS.STATS.Entity.HealthPoints", { //				Entity HealthPoints Objekt
                    extend: qx.core.Object,
                    properties: {
                        max: {
                            check: "Number",
                            init: 0,
                            event: "changeMax"
                        },
                        start: {
                            check: "Number",
                            init: 0,
                            event: "changeStart"
                        },
                        end: {
                            check: "Number",
                            init: 0,
                            event: "changeEnd"
                        },
                        rep: {
                            check: "Number",
                            init: 0,
                            event: "changeRep"
                        },
                        maxFront: {
                            check: "Number",
                            init: 0,
                            event: "changeMaxFront"
                        },
                        startFront: {
                            check: "Number",
                            init: 0,
                            event: "changeStartFront"
                        },
                        endFront: {
                            check: "Number",
                            init: 0,
                            event: "changeEndFront"
                        }
                    },
                    members: {
                        setAny: function (data) {
                            if (data.max !== undefined && data.max !== this.getMax()) this.setMax(data.max);
                            if (data.start !== undefined && data.start !== this.getStart()) this.setStart(data.start);
                            if (data.end !== undefined && data.end !== this.getEnd()) this.setEnd(data.end);
                            if (data.rep !== undefined && data.rep !== this.getRep()) this.setRep(data.rep);
                            if (data.maxFront !== undefined && data.maxFront !== this.getMaxFront()) this.setMaxFront(data.maxFront);
                            if (data.startFront !== undefined && data.startFront !== this.getStartFront()) this.setStartFront(data.startFront);
                            if (data.endFront !== undefined && data.endFront !== this.getEndFront()) this.setEndFront(data.endFront);
                        },
                        getAny: function () {
                            return {
                                max: this.getMax(),
                                start: this.getStart(),
                                end: this.getEnd(),
                                rep: this.getRep(),
                                maxFront: this.getMaxFront(),
                                startFront: this.getStartFront(),
                                endFront: this.getEndFront()
                            };
                        }
                    },
                    construct: function (data) {
                        try {
                            this.base(arguments);
                            if (data !== undefined) this.setAny(data);
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up STATS.Entity.HealthPoints constructor", e);
                            console.groupEnd();
                        }
                    },
                    events: {
                        "changeMax": "qx.event.type.Data",
                        "changeStart": "qx.event.type.Data",
                        "changeEnd": "qx.event.type.Data",
                        "changeMaxFront": "qx.event.type.Data",
                        "changeStartFront": "qx.event.type.Data",
                        "changeEndFront": "qx.event.type.Data"
                    }
                });
                qx.Class.define("TABS.STATS.Entity.Resource", { //				Entity Ressouce Object
                    extend: qx.core.Object,
                    properties: { //ClientLib.Base.EResourceType
                        Tiberium: {
                            check: "Number",
                            init: 0,
                            event: "changeTiberium"
                        },
                        Crystal: {
                            check: "Number",
                            init: 0,
                            event: "changeCrystal"
                        },
                        Credits: {
                            check: "Number",
                            init: 0,
                            event: "changeCredits"
                        },
                        ResearchPoints: {
                            check: "Number",
                            init: 0,
                            event: "changeResearchPoints"
                        },
                        RepairChargeBase: {
                            check: "Number",
                            init: 0,
                            event: "changeRepairChargeBase"
                        },
                        RepairChargeAir: {
                            check: "Number",
                            init: 0,
                            event: "changeRepairChargeAir"
                        },
                        RepairChargeInf: {
                            check: "Number",
                            init: 0,
                            event: "changeRepairChargeInf"
                        },
                        RepairChargeVeh: {
                            check: "Number",
                            init: 0,
                            event: "changeRepairChargeVeh"
                        }
                    },
                    members: {
                        setAny: function (data) {
                            if (data[1] !== undefined && data[1] !== this.getTiberium()) this.setTiberium(data[1]);
                            if (data[2] !== undefined && data[2] !== this.getCrystal()) this.setCrystal(data[2]);
                            if (data[3] !== undefined && data[3] !== this.getCredits()) this.setCredits(data[3]);
                            if (data[6] !== undefined && data[6] !== this.getResearchPoints()) this.setResearchPoints(data[6]);
                            if (data[7] !== undefined && data[7] !== this.getRepairChargeBase()) this.setRepairChargeBase(data[7]);
                            if (data[8] !== undefined && data[8] !== this.getRepairChargeAir()) this.setRepairChargeAir(data[8]);
                            if (data[9] !== undefined && data[9] !== this.getRepairChargeInf()) this.setRepairChargeInf(data[9]);
                            if (data[10] !== undefined && data[10] !== this.getRepairChargeVeh()) this.setRepairChargeVeh(data[10]);
                        },
                        getAny: function () {
                            return {
                                1: this.getTiberium(),
                                2: this.getCrystal(),
                                3: this.getCredits(),
                                6: this.getResearchPoints(),
                                7: this.getRepairChargeBase(),
                                8: this.getRepairChargeAir(),
                                9: this.getRepairChargeInf(),
                                10: this.getRepairChargeVeh()
                            };
                        }
                    },
                    construct: function (data) {
                        try {
                            this.base(arguments);
                            if (data !== undefined) this.setAny(data);
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up STATS.Entity.Resource constructor", e);
                            console.groupEnd();
                        }
                    },
                    events: {
                        "changeTiberium": "qx.event.type.Data",
                        "changeCrystal": "qx.event.type.Data",
                        "changeCredits": "qx.event.type.Data",
                        "changeResearchPoints": "qx.event.type.Data",
                        "changeRepairCrystal": "qx.event.type.Data",
                        "changeRepairChargeBase": "qx.event.type.Data",
                        "changeRepairChargeAir": "qx.event.type.Data",
                        "changeRepairChargeInf": "qx.event.type.Data",
                        "changeRepairChargeVeh": "qx.event.type.Data"
                    }
                });
                qx.Class.define("TABS.CACHE", { // [singleton]	Cache for simulations
                    type: "singleton",
                    extend: qx.core.Object,
                    construct: function () {
                        try {
                            this.base(arguments);
                            this.cities = {};
                            this.__Table = new Uint32Array(256);
                            var tmp;
                            for (var i = 256; i--;) {
                                tmp = i;
                                for (var k = 8; k--;) {
                                    tmp = tmp & 1 ? 0xEDB88320 ^ (tmp >>> 1) : tmp >>> 1;
                                }
                                this.__Table[i] = tmp;
                            }
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up CACHE constructor", e);
                            console.groupEnd();
                        }
                    },
                    members: {
                        __Table: null,
                        cities: null,
                        lastcity: null,
                        sortByPosition: function (a, b) {
                            return a.x - b.x || a.y - b.y || a.i - b.i; // using id as third because of garrison (both units at same position)
                        },
                        _Crc32: function (data) { // data = array of bytes 0-255
                            var crc = 0xFFFFFFFF;
                            for (var i = 0, l = data.length; i < l; i++) {
                                crc = (crc >>> 8) ^ this.__Table[(crc ^ data[i]) & 0xFF];
                            }
                            return crc ^ -1;
                        },
                        calcUnitsHash: function (units, ownid) { // units = TABS.UTIL.Formation.Get()
                            if (units !== null) {
                                units.sort(this.sortByPosition);
                                var OwnCityId = ((ownid !== undefined && ownid !== null) ? ownid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCityId()),
                                    i, data = [];
                                for (i = 0; i < units.length; i++)
                                    if (units[i].enabled && units[i].h > 0) data.push(units[i].x, units[i].y, units[i].i, units[i].l);
                                return OwnCityId.toString() + this._Crc32(data);
                            }
                            return null;
                        },
                        check: function (units, cityid, ownid) { // returns { key : "", result : { ownid : 0, cityid: 0, stats : {}, formation : [], combat : {}, valid: true } }
                            var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId()),
                                OwnCityId = ((ownid !== undefined && ownid !== null) ? ownid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCityId()),
                                Hash = this.calcUnitsHash(units, OwnCityId);
                            if (CityId !== null && OwnCityId !== null && Hash !== null) {
                                this.__validate(CityId, OwnCityId, Hash);
                                return {
                                    key: Hash,
                                    result: this.get(Hash, CityId)
                                };
                            }
                            return {
                                key: null,
                                result: null
                            };
                        },
                        getAll: function (cityid) {
                            var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId());
                            if (typeof this.cities[CityId] === "undefined") this.cities[CityId] = {
                                data: {},
                                caches: {}
                            };
                            return this.cities[CityId];
                        },
                        get: function (key, cityid) { // returns { ownid : 0, cityid: 0, stats : {}, formation : [], combat : {}, valid: true }
                            var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId()),
                                caches = this.getAll(CityId).caches;
                            if (typeof caches[key] !== "undefined" && caches[key].valid) return caches[key];
                            return null;
                        },
                        getPrio: function (prios, cityid, ownid) {
                            var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId()),
                                caches = this.getAll(CityId).caches,
                                results = [];
                            for (var key in caches) {
                                if (ownid === null || ownid === undefined || (ownid !== null && ownid !== undefined && caches[key].ownid == ownid)) results.push({
                                    "key": key,
                                    result: caches[key]
                                });
                            }
                            results.sort(function (a, b) {
                                var result = 0;
                                for (var i = 0; i < prios.length; i++) {
                                    a.diff = result;
                                    b.diff = result;
                                    if (result) return result;
                                    else result = TABS.STATS.selectPrio(a.result.stats, prios[i]) - TABS.STATS.selectPrio(b.result.stats, prios[i]);
                                }
                                return result;
                            });
                            return results;
                        },
                        getPrio1: function (prios, cityid, ownid) {
                            var result = this.getPrio(prios, cityid, ownid);
                            if (result.length === 0) result = {
                                key: null,
                                result: null
                            };
                            else {
                                for (i = 0; i < result.length; i++) {
                                    if (result[i].result.valid === true) {
                                        result = result[i];
                                        break;
                                    }
                                }
                                if (Object.prototype.toString.call(result) === "[object Array]") result = result[0];
                            }
                            return result;
                        },
                        add: function (data, cityid, ownid) { // { key : "", result : { stats : {}, formation : [], combat : {} } }
                            var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId()),
                                OwnCityId = ((ownid !== undefined && ownid !== null) ? ownid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCityId()),
                                OwnCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(OwnCityId),
                                caches = this.getAll(CityId).caches;
                            caches[data.key] = data.result;
                            caches[data.key].cityid = CityId;
                            this.lastcity = CityId;
                            caches[data.key].ownid = OwnCityId;
                            if (OwnCity !== null) caches[data.key].recovery = OwnCity.get_hasRecovery();
                            caches[data.key].valid = true;
                            this.onAdd();
                        },
                        clearAll: function () {
                            this.cities = {};
                        },
                        clear: function (cityid) {
                            if (typeof this.cities[cityid] !== "undefined") return delete this.cities[cityid];
                            return false;
                        },
                        merge: function (cityid, ownid, data, caches) {
                            try {
                                var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId()),
                                    OwnCityId = ((ownid !== undefined && ownid !== null) ? ownid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCityId()),
                                    key, sim = {
                                        data: data,
                                        caches: caches
                                    };
                                for (key in sim.caches) {
                                    sim.caches[key].cityid = CityId;
                                    sim.caches[key].ownid = OwnCityId;
                                    sim.caches[key].recovery = sim.data.recovery;
                                    sim.caches[key].valid = true;
                                }
                                this.__validate(CityId, OwnCityId, sim);
                                qx.lang.Object.mergeWith(this.getAll(CityId).caches, sim.caches); // overwrite = false?
                                this.onAdd();
                            } catch (e) {
                                console.group("Tiberium Alliances Battle Simulator V2");
                                console.error("Error in TABS.CACHE.merge", e);
                                console.groupEnd();
                            }
                        },
                        getCitySimAmount: function (cityid) {
                            var CityId = ((cityid !== undefined && cityid !== null) ? cityid : ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId());
                            if (typeof this.cities[CityId] !== "undefined" && typeof this.cities[CityId]["caches"] !== "undefined") return Object.keys(this.cities[CityId].caches).length;
                            return 0;
                        },
                        __validate: function (cityid, ownid, hash) {
                            var targetCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(cityid),
                                ownCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(ownid),
                                city = (typeof hash != "object" ? this.getAll(cityid) : hash),
                                key;
                            if (targetCity !== null && targetCity.get_Version() !== -1) {
                                var version = targetCity.get_Version();
                                if (city.data.version != version) {
                                    city.data.version = version;
                                    //invalidate
                                    for (key in city.caches)
                                        city.caches[key].valid = false;
                                }
                            }
                            if (ownCity !== null && ownCity.get_Version() !== -1) {
                                var alliance = ClientLib.Data.MainData.GetInstance().get_Alliance(),
                                    recovery = ownCity.get_hasRecovery();
                                if (typeof hash != "object" && typeof city.caches[hash] !== "undefined" && city.caches[hash].recovery != recovery) city.caches[hash].valid = false;
                                if (typeof hash == "object" && city.data.recovery != recovery)
                                    for (key in city.caches)
                                        city.caches[key].valid = false;
                                if (alliance !== null) {
                                    if ((city.data.air != alliance.get_POIAirBonus() || city.data.inf != alliance.get_POIInfantryBonus() || city.data.veh != alliance.get_POIVehicleBonus()) && recovery === false) {
                                        city.data.air = alliance.get_POIAirBonus();
                                        city.data.inf = alliance.get_POIInfantryBonus();
                                        city.data.veh = alliance.get_POIVehicleBonus();
                                        if (targetCity !== null) city.data.version = targetCity.get_Version();
                                        //invalidate
                                        for (key in city.caches)
                                            city.caches[key].valid = false;
                                    }
                                }
                            }
                        },
                        onAdd: function () {
                            phe.cnc.base.Timer.getInstance().removeListener("uiTick", this.onUiTick, this);
                            phe.cnc.base.Timer.getInstance().addListener("uiTick", this.onUiTick, this);
                        },
                        onUiTick: function () {
                            phe.cnc.base.Timer.getInstance().removeListener("uiTick", this.onUiTick, this);
                            this.fireEvent("addSimulation");
                        }
                    },
                    events: {
                        "addSimulation": "qx.event.type.Event"
                    }
                });
                qx.Class.define("TABS.APISimulation", { // [singleton]	API Simulation
                    type: "singleton",
                    extend: qx.core.Object,
                    properties: {
                        data: {
                            check: "Array",
                            init: [],
                            event: "OnData"
                        },
                        formation: {
                            check: "Array",
                            init: []
                        },
                        formationHash: {
                            check: "Array",
                            init: []
                        },
                        lock: {
                            check: "Boolean",
                            init: false,
                            event: "OnLock"
                        },
                        request: {
                            check: "Boolean",
                            init: false
                        },
                        time: {
                            check: "Number",
                            init: 0,
                            event: "OnTime"
                        }
                    },
                    construct: function () {
                        try {
                            this.base(arguments);
                            this.addListener("OnSimulateBattleFinished", this._OnSimulateBattleFinished, this);
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up APISimulation constructor", e);
                            console.groupEnd();
                        }
                    },
                    members: {
                        __Timeout: null,
                        __TimerStart: null,
                        SimulateBattle: function () {
                            if (!this.getLock()) {
                                var CurrentOwnCity = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity(),
                                    CurrentCity = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity();
                                if (CurrentOwnCity !== null && CurrentCity !== null && CurrentCity.CheckInvokeBattle(CurrentOwnCity, true) == ClientLib.Data.EAttackBaseResult.OK) {
                                    clearTimeout(this.__Timeout);
                                    if (PerforceChangelist >= 448942) { // patch 16.2
                                        this.__Timeout = setTimeout(this._reset.bind(this), 3000);
                                    } else {
                                        this.__Timeout = setTimeout(this._reset.bind(this), 10000);
                                    }
                                    this.resetData();
                                    this.setLock(true);
                                    var formation = TABS.UTIL.Formation.Get(),
                                        armyUnits = [];
                                    for (var i in formation)
                                        if (formation[i].enabled && formation[i].h > 0) armyUnits.push({
                                            i: formation[i].id,
                                            x: formation[i].x,
                                            y: formation[i].y
                                        });
                                    this.setFormation(formation);
                                    ClientLib.Net.CommunicationManager.GetInstance().SendSimpleCommand("SimulateBattle", {
                                        battleSetup: {
                                            d: CurrentCity.get_Id(),
                                            a: CurrentOwnCity.get_Id(),
                                            u: armyUnits,
                                            s: 0
                                        }
                                    }, phe.cnc.Util.createEventDelegate(ClientLib.Net.CommandResult, this, function (a, b) {
                                        this.__TimerStart = Date.now();
                                        this._updateTime();
                                        this.fireDataEvent("OnSimulateBattleFinished", b);
                                    }), null);
                                }
                            } else this.setRequest(true);
                        },
                        _OnSimulateBattleFinished: function (e) {
                            if (ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity() === null) return;
                            var data = e.getData();
                            if (data === null) return;
                            var mergedformation = TABS.UTIL.Formation.Merge(this.getFormation(), data.d.a),
                                cache = TABS.CACHE.getInstance().check(mergedformation, data.d.di, data.d.ai);
                            this.setData(data.e);
                            cache.result = {
                                stats: TABS.UTIL.Stats.get_Stats(data).getAny(),
                                formation: mergedformation,
                                combat: data.d
                            };
                            TABS.CACHE.getInstance().add(cache, data.d.di, data.d.ai);
                        },
                        _updateTime: function () {
                            clearTimeout(this.__Timeout);
                            var time = 0;
                            if (PerforceChangelist >= 448942) { // patch 16.2
                                time = this.__TimerStart + 3000 - Date.now();
                            } else {
                                time = this.__TimerStart + 10000 - Date.now();
                            }
                            if (time > 0) {
                                if (time > 100) this.__Timeout = setTimeout(this._updateTime.bind(this), 100);
                                else this.__Timeout = setTimeout(this._updateTime.bind(this), time);
                            } else this.__TimerStart = time = 0;
                            this.setTime(time);
                            if (this.getTime() === 0) this._reset();
                        },
                        _reset: function () {
                            this.resetLock();
                            this.resetData();
                            this.resetTime();
                            if (this.getRequest()) {
                                this.resetRequest();
                                this.SimulateBattle();
                            }
                        }
                    },
                    events: {
                        "OnData": "qx.event.type.Data",
                        "OnLock": "qx.event.type.Data",
                        "OnSimulateBattleFinished": "qx.event.type.Data",
                        "OnTime": "qx.event.type.Data"
                    }
                });
                qx.Class.define("TABS.PreArmyUnits", { // [singleton]	Event: OnCityPreArmyUnitsChanged
                    type: "singleton",
                    extend: qx.core.Object,
                    construct: function () {
                        try {
                            this.base(arguments);
                            phe.cnc.Util.attachNetEvent(ClientLib.Data.MainData.GetInstance().get_Cities(), "CurrentOwnChange", ClientLib.Data.CurrentOwnCityChange, this, this.__CurrentOwnCityChange);
                            phe.cnc.Util.attachNetEvent(ClientLib.Data.MainData.GetInstance().get_Cities(), "CurrentChange", ClientLib.Data.CurrentCityChange, this, this.__CurrentCityChange);
                            phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance(), "ViewModeChange", ClientLib.Vis.ViewModeChange, this, this.__ViewModeChange);
                            if (ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity() !== null) this.__CurrentOwnCityChange(0, ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentOwnCity().get_Id());
                            if (ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity() !== null) this.__CurrentCityChange(0, ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity().get_Id());
                            this.patchSetEnabled();
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up PreArmyUnits constructor", e);
                            console.groupEnd();
                        }
                    },
                    events: {
                        "OnCityPreArmyUnitsChanged": "qx.event.type.Event"
                    },
                    members: {
                        CurrentCity: null,
                        CurrentOwnCity: null,
                        CityPreArmyUnits: null,
                        __Timeout: null,
                        __CurrentOwnCityChange: function (oldId, newId) {
                            if (this.CurrentOwnCity !== null && this.CurrentCity !== null && this.CityPreArmyUnits !== null) phe.cnc.Util.detachNetEvent(this.CityPreArmyUnits, "ArmyChanged", ClientLib.Data.CityPreArmyUnitsChanged, this, this.__CityPreArmyUnitsChanged);
                            var CurrentOwnCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(newId);
                            if (CurrentOwnCity !== null && CurrentOwnCity.IsOwnBase()) {
                                this.CurrentOwnCity = CurrentOwnCity;
                                if (this.CurrentCity !== null && ClientLib.Vis.VisMain.GetInstance().get_Mode() === ClientLib.Vis.Mode.CombatSetup) {
                                    this.CityPreArmyUnits = CurrentOwnCity.get_CityArmyFormationsManager().GetUpdatedFormationByTargetBaseId(this.CurrentCity.get_Id());
                                    phe.cnc.Util.attachNetEvent(this.CityPreArmyUnits, "ArmyChanged", ClientLib.Data.CityPreArmyUnitsChanged, this, this.__CityPreArmyUnitsChanged);
                                    this.__CityPreArmyUnitsChanged();
                                }
                            }
                        },
                        __CurrentCityChange: function (oldId, newId) {
                            if (this.CurrentOwnCity !== null && this.CurrentCity !== null && this.CityPreArmyUnits !== null) phe.cnc.Util.detachNetEvent(this.CityPreArmyUnits, "ArmyChanged", ClientLib.Data.CityPreArmyUnitsChanged, this, this.__CityPreArmyUnitsChanged);
                            var CurrentCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(newId);
                            if (CurrentCity !== null && !CurrentCity.IsOwnBase()) {
                                this.CurrentCity = CurrentCity;
                                if (this.CurrentOwnCity !== null && ClientLib.Vis.VisMain.GetInstance().get_Mode() === ClientLib.Vis.Mode.CombatSetup) {
                                    this.CityPreArmyUnits = this.CurrentOwnCity.get_CityArmyFormationsManager().GetUpdatedFormationByTargetBaseId(CurrentCity.get_Id());
                                    phe.cnc.Util.attachNetEvent(this.CityPreArmyUnits, "ArmyChanged", ClientLib.Data.CityPreArmyUnitsChanged, this, this.__CityPreArmyUnitsChanged);
                                    this.__CityPreArmyUnitsChanged();
                                }
                            }
                        },
                        __ViewModeChange: function (oldMode, newMode) {
                            if (newMode == ClientLib.Vis.Mode.CombatSetup && this.CurrentCity !== null && this.CurrentOwnCity !== null) {
                                this.CityPreArmyUnits = this.CurrentOwnCity.get_CityArmyFormationsManager().GetUpdatedFormationByTargetBaseId(this.CurrentCity.get_Id());
                                phe.cnc.Util.attachNetEvent(this.CityPreArmyUnits, "ArmyChanged", ClientLib.Data.CityPreArmyUnitsChanged, this, this.__CityPreArmyUnitsChanged);
                                this.__CityPreArmyUnitsChanged();
                            } else if (oldMode == ClientLib.Vis.Mode.CombatSetup && this.CityPreArmyUnits !== null) {
                                phe.cnc.Util.detachNetEvent(this.CityPreArmyUnits, "ArmyChanged", ClientLib.Data.CityPreArmyUnitsChanged, this, this.__CityPreArmyUnitsChanged);
                                this.CityPreArmyUnits = null;
                            }
                        },
                        __CityPreArmyUnitsChanged: function () {
                            clearTimeout(this.__Timeout);
                            if (this.CurrentCity.get_Version() >= 0 && ClientLib.Vis.VisMain.GetInstance().GetActiveView().get_VisAreaComplete()) {
                                this.__Timeout = setTimeout(this._onCityPreArmyUnitsChanged.bind(this), 100);
                            } else if (this.CurrentCity.get_Version() == -1 || (this.CurrentCity.get_Version() >= 0 && !ClientLib.Vis.VisMain.GetInstance().GetActiveView().get_VisAreaComplete())) {
                                this.__Timeout = setTimeout(this.__CityPreArmyUnitsChanged.bind(this), 100);
                            }
                        },
                        _onCityPreArmyUnitsChanged: function () {
                            this.fireEvent("OnCityPreArmyUnitsChanged");
                        },
                        patchSetEnabled: function () {
                            try {
                                /*  var set_Enabled = ClientLib.Data.CityPreArmyUnit.prototype.set_Enabled.toString(),
                                     args = set_Enabled.substring(set_Enabled.indexOf("(") + 1, set_Enabled.indexOf(")")),
                                     body = set_Enabled.substring(set_Enabled.indexOf("{") + 1, set_Enabled.lastIndexOf("}"));
                                 body = body + "TABS.PreArmyUnits.getInstance().__CityPreArmyUnitsChanged();"; 
                                 ClientLib.Data.CityPreArmyUnit.prototype.set_Enabled = Evil(args, body);  */
                                //MOD NO EVIL 2
                                ClientLib.Data.CityPreArmyUnit.prototype.set_Enabled_Original = ClientLib.Data.CityPreArmyUnit.prototype.set_Enabled;
                                ClientLib.Data.CityPreArmyUnit.prototype.set_Enabled = function (a) {
                                    this.set_Enabled_Original(a);
                                    TABS.PreArmyUnits.getInstance().__CityPreArmyUnitsChanged();
                                };
                            } catch (e) {
                                console.group("Tiberium Alliances Battle Simulator V2");
                                console.error("Error setting up ClientLib.Data.CityPreArmyUnit.prototype.set_Enabled", e);
                                console.groupEnd();
                            }
                        }
                    },
                    defer: function () {
                        TABS.addInit("TABS.PreArmyUnits");
                    }
                });
                qx.Class.define("TABS.PreArmyUnits.AutoSimulate", { // [singleton]	Auto simulate battle
                    type: "singleton",
                    extend: qx.core.Object,
                    construct: function () {
                        try {
                            this.base(arguments);
                            if (this.getEnabled()) TABS.PreArmyUnits.getInstance().addListener("OnCityPreArmyUnitsChanged", this.SimulateBattle, this);
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up PreArmyUnits.AutoSimulate constructor", e);
                            console.groupEnd();
                        }
                    },
                    properties: {
                        enabled: {
                            check: "Boolean",
                            init: TABS.SETTINGS.get("PreArmyUnits.AutoSimulate", true),
                            apply: "_applyEnabled",
                            event: "changeEnabled"
                        }
                    },
                    members: {
                        _applyEnabled: function (newValue) {
                            TABS.SETTINGS.set("PreArmyUnits.AutoSimulate", newValue);
                            if (newValue === true) TABS.PreArmyUnits.getInstance().addListener("OnCityPreArmyUnitsChanged", this.SimulateBattle, this);
                            else TABS.PreArmyUnits.getInstance().removeListener("OnCityPreArmyUnitsChanged", this.SimulateBattle, this);
                        },
                        SimulateBattle: function () {
                            var formation = TABS.UTIL.Formation.Get();
                            if (formation !== null && formation.length > 0) {
                                var cache = TABS.CACHE.getInstance().check(formation);
                                if (cache.result === null) TABS.APISimulation.getInstance().SimulateBattle();
                            }
                        }
                    },
                    events: {
                        "changeEnabled": "qx.event.type.Data"
                    },
                    defer: function () {
                        TABS.addInit("TABS.PreArmyUnits.AutoSimulate");
                    }
                });
                qx.Class.define("TABS.GUI.ArmySetupAttackBar", { // [singleton]	Shift and Mirror Buttons
                    type: "singleton",
                    extend: qx.core.Object,
                    include: [qx.locale.MTranslation],
                    construct: function () {
                        try {
                            this.base(arguments);
                            this._Application = qx.core.Init.getApplication();
                            this.ArmySetupAttackBar = this._Application.getArmySetupAttackBar();
                            this._armyBar = this._Application.getUIItem(ClientLib.Data.Missions.PATH.BAR_ATTACKSETUP);
                            this._playArea = this._Application.getPlayArea();
                            // just some shortcuts by Netquik 
                            this.MainOverlay = this._Application.getMainOverlay();
                            this.ArmySetupAttackBarMainChildren = this._armyBar.getChildren();
                            this.ArmySetupAttackBarChildren = this.ArmySetupAttackBar.getChildren();
                            this._playAreaChildren = this._playArea.getChildren();


                            if (PerforceChangelist >= 443425) { // 16.1 patch
                                for (var i in this.ArmySetupAttackBar) {
                                    if (typeof this.ArmySetupAttackBar[i] == "object" && this.ArmySetupAttackBar[i] != null) {
                                        if (this.ArmySetupAttackBar[i].objid == "btn_disable") {
                                            console.log(this.ArmySetupAttackBar[i].objid);
                                            var nativeSimBarDisableButton = this.ArmySetupAttackBar[i];
                                        }
                                        if (this.ArmySetupAttackBar[i].objid == "cnt_controls" || this.ArmySetupAttackBar[i].objid == "btn_toggle") {
                                            this.ArmySetupAttackBar[i].setVisibility("excluded");
                                        }
                                    }
                                }
                                for (var i in this.ArmySetupAttackBarMainChildren) {
                                    if (this.ArmySetupAttackBarMainChildren[i].$$user_decorator == "pane-armysetup-right") {
                                        console.log(this.ArmySetupAttackBarMainChildren[i].$$user_decorator)
                                        this.armySetupRight = this.ArmySetupAttackBarMainChildren[i];
                                        this.armySetupRight.removeAt(1);
                                        this.armySetupRight.addAt(nativeSimBarDisableButton, 1);
                                        break;
                                    }
                                }
                            }



                            this.ArmySetupAttackBarMainChildren[0].setMarginTop(40); // NOTE Resizing ArmySetup after topbuttons remove
                            this.ArmySetupAttackBarChildren[1].setOpacity(0.4); // NOTE  setting opacity to next setup
                            this.ArmySetupAttackBarChildren[1].setVisibility("hidden"); // NOTE  setting hidden to next setup 
                            var playerFaction = ClientLib.Data.MainData.GetInstance().get_Player().get_Faction(); // NOTE  new Left/Right Bars 
                            switch (playerFaction) {
                                case ClientLib.Base.EFactionType.GDIFaction:
                                    var leftBG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAACgCAMAAAC7f4tPAAABklBMVEUAAAD///8bfqbc3Nyhop/T09PZ2dnY2Njx8fHy8vLz8/Oen5t2d3XW1tZyc3C5ubnJycnLy8ugoZ6hoZ7X19bX19eKioiXmJTa2tqXmJXg4ODh4eHi4uLr6+ucnZmcnZqdnpr09PTR0dHS0tLV1dV0dXPj4+Pq6uqen52LjIrK09eMjIvOzs3Q0NC3t7e4uLiRko9qa2iWl5NtbmsbfqZ0dHK9vr3b29t2dnTf39/IyMifoJygoZ3CwsLo6Ojp6enDw8Pu7u7w8PCGh4OIiYewsLC0tLR1dnRnoblsbWqpqairq6irrKmsrKutrq2ur6xub22zs7OHiISHiIW4uLZub26Jioi5uri6urq7vLtvb22Ki4dvb27FxcVra2nIz9KNjoqOjouQkY5zc3HOzs7O1djPz8+Sk4+TlJCVlpNpamd0dXJubmyYmJaZmpeam5ibm5l1dnNqpbxubm2enptub2x4eXd6enh8fXuCgoGEhYKEhYOioqHt7e2io6Hv7++jo6OkpaKlpaOlpqOmp6Wnp6Um7BAdAAAAA3RSTlMAAH5Ny5jlAAACu0lEQVR4Xu3b1Y/bQBDA4Wtm1+wgM8MhMzOUmZmZmfH/rtc5K6kq9SGbac/qjnSv38NPymmccbr2oM3vtKC7nPGMdXRaaM/THuAZSZLYX9kBmrRnqwekDkyZQpyacUmyaEe+5MjcNFj0xEdGN2rcAO5p0ABxaz6/ZLQj80+DZjYcfsdoVoPJS+sDg+2Pz+cHp7VJ4X6O0awzkzf8k8npdieZTEERbDoepxRO6Ixu1Fg6EqiuaGq7o2kFJV0CgDLLYR7wzlr0jrwRSH9SeEbVlORNRgPI3a+Ozln0mP1JWfdXmcxlFzIli6YgR18cexRiNLAZmFxReEfLSIw2T05dHso36cGkxk/XGA2bUwkSDJEmPa1y0+qiTY8HCQkRDJoO6yR2W/9LtMI/Ng0VwsY9NGKQ/6a1aC1ai9Z3rSC3cFpfzJPYUB4lSOQQWmuQfxAdJwhA//MYFk37TtVxgrBZw6O9WEEoJl1BC/JHWrQWrfv2YtH9b58gfdDlXiNRR6EjUSOB9P96+14Caw8ZDZJYzG3LAnh1QnS3LWZ0lLirNT8t9mvRWrQWrQ281uH9aK1B/obVmj3dfSFINIQn6nhL8Coe7XXlfl35N0FEa9E6fBCrtdz7eg0niBw9ey6LQoejxhWkPcQwEijLgnMDQ6HFHiJ2PtFatBatRettJBr/BkaIG29gx7O75QYm9mvxLCNau/EGdm3VdTewbvac5LYb2HB+F+0hYucTrUVrzHeC3UNjBnF/a4x33cfJr1/G+TpAqws2vWm5wVALnSpwF1lO2UHMfaGR1pf/Z0DROO0P6YhNg/x15GquSUOxqhQ0jt9wqMtpU4KdG9h3Mhts0lBKZTK1xXantpCKSODQcCY710LDdSrxjMxkOwgUKbzRbbqT4+zXz3IItA0Ezj/GomcePMQKcuH9HSx6fv70T0KzcLgY6GqkAAAAAElFTkSuQmCC";
                                    var rightBG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAACgCAMAAAC7f4tPAAAAA3NCSVQICAjb4U/gAAABsFBMVEX09PTz8/Py8vLx8fHw8PDv7+/u7u7t7e3r6+vq6urp6eno6Ojj4+Pi4uLh4eHg4ODf39/d3d3c3Nzb3Nzb29va2trZ2dnY2NjY2dnY2NfX19fW1tbX19bV1dXU1dXT09PN1djS0tLJ09fR0dHJ0tfQ0NDPz8/Ozs7Pzs7Ozs3Hz9LMzMzLy8vJycnIyMjFxcXDw8PCwsK9vr27vLu6urq5uri5ubm4uLiQwNS3t7e4uLaPwNO0tLSzs7OwsLCur6yur66trayrrKmrq6iqqqmmp6Wnp6WlpqOlpaOkpaKkpKSio6Ghop+ioqGgoZ6goZ2hoZ6foJyen52en5udnpqenpucnZmcnZqam5ibm5mZmpdqpLyXmJWYmJaXmJSWl5OVlpNnoLmTlJCSk4+Rko+QkY6OjouNjoqMjYuNjYyLi4mKi4eKi4mIiYeHiISHiIWGh4OFhoOEhYOCgoF8fXt6enh4eXd3eHZ2d3V1dnN2dnR1dnR0dXJ0dXN0dHJyc3Bzc3FvcG5ub25ub2xvb21vb25ubmxubm1tbmscf6ZsbWobfqZqa2hra2lpamf///8wScmyAAAAkHRSTlP//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wADZeeHAAAACXBIWXMAAAsSAAALEgHS3X78AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAAt5JREFUaIHtm/1P00AYxytLEBnr2MFukzIrDN8ZAupAQXzF1zomnZviUnyZClMUXzOnMN8V8eVf9u7ajRoTf+D6lBy5b9Jk2ZJPms/68r08rfIbLIpE/4Ne9TIrY250h5Md8Xi8g2486bs56kJjjDU9GtV17EFQ7+3RNfTl4aimI+QNGqP9dTZBv7oUZUnYP3Fnp+OEoJ+9t79KeENusAm68AXpWt01SqXTIxyZGKRs5oSgzQ8Rvf43oiRSVbV93elMjVM2803QV2unNCaEbD2hgKIoTetPW//xQccJQU89fjmHbfTucIA3of5xmz1G0NnrTz6WMTn4yE63KAovuy01QR30rVB0rvSg+qiLonHLFu7dDnQeZcfJKkEbJMVqlQrB2zxAh0f+QhvGMkO3NvGj211o845lmD+YEIHQLEu2EH6yX2i3EHHQ0rV/aOnaP7Sgru8SIb9AhORKlpH7Ceb6RBeMENM4F0MwaOvaLoRAhEwf2acDoRfs7gohpAaJ1qGELEGipevN4DoChz67F+xEf/00CXV5KlbmMdBF1SxWyjGoHmK9/QZzA7MswwBCA5YF0zDMmmidT0zXsl8HpOuNQkvX/qGhXVfAXJ/uhnJ9PgbTQ4yLdG0HImR6uBuq8y3ClWDQ6g5WgkGXSdL1ZnAdgXN9EuxEX3gxj4HQ+YefnBkYwPX6fqW8HereWKzA3MDcMzCP0bKH+IeWrv1DS9f+oaVr/9DQrr+LNgMjEXAGlj8m4gxM0H4t1zLS9f/RQs7AFt+JOAOjq6Q54WZg9N6Ykz1Edr6NQEvX/qHFfyZYHLTArpfhnnV/w9BBD/Y6nG6gs7nSbPaMxoSozdxkRXWhC/dmLzgzMBzays1GAw10JpOZdGZgCGuhZo43ONhbHEnUQE/lD6E6muy3Ggy2ckTtQWto83mjBDM2V/Q9yIUufHWjPQtF3/h8gH1OeI+emRmAQt+6chBKyOGhIRD0H2r7n40x6THiAAAAAElFTkSuQmCC";
                                    break;
                                case ClientLib.Base.EFactionType.NODFaction:
                                    var leftBG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAACgCAMAAAC7f4tPAAABj1BMVEX///+hop/p6el0dXOXmJSTlJBqa2jY2NihoZ6XmJV2d3XX19egoZ6dnprOzs3X19aIiYeKiojQ0NDr6+vq6uqen51sbWqnp6WRko+cnZl0dHKMjIuur6yLjIro6Oh2dnTIyMh1dnRtbmupqajCwsLu7u6enpuWl5OGh4OgoZ2EhYJ0dXKHiIWHiIR6eniSk49ub2yam5hpameJioiNjoqlpqOkpaK9vr25uritrq18fXtvb22Ki4d1dnOOjou4uLZzc3Fra2mrq6irrKnPz8/t7e2lpaOQkY6mp6W7vLvOzs6CgoFubm1vb26bm5mYmJaZmpfFxcWVlpO6urrc3NzZ2dnT09PV1dXa2trg4ODz8/PW1tbJycnLy8u0tLTi4uLSvbq5ubnDw8OwsLC3t7fb29vw8PDR0dHv7+/f39+uRDqvRTzj4+Px8fGcnZrh4eGsrKv09PSioqHTwL2mGxvW19by8vJyc3Czs7Ojo6KfoJxubmyEhYPOuri4uLjS0tK9vb2en5tub254eXdub21rpm98AAAAAXRSTlMAQObYZgAAAr9JREFUeF7s0MUOwzAURNF+5DxTEIrMzPDhjRtZztqx1E2vNNuzmNZv+rf2Wl0epWgSEelxA9TkYQryEGcQLBBENfkC8kSjpO9L+8YKjatoQJQdXj5loKK1jffZvKHlvGhf3cuyEObrgOE0NT9rOQ47cuCalDP08KWFYAzPh30j30fjrtq6ptRiktwAcH3HZr47WjmOkv6nffPsbRoKozBva+oRO6NJS5OSpIWWTubee+/xxqgOqCBGQaobpUKOxIdW/udwrUgOX/jA7UGxeM8PeBQ90rWOc65DnURBuHZHoZnN+rGjS+oMJifl49tNRdZid8u7v9A+m6UTqycthWaVT5+/hLoJyi2Fbp9unpnyUvTOWqCPrig0zzZtci1K0d8ibXQ0kqBrLpFFCLQ/FpOxP/5H6FA/CZpHSSU7aKCQ/8a1uBbX4vpUTMZxjOubHhlTHkRI7iDMNZsHKMYIYR4/YqDQfv7CBEaIShGH7qGE+Ej0KEzIH9HiWlznD6PQ48tXQQfdnHZszOMpV3Js0PN6csVG9ZBDLhlG1soC92KiGFbMYK4J63r40NKvxbW4FtcOznXhNsw1m2dRrtXb3TkCoblwfgJXghfh1R3fr/FovBBxLa4LF1GuzelLRYwQs3T5ShWCLpSca6Ae4jg2oCykGxgELT1EOp+4FtfiWlxPgtD4DYwoixvY9eqwbGDSr+VdRlxncQO7sZi5Dazu2ERZ28DGvCHqIdL5xLW4Rt4Jzg4aKST7rhF33Wv0+4X0D3uAjhoJetYicq0BdKerbWS+kwhp37IWBi//z3AYaLLvruf6G9i9hftbKZo3NsNuoPENRzS/3m5xfwN7QD/cFM27nXK5MvK3qTQ66jf30fywujSA5kd+SyemIidCeMPnx3GC3tP0+/WTLQCaVd49fYZCzzx/gRLycvsVCj039/onvUF9K+HA7eQAAAAASUVORK5CYII%3D";
                                    var rightBG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAACgCAMAAAC7f4tPAAAAA3NCSVQICAjb4U/gAAABqlBMVEX////09PTz8/Py8vLx8fHw8PDv7+/u7u7t7e3r6+vq6urp6eno6Ojj4+Pi4uLh4eHg4ODf39/d3d3c3Nzb29vc29va2trZ2dnZ2NjY2NjX19fY2NfW19bW1tbX19bV1dXV1NTT09PS0tLR0dHQ0NDPz8/Ozs7Pzs7Ozs3MzMzLy8vJycnIyMjFxcXDw8PTv7zCwsLSvLm9vr29vb3Oube7vLu6urq5ubm5uri4uLi4uLa3t7e0tLSzs7OwsLCur6yur66trayrrKmrq6iqqqmnp6Wmp6WlpqOkpaKlpaOkpKOhop+ioqGgoZ2hoZ6goZ6foJyen5uen52enpudnpqcnZmcnZqam5ibm5mZmpeXmJWXmJSYmJaWl5OVlpOTlJCSk4+Rko+QkY6NjoqOjouNjYyMjYuKi4mLi4mKi4eIiYeHiIWHiISGh4OFhoOEhYOCgoF8fXt6enh4eXd3eHZ2d3V1dnN1dnR2dnR0dXN0dXJ0dHJyc3Bzc3FvcG5vb21vb25ub25ub2xtbmtubmxubm1sbWpra2lqa2hpamewRT2vRDumHBymGxsjsLVTAAAAjnRSTlMA////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////0TDHVgAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNui8sowAAALNSURBVGiB7ZvpU9NAGIeJdAaR0pQudFu01FBPiki9Kop4gddCazCt0gxqVbCieE61SL3vg//Z7KZpwxc/sHnDLLO/mcx02plnMk9z/HbepK1NxseseZm/69B9jeyOxWJ9dONJ5rcbjTFOaNGopmEPgjJ/XOjpo9GEhpA3aIyOudivrkVZkvZP3DnccvLsvf1V0huym138irSE4xqls9kxjkyMULbjRP8U0Zy/EaWQqqo9G05vepyyHd/X6+d3MSHWNhgKKIrSvvF0D50ZaTmZefJyEdvoveEAb0JD4y127ubjzxVsHXzWTncqCi+7Oz1BHWToeZkzyvdrD/spGndu497tQO9pdpysWWhipVSrUSF4hwfo8Ng6NCGrDN3Vzo/ucaH1OybRfzIhAqFZVmwh/GS/0G4h4qCla//Q0rV/aEFd37WE/AIRYpRNYvwAc322H0aITqbiCAZt3tiDEIiQ2ZMHNCD0kt1dIYTUIdEalJAVSLR0vRVcR+DQk/vBTvTXT1NQl6dSdQEDXVT1UrUSh+oh5tsvMDcw0yQECA1YFnRC9LponU9M17JfB6TrzUJL1/6hoV1XwVxfGIByfTkO00PIFbq2AxEye2QAqvMtw5Vg0OoOVoJBl0nS9VZwHYFzfQ7sRF96sYCB0IVHHxozMIDr9YNqZSfUvbFUhbmBuWdgHqNlD/EPLV37h5au/UNL1/6hoV1/F20GZkXAGVjhlIgzMEH7tVzLSNf/Rws5A1t+J+IMjK6SFoWbgdF7oyF7iOx8m4GWrv1Di/9MsDhogV2vwj3r/oahgx7sdTjbROeM8nzuYoIJUTu4yYrqQhfvzV9tzMBwaDs3Gw030fl8/lJjBoZwItTB8QYHe4sjhZromcJx5KCt/VaDwS6OqIOohdafN0swY3NF24dc6OI3N9qzUPStjwfZ56T36Lm5YSj07elDUEJOjI6CoP8Bxks+VXu6zlMAAAAASUVORK5CYII=";
                                    break;
                            }
                            // MOD NEW PATCH for moving Map (adjusted for 20.1 Patch)
                            var source = ClientLib.Vis.VisMain.GetInstance().get_CombatSetup().get_MinYPosition.toString();
                            // MOD Fix1 for 22.2 Patch
                            var CombatMinY = source.match(/return {0,1}\(\$I\.([A-Z]{6})\.([A-Z]{6})-/);
                            if (typeof $I[CombatMinY[1]] === "function") $I[CombatMinY[1]][CombatMinY[2]] = -178;


                            if (PerforceChangelist >= 472233) { // NOTE  20.1 patch
                                this.COMBATEXTENDEDSETUP = phe.cnc.Util.getConfigBoolean(ClientLib.Config.Main.CONFIG_COMBATEXTENDEDSETUP);
                                if (this.COMBATEXTENDEDSETUP === false) {
                                    ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_COMBATEXTENDEDSETUP, true);
                                    this.ArmySetupAttackBar.showSetup(true);
                                }
                                for (var i in this.ArmySetupAttackBarMainChildren) {
                                    if (this.ArmySetupAttackBarMainChildren[i].$$user_decorator == "bg-armysetup-top") {
                                        console.log('armysetup-top detected! : at  ArmySetupAttackBarChildren' + i);
                                        this._armyBar.addAt(this.ArmySetupAttackBarMainChildren[i], 3);
                                        break;
                                    }
                                }

                            }

                            // NOTE Adjusting left/right Bars
                            this.armySetupRight.resetDecorator();
                            this.armySetupRight.set({
                                decorator: new qx.ui.decoration.Decorator().set({
                                    backgroundImage: rightBG,
                                    backgroundRepeat: 'no-repeat'
                                })
                            });
                            this.armySetupRight.set({
                                paddingTop: 8,
                                marginTop: 40,
                                paddingLeft: 20,
                                paddingRight: 20,
                            });
                            this.ArmySetupAttackBarMainChildren[2].setSource(leftBG);
                            this.ArmySetupAttackBarMainChildren[2].setLayoutProperties({
                                top: 40,
                                left: 0
                            });

                            // Mirror and Shift Buttons left Side (Rows/Wave)
                            // MOD cntWaves manage
                            /* var TRwave = qx.locale.Manager.tr("tnf:army wave 1");
                            TRwave = TRwave.substring(0, TRwave.indexOf(' ')); */
                            for (i = 0; i < this.ArmySetupAttackBarMainChildren.length - 1; i++) {
                                var wavechild = this.ArmySetupAttackBarMainChildren[i]
                                findwave = wavechild._hasChildren() && wavechild.basename === "Composite" ? wavechild.getChildren()[0].$$user_value : false;
                                this.cntWaveI = (typeof (findwave) === 'string' && findwave.match(/.+\s{1}1/)) ? true : false;
                                if (this.cntWaveI) {
                                    this.cntWaveI = i;
                                    break;
                                }

                            }
                            var i, cntWave;
                            for (i = 0; i < ClientLib.Base.Util.get_ArmyMaxSlotCountY(); i++) {
                                cntWave = this.ArmySetupAttackBar.getMainContainer().getChildren()[i + this.cntWaveI];
                                cntWave._removeAll();
                                cntWave._setLayout(new qx.ui.layout.HBox());
                                cntWave._add(this.newSideButton(TABS.RES.IMG.Flip.H, this.tr("Mirrors units horizontally."), this.onClick_btnMirror, "h", i));
                                cntWave._add(new qx.ui.core.Spacer(), {
                                    flex: 1
                                });
                                cntWave._add(this.newSideButton(TABS.RES.IMG.Arrows.Left, this.tr("Shifts units one space left."), this.onClick_btnShift, "l", i));
                                cntWave._add(this.newSideButton(TABS.RES.IMG.Arrows.Right, this.tr("Shifts units one space right."), this.onClick_btnShift, "r", i));
                            }

                            // Mirror and Shift Buttons top
                            // REVIEW NewTopButtons rewrite code 
                            this.newtopbuttons = this.ArmySetupAttackBarMainChildren[3];
                            this.newtopbuttons.resetDecorator();
                            this.newtopbuttons.setPaddingTop(10);

                            this.shiftbuttonopacity = function (e) {
                                if (e.getTarget() && (e.getTarget().basename === "SoundButton" || e.getTarget().basename === "ModelButton")) {
                                    shiftbutton = (e.getTarget().getLayoutParent().getLayoutParent().getLayoutParent()) ? (e.getTarget().getLayoutParent().getLayoutParent().getLayoutParent()) : null;
                                    if (shiftbutton.getOpacity() === 0.3 && e._type === "mouseover") {
                                        shiftbutton.setOpacity(1);

                                    } else if (e._type === "mouseout") {
                                        shiftbutton.setOpacity(0.3);
                                    }
                                }
                            }
                            for (let i = 0; i < this.newtopbuttons.getChildren().length; i++) {
                                shiftbox = this.newtopbuttons.getChildren()[i];
                                shiftbox.setOpacity(0.3);
                                shiftbox.addListener("mouseover", this.shiftbuttonopacity.bind((null, event)));
                                shiftbox.addListener("mouseout", this.shiftbuttonopacity.bind((null, event)));

                                shiftbox_inside = shiftbox.getChildren()[0].getChildren()[1];
                                shiftbox_inside._removeAll();
                                shiftbox_inside.add(new qx.ui.core.Spacer());
                                //3 buttons (1 long + 2 updown)
                                shiftbox_inside.add(this.newTopButton(TABS.RES.IMG.Flip2.V, this.tr("Mirrors units vertically."), this.onClick_btnMirror, "v", i, 35, null));
                                shiftbox_inside.add(new qx.ui.core.Spacer());
                                shiftbox_inside.add(this.newTopButton(TABS.RES.IMG.Arrows2.Up, this.tr("Shifts units one space up."), this.onClick_btnShift, "u", i, 20, 20));
                                shiftbox_inside.add(this.newTopButton(TABS.RES.IMG.Arrows2.Down, this.tr("Shifts units one space down."), this.onClick_btnShift, "d", i, 20, 20));
                                shiftbox_inside.add(new qx.ui.core.Spacer());


                            }
                            if (PerforceChangelist >= 472233) { // MOD: 20.2 patch 2 RETRO
                                //var patch211body = patch211.substring(patch211.indexOf('{') + 1, patch211.lastIndexOf('}'));
                                var source = this.ArmySetupAttackBar.showSetup.toString();
                                var extendsetupF = source.match(/\;this\.([A-Za-z_]+)\(\)\;this\.show/)[1];
                                // MOD NOEVIL 3 by NetquiK
                                this.ArmySetupAttackBar[extendsetupF] = function () {
                                    return;
                                }
                                ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_COMBATEXTENDEDSETUP, this.COMBATEXTENDEDSETUP);
                                this.ArmySetupAttackBar.showSetup(false);
                            }

                            this._armyBar.setMarginTop(this._armyBar.getMarginTop() + 20);
                            // 19.5 FIX VIEW by Netquik
                            if (PerforceChangelist >= 472117) { // 19.5 patch                  
                                this._armyBar.setMarginTop(this._armyBar.getMarginTop() - 40);
                            }

                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up GUI.ArmySetupAttackBar constructor", e);
                            console.groupEnd();
                        }
                    },
                    destruct: function () {},
                    members: {
                        ArmySetupAttackBar: null,
                        newSideButton: function (icon, text, onClick, pos, sel) {
                            var btn = new qx.ui.form.ModelButton(null, icon).set({
                                toolTipText: text,
                                width: 20,
                                maxHeight: 25,
                                alignY: "middle",
                                show: "icon",
                                iconPosition: "top",
                                appearance: "button-addpoints",
                                model: [pos, sel]
                            });
                            btn.getChildControl("icon").set({
                                maxWidth: 16,
                                maxHeight: 16,
                                scale: true
                            });
                            btn.addListener("click", onClick, this);
                            return btn;
                        },

                        //NOTE NEWTOPBUTTON Function rewrite by Netquik for 19.5
                        newTopButton: function (icon, text, onClick, pos, sel, w, mw) {
                            var btn = new qx.ui.form.ModelButton(null, icon).set({
                                toolTipText: text,
                                width: w,
                                maxHeight: 20,
                                maxWidth: mw,
                                appearance: "button-friendlist-scroll",
                                padding: 0,
                                model: [pos, sel]
                            });

                            btn.addListener("click", onClick, this);

                            return btn;
                        },
                        onClick_btnMirror: function (e) {
                            var formation = TABS.UTIL.Formation.Get();
                            formation = TABS.UTIL.Formation.Mirror(formation, e.getTarget().getModel()[0], e.getTarget().getModel()[1]);
                            TABS.UTIL.Formation.Set(formation);
                        },
                        onClick_btnShift: function (e) {
                            var formation = TABS.UTIL.Formation.Get();
                            formation = TABS.UTIL.Formation.Shift(formation, e.getTarget().getModel()[0], e.getTarget().getModel()[1]);
                            TABS.UTIL.Formation.Set(formation);
                        }
                    },
                    defer: function () {
                        TABS.addInit("TABS.GUI.ArmySetupAttackBar");
                    }
                });
                qx.Class.define("TABS.GUI.MovableBox", {
                    extend: qx.ui.container.Composite,
                    include: qx.ui.core.MMovable,
                    construct: function (layout) {
                        this.base(arguments);
                        try {
                            this.setLayout(layout);
                            this._activateMoveHandle(this);
                            //resizer.setLayout(new qx.ui.layout.HBox());
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up GUI.MovableBox constructor", e);
                            console.groupEnd();
                        }
                    }
                });
                qx.Class.define("TABS.GUI.PlayArea", { // [singleton]	View Simulation, Open Stats Window
                    type: "singleton",
                    extend: qx.core.Object,
                    include: [qx.locale.MTranslation],
                    construct: function () {
                        try {
                            this.base(arguments);
                            this.PlayArea = qx.core.Init.getApplication().getPlayArea();
                            this._playAreaChildren = this.PlayArea.getChildren();
                            this.ArmySetupAttackBar = qx.core.Init.getApplication().getArmySetupAttackBar();
                            this.HUD = this.PlayArea.getHUD();
                            var WDG_COMBATSWAPVIEW = this.HUD.getUIItem(ClientLib.Data.Missions.PATH.WDG_COMBATSWAPVIEW);
                            //View Simulation
                            this.btnSimulation = new webfrontend.ui.SoundButton(null, TABS.RES.IMG.Simulate).set({
                                toolTipText: this.tr("View Simulation") + " [NUM 0]",
                                width: 44,
                                height: 44,
                                allowGrowX: false,
                                allowGrowY: false,
                                appearance: "button-baseviews",
                                marginRight: 6
                            });
                            this.btnSimulation.addListener("click", function () {
                                this.onClick_btnSimulation();
                            }, this);
                            TABS.APISimulation.getInstance().bind("time", this.btnSimulation, "label", {
                                converter: function (data) {
                                    return (data / 1000).toFixed(1);
                                }
                            });
                            TABS.APISimulation.getInstance().addListener("OnSimulateBattleFinished", function () {
                                this._updateBtnSimulation();
                            }, this);
                            TABS.APISimulation.getInstance().addListener("OnTimeChange", function () {
                                this._updateBtnSimulation();
                            }, this);
                            TABS.PreArmyUnits.getInstance().addListener("OnCityPreArmyUnitsChanged", function () {
                                this._updateBtnSimulation();
                            }, this);
                            WDG_COMBATSWAPVIEW.getLayoutParent().addAfter(this.btnSimulation, WDG_COMBATSWAPVIEW);
                            //Move Box
                            this.boxMove = new TABS.GUI.MovableBox(new qx.ui.layout.Grid()).set({
                                decorator: "pane-light-plain",
                                opacity: 0.7,
                                paddingTop: 0,
                                paddingLeft: 2,
                                paddingRight: 1,
                                paddingBottom: 3,
                                allowGrowX: false,
                                allowGrowY: false,
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Stats, this.tr("Statistic") + " [NUM 7]", this.onClick_btnStats, null, null), {
                                row: 0,
                                column: 0
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Arrows.Up, this.tr("Shifts units one space up.") + " [NUM 8]", this.onClick_btnShift, "u", null), {
                                row: 0,
                                column: 1
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.CNCTAOpt, this.tr("Show current formation with CNCTAOpt") + " [NUM 9]<br>" + this.tr("Right click: Set formation from CNCTAOpt Long Link") + "<br>" + this.tr("Remember transported units are not supported."), this.onClick_CNCTAOpt, null, null), {
                                row: 0,
                                column: 2
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Arrows.Left, this.tr("Shifts units one space left.") + " [NUM 4]", this.onClick_btnShift, "l", null), {
                                row: 1,
                                column: 0
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.DisableUnit, this.tr("Enables/Disables all units.") + " [NUM 5]", this.onClick_btnDisable, null, null), {
                                row: 1,
                                column: 1
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Arrows.Right, this.tr("Shifts units one space right.") + " [NUM 6]", this.onClick_btnShift, "r", null), {
                                row: 1,
                                column: 2
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Flip.H, this.tr("Mirrors units horizontally.") + " [NUM 1]", this.onClick_btnMirror, "h", null), {
                                row: 2,
                                column: 0
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Arrows.Down, this.tr("Shifts units one space down.") + " [NUM 2]", this.onClick_btnShift, "d", null), {
                                row: 2,
                                column: 1
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Flip.V, this.tr("Mirrors units vertically.") + " [NUM 3]", this.onClick_btnMirror, "v", null), {
                                row: 2,
                                column: 2
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Offense.Infantry, this.tr("Enables/Disables all infantry units.") + " [NUM *]", this.onClick_btnDisable, ClientLib.Data.EUnitGroup.Infantry, null), {
                                row: 3,
                                column: 0
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Offense.Vehicle, this.tr("Enables/Disables all vehicles.") + " [NUM -]", this.onClick_btnDisable, ClientLib.Data.EUnitGroup.Vehicle, null), {
                                row: 3,
                                column: 1
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Offense.Aircraft, this.tr("Enables/Disables all aircrafts.") + " [NUM +]", this.onClick_btnDisable, ClientLib.Data.EUnitGroup.Aircraft, null), {
                                row: 3,
                                column: 2
                            });
                            //DS-MOd
                            this.boxMove.add(this.newButton(TABS.RES.IMG.VictoryPop, this.tr("Skip Victory-Popup After Battle"), this.onClick_btnVictory, null, null), {
                                row: 4,
                                column: 0
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Offense.ResetFormation, this.tr("Reset Formation"), this.onClick_btnReset, null, null), {
                                row: 4,
                                column: 1
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.Offense.ResetFormLine, this.tr(""), this.onClick_btnBlank, null, null), {
                                row: 4,
                                column: 2
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.one, this.tr("Swaps lines 1 & 2."), this.onClick_btnSwap_1_2, "k", null), {
                                row: 5,
                                column: 0
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.two, this.tr("Swaps lines 2 & 3."), this.onClick_btnSwap_2_3, "z", null), {
                                row: 5,
                                column: 1
                            });
                            this.boxMove.add(this.newButton(TABS.RES.IMG.three, this.tr("Swaps lines 3 & 4."), this.onClick_btnSwap_3_4, "c", null), {
                                row: 5,
                                column: 2
                            });
                            // Move Box init by Netquik
                            this.boxMove.xy = TABS.SETTINGS.get("GUI.Window.MoveBox.position", [390, 470]);
                            this.PlayArea.getLayoutParent().getLayoutParent().add(this.boxMove, {
                                left: this.boxMove.xy[0],
                                top: this.boxMove.xy[1]
                            });
                            // Move Box save position by Netquik
                            this.boxMove.addListener("move", function () {
                                TABS.SETTINGS.set("GUI.Window.MoveBox.position", [this.boxMove.getBounds().left, this.boxMove.getBounds().top]);
                            }, this);

                            // NOTE Added listener to show movebox on prearmysetup
                            this.ArmySetupAttackBar.addListener("changeVisibility", function () {
                                if (this.ArmySetupAttackBar.isVisible()) this.boxMove.show();
                                else this.boxMove.hide();
                            }, this);
                            // SkipVictory Button init by Netquik
                            this.boxMove.getChildren()[12].setIcon(TABS.SETTINGS.get("skipVictoryPopup", false) ? TABS.RES.IMG.VictoryPop2 : TABS.RES.IMG.VictoryPop);
                            this.skip_VictoryPopup();
                            //DS-MOD-END
                            phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance(), "ViewModeChange", ClientLib.Vis.ViewModeChange, this, this._onViewChanged);
                            this._onViewChanged(ClientLib.Vis.Mode.CombatSetup, null);
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up GUI.PlayArea constructor", e);
                            console.groupEnd();
                        }
                    },
                    destruct: function () {},
                    members: {
                        PlayArea: null,
                        HUD: null,
                        btnSimulation: null,
                        btnStats: null,
                        boxMove: null,
                        onHotKeyPress: function (key) {
                            if (!phe.cnc.Util.isEventTargetInputField(key)) {
                                var formation = TABS.UTIL.Formation.Get();
                                switch (key.getNativeEvent().keyCode) {
                                    case 96:
                                        // NUM 0
                                        this.onClick_btnSimulation();
                                        break;
                                    case 97:
                                        // NUM 1
                                        formation = TABS.UTIL.Formation.Mirror(formation, "h", null);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 98:
                                        // NUM 2
                                        formation = TABS.UTIL.Formation.Shift(formation, "d", null);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 99:
                                        // NUM 3
                                        formation = TABS.UTIL.Formation.Mirror(formation, "v", null);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 100:
                                        // NUM 4
                                        formation = TABS.UTIL.Formation.Shift(formation, "l", null);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 101:
                                        // NUM 5
                                        formation = TABS.UTIL.Formation.toggle_Enabled(formation);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 102:
                                        // NUM 6
                                        formation = TABS.UTIL.Formation.Shift(formation, "r", null);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 103:
                                        // NUM 7
                                        this.onClick_btnStats();
                                        break;
                                    case 104:
                                        // NUM 8
                                        formation = TABS.UTIL.Formation.Shift(formation, "u", null);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 105:
                                        // NUM 9
                                        this.onClick_CNCTAOpt();
                                        break;
                                    case 106:
                                        // NUM *
                                        formation = TABS.UTIL.Formation.toggle_Enabled(formation, ClientLib.Data.EUnitGroup.Infantry);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 107:
                                        // NUM +
                                        formation = TABS.UTIL.Formation.toggle_Enabled(formation, ClientLib.Data.EUnitGroup.Aircraft);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 109:
                                        // NUM -
                                        formation = TABS.UTIL.Formation.toggle_Enabled(formation, ClientLib.Data.EUnitGroup.Vehicle);
                                        TABS.UTIL.Formation.Set(formation);
                                        break;
                                    case 110:
                                        // NUM ,
                                        break;
                                    case 111:
                                        // NUM /
                                        break;
                                }
                            }
                        },
                        _onViewChanged: function (oldMode, newMode) {
                            if (newMode == ClientLib.Vis.Mode.CombatSetup) {
                                this.btnSimulation.show();
                                this.boxMove.show();
                                qx.bom.Element.addListener(document, "keydown", this.onHotKeyPress, this);
                            }
                            if (oldMode == ClientLib.Vis.Mode.CombatSetup) {
                                this.btnSimulation.hide();
                                if (newMode != ClientLib.Vis.Mode.Battleground) this.boxMove.hide(); // MOD leave boxMove in Battleground for pre army setup
                                qx.bom.Element.removeListener(document, "keydown", this.onHotKeyPress, this);
                                TABS.APISimulation.getInstance().removeListener("OnSimulateBattleFinished", this.OnSimulateBattleFinished, this);
                            }
                            // MOD not open stats for replays
                            var replay = this.PlayArea.getViewMode() == ClientLib.Data.PlayerAreaViewMode.pavmCombatReplay;
                            if ((newMode == ClientLib.Vis.Mode.CombatSetup || newMode == ClientLib.Vis.Mode.Battleground) && TABS.SETTINGS.get("GUI.Window.Stats.open", true) && !replay && !TABS.GUI.Window.Stats.getInstance().isVisible()) TABS.GUI.Window.Stats.getInstance().open();
                            var city = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity();
                            var btnBack = TABS.GUI.ReportReplayOverlay.getInstance().btnBack;
                            if (city === null && replay) {
                                btnBack.hide();
                            } else btnBack.show();
                        },
                        _updateBtnSimulation: function () {
                            var formation = TABS.UTIL.Formation.Get();
                            if (formation !== null) {
                                if (TABS.UTIL.Formation.IsFormationInCache()) {
                                    this.btnSimulation.setEnabled(true);
                                    this.btnSimulation.setShow("icon");
                                } else {
                                    this.btnSimulation.setEnabled(!TABS.APISimulation.getInstance().getLock() && TABS.UTIL.Formation.Get().length > 0);
                                    if (TABS.APISimulation.getInstance().getData().length === 0 || TABS.UTIL.Formation.Get().length === 0) this.btnSimulation.setShow("icon");
                                    else if (this.btnSimulation.getShow() !== "label") {
                                        this.btnSimulation.setShow("label");
                                    }
                                }
                            } else {
                                this.btnSimulation.setEnabled(false);
                                this.btnSimulation.setShow("icon");
                            }
                        },
                        onClick_btnSimulation: function () {
                            var cache = TABS.CACHE.getInstance().check(TABS.UTIL.Formation.Get());
                            if (cache.result === null || cache.result.combat === undefined) {
                                TABS.APISimulation.getInstance().addListener("OnSimulateBattleFinished", this.OnSimulateBattleFinished, this);
                                TABS.APISimulation.getInstance().SimulateBattle();
                            } else {
                                var CurrentCityId = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity().get_Id();
                                TABS.UTIL.Battleground.StartReplay(CurrentCityId, cache.result.combat);
                            }
                        },
                        OnSimulateBattleFinished: function (data) {
                            TABS.APISimulation.getInstance().removeListener("OnSimulateBattleFinished", this.OnSimulateBattleFinished, this);
                            var CurrentCityId = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity().get_Id();
                            TABS.UTIL.Battleground.StartReplay(CurrentCityId, data.getData().d);
                        },
                        onClick_btnStats: function () {
                            if (TABS.GUI.Window.Stats.getInstance().isVisible()) {
                                TABS.SETTINGS.set("GUI.Window.Stats.open", false);
                                TABS.GUI.Window.Stats.getInstance().close();
                            } else {
                                TABS.SETTINGS.set("GUI.Window.Stats.open", true);
                                TABS.GUI.Window.Stats.getInstance().open();
                            }
                        },
                        newButton: function (icon, text, onClick, pos, sel) {
                            var btn = new qx.ui.form.ModelButton(null, icon).set({
                                toolTipText: text,
                                width: 22,
                                height: 22,
                                show: "icon",
                                iconPosition: "top",
                                appearance: "button-addpoints",
                                model: [pos, sel]
                            });
                            btn.getChildControl("icon").set({
                                maxWidth: 16,
                                maxHeight: 16,
                                scale: true
                            });
                            btn.addListener("click", onClick, this);
                            return btn;
                        },
                        onClick_btnMirror: function (e) {
                            var formation = TABS.UTIL.Formation.Get();
                            formation = TABS.UTIL.Formation.Mirror(formation, e.getTarget().getModel()[0], e.getTarget().getModel()[1]);
                            TABS.UTIL.Formation.Set(formation);
                        },
                        onClick_btnShift: function (e) {
                            var formation = TABS.UTIL.Formation.Get();
                            formation = TABS.UTIL.Formation.Shift(formation, e.getTarget().getModel()[0], e.getTarget().getModel()[1]);
                            TABS.UTIL.Formation.Set(formation);
                        },
                        onClick_btnSwap_1_2: function (e) {
                            var formation = TABS.UTIL.Formation.Get(),
                                formation = TABS.UTIL.Formation.SwapLines(formation, 1, 2);
                            TABS.UTIL.Formation.Set(formation);
                        },
                        onClick_btnSwap_2_3: function (e) {
                            var formation = TABS.UTIL.Formation.Get(),
                                formation = TABS.UTIL.Formation.SwapLines(formation, 2, 3);
                            TABS.UTIL.Formation.Set(formation);
                        },
                        onClick_btnSwap_3_4: function (e) {
                            var formation = TABS.UTIL.Formation.Get(),
                                formation = TABS.UTIL.Formation.SwapLines(formation, 3, 4);
                            TABS.UTIL.Formation.Set(formation);
                        },
                        onClick_btnDisable: function (e) {
                            var formation = TABS.UTIL.Formation.Get();
                            formation = TABS.UTIL.Formation.toggle_Enabled(formation, e.getTarget().getModel()[0]);
                            TABS.UTIL.Formation.Set(formation);
                        },
                        //DS-MOd
                        loadFormationn: function (formation) {
                            try {
                                this.layouts.restore = true;
                                //console.log("this.view = ");
                                //console.log(this.view);
                                for (var i = 0; i < formation.length; i++) {
                                    var unit = formation[i];
                                    if (i == formation.length - 1) this.layouts.restore = false;
                                    for (var j = 0; j < this.view.lastUnitList.length; j++) {
                                        if (this.view.lastUnitList[j].get_Id() === unit.id) {
                                            this.view.lastUnitList[j].MoveBattleUnit(unit.x, unit.y);
                                            if (unit.e === undefined) this.view.lastUnitList[j].set_Enabled(true);
                                            else this.view.lastUnitList[j].set_Enabled(unit.e);
                                        }
                                    }
                                }
                                //this.view.lastUnits.RefreshData(); // RefreshData() has been obfuscated ?
                            } catch (e) {
                                console.log(e);
                            }
                        },
                        view: {
                            playerCity: null,
                            playerCityDefenseBonus: null,
                            ownCity: null,
                            ownCityId: null,
                            targetCityId: null,
                            lastUnits: null,
                            lastUnitList: null
                        },
                        layouts: {
                            label: null,
                            list: null,
                            all: null,
                            current: null,
                            restore: null
                        },
                        onClick_btnReset: function (e) {
                            var Army = [];
                            try {
                                MainDatas = ClientLib.Data.MainData.GetInstance();
                                var base_city = MainDatas.get_Cities().get_CurrentOwnCity();
                                var target_city = MainDatas.get_Cities().get_CurrentCity();
                                if (target_city != null) {
                                    var target_city_id = target_city.get_Id();
                                    var units = base_city.get_CityArmyFormationsManager().GetFormationByTargetBaseId(target_city_id);
                                    this.view.lastUnitList = units.get_ArmyUnits().l;
                                    for (var i = 0; i < this.view.lastUnitList.length; i++) {
                                        var unit = this.view.lastUnitList[i];
                                        var armyUnit = {};
                                        armyUnit.x = unit.GetCityUnit().get_CoordX();
                                        armyUnit.y = unit.GetCityUnit().get_CoordY();
                                        armyUnit.id = unit.get_Id();
                                        Army.push(armyUnit);
                                    }
                                    this.loadFormationn(Army);
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        },
                        onClick_btnBlank: function (e) {
                            try {} catch (e) {
                                console.log(e);
                            }
                        },

                        //  REVIEW skipVictoryPopup button function by Netquik
                        onClick_btnVictory: function (e) {

                            var skipVictoryPopup = TABS.SETTINGS.get("skipVictoryPopup", false);
                            TABS.SETTINGS.set("skipVictoryPopup", skipVictoryPopup ? false : true);

                            e._target.setIcon(TABS.SETTINGS.get("skipVictoryPopup", false) ? TABS.RES.IMG.VictoryPop2 : TABS.RES.IMG.VictoryPop);

                            this.skip_VictoryPopup();


                        },
                        // SkipVictory function by Netquik
                        skip_VictoryPopup: function () {
                            webfrontend.gui.reports.CombatVictoryPopup.getInstance().addListener("appear", function () {
                                if (TABS.SETTINGS.get("skipVictoryPopup") === true) {
                                    webfrontend.gui.reports.CombatVictoryPopup.getInstance()._onBtnClose();
                                }
                            }, this);

                        },

                        //DS-MOD-END
                        onClick_CNCTAOpt: function (e) {
                            if (e.isRightPressed()) TABS.UTIL.Formation.Set(TABS.UTIL.CNCTAOpt.parseLink(prompt(this.tr("Enter CNCTAOpt Long Link:"))));
                            else qx.core.Init.getApplication().showExternal(TABS.UTIL.CNCTAOpt.createLink());
                        }
                    },
                    defer: function () {
                        TABS.addInit("TABS.GUI.PlayArea");
                    }
                });
                qx.Class.define("TABS.GUI.ReportReplayOverlay", { // [singleton]	Back Button
                    type: "singleton",
                    extend: qx.core.Object,
                    include: [qx.locale.MTranslation],
                    construct: function () {
                        try {
                            this.base(arguments);
                            this.qxApp = qx.core.Init.getApplication();
                            this.ReportReplayOverlay = qx.core.Init.getApplication().getReportReplayOverlay();
                            //MOD New Play Button Icon Selector
                            this._PlayAreaHUD = this.qxApp.getPlayArea().getHUD();
                            var PBIS_S = parseFloat(GameVersion) >= 22.2 ? webfrontend.gui.reports.ReportReplayOverlay.$$original.toString() : Function.prototype.toString.call(webfrontend.gui.reports.ReportReplayOverlay.constructor);
                            var PBIS_M = PBIS_S.match(/this\.[_a-zA-Z]+,this\);this.+this\.([_a-zA-Z]+)\.addListener\([a-z],this\.([_a-zA-Z]+),this\);this.+this\.[_a-zA-Z]+,this\);this\.([_a-zA-Z]+)\.addListener\([a-z]/);
                            "object" == typeof this.ReportReplayOverlay[PBIS_M[1]] && "btn_play" == this.ReportReplayOverlay[PBIS_M[1]].objid && (this.PBIS = PBIS_M[1]);
                            "object" == typeof this.ReportReplayOverlay[PBIS_M[3]] && "btn_skip" == this.ReportReplayOverlay[PBIS_M[3]].objid && (this.PBIS_SK = PBIS_M[3]);
                            PBIS_M = webfrontend.gui.reports.ReportReplayOverlay.prototype[PBIS_M[2]].toString().match(/if\(this\.([_a-zA-Z]+)\){this\.[_a-zA-Z]+\(false\).+this\.([_a-zA-Z]+)\.setValue/);
                            "boolean" == typeof this.ReportReplayOverlay[PBIS_M[1]] && (this.PBIS_S = PBIS_M[1]);
                            "object" == typeof this.ReportReplayOverlay[PBIS_M[2]] && "lbl_speed" == this.ReportReplayOverlay[PBIS_M[2]].objid && (this.PBIS_L = PBIS_M[2]);
                            //MOD New Autoscroll Button Selector
                            var ABS_S = parseFloat(GameVersion) >= 22.1 ? webfrontend.gui.PlayArea.PlayAreaHUD.$$original.toString() : Function.prototype.toString.call(webfrontend.gui.PlayArea.PlayAreaHUD.constructor);
                            var ABS_M = ABS_S.match(/COMBATAUTOSCROLL\),10\)==1;this\.([_a-zA-Z]+)=/);
                            "object" == typeof this._PlayAreaHUD[ABS_M[1]] && (this.ABS_B = ABS_M[1]);

                            this.btnBack = new qx.ui.form.Button(this.qxApp.tr("Setup")).set({
                                toolTipText: this.qxApp.tr("Back to Setup"),
                                width: 53,
                                height: 24,
                                appearance: "button-friendlist-scroll"
                            });
                            this.btnBack.addListener("click", this.onClick_btnBack, this);
                            this.ReportReplayOverlay.addListener("appear", this.onAppear_ReportReplayOverlay, this);
                            this.ReportReplayOverlay.add(this.btnBack, {
                                top: 20,
                                right: 642
                            });
                            this.btnSkip = new qx.ui.form.Button(this.qxApp.tr("Skip")).set({
                                toolTipText: this.qxApp.tr("Skip"),
                                width: 52,
                                height: 24,
                                appearance: "button-friendlist-scroll"
                            });
                            this.btnSkip.addListener("click", this.onClick_btnSkip, this);
                            this.ReportReplayOverlay.add(this.btnSkip, {
                                top: 20,
                                left: 700
                            });
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up GUI.ReportReplayOverlay constructor", e);
                            console.groupEnd();
                        }
                    },
                    destruct: function () {},
                    members: {
                        ReportReplayOverlay: null,
                        btnBack: null,
                        btnSkip: null,
                        LastSIM_R: null,
                        onClick_btnBack: function () {
                            // MOD Back Button fix
                            try {
                                qx.core.Init.getApplication().getPlayArea().setView(ClientLib.Data.PlayerAreaViewMode.pavmCombatSetupDefense, TABS.CACHE.getInstance().lastcity, 0, 0);
                                ClientLib.Vis.VisMain.GetInstance().get_CombatSetup().SetPosition(0, qx.core.Init.getApplication().getPlayArea().getHUD().getCombatSetupOffset(ClientLib.Vis.CombatSetup.CombatSetupViewMode.Defense));
                            } catch (e) {
                                console.group("Tiberium Alliances Battle Simulator V2");
                                console.error("Error onClick_btnBack", e);
                                console.groupEnd();
                            }
                        },
                        // MOD Back Button fix for replays and stats close
                        onAppear_ReportReplayOverlay: function () {
                            try {
                                if (TABS.SETTINGS.get("GUI.Window.Stats.open", true) && TABS.GUI.Window.Stats.getInstance().isVisible()) TABS.GUI.Window.Stats.getInstance().close();
                            } catch (e) {
                                console.group("Tiberium Alliances Battle Simulator V2");
                                console.error("Error onAppear_btnBack", e);
                                console.groupEnd();
                            }




                        },
                        onClick_btnSkip: function () {
                            //MOD New SKIP SIMULATION 1 by NetquiK
                            try {
                                var bA = ClientLib.Vis.VisMain.GetInstance();
                                var bG = bA.get_Battleground();
                                var pA = this.qxApp.getPlayArea();
                                if (bG.get_Simulation !== undefined && bG.get_Simulation().DoStep !== undefined) {
                                    if (!this.SkippingSim) {
                                        this.SkippingSim = true;
                                        if (bG.get_CombatComplete() == true) bG.RestartReplay();
                                        //this.TopAttackerPos = bA.get_PositionY() - 500;
                                        /* var pos1 = (this.LastSIM_R.Defense / 100) * ClientLib.Vis.VisMain.GetInstance().get_Battleground().get_ViewHeight() */
                                        var overall = (this.LastSIM_R / 100) * bG.get_ViewHeight();
                                        this.TopAttackerPos = this.LastSIM_R < 25 ? bG.get_MinYPosition() : bG.get_MinYPosition() + overall;
                                        phe.cnc.base.Timer.getInstance().addListener("uiTick", this.onTick_btnSkip, this);
                                        this.ResetAutoscroll = pA.getPlayerAutoScrollPreference();
                                        this._PlayAreaHUD[this.ABS_B].getLayoutParent().getLayoutParent().hide();
                                        this.ReportReplayOverlay.setEnabled(false);
                                        this.btnBack.setEnabled(true);
                                        ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_COMBATAUTOSCROLL, 0);
                                        ClientLib.Config.Main.GetInstance().SaveToDB();
                                        while (bG.get_Simulation().DoStep(false)) {} //LIKE 
                                        pA.autoScroll = 0
                                        bG.set_ReplaySpeed(10);
                                        //ClientLib.Vis.VisMain.GetInstance().get_Battleground().set_ReplaySpeed(10000); // AUTOCAMFAIL
                                    }
                                } else {

                                    bG.SkipToEnd();

                                }
                            } catch (e) {
                                console.log(e);
                            }



                        },
                        onTick_btnSkip: function () {
                            //MOD New SKIP SIMULATION 2 by NetquiK
                            var bA = ClientLib.Vis.VisMain.GetInstance();
                            var bG = bA.get_Battleground();
                            var pA = this.qxApp.getPlayArea();
                            if (pA.getViewMode() != ClientLib.Data.PlayerAreaViewMode.pavmCombatReplay || bG.get_LastFrameTime() == 0) {
                                phe.cnc.base.Timer.getInstance().removeListener("uiTick", this.onTick_btnSkip, this);
                                this.ReportReplayOverlay.setEnabled(true);
                                this.SkippingSim = null;
                                if (this.ResetAutoscroll) {
                                    ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_COMBATAUTOSCROLL, 1);
                                    ClientLib.Config.Main.GetInstance().SaveToDB();
                                    this.ResetAutoscroll = 0;
                                }
                                return
                            }
                            /* console.log(this.TopAttackerPos);
                            console.log(bG.get_PosY());
                            console.log(bG.get_TopAttackerPos());
                            if (this.TopAttackerPos > bG.get_TopAttackerPos() - 500) {
                                this.TopAttackerPos = bG.get_TopAttackerPos() - 500;
                            } */

                            if (bG.get_CombatComplete() == true && pA.getViewMode() == ClientLib.Data.PlayerAreaViewMode.pavmCombatReplay) {
                                bG.SkipToEnd();
                                if (this.ResetAutoscroll) {
                                    ClientLib.Config.Main.GetInstance().SetConfig(ClientLib.Config.Main.CONFIG_COMBATAUTOSCROLL, 1);
                                    ClientLib.Config.Main.GetInstance().SaveToDB();
                                    this.ResetAutoscroll = 0;
                                }
                                bA.SetPosition(0, this.TopAttackerPos);
                                qx.event.Timer.once(function () {
                                    qx.core.Init.getApplication().getPlayArea().autoScroll = 1
                                }, 500);
                                this.ReportReplayOverlay.setEnabled(true)
                                this._PlayAreaHUD[this.ABS_B].getLayoutParent().getLayoutParent().show();
                                phe.cnc.base.Timer.getInstance().removeListener("uiTick", this.onTick_btnSkip, this);
                                this.SkippingSim = null;
                            }
                        }
                    },
                    defer: function () {
                        TABS.addInit("TABS.GUI.ReportReplayOverlay");
                    }

                });
                qx.Class.define("TABS.GUI.Window.Stats", { // [singleton]	Stats Window
                    type: "singleton",
                    extend: qx.ui.window.Window,
                    construct: function () {
                        try {
                            this.base(arguments);
                            this.set({
                                layout: new qx.ui.layout.VBox(),
                                caption: "TABS: " + this.tr("Statistic"),
                                icon: TABS.RES.IMG.Stats,
                                minWidth: 175,
                                contentPadding: 4,
                                contentPaddingTop: 0,
                                contentPaddingBottom: 3,
                                allowMaximize: false,
                                showMaximize: false,
                                allowMinimize: false,
                                showMinimize: false,
                                resizable: true,
                                resizableTop: false,
                                resizableBottom: false,
                                useResizeFrame: false
                            });
                            this.moveTo(
                                TABS.SETTINGS.get("GUI.Window.Stats.position", [124, 31])[0], TABS.SETTINGS.get("GUI.Window.Stats.position", [124, 31])[1]);
                            this.addListener("move", function () {
                                TABS.SETTINGS.set("GUI.Window.Stats.position", [this.getBounds().left, this.getBounds().top]);
                            }, this);
                            this.addListener("resize", function () {
                                TABS.SETTINGS.set("GUI.Window.Stats.width", this.getWidth());
                                this.makeSimView();
                            }, this);
                            this.addListener("changeHeight", function () {
                                if (this.getHeight() !== null) this.resetHeight();
                            });
                            this.addListener("appear", this.onAppear, this);
                            this.addListener("close", this.onClose, this);
                            this.setWidth(TABS.SETTINGS.get("GUI.Window.Stats.width", 214));
                            this.getChildControl("close-button").addListener("execute", function () {
                                TABS.SETTINGS.set("GUI.Window.Stats.open", false);
                            }, this);
                            this.getChildControl("icon").set({
                                width: 20,
                                height: 20,
                                scale: true,
                                alignY: "middle"
                            });
                            this.setStatus("0 " + this.tr("simulations in cache"));
                            //Enemy Health Section//
                            this.EnemyHeader = this.makeHeader(this.tr("tnf:combat target"));
                            this.EnemyHeader.addListener("click", function () {
                                if (this.GUI.Enemy.isVisible()) {
                                    this.GUI.Enemy.exclude();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Enemy.visible", false);
                                } else {
                                    this.GUI.Enemy.show();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Enemy.visible", true);
                                }
                            }, this);
                            //Repair Section//
                            this.RepairHeader = this.makeHeader(this.tr("tnf:own repair cost").replace(":", ""));
                            this.RepairHeader.addListener("click", function () {
                                if (this.GUI.Repair.isVisible()) {
                                    this.GUI.Repair.exclude();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Repair.visible", false);
                                } else {
                                    this.GUI.Repair.show();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Repair.visible", true);
                                }
                            }, this);
                            //Loot Section//
                            this.LootHeader = this.makeHeader(this.tr("tnf:lootable resources:").replace(":", ""));
                            this.LootHeader.addListener("click", function () {
                                if (this.GUI.Loot.isVisible()) {
                                    this.GUI.Loot.exclude();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Loot.visible", false);
                                } else {
                                    this.GUI.Loot.show();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Loot.visible", true);
                                }
                            }, this);
                            this.GUI = {
                                Battle: new qx.ui.container.Composite(new qx.ui.layout.HBox(-2)).set({
                                    decorator: "pane-light-plain",
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0
                                }),
                                Enemy: new qx.ui.container.Composite(new qx.ui.layout.HBox(-2)).set({
                                    decorator: "pane-light-plain",
                                    allowGrowX: true,
                                    marginTop: -18,
                                    marginLeft: 0,
                                    marginRight: 0
                                }),
                                Repair: new qx.ui.container.Composite(new qx.ui.layout.HBox(-2)).set({
                                    decorator: "pane-light-plain",
                                    allowGrowX: true,
                                    marginTop: -18,
                                    marginLeft: 0,
                                    marginRight: 0
                                }),
                                Loot: new qx.ui.container.Composite(new qx.ui.layout.HBox(-2)).set({
                                    decorator: "pane-light-plain",
                                    allowGrowX: true,
                                    marginTop: -18,
                                    marginLeft: 0,
                                    marginRight: 0
                                }),
                                Buttons: new qx.ui.container.Composite(new qx.ui.layout.HBox(-2)).set({
                                    decorator: "pane-light-plain",
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0
                                })
                            };
                            this.LabelsVBox = {
                                Battle: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    width: 29,
                                    padding: 9,
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0
                                }),
                                Enemy: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    width: 29,
                                    padding: 9,
                                    marginTop: 10,
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0
                                }),
                                Repair: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    width: 29,
                                    padding: 9,
                                    marginTop: 10,
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0
                                }),
                                Loot: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    width: 29,
                                    padding: 9,
                                    marginTop: 10,
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0
                                }),
                                Buttons: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    width: 29,
                                    padding: 9,
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0
                                })
                            };
                            this.Label = {
                                Battle: {
                                    Preset: new TABS.GUI.Window.Stats.Atom("P", null, this.tr("Preset")),
                                    Outcome: new TABS.GUI.Window.Stats.Atom("O", null, this.tr("tnf:combat report")),
                                    Duration: new TABS.GUI.Window.Stats.Atom("D", null, this.tr("tnf:combat timer npc: %1", "")),
                                    OwnCity: new TABS.GUI.Window.Stats.Atom("B", null, this.tr("tnf:base")),
                                    Morale: new TABS.GUI.Window.Stats.Atom("M", null, this.tr("Morale"))
                                },
                                Enemy: {
                                    Overall: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:total"), TABS.RES.IMG.Enemy.All),
                                    Defense: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:defense"), TABS.RES.IMG.Enemy.Defense),
                                    Structure: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:base"), TABS.RES.IMG.Enemy.Base),
                                    Construction_Yard: new TABS.GUI.Window.Stats.Atom("CY", null, TABS.RES.getDisplayName(ClientLib.Base.ETechName.Construction_Yard, ClientLib.Base.EFactionType.GDIFaction)),
                                    Defense_Facility: new TABS.GUI.Window.Stats.Atom("DF", null, TABS.RES.getDisplayName(ClientLib.Base.ETechName.Defense_Facility, ClientLib.Base.EFactionType.GDIFaction)),
                                    Command_Center: new TABS.GUI.Window.Stats.Atom("CC", null, TABS.RES.getDisplayName(ClientLib.Base.ETechName.Command_Center, ClientLib.Base.EFactionType.GDIFaction)),
                                    Barracks: new TABS.GUI.Window.Stats.Atom("B", TABS.RES.IMG.Offense.Infantry, TABS.RES.getDisplayName(ClientLib.Base.ETechName.Barracks, ClientLib.Base.EFactionType.GDIFaction)),
                                    Factory: new TABS.GUI.Window.Stats.Atom("F", TABS.RES.IMG.Offense.Vehicle, TABS.RES.getDisplayName(ClientLib.Base.ETechName.Factory, ClientLib.Base.EFactionType.GDIFaction)),
                                    Airport: new TABS.GUI.Window.Stats.Atom("A", TABS.RES.IMG.Offense.Aircraft, TABS.RES.getDisplayName(ClientLib.Base.ETechName.Airport, ClientLib.Base.EFactionType.GDIFaction)),
                                    Support: new TABS.GUI.Window.Stats.Atom("S", null, this.tr("tnf:support"))
                                },
                                Repair: {
                                    Storage: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:offense repair time"), TABS.RES.IMG.RepairCharge.Base),
                                    Overall: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:repair points"), TABS.RES.IMG.RepairCharge.Offense),
                                    Crystal: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:crystals"), TABS.RES.IMG.Resource.Crystal),
                                    Infantry: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:infantry repair title"), TABS.RES.IMG.RepairCharge.Infantry),
                                    Vehicle: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:vehicle repair title"), TABS.RES.IMG.RepairCharge.Vehicle),
                                    Aircraft: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:aircraft repair title"), TABS.RES.IMG.RepairCharge.Aircraft)
                                },
                                Loot: {
                                    Tiberium: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:tiberium"), TABS.RES.IMG.Resource.Tiberium),
                                    Crystal: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:crystals"), TABS.RES.IMG.Resource.Crystal),
                                    Credits: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:credits"), TABS.RES.IMG.Resource.Credits),
                                    ResearchPoints: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:research points"), TABS.RES.IMG.Resource.ResearchPoints),
                                    Overall: new TABS.GUI.Window.Stats.Atom(this.tr("tnf:total") + " " + this.tr("tnf:loot"), TABS.RES.IMG.Resource.Transfer)
                                },
                                Buttons: {
                                    View: new TABS.GUI.Window.Stats.Atom(this.tr("View Simulation"), TABS.RES.IMG.Simulate).set({
                                        marginTop: 1,
                                        marginBottom: 5
                                    })
                                }
                            };
                            for (var i in this.GUI) {
                                for (var j in this.Label[i])
                                    this.LabelsVBox[i].add(this.Label[i][j]);
                                this.GUI[i].add(this.LabelsVBox[i], {
                                    flex: 0
                                });
                            }
                            //Enemy Health Section//
                            this.EnemyHeader = this.makeHeader(this.tr("tnf:combat target"));
                            this.EnemyHeader.addListener("click", function () {
                                if (this.GUI.Enemy.isVisible()) {
                                    this.GUI.Enemy.exclude();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Enemy.visible", false);
                                } else {
                                    this.GUI.Enemy.show();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Enemy.visible", true);
                                }
                            }, this);
                            //Repair Section//
                            this.RepairHeader = this.makeHeader(this.tr("tnf:own repair cost").replace(":", ""));
                            this.RepairHeader.addListener("click", function () {
                                if (this.GUI.Repair.isVisible()) {
                                    this.GUI.Repair.exclude();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Repair.visible", false);
                                } else {
                                    this.GUI.Repair.show();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Repair.visible", true);
                                }
                            }, this);
                            //Loot Section//
                            this.LootHeader = this.makeHeader(this.tr("tnf:lootable resources:").replace(":", ""));
                            this.LootHeader.addListener("click", function () {
                                if (this.GUI.Loot.isVisible()) {
                                    this.GUI.Loot.exclude();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Loot.visible", false);
                                } else {
                                    this.GUI.Loot.show();
                                    TABS.SETTINGS.set("GUI.Window.Stats.Loot.visible", true);
                                }
                            }, this);
                            this.add(this.GUI.Battle);
                            this.add(this.EnemyHeader);
                            this.add(this.GUI.Enemy);
                            this.add(this.RepairHeader);
                            this.add(this.GUI.Repair);
                            this.add(this.LootHeader);
                            this.add(this.GUI.Loot);
                            this.add(this.GUI.Buttons);
                            this.add(this.getChildControl("statusbar").set({
                                paddingBottom: 6,
                                paddingTop: 4
                            }));
                            this.getChildControl("statusbar-text").set({
                                textColor: "#BBBBBB"
                            });
                            this.getChildControl("statusbar").add(new qx.ui.core.Spacer(), {
                                flex: 1
                            });
                            var fontsize = qx.theme.manager.Font.getInstance().resolve(this.getChildControl("statusbar-text").getFont()).getSize(),
                                lblReset = new qx.ui.basic.Label(this.tr("Reset")).set({
                                    textColor: "#115274",
                                    font: new qx.bom.Font("statusbar-text").set({
                                        size: fontsize,
                                        decoration: "underline"
                                    })
                                });
                            lblReset.addListener("click", function () {
                                var CurrentCityId = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCityId();
                                if (CurrentCityId) TABS.CACHE.getInstance().clear(CurrentCityId);
                            }, this);
                            this.getChildControl("statusbar").add(lblReset);
                            if (TABS.SETTINGS.get("GUI.Window.Stats.Enemy.visible", true) === false) this.GUI.Enemy.exclude();
                            if (TABS.SETTINGS.get("GUI.Window.Stats.Repair.visible", true) === false) this.GUI.Repair.exclude();
                            if (TABS.SETTINGS.get("GUI.Window.Stats.Loot.visible", true) === false) this.GUI.Loot.exclude();
                            this.simViews = [];
                            phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance(), "ViewModeChange", ClientLib.Vis.ViewModeChange, this, this._onViewChanged);
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up TABS.GUI.Window.Stats constructor", e);
                            console.groupEnd();
                        }
                    },
                    destruct: function () {},
                    members: {
                        GUI: null,
                        LabelsVBox: null,
                        Label: null,
                        EnemyHeader: null,
                        RepairHeader: null,
                        LootHeader: null,
                        simViews: null,
                        StatsChanged: false,
                        onAppear: function () {
                            phe.cnc.base.Timer.getInstance().addListener("uiTick", this.__onTick, this);
                            TABS.CACHE.getInstance().addListener("addSimulation", this.__updateStats, this);
                            TABS.PreArmyUnits.getInstance().addListener("OnCityPreArmyUnitsChanged", this.__updateStats, this);
                            phe.cnc.Util.attachNetEvent(ClientLib.Data.MainData.GetInstance().get_Cities(), "CurrentOwnChange", ClientLib.Data.CurrentOwnCityChange, this, this.__CurrentCityChange);
                            phe.cnc.Util.attachNetEvent(ClientLib.Data.MainData.GetInstance().get_Cities(), "CurrentChange", ClientLib.Data.CurrentCityChange, this, this.__CurrentCityChange);
                            this.__updateStats();
                        },
                        onClose: function () {
                            phe.cnc.base.Timer.getInstance().removeListener("uiTick", this.__onTick, this);
                            TABS.CACHE.getInstance().removeListener("addSimulation", this.__updateStats, this);
                            TABS.PreArmyUnits.getInstance().removeListener("OnCityPreArmyUnitsChanged", this.__updateStats, this);
                            phe.cnc.Util.detachNetEvent(ClientLib.Data.MainData.GetInstance().get_Cities(), "CurrentOwnChange", ClientLib.Data.CurrentOwnCityChange, this, this.__CurrentCityChange);
                            phe.cnc.Util.detachNetEvent(ClientLib.Data.MainData.GetInstance().get_Cities(), "CurrentChange", ClientLib.Data.CurrentCityChange, this, this.__CurrentCityChange);
                            for (var i in this.simViews) {
                                this.simViews[i].resetStats();
                                this.simViews[i].__onTick();
                            }
                        },
                        __onTick: function () {
                            var CurrentCity = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity();
                            if (!ClientLib.Vis.VisMain.GetInstance().GetActiveView().get_VisAreaComplete() || CurrentCity === null || CurrentCity.get_Version() < 0) return;
                            if (this.StatsChanged) {
                                this.StatsChanged = false;
                                for (var i in this.simViews) {
                                    this.simViews[i].updateStats();
                                    this.simViews[i].__onTick();
                                }
                            } else {
                                for (var i in this.simViews) {
                                    this.simViews[i].__onTick();
                                }
                            }
                            this.setStatus(TABS.CACHE.getInstance().getCitySimAmount().toString() + " " + this.tr("simulations in cache"));
                        },
                        __updateStats: function () {
                            this.StatsChanged = true;
                        },
                        __CurrentCityChange: function (oldId, newId) {
                            if (ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(newId) === null) {
                                for (var i in this.simViews) {
                                    this.simViews[i].resetStats();
                                }
                            }
                        },
                        _onViewChanged: function (oldMode, newMode) {
                            if (newMode != ClientLib.Vis.Mode.CombatSetup && newMode != ClientLib.Vis.Mode.Battleground && newMode != ClientLib.Vis.Mode.City) this.close();
                        },
                        makeHeader: function (text) {
                            var Header = new qx.ui.container.Composite(new qx.ui.layout.Grow()).set({
                                alignX: "center",
                                alignY: "middle",
                                zIndex: 11
                            });
                            Header.add(new qx.ui.container.Composite(new qx.ui.layout.VBox(5)).set({
                                decorator: "pane-light-opaque",
                                allowGrowX: true,
                                allowGrowY: true,
                            }));
                            Header.add(new qx.ui.basic.Label(text).set({
                                paddingLeft: 9,
                                allowGrowX: true,
                                allowGrowY: true,
                                paddingBottom: 2,
                                font: "font_size_13_bold_shadow"
                            }));
                            return Header;
                        },
                        makeSimView: function () {
                            var i, num = Math.round((this.getWidth() - 30) / 75);
                            if (num > 6) num = 6;
                            if (this.simViews.length != num) {
                                for (i = 0; i < num; i++) {
                                    if (this.simViews[i] === undefined) {
                                        this.simViews[i] = new TABS.GUI.Window.Stats.SimView(i, this);
                                        this.GUI.Battle.add(this.simViews[i].GUI.Battle, {
                                            flex: 1,
                                            width: "100%"
                                        });
                                        this.GUI.Enemy.add(this.simViews[i].GUI.Enemy, {
                                            flex: 1,
                                            width: "100%"
                                        });
                                        this.GUI.Repair.add(this.simViews[i].GUI.Repair, {
                                            flex: 1,
                                            width: "100%"
                                        });
                                        this.GUI.Loot.add(this.simViews[i].GUI.Loot, {
                                            flex: 1,
                                            width: "100%"
                                        });
                                        this.GUI.Buttons.add(this.simViews[i].GUI.Buttons, {
                                            flex: 1,
                                            width: "100%"
                                        });
                                    }
                                }
                                for (i = 0; i < this.simViews.length; i++) {
                                    if (i >= num) {
                                        this.GUI.Battle.remove(this.simViews[i].GUI.Battle);
                                        this.GUI.Enemy.remove(this.simViews[i].GUI.Enemy);
                                        this.GUI.Repair.remove(this.simViews[i].GUI.Repair);
                                        this.GUI.Loot.remove(this.simViews[i].GUI.Loot);
                                        this.GUI.Buttons.remove(this.simViews[i].GUI.Buttons);
                                    }
                                }
                                while (this.simViews.length > num)
                                    this.simViews.splice(num, 1);
                                this.__updateLabels();
                                this.__updateStats();
                            }
                        },
                        __updateLabels: function () {
                            if (this.simViews.length > 0) {
                                var i, visibility;
                                //Label.Battle.Morale
                                visibility = "excluded";
                                for (i in this.simViews) {
                                    if (this.simViews[i].Label.Battle.Morale.getValue() != "100%") {
                                        visibility = "visible";
                                        break;
                                    }
                                }
                                for (i in this.simViews)
                                    this.simViews[i].Label.Battle.Morale.setVisibility(visibility);
                                this.Label.Battle.Morale.setVisibility(visibility);
                                //Label.Enemy.Defense
                                visibility = "excluded";
                                if (this.simViews[0].Stats.Enemy.Defense.HealthPoints.getMax() > 0) visibility = "visible";
                                for (i in this.simViews)
                                    this.simViews[i].Label.Enemy.Defense.setVisibility(visibility);
                                this.Label.Enemy.Defense.setVisibility(visibility);
                                //Label.Enemy.Defense_Facility
                                visibility = "excluded";
                                if (this.simViews[0].Stats.Enemy.Defense_Facility.HealthPoints.getMax() > 0) visibility = "visible";
                                for (i in this.simViews)
                                    this.simViews[i].Label.Enemy.Defense_Facility.setVisibility(visibility);
                                this.Label.Enemy.Defense_Facility.setVisibility(visibility);
                                //Label.Enemy.Command_Center
                                visibility = "excluded";
                                if (this.simViews[0].Stats.Enemy.Command_Center.HealthPoints.getMax() > 0) visibility = "visible";
                                for (i in this.simViews)
                                    this.simViews[i].Label.Enemy.Command_Center.setVisibility(visibility);
                                this.Label.Enemy.Command_Center.setVisibility(visibility);
                                //Label.Enemy.Barracks
                                visibility = "excluded";
                                if (this.simViews[0].Stats.Enemy.Barracks.HealthPoints.getMax() > 0) visibility = "visible";
                                for (i in this.simViews)
                                    this.simViews[i].Label.Enemy.Barracks.setVisibility(visibility);
                                this.Label.Enemy.Barracks.setVisibility(visibility);
                                //Label.Enemy.Factory
                                visibility = "excluded";
                                if (this.simViews[0].Stats.Enemy.Factory.HealthPoints.getMax() > 0) visibility = "visible";
                                for (i in this.simViews)
                                    this.simViews[i].Label.Enemy.Factory.setVisibility(visibility);
                                this.Label.Enemy.Factory.setVisibility(visibility);
                                //Label.Enemy.Airport
                                visibility = "excluded";
                                if (this.simViews[0].Stats.Enemy.Airport.HealthPoints.getMax() > 0) visibility = "visible";
                                for (i in this.simViews)
                                    this.simViews[i].Label.Enemy.Airport.setVisibility(visibility);
                                this.Label.Enemy.Airport.setVisibility(visibility);
                                //Label.Enemy.Support
                                visibility = "excluded";
                                if (this.simViews[0].Stats.Enemy.Support.HealthPoints.getMax() > 0) visibility = "visible";
                                for (i in this.simViews)
                                    this.simViews[i].Label.Enemy.Support.setVisibility(visibility);
                                this.Label.Enemy.Support.setVisibility(visibility);
                            }
                        }
                    }
                });
                qx.Class.define("TABS.GUI.Window.Stats.Atom", { //				Stats Window Atom
                    extend: qx.ui.basic.Atom,
                    include: [qx.locale.MTranslation],
                    construct: function (label, icon, toolTipText, toolTipIcon) {
                        try {
                            this.base(arguments, label, icon);
                            if (label === undefined) label = null;
                            if (icon === undefined) icon = null;
                            if (toolTipText === undefined) toolTipText = null;
                            if (toolTipIcon === undefined) toolTipIcon = null;
                            var _toolTipText = (toolTipText !== null ? toolTipText : (label !== null ? label : "")),
                                _toolTipIcon = (toolTipIcon !== null ? toolTipIcon : (icon !== null ? icon : "")),
                                _show = (toolTipIcon !== null || icon !== null ? "icon" : (toolTipText !== null || label !== null ? "label" : "both"));
                            this.initAlignX("center");
                            this.initAlignY("middle");
                            this.initGap(0);
                            this.initIconPosition("top");
                            this.initMinHeight(18);
                            this.initToolTipText(_toolTipText);
                            this.initToolTipIcon(_toolTipIcon);
                            this.initShow(_show);
                            this.setAlignX("center");
                            this.setAlignY("middle");
                            this.setGap(0);
                            this.setIconPosition("top");
                            this.setMinHeight(18);
                            this.setToolTipText(_toolTipText);
                            this.setToolTipIcon(_toolTipIcon);
                            this.setShow(_show);
                            this.getChildControl("icon").set({
                                width: 18,
                                height: 18,
                                scale: true,
                                alignY: "middle"
                            });
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up TABS.GUI.Window.Stats.Atom constructor", e);
                            console.groupEnd();
                        }
                    }
                });
                qx.Class.define("TABS.GUI.Window.Stats.SimView", { //				Simulation View Objekt
                    extend: qx.core.Object,
                    include: [qx.locale.MTranslation],
                    construct: function (num, window) {
                        try {
                            this.base(arguments);
                            var i, j, defaultPreset = TABS.SETTINGS.get("GUI.Window.Stats.SimView." + num, TABS.STATS.getPreset(num));
                            if (defaultPreset.Name === undefined || defaultPreset.Name !== TABS.STATS.getPreset(num).Name) defaultPreset = TABS.SETTINGS.set("GUI.Window.Stats.SimView." + num, TABS.STATS.getPreset(num)); // Reset Settings (if no Name)
                            if (defaultPreset.Description === undefined) defaultPreset = TABS.SETTINGS.set("GUI.Window.Stats.SimView." + num, TABS.STATS.getPreset(num)); // Reset Settings (if no Description)
                            this.Num = num;
                            this.Window = window;
                            this.Cache = {};
                            this.Stats = new TABS.STATS();
                            this.Name = defaultPreset.Name;
                            this.Description = defaultPreset.Description;
                            this.Prio = defaultPreset.Prio;
                            this.GUI = {
                                Battle: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    //padding : 5,
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0,
                                    decorator: "pane-light-opaque"
                                }),
                                Enemy: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    //padding : 5,
                                    allowGrowX: true,
                                    marginTop: 10,
                                    marginLeft: 0,
                                    marginRight: 0,
                                    decorator: "pane-light-opaque"
                                }),
                                Repair: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    //padding : 5,
                                    allowGrowX: true,
                                    marginTop: 10,
                                    marginLeft: 0,
                                    marginRight: 0,
                                    decorator: "pane-light-opaque"
                                }),
                                Loot: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    //padding : 5,
                                    allowGrowX: true,
                                    marginTop: 10,
                                    marginLeft: 0,
                                    marginRight: 0,
                                    decorator: "pane-light-opaque"
                                }),
                                Buttons: new qx.ui.container.Composite(new qx.ui.layout.VBox()).set({
                                    //padding : 5,
                                    allowGrowX: true,
                                    marginLeft: 0,
                                    marginRight: 0,
                                    decorator: "pane-light-opaque"
                                })
                            };
                            this.Label = {
                                Battle: {
                                    Preset: new qx.ui.basic.Label(this.tr(this.Name)).set({
                                        alignX: "center",
                                        alignY: "middle",
                                        minHeight: 18,
                                        toolTipText: this.tr(this.Description)
                                    }),
                                    Outcome: new qx.ui.basic.Atom("-", null).set({
                                        alignX: "center",
                                        alignY: "middle",
                                        gap: 0,
                                        iconPosition: "top",
                                        minHeight: 18,
                                        show: "label"
                                    }),
                                    Duration: new qx.ui.basic.Label("-:--").set({
                                        alignX: "center",
                                        alignY: "middle",
                                        minHeight: 18
                                    }),
                                    OwnCity: new qx.ui.basic.Label("-").set({
                                        alignX: "center",
                                        alignY: "middle",
                                        minHeight: 18
                                    }),
                                    Morale: new qx.ui.basic.Label("-").set({
                                        alignX: "center",
                                        alignY: "middle",
                                        minHeight: 18
                                    })
                                },
                                Enemy: {
                                    Overall: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Defense: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Structure: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Construction_Yard: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Defense_Facility: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Command_Center: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Barracks: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Factory: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Airport: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    }),
                                    Support: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Enemy",
                                        subType: "HealthPointsAbs"
                                    })
                                },
                                Repair: {
                                    Storage: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Repair",
                                        subType: "RepairStorage"
                                    }),
                                    Overall: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Repair",
                                        subType: "RepairCharge"
                                    }),
                                    Crystal: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Repair",
                                        subType: "Resource"
                                    }),
                                    Infantry: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Repair",
                                        subType: "RepairChargeInf"
                                    }),
                                    Vehicle: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Repair",
                                        subType: "RepairChargeVeh"
                                    }),
                                    Aircraft: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Repair",
                                        subType: "RepairChargeAir"
                                    })
                                },
                                Loot: {
                                    Tiberium: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Loot",
                                        subType: "Tiberium"
                                    }),
                                    Crystal: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Loot",
                                        subType: "Crystal"
                                    }),
                                    Credits: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Loot",
                                        subType: "Credits"
                                    }),
                                    ResearchPoints: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Loot",
                                        subType: "ResearchPoints"
                                    }),
                                    Overall: new TABS.GUI.Window.Stats.SimView.Label("-").set({
                                        type: "Loot",
                                        subType: "Resource"
                                    })
                                },
                                Buttons: {
                                    View: new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
                                        allowGrowX: true,
                                        marginLeft: 0,
                                        marginRight: 0
                                    })
                                }
                            };
                            this.Label.Battle.Outcome.getChildControl("icon").set({
                                width: 18,
                                height: 18,
                                scale: true,
                                alignY: "middle"
                            });
                            this.Label.Repair.Overall.getContentElement().setStyle("text-shadow", "0 0 3pt");
                            for (i in this.GUI) {
                                for (j in this.Label[i]) {
                                    this.GUI[i].add(this.Label[i][j], {
                                        flex: 1,
                                        right: 0
                                    });
                                }
                                this.GUI[i].addListener("dblclick", this.loadFormation, this);
                            }
                            this.Stats.addListener("changeBattleDuration", this.__updateBattleDuration.bind(this, this.Label.Battle.Duration));
                            for (i in this.Stats.Enemy) {
                                if (this.Label.Enemy.hasOwnProperty(i)) {
                                    if (this.Stats.Enemy[i].hasOwnProperty("HealthPoints")) {
                                        this.Stats.Enemy[i].HealthPoints.bind("max", this.Label.Enemy[i].HealthPoints, "max");
                                        this.Stats.Enemy[i].HealthPoints.bind("start", this.Label.Enemy[i].HealthPoints, "start");
                                        this.Stats.Enemy[i].HealthPoints.bind("end", this.Label.Enemy[i].HealthPoints, "end");
                                        if (i == "Overall") {
                                            for (j in this.Label.Loot) {
                                                this.Stats.Enemy[i].HealthPoints.bind("max", this.Label.Loot[j].HealthPoints, "max");
                                                this.Stats.Enemy[i].HealthPoints.bind("start", this.Label.Loot[j].HealthPoints, "start");
                                                this.Stats.Enemy[i].HealthPoints.bind("end", this.Label.Loot[j].HealthPoints, "end");
                                            }
                                        }
                                    }
                                    if (this.Stats.Enemy[i].hasOwnProperty("Resource")) {
                                        this.Stats.Enemy[i].Resource.bind("Tiberium", this.Label.Enemy[i].Resource, "Tiberium");
                                        this.Stats.Enemy[i].Resource.bind("Crystal", this.Label.Enemy[i].Resource, "Crystal");
                                        this.Stats.Enemy[i].Resource.bind("Credits", this.Label.Enemy[i].Resource, "Credits");
                                        this.Stats.Enemy[i].Resource.bind("ResearchPoints", this.Label.Enemy[i].Resource, "ResearchPoints");
                                        this.Stats.Enemy[i].Resource.bind("RepairChargeBase", this.Label.Enemy[i].Resource, "RepairChargeBase");
                                        this.Stats.Enemy[i].Resource.bind("RepairChargeAir", this.Label.Enemy[i].Resource, "RepairChargeAir");
                                        this.Stats.Enemy[i].Resource.bind("RepairChargeInf", this.Label.Enemy[i].Resource, "RepairChargeInf");
                                        this.Stats.Enemy[i].Resource.bind("RepairChargeVeh", this.Label.Enemy[i].Resource, "RepairChargeVeh");
                                        if (i == "Overall") {
                                            for (j in this.Label.Loot) {
                                                this.Stats.Enemy[i].Resource.bind("Tiberium", this.Label.Loot[j].Resource, "Tiberium");
                                                this.Stats.Enemy[i].Resource.bind("Crystal", this.Label.Loot[j].Resource, "Crystal");
                                                this.Stats.Enemy[i].Resource.bind("Credits", this.Label.Loot[j].Resource, "Credits");
                                                this.Stats.Enemy[i].Resource.bind("ResearchPoints", this.Label.Loot[j].Resource, "ResearchPoints");
                                                this.Stats.Enemy[i].Resource.bind("RepairChargeBase", this.Label.Loot[j].Resource, "RepairChargeBase");
                                                this.Stats.Enemy[i].Resource.bind("RepairChargeAir", this.Label.Loot[j].Resource, "RepairChargeAir");
                                                this.Stats.Enemy[i].Resource.bind("RepairChargeInf", this.Label.Loot[j].Resource, "RepairChargeInf");
                                                this.Stats.Enemy[i].Resource.bind("RepairChargeVeh", this.Label.Loot[j].Resource, "RepairChargeVeh");
                                            }
                                        }
                                    }
                                }
                            }
                            for (i in this.Stats.Offense) {
                                if (this.Label.Repair.hasOwnProperty(i)) {
                                    if (this.Stats.Offense[i].hasOwnProperty("HealthPoints")) {
                                        this.Stats.Offense[i].HealthPoints.bind("max", this.Label.Repair[i].HealthPoints, "max");
                                        this.Stats.Offense[i].HealthPoints.bind("start", this.Label.Repair[i].HealthPoints, "start");
                                        this.Stats.Offense[i].HealthPoints.bind("end", this.Label.Repair[i].HealthPoints, "end");
                                    }
                                    if (this.Stats.Offense[i].hasOwnProperty("Resource")) {
                                        this.Stats.Offense[i].Resource.bind("Tiberium", this.Label.Repair[i].Resource, "Tiberium");
                                        this.Stats.Offense[i].Resource.bind("Crystal", this.Label.Repair[i].Resource, "Crystal");
                                        this.Stats.Offense[i].Resource.bind("Credits", this.Label.Repair[i].Resource, "Credits");
                                        this.Stats.Offense[i].Resource.bind("ResearchPoints", this.Label.Repair[i].Resource, "ResearchPoints");
                                        this.Stats.Offense[i].Resource.bind("RepairChargeBase", this.Label.Repair[i].Resource, "RepairChargeBase");
                                        this.Stats.Offense[i].Resource.bind("RepairChargeAir", this.Label.Repair[i].Resource, "RepairChargeAir");
                                        this.Stats.Offense[i].Resource.bind("RepairChargeInf", this.Label.Repair[i].Resource, "RepairChargeInf");
                                        this.Stats.Offense[i].Resource.bind("RepairChargeVeh", this.Label.Repair[i].Resource, "RepairChargeVeh");
                                        if (i == "Crystal") {
                                            for (j in this.Label.Repair) {
                                                this.Stats.Offense[i].Resource.bind("Tiberium", this.Label.Repair[j].Resource, "Tiberium");
                                                this.Stats.Offense[i].Resource.bind("Crystal", this.Label.Repair[j].Resource, "Crystal");
                                                this.Stats.Offense[i].Resource.bind("Credits", this.Label.Repair[j].Resource, "Credits");
                                                this.Stats.Offense[i].Resource.bind("ResearchPoints", this.Label.Repair[j].Resource, "ResearchPoints");
                                                this.Stats.Offense[i].Resource.bind("RepairChargeBase", this.Label.Repair[j].Resource, "RepairChargeBase");
                                                this.Stats.Offense[i].Resource.bind("RepairChargeAir", this.Label.Repair[j].Resource, "RepairChargeAir");
                                                this.Stats.Offense[i].Resource.bind("RepairChargeInf", this.Label.Repair[j].Resource, "RepairChargeInf");
                                                this.Stats.Offense[i].Resource.bind("RepairChargeVeh", this.Label.Repair[j].Resource, "RepairChargeVeh");
                                            }
                                        }
                                    }
                                }
                            }
                            var ButtonAPISim = new qx.ui.form.ModelButton(null, TABS.RES.IMG.Simulate).set({
                                maxHeight: 22,
                                minWidth: 22,
                                toolTipText: this.tr("tnf:refresh"),
                                show: "icon",
                                iconPosition: "top",
                                appearance: "button-addpoints"
                            });
                            ButtonAPISim.getChildControl("icon").set({
                                maxWidth: 16,
                                maxHeight: 16,
                                scale: true
                            });
                            ButtonAPISim.addListener("click", function () {
                                this.loadFormation();
                                TABS.APISimulation.getInstance().SimulateBattle();
                            }, this);
                            this.Label.Buttons.View.add(ButtonAPISim);
                            var ButtonPlay = new qx.ui.form.ModelButton(null, TABS.RES.IMG.Arrows.Right).set({
                                maxHeight: 22,
                                minWidth: 22,
                                toolTipText: this.tr("View Simulation"),
                                show: "icon",
                                iconPosition: "top",
                                appearance: "button-addpoints"
                            });
                            ButtonPlay.getChildControl("icon").set({
                                maxWidth: 16,
                                maxHeight: 16,
                                scale: true
                            });
                            ButtonPlay.addListener("click", this.playReplay, this);
                            this.Label.Buttons.View.add(ButtonPlay);
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up GUI.Window.Stats.SimView constructor", e);
                            console.groupEnd();
                        }
                    },
                    destruct: function () {},
                    members: {
                        Num: null,
                        Window: null,
                        GUI: null,
                        Label: null,
                        Cache: null,
                        Stats: null,
                        StatsChanged: false,
                        Prio: null,
                        Name: null,
                        Description: null,
                        updateStats: function () {
                            var i, cache = null,
                                CurrentCity = ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity();
                            if (CurrentCity !== null && CurrentCity.get_Version() !== -1 && ClientLib.Vis.VisMain.GetInstance().GetActiveView().get_VisAreaComplete()) {
                                if (this.Prio.length === 0) cache = TABS.CACHE.getInstance().check(TABS.UTIL.Formation.Get());
                                else cache = TABS.CACHE.getInstance().getPrio1(this.Prio);
                            }
                            if (cache !== null && cache.result !== null) {
                                this.Cache = cache;
                                this.Stats.setAny(cache.result.stats);
                                this.StatsChanged = true;
                                this.__updateBattleOutcome();
                                this.__updateBattleOwnCity();
                                this.__updateBattleMoral();
                                this.Window.__updateLabels();
                            }
                            if (typeof this.Cache["key"] !== "undefined" && typeof this.Cache["result"] !== "undefined" && typeof this.Cache.result["ownid"] !== "undefined") {
                                if (CurrentCity !== null && CurrentCity.get_Version() !== -1 && ClientLib.Vis.VisMain.GetInstance().GetActiveView().get_VisAreaComplete() && this.Cache.key === TABS.CACHE.getInstance().calcUnitsHash(TABS.UTIL.Formation.Get(), this.Cache.result.ownid)) {
                                    for (i in this.GUI) {
                                        this.GUI[i].setDecorator("pane-light-opaque");
                                        this.GUI[i].setOpacity(1);
                                    }
                                } else {
                                    for (i in this.GUI) {
                                        this.GUI[i].setDecorator("pane-light-plain");
                                        this.GUI[i].setOpacity(0.7);
                                    }
                                }
                            }
                        },
                        resetStats: function () {
                            this.Cache = {};
                            this.Stats.setAny((new TABS.STATS()).getAny());
                            this.StatsChanged = true;
                            this.__updateBattleOutcome();
                            this.__updateBattleOwnCity();
                            this.__updateBattleMoral();
                            this.Window.__updateLabels();
                            for (var i in this.GUI) {
                                this.GUI[i].setDecorator("pane-light-opaque");
                                this.GUI[i].setOpacity(1);
                            }
                        },
                        loadFormation: function () {
                            if (typeof this.Cache["result"] !== "undefined" && typeof this.Cache.result["formation"] !== "undefined" && typeof this.Cache.result["ownid"] !== "undefined") {
                                ClientLib.Data.MainData.GetInstance().get_Cities().set_CurrentOwnCityId(this.Cache.result.ownid);
                                TABS.UTIL.Formation.Set(this.Cache.result.formation);
                            }
                        },
                        playReplay: function () {
                            TABS.UTIL.Battleground.StartReplay(this.Cache.result.cityid, this.Cache.result.combat);
                        },
                        __updateBattleOutcome: function () {
                            if (Object.getOwnPropertyNames(this.Cache).length === 0) {
                                this.Label.Battle.Outcome.setShow("label");
                                this.Label.Battle.Outcome.resetIcon();
                                this.Label.Battle.Outcome.resetToolTipIcon();
                                this.Label.Battle.Outcome.resetToolTipText();
                            } else if (this.Label.Repair.Overall.HealthPoints.getEnd() <= 0) {
                                this.Label.Battle.Outcome.setIcon(TABS.RES.IMG.Outcome.total_defeat);
                                this.Label.Battle.Outcome.setToolTipIcon(TABS.RES.IMG.Outcome.total_defeat);
                                this.Label.Battle.Outcome.setToolTipText(this.tr("tnf:total defeat"));
                                this.Label.Battle.Outcome.setShow("icon");
                            } else if (this.Label.Enemy.Overall.HealthPoints.getEnd() <= 0) {
                                this.Label.Battle.Outcome.setIcon(TABS.RES.IMG.Outcome.total_victory);
                                this.Label.Battle.Outcome.setToolTipIcon(TABS.RES.IMG.Outcome.total_victory);
                                this.Label.Battle.Outcome.setToolTipText(this.tr("tnf:total victory"));
                                this.Label.Battle.Outcome.setShow("icon");
                            } else {
                                this.Label.Battle.Outcome.setIcon(TABS.RES.IMG.Outcome.victory);
                                this.Label.Battle.Outcome.setToolTipIcon(TABS.RES.IMG.Outcome.victory);
                                this.Label.Battle.Outcome.setToolTipText(this.tr("tnf:victory"));
                                this.Label.Battle.Outcome.setShow("icon");
                            }
                        },
                        __updateBattleDuration: function (label, e) {
                            label.setValue(e.getData() > 0 ? phe.cnc.Util.getTimespanString(e.getData() / 1000) : "-:--");
                        },
                        __updateBattleOwnCity: function () {
                            if (typeof this.Cache["result"] !== "undefined" && typeof this.Cache.result["ownid"] !== "undefined") {
                                var ownCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(this.Cache.result.ownid);
                                if (ownCity !== null) this.Label.Battle.OwnCity.setValue(ownCity.get_Name());
                                else this.Label.Battle.OwnCity.resetValue();
                            } else this.Label.Battle.OwnCity.resetValue();
                        },
                        __updateBattleMoral: function () {
                            if (typeof this.Cache["result"] !== "undefined" && typeof this.Cache.result["cityid"] !== "undefined" && typeof this.Cache.result["ownid"] !== "undefined") {
                                var CurrentCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(this.Cache.result.cityid),
                                    OwnCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(this.Cache.result.ownid);
                                if (CurrentCity !== null && OwnCity !== null) {
                                    var MoralSignType = ClientLib.Base.Util.GetMoralSignType(OwnCity.get_LvlOffense(), CurrentCity.get_LvlBase()),
                                        moral = 100;
                                    if (ClientLib.Data.MainData.GetInstance().get_Server().get_CombatUseMoral() && CurrentCity.IsNPC() && CurrentCity.get_Id() != ClientLib.Data.MainData.GetInstance().get_EndGame().GetCenter().get_CombatId() && (MoralSignType.k == 1 || MoralSignType.k == 2)) {
                                        moral = "~" + (moral - MoralSignType.v) + "%";
                                        if (MoralSignType.k == 1) {
                                            this.Label.Battle.Morale.setTextColor(webfrontend.theme.Color.colors["res-orange"]);
                                            this.Label.Battle.Morale.setToolTipText(this.tr("tnf:region moral warning %1", MoralSignType.v));
                                            this.Label.Battle.Morale.setToolTipIcon("resource/webfrontend/ui/common/icon_moral_alert_orange.png");
                                        } else if (MoralSignType.k == 2) {
                                            this.Label.Battle.Morale.setTextColor(webfrontend.theme.Color.colors["res-red"]);
                                            this.Label.Battle.Morale.setToolTipText(this.tr("tnf:region moral error %1", MoralSignType.v));
                                            this.Label.Battle.Morale.setToolTipIcon("resource/webfrontend/ui/common/icon_moral_alert_red.png");
                                        }
                                    } else {
                                        moral = moral + "%";
                                        this.Label.Battle.Morale.resetTextColor();
                                        this.Label.Battle.Morale.resetToolTipText();
                                        this.Label.Battle.Morale.resetToolTipIcon();
                                    }
                                    this.Label.Battle.Morale.setValue(moral);
                                } else {
                                    this.Label.Battle.Morale.setValue("-");
                                    this.Label.Battle.Morale.resetTextColor();
                                    this.Label.Battle.Morale.resetToolTipText();
                                    this.Label.Battle.Morale.resetToolTipIcon();
                                }
                            }
                        },
                        __onTick: function () {
                            if (typeof this.Cache["result"] !== "undefined" && typeof this.Cache.result["ownid"] !== "undefined") {
                                var ownCity = ClientLib.Data.MainData.GetInstance().get_Cities().GetCity(this.Cache.result.ownid);
                                if (ownCity !== null) {
                                    var RepairCharge = Math.min(
                                        ownCity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeInf), ownCity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeVeh), ownCity.GetResourceCount(ClientLib.Base.EResourceType.RepairChargeAir));
                                    this.Label.Repair.Storage.setValue(phe.cnc.Util.getTimespanString(ClientLib.Data.MainData.GetInstance().get_Time().GetTimeSpan(RepairCharge)));
                                } else this.Label.Repair.Storage.resetValue();
                            } else this.Label.Repair.Storage.resetValue();
                            if (this.StatsChanged) {
                                this.StatsChanged = false;
                                for (var i in this.Label.Enemy) {
                                    this.Label.Enemy[i].__update();
                                    //MOD Save Last Result for Simulation
                                    if (i == "Overall" && (v = this.Label.Enemy[i].getValue())) {
                                        TABS.GUI.ReportReplayOverlay.getInstance().LastSIM_R = parseFloat(v);
                                    }
                                }
                                for (i in this.Label.Repair) {
                                    this.Label.Repair[i].__update();
                                }
                                for (i in this.Label.Loot) {
                                    this.Label.Loot[i].__update();
                                }
                            }
                        }
                    }
                });
                qx.Class.define("TABS.GUI.Window.Stats.SimView.Label", { //				Simulation View Label
                    extend: qx.ui.basic.Label,
                    include: [qx.locale.MTranslation],
                    construct: function (label) {
                        try {
                            this.base(arguments, label);
                            this.initAlignX("right");
                            this.initAlignY("middle");
                            this.initMinHeight(18);
                            this.setAlignX("right");
                            this.setAlignY("middle");
                            this.setMinHeight(18);
                            this.HealthPoints = new TABS.STATS.Entity.HealthPoints();
                            this.Resource = new TABS.STATS.Entity.Resource();
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up TABS.GUI.Window.Stats.SimView.Label constructor", e);
                            console.groupEnd();
                        }
                    },
                    properties: {
                        type: {
                            init: "Enemy",
                            check: ["Enemy", "Repair", "Loot"]
                        },
                        subType: {
                            init: "HealthPointsAbs",
                            check: ["HealthPointsAbs", "HealthPointsRel", "RepairCharge", "RepairStorage", "Resource", "Tiberium", "Crystal", "Credits", "ResearchPoints"]
                        }
                    },
                    members: {
                        HealthPoints: null,
                        Resource: null,
                        __update: function () {
                            var value = null;
                            if (ClientLib.Data.MainData.GetInstance().get_Cities().get_CurrentCity() !== null) {
                                switch (this.getType()) {
                                    case "Enemy":
                                        switch (this.getSubType()) {
                                            case "HealthPointsAbs":
                                                value = this.HealthPointsAbs();
                                                break;
                                            case "HealthPointsRel":
                                                value = this.HealthPointsRel();
                                                break;
                                            case "RepairCharge":
                                                value = this.RepairCharge();
                                                break;
                                            default:
                                                break;
                                        }
                                        break;
                                    case "Repair":
                                        switch (this.getSubType()) {
                                            case "HealthPointsAbs":
                                                value = this.HealthPointsAbs();
                                                break;
                                            case "HealthPointsRel":
                                                value = this.HealthPointsRel();
                                                break;
                                            case "RepairCharge":
                                            case "RepairChargeInf":
                                            case "RepairChargeVeh":
                                            case "RepairChargeAir":
                                                value = this.RepairCharge();
                                                break;
                                            case "RepairStorage":
                                                return;
                                            case "Resource":
                                                value = this.RepairCharge();
                                                break;
                                            case "RepairStorage":
                                                return;
                                            case "Crystal":
                                                value = this.Loot();
                                                break;
                                            default:
                                                break;
                                        }
                                        break;
                                    case "Loot":
                                        switch (this.getSubType()) {
                                            case "Resource":
                                            case "Tiberium":
                                            case "Crystal":
                                            case "Credits":
                                            case "ResearchPoints":
                                                value = this.Loot();
                                                break;
                                            default:
                                                break;
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            }
                            if (this.HealthPoints.getMax() > 0 && value !== null) {
                                this.setValue(value.text);
                                this.setTextColor(value.color);
                            } else {
                                this.resetValue();
                                this.resetTextColor();
                            }
                        },
                        HealthPointsAbs: function () {
                            if (this.HealthPoints.getMax() > 0) {
                                var percent = (this.HealthPoints.getEnd() / this.HealthPoints.getMax()) * 100,
                                    digits = (percent <= 0 || percent >= 100 ? 0 : (percent >= 10 ? 1 : 2));
                                percent = Math.round(percent * Math.pow(10, digits)) / Math.pow(10, digits);
                                return {
                                    text: percent.toFixed(digits) + " %",
                                    color: this.getColorFromPercent(this.HealthPoints.getEnd() / this.HealthPoints.getMax())
                                };
                            }
                            return null;
                        },
                        HealthPointsRel: function () {
                            if (this.HealthPoints.getMax() > 0) {
                                var percent = ((this.HealthPoints.getStart() - this.HealthPoints.getEnd()) / this.HealthPoints.getMax()) * 100,
                                    digits = (percent <= 0 || percent >= 100 ? 0 : (percent >= 10 ? 1 : 2));
                                percent = Math.round(percent * Math.pow(10, digits)) / Math.pow(10, digits);
                                return {
                                    text: percent.toFixed(digits) + " %",
                                    color: this.getColorFromPercent(this.HealthPoints.getEnd() / this.HealthPoints.getMax())
                                };
                            }
                            return null;
                        },
                        RepairCharge: function () {
                            if (this.getSubType() == "Resource") {
                                res = 0;
                                res = this.Resource.getCrystal();
                                return {
                                    text: phe.cnc.gui.util.Numbers.formatNumbersCompact(res),
                                    color: this.getColorFromPercent(1)
                                };
                            } else {
                                res = 0;
                                if (this.HealthPoints.getMax() > 0) {
                                    switch (this.getSubType()) {
                                        case "RepairChargeInf":
                                            res = this.Resource.getRepairChargeInf();
                                            break;
                                        case "RepairChargeVeh":
                                            res = this.Resource.getRepairChargeVeh();
                                            break;
                                        case "RepairChargeAir":
                                            res = this.Resource.getRepairChargeAir();
                                            break;
                                        case "RepairCharge":
                                            res = Math.max(this.Resource.getRepairChargeBase(), this.Resource.getRepairChargeAir(), this.Resource.getRepairChargeInf(), this.Resource.getRepairChargeVeh());
                                            break;
                                    }
                                    return {
                                        text: phe.cnc.Util.getTimespanString(res),
                                        color: this.getColorFromPercent(1 - (this.HealthPoints.getEnd() / this.HealthPoints.getMax()))
                                    };
                                }
                            }
                            return null;
                        },
                        Loot: function () {
                            var res = 0,
                                lootFromCurrentCity = TABS.UTIL.Stats.get_LootFromCurrentCity(),
                                loot;
                            if (this.HealthPoints.getMax() > 0 && lootFromCurrentCity !== null) {
                                switch (this.getSubType()) {
                                    case "Resource":
                                        res = this.Resource.getTiberium() + this.Resource.getCrystal() + this.Resource.getCredits() + this.Resource.getResearchPoints();
                                        loot = lootFromCurrentCity.getTiberium() + lootFromCurrentCity.getCrystal() + lootFromCurrentCity.getCredits() + lootFromCurrentCity.getResearchPoints();
                                        break;
                                    case "Tiberium":
                                        res = this.Resource.getTiberium();
                                        loot = lootFromCurrentCity.getTiberium();
                                        break;
                                    case "Crystal":
                                        res = this.Resource.getCrystal();
                                        loot = lootFromCurrentCity.getCrystal();
                                        break;
                                    case "Credits":
                                        res = this.Resource.getCredits();
                                        loot = lootFromCurrentCity.getCredits();
                                        break;
                                    case "ResearchPoints":
                                        res = this.Resource.getResearchPoints();
                                        loot = lootFromCurrentCity.getResearchPoints();
                                        break;
                                }
                                return {
                                    text: phe.cnc.gui.util.Numbers.formatNumbersCompact(res),
                                    color: this.getColorFromPercent(1 - (res / loot))
                                };
                            }
                            return null;
                        },
                        getColorFromPercent: function (value) { // 1 = red, 0.5 = yellow, 0 = green
                            return "hsl(" + ((120 - ((100 - ((1 - value) * 100)) * 1.2)) - 0) + ", 100%, " + (25 + Math.round(((Math.abs(Math.max(value - 0.4, 0)) * 2) + (Math.abs(Math.max((1 - value) - 0.6, 0)))) * 25)) + "%)";
                        }
                    }
                });
                qx.Class.define("TABS.GUI.Window.Prios", { // [singleton]	Prios Window
                    extend: qx.ui.window.Window,
                    construct: function (prios) {
                        try {
                            this.base(arguments);
                            this.set({
                                layout: new qx.ui.layout.Grid(),
                                caption: this.tr("Priority Setup"),
                                allowMaximize: false,
                                showMaximize: false,
                                allowMinimize: false,
                                showMinimize: false,
                                resizable: false
                            });
                            this.center();
                            this.Prios = prios;
                        } catch (e) {
                            console.group("Tiberium Alliances Battle Simulator V2");
                            console.error("Error setting up TABS.GUI.Window.Prios constructor", e);
                            console.groupEnd();
                        }
                    },
                    members: {
                        Prios: null
                    }
                });
            }

            function translation() {
                var localeManager = qx.locale.Manager.getInstance();
                // Default language is english (en)
                // Available Languages are: ar,ce,cs,da,de,en,es,fi,fr,hu,id,it,nb,nl,pl,pt,ro,ru,sk,sv,ta,tr,uk
                // You can send me translations so I can include them in the Script.
                // German
                localeManager.addTranslation("de", {
                    "Shifts units one space up.": "Verschiebt Einheiten einen Platz nach oben.",
                    //GUI.ArmySetupAttackBar
                    "Shifts units one space down.": "Verschiebt die Einheiten einen Platz nach unten.",
                    //GUI.ArmySetupAttackBar
                    "Shifts units one space left.": "Verschiebt die Einheiten einen Platz nach links.",
                    //GUI.ArmySetupAttackBar
                    "Shifts units one space right.": "Verschiebt die Einheiten einen Platz nach rechts.",
                    //GUI.ArmySetupAttackBar
                    "Mirrors units horizontally.": "Spiegelt die Einheiten horizontal.",
                    //GUI.ArmySetupAttackBar
                    "Mirrors units vertically.": "Spiegelt die Einheiten vertikal.",
                    //GUI.ArmySetupAttackBar
                    "View Simulation": "Simulation anzeigen",
                    //GUI.PlayArea + GUI.Window.Stats.SimView
                    "Statistic": "Statistik",
                    //GUI.PlayArea + GUI.Window.Stats
                    "Show current formation with CNCTAOpt": "Zeigt die aktuelle Formation mit CNCTAOpt an",
                    //GUI.PlayArea
                    "Right click: Set formation from CNCTAOpt Long Link": "Rechtsklick: Formation von CNCTAOpt Long Link laden",
                    //GUI.PlayArea
                    "Remember transported units are not supported.": "Denk daran das transportierte Einheiten nicht unterstützt werden.",
                    //GUI.PlayArea
                    "Enter CNCTAOpt Long Link:": "CNCTAOpt Long Link eingeben:",
                    //GUI.PlayArea
                    "simulations in cache": "Simulationen im Cache",
                    //GUI.Window.Stats
                    "Most priority to construction yard including all in front of it.<br>After this the best total enemy health from the cached simulations is selected.<br>If no better simulation is found, the best offence unit repair charge and<br>battle duration from the cached simulations is selected.": "Die größte Priorität liegt auf dem Bauhof mit allem was vor ihm liegt.<br>Danach wird die Simulation aus dem Cache herausgesucht die den meisten<br>Schaden am Gegner verursacht.<br>Wenn keine bessere Formation gefunden wird, wird die Simulation mit der<br>niedrigsten Offensiv Reperaturzeit und besten Kampfdauer aus dem Cache herausgesucht.",
                    //STATS
                    "Most priority to defense facility including all in front of it.<br>After this the best armored defense health from the cached simulations is selected.<br>If no better simulation is found, the best offence unit repair charge and<br>battle duration from the cached simulations is selected.": "Die größte Priorität liegt auf der Verteidigungseinrichtung mit allem was vor ihr liegt.<br>Danach wird die Simulation aus dem Cache herausgesucht die den meisten<br>Schaden an bewaffneten Defensiveinheiten verursacht.<br>Wenn keine bessere Formation gefunden wird, wird die Simulation mit der<br>niedrigsten Offensiv Reperaturzeit und besten Kampfdauer aus dem Cache herausgesucht.",
                    //STATS
                    "Most priority to defense health including the auto repair after the battle.<br>If no better simulation is found, the best offence unit repair charge and<br>battle duration from the cached simulations is selected.": "Die größte Priorität liegt auf dem verursachtem Schaden an Defensiveinheiten<br>unter Berücksichtigung der automatischen Reperatur nach dem Kampf.<br>Wenn keine bessere Formation gefunden wird, wird die Simulation mit der<br>niedrigsten Offensiv Reperaturzeit und besten Kampfdauer aus dem Cache herausgesucht.",
                    //STATS
                    "Most priority to command center including all in front of it.<br>After this the best total enemy health from the cached simulations is selected.<br>If no better simulation is found, the best offence unit repair charge and<br>battle duration from the cached simulations is selected.": "Die größte Priorität liegt auf der Komandozentrale mit allem was vor ihr liegt.<br>Danach wird die Simulation aus dem Cache herausgesucht die den meisten<br>Schaden am Gegner verursacht.<br>Wenn keine bessere Formation gefunden wird, wird die Simulation mit der<br>niedrigsten Offensiv Reperaturzeit und besten Kampfdauer aus dem Cache herausgesucht.",
                    //STATS
                    "NoKill (farming) priorety.<br>Not working correctly yet.": "Vorschießen (farmen) Priorität.<br>Funktioniert noch nicht sehr gut.",
                    //STATS
                    "Shows the current army formation.": "Zeigt die aktuelle Armeeformation an." //STATS
                });
            }

            function waitForGame() {
                try {
                    if (typeof qx != 'undefined' && typeof qx.core != 'undfined' && typeof qx.core.Init != 'undefined') {
                        var app = qx.core.Init.getApplication();
                        if (app !== null && app.initDone === true && ClientLib.Data.MainData.GetInstance().get_Player().get_Id() !== 0 && ClientLib.Data.MainData.GetInstance().get_Server().get_WorldId() !== 0) {
                            try {
                                console.time("loaded in");
                                // replacing LoadCombatDirect
                                if (ClientLib.Vis.Battleground.Battleground.prototype.LoadCombatDirect === undefined) {
                                    var sBString = ClientLib.API.Battleground.prototype.SimulateBattle.toString();
                                    var targetMethod = sBString.match(/\{battleSetup:[a-z]+\},\s?\(new \$I\.[A-Z]{6}\)\.[A-Z]{6}\(this,this\.([A-Z]{6})\),\s?this\);/)[1];
                                    var lCString = ClientLib.API.Battleground.prototype[targetMethod].toString();
                                    var methodLoadDirect = lCString.match(/\$I\.[A-Z]{6}\.[A-Z]{6}\(\)\.[A-Z]{6}\(\)\.([A-Z]{6})\(b\.d\);/)[1];
                                    console.log(methodLoadDirect);
                                    ClientLib.Vis.Battleground.Battleground.prototype.LoadCombatDirect = ClientLib.Vis.Battleground.Battleground.prototype[methodLoadDirect];
                                }
                                translation();
                                createClasses();
                                TABS.getInstance();
                                console.group("Tiberium Alliances Battle Simulator V2");
                                console.timeEnd("loaded in");
                                console.groupEnd();
                            } catch (e) {
                                console.group("Tiberium Alliances Battle Simulator V2");
                                console.error("Error in waitForGame", e);
                                console.groupEnd();
                            }
                        } else {
                            window.setTimeout(waitForGame, 1000);
                        }
                    } else {
                        window.setTimeout(waitForGame, 1000);
                    }
                } catch (e) {
                    console.group("Tiberium Alliances Battle Simulator V2");
                    console.error("Error in waitForGame", e);
                    console.groupEnd();
                }
            }
            window.setTimeout(waitForGame, 1000);
        }.toString() + ")();";
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);
})();