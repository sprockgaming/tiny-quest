export const TILE_SIZE = 32;
export const MAP_WIDTH = 25;
export const MAP_HEIGHT = 18;

export const TILE = {
  GRASS: 0,
  TREE: 1,
  WATER: 2,
  PATH: 3,
  FENCE: 4,
  BUILDING: 5,
  ROCK: 6,
  TALL_GRASS: 7,
  STONE: 8
};

export const SOLID_TILES = new Set([1, 2, 4, 5, 6]);

export const TILE_KEYS = [
  'tile-grass',      // 0
  'tile-tree',       // 1
  'tile-water',      // 2
  'tile-path',       // 3
  'tile-fence',      // 4
  'tile-building',   // 5
  'tile-rock',       // 6
  'tile-tallgrass',  // 7
  'tile-stone'       // 8
];

export const HERO_TYPES = ['knight', 'mage', 'archer', 'healer'];

export const HERO_COLORS = {
  knight: 0xB71C1C,
  mage:   0x4A148C,
  archer: 0x1B5E20,
  healer: 0xF9A825
};

export const HERO_LABELS = {
  knight: 'Knight',
  mage:   'Mage',
  archer: 'Archer',
  healer: 'Healer'
};

export const PLAYER_COLORS = [
  { hex: 0xE53935, name: 'Red' },
  { hex: 0x1E88E5, name: 'Blue' },
  { hex: 0x43A047, name: 'Green' },
  { hex: 0xFDD835, name: 'Yellow' },
  { hex: 0x8E24AA, name: 'Purple' },
  { hex: 0xFF7043, name: 'Orange' }
];

export const PLAYER_SPEED = 160;
export const INTERACT_DISTANCE = 48;
