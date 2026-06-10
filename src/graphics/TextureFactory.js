// TextureFactory — pixel-art sprite generator
// All sprites use a 16×16 design grid rendered at 2×2 px per cell (→ 32×32 textures).
// Player walk spritesheets use 4 frames (→ 128×32).

export function createAllTextures(scene) {
  createTileTextures(scene);
  createPlayerTextures(scene);
  createNPCTextures(scene);
  createItemTextures(scene);
  createFlowerTextures(scene);
  createUITextures(scene);
}

// ─── Core Pixel-Art Renderer ────────────────────────────────────────────────
// palette : { char -> 0xRRGGBB }
// rows    : array of strings, each char is a palette key ('.' = transparent)
// ps      : pixel size in real pixels (default 2)
function px(scene, key, palette, rows, ps = 2) {
  const cols = rows[0].length;
  const rlen = rows.length;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  for (let r = 0; r < rlen; r++) {
    for (let c = 0; c < cols; c++) {
      const ch = rows[r][c];
      if (ch === '.' || ch === ' ') continue;
      const col = palette[ch];
      if (col === undefined) continue;
      g.fillStyle(col, 1);
      g.fillRect(c * ps, r * ps, ps, ps);
    }
  }
  g.generateTexture(key, cols * ps, rlen * ps);
  g.destroy();
}

// ─── Tile Textures (16×16 @ 2px = 32×32) ────────────────────────────────────

