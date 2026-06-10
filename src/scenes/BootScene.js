import Phaser from 'phaser';
import { createAllTextures } from '../graphics/TextureFactory';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  create() {
    // Title / loading screen
    const { width, height } = this.scale;

    this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0, 0);

    this.add.text(width / 2, height / 2 - 40, '✨ Tiny Quest ✨', {
      fontSize: '38px',
      fontFamily: 'Arial Black, Arial',
      color: '#FFD700',
      stroke: '#8B4513',
      strokeThickness: 6
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 10, 'Loading...', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#AADDFF'
    }).setOrigin(0.5);

    // Generate all textures on next tick (keeps boot screen visible briefly)
    this.time.delayedCall(50, () => {
      createAllTextures(this);
      this._createAnimations();
      this.time.delayedCall(200, () => {
        this.scene.start('Title');
      });
    });
  }

  _createAnimations() {
    const heroes = ['knight', 'mage', 'archer', 'healer'];

    for (const hero of heroes) {
      const key = `player-${hero}`;

      // Idle — frame 0 only
      if (!this.anims.exists(`${key}-idle`)) {
        this.anims.create({
          key: `${key}-idle`,
          frames: this.anims.generateFrameNumbers(key, { frames: [0] }),
          frameRate: 1,
          repeat: -1
        });
      }

      // Walk — frames 0→1→2→3→2→1 loop
      if (!this.anims.exists(`${key}-walk`)) {
        this.anims.create({
          key: `${key}-walk`,
          frames: this.anims.generateFrameNumbers(key, { frames: [0, 1, 2, 3, 2, 1] }),
          frameRate: 10,
          repeat: -1
        });
      }
    }
  }
}
