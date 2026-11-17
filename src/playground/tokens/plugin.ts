/**
 * The Figma plugin's code, as text: the export drops the system's data in for __DATA__ and
 * zips it with a manifest. It runs inside Figma, so it only uses Figma's plugin API.
 * Run it again and it updates what it made before, keeping anything bound to it.
 */
export const PLUGIN_CODE = String.raw`// Made by the Design Tokens playground. Creates or updates variables, text styles,
// effect styles, grid styles and a Tokens page in the open file.
var DATA = __DATA__;

var WEIGHTS = { 100: ['Thin', 'Hairline'], 200: ['ExtraLight', 'UltraLight'], 300: ['Light'], 400: ['Regular', 'Normal', 'Book', 'Roman'], 500: ['Medium'], 600: ['SemiBold', 'DemiBold'], 700: ['Bold'], 800: ['ExtraBold', 'UltraBold'], 900: ['Black', 'Heavy'] };
var notes = [];
function squash(s) { return s.replace(/[\s_-]/g, '').toLowerCase(); }

async function main() {
  var fonts = await figma.listAvailableFontsAsync();
  var fontCache = {};
  async function fontFor(family, weight) {
    var key = family + ':' + weight;
    if (fontCache[key]) return fontCache[key];
    var fam = family;
    var styles = fonts.filter(function (f) { return f.fontName.family === fam; }).map(function (f) { return f.fontName.style; });
    if (!styles.length) {
      if (notes.indexOf(family + ' is not in Figma, so Inter stands in') < 0) notes.push(family + ' is not in Figma, so Inter stands in');
      fam = 'Inter';
      styles = fonts.filter(function (f) { return f.fontName.family === 'Inter'; }).map(function (f) { return f.fontName.style; });
    }
    var plain = styles.filter(function (s) { return !/italic|oblique/i.test(s); });
    var pick = null;
    var order = Object.keys(WEIGHTS).map(Number).sort(function (a, b) { return Math.abs(a - weight) - Math.abs(b - weight); });
    for (var i = 0; i < order.length && !pick; i++) {
      var names = WEIGHTS[order[i]];
      pick = plain.find(function (s) { return names.some(function (n) { return squash(s) === squash(n); }); }) || null;
    }
    var fontName = { family: fam, style: pick || plain[0] || styles[0] || 'Regular' };
    await figma.loadFontAsync(fontName);
    fontCache[key] = fontName;
    return fontName;
  }

  /* variables */
  var collections = await figma.variables.getLocalVariableCollectionsAsync();
  var variables = await figma.variables.getLocalVariablesAsync();
  var made = {};
  var cols = {};
  var count = 0;

  function ensureCollection(name, modes) {
    var col = collections.find(function (c) { return c.name === name; });
    if (!col) { col = figma.variables.createVariableCollection(name); collections.push(col); }
    var ids = {};
    modes.forEach(function (m, i) {
      var mode = col.modes.find(function (x) { return x.name === m; });
      if (!mode && i === 0 && col.modes.length && modes.indexOf(col.modes[0].name) < 0) {
        col.renameMode(col.modes[0].modeId, m);
        mode = { modeId: col.modes[0].modeId, name: m };
      }
      if (!mode) {
        try { mode = { modeId: col.addMode(m), name: m }; } catch (e) { mode = null; }
      }
      if (mode) ids[m] = mode.modeId;
    });
    return { col: col, ids: ids };
  }
  function ensureVariable(col, name, type) {
    var v = variables.find(function (x) { return x.variableCollectionId === col.id && x.name === name; });
    if (v && v.resolvedType !== type) { v.remove(); v = null; }
    if (!v) { v = figma.variables.createVariable(name, col, type); variables.push(v); }
    return v;
  }
  function valueOf(raw) {
    if (raw && raw.alias) {
      var target = made[raw.alias[0] + '::' + raw.alias[1]];
      if (!target) throw new Error('missing ' + raw.alias.join(' / '));
      return figma.variables.createVariableAlias(target);
    }
    if (Array.isArray(raw)) return { r: raw[0], g: raw[1], b: raw[2], a: raw.length > 3 ? raw[3] : 1 };
    return raw;
  }

  for (var c = 0; c < DATA.collections.length; c++) {
    var def = DATA.collections[c];
    var base = ensureCollection(def.name, def.modes);
    var groups = [{ col: base.col, ids: base.ids, modes: def.modes.filter(function (m) { return base.ids[m]; }), first: true }];
    def.modes.forEach(function (m) {
      if (base.ids[m]) return;
      var alt = ensureCollection(def.name + ' (' + m + ')', [m]);
      groups.push({ col: alt.col, ids: alt.ids, modes: [m], first: false });
      notes.push(def.name + ' ' + m + ' got its own collection: this plan allows one mode per collection');
    });
    cols[def.name] = groups[0];
    for (var g = 0; g < groups.length; g++) {
      var grp = groups[g];
      for (var k = 0; k < def.vars.length; k++) {
        var d = def.vars[k];
        var v = ensureVariable(grp.col, d.n, d.t);
        for (var mi = 0; mi < grp.modes.length; mi++) {
          var m = grp.modes[mi], idx = def.modes.indexOf(m);
          v.setValueForMode(grp.ids[m], valueOf(d.v[idx] !== undefined ? d.v[idx] : d.v[0]));
        }
        try { if (d.s) v.scopes = d.s; } catch (e) { }
        try { if (d.c) v.setVariableCodeSyntax('WEB', d.c); } catch (e) { }
        if (d.d) v.description = d.d;
        if (grp.first) made[def.name + '::' + d.n] = v;
        count++;
      }
    }
  }

  /* text styles, bound to the Typography variables */
  var textStyles = await figma.getLocalTextStylesAsync();
  var madeText = {};
  for (var t = 0; t < DATA.text.length; t++) {
    var ts = DATA.text[t];
    try {
      var fontName = await fontFor(ts.family, ts.weight);
      var s = textStyles.find(function (x) { return x.name === ts.name; });
      if (!s) { s = figma.createTextStyle(); s.name = ts.name; }
      s.fontName = fontName;
      s.fontSize = ts.size;
      s.lineHeight = { unit: 'PIXELS', value: ts.lh };
      s.letterSpacing = { unit: 'PERCENT', value: ts.tracking };
      s.textCase = ts.upper ? 'UPPER' : 'ORIGINAL';
      s.description = ts.desc;
      var size = made[ts.bind.size[0] + '::' + ts.bind.size[1]], lh = made[ts.bind.lh[0] + '::' + ts.bind.lh[1]];
      try { if (size) s.setBoundVariable('fontSize', size); } catch (e) { }
      try { if (lh) s.setBoundVariable('lineHeight', lh); } catch (e) { }
      madeText[ts.name] = s;
    } catch (e) { notes.push(ts.name + ': ' + e.message); }
  }

  /* effect styles */
  var effectStyles = await figma.getLocalEffectStylesAsync();
  var madeFx = {};
  DATA.effects.forEach(function (fx) {
    var s = effectStyles.find(function (x) { return x.name === fx.name; });
    if (!s) { s = figma.createEffectStyle(); s.name = fx.name; }
    s.effects = fx.layers.map(function (l) {
      return { type: 'DROP_SHADOW', color: { r: l.c[0], g: l.c[1], b: l.c[2], a: l.c[3] }, offset: { x: 0, y: l.y }, radius: l.blur, spread: l.spread, visible: true, blendMode: 'NORMAL', showShadowBehindNode: false };
    });
    s.description = fx.desc;
    madeFx[fx.name] = s;
  });

  /* grid styles */
  var gridStyles = await figma.getLocalGridStylesAsync();
  DATA.grids.forEach(function (gr) {
    var s = gridStyles.find(function (x) { return x.name === gr.name; });
    if (!s) { s = figma.createGridStyle(); s.name = gr.name; }
    var color = { r: 1, g: 0.18, b: 0.44, a: 0.1 };
    s.layoutGrids = [gr.center
      ? { pattern: 'COLUMNS', alignment: 'CENTER', count: gr.columns, gutterSize: gr.gutter, sectionSize: gr.section, visible: true, color: color }
      : { pattern: 'COLUMNS', alignment: 'STRETCH', count: gr.columns, gutterSize: gr.gutter, offset: gr.margin, visible: true, color: color }];
  });

  /* a page that shows it all */
  try { await drawPage(fontFor, cols, madeText, madeFx); } catch (e) { notes.push('Tokens page: ' + e.message); }

  var msg = 'Done: ' + count + ' variables, ' + Object.keys(madeText).length + ' text styles, ' + DATA.effects.length + ' effect styles, ' + DATA.grids.length + ' grids.';
  if (notes.length) { console.log(notes.join('\n')); msg += ' ' + notes.slice(0, 2).join('. ') + (notes.length > 2 ? ' (more in the console)' : ''); }
  figma.closePlugin(msg);
}

async function drawPage(fontFor, cols, madeText, madeFx) {
  var title = 'Tokens · ' + DATA.name;
  var page = figma.root.children.find(function (p) { return p.name === title; });
  if (page) { await page.loadAsync(); page.children.slice().forEach(function (n) { n.remove(); }); }
  else { page = figma.createPage(); page.name = title; }
  var regular = await fontFor('Inter', 400), bold = await fontFor('Inter', 600);

  function frame(name, dir, gap, pad) {
    var f = figma.createFrame();
    f.name = name; f.layoutMode = dir; f.itemSpacing = gap;
    f.paddingTop = f.paddingBottom = f.paddingLeft = f.paddingRight = pad;
    f.primaryAxisSizingMode = 'AUTO'; f.counterAxisSizingMode = 'AUTO';
    f.fills = [];
    return f;
  }
  function label(chars, size, font, color) {
    var t = figma.createText();
    t.fontName = font || regular; t.fontSize = size || 12; t.characters = chars;
    if (color) t.fills = [color];
    return t;
  }
  function bound(variable) {
    return figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', variable);
  }
  var all = await figma.variables.getLocalVariablesAsync();
  function inCol(name) { var g = cols[name]; return g ? all.filter(function (v) { return v.variableCollectionId === g.col.id; }) : []; }
  var x = 0;
  function place(node) { page.appendChild(node); node.x = x; node.y = 0; x += node.width + 80; }

  // semantic colours, once per mode, each frame showing its mode
  var color = cols['Color'];
  if (color) {
    var semantic = inCol('Color');
    var canvas = semantic.find(function (v) { return v.name === 'bg/canvas'; });
    var fgDefault = semantic.find(function (v) { return v.name === 'fg/default'; });
    Object.keys(color.ids).forEach(function (mode) {
      var f = frame('Colour · ' + mode, 'VERTICAL', 6, 32);
      f.cornerRadius = 24;
      if (canvas) f.fills = [bound(canvas)];
      f.setExplicitVariableModeForCollection(color.col, color.ids[mode]);
      var head = label('Colour · ' + mode, 20, bold, fgDefault ? bound(fgDefault) : null);
      f.appendChild(head);
      semantic.forEach(function (v) {
        var row = frame(v.name, 'HORIZONTAL', 12, 0);
        row.counterAxisAlignItems = 'CENTER';
        if (v.name.indexOf('fg/') === 0) {
          var aa = label('Aa', 20, bold, bound(v));
          aa.textAutoResize = 'NONE'; aa.resize(56, 32); aa.textAlignHorizontal = 'CENTER'; aa.textAlignVertical = 'CENTER';
          row.appendChild(aa);
        } else {
          var sw = figma.createRectangle();
          sw.resize(56, 32); sw.cornerRadius = 8;
          if (v.name.indexOf('border/') === 0) { sw.fills = []; sw.strokes = [bound(v)]; sw.strokeWeight = 2; }
          else { sw.fills = [bound(v)]; sw.strokes = [{ type: 'SOLID', color: { r: 0.5, g: 0.5, b: 0.5 }, opacity: 0.25 }]; sw.strokeWeight = 1; }
          row.appendChild(sw);
        }
        row.appendChild(label(v.name, 13, regular, fgDefault ? bound(fgDefault) : null));
        f.appendChild(row);
      });
      place(f);
    });
  }

  // palettes
  var prims = inCol('Primitives').filter(function (v) { return v.resolvedType === 'COLOR'; });
  if (prims.length) {
    var pf = frame('Primitives', 'VERTICAL', 8, 32);
    pf.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]; pf.cornerRadius = 24;
    pf.appendChild(label('Primitives', 20, bold));
    var byPalette = {};
    prims.forEach(function (v) { var p = v.name.split('/')[1]; (byPalette[p] = byPalette[p] || []).push(v); });
    Object.keys(byPalette).forEach(function (p) {
      var row = frame(p, 'HORIZONTAL', 4, 0);
      row.counterAxisAlignItems = 'CENTER';
      var name = label(p, 12); name.resize(64, name.height); name.textAutoResize = 'HEIGHT';
      row.appendChild(name);
      byPalette[p].forEach(function (v) { var r = figma.createRectangle(); r.resize(40, 40); r.cornerRadius = 6; r.fills = [bound(v)]; r.name = v.name; row.appendChild(r); });
      pf.appendChild(row);
    });
    place(pf);
  }

  // text styles
  var names = Object.keys(madeText);
  if (names.length) {
    var tf = frame('Type', 'VERTICAL', 20, 32);
    tf.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]; tf.cornerRadius = 24;
    tf.appendChild(label('Type', 20, bold));
    for (var i = 0; i < names.length; i++) {
      var st = madeText[names[i]];
      var t = figma.createText();
      t.fontName = st.fontName;
      t.characters = names[i] + ' · The quick brown fox';
      await t.setTextStyleIdAsync(st.id);
      tf.appendChild(t);
    }
    place(tf);
  }

  // radius, spacing and elevation
  var size = inCol('Size');
  var sf = frame('Size and depth', 'VERTICAL', 16, 32);
  sf.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }]; sf.cornerRadius = 24;
  sf.appendChild(label('Radius, spacing and depth', 20, bold));
  size.forEach(function (v) {
    var row = frame(v.name, 'HORIZONTAL', 12, 0);
    row.counterAxisAlignItems = 'CENTER';
    var r = figma.createRectangle();
    r.fills = [{ type: 'SOLID', color: { r: 0.18, g: 0.42, b: 0.93 }, opacity: 0.2 }];
    if (v.name.indexOf('radius/') === 0) {
      r.resize(64, 40);
      ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'].forEach(function (k) { r.setBoundVariable(k, v); });
    } else {
      r.resize(40, 12);
      r.setBoundVariable('width', v);
    }
    row.appendChild(r);
    row.appendChild(label(v.name, 12));
    sf.appendChild(row);
  });
  var fxRow = frame('Elevation', 'HORIZONTAL', 32, 24);
  for (var key in madeFx) {
    if (key.indexOf('/Dark/') > 0) continue;
    var card = figma.createRectangle();
    card.resize(72, 56); card.cornerRadius = 12;
    card.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    card.name = key;
    await card.setEffectStyleIdAsync(madeFx[key].id);
    fxRow.appendChild(card);
  }
  sf.appendChild(fxRow);
  place(sf);

  await figma.setCurrentPageAsync(page);
  figma.viewport.scrollAndZoomIntoView(page.children);
}

main().catch(function (e) { figma.closePlugin('Stopped: ' + (e && e.message ? e.message : e)); });
`;
