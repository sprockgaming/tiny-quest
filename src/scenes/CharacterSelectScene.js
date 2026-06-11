import Phaser from 'phaser';
import GameState from '../data/GameState';
import { HERO_TYPES, HERO_LABELS, PLAYER_COLORS } from '../data/constants';

export default class CharacterSelectScene extends Phaser.Scene {
  constructor() {
    super({ key: 'CharacterSelect' });
    this._selectedHero = 0;
    this._selectedColor = 0;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Background gradient
    this.add.rectangle(0, 0, W, H, 0x1a2744).setOrigin(0, 0);

    // Stars in bg
    for (let i = 0; i < 30; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H * 0.6);
      const s = Phaser.Math.FloatBetween(1, 3);
      this.add.rectangle(x, y, s, s, 0xFFFFFF, Phaser.Math.FloatBetween(0.4, 1));
    }

    // Title
    this.add.text(W / 2, 36, 'Choose Your Hero!', {
      fontSize: '28px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      stroke: '#4A148C',
      strokeThickness: 5
    }).setOrigin(0.5);

    // Hero cards
    this._heroCards = [];
    const cardW = 140;
    const cardH = 180;
    const startX = (W - (HERO_TYPES.length * (cardW + 16) - 16)) / 2;

    HERO_TYPES.forEach((hero, i) => {
      const cx = startX + i * (cardW + 16) + cardW / 2;
      const cy = 200;

      const card = this.add.container(cx, cy);

      // Card background
      const bg = this.add.rectangle(0, 0, cardW, cardH, 0x2C3E6B, 0.9)
        .setStrokeStyle(3, 0x5B9BD5);
      card.add(bg);

      // Hero sprite
      const sprite = this.add.image(0, -30, `player-${hero}`)
        .setScale(2.5);
      card.add(sprite);
      this['_sprite_' + hero] = sprite;

      // Hero name
      const label = this.add.text(0, 52, HERO_LABELS[hero], {
        fontSize: '16px',
        fontFamily: 'Arial Black',
        color: '#FFFFFF'
      }).setOrigin(0.5);
      card.add(label);

      // Selection ring (hidden by default)
      const ring = this.add.rectangle(0, 0, cardW + 4, cardH + 4, 0x000000, 0)
        .setStrokeStyle(4, 0xFFD700);
      ring.setVisible(false);
      card.add(ring);
      this['_ring_' + hero] = ring;

      // Interactive
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => this._selectHero(i));
      bg.on('pointerover', () => {
        if (this._selectedHero !== i) bg.setFillStyle(0x3E5080);
      });
      bg.on('pointerout', () => {
        if (this._selectedHero !== i) bg.setFillStyle(0x2C3E6B);
      });

      this._heroCards.push({ card, bg, ring, sprite });
    });

    // Select first hero by default
    this._selectHero(0);

    // Color picker
    this.add.text(W / 2, 320, 'Pick a Color:', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#DDDDFF'
    }).setOrigin(0.5);

    this._colorDots = [];
    const colorStartX = W / 2 - (PLAYER_COLORS.length * 44 - 12) / 2;

    PLAYER_COLORS.forEach((c, i) => {
      const cx = colorStartX + i * 44 + 20;
      const cy = 360;

      const dot = this.add.circle(cx, cy, 18, c.hex)
        .setStrokeStyle(3, 0xFFFFFF)
        .setInteractive({ useHandCursor: true });

      dot.on('pointerdown', () => this._selectColor(i));
      dot.on('pointerover', () => dot.setScale(1.15));
      dot.on('pointerout', () => dot.setScale(this._selectedColor === i ? 1.2 : 1.0));

      const ring = this.add.circle(cx, cy, 22, 0x000000, 0)
        .setStrokeStyle(3, 0xFFD700);
      ring.setVisible(false);

      this._colorDots.push({ dot, ring, cx, cy });
    });

    this._selectColor(0);

    // Name input hint
    this.add.text(W / 2, 418, '— or just jump in! —', {
      fontSize: '13px',
      fontFamily: 'Arial',
      color: '#8899BB',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // START button
    const btnBg = this.add.rectangle(W / 2, 488, 220, 56, 0x27AE60)
      .setStrokeStyle(3, 0x1E8449)
      .setInteractive({ useHandCursor: true });

    const btnText = this.add.text(W / 2, 488, '▶  Start Adventure!', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#FFFFFF',
      stroke: '#145A32',
      strokeThickness: 3
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => { btnBg.setFillStyle(0x2ECC71); this.tweens.add({ targets: btnBg, scaleX: 1.04, scaleY: 1.04, duration: 80 }); });
    btnBg.on('pointerout', () => { btnBg.setFillStyle(0x27AE60); this.tweens.add({ targets: btnBg, scaleX: 1, scaleY: 1, duration: 80 }); });
    btnBg.on('pointerdown', () => this._startGame());

    // Animate hero sprites gently
    HERO_TYPES.forEach((hero, i) => {
      this.tweens.add({
        targets: this['_sprite_' + hero],
        y: '-=6',
        duration: 1200 + i * 200,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 150
      });
    });
  }

  _selectHero(index) {
    this._selectedHero = index;
    HERO_TYPES.forEach((hero, i) => {
      const ring = this['_ring_' + hero];
      const bg = this._heroCards[i].bg;
      if (i === index) {
        ring.setVisible(true);
        bg.setFillStyle(0x3D5480);
      } else {
        ring.setVisible(false);
        bg.setFillStyle(0x2C3E6B);
      }
    });
    // Update sprite tint to match color
    this._applyColorToHero();
  }

  _selectColor(index) {
    this._selectedColor = index;
    this._colorDots.forEach((d, i) => {
      d.ring.setVisible(i === index);
      d.dot.setScale(i === index ? 1.2 : 1.0);
    });
    this._applyColorToHero();
  }

  _applyColorToHero() {
    const color = PLAYER_COLORS[this._selectedColor].hex;
    HERO_TYPES.forEach(hero => {
      const sp = this['_sprite_' + hero];
      if (sp) sp.setTint(color);
    });
  }

  _startGame() {
    GameState.playerHero = HERO_TYPES[this._selectedHero];
    GameState.playerColor = PLAYER_COLORS[this._selectedColor].hex;
    GameState.save();
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('QuestBoard');
    });
  }
}
