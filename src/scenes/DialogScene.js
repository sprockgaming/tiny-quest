import Phaser from 'phaser';
import { COLORS, FONTS } from '../ui/UITheme';

const TYPEWRITER_SPEED = 28; // ms per character
const BOX_H   = 158;
const BOX_PAD = 14;
const PORT_SZ = 76;

export default class DialogScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Dialog' });
  }

  init(data) {
    this._lines         = data.lines || [];
    this._gameScene     = data.gameScene;
    this._currentLine   = 0;
    this._typewriterTimer = null;
    this._fullText      = '';
    this._displayedText = '';
    this._typingDone    = false;
    this._pendingAction = null;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Semi-transparent overlay
    this.add.rectangle(0, 0, W, H, 0x000000, 0.38).setOrigin(0, 0).setDepth(0);

    const boxY = H - BOX_H - 12;
    const boxW = W - 24;
    const boxX = 12;

    // ── Dialog box (rounded) ────────────────────────────────────────────
    this._boxGfx = this.add.graphics().setDepth(1);
    this._drawBox(boxX, boxY, boxW, BOX_H);

    // ── Portrait frame ──────────────────────────────────────────────────
    const portX = boxX + BOX_PAD;
    const portY = boxY + BOX_PAD;

    const portFrame = this.add.graphics().setDepth(2);
    portFrame.fillStyle(0x0D1F3C, 1);
    portFrame.fillRoundedRect(portX, portY, PORT_SZ, PORT_SZ, 8);
    portFrame.lineStyle(3, COLORS.borderGold, 1);
    portFrame.strokeRoundedRect(portX, portY, PORT_SZ, PORT_SZ, 8);

    this._portraitImg = this.add.image(
      portX + PORT_SZ / 2,
      portY + PORT_SZ / 2,
      'portrait-farmer'
    ).setDepth(3).setScale(1.45);

    // ── Text area ───────────────────────────────────────────────────────
    const textX = portX + PORT_SZ + 14;
    const textW = boxW - PORT_SZ - BOX_PAD * 3 - 14;

    // Speaker name accent band
    this._speakerBg = this.add.graphics().setDepth(2);
    this._speakerBg.fillStyle(COLORS.borderBlue, 0.28);
    this._speakerBg.fillRoundedRect(textX - 4, boxY + BOX_PAD - 2, 180, 24, 5);

    this._speakerText = this.add.text(textX, boxY + BOX_PAD + 2, '', {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
    }).setDepth(4);

    // Dialog body
    this._dialogText = this.add.text(textX, boxY + BOX_PAD + 30, '', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#FFFFFF',
      wordWrap: { width: textW },
      lineSpacing: 5,
    }).setDepth(4);

    // ── Continue indicator ──────────────────────────────────────────────
    this._nextIndicator = this.add.text(W - 22, H - 18, '▶ tap to continue', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#7799BB',
      fontStyle: 'italic',
    }).setOrigin(1, 1).setDepth(4);

    this.tweens.add({
      targets: this._nextIndicator,
      alpha: 0.2,
      duration: 580,
      yoyo: true,
      repeat: -1,
    });

    // ── Line progress dots ──────────────────────────────────────────────
    this._lineDots = [];
    this._buildLineDots();

    // ── Input ───────────────────────────────────────────────────────────
    this.input.on('pointerdown', () => this._advance());
    this.input.keyboard.on('keydown-SPACE', () => this._advance());
    this.input.keyboard.on('keydown-E',     () => this._advance());
    this.input.keyboard.on('keydown-ENTER', () => this._advance());

    // Slide-up entrance animation
    const targets = [this._boxGfx, portFrame, this._portraitImg,
                     this._speakerBg, this._speakerText, this._dialogText,
                     this._nextIndicator];
    targets.forEach(o => { o.y += 36; o.alpha = 0; });
    this.tweens.add({ targets, y: '-=36', alpha: 1, duration: 200, ease: 'Cubic.easeOut' });

    this._showLine(0);
  }

  _drawBox(x, y, w, h) {
    this._boxGfx.clear();
    this._boxGfx.fillStyle(COLORS.bgPanel, 0.97);
    this._boxGfx.fillRoundedRect(x, y, w, h, 14);
    this._boxGfx.lineStyle(3, COLORS.borderBlue, 1);
    this._boxGfx.strokeRoundedRect(x, y, w, h, 14);
    // Subtle inner glow line
    this._boxGfx.lineStyle(1, COLORS.borderGold, 0.2);
    this._boxGfx.strokeRoundedRect(x + 3, y + 3, w - 6, h - 6, 12);
  }

  _buildLineDots() {
    this._lineDots.forEach(d => d.destroy());
    this._lineDots = [];
    if (this._lines.length <= 1) return;

    const W = this.scale.width;
    const H = this.scale.height;
    const spacing = 14;
    const startX = W / 2 - ((this._lines.length - 1) * spacing) / 2;

    this._lines.forEach((_, i) => {
      const dot = this.add.circle(
        startX + i * spacing,
        H - 18,
        4,
        i === this._currentLine ? COLORS.textGold : COLORS.btnBlue,
        1
      ).setDepth(5);
      this._lineDots.push(dot);
    });
  }

  _refreshDots() {
    this._lineDots.forEach((dot, i) => {
      dot.setFillStyle(i === this._currentLine ? COLORS.textGold : COLORS.btnBlue);
    });
  }

  _showLine(index) {
    if (index >= this._lines.length) {
      this._finish();
      return;
    }

    const line = this._lines[index];
    this._currentLine = index;
    this._fullText    = line.text;
    this._displayedText = '';
    this._typingDone    = false;
    this._pendingAction = line.action || null;

    // Portrait
    const portrait = line.portrait || 'portrait-farmer';
    if (this.textures.exists(portrait)) {
      this._portraitImg.setTexture(portrait);
    }

    // Speaker
    this._speakerText.setText(line.speaker || '');

    // Typewriter
    this._dialogText.setText('');
    let charIndex = 0;
    if (this._typewriterTimer) this._typewriterTimer.remove();
    this._typewriterTimer = this.time.addEvent({
      delay: TYPEWRITER_SPEED,
      callback: () => {
        if (charIndex < this._fullText.length) {
          this._displayedText += this._fullText[charIndex++];
          this._dialogText.setText(this._displayedText);
        } else {
          this._typingDone = true;
          if (this._typewriterTimer) this._typewriterTimer.remove();
        }
      },
      repeat: this._fullText.length,
    });

    this._refreshDots();
  }

  _advance() {
    if (!this._typingDone) {
      if (this._typewriterTimer) this._typewriterTimer.remove();
      this._dialogText.setText(this._fullText);
      this._typingDone = true;
      return;
    }
    this._showLine(this._currentLine + 1);
  }

  _finish() {
    const action = this._pendingAction;
    this.scene.stop('Dialog');
    if (this._gameScene && this._gameScene.events) {
      this._gameScene.events.emit('dialog-complete', action);
    }
  }

  shutdown() {
    if (this._typewriterTimer) {
      this._typewriterTimer.remove();
      this._typewriterTimer = null;
    }
  }
}
