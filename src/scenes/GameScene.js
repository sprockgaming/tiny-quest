import Phaser from 'phaser';
import GameState from '../data/GameState';
import { QUESTS } from '../data/quests';
import { MAPS } from '../data/maps';
import { TILE_SIZE, SOLID_TILES, TILE_KEYS, PLAYER_SPEED, INTERACT_DISTANCE } from '../data/constants';

const FLOWER_KEYS = ['flower-red', 'flower-yellow', 'flower-blue', 'flower-green', 'flower-purple'];

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Game' });
  }

  init(data) {
    this._questId = data.questId || GameState.currentQuestId;
    this._quest = QUESTS.find(q => q.id === this._questId);
    this._mapData = MAPS[this._quest.mapId];
    this._dialogActive = false;
    this._puzzleActive = false;     // currently showing puzzle overlay
    this._puzzleCompleted = false;  // puzzle successfully solved (persists)
    this._flowersDone = false;
    this._flowerProgress = [];  // which flowers have been correctly tapped
    this._flowerNext = 0;       // next expected flower index
    this._pointerTarget = null;
    this._interactionCooldown = 0;
    this._questStarted = GameState.getProgress(this._questId, 'started') > 0;
  }

  create() {
    const { width, height } = this.scale;

    this.cameras.main.fadeIn(400, 0, 0, 0);

    // ── Build map ──
    this._buildMap();

    // ── Player ──
    const ps = this._mapData.playerStart;
    this._playerKey = `player-${GameState.playerHero}`;
    this._player = this.physics.add.sprite(
      ps.x * TILE_SIZE + TILE_SIZE / 2,
      ps.y * TILE_SIZE + TILE_SIZE / 2,
      this._playerKey,
      0
    );
    this._player.setTint(GameState.playerColor);
    this._player.setDepth(10);
    this._player.body.setSize(20, 20);
    this._player.body.setOffset(6, 12);
    this._player.setScale(1.1);
    this._player.play(`${this._playerKey}-idle`);

    // Collision with walls
    this.physics.add.collider(this._player, this._walls);

    // ── NPCs ──
    this._npcs = [];
    for (const npcData of this._mapData.npcs) {
      const npc = this.physics.add.staticSprite(
        npcData.tileX * TILE_SIZE + TILE_SIZE / 2,
        npcData.tileY * TILE_SIZE + TILE_SIZE / 2,
        npcData.sprite
      );
      npc.setDepth(9);
      npc.body.setSize(24, 28);

      // Name tag
      const tag = this.add.text(npc.x, npc.y - 26, npcData.name, {
        fontSize: '10px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        backgroundColor: '#00000088',
        padding: { x: 4, y: 2 }
      }).setOrigin(0.5).setDepth(20);

      // Exclamation mark (when quest not started)
      const exclaim = this.add.text(npc.x, npc.y - 42, '❗', { fontSize: '16px' })
        .setOrigin(0.5).setDepth(20);
      exclaim.setVisible(!this._questStarted);

      // Bounce NPC
      this.tweens.add({
        targets: npc,
        y: npc.y - 4,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      this._npcs.push({ sprite: npc, data: npcData, tag, exclaim });
    }

    // ── Items (seed bags for farm quest) ──
    this._items = [];
    for (const itemData of this._mapData.items) {
      const item = this.physics.add.staticSprite(
        itemData.tileX * TILE_SIZE + TILE_SIZE / 2,
        itemData.tileY * TILE_SIZE + TILE_SIZE / 2,
        itemData.sprite
      );
      item.setDepth(8);
      item.setScale(0.9);

      // Gentle float animation
      this.tweens.add({
        targets: item,
        y: item.y - 5,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 500
      });

      // Already collected?
      const collected = GameState.getProgress(this._questId, `item-${itemData.id}`) > 0;
      if (collected) item.setVisible(false).body.enable = false;

      this._items.push({ sprite: item, data: itemData, collected });
    }

    // ── Flowers (garden quest) ──
    this._flowers = [];
    if (this._mapData.flowers && this._mapData.flowers.length > 0) {
      this._buildFlowers();
    }

    // ── Hint sign (garden) ──
    if (this._mapData.hintSign) {
      this._buildHintSign();
    }

    // ── Input ──
    this._cursors = this.input.keyboard.createCursorKeys();
    this._wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    this._interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this._interactKey.on('down', () => this._checkInteraction());

    // Tap-to-move
    this.input.on('pointerdown', (ptr) => {
      if (this._dialogActive) return;
      this._pointerTarget = { x: ptr.worldX, y: ptr.worldY };
      this._checkTapInteraction(ptr.worldX, ptr.worldY);
    });
    this.input.on('pointerup', () => {
      // Keep moving until destination reached
    });

    // ── UIScene overlay ──
    this.scene.launch('UI', { questId: this._questId });

    // ── Listen for events from other scenes ──
    this.events.on('puzzle-complete', () => this._onPuzzleComplete());
    this.events.on('dialog-complete', (action) => this._onDialogComplete(action));
    this.events.on('resume', () => {
      this._dialogActive = false;
    });

    // Show hint for controls
    this._showControlsHint();
  }

  _buildMap() {
    const map = this._mapData;
    const tiles = map.tiles;

    // RenderTexture for all tile visuals
    const mapW = tiles[0].length * TILE_SIZE;
    const mapH = tiles.length * TILE_SIZE;
    const rt = this.add.renderTexture(0, 0, mapW, mapH).setDepth(0);

    // Walls static group
    this._walls = this.physics.add.staticGroup();

    for (let row = 0; row < tiles.length; row++) {
      for (let col = 0; col < tiles[row].length; col++) {
        const t = tiles[row][col];
        const key = TILE_KEYS[t];
        rt.draw(key, col * TILE_SIZE, row * TILE_SIZE);

        if (SOLID_TILES.has(t)) {
          const wall = this._walls.create(
            col * TILE_SIZE + TILE_SIZE / 2,
            row * TILE_SIZE + TILE_SIZE / 2,
            null
          );
          wall.setVisible(false);
          wall.body.setSize(TILE_SIZE, TILE_SIZE);
          wall.refreshBody();
        }
      }
    }
  }

  _buildFlowers() {
    const flowerDefs = this._mapData.flowers;
    // Check if already completed
    const done = GameState.getProgress(this._questId, 'flowers-done') > 0;
    this._flowersDone = done;
    this._flowerNext = done ? flowerDefs.length : 0;

    flowerDefs.forEach((fd, i) => {
      const colorKey = fd.colorName.toLowerCase();
      const texKey = done ? `flower-${colorKey}-bloom` : `flower-${colorKey}`;
      const fx = fd.tileX * TILE_SIZE + TILE_SIZE / 2;
      const fy = fd.tileY * TILE_SIZE + TILE_SIZE / 2;

      const sprite = this.add.image(fx, fy, texKey)
        .setDepth(7)
        .setScale(0.9)
        .setInteractive({ useHandCursor: !done });

      if (!done) {
        // Order number badge
        const badge = this.add.text(fx + 10, fy - 10, String(fd.order + 1), {
          fontSize: '11px',
          fontFamily: 'Arial Black',
          color: '#FFFFFF',
          backgroundColor: '#00000099',
          padding: { x: 3, y: 1 }
        }).setDepth(21);

        sprite.on('pointerdown', () => {
          if (!this._questStarted || this._dialogActive || this._flowersDone) return;
          this._tapFlower(i, sprite, badge, fd);
        });
        sprite.on('pointerover', () => sprite.setScale(1.05));
        sprite.on('pointerout', () => sprite.setScale(0.9));

        this._flowers.push({ sprite, badge, data: fd, bloomed: false });
      } else {
        this._flowers.push({ sprite, badge: null, data: fd, bloomed: true });
      }
    });
  }

  _tapFlower(index, sprite, badge, fd) {
    const expected = this._flowerNext;
    if (fd.order === expected) {
      // Correct!
      this._flowerProgress.push(index);
      this._flowerNext++;
      const colorKey = fd.colorName.toLowerCase();
      sprite.setTexture(`flower-${colorKey}-bloom`);
      sprite.disableInteractive();
      if (badge) badge.destroy();
      this.tweens.add({ targets: sprite, scaleX: 1.3, scaleY: 1.3, duration: 150, yoyo: true });

      // Show a little particle effect
      this._spawnParticles(sprite.x, sprite.y, fd.color);

      if (this._flowerNext >= this._mapData.flowers.length) {
        // All flowers done!
        this._flowersDone = true;
        GameState.setProgress(this._questId, 'flowers-done', 1);
        this.time.delayedCall(400, () => {
          this._updateUI();
          this._showCheckmark(sprite.x, sprite.y);
        });
      }
      this._updateUI();
    } else {
      // Wrong — shake
      this.tweens.add({
        targets: sprite,
        x: sprite.x - 5,
        duration: 60,
        yoyo: true,
        repeat: 4
      });
      // Show hint after 2 wrong attempts
      const wrongCount = (GameState.getProgress(this._questId, 'wrong-taps') || 0) + 1;
      GameState.setProgress(this._questId, 'wrong-taps', wrongCount);
      if (wrongCount >= 2) {
        this._showHintFlash();
      }
    }
  }

  _buildHintSign() {
    const hs = this._mapData.hintSign;
    const hx = hs.tileX * TILE_SIZE;
    const hy = hs.tileY * TILE_SIZE;

    // Sign background
    const sign = this.add.rectangle(hx + TILE_SIZE, hy + TILE_SIZE / 2, 140, 50, 0xF9A825)
      .setStrokeStyle(3, 0x5D4037)
      .setDepth(6);

    this.add.text(hx + TILE_SIZE, hy + TILE_SIZE / 2 - 10, 'Flower Order:', {
      fontSize: '9px',
      fontFamily: 'Arial Black',
      color: '#3E2723'
    }).setOrigin(0.5).setDepth(7);

    // Flower color dots in order
    const flowers = this._mapData.flowers;
    const dotSpacing = 22;
    const startDotX = hx + TILE_SIZE - (flowers.length - 1) * dotSpacing / 2;

    flowers.forEach((fd, i) => {
      const dx = startDotX + i * dotSpacing;
      const dy = hy + TILE_SIZE / 2 + 8;
      this.add.circle(dx, dy, 8, fd.color).setDepth(7);
      this.add.text(dx, dy, String(i + 1), {
        fontSize: '8px',
        fontFamily: 'Arial Black',
        color: '#FFFFFF'
      }).setOrigin(0.5).setDepth(8);
    });
  }

  _showHintFlash() {
    // Flash the hint sign briefly
    const flash = this.add.text(
      this.scale.width / 2, 180,
      '💡 Check the hint sign!',
      {
        fontSize: '16px',
        fontFamily: 'Arial Black',
        color: '#FFFF00',
        backgroundColor: '#00000099',
        padding: { x: 10, y: 6 }
      }
    ).setOrigin(0.5).setDepth(100);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 2000,
      delay: 1500,
      onComplete: () => flash.destroy()
    });
  }

  _showControlsHint() {
    const hint = this.add.text(
      this.scale.width / 2, 30,
      'WASD / Arrows to move   ·   E or tap to interact',
      {
        fontSize: '12px',
        fontFamily: 'Arial',
        color: '#FFFFFF',
        backgroundColor: '#00000099',
        padding: { x: 8, y: 4 }
      }
    ).setOrigin(0.5).setDepth(200).setScrollFactor(0);

    this.tweens.add({
      targets: hint,
      alpha: 0,
      duration: 800,
      delay: 3500,
      onComplete: () => hint.destroy()
    });
  }

  update(time, delta) {
    if (this._dialogActive) {
      this._player.setVelocity(0, 0);
      return;
    }

    this._interactionCooldown = Math.max(0, this._interactionCooldown - delta);
    this._handleMovement();
    this._checkItemPickup();
    this._checkPuzzleTrigger();
  }

  _handleMovement() {
    const vel = { x: 0, y: 0 };

    // Keyboard
    if (this._cursors.left.isDown || this._wasd.left.isDown) vel.x = -PLAYER_SPEED;
    else if (this._cursors.right.isDown || this._wasd.right.isDown) vel.x = PLAYER_SPEED;
    if (this._cursors.up.isDown || this._wasd.up.isDown) vel.y = -PLAYER_SPEED;
    else if (this._cursors.down.isDown || this._wasd.down.isDown) vel.y = PLAYER_SPEED;

    // Pointer/touch — move toward target
    if (vel.x === 0 && vel.y === 0 && this._pointerTarget) {
      const dx = this._pointerTarget.x - this._player.x;
      const dy = this._pointerTarget.y - this._player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 8) {
        const spd = PLAYER_SPEED;
        vel.x = (dx / dist) * spd;
        vel.y = (dy / dist) * spd;
      } else {
        this._pointerTarget = null;
      }
    }

    // Normalize diagonal
    if (vel.x !== 0 && vel.y !== 0) {
      vel.x *= 0.707;
      vel.y *= 0.707;
    }

    this._player.setVelocity(vel.x, vel.y);

    const moving = vel.x !== 0 || vel.y !== 0;

    // Flip sprite based on direction
    if (vel.x < 0) this._player.setFlipX(true);
    else if (vel.x > 0) this._player.setFlipX(false);

    // Walk / idle animation
    const walkKey = `${this._playerKey}-walk`;
    const idleKey = `${this._playerKey}-idle`;
    if (moving) {
      if (this._player.anims.currentAnim?.key !== walkKey) {
        this._player.play(walkKey);
      }
    } else {
      if (this._player.anims.currentAnim?.key !== idleKey) {
        this._player.play(idleKey);
      }
    }
  }

  _checkInteraction() {
    if (this._dialogActive || this._interactionCooldown > 0) return;

    // Check NPCs
    for (const npcObj of this._npcs) {
      const dist = Phaser.Math.Distance.Between(
        this._player.x, this._player.y,
        npcObj.sprite.x, npcObj.sprite.y
      );
      if (dist <= INTERACT_DISTANCE) {
        this._talkToNPC(npcObj);
        return;
      }
    }
  }

  _checkTapInteraction(wx, wy) {
    if (this._interactionCooldown > 0) return;

    // Check if tap is near an NPC
    for (const npcObj of this._npcs) {
      const dist = Phaser.Math.Distance.Between(wx, wy, npcObj.sprite.x, npcObj.sprite.y);
      if (dist <= INTERACT_DISTANCE) {
        this._talkToNPC(npcObj);
        this._pointerTarget = null;
        return;
      }
    }
  }

  _talkToNPC(npcObj) {
    if (this._dialogActive) return;
    this._interactionCooldown = 800;

    const npcId = npcObj.data.id;
    if (npcId !== this._quest.startNpcId) return;

    let dialogLines;
    const seedsCollected = GameState.getProgress(this._questId, 'seeds-collected') || 0;
    const flowersDone = GameState.getProgress(this._questId, 'flowers-done') > 0;
    const stoneDone = GameState.getProgress(this._questId, 'puzzle-done') > 0;

    if (!this._questStarted) {
      dialogLines = this._quest.dialogs.start;
    } else if (this._isQuestObjectiveComplete()) {
      dialogLines = this._quest.dialogs.complete;
    } else {
      dialogLines = this._quest.dialogs.progress.map(line => {
        const text = line.text
          .replace('{found}', String(seedsCollected))
          .replace('{count}', String(seedsCollected));
        return { ...line, text };
      });
    }

    this._dialogActive = true;
    this._player.setVelocity(0, 0);
    this._pointerTarget = null;
    npcObj.exclaim.setVisible(false);

    this.scene.pause();
    this.scene.launch('Dialog', {
      lines: dialogLines,
      gameScene: this
    });
  }

  _isQuestObjectiveComplete() {
    const obj = this._quest.objectives[0];
    if (obj.type === 'collect') {
      const collected = GameState.getProgress(this._questId, 'seeds-collected') || 0;
      return collected >= obj.count;
    }
    if (obj.type === 'flower-sequence') {
      return GameState.getProgress(this._questId, 'flowers-done') > 0;
    }
    if (obj.type === 'memory-match') {
      return GameState.getProgress(this._questId, 'puzzle-done') > 0;
    }
    return false;
  }

  _onDialogComplete(action) {
    this.scene.resume();
    this._dialogActive = false;
    this._puzzleActive = false; // reset if puzzle was exited via give-up
    this._interactionCooldown = 600;

    if (action === 'start-quest') {
      this._questStarted = true;
      GameState.setProgress(this._questId, 'started', 1);
      // Show NPCexclaim off
      this._npcs.forEach(n => n.exclaim.setVisible(false));
      this._updateUI();
    } else if (action === 'complete-quest') {
      GameState.completeQuest(this._questId, this._quest.stars);
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.stop('UI');
        this.scene.start('Reward', { questId: this._questId });
      });
    }
  }

  _checkItemPickup() {
    if (!this._questStarted) return;

    for (const itemObj of this._items) {
      if (itemObj.collected) continue;
      const dist = Phaser.Math.Distance.Between(
        this._player.x, this._player.y,
        itemObj.sprite.x, itemObj.sprite.y
      );
      if (dist <= 28) {
        this._collectItem(itemObj);
      }
    }
  }

  _collectItem(itemObj) {
    itemObj.collected = true;
    itemObj.sprite.setVisible(false);
    itemObj.sprite.body.enable = false;

    const count = GameState.incProgress(this._questId, 'seeds-collected');
    GameState.setProgress(this._questId, `item-${itemObj.data.id}`, 1);

    // Pop animation
    this.tweens.add({
      targets: itemObj.sprite,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      onStart: () => itemObj.sprite.setVisible(true),
      onComplete: () => { itemObj.sprite.setVisible(false); itemObj.sprite.body.enable = false; }
    });

    // Floating +1 text
    const pop = this.add.text(itemObj.sprite.x, itemObj.sprite.y - 16, '+seed!', {
      fontSize: '14px',
      fontFamily: 'Arial Black',
      color: '#FFD700',
      stroke: '#000000',
      strokeThickness: 3
    }).setDepth(100);
    this.tweens.add({
      targets: pop,
      y: pop.y - 32,
      alpha: 0,
      duration: 900,
      onComplete: () => pop.destroy()
    });

    this._updateUI();

    // If all seeds collected, prompt return to NPC
    const total = this._quest.objectives[0].count;
    if (count >= total) {
      this._showReturnPrompt();
    }
  }

  _checkPuzzleTrigger() {
    if (!this._questStarted || this._puzzleActive || this._puzzleCompleted) return;
    const pt = this._mapData.puzzleTrigger;
    if (!pt) return;

    const px = pt.tileX * TILE_SIZE + TILE_SIZE / 2;
    const py = pt.tileY * TILE_SIZE + TILE_SIZE / 2;
    const dist = Phaser.Math.Distance.Between(this._player.x, this._player.y, px, py);

    if (dist <= INTERACT_DISTANCE && this._interactionCooldown <= 0) {
      this._launchPuzzle(pt.puzzleId);
    }
  }

  _launchPuzzle(puzzleId) {
    if (this._puzzleActive || this._puzzleCompleted || this._dialogActive) return;
    this._puzzleActive = true; // prevent double-launch
    this._dialogActive = true;
    this._player.setVelocity(0, 0);
    this._pointerTarget = null;
    this.scene.pause();
    this.scene.launch('Puzzle', { puzzleId, questId: this._questId, gameScene: this });
  }

  _onPuzzleComplete() {
    this.scene.resume();
    this._dialogActive = false;
    this._puzzleActive = false;
    this._puzzleCompleted = true;
    GameState.setProgress(this._questId, 'puzzle-done', 1);
    this._updateUI();
    this._showReturnPrompt();
  }

  _showReturnPrompt() {
    const npcName = this._mapData.npcs[0]?.name || 'the helper';
    const msg = this.add.text(
      this.scale.width / 2, 60,
      `✅ Return to ${npcName}!`,
      {
        fontSize: '15px',
        fontFamily: 'Arial Black',
        color: '#FFD700',
        backgroundColor: '#00000099',
        padding: { x: 10, y: 6 }
      }
    ).setOrigin(0.5).setDepth(200).setScrollFactor(0);

    this.tweens.add({
      targets: msg,
      alpha: 0,
      duration: 600,
      delay: 3000,
      onComplete: () => msg.destroy()
    });
  }

  _updateUI() {
    const uiScene = this.scene.get('UI');
    if (uiScene && uiScene.updateProgress) {
      uiScene.updateProgress();
    }
  }

  _spawnParticles(x, y, color) {
    for (let i = 0; i < 6; i++) {
      const p = this.add.rectangle(x, y, 6, 6, color).setDepth(50);
      const angle = (i / 6) * Math.PI * 2;
      const speed = 60 + Math.random() * 40;
      this.tweens.add({
        targets: p,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 600,
        ease: 'Power2',
        onComplete: () => p.destroy()
      });
    }
  }

  _showCheckmark(x, y) {
    const check = this.add.text(x, y - 32, '✨', { fontSize: '28px' })
      .setOrigin(0.5).setDepth(100);
    this.tweens.add({
      targets: check,
      y: check.y - 40,
      alpha: 0,
      duration: 1200,
      onComplete: () => check.destroy()
    });
  }
}
