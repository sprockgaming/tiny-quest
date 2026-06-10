import Phaser from 'phaser';
import { COLORS, FONTS, addSparkles, drawPanel } from '../ui/UITheme';

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Title' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // ── Background ──────────────────────────────────────────────────────────
    this.add.rectangle(0, 0, W, H, COLORS.bgDeep).setOrigin(0, 0);

    // Gradient overlay bands
    this.add.rectangle(0, 0, W, H * 0.55, COLORS.bgMid, 0.6).setOrigin(0, 0);

    // Starfield
    addSparkles(this, 60, 0, 0, W, H * 0.65, [0xFFFFFF, 0xBBDDFF, 0xFFEE99]);

    // Distant hills silhouette
    const hills = this.add.graphics();
    hills.fillStyle(0x0D3320, 1);
    hills.fillEllipse(120, H * 0.7, 300, 160);
    hills.fillEllipse(400, H * 0.72, 400, 140);
    hills.fillEllipse(700, H * 0.68, 280, 180);
    hills.fillRect(0, H * 0.72, W, H);

    // Ground strip
    this.add.rectangle(0, H * 0.72, W, H * 0.28, 0x0D2810, 1).setOrigin(0, 0);

    // ── Hero sprites (animated float) ─────────────────────────────────────
    const heroTypes = ['knight', 'mage', 'archer', 'healer'];
    const heroColors = [0xE53935, 0x8E24AA, 0x43A047, 0xFDD835];
    const heroSpacing = 72;
    const heroStartX = W / 2 - (heroTypes.length * heroSpacing) / 2 + heroSpacing / 2;
    const heroY = H * 0.75;

    heroTypes.forEach((hero, i) => {
      const key = `player-${hero}`;
      const hx = heroStartX + i * heroSpacing;
      const sprite = this.add.image(hx, heroY, key)
        .setScale(2.8)
        .setTint(heroColors[i]);

      // Staggered float animation
      this.tweens.add({
        targets: sprite,
        y: heroY - 8,
        duration: 1100 + i * 180,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 160,
      });
    });

    // ── Title text ───────────────────────────────────────────────────────
    const titleY = H * 0.24;
    const shadow = this.add.text(W / 2 + 4, titleY + 4, '✨ Tiny Quest ✨', {
      ...FONTS.title,
      color: '#00000080',
      stroke: undefined,
      strokeThickness: 0,
    }).setOrigin(0.5).setAlpha(0.5);

    const title = this.add.text(W / 2, titleY, '✨ Tiny Quest ✨', FONTS.title)
      .setOrigin(0.5)
      .setAlpha(0);

    // Entrance animation
    this.tweens.add({
      targets: [shadow, title],
      alpha: { from: 0, to: 1 },
      y: '-=12',
      duration: 900,
      ease: 'Back.easeOut',
    });

    // Subtitle
    const sub = this.add.text(W / 2, titleY + 54, 'A magical adventure for young heroes!', {
      ...FONTS.body,
      fontSize: '17px',
      color: '#AAD4FF',
      fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0);

    this.time.delayedCall(400, () => {
      this.tweens.add({ targets: sub, alpha: 1, duration: 600 });
    });

    // ── Buttons ───────────────────────────────────────────────────────────
    const btnCenterX = W / 2;
    const btnY1 = H * 0.47;
    const btnY2 = H * 0.575;

    // Play button
    const playBtnBg = this.add.graphics();
    const playLabel = this.add.text(btnCenterX, btnY1, '▶  Start Adventure!', {
      fontSize: '22px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#145A32',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const drawPlayBtn = (hov) => {
      playBtnBg.clear();
      playBtnBg.fillStyle(hov ? COLORS.btnGreenHov : COLORS.btnGreen, 1);
      playBtnBg.fillRoundedRect(btnCenterX - 130, btnY1 - 28, 260, 56, 14);
      playBtnBg.lineStyle(3, 0x1E8449, 1);
      playBtnBg.strokeRoundedRect(btnCenterX - 130, btnY1 - 28, 260, 56, 14);
    };
    drawPlayBtn(false);

    const playZone = this.add.zone(btnCenterX, btnY1, 260, 56)
      .setInteractive({ useHandCursor: true });
    playZone.on('pointerover', () => { drawPlayBtn(true); this.tweens.add({ targets: [playBtnBg, playLabel], scaleX: 1.04, scaleY: 1.04, duration: 80 }); });
    playZone.on('pointerout',  () => { drawPlayBtn(false); this.tweens.add({ targets: [playBtnBg, playLabel], scaleX: 1, scaleY: 1, duration: 80 }); });
    playZone.on('pointerdown', () => this._goPlay());

    // How to Play button
    const howBtnBg = this.add.graphics();
    const howLabel = this.add.text(btnCenterX, btnY2, '❓  How to Play', {
      fontSize: '18px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      stroke: '#1A237E',
      strokeThickness: 3,
    }).setOrigin(0.5);

    const drawHowBtn = (hov) => {
      howBtnBg.clear();
      howBtnBg.fillStyle(hov ? COLORS.btnBlueHov : COLORS.btnBlue, 1);
      howBtnBg.fillRoundedRect(btnCenterX - 110, btnY2 - 24, 220, 48, 12);
      howBtnBg.lineStyle(3, 0x0D47A1, 1);
      howBtnBg.strokeRoundedRect(btnCenterX - 110, btnY2 - 24, 220, 48, 12);
    };
    drawHowBtn(false);

    const howZone = this.add.zone(btnCenterX, btnY2, 220, 48)
      .setInteractive({ useHandCursor: true });
    howZone.on('pointerover', () => { drawHowBtn(true); this.tweens.add({ targets: [howBtnBg, howLabel], scaleX: 1.04, scaleY: 1.04, duration: 80 }); });
    howZone.on('pointerout',  () => { drawHowBtn(false); this.tweens.add({ targets: [howBtnBg, howLabel], scaleX: 1, scaleY: 1, duration: 80 }); });
    howZone.on('pointerdown', () => this._goTutorial());

    // Fade in buttons
    [playBtnBg, playLabel, howBtnBg, howLabel].forEach(obj => obj.setAlpha(0));
    this.time.delayedCall(700, () => {
      this.tweens.add({ targets: [playBtnBg, playLabel, howBtnBg, howLabel], alpha: 1, duration: 500 });
    });

    // ── Version / credit ─────────────────────────────────────────────────
    this.add.text(W - 8, H - 6, 'v2.0', {
      fontSize: '11px',
      fontFamily: 'Arial',
      color: '#334455',
    }).setOrigin(1, 1);

    // ── Pulsing "tap to start" after 3s ──────────────────────────────────
    const tapHint = this.add.text(W / 2, btnY2 + 52, 'or press  SPACE  to play', {
      fontSize: '13px',
      fontFamily: 'Arial',
      color: '#556677',
      fontStyle: 'italic',
    }).setOrigin(0.5).setAlpha(0);

    this.time.delayedCall(1600, () => {
      this.tweens.add({ targets: tapHint, alpha: 0.8, duration: 800, yoyo: true, repeat: -1 });
    });

    // Keyboard shortcut
    this.input.keyboard.on('keydown-SPACE', () => this._goPlay());
    this.input.keyboard.on('keydown-ENTER', () => this._goPlay());
  }

  _goPlay() {
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('CharacterSelect');
    });
  }

  _goTutorial() {
    this.cameras.main.fadeOut(350, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Tutorial', { returnTo: 'Title' });
    });
  }
}