function createTileTextures(scene) {

  // GRASS
  px(scene, 'tile-grass', {
    G: 0x5A9A38, d: 0x4A8A28, l: 0x6AB848, D: 0x3A7020
  }, [
    'GGGGGGdGGGGGlGGG',
    'GlGGGGGGGdGGGGGG',
    'GGGdGGGGGGGlGGGG',
    'GGGGGlGGdGGGGGGG',
    'GdGGGGGGGGGGlGGG',
    'GGGGGGdGGGlGGGGG',
    'GGlGGGGGGGGGGdGG',
    'GGGGGdGGGGGGGGGl',
    'GGGGGGGlGGdGGGGG',
    'GdGGGGGGGGGGlGGG',
    'GGGGlGGGdGGGGGGG',
    'GGGGGGGGGGGlGGdG',
    'GlGGGdGGGGGGGGGG',
    'GGGGGGGlGGGGdGGG',
    'GGdGGGGGGGlGGGGG',
    'GGGGGGGGGGGGGGGGG',
  ]);

  // TREE (top-down canopy view)
  px(scene, 'tile-tree', {
    K: 0x0F2009, D: 0x1E4016, T: 0x2D5A20, L: 0x4A9A38,
    l: 0x5AB540, t: 0x6B4A1F, k: 0x4A3214, G: 0x3A7020
  }, [
    'KKKKKKKKKKKKKKKKK',
    'KDDDDDDDDDDDDDDDDK',
    'KDTTTTTTTTTTTTTTTDK',
    'KDTLLLLLLLLLLLLTDk',
    'KDTLLlLLLLLlLLLTDk',
    'KDTLLLLlLlLLLLLTDk',
    'KDTLlLLLLLLLlLLTDk',
    'KDTLLLLlLLLlLLLTDk',
    'KDTLLlLLLLLLLLLTDk',
    'KDTLLLLLlLlLLLLTDk',
    'KDTLLLLLLLLLLlLTDk',
    'KDTTLLlLLLLlLLTTDk',
    'KKDDTTTTTTTTTTDDKk',
    'KKKKKKKKKkKKKKKKKK',
    'GGGGGGGGGGGGGGGGGG',
    'GGGGGGGGGGGGGGGGGG',
  ]);

  // WATER  (two frames would need an atlas; this is a single polished static)
  px(scene, 'tile-water', {
    W: 0x1565C0, w: 0x1976D2, l: 0x42A5F5, d: 0x0D47A1, h: 0x90CAF9
  }, [
    'dWWWWWWWWWWWWWWWd',
    'WwwwwwwwwwwwwwwWW',
    'WwllllWWwwllllwwW',
    'WwlhhllwwlhhlllwW',
    'WwllllwWwwllllwwW',
    'WwwwwwwwwwwwwwwwW',
    'WwwwllllwwwwllllW',
    'Wwwlhhlllwwlhhllw',
    'Wwwlllllwwwlllllw',
    'WwwwwwwwwwwwwwwwW',
    'WwllllwwwwwllllwW',
    'WwlhhlwwwwlhhlwwW',
    'WwllllwwwwwllllwW',
    'WwwwwwwwwwwwwwwwW',
    'WwwwwwwwwwwwwwwwW',
    'dWWWWWWWWWWWWWWWd',
  ]);

  // PATH (dirt)
  px(scene, 'tile-path', {
    P: 0xA07850, p: 0x8C6840, l: 0xB88860, d: 0x7A5030, k: 0x5A3A1A
  }, [
    'PPPPPlPPPPPPPPPPP',
    'PpPPPPPPPlPPPPPpP',
    'PPPPdPPPPPPPdPPPP',
    'PlPPPPPPPPPPPPlPP',
    'PPPPPPdPPPPlPPPPP',
    'PPdPPlPPPPPPPPPdP',
    'PPPPPPPPPdPPPPPPP',
    'PlPPPPPlPPPPdPPPP',
    'PPPdPPPPPPPPPPPlP',
    'PPPPPPlPPdPPPPPPP',
    'PdPPPPPPPPPPlPPdP',
    'PPPPPdPPPPPPPPPPP',
    'PlPPPPPPPdPPPlPPP',
    'PPPPPPPlPPPPPPPdP',
    'PPdPPPPPPPPlPPPPP',
    'PPPPPlPPPdPPPPPPP',
  ]);

  // FENCE
  px(scene, 'tile-fence', {
    G: 0x5A9A38, g: 0x4A8A28, F: 0x9B7349, f: 0x7B5329, k: 0x4A3010
  }, [
    'GGGGGkGGGGGGkGGGG',
    'GGGGGfGGGGGGfGGGG',
    'GGGGGfGGGGGGfGGGG',
    'GGGGGFGGGGGGFGGGG',
    'GGGGGFGGGGGGFGGGG',
    'kfFFFFFFFFFFFFFFk',
    'kfFFFFFFFFFFFFFFk',
    'GGGGGFGGGGGGFGGGg',
    'GGGGGFGGGGGGFGGGg',
    'GGgGGFGGGGGGFGGGg',
    'GGGGGFGGGGGGFGGGg',
    'kfFFFFFFFFFFFFFFFk',
    'kfFFFFFFFFFFFFFFFk',
    'GGGGGFGGGGGGFGGGg',
    'GGGGGfGGGGGGfGGGg',
    'GGGGGkGGGGGGkGGGg',
  ]);

  // BUILDING (stone wall)
  px(scene, 'tile-building', {
    W: 0x757575, w: 0x8E8E8E, D: 0x616161, d: 0x4A4A4A,
    B: 0x1565C0, b: 0x5C99D4, G: 0x9E9E9E, h: 0xBDBDBD
  }, [
    'dDDDDDDDDDDDDDDDd',
    'DWWWWWWWWWWwWWWWD',
    'DWwwwwwwwwwwwwwWD',
    'DWwbbbbbbbbbwwwWD',
    'DWwbBBBBBBBbwwwWD',
    'DWwbBBBBBBBbwwwWD',
    'DWwbbbbbbbbbwwwWD',
    'DdddddddddddddddD',
    'DWWhhWWWWWWWhhWWD',
    'DWWhhWWWWWWWhhWWD',
    'DdddddddddddddddD',
    'DWWWWWWWWWWWWwwWD',
    'DWWWWWWWWWWWWwwWD',
    'DWwwwwwwwwwwwwwWD',
    'DWwwwwwwwwwwwwwWD',
    'dDDDDDDDDDDDDDDDd',
  ]);

  // ROCK
  px(scene, 'tile-rock', {
    G: 0x5A9A38, g: 0x4A8A28, R: 0x90A4AE, r: 0x78909C,
    d: 0x546E7A, D: 0x37474F, h: 0xB0BEC5, H: 0xCFD8DC
  }, [
    'GGGGGGGGGGGGGGGGG',
    'GGGGGDDDDDDDGGGGg',
    'GGGGDrrrrrrrDGGGg',
    'GGGDrrRRRRRrrDGGg',
    'GGDrrRHHhhRrrDGGg',
    'GGDrrRHHhhRrrDGGg',
    'GGDrrRRRRRrrrDGgg',
    'GGGDrrrrrrrrDGGGg',
    'GGGGDdddddddDGGGg',
    'GGGGGDDDDDDDGGGGg',
    'GGGGGGGGGGGGGGGGG',
    'GGGGGGGGGGGGGGGGg',
    'GGgGGGGGGGGGGGgGg',
    'GGGGGGGGGGGGGGGGg',
    'GGgGGGGGGGGGGGGgg',
    'GGGGGGGGGGGGGGggg',
  ]);

  // TALL GRASS
  px(scene, 'tile-tallgrass', {
    G: 0x5A9A38, g: 0x4A8A28, T: 0x3A7A28, t: 0x2A6A18, l: 0x6ABE48
  }, [
    'GGGGGGGGGGGGGGGGG',
    'GtGGGGtGGGGtGGGtG',
    'GtGGGGtGGGGtGGGtG',
    'GTGGGGTGGGGTGGGTG',
    'GTlGGGTlGGGTlGGTl',
    'GTlGGGTlGGGTlGGTl',
    'GTllGGTllGGTllGTll',
    'GTlllGTlllGTlllTll',
    'GGTllGGTllGGTllGTl',
    'GGGTGGGTGGGGTGGGT',
    'GGGGGGGGGGGGGGGGG',
    'GtGGGtGGGGtGGGtGG',
    'GTGGGTGGGGTGGGTGG',
    'GTlGGTlGGGTlGGTlG',
    'GTllGGTllGGTllGTll',
    'GGGGGGGGGGGGGGGGG',
  ]);

  // STONE FLOOR
  px(scene, 'tile-stone', {
    S: 0xBDBDBD, s: 0xA0A0A0, d: 0x888888, D: 0x707070, h: 0xD8D8D8, H: 0xEEEEEE
  }, [
    'DdddddddDdddddddD',
    'dSSSSSSSSSSSSSSSSd',
    'dShHHHHSSSSHHHHhsd',
    'dSHhhhhHSSSHhhhhHsd',
    'dSHhhhhHSSSHhhhhHsd',
    'dShHHHHSSSSHHHHhsd',
    'dSSSSSSSSSSSSSSSSd',
    'DdddddddDdddddddD',
    'DdddddddDdddddddD',
    'dSSSSSSSSSSSSSSSSd',
    'dShHHHHSSSSHHHHhsd',
    'dSHhhhhHSSSHhhhhHsd',
    'dSHhhhhHSSSHhhhhHsd',
    'dShHHHHSSSSHHHHhsd',
    'dSSSSSSSSSSSSSSSSd',
    'DdddddddDdddddddD',
  ]);
}

