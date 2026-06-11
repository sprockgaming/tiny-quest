import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import PreloadScene from './scenes/PreloadScene';
import TitleScene from './scenes/TitleScene';
import TutorialScene from './scenes/TutorialScene';
import CharacterSelectScene from './scenes/CharacterSelectScene';
import QuestBoardScene from './scenes/QuestBoardScene';
import GameScene from './scenes/GameScene';
import UIScene from './scenes/UIScene';
import DialogScene from './scenes/DialogScene';
import PuzzleScene from './scenes/PuzzleScene';
import RewardScene from './scenes/RewardScene';

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 576,
  parent: 'game-container',
  backgroundColor: '#0d1b2a',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    min: { width: 320, height: 230 },
    max: { width: 1600, height: 1152 },
  },
  scene: [
    BootScene,
    PreloadScene,
    TitleScene,
    TutorialScene,
    CharacterSelectScene,
    QuestBoardScene,
    GameScene,
    UIScene,
    DialogScene,
    PuzzleScene,
    RewardScene
  ]
};

new Phaser.Game(config);
