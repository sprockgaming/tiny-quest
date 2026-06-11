import Phaser from 'phaser';
import GameState from '../data/GameState';

// Memory match: 6 pairs of 12 cards (4×3 grid)
const CARD_SYMBOLS = [
  { key: '🌟', color: 0xFFD700 },
  { key: '🔥', color: 0xFF5722 },
  { key: '💧', color: 0x2196F3 },
  { key: '🌿', color: 0x4CAF50 },
  { key: '💜', color: 0x9C27B0 },
  { key: '🎵', color: 0xFF80AB }
];

export default class PuzzleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Puzzle' });
  }

  init(data) {
    this._puzzleId = data.puzzleId;
    this._questId = data.questId;
    this._gameScene = data.gameScene;

    // Memory match state
    this._cards = [];
    this._flippedCards = [];
    this._matchedPairs = 0;
    this._totalPairs = 6;
    this._canFlip = true;
    this._flipTimer = null;
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Dim overlay
    this.add.rectangle(0, 0, W, H, 0x000000, 0.75).setOrigin(0, 0);

    if (this._puzzleId === 'memory-match') {
      this._createMemoryMatch();
    }
  }

  _createMemoryMatch() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Panel
    const panelW = 560;
    const panelH = 400;
    const panelX = (W - panelW) / 2;
    const panelY = (H - panelH) / 2;

    this.add.rectangle(W / 2, H / 2, panelW, panelH, 0x0D2137, 0.97)
      .setStrokeStyle(3, 0x29B6F6);

    // Title
    this.add.text(W / 2, panelY + 20, '✨ Memory Stones ✨', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#29B6F6',
      stroke: '#000033',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(W / 2, panelY + 46, 'Tap two stones to reveal them — match all pairs!', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#B3E5FC'
    }).setOrigin(0.5);

    // Progress text
    this._progressText = this.add.text(W / 2, panelY + 66, `Pairs found: 0 / ${this._totalPairs}`, {
      fontSize: '13px',
      fontFamily: 'Arial Black',
      color: '#FFD700'
    }).setOrigin(0.5);

    // Build card grid (4 cols × 3 rows)
    const pairs = [...CARD_SYMBOLS, ...CARD_SYMBOLS]; // 12 cards
    Phaser.Utils.Array.Shuffle(pairs);

    const cols = 4;
    const rows = 3;
    const cardW = 90;
    const cardH = 80;
    const gapX = 14;
    const gapY = 12;
    const gridW = cols * cardW + (cols - 1) * gapX;
    const gridH = rows * cardH + (rows - 1) * gapY;
    const gridStartX = (W - gridW) / 2;
    const gridStartY = panelY + 88;

    pairs.forEach((sym, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = gridStartX + col * (cardW + gapX) + cardW / 2;
      const cy = gridStartY + row * (cardH + gapY) + cardH / 2;

      const card = this._makeCard(cx, cy, cardW, cardH, sym, i);
      this._cards.push(card);
    });

    // Close button
    const closeBtn = this.add.text(W / 2, panelY + panelH - 20, '✕ Give up (go back)', {
      fontSize: '12px',
      fontFamily: 'Arial',
      color: '#FF8A80'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this._close(false));
    closeBtn.on('pointerover', () => closeBtn.setStyle({ color: '#FF5252' }));
    closeBtn.on('pointerout', () => closeBtn.setStyle({ color: '#FF8A80' }));

    // First-time hint banner
    if (!GameState.hasSeenHint('puzzleHint')) {
      GameState.markHintSeen('puzzleHint');
      const banner = this.add.text(W / 2, -50,
        '💡 Tap two stones to find matching pairs!',
        {
          fontSize: '14px',
          fontFamily: 'Arial',
          color: '#FFFFFF',
          backgroundColor: '#0D2137',
          padding: { x: 14, y: 7 },
        }
      ).setOrigin(0.5, 0).setDepth(400);

      this.tweens.add({
        targets: banner,
        y: 10,
        duration: 350,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.tweens.add({
            targets: banner,
            alpha: 0,
            duration: 500,
            delay: 2000,
            onComplete: () => banner.destroy()
          });
        }
      });
    }
  }

  _makeCard(cx, cy, cardW, cardH, sym, index) {
    const container = this.add.container(cx, cy);

    // Card back
    const back = this.add.rectangle(0, 0, cardW, cardH, 0x1A3A5C)
      .setStrokeStyle(2, 0x2979FF);
    container.add(back);

    // Magic pattern on back
    const pat1 = this.add.text(0, 0, '✦', {
      fontSize: '28px', color: '#1565C0'
    }).setOrigin(0.5);
    container.add(pat1);

    // Card face (hidden)
    const face = this.add.rectangle(0, 0, cardW, cardH, sym.color, 0.85)
      .setStrokeStyle(2, 0xFFFFFF)
      .setVisible(false);
    container.add(face);

    // Symbol text (hidden)
    const symText = this.add.text(0, 0, sym.key, {
      fontSize: '32px'
    }).setOrigin(0.5).setVisible(false);
    container.add(symText);

    // Matched glow (hidden)
    const glow = this.add.rectangle(0, 0, cardW + 4, cardH + 4, 0xFFD700, 0)
      .setStrokeStyle(4, 0xFFD700)
      .setVisible(false);
    container.add(glow);

    const cardObj = { container, back, pat1, face, symText, glow, sym, index, flipped: false, matched: false };

    // Click handler
    back.setInteractive({ useHandCursor: true });
    back.on('pointerdown', () => this._flipCard(cardObj));
    back.on('pointerover', () => {
      if (!cardObj.flipped && !cardObj.matched) back.setFillStyle(0x243D5E);
    });
    back.on('pointerout', () => {
      if (!cardObj.flipped && !cardObj.matched) back.setFillStyle(0x1A3A5C);
    });

    return cardObj;
  }

  _flipCard(card) {
    if (!this._canFlip) return;
    if (card.flipped || card.matched) return;
    if (this._flippedCards.length >= 2) return;

    card.flipped = true;
    this._flippedCards.push(card);

    // Flip animation
    this.tweens.add({
      targets: card.container,
      scaleX: 0,
      duration: 120,
      onComplete: () => {
        card.back.setVisible(false);
        card.pat1.setVisible(false);
        card.face.setVisible(true);
        card.symText.setVisible(true);
        this.tweens.add({
          targets: card.container,
          scaleX: 1,
          duration: 120
        });
      }
    });

    if (this._flippedCards.length === 2) {
      this._canFlip = false;
      this.time.delayedCall(700, () => this._checkMatch());
    }
  }

  _checkMatch() {
    const [a, b] = this._flippedCards;
    this._flippedCards = [];

    if (a.sym.key === b.sym.key) {
      // Match!
      a.matched = true;
      b.matched = true;
      a.glow.setVisible(true);
      b.glow.setVisible(true);

      this._matchedPairs++;
      this._progressText.setText(`Pairs found: ${this._matchedPairs} / ${this._totalPairs}`);

      // Celebrate
      this._spawnMatchParticles(a.container.x, a.container.y);
      this._spawnMatchParticles(b.container.x, b.container.y);

      this._canFlip = true;

      if (this._matchedPairs >= this._totalPairs) {
        this.time.delayedCall(600, () => this._onAllMatched());
      }
    } else {
      // No match — flip back
      [a, b].forEach(card => {
        card.flipped = false;
        this.tweens.add({
          targets: card.container,
          scaleX: 0,
          duration: 120,
          onComplete: () => {
            card.face.setVisible(false);
            card.symText.setVisible(false);
            card.back.setVisible(true);
            card.pat1.setVisible(true);
            this.tweens.add({
              targets: card.container,
              scaleX: 1,
              duration: 120
            });
          }
        });
      });
      this.time.delayedCall(250, () => { this._canFlip = true; });
    }
  }

  _onAllMatched() {
    const W = this.scale.width;
    const H = this.scale.height;

    // Victory message
    const win = this.add.text(W / 2, H / 2, '🎉 All pairs matched! 🎉', {
      fontSize: '24px',
      fontFamily: 'Arial Black',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 5
    }).setOrigin(0.5).setDepth(200);

    this.tweens.add({
      targets: win,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.time.delayedCall(400, () => this._close(true));
      }
    });
  }

  _spawnMatchParticles(x, y) {
    const colors = [0xFFD700, 0xFF5722, 0x4CAF50, 0x29B6F6];
    for (let i = 0; i < 8; i++) {
      const p = this.add.circle(x, y, 5, Phaser.Utils.Array.GetRandom(colors)).setDepth(100);
      const angle = (i / 8) * Math.PI * 2;
      const speed = 50 + Math.random() * 50;
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 700,
        onComplete: () => p.destroy()
      });
    }
  }

  _close(success) {
    this.scene.stop('Puzzle');
    if (this._gameScene && this._gameScene.events) {
      if (success) {
        this._gameScene.events.emit('puzzle-complete');
      } else {
        this._gameScene.events.emit('dialog-complete', null);
      }
    }
  }

  shutdown() {
    if (this._flipTimer) {
      this._flipTimer.remove();
    }
  }
}
