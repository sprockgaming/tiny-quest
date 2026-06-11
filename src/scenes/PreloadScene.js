import Phaser from 'phaser';

export default class PreloadScene extends Phaser.Scene {
  constructor() { super({ key: 'Preload' }); }

  preload() {
    const { width, height } = this.scale;
    // Loading bar
    const bg = this.add.rectangle(0, 0, width, height, 0x1a1a2e).setOrigin(0);
    this.add.text(width/2, height/2 - 40, '✨ Tiny Quest ✨', {
      fontSize: '38px', fontFamily: 'Arial Black, Arial',
      color: '#FFD700', stroke: '#8B4513', strokeThickness: 6
    }).setOrigin(0.5);
    const loadingText = this.add.text(width/2, height/2 + 10, 'Loading...', {
      fontSize: '18px', fontFamily: 'Arial', color: '#AADDFF'
    }).setOrigin(0.5);

    const barBg = this.add.rectangle(width/2, height/2 + 50, 300, 16, 0x333355).setOrigin(0.5);
    const bar = this.add.rectangle(width/2 - 150, height/2 + 50, 0, 16, 0x88AAFF).setOrigin(0, 0.5);

    this.load.on('progress', v => { bar.width = 300 * v; });
    this.load.on('complete', () => { loadingText.setText('Ready!'); });

    // Load tiles
    this.load.image('tile-grass', 'assets/tile-grass.png');
    this.load.image('tile-tree', 'assets/tile-tree.png');
    this.load.image('tile-water', 'assets/tile-water.png');
    this.load.image('tile-path', 'assets/tile-path.png');
    this.load.image('tile-fence', 'assets/tile-fence.png');
    this.load.image('tile-building', 'assets/tile-building.png');
    this.load.image('tile-rock', 'assets/tile-rock.png');
    this.load.image('tile-tallgrass', 'assets/tile-tallgrass.png');
    this.load.image('tile-stone', 'assets/tile-stone.png');

    // Load player spritesheets (4 frames x 32x32 = 128x32)
    const ssConfig = { frameWidth: 32, frameHeight: 32 };
    this.load.spritesheet('player-knight', 'assets/player-knight.png', ssConfig);
    this.load.spritesheet('player-mage', 'assets/player-mage.png', ssConfig);
    this.load.spritesheet('player-archer', 'assets/player-archer.png', ssConfig);
    this.load.spritesheet('player-healer', 'assets/player-healer.png', ssConfig);

    // Load NPC sprites
    this.load.image('npc-farmer', 'assets/npc-farmer.png');
    this.load.image('npc-gardener', 'assets/npc-gardener.png');
    this.load.image('npc-spirit', 'assets/npc-spirit.png');
    this.load.image('npc-elder', 'assets/npc-elder.png');
    this.load.image('npc-captain', 'assets/npc-captain.png');

    // Load item sprites
    this.load.image('item-seed', 'assets/item-seed.png');
    this.load.image('item-kitten', 'assets/item-kitten.png');
    this.load.image('item-crystal', 'assets/item-crystal.png');

    // Load flower sprites
    this.load.image('flower-red', 'assets/flower-red.png');
    this.load.image('flower-yellow', 'assets/flower-yellow.png');
    this.load.image('flower-blue', 'assets/flower-blue.png');
    this.load.image('flower-green', 'assets/flower-green.png');
    this.load.image('flower-purple', 'assets/flower-purple.png');
  }

  create() {
    this._createAnimations();
    this.scene.start('Title');
  }

  _createAnimations() {
    const heroes = ['knight', 'mage', 'archer', 'healer'];
    for (const hero of heroes) {
      const key = `player-${hero}`;
      if (!this.anims.exists(`${key}-idle`)) {
        this.anims.create({ key: `${key}-idle`, frames: this.anims.generateFrameNumbers(key, { frames: [0] }), frameRate: 1, repeat: -1 });
      }
      if (!this.anims.exists(`${key}-walk`)) {
        this.anims.create({ key: `${key}-walk`, frames: this.anims.generateFrameNumbers(key, { frames: [0, 1, 2, 3, 2, 1] }), frameRate: 10, repeat: -1 });
      }
    }
  }
}
