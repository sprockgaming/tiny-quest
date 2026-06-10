import Phaser from 'phaser';
import { COLORS, FONTS, addSparkles, drawPanel } from '../ui/UITheme';

const SLIDES = [
  {
    icon: '🗺️',
    title: 'Welcome to Tiny Quest!',
    lines: [
      'You are a brave young hero on a magical adventure.',
      'Complete quests, help villagers, and earn ⭐ stars!',
      'The more stars you collect, the greater your legend!',
    ],
  },
  {
    icon: '🕹️',
    title: 'How to Move',
    lines: [
      'Use the  ↑ ↓ ← →  arrow keys to walk around.',
      'Or use  W A S D  on your keyboard.',
      'Explore every corner — secrets are hiding everywhere!',
    ],
    keys: ['↑', '↓', '←', '→'],
  },
  {
    icon: '💬',
    title: 'Talk to Characters',
    lines: [
      'Walk up to a character and press  E  to talk.',
      'You can also tap / click on them.',
      'NPCs give you quests, hints, and rewards!',
    ],
    keys: ['E'],
  },
  {
    icon: '📋',
    title: 'The Quest Board',
    lines: [
      'The Quest Board shows all your adventures.',
      'Pick a quest, complete the challenge, and earn stars.',
      'Finished quests glow green — try to complete them all!',
    ],
  },
  {
    icon: '⭐',
    title: 'Earning Stars',
    lines: [
      'Each quest rewards you with up to 3 ⭐ stars.',
      'Stars show how amazing an adventurer you are.',
      'Collect ALL stars to become the Tiny Quest Champion!',
    ],
  },
];

