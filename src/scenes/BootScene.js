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
      this.time.delayedCall(200, () => {
        this.scene.start('Title');
      });
    });
  }
}
