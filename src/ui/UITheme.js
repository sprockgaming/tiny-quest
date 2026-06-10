// UITheme — Tiny Quest design system
// Kid-friendly color palette, font styles, and reusable UI helpers.

export const COLORS = {
  // Backgrounds
  bgDeep:       0x0D1B2A,
  bgMid:        0x1A2744,
  bgPanel:      0x12234A,
  bgCard:       0x1E3A6E,
  bgCardHover:  0x284D90,
  bgWood:       0x5D4037,
  bgWoodDark:   0x3E2723,

  // Borders / accents
  borderBlue:   0x4488CC,
  borderGold:   0xFFD700,
  borderGreen:  0x4CAF50,
  borderPurple: 0x9C27B0,

  // Text
  textGold:     0xFFD700,
  textWhite:    0xFFFFFF,
  textLight:    0xCCDDFF,
  textMuted:    0x8899BB,
  textGreen:    0x69F0AE,

  // Buttons
  btnGreen:     0x27AE60,
  btnGreenHov:  0x2ECC71,
  btnBlue:      0x1565C0,
  btnBlueHov:   0x1E88E5,
  btnPurple:    0x6A0DAD,
  btnPurpleHov: 0x8E24AA,
};

export const FONTS = {
  title: {
    fontSize: '38px',
    fontFamily: 'Arial Black, Impact, Arial',
    color: '#FFD700',
    stroke: '#3E1F00',
    strokeThickness: 6,
  },
  heading: {
    fontSize: '26px',
    fontFamily: 'Arial Black, Arial',
    color: '#FFD700',
    stroke: '#3E2723',
    strokeThickness: 4,
  },
  subheading: {
    fontSize: '20px',
    fontFamily: 'Arial Black, Arial',
    color: '#FFFFFF',
  },
  body: {
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    color: '#CCDDFF',
    lineSpacing: 4,
  },
  small: {
    fontSize: '13px',
    fontFamily: 'Arial, sans-serif',
    color: '#AABBCC',
  },
  hud: {
    fontSize: '15px',
    fontFamily: 'Arial Black, Arial',
    color: '#FFD700',
  },
  hudBody: {
    fontSize: '13px',
    fontFamily: 'Arial, sans-serif',
    color: '#DDEEFF',
  },
  speaker: {
    fontSize: '15px',
    fontFamily: 'Arial Black, Arial',
    color: '#FFD700',
  },
  dialog: {
    fontSize: '15px',
    fontFamily: 'Arial, sans-serif',
    color: '#FFFFFF',
    lineSpacing: 5,
  },
};

/**
 * Draw a rounded-rectangle panel using Phaser Graphics.
 * Returns the Graphics object (caller should add to scene).
 */
export function drawPanel(scene, x, y, w, h, opts = {}) {
  const {
    fill   = COLORS.bgPanel,
    alpha  = 0.96,
    border = COLORS.borderBlue,
    borderW = 3,
    radius  = 12,
  } = opts;

  const g = scene.add.graphics();
  g.fillStyle(fill, alpha);
  g.fillRoundedRect(x, y, w, h, radius);
  if (borderW > 0) {
    g.lineStyle(borderW, border, 1);
    g.strokeRoundedRect(x, y, w, h, radius);
  }
  return g;
}

/**
 * Create a styled button with background + label.
 * Returns { bg (Graphics), label (Text), container (Container) }.
 */
export function makeButton(scene, cx, cy, w, h, text, opts = {}) {
  const {
    fill     = COLORS.btnGreen,
    fillHov  = COLORS.btnGreenHov,
    border   = 0x1E8449,
    radius   = 10,
    fontSize = '20px',
    fontFamily = 'Arial Black, Arial',
    textColor  = '#FFFFFF',
    stroke     = '#145A32',
    strokeThickness = 3,
  } = opts;

  const container = scene.add.container(cx, cy);

  const bg = scene.add.graphics();
  const drawBg = (color) => {
    bg.clear();
    bg.fillStyle(color, 1);
    bg.fillRoundedRect(-w / 2, -h / 2, w, h, radius);
    bg.lineStyle(3, border, 1);
    bg.strokeRoundedRect(-w / 2, -h / 2, w, h, radius);
  };
  drawBg(fill);

  const label = scene.add.text(0, 0, text, {
    fontSize,
    fontFamily,
    color: textColor,
    stroke,
    strokeThickness,
  }).setOrigin(0.5);

  container.add([bg, label]);

  // Hit area
  const zone = scene.add.zone(0, 0, w, h)
    .setInteractive({ useHandCursor: true });
  container.add(zone);

  zone.on('pointerover', () => {
    drawBg(fillHov);
    scene.tweens.add({ targets: container, scaleX: 1.04, scaleY: 1.04, duration: 80 });
  });
  zone.on('pointerout', () => {
    drawBg(fill);
    scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 80 });
  });

  return { bg, label, container, zone };
}

/**
 * Scatter animated sparkle dots across a rectangle area.
 */
export function addSparkles(scene, count, x, y, w, h, colors = [0xFFD700, 0xFFFFFF, 0xADD8FF]) {
  for (let i = 0; i < count; i++) {
    const sx = x + Math.random() * w;
    const sy = y + Math.random() * h;
    const s = 1 + Math.random() * 2.5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const dot = scene.add.rectangle(sx, sy, s, s, color, 0.6 + Math.random() * 0.4);
    scene.tweens.add({
      targets: dot,
      alpha: 0,
      duration: 800 + Math.random() * 1600,
      yoyo: true,
      repeat: -1,
      delay: Math.random() * 2000,
    });
  }
}