export default class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Tutorial' });
  }

  init(data) {
    this._returnTo = data.returnTo || 'Title';
    this._currentSlide = 0;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.cameras.main.fadeIn(300, 0, 0, 0);

    // Background
    this.add.rectangle(0, 0, W, H, COLORS.bgDeep).setOrigin(0, 0);
    addSparkles(this, 30, 0, 0, W, H, [0xFFFFFF, 0xBBDDFF]);

    // Header bar
    const headerBg = this.add.graphics();
    headerBg.fillStyle(COLORS.bgPanel, 0.95);
    headerBg.fillRect(0, 0, W, 52);
    headerBg.lineStyle(2, COLORS.borderBlue, 1);
    headerBg.strokeRect(0, 0, W, 52);

    this.add.text(W / 2, 26, '📖  How to Play', {
      ...FONTS.heading,
      fontSize: '22px',
    }).setOrigin(0.5);

    // Close button
    const closeBtn = this.add.text(W - 14, 26, '✕', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#778899',
      backgroundColor: '#ffffff11',
      padding: { x: 6, y: 2 },
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerover', () => closeBtn.setStyle({ color: '#FFFFFF' }));
    closeBtn.on('pointerout',  () => closeBtn.setStyle({ color: '#778899' }));
    closeBtn.on('pointerdown', () => this._goBack());

    // Slide panel
    const panelX = 40;
    const panelY = 68;
    const panelW = W - 80;
    const panelH = H - 68 - 80;

    this._panelGfx = this.add.graphics();
    this._drawPanel(panelX, panelY, panelW, panelH);

    // Slide content container
    this._slideContainer = this.add.container(0, 0);

    // Navigation dots
    this._dots = [];
    const dotY = H - 52;
    const dotSpacing = 22;
    const dotsStartX = W / 2 - (SLIDES.length * dotSpacing) / 2 + dotSpacing / 2;

    SLIDES.forEach((_, i) => {
      const dot = this.add.circle(dotsStartX + i * dotSpacing, dotY, 7, COLORS.btnBlue)
        .setStrokeStyle(2, COLORS.borderBlue)
        .setInteractive({ useHandCursor: true });
      dot.on('pointerdown', () => this._goToSlide(i));
      this._dots.push(dot);
    });

    // Prev button
    const prevBtn = this.add.text(panelX, H - 52, '◀', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#556677',
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });
    prevBtn.on('pointerover', () => prevBtn.setStyle({ color: '#AABBCC' }));
    prevBtn.on('pointerout',  () => prevBtn.setStyle({ color: '#556677' }));
    prevBtn.on('pointerdown', () => this._goToSlide(this._currentSlide - 1));

    // Next / Done button
    this._nextBtn = this.add.text(panelX + panelW, H - 52, 'Next ▶', {
      fontSize: '18px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      stroke: '#3E2723',
      strokeThickness: 3,
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    this._nextBtn.on('pointerover', () => this._nextBtn.setStyle({ color: '#FFFFFF' }));
    this._nextBtn.on('pointerout',  () => this._nextBtn.setStyle({ color: '#FFD700' }));
    this._nextBtn.on('pointerdown', () => {
      if (this._currentSlide < SLIDES.length - 1) {
        this._goToSlide(this._currentSlide + 1);
      } else {
        this._goPlay();
      }
    });

    // Keyboard navigation
    this.input.keyboard.on('keydown-RIGHT', () => {
      if (this._currentSlide < SLIDES.length - 1) this._goToSlide(this._currentSlide + 1);
    });
    this.input.keyboard.on('keydown-LEFT', () => {
      if (this._currentSlide > 0) this._goToSlide(this._currentSlide - 1);
    });
    this.input.keyboard.on('keydown-ENTER', () => {
      if (this._currentSlide < SLIDES.length - 1) this._goToSlide(this._currentSlide + 1);
      else this._goPlay();
    });
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this._currentSlide < SLIDES.length - 1) this._goToSlide(this._currentSlide + 1);
      else this._goPlay();
    });

    this._panelX = panelX;
    this._panelY = panelY;
    this._panelW = panelW;
    this._panelH = panelH;

    this._showSlide(0, false);
  }

  _drawPanel(x, y, w, h) {
    this._panelGfx.clear();
    this._panelGfx.fillStyle(COLORS.bgPanel, 0.94);
    this._panelGfx.fillRoundedRect(x, y, w, h, 16);
    this._panelGfx.lineStyle(3, COLORS.borderBlue, 1);
    this._panelGfx.strokeRoundedRect(x, y, w, h, 16);
  }

  _showSlide(index, animate = true) {
    if (index < 0 || index >= SLIDES.length) return;
    this._currentSlide = index;

    // Clear old content
    this._slideContainer.removeAll(true);

    const slide = SLIDES[index];
    const cx = this.scale.width / 2;
    const panelMidY = this._panelY + this._panelH / 2;

    // Icon
    const icon = this.add.text(cx, this._panelY + 52, slide.icon, {
      fontSize: '56px',
    }).setOrigin(0.5);
    this._slideContainer.add(icon);

    // Title
    const title = this.add.text(cx, this._panelY + 118, slide.title, {
      ...FONTS.heading,
      fontSize: '24px',
      align: 'center',
    }).setOrigin(0.5);
    this._slideContainer.add(title);

    // Divider line
    const divider = this.add.graphics();
    divider.lineStyle(2, COLORS.borderBlue, 0.5);
    divider.strokeRect(cx - 120, this._panelY + 140, 240, 0);
    this._slideContainer.add(divider);

    // Body lines
    let lineY = this._panelY + 162;
    slide.lines.forEach(line => {
      const text = this.add.text(cx, lineY, line, {
        ...FONTS.body,
        fontSize: '16px',
        color: '#CCDDF0',
        align: 'center',
        wordWrap: { width: this._panelW - 60 },
      }).setOrigin(0.5, 0);
      this._slideContainer.add(text);
      lineY += text.height + 10;
    });

    // Key badges (if any)
    if (slide.keys && slide.keys.length) {
      lineY += 12;
      const keysStartX = cx - (slide.keys.length * 52) / 2 + 26;
      slide.keys.forEach((key, ki) => {
        const kx = keysStartX + ki * 52;
        const kbg = this.add.graphics();
        kbg.fillStyle(0x223355, 1);
        kbg.fillRoundedRect(kx - 22, lineY, 44, 38, 8);
        kbg.lineStyle(2, COLORS.borderBlue, 1);
        kbg.strokeRoundedRect(kx - 22, lineY, 44, 38, 8);
        const ktxt = this.add.text(kx, lineY + 19, key, {
          fontSize: '18px',
          fontFamily: 'Arial Black, monospace',
          color: '#FFD700',
        }).setOrigin(0.5);
        this._slideContainer.add([kbg, ktxt]);
      });
    }

    // Animate slide in
    if (animate) {
      this._slideContainer.setAlpha(0);
      this.tweens.add({ targets: this._slideContainer, alpha: 1, duration: 250 });
    }

    // Update dots
    this._dots.forEach((dot, i) => {
      if (i === index) {
        dot.setFillStyle(COLORS.textGold);
        dot.setScale(1.3);
      } else {
        dot.setFillStyle(COLORS.btnBlue);
        dot.setScale(1.0);
      }
    });

    // Update next button label
    if (this._nextBtn) {
      if (index === SLIDES.length - 1) {
        this._nextBtn.setText("▶  Let's Play!");
        this._nextBtn.setStyle({ color: '#69F0AE' });
      } else {
        this._nextBtn.setText('Next ▶');
        this._nextBtn.setStyle({ color: '#FFD700' });
      }
    }
  }

  _goToSlide(index) {
    if (index < 0 || index >= SLIDES.length) return;
    this._showSlide(index, true);
  }

  _goBack() {
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start(this._returnTo);
    });
  }

  _goPlay() {
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('CharacterSelect');
    });
  }
}
