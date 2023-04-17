"use strict";
// ==UserScript==
// @name        CnCTA TargetWatcher Enhancer
// @version	    2023.04.17
// @updateURL   https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/Testing/TA_TargetWatcher_Enhancer.user.js
// @match       https://*.alliances.commandandconquer.com/*/index.aspx*
// @autohor     bloofi (https://github.com/bloofi) || Updated by NetquiK [SoO] (https://github.com/netquik)
// ==/UserScript==
(function () {
    const script = () => {
        const scriptName = 'CnCTA TargetWatcher Enhancer';
        const colors = {
            0: '#cccccc',
            1: 'gold',
            2: '#cccccc',
            3: '#cccccc',
        };
        const markerColors = {
            0: 'rgba(150, 150, 150, 0.5)',
            1: 'rgb(21, 60, 200, 0.8)',
            2: 'rgb(188,143,28)',
            3: 'rgba(200, 21, 21, 0.5)',
        };
        const init = () => {
            console.log("TargetWatcher Enhancer Loaded");
            /*
            qx.core.Init.getApplication().getUIItem(ClientLib.Data.Missions.PATH.OVL_PLAYAREA).getChildren()[10]
            pavmNone = 0,
            pavmPlayerBase = 1,
            pavmPlayerDefense = 2,
            pavmPlayerOffense = 3,
            pavmCombatSetupBase = 4,
            pavmCombatSetupDefense = 5,
            pavmCombatAttacker = 6,
            pavmCombatDefender = 7,
            pavmCombatViewerAttacker = 8,
            pavmCombatViewerDefender = 9,
            pavmCombatReplay = 10,
            pavmCombatSimulation = 11,
            pavmWorldMap = 12,
            pavmAllianceBase = 13,
            pavmAllianceBaseDefense = 14,
             */
            const me = ClientLib.Data.MainData.GetInstance().get_Player();
            const updateLabel = () => {
                const divParent = qx.core.Init.getApplication()
                    .getUIItem(ClientLib.Data.Missions.PATH.OVL_PLAYAREA)
                    .getChildren()[10];
                if (divParent) {
                    const divParentEl = divParent.getContentElement();
                    if (divParentEl) {
                        divParentEl.realSetStyles = divParentEl.setStyles;
                        divParentEl.setStyles = styles => {
                            divParentEl.realSetStyles({
                                right: '30px',
                                left: 'unset',
                                width: '35%',
                                height: '60px',
                                overflow: 'visible'
                            });
                        };
                    }
                    const divLabel = divParent.getChildren()[0];
                    if (divLabel) {
                        const divLabelEl = divLabel.getContentElement();
                        if (divLabelEl) {
                            divLabelEl.realSetStyles = divLabelEl.setStyles;
                            divLabelEl.setStyles = styles => {
                                divLabelEl.realSetStyles({
                                    height: '100%',
                                    width: '100%',
                                });
                            };
                        }
                        divLabel.realSetValue = divLabel.setValue;
                        divLabel.setValue = value => {
                            const myId = ClientLib.Data.MainData.GetInstance()
                                .get_Player()
                                .get_Id();
                            const bid = ClientLib.Data.MainData.GetInstance()
                                .get_AllianceTargetWatcher()
                                .get_BaseId();
                            const members = ClientLib.Data.MainData.GetInstance()
                                .get_Alliance()
                                .get_MemberDataAsArray();
                            const watchers = Object.values(ClientLib.Data.MainData.GetInstance().get_AllianceWatchListWatcher()).reduce((p, c) => (typeof c === 'object' ? Object.values(c) : p), []);
                            const labels = [];
                            const timerLabel = /(?:<img.*)?\d{2}:\d{2}$/.exec(value);
                            if (timerLabel) {
                                labels.push(timerLabel[0], '<br>');
                            }
                            switch (qx.core.Init.getApplication()
                                .getPlayArea()
                                .getViewMode()) {
                                case 5: // Army setup
                                case 8: // Spectating an attack
                                case 10: // Simulating an attack
                                    if (watchers && watchers.length) {
                                        const res = watchers
                                            .filter(w => w.b === bid && w.p !== myId)
                                            .map(w => {
                                            const m = members.find(m => m.Id === w.p);
                                            return Object.assign(Object.assign({}, w), { n: m.Name, s: m.OnlineState });
                                        });
                                        if (res.length) {
                                            const label = `${res
                                                .sort((a, b) => (a.s === 1 ? 1 : 0))
                                                .map(w => `<span style="color:${colors[w.s]};">${w.n}</span>`)
                                                .join(', ')} ${res.length > 1 ? 'are' : 'is'} watching !`;
                                            labels.push(label);
                                        }
                                    }
                                    break;
                                default:             
                                    labels.splice(0, labels.length);
                                    labels.push(value);
                                    break;
                            }
                            labels.reverse();
                            divLabel.realSetValue(labels.join(''));
                        };
                    }
                }
            };
            updateLabel();
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Markers
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            let gridWidth = null;
            let gridHeight = null;
            let baseMarkerWidth = null;
            let baseMarkerHeight = null;
            let regionZoomFactor = null;
            const markers = {};
            const citiesCache = {};
            let checkTimeout = null;
            const removeMarkers = () => {
                Object.entries(markers)
                    .filter(m => !!m[1])
                    .forEach(m => {
                    removeMarker(m[1].x, m[1].y);
                });
            };
            const removeMarker = (x, y) => {
                if (markers[`${x}:${y}`] && markers[`${x}:${y}`].marker) {
                    qx.core.Init.getApplication()
                        .getDesktop()
                        .remove(markers[`${x}:${y}`].marker);
                    markers[`${x}:${y}`].marker.dispose();
                    markers[`${x}:${y}`] = null;
                    delete markers[`${x}:${y}`];
                }
            };
            const updateMarkerSize = () => {
                gridWidth = ClientLib.Vis.VisMain.GetInstance()
                    .get_Region()
                    .get_GridWidth();
                gridHeight = ClientLib.Vis.VisMain.GetInstance()
                    .get_Region()
                    .get_GridHeight();
                regionZoomFactor = ClientLib.Vis.VisMain.GetInstance()
                    .get_Region()
                    .get_ZoomFactor();
                baseMarkerWidth = regionZoomFactor * gridWidth;
                baseMarkerHeight = regionZoomFactor * gridHeight;
            };
            const repositionMarkers = () => {
                updateMarkerSize();
                Object.entries(markers).forEach(m => {
                    m[1].marker.setDomLeft(ClientLib.Vis.VisMain.GetInstance().ScreenPosFromWorldPosX(m[1].x * gridWidth));
                    m[1].marker.setDomTop(ClientLib.Vis.VisMain.GetInstance().ScreenPosFromWorldPosY(m[1].y * gridHeight));
                });
            };
            const resizeMarkers = () => {
                updateMarkerSize();
                // Object.values(markers)
                //     .filter(b => b.marker)
                //     .forEach(b => {
                //         b.marker.setWidth(baseMarkerWidth);
                //         b.marker.setHeight(baseMarkerHeight);
                //     });
            };
            const onViewChanged = (oldMode, newMode) => {   
                var vMode = qx.core.Init.getApplication().getPlayArea().getViewMode();
                "undefined"==typeof divParent&&(divParent=qx.core.Init.getApplication().getUIItem(ClientLib.Data.Missions.PATH.OVL_PLAYAREA).getChildren()[10]);divParent&&(([1,2,3].includes(vMode)||(vMode==6&&oldMode==3))?divParent.exclude():!divParent.isVisible()&&divParent.show());
            };
            const addMarker = (x, y, names, states) => {
                const marker = new qx.ui.container.Composite(new qx.ui.layout.Atom()).set({
                    decorator: new qx.ui.decoration.Decorator().set({
                        color: 'rgba(200, 21, 21, 0.8)',
                        style: 'solid',
                        width: 2,
                        radius: 5,
                    }),
                });
                const label = new qx.ui.basic.Label('').set({
                    decorator: new qx.ui.decoration.Decorator().set({
                        color: states.length ? markerColors[states[0]] : 'rgba(200, 21, 21, 0.8)',
                        style: 'solid',
                        width: 1,
                        radius: 5,
                    }),
                    value: names.length ? `${names[0]}${names.length > 1 ? ', ...' : ''}` : '',
                    toolTipText: names.length > 1 ? `Other watchers : ${names.slice(1).join(', ')}` : '',
                    textColor: '#ffffff',
                    textAlign: 'center',
                    backgroundColor: states.length ? markerColors[states[0]] : 'rgba(200, 21, 21, 0.8)',
                    font: new qx.bom.Font(10, ['Arial']),
                    rich: true,
                    wrap: false,
                    padding: 3,
                    allowGrowX: true,
                    allowShrinkX: false,
                });
                marker.add(label, { edge: 'north' });
                qx.core.Init.getApplication()
                    .getDesktop()
                    .addAfter(marker, qx.core.Init.getApplication().getBackgroundArea(), {
                    left: ClientLib.Vis.VisMain.GetInstance().ScreenPosFromWorldPosX(x * gridWidth),
                    top: ClientLib.Vis.VisMain.GetInstance().ScreenPosFromWorldPosY(y * gridHeight),
                });
                markers[`${x}:${y}`] = {
                    x,
                    y,
                    names,
                    marker,
                };
            };
            webfrontend.phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance().get_Region(), 'ZoomFactorChange', ClientLib.Vis.ZoomFactorChange, this, resizeMarkers);
            webfrontend.phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance().get_Region(), 'PositionChange', ClientLib.Vis.PositionChange, this, repositionMarkers);
            webfrontend.phe.cnc.Util.attachNetEvent(ClientLib.Vis.VisMain.GetInstance(), "ViewModeChange", ClientLib.Vis.ViewModeChange, this, onViewChanged);
            updateMarkerSize();
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            // Map watchers
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            const propCampGetId = /return this\.[A-Z]{6}\.([A-Z]{6})/.exec(new ClientLib.Vis.Region.RegionNPCCamp().__proto__.get_Id.toString())[1];
            const propBaseGetId = /return this\.[A-Z]{6}\.([A-Z]{6})/.exec(new ClientLib.Vis.Region.RegionNPCBase().__proto__.get_Id.toString())[1];
            const checkWatchers = () => {
                removeMarkers();
                if (qx.core.Init.getApplication()
                    .getPlayArea()
                    .getViewMode() === 0 &&
                    !qx.core.Init.getApplication().getCurrentMenuOverlay()) {
                    const members = ClientLib.Data.MainData.GetInstance()
                        .get_Alliance()
                        .get_MemberDataAsArray();
                    const watchers = Object.values(ClientLib.Data.MainData.GetInstance().get_AllianceWatchListWatcher()).reduce((p, c) => (typeof c === 'object' ? Object.values(c) : p), []);
                    const allItems = Object.values(ClientLib.Vis.VisMain.GetInstance()
                        .get_Region()
                        .GetNPCCamps().d)
                        .map((c) => ({ id: c[propCampGetId], x: c.posX, y: c.posY }))
                        .concat(Object.values(ClientLib.Vis.VisMain.GetInstance()
                        .get_Region()
                        .GetNPCBases().d).map((c) => ({ id: c[propBaseGetId], x: c.posX, y: c.posY })));
                    const markers = watchers
                        .filter(c => c.p !== me.get_Id())
                        .reduce((p, c) => {
                        if (!p[`${c.b}`]) {
                            let city = citiesCache[`${c.b}`];
                            if (!city) {
                                city = allItems.find(i => i.id === c.b);
                                if (city) {
                                    citiesCache[`${c.b}`] = { x: city.x, y: city.y };
                                }
                            }
                            p[`${c.b}`] = {
                                b: c.b,
                                isLoaded: !!city,
                                x: city ? city.x : null,
                                y: city ? city.y : null,
                                names: [],
                                states: [],
                            };
                        }
                        const m = members.find(m => m.Id === c.p);
                        if (m.OnlineState) {
                            p[`${c.b}`].names.push(m.Name);
                            p[`${c.b}`].states.push(m.OnlineState);
                        }
                        return p;
                    }, {});
                    Object.entries(markers)
                        .filter(([b, m]) => m.isLoaded && m.names.length)
                        .forEach(([_b, m]) => {
                        addMarker(m.x, m.y, m.names, m.states);
                    });
                }
                checkTimeout = setTimeout(checkWatchers, 3000);
            };
            checkWatchers();
        };
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Game load state Checking
        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        function checkForInit() {
            try {
                if (typeof qx !== 'undefined' &&
                    qx &&
                    qx.core &&
                    qx.core.Init &&
                    qx.core.Init.getApplication &&
                    qx.core.Init.getApplication() &&
                    qx.core.Init.getApplication().initDone) {
                    init();
                }
                else {
                    window.setTimeout(checkForInit, 1000);
                }
            }
            catch (e) {
                console.log(scriptName, e);
            }
        }
        checkForInit();
    };
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Script injection
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    if (/commandandconquer\.com/i.test(document.domain)) {
        try {
            const script_block = document.createElement('script');
            script_block.innerHTML = `(${script.toString()})();`;
            script_block.type = 'text/javascript';
            document.getElementsByTagName('head')[0].appendChild(script_block);
        }
        catch (e) {
            console.log('Failed to inject script', e);
        }
    }
})();