// ─── Player Spritesheet (4 frames × 32×32 = 128×32) ─────────────────────────
// Frames: 0=idle, 1=walk-A, 2=walk-B, 3=walk-C (legs alternate)

function drawPlayerFrame(g, ox, frame, bodyCol, darkCol, lightCol, helmetA, helmetB, extraFn) {
  // Each frame drawn offset by ox pixels horizontally
  // Design is 16x16 grid at 2px per cell → 32px wide, starting at ox

  const P = 2; // pixel size
  function cell(c, r, col) {
    g.fillStyle(col, 1);
    g.fillRect(ox + c * P, r * P, P, P);
  }

  // ── Outline color
  const OUT = 0x111111;
  const SKIN = 0xFFCC80;
  const SKIND = 0xE6A050;
  const PANTS = 0x283593;
  const PANTSD = 0x1A237E;
  const BOOT = 0x3E2723;
  const BOOTD = 0x212121;

  // ── Leg positions vary per frame
  // leg offset in columns from center
  let lLegOfs = 0, rLegOfs = 0; // y offsets
  let lFootX = 5, rFootX = 9;
  let lFootY = 14, rFootY = 14;

  if (frame === 1) { lFootY = 13; rFootY = 15; lFootX = 4; rFootX = 10; }
  if (frame === 2) { lFootY = 14; rFootY = 14; }
  if (frame === 3) { lFootY = 15; rFootY = 13; lFootX = 4; rFootX = 10; }

  // ── Helmet / hat (rows 0–4)
  if (helmetA) {
    // Helmet outline
    const hcells = [
      [4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[11,0],
      [3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[11,1],[12,1],
      [3,2],[12,2],[3,3],[12,3],[3,4],[12,4],
    ];
    hcells.forEach(([c,r]) => cell(c, r, OUT));

    // Helmet fill
    for (let r = 1; r <= 4; r++) {
      for (let c = 4; c <= 11; c++) {
        cell(c, r, helmetA);
      }
    }
    // Visor
    [[5,2],[6,2],[9,2],[10,2],[5,3],[6,3],[9,3],[10,3]].forEach(([c,r]) => cell(c,r,helmetB));
    // Highlight
    [[4,1],[5,1]].forEach(([c,r]) => cell(c,r,lightCol));
  }

  // ── Face / head (rows 4–6)
  // head outline
  [[3,4],[12,4],[3,5],[12,5],[3,6],[12,6]].forEach(([c,r]) => cell(c,r,OUT));
  for (let r = 4; r <= 6; r++) for (let c = 4; c <= 11; c++) cell(c, r, SKIN);
  // Eyes
  [[5,5],[6,5]].forEach(([c,r]) => cell(c,r,0x2C3E50));
  [[9,5],[10,5]].forEach(([c,r]) => cell(c,r,0x2C3E50));
  // Smile
  [[6,6],[7,6],[8,6],[9,6]].forEach(([c,r]) => cell(c,r,SKIND));

  // ── Body / armor (rows 7–11)
  [[2,7],[13,7],[2,8],[13,8],[2,9],[13,9],[2,10],[13,10],[2,11],[13,11]].forEach(([c,r]) => cell(c,r,OUT));
  for (let r = 7; r <= 11; r++) for (let c = 3; c <= 12; c++) cell(c, r, bodyCol);
  // Body shading right side
  for (let r = 7; r <= 11; r++) for (let c = 11; c <= 12; c++) cell(c, r, darkCol);
  // Body highlight left side
  for (let r = 7; r <= 9; r++) cell(3, r, lightCol);

  // ── Arms (rows 7–10) - flank the body
  for (let r = 7; r <= 10; r++) { cell(1, r, OUT); cell(2, r, bodyCol); }
  for (let r = 7; r <= 10; r++) { cell(14, r, OUT); cell(13, r, darkCol); }
  // Hands
  [[1,10],[2,10]].forEach(([c,r]) => cell(c,r,SKIN));
  [[13,10],[14,10]].forEach(([c,r]) => cell(c,r,SKIN));

  // ── Belt (row 11)
  for (let c = 3; c <= 12; c++) cell(c, 11, darkCol);
  cell(7, 11, 0xFFD700); cell(8, 11, 0xFFD700); // belt buckle

  // ── Legs (rows 12–15) - vary by frame
  // Left leg
  const leftLegY = lFootY;
  for (let r = 12; r <= leftLegY; r++) {
    cell(lFootX, r, OUT);
    cell(lFootX+1, r, PANTS);
    cell(lFootX+2, r, PANTSD);
    cell(lFootX+3, r, OUT);
  }
  // Left boot
  cell(lFootX, leftLegY, BOOT);
  cell(lFootX+1, leftLegY, BOOTD);
  cell(lFootX+2, leftLegY, BOOT);
  cell(lFootX+3, leftLegY, BOOTD);

  // Right leg
  const rightLegY = rFootY;
  for (let r = 12; r <= rightLegY; r++) {
    cell(rFootX, r, OUT);
    cell(rFootX+1, r, PANTSD);
    cell(rFootX+2, r, PANTS);
    cell(rFootX+3, r, OUT);
  }
  // Right boot
  cell(rFootX, rightLegY, BOOTD);
  cell(rFootX+1, rightLegY, BOOT);
  cell(rFootX+2, rightLegY, BOOTD);
  cell(rFootX+3, rightLegY, BOOT);

  // ── Extra detail (cape, staff, bow, etc.)
  if (extraFn) extraFn(cell, frame);

  // ── Shadow
  for (let c = 3; c <= 12; c++) {
    g.fillStyle(0x000000, 0.25);
    g.fillRect(ox + c * P, 15 * P + 1, P, 2);
  }
}

function createPlayerTextures(scene) {
  const HEROES = [
    {
      key: 'player-knight',
      bodyCol: 0xC62828, darkCol: 0x7F0000, lightCol: 0xEF9A9A,
      helmetA: 0xB0BEC5, helmetB: 0x37474F,
      extra: (cell, frame) => {
        // Shield on left arm
        [7,8,9,10].forEach(r => { cell(0, r, 0x1565C0); });
        cell(0, 7, 0x1E88E5); // highlight
      }
    },
    {
      key: 'player-mage',
      bodyCol: 0x6A1B9A, darkCol: 0x38006B, lightCol: 0xCE93D8,
      helmetA: 0x4A148C, helmetB: 0x7B1FA2,
      extra: (cell, frame) => {
        // Pointed hat extension
        cell(7, 0, 0x4A148C); cell(8, 0, 0x4A148C);
        // Staff on right
        [5,6,7,8,9,10,11,12,13].forEach(r => cell(15, r, 0xA1887F));
        cell(14, 5, 0xFFD54F); cell(15, 4, 0xFFD54F);
      }
    },
    {
      key: 'player-archer',
      bodyCol: 0x2E7D32, darkCol: 0x1B5E20, lightCol: 0xA5D6A7,
      helmetA: 0x1B5E20, helmetB: 0x2E7D32,
      extra: (cell, frame) => {
        // Bow
        [6,7,8,9,10].forEach(r => cell(0, r, 0x795548));
        cell(1, 5, 0xFFCC80); cell(1, 10, 0xFFCC80);
      }
    },
    {
      key: 'player-healer',
      bodyCol: 0xF9A825, darkCol: 0xE65100, lightCol: 0xFFF9C4,
      helmetA: 0xFFD54F, helmetB: 0xFFF9C4,
      extra: (cell, frame) => {
        // Cross on chest
        cell(7, 8, 0xFFFFFF); cell(8, 8, 0xFFFFFF);
        cell(7, 9, 0xFFFFFF); cell(8, 9, 0xFFFFFF);
        cell(6, 9, 0xFFFFFF); cell(9, 9, 0xFFFFFF);
        // Halo
        [4,5,6,7,8,9,10,11].forEach(c => cell(c, 0, 0xFFD700));
      }
    },
  ];

  for (const hero of HEROES) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    for (let frame = 0; frame < 4; frame++) {
      drawPlayerFrame(g, frame * 32, frame, hero.bodyCol, hero.darkCol, hero.lightCol,
        hero.helmetA, hero.helmetB, hero.extra);
    }
    g.generateTexture(hero.key, 128, 32);
    g.destroy();

    // Register individual frames so Phaser's animation system can reference them
    const tex = scene.textures.get(hero.key);
    for (let i = 0; i < 4; i++) {
      tex.add(i, 0, i * 32, 0, 32, 32);
    }
  }
}

// ─── NPC Textures (16×16 @ 2px = 32×32) ─────────────────────────────────────

function createNPCTextures(scene) {

  // Farmer Bob — straw hat, overalls, ruddy face, mustache
  px(scene, 'npc-farmer', {
    k: 0x111111, H: 0xF9A825, h: 0xFFC107, s: 0xFFAD72, S: 0xD4804A,
    B: 0x1565C0, b: 0x0D47A1, O: 0xE8C99A, o: 0xC8A97A,
    A: 0xF57F17, a: 0xE65100, M: 0x795548, G: 0x3E2723
  }, [
    '....kHHHHHHHk....',
    '...kHhhhhhhhHk...',
    '...kHHHHHHHHHk...',
    '....kssssssssk...',
    '...ksSSSSSSSsSk..',
    '...ksSssssssSsk..',
    '...ksMMMMMMSSsk..',  // mustache row
    '..kOOOOOOOOOOOk..',
    '..kBBBBBBBBBBBk..',
    '..kBbOobBOobBBk..',  // overalls straps
    '..kBBBBBBBBBBBk..',
    '..kBbbbBBbbbBBk..',
    '..kGGGG..GGGGGk..',
    '..kGggg..GgggGk..',
    '....GG....GGG...',
    '.................',
  ]);

  // Portrait — Farmer Bob (48×48) using 24x24 @ 2px
  px(scene, 'portrait-farmer', {
    k: 0x111111, G: 0x558B2F, g: 0x33691E,
    s: 0xFFAD72, S: 0xD4804A, e: 0x795548,
    H: 0xF9A825, h: 0xFFC107, M: 0x795548,
    A: 0xF57F17
  }, [
    'kkkkkkkkkkkkkkkkkkkkkkk',
    'kGGGGGGGGGGGGGGGGGGGGGk',
    'kGGkHHHHHHHHHHHHHHkGGGk',
    'kGGkHHhhhhhhhhhhhHkGGGk',
    'kGGkHHHHHHHHHHHHHHkGGGk',
    'kGGkHHHHHHHHHHHHHHkGGGk',
    'kGGkkkHHHHHHHHHHkkkGGGk',
    'kGGGGGkssssssssskGGGGGk',
    'kGGGGGksSSSSSSSSkGGGGGk',
    'kGGGGGksSsssssSSkGGGGGk',
    'kGGGGGksSSSSSSSSkGGGGGk',
    'kGGGGGksSSSSSSSSkGGGGGk',
    'kGGGGGksMMMMMMMSkGGGGGk',
    'kGGGGGksssssssssk GGGGk',
    'kGGGGkAAAAAAAAAAAAAGGGk',
    'kGGGkAAAAAAAAAAAAAAAAGk',
    'kGGGkAAAAAAAAAAAAAAAAGk',
    'kGGGkAAAAAAAAAAAAAAAAGk',
    'kGGGkAAAAAAAAAAAAAAAAGk',
    'kGGGkAAAAAAAAAAAAAAAAGk',
    'kGGkAAAAAAAAAAAAAAAAAAk',
    'kGGkAAAAAAAAAAAAAAAAAAk',
    'kkkkkkkkkkkkkkkkkkkkkk',
  ]);

  // Gardener Lily — flower crown, green dress, hair
  px(scene, 'npc-gardener', {
    k: 0x111111, F: 0xE91E63, f: 0xC2185B, Y: 0xFFD54F, y: 0xFFC107,
    s: 0xFFD599, S: 0xD4AB6A, H: 0x5D4037, h: 0x3E2723,
    G: 0x558B2F, g: 0x33691E, D: 0x33691E, B: 0x33691E
  }, [
    '..kFkYkFkYkFk.....',  // flower crown
    '..kFFFYFFFYFk.....',
    '...kHHHHHHHk......',
    '..kHHHsssHHHk.....',
    '..kHkssSSskkHk....',
    '..kHksssssskHk....',
    '..kHHkkHHkkHHk....',
    '...kssssssssk.....',
    '...kGGGGGGGGk.....',
    '...kGgGgGgGGk.....',
    '...kGGGGGGGGk.....',
    '...kGGGGGGGGk.....',
    '...kHHHkkHHHk.....',
    '...khhhhhhhhk.....',
    '....kHkkkkHk......',
    '.................',
  ]);

  // Portrait — Gardener Lily (48×48) using 24x24 @ 2px
  px(scene, 'portrait-gardener', {
    k: 0x111111, G: 0xA5D6A7, g: 0x66BB6A,
    s: 0xFFD599, S: 0xD4AB6A, H: 0x5D4037,
    F: 0xE91E63, Y: 0xFFD54F, D: 0x558B2F
  }, [
    'kkkkkkkkkkkkkkkkkkkkkkk',
    'kGGGGGGGGGGGGGGGGGGGGGk',
    'kGGGkFkYkFkYkFkYkFkGGGk',
    'kGGkFFFYFFFYFFFYFFFkGGk',
    'kGGGkHHHHHHHHHHHHkGGGGk',
    'kGGkHHHHsssssHHHHHkGGGk',
    'kGGkHHkssSSSSsskHHkGGGk',
    'kGGkHHkssSSSSSSkHHkGGGk',
    'kGGkHHkssSSSSsskHHkGGGk',
    'kGGkHHkssSSSSsskHHkGGGk',
    'kGGkHHHkkkHHkkkHHHkGGGk',
    'kGGGksssssssssssskGGGGk',
    'kGGGksssssssssssskGGGGk',
    'kGGGGkDDDDDDDDDDkGGGGGk',
    'kGGGkDDDDDDDDDDDDkGGGGk',
    'kGGGkDDDDDDDDDDDDkGGGGk',
    'kGGGkDDDDDDDDDDDDkGGGGk',
    'kGGGkDDDDDDDDDDDDkGGGGk',
    'kGGGkDDDDDDDDDDDDkGGGGk',
    'kGGGkDDDDDDDDDDDDkGGGGk',
    'kGGkDDDDDDDDDDDDDDkGGGk',
    'kGGkDDDDDDDDDDDDDDkGGGk',
    'kkkkkkkkkkkkkkkkkkkkkk',
  ]);

  // Forest Spirit — glowing ethereal
  px(scene, 'npc-spirit', {
    k: 0x111111, B: 0x29B6F6, b: 0x0288D1, W: 0xE1F5FE, w: 0xB3E5FC,
    E: 0x0D47A1, G: 0xFFD54F, g: 0xFFF176, A: 0x40C4FF
  }, [
    '....kAAAAAAAAk...',
    '...kAbBBBBBBBAk..',
    '..kAbBWWWWWBBAbk.',
    '.kAbBWWwwwwWBBbk.',
    '.kABWWwwwwwWWBbk.',
    '.kABWWwEEEwWWBbk.',
    '.kABWWwEEEwWWBbk.',
    '.kABWWwwwwwWWBbk.',
    '.kABWWWwwwWWWBbk.',
    '..kAbBWWWWWBBAk..',
    '...kAbBBBBBBAbk..',
    '....kGGGGGGGk....',
    '...kGggggggggk...',
    '..kGggGGGGGgggk..',
    '...kGGGGGGGGGk...',
    '.................',
  ]);

  // Portrait — Forest Spirit (48×48) using 24x24 @ 2px
  px(scene, 'portrait-spirit', {
    k: 0x111111, D: 0x0D2137, d: 0x1A3A5C,
    B: 0x29B6F6, b: 0x0288D1, W: 0xE1F5FE, w: 0xB3E5FC,
    E: 0x0D47A1, G: 0xFFD54F, A: 0x40C4FF
  }, [
    'kkkkkkkkkkkkkkkkkkkkkkk',
    'kDDDDDDDDDDDDDDDDDDDDDk',
    'kDDDDDDDDDDDDDDDDDDDDDk',
    'kDDkGGGGGGGGGGGGGGGkDDk',
    'kDDkGGGGGGGGGGGGGGGkDDk',
    'kDDkGGGGDDDDDDDGGGGkDDk',
    'kDDkGGDkAAAAAAAAAkDGGkDk',
    'kDDkGDkABBBBBBBBBAkDGkDk',
    'kDDkGkABBWWWWWWBBBAkGkDk',
    'kDDkGkABWWwwwwwWWBAkGkDk',
    'kDDkGkABWwwEEEwwWBAkGkDk',
    'kDDkGkABWwwEEEwwWBAkGkDk',
    'kDDkGkABWwwEEEwwWBAkGkDk',
    'kDDkGkABWWwwwwwWWBAkGkDk',
    'kDDkGDkABBWWWWWBBAkDGkDk',
    'kDDkGGDkAAAAAAAAAAAkGGkDk',
    'kDDkGGGDkkkkkkkkkkDGGGkDk',
    'kDDkGGGGDDDDDDDDDDGGGGkDk',
    'kDDDDDDDDDDDDDDDDDDDDDDk',
    'kDDDDDDDDDDDDDDDDDDDDDDk',
    'kDDDDDDDDDDDDDDDDDDDDDDk',
    'kDDDDDDDDDDDDDDDDDDDDDDk',
    'kkkkkkkkkkkkkkkkkkkkkkk',
  ]);
}

// ─── Item Textures ───────────────────────────────────────────────────────────

function createItemTextures(scene) {
  // Seed bag (12×12 @ 2px = 24×24)
  px(scene, 'item-seed', {
    k: 0x111111, B: 0x8D6E63, b: 0x6D4C41, Y: 0xFFCC02, y: 0xF9A825,
    S: 0x827717, s: 0x9E9D24
  }, [
    '....kYYYYYk.....',
    '...kYyyyyyYk....',
    '..kYyyYYYyyYk...',
    '..kBBBBBBBBBk...',
    '.kBbbbbbbbbbBk..',
    '.kBbSSbbbSSbBk..',
    '.kBbbsSbsSbbbBk.',
    '.kBbbbSSSSbbBk..',
    '.kBbbbbbbbbBk...',
    '..kBBBBBBBBk....',
    '...kbbbbbk......',
    '................',
  ], 2);

  // Collected star (8×8 @ 2px = 16×16)
  px(scene, 'item-star', {
    k: 0x111111, Y: 0xFFD700, y: 0xFFF176, W: 0xFFFFFF
  }, [
    '..kYYkk....',
    '.kYyyy Yk..',
    'kYyyyyyy Yk',
    'kYyyWWyyYk.',
    '.kYyyWyYk..',
    '..kYYYk....',
    '..kYYk.....',
    '.kYyyy k...',
  ], 2);
}

// ─── Flower Textures (14×14 @ 2px = 28×28) ───────────────────────────────────

function createFlowerTextures(scene) {
  const defs = [
    { key: 'flower-red',    petal: 0xE53935, shadow: 0xB71C1C, center: 0xFFD740, cShadow: 0xF9A825 },
    { key: 'flower-yellow', petal: 0xFFEB3B, shadow: 0xF9A825, center: 0xFF6D00, cShadow: 0xE65100 },
    { key: 'flower-blue',   petal: 0x1E88E5, shadow: 0x1565C0, center: 0xFFFFFF, cShadow: 0xE0E0E0 },
    { key: 'flower-green',  petal: 0x43A047, shadow: 0x2E7D32, center: 0xFFD740, cShadow: 0xF9A825 },
    { key: 'flower-purple', petal: 0xAB47BC, shadow: 0x7B1FA2, center: 0xFFFFFF, cShadow: 0xE0E0E0 },
  ];

  for (const def of defs) {
    const p = { k: 0x111111, P: def.petal, p: def.shadow, C: def.center, c: def.cShadow, G: 0x388E3C, g: 0x2E7D32, L: 0x66BB6A };

    // Normal flower
    px(scene, def.key, p, [
      '.....kPPPk.....',
      '....kPPPPPk....',
      '....kPpPPPk....',
      '.kPPkCCCCCkPPk.',
      'kPPPpkCcCCkpPPk',
      'kPPPppkCCCkppPk',
      '.kPPkCCCCCkPPk.',
      '....kPPPPPk....',
      '....kPPPPPk....',
      '.....kPPPk.....',
      '......kGk......',
      '.....kGGGk.....',
      '...kLGGGGGLk...',
      '....kGGGGGk....',
    ], 2);

    // Bloomed flower (larger, glowing)
    const pb = { k: 0x111111, P: def.petal, p: def.shadow, C: def.center, c: def.cShadow, G: 0x388E3C, g: 0x2E7D32, L: 0x76FF03, W: 0xFFFFFF };
    px(scene, def.key + '-bloom', pb, [
      '..kLkPPPPPkLk..',
      '.kLLkPPPPPkLLk.',
      'kLLPPkPpPkPPLLk',
      'kLPPPkCCCkPPPLk',
      'kLPPpkCcCkpPPLk',
      'kLPPppkCCkppPLk',
      'kLPPPkCCCkPPPLk',
      'kLLPPkPpPkPPLLk',
      '.kLLkPPPPPkLLk.',
      '..kLkPPPPPkLk..',
      '......kGk......',
      '.....kGGGk.....',
      '...kLGGGGGLk...',
      '....kGGGGGk....',
    ], 2);
  }

  // Hint sign background (64×36) — drawn via rectangle, no px() needed
  // Keep simple programmatic version
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xFFD54F); g.fillRect(0, 0, 64, 36);
    g.fillStyle(0xF9A825); g.fillRect(1, 1, 62, 34);
    g.lineStyle(2, 0x5D4037); g.strokeRect(0, 0, 64, 36);
    g.generateTexture('hint-sign-bg', 64, 36); g.destroy();
  }
}

