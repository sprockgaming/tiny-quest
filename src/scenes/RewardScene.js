import Phaser from 'phaser';
import GameState from '../data/GameState';
import { QUESTS } from '../data/quests';

export default class RewardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Reward' });
  }

  init(data) {
    this._questId = data.questId;
    this._quest = QUESTS.find(q => q.id === this._questId);
  }

  create() {
    const W = this.scale.width;
    const H = this.scale.height;

    this.cameras.main.fadeIn(500, 0, 0, 0);

    // Background
    this.add.rectangle(0, 0, W, H, 0x0D2137).setOrigin(0, 0);

    // Sparkle background
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(0, W);
      const y = Phaser.Math.Between(0, H);
      const s = Phaser.Math.FloatBetween(1, 4);
      const sparkle = this.add.rectangle(x, y, s, s, 0xFFD700,
        Phaser.Math.FloatBetween(0.3, 1.0));
      this.tweens.add({
        targets: sparkle,
        alpha: 0,
        duration: Phaser.Math.Between(800, 2000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 1500)
      });
    }

    // Quest complete title
    this.add.text(W / 2, 60, 'Quest Complete!', {
      fontSize: '36px',
      fontFamily: 'Arial Black',
      color: '#FFD700',
      stroke: '#8B4513',
      strokeThickness: 6
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: this.children.list[this.children.list.length - 1],
      alpha: 1,
      y: 70,
      duration: 600,
      ease: 'Back.easeOut'
    });

    // Quest name
    this.add.text(W / 2, 118, this._quest.title, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#FFFFFF',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Stars display
    const starCount = this._quest.stars;
    const starSpacing = 80;
    const starsStartX = W / 2 - (starCount - 1) * starSpacing / 2;

    for (let i = 0; i < starCount; i++) {
      const starX = starsStartX + i * starSpacing;
      const star = this.add.image(starX, 230, 'star-big')
        .setOrigin(0.5)
        .setAlpha(0)
        .setScale(0.5);

      this.time.delayedCall(400 + i * 300, () => {
        this.tweens.add({
          targets: star,
          alpha: 1,
          scaleX: 1.2,
          scaleY: 1.2,
          duration: 250,
          ease: 'Back.easeOut',
          onComplete: () => {
            this.tweens.add({ targets: star, scaleX: 1, scaleY: 1, duration: 150 });
            this._burstParticles(starX, 230, 0xFFD700);
          }
        });
      });
    }

    // Total stars
    const totalStars = `Total Stars: ${GameState.starsEarned} / ${QUESTS.length * 3}`;
    const totalText = this.add.text(W / 2, 310, totalStars, {
      fontSize: '18px',
      fontFamily: 'Arial Black',
      color: '#FFE082'
    }).setOrigin(0.5);

    // Encouraging message
    const msgs = [
      'Amazing work, little adventurer!',
      'You\'re a true hero!',
      "The village thanks you!",
      'Your courage is legendary!'
    ];
    this.add.text(W / 2, 355, Phaser.Utils.Array.GetRandom(msgs), {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#AADDFF',
      fontStyle: 'italic'
    }).setOrigin(0.5);

    // Check if all quests done
    if (GameState.questsCompleted.length >= QUESTS.length) {
      this.add.text(W / 2, 400, '🎉 All quests complete — You\'re the Champion! 🎉', {
        fontSize: '16px',
        fontFamily: 'Arial Black',
        color: '#FFD700',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5);
    }

    // Back to Quest Board button
    const btnY = GameState.questsCompleted.length >= QUESTS.length ? 460 : 430;
    const btnBg = this.add.rectangle(W / 2, btnY, 260, 54, 0x1565C0)
      .setStrokeStyle(3, 0x42A5F5)
      .setInteractive({ useHandCursor: true });

    this.add.text(W / 2, btnY, '📋  Quest Board', {
      fontSize: '20px',
      fontFamily: 'Arial Black',
      color: '#FFFFFF'
    }).setOrigin(0.5);

    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x1E88E5);
      this.tweens.add({ targets: btnBg, scaleX: 1.04, scaleY: 1.04, duration: 80 });
    });
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x1565C0);
      this.tweens.add({ targets: btnBg, scaleX: 1, scaleY: 1, duration: 80 });
    });
    btnBg.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('QuestBoard');
      });
    });

    // Play again button
    const playBtn = this.add.text(W / 2, btnY + 56, 'Play Again from Start', {
      fontSize: '13px',
      fontFamily: 'Arial',
      color: '#77AADD',
      backgroundColor: '#00000055',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playBtn.on('pointerdown', () => {
      GameState.reset();
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('CharacterSelect');
      });
    });
  }

  _burstParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
      const p = this.add.rectangle(x, y, 6, 6, color);
      const angle = (i / 10) * Math.PI * 2;
      const speed = 60 + Math.random() * 60;
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        duration: 800,
        onComplete: () => p.destroy()
      });
    }
  }
}
