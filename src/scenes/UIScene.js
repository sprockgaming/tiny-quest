import Phaser from 'phaser';
import GameState from '../data/GameState';
import { QUESTS } from '../data/quests';
import { COLORS, FONTS } from '../ui/UITheme';

const HUD_H = 58;

export default class UIScene extends Phaser.Scene {
  constructor() {
    super({ key: 'UI' });
  }

  init(data) {
    this._questId = data.questId;
    this._quest = QUESTS.find(q => q.id === this._questId);
  }

  create() {
    const W = this.scale.width;
    this._W = W;

    // ── HUD background ─────────────────────────────────────────────────
    this._hudGfx = this.add.graphics();
    this._hudGfx.fillStyle(COLORS.bgPanel, 0.93);
    this._hudGfx.fillRoundedRect(0, 0, W, HUD_H, { bl: 14, br: 14, tl: 0, tr: 0 });
    this._hudGfx.lineStyle(2, COLORS.borderBlue, 0.7);
    this._hudGfx.strokeRoundedRect(0, 0, W, HUD_H, { bl: 14, br: 14, tl: 0, tr: 0 });

    // Quest emoji icon
    this._questIcon = this.add.text(12, HUD_H / 2, this._quest ? this._quest.emoji : '📋', {
      fontSize: '24px',
    }).setOrigin(0, 0.5);

    // Quest title (left column)
    this._questTitle = this.add.text(44, 10, this._quest ? `Quest: ${this._quest.title}` : '', {
      fontSize: '13px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
    });

    // Objective text (left column)
    this._objText = this.add.text(44, 30, '', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#AADDFF',
    });

    // Right side: star pill
    this._starPillGfx = this.add.graphics();
    this._drawStarPill(GameState.starsEarned);

    this._starsText = this.add.text(W - 94, HUD_H / 2, '', {
      fontSize: '14px',
      fontFamily: 'Arial Black',
      color: '#FFD700',
    }).setOrigin(0.5);

    // Mute button
    const sm = this.registry.get('soundManager');
    this._muteBtn = this.add.text(W - 10, HUD_H / 2 - 14, sm?.muted ? '🔇' : '🔊', {
      fontSize: '16px',
      backgroundColor: '#00000055',
      padding: { x: 5, y: 3 },
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

    this._muteBtn.on('pointerdown', () => {
      const soundMgr = this.registry.get('soundManager');
      if (!soundMgr) return;
      const muted = soundMgr.toggleMute();
      this._muteBtn.setText(muted ? '🔇' : '🔊');
      soundMgr.play('click');
    });

    // Back button (far right)
    this._backBtn = this.add.text(W - 10, HUD_H / 2 + 8, '← Board', {
      fontSize: '12px',
      fontFamily: 'Arial Black, Arial',
      color: '#AABBFF',
      backgroundColor: '#00000055',
      padding: { x: 7, y: 4 },
    }).setOrigin(1, 0.5).setInteractive({ useHandCursor: true });

    this._backBtn.on('pointerover', () => {
      this._backBtn.setStyle({ color: '#FFFFFF', backgroundColor: '#1565C066' });
    });
    this._backBtn.on('pointerout', () => {
      this._backBtn.setStyle({ color: '#AABBFF', backgroundColor: '#00000055' });
    });
    this._backBtn.on('pointerdown', () => {
      const soundMgr = this.registry.get('soundManager');
      if (soundMgr) { soundMgr.play('click'); soundMgr.stopMusic(); }
      this.scene.stop('Dialog');
      this.scene.stop('Puzzle');
      this.scene.stop('UI');
      this.scene.stop('Game');
      this.scene.start('QuestBoard');
    });

    this.updateProgress();
  }

  _drawStarPill(stars) {
    const W = this._W;
    if (!W) return;
    this._starPillGfx.clear();
    this._starPillGfx.fillStyle(0x1A2E20, 0.88);
    this._starPillGfx.fillRoundedRect(W - 140, 11, 78, 30, 10);
    this._starPillGfx.lineStyle(2, 0xFFD700, 0.65);
    this._starPillGfx.strokeRoundedRect(W - 140, 11, 78, 30, 10);
  }

  updateProgress() {
    if (!this._objText || !this._quest) return;
    const quest = this._quest;
    const obj = quest.objectives[0];

    let label = obj.label;
    if (obj.type === 'collect') {
      const n = GameState.getProgress(this._questId, 'seeds-collected') || 0;
      label = `${obj.label}  (${n} / ${obj.count})`;
    } else if (obj.type === 'flower-sequence') {
      const done = GameState.getProgress(this._questId, 'flowers-done') > 0;
      label = done ? `✅ ${obj.label}` : `🌸 ${obj.label}`;
    } else if (obj.type === 'memory-match') {
      const done = GameState.getProgress(this._questId, 'puzzle-done') > 0;
      label = done ? `✅ ${obj.label}` : `🧩 ${obj.label}`;
    }

    const started = GameState.getProgress(this._questId, 'started') > 0;
    this._objText.setText(started ? `📋 ${label}` : '💬 Talk to the NPC to begin!');

    const stars = GameState.starsEarned;
    if (this._starsText) this._starsText.setText(`⭐ ${stars}`);
    this._drawStarPill(stars);
  }
}
