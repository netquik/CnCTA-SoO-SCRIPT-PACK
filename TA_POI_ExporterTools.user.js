// ==UserScript==
// @name           POI Exporter Tools
// @version        1.0
// @description    Export FREE / ALLIANCE / ALL POIs with qooxdoo UI (movable), live counts, sectors summary, robust parsing + CSV
// @author         NEFRONTHEONE (NEFRON)
// @contributor    Netquik (https://github.com/netquik)
// @match          https://*.alliances.commandandconquer.com/*/index.aspx*
// @namespace      https://cncapp*.alliances.commandandconquer.com/*/index.aspx*
// @updateURL      https://raw.githubusercontent.com/netquik/CnCTA-SoO-SCRIPT-PACK/Testing/TA_POI_ExporterTools.user.js
// @grant          none
// ==/UserScript==


(function () {
  'use strict';

  // ---------- CSV ----------
  const CSV_HEADERS = ["POI_ID","ALLIANCE_ID","ALLIANCE_NAME","POI_Type","POI_Level","POI_X","POI_Y","Sector"];
  function rowsToCSV(rows) {
    const out = [CSV_HEADERS.join(",")];
    for (const r of rows) {
      out.push([
        r.POI_ID ?? "",
        r.ALLIANCE_ID ?? "",
        q(r.ALLIANCE_NAME ?? ""),
        q(r.POI_Type ?? ""),
        r.POI_Level ?? "",
        r.POI_X ?? "",
        r.POI_Y ?? "",
        q(r.Sector ?? "")
      ].join(","));
    }
    return out.join("\n");
  }
  function q(v){ return `"${String(v).replace(/"/g,'""')}"`; }
  function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ---------- COMMON PIPELINE ----------
  const poiTypeMapping = {
    1: 'TiberiumMine',
    2: 'CrystalMine',
    3: 'PowerVortex',
    4: 'Infantry',
    5: 'Vehicle',
    6: 'Air',
    7: 'Defense'
  };

  function parsePoiKeysFromCtor() {
    const fnCode = ClientLib.Data.WorldSector.WorldObjectPointOfInterest.prototype.$ctor.toString();
    const re = /this\.([A-Z]{6})=-1[\s\S]+?this\.([A-Z]{6})=e&255,this\.([A-Z]{6})=e>>[\s\S]+?,this\.([A-Z]{6})=e>>11[\s\S]+?=4,this\.([A-Z]{6})[\s\S]+?,this\.([A-Z]{6})=o\.[A-Z]{6}/m;
    const m = fnCode.match(re);
    if (!m) throw new Error("POI key pattern not found in $ctor");
    return {
      ALLIANCE_ID:   m[1],
      LEVEL:         m[2],
      SUBTYPE:       m[3],
      EXTRA:         m[4],
      ALLIANCE_NAME: m[6]
    };
  }

  // Sector helpers
  function getSectorNo(x, y) {
    const server = ClientLib.Data.MainData.GetInstance().get_Server();
    const WorldX2 = Math.floor(server.get_WorldWidth() / 2);
    const WorldY2 = Math.floor(server.get_WorldHeight() / 2);
    const SectorCount = server.get_SectorCount();
    const WorldCX = (WorldX2 - x);
    const WorldCY = (y - WorldY2);
    const WorldCa = ((Math.atan2(WorldCX, WorldCY) * SectorCount) / 6.2831853071795862) + (SectorCount + 0.5);
    return (Math.floor(WorldCa) % SectorCount);
  }
  function getSectorText(i) {
  const qxApp = qx.core.Init.getApplication?.();
  // fallback sigle standard
  const FALLBACK = { 0:'S', 1:'SW', 2:'W', 3:'NW', 4:'N', 5:'NE', 6:'E', 7:'SE' };
  if (!qxApp) return FALLBACK[i] ?? String(i);

  let s;
  switch (i) {
    case 0: s = qxApp.tr("tnf:south abbr"); break;
    case 1: s = qxApp.tr("tnf:southwest abbr"); break;
    case 2: s = qxApp.tr("tnf:west abbr"); break;
    case 3: s = qxApp.tr("tnf:northwest abbr"); break;
    case 4: s = qxApp.tr("tnf:north abbr"); break;
    case 5: s = qxApp.tr("tnf:northeast abbr"); break;
    case 6: s = qxApp.tr("tnf:east abbr"); break;
    case 7: s = qxApp.tr("tnf:southeast abbr"); break;
    default: s = null;
  }
  // if the translation is empty/equal to the key, use fallback
  if (!s || /tnf:/.test(s)) return FALLBACK[i] ?? String(i);
  return s;
}

  const SECTOR_ORDER = [4,5,6,7,0,1,2,3]; // N, NE, E, SE, S, SW, W, NW

  // Build POI rows; filter = "all" | "withAlliance" | "free"
  function buildPoiRows(filter = "all") {
    if (!ClientLib?.Data?.MainData?.GetInstance) return { rows: [], sectorsIdx: new Set() };

    const poiMap = ClientLib.Data.MainData.GetInstance().get_World().GetPOIs().d;
    if (!poiMap) return { rows: [], sectorsIdx: new Set() };

    const K = parsePoiKeysFromCtor();
    const rows = [];
    const sectorsIdx = new Set();

    for (const [, e] of Object.entries(poiMap)) {
      try {
        if (e[K.SUBTYPE] === 0) continue; // drop invalid subtype

        const allianceId = (e[K.ALLIANCE_ID] === -1) ? null : e[K.ALLIANCE_ID];
        if (filter === "withAlliance" && allianceId === null) continue;
        if (filter === "free" && allianceId !== null) continue;

        const t = {};
        ClientLib.Base.MathUtil.DecodeCoordId(e.worldId, t); // t.b=X, t.c=Y
        const idx  = getSectorNo(t.b, t.c);
        sectorsIdx.add(idx);

        const typeNum  = e[K.SUBTYPE];
        const typeText = poiTypeMapping[typeNum] ?? String(typeNum);

        rows.push({
          POI_ID:        e.worldId,
          ALLIANCE_ID:   allianceId ?? "",
          ALLIANCE_NAME: (e[K.ALLIANCE_NAME] ?? ""),
          POI_Type:      typeText,
          POI_Level:     e[K.LEVEL],
          POI_X:         t.b,
          POI_Y:         t.c,
          Sector:        getSectorText(idx)
        });
      } catch {}
    }
    return { rows, sectorsIdx };
  }

  // ---------- FLOWS ----------
  const BUTTON_LABELS = {
    free: "Export Free POIs",
    withAlliance: "Export Alliance POIs",
    all: "Export ALL POIs"
  };

 async function exportRows(filter, setBtn, ui) {
  setBtn(true, `Exporting (${filter})...`);
  try {
    // attempt 1
    let { rows } = buildPoiRows(filter);
    if (rows.length === 0) {
      setBtn(true, `Exporting (${filter}) – retry...`);
      await new Promise(r => setTimeout(r, 1000));
      ({ rows } = buildPoiRows(filter));
    }
    if (rows.length === 0) {
      alert(`No POIs found for "${filter}".`);
      return;
    }
    const ts = new Date().toISOString().slice(0,19).replace(/-/g,"").replace(/:/g,"").replace("T","_");
    downloadCSV(rowsToCSV(rows), `cncta_${filter}_pois_${ts}.csv`);
    console.log(`Exported ${rows.length} POIs (${filter}).`);
  } catch (e) {
    console.error(`Export error (${filter}):`, e);
    alert(`Error during export (${filter}). Check console (F12).`);
  } finally {
    // Re-enable button and refresh labels + sectors
    setBtn(false);
    updateCounts(ui);
  }
}


  // Update counts + sectors in UI (called on Refresh and on window open)
function updateCounts(ui) {
  try {
    const free  = buildPoiRows("free");
    const alli  = buildPoiRows("withAlliance");
    const all   = buildPoiRows("all");

    ui.btnFree.setLabel(`${BUTTON_LABELS.free} (${free.rows.length})`);
    ui.btnAlli.setLabel(`${BUTTON_LABELS.withAlliance} (${alli.rows.length})`);
    ui.btnAll.setLabel(`${BUTTON_LABELS.all} (${all.rows.length})`);

    const { text, tooltip } = formatSectorsForLabel(all.sectorsIdx);
    if (ui.lblSectors && !ui.lblSectors.isDisposed()) {
      ui.lblSectors.setValue(text);
      ui.lblSectors.setToolTipText(tooltip);
    }
  } catch (e) {
    console.error("updateCounts error:", e);
  }
}





  function sectorSetToText(setIdx) {
    if (!setIdx || setIdx.size === 0) return "";
    const arr = Array.from(setIdx);
    arr.sort((a,b) => SECTOR_ORDER.indexOf(a) - SECTOR_ORDER.indexOf(b));
    return arr.map(getSectorText).join(", ");
  }

function sectorSetToCompactText(setIdx) {
  if (!setIdx || setIdx.size === 0) return "";
  const arr = Array.from(setIdx);
  arr.sort((a,b) => SECTOR_ORDER.indexOf(a) - SECTOR_ORDER.indexOf(b));
  return arr.map(getSectorText).join("-");
}

function formatSectorsForLabel(setIdx) {
  const full = sectorSetToCompactText(setIdx);
  const count = setIdx?.size || 0;
  if (count === 0) return { text: "⇒ -", tooltip: "" };
  if (count === 8) return { text: "⇒ ALL", tooltip: full };
  return { text: `⇒ ${full}`, tooltip: full };
}



  // ---------- QX UI (movable window with 3 buttons + refresh + sector labels) ----------
  function createMovableToolbox() {
  const app  = qx.core.Init.getApplication();
  const root = app.getRoot();

  if (window.__poiToolbox && !window.__poiToolbox.isDisposed()) return;

  const win = new qx.ui.window.Window("POI Exporter Tools").set({
    showMinimize: false,
    showMaximize: false,
    showClose: false,
    allowMaximize: false,
    resizable: false,
    movable: true,
    contentPadding: 8,
    zIndex: 100000
  });
  win.setLayout(new qx.ui.layout.VBox(8));
  win.setAllowGrowY(false);

  // --- header: Refresh (icon) + Sectors label (vertical-center) ---
const hbox = new qx.ui.container.Composite(new qx.ui.layout.HBox(8)).set({
  allowGrowY: false
});
hbox.getLayout().setAlignY("middle");

// icona refresh del gioco
const btnRefresh = new qx.ui.form.Button().set({
  allowGrowX: false,
  allowGrowY: false,
  padding: 2,
  width: 26,
  height: 26,
  toolTipText: "Refresh counts",
  icon: "FactionUI/icons/icon_refresh_funds.png"
});
btnRefresh.getChildControl("icon").set({ scale: true });

// label settori — font/colore più convincenti
const lblSectors = new qx.ui.basic.Label("⇒ -").set({
  allowGrowX: true,
  allowGrowY: false,
  rich: false,
  font: "font_size_13_bold",
  textColor: "#d6e8ff"
});


// monta header
hbox.add(btnRefresh);
hbox.add(lblSectors, { flex: 1, alignY: "middle" });
win.add(hbox);

// listener refresh
btnRefresh.addListener("execute", () => updateCounts(ui));

// centra verticalmente la label (hint per l'HBox)
hbox.add(btnRefresh);
hbox.add(lblSectors, { flex: 1, alignY: "middle" });

win.add(hbox);

// listener refresh
btnRefresh.addListener("execute", () => updateCounts(ui));


  // --- export buttons (solo conteggio) ---
  const btnFree  = new qx.ui.form.Button(BUTTON_LABELS.free).set({ allowGrowX:true, allowGrowY:false, minWidth:220, padding:8 });
  const btnAlli  = new qx.ui.form.Button(BUTTON_LABELS.withAlliance).set({ allowGrowX:true, allowGrowY:false, minWidth:220, padding:8 });
  const btnAll   = new qx.ui.form.Button(BUTTON_LABELS.all).set({ allowGrowX:true, allowGrowY:false, minWidth:220, padding:8 });

  win.add(btnFree);
  win.add(btnAlli);
  win.add(btnAll);

  root.add(win, { left: 12, top: 260 });
  win.open();


  // position persistence
  const POS_KEY = "__poi_exporter_tools_pos";
  const saved = localStorage.getItem(POS_KEY);
  if (saved) {
    try {
      const { left, top } = JSON.parse(saved);
      if (Number.isFinite(left) && Number.isFinite(top)) {
        win.addListenerOnce("appear", () => win.moveTo(left, top));
      }
    } catch {}
  }
  win.addListener("move", () => {
    const b = win.getBounds();
    if (b) localStorage.setItem(POS_KEY, JSON.stringify({ left: b.left, top: b.top }));
  });

  // === UI obj (before listener) ===
const ui = { win, btnFree, btnAlli, btnAll, btnRefresh, lblSectors };

  // helper for disabling buttons export
  const makeSetter = (btn) => (disabled, label) => {
    btn.setEnabled(!disabled);
    if (label != null) btn.setLabel(label);
  };

  // listeners (use ui)
  btnRefresh.addListener("execute", () => updateCounts(ui));
  btnFree.addListener("execute",  () => exportRows("free",         makeSetter(btnFree), ui));
  btnAlli.addListener("execute",  () => exportRows("withAlliance", makeSetter(btnAlli), ui));
  btnAll.addListener("execute",   () => exportRows("all",          makeSetter(btnAll),  ui));

  // auto-resize the content (removes empty space)
  win.addListenerOnce("appear", () => {
    const hint = win.getSizeHint();
    win.set({ width: hint.width, height: hint.height });
  });

  // refresh initial (2 pass for slow loads)
  updateCounts(ui);
  setTimeout(() => updateCounts(ui), 1000);
  setTimeout(() => updateCounts(ui), 3000);

  window.__poiToolbox = win;
  console.log("POI Exporter Tools opened.");
}




  function qxReady() {
    try {
      if (typeof qx === "undefined") return false;
      const app = qx.core?.Init?.getApplication?.();
      return !!app?.getRoot?.();
    } catch { return false; }
  }

  (function waitForQx() {
    if (qxReady() &&
        ClientLib?.Data?.MainData?.GetInstance?.() &&
        ClientLib.Base?.MathUtil?.DecodeCoordId) {
      setTimeout(createMovableToolbox, 400);
    } else {
      setTimeout(waitForQx, 500);
    }
  })();

})();