// ─── UI Textures ─────────────────────────────────────────────────────────────

function createUITextures(scene) {
  // Big star for reward screen (28×28 @ 2px = 56×56)
  px(scene, 'star-big', {
    k: 0x111111, Y: 0xFFD700, y: 0xFFF176, W: 0xFFF9C4, d: 0xF9A825
  }, [
    '...........k........',
    '..........kYk.......',
    '.........kYYYk......',
    '........kYYYYYk.....',
    'kkkkkkkkkYYYYYYkkkkk',
    'kYYYYYYYYYYYYYYYYYk',
    'kYYYyYYYYYYYYYyYYYk',
    'kYYYyyYYYYYYYyyYYYk',
    '.kYYYyyyYYYyyyYYYk.',
    '..kYYYYyyyyyyyYYYk..',
    '...kYYYYYyyyYYYYk...',
    '..kYYYYyyyyyyyYYYk..',
    '.kYYYyyyYYYyyyYYYk.',
    'kYYYyyYYYYYYYyyYYYk',
    'kYYYyYYYYYYYYYyYYYk',
    'kYYYYYYYYYYYYYYYYYk',
    'kkkkkkkkkYYYYYYkkkkk',
    '........kYYYYYk.....',
    '.........kYYYk......',
    '..........kYk.......',
  ], 2);

  // 1×1 utility pixel
  {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x8D6E63, 0.95); g.fillRect(0, 0, 1, 1);
    g.generateTexture('pixel-1x1', 1, 1); g.destroy();
  }
}
