import Phaser from 'phaser';
import GameState from '../data/GameState';
import { QUESTS } from '../data/quests';
import { COLORS, FONTS, addSparkles } from '../ui/UITheme';

export default class QuestBoardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'QuestBoard' });
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.cameras.main.fadeIn(400, 0, 0, 0);

    // ── Background ──────────────────────────────────────────────────────
    this.add.rectangle(0, 0, W, H, COLORS.bgDeep).setOrigin(0, 0);

    // Wooden board panel
    const boardGfx = this.add.graphics();
    boardGfx.fillStyle(0x4A3020, 0.88);
    boardGfx.fillRoundedRect(20, 20, W - 40, H - 40, 16);
    boardGfx.lineStyle(4, 0x8D6E63, 1);
    boardGfx.strokeRoundedRect(20, 20, W - 40, H - 40, 16);
    // Inner frame line
    boardGfx.lineStyle(1, 0xA07050, 0.4);
    boardGfx.strokeRoundedRect(26, 26, W - 52, H - 52, 13);

    // Header bar
    const hdrGfx = this.add.graphics();
    hdrGfx.fillStyle(COLORS.bgPanel, 0.85);
    hdrGfx.fillRoundedRect(30, 28, W - 60, 54, { tl: 12, tr: 12, bl: 0, br: 0 });
    hdrGfx.lineStyle(2, COLORS.borderBlue, 0.6);
    hdrGfx.strokeRoundedRect(30, 28, W - 60, 54, { tl: 12, tr: 12, bl: 0, br: 0 });

    // Header title
    this.add.text(W / 2, 55, '📋  Quest Board', {
      ...FONTS.heading,
      fontSize: '26px',
    }).setOrigin(0.5);

    // Stars progress pill
    const totalStars = QUESTS.length * 3;
    const earned = GameState.starsEarned;
    const pillGfx = this.add.graphics();
    pillGfx.fillStyle(0x1A2E10, 0.9);
    pillGfx.fillRoundedRect(W / 2 - 90, 88, 180, 26, 10);
    pillGfx.lineStyle(2, 0xFFD700, 0.6);
    pillGfx.strokeRoundedRect(W / 2 - 90, 88, 180, 26, 10);

    this.add.text(W / 2, 101, `⭐ Stars: ${earned} / ${totalStars}`, {
      fontSize: '14px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFE082',
    }).setOrigin(0.5);

    // ── Quest cards ─────────────────────────────────────────────────────
    const cardW = 210;
    const cardH = 296;
    const spacing = 18;
    const totalW = QUESTS.length * cardW + (QUESTS.length - 1) * spacing;
    const startX = (W - totalW) / 2;
    const cardsY = H / 2 + 28;

    QUESTS.forEach((quest, i) => {
      const cx = startX + i * (cardW + spacing) + cardW / 2;
      this._makeQuestCard(quest, cx, cardsY, cardW, cardH, i);
    });

    // ── Footer hint ──────────────────────────────────────────────────────
    if (GameState.questsCompleted.length === QUESTS.length) {
      const champGfx = this.add.graphics();
      champGfx.fillStyle(0x1A3010, 0.9);
      champGfx.fillRoundedRect(W / 2 - 200, H - 48, 400, 30, 10);
      this.add.text(W / 2, H - 33, '🎉  All quests complete — You\'re the Champion!  🎉', {
        fontSize: '15px',
        fontFamily: 'Arial Black',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3,
      }).setOrigin(0.5);
    } else {
      this.add.text(W / 2, H - 33, 'Pick a quest card below to begin your adventure!', {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#AABBCC',
        fontStyle: 'italic',
      }).setOrigin(0.5);
    }

    // ── "How to Play" shortcut ───────────────────────────────────────────
    const helpBtn = this.add.text(W - 30, 55, '❓ Help', {
      fontSize: '13px',
      fontFamily: 'Arial Black, Arial',
      color: '#7799BB',
      backgroundColor: '#00000044',
      padding: { x: 7, y: 4 },
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    helpBtn.on('pointerover', () => helpBtn.setStyle({ color: '#AADDFF' }));
    helpBtn.on('pointerout',  () => helpBtn.setStyle({ color: '#7799BB' }));
    helpBtn.on('pointerdown', () => {
      this.cameras.main.fadeOut(250, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('Tutorial', { returnTo: 'QuestBoard' });
      });
    });
  }

  _makeQuestCard(quest, cx, cy, cardW, cardH, index) {
    const isComplete = GameState.isQuestComplete(quest.id);

    const card = this.add.container(cx, cy);
    card.setAlpha(0);

    // Staggered entrance
    this.time.delayedCall(index * 80, () => {
      this.tweens.add({ targets: card, alpha: 1, y: cy, duration: 300, ease: 'Back.easeOut' });
    });

    // Card background (rounded via Graphics)
    const cardGfx = this.add.graphics();
    const bgColor = isComplete ? 0x1B4A1E : 0x1E3060;
    const borderColor = isComplete ? COLORS.borderGreen : COLORS.borderBlue;
    cardGfx.fillStyle(bgColor, 0.93);
    cardGfx.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
    cardGfx.lineStyle(3, borderColor, 1);
    cardGfx.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 12);
    card.add(cardGfx);

    // Emoji icon
    const icon = this.add.text(0, -cardH / 2 + 36, quest.emoji, { fontSize: '38px' }).setOrigin(0.5);
    card.add(icon);

    // Title
    const title = this.add.text(0, -cardH / 2 + 82, quest.title, {
      fontSize: '16px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFFFFF',
      wordWrap: { width: cardW - 22 },
      align: 'center',
    }).setOrigin(0.5);
    card.add(title);

    // Short description
    const desc = this.add.text(0, -cardH / 2 + 126, quest.shortDesc, {
      fontSize: '13px',
      fontFamily: 'Arial, sans-serif',
      color: '#AABBDD',
      wordWrap: { width: cardW - 26 },
      align: 'center',
    }).setOrigin(0.5, 0);
    card.add(desc);

    // Stars reward pill
    const pillGfx = this.add.graphics();
    pillGfx.fillStyle(0x1A2A10, 0.85);
    pillGfx.fillRoundedRect(-50, cardH / 2 - 84, 100, 26, 8);
    pillGfx.lineStyle(1, 0xFFD700, 0.5);
    pillGfx.strokeRoundedRect(-50, cardH / 2 - 84, 100, 26, 8);
    card.add(pillGfx);

    const starsRow = '⭐'.repeat(quest.stars);
    const starsLabel = this.add.text(0, cardH / 2 - 71, starsRow, {
      fontSize: '15px',
    }).setOrigin(0.5);
    card.add(starsLabel);

    if (isComplete) {
      const badge = this.add.text(0, cardH / 2 - 34, '✅ COMPLETE', {
        fontSize: '15px',
        fontFamily: 'Arial Black',
        color: '#69F0AE',
        stroke: '#1B5E20',
        strokeThickness: 3,
      }).setOrigin(0.5);
      card.add(badge);
    } else {
      // Go button
      const btnGfx = this.add.graphics();
      const drawBtn = (hov) => {
        btnGfx.clear();
        btnGfx.fillStyle(hov ? COLORS.btnGreenHov : COLORS.btnGreen, 1);
        btnGfx.fillRoundedRect(-(cardW - 28) / 2, cardH / 2 - 50, cardW - 28, 42, 10);
        btnGfx.lineStyle(2, 0x1E8449, 1);
        btnGfx.strokeRoundedRect(-(cardW - 28) / 2, cardH / 2 - 50, cardW - 28, 42, 10);
      };
      drawBtn(false);

      const btnText = this.add.text(0, cardH / 2 - 29, '▶  Go!', {
        fontSize: '17px',
        fontFamily: 'Arial Black',
        color: '#FFFFFF',
        stroke: '#145A32',
        strokeThickness: 2,
      }).setOrigin(0.5);

      const btnZone = this.add.zone(0, cardH / 2 - 29, cardW - 28, 42)
        .setInteractive({ useHandCursor: true });
      btnZone.on('pointerover', () => { drawBtn(true); });
      btnZone.on('pointerout',  () => { drawBtn(false); });
      btnZone.on('pointerdown', () => this._startQuest(quest));

      card.add([btnGfx, btnText, btnZone]);

      // Card hover lift
      const hitArea = this.add.zone(0, 0, cardW, cardH - 60)
        .setInteractive({ useHandCursor: false });
      hitArea.on('pointerover', () => {
        this.tweens.add({ targets: card, scaleX: 1.03, scaleY: 1.03, duration: 90 });
      });
      hitArea.on('pointerout', () => {
        this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 90 });
      });
      card.add(hitArea);
    }
  }

  _startQuest(quest) {
    GameState.currentQuestId = quest.id;
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('Game', { questId: quest.id });
    });
  }
}
