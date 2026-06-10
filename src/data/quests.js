export const QUESTS = [
  {
    id: 'seeds',
    title: 'Help Farmer Bob',
    emoji: '🌱',
    shortDesc: 'Find the 3 missing seed bags',
    longDesc: "Farmer Bob dropped his seed bags while working in the fields. Help him find all 3 bags hidden around the farm!",
    stars: 3,
    mapId: 'farm',
    startNpcId: 'farmer-bob',
    objectives: [
      { id: 'collect-seeds', type: 'collect', itemId: 'seed', count: 3, label: 'Find seed bags' }
    ],
    dialogs: {
      start: [
        { speaker: 'Farmer Bob', portrait: 'portrait-farmer', text: "Oh hello there, little adventurer! I've had a terrible morning!" },
        { speaker: 'Farmer Bob', portrait: 'portrait-farmer', text: "I dropped all 3 of my seed bags somewhere in the fields. They look like little brown pouches!" },
        { speaker: 'Farmer Bob', portrait: 'portrait-farmer', text: "Could you please find them for me? I'll give you 3 stars if you do!", action: 'start-quest' }
      ],
      progress: [
        { speaker: 'Farmer Bob', portrait: 'portrait-farmer', text: "You've found {found} out of 3 seed bags so far. Keep looking, they're around here somewhere!" }
      ],
      complete: [
        { speaker: 'Farmer Bob', portrait: 'portrait-farmer', text: "You found them ALL! Oh, thank you so much!" },
        { speaker: 'Farmer Bob', portrait: 'portrait-farmer', text: "You're truly a wonderful helper. Here are 3 stars — you've earned them!", action: 'complete-quest' }
      ]
    }
  },
  {
    id: 'garden',
    title: 'The Magic Garden',
    emoji: '🌸',
    shortDesc: 'Water the flowers in the right order',
    longDesc: "Gardener Lily's magic flowers need to be watered in a special order. Look at the hint sign and tap the flowers in the right sequence to make them bloom!",
    stars: 3,
    mapId: 'garden',
    startNpcId: 'gardener-lily',
    objectives: [
      { id: 'flower-sequence', type: 'flower-sequence', label: 'Water the flowers in order' }
    ],
    dialogs: {
      start: [
        { speaker: 'Gardener Lily', portrait: 'portrait-gardener', text: "Welcome to my magic garden! The flowers are a little wilted..." },
        { speaker: 'Gardener Lily', portrait: 'portrait-gardener', text: "They need to be watered in a special order. The big sign near the flowers shows you the sequence!" },
        { speaker: 'Gardener Lily', portrait: 'portrait-gardener', text: "Tap each flower in the right order and watch them bloom! Good luck!", action: 'start-quest' }
      ],
      progress: [
        { speaker: 'Gardener Lily', portrait: 'portrait-gardener', text: "You're doing great! Remember to check the hint sign if you get stuck!" }
      ],
      complete: [
        { speaker: 'Gardener Lily', portrait: 'portrait-gardener', text: "Oh WOW! Look at them! They're all in full bloom, they're so beautiful!" },
        { speaker: 'Gardener Lily', portrait: 'portrait-gardener', text: "You have a real talent with flowers! Here are 3 sparkling stars for you!", action: 'complete-quest' }
      ]
    }
  },
  {
    id: 'stones',
    title: 'The Memory Stones',
    emoji: '💎',
    shortDesc: 'Match all the magic stone pairs',
    longDesc: "The Forest Spirit guards a magical treasure! To unlock it, match all the magic memory stones hidden in the clearing.",
    stars: 3,
    mapId: 'forest',
    startNpcId: 'forest-spirit',
    objectives: [
      { id: 'memory-match', type: 'memory-match', label: 'Match all stone pairs' }
    ],
    dialogs: {
      start: [
        { speaker: 'Forest Spirit', portrait: 'portrait-spirit', text: "Greetings, young adventurer! I am the guardian of this ancient forest." },
        { speaker: 'Forest Spirit', portrait: 'portrait-spirit', text: "I hold a magical treasure, but it can only be claimed by someone with a sharp memory!" },
        { speaker: 'Forest Spirit', portrait: 'portrait-spirit', text: "Find all the matching pairs of magic stones. Tap a stone to reveal it — then find its twin!", action: 'start-quest' }
      ],
      progress: [
        { speaker: 'Forest Spirit', portrait: 'portrait-spirit', text: "You remember well! Keep finding those pairs — you're almost there!" }
      ],
      complete: [
        { speaker: 'Forest Spirit', portrait: 'portrait-spirit', text: "Incredible! You matched every single stone! Your memory is truly extraordinary!" },
        { speaker: 'Forest Spirit', portrait: 'portrait-spirit', text: "The treasure is yours, brave one — 3 magical stars to keep forever!", action: 'complete-quest' }
      ]
    }
  },
  {
    id: 'kittens',
    title: 'Lost Kittens',
    emoji: '🐱',
    shortDesc: 'Find the 4 kittens in the village',
    longDesc: "Elder Maria's 4 kittens have wandered off into the village. Help her find them all!",
    stars: 3,
    mapId: 'village',
    startNpcId: 'elder-maria',
    objectives: [
      { id: 'collect-kittens', type: 'collect', itemId: 'kitten', count: 4, label: 'Find lost kittens' }
    ],
    dialogs: {
      start: [
        { speaker: 'Elder Maria', portrait: 'portrait-elder', text: "Oh my goodness, kind traveller! My four little kittens have run off again!" },
        { speaker: 'Elder Maria', portrait: 'portrait-elder', text: "They love to hide in all the nooks of this village. Could you find them for me?" },
        { speaker: 'Elder Maria', portrait: 'portrait-elder', text: "I'll reward you handsomely with 3 shining stars!", action: 'start-quest' }
      ],
      progress: [
        { speaker: 'Elder Maria', portrait: 'portrait-elder', text: "You've found {found} out of 4 kittens. Keep looking, they're hiding nearby!" }
      ],
      complete: [
        { speaker: 'Elder Maria', portrait: 'portrait-elder', text: "Oh thank you, thank you! All four are safe and sound!" },
        { speaker: 'Elder Maria', portrait: 'portrait-elder', text: "You have a kind heart, adventurer. Here are 3 stars — you deserve every one!", action: 'complete-quest' }
      ]
    }
  },
  {
    id: 'crystals',
    title: 'Crystal Hunt',
    emoji: '💠',
    shortDesc: 'Collect 5 glowing crystals from the cave',
    longDesc: "Sir Roland needs 5 ancient crystals scattered throughout the cave to restore the kingdom's shield. Brave the dark cave and collect them all!",
    stars: 3,
    mapId: 'cave',
    startNpcId: 'knight-captain',
    objectives: [
      { id: 'collect-crystals', type: 'collect', itemId: 'crystal', count: 5, label: 'Collect cave crystals' }
    ],
    dialogs: {
      start: [
        { speaker: 'Sir Roland', portrait: 'portrait-captain', text: "Hail, adventurer! Our kingdom's magical shield is failing!" },
        { speaker: 'Sir Roland', portrait: 'portrait-captain', text: "Five ancient crystals are scattered in this cave. We need all of them to recharge it!" },
        { speaker: 'Sir Roland', portrait: 'portrait-captain', text: "Venture forth and collect them. I'll award you 3 stars for your bravery!", action: 'start-quest' }
      ],
      progress: [
        { speaker: 'Sir Roland', portrait: 'portrait-captain', text: "You've retrieved {found} of 5 crystals. The kingdom is counting on you!" }
      ],
      complete: [
        { speaker: 'Sir Roland', portrait: 'portrait-captain', text: "All five crystals! The shield is restored! You've saved the kingdom!" },
        { speaker: 'Sir Roland', portrait: 'portrait-captain', text: "A true hero stands before me. Accept these 3 stars as a token of our eternal gratitude!", action: 'complete-quest' }
      ]
    }
  }
];
