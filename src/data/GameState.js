const GameState = {
  playerName: 'Hero',
  playerHero: 'knight',
  playerColor: 0xE53935,
  questsCompleted: [],
  starsEarned: 0,
  currentQuestId: null,
  questProgress: {},

  reset() {
    this.playerName = 'Hero';
    this.playerHero = 'knight';
    this.playerColor = 0xE53935;
    this.questsCompleted = [];
    this.starsEarned = 0;
    this.currentQuestId = null;
    this.questProgress = {};
  },

  isQuestComplete(questId) {
    return this.questsCompleted.includes(questId);
  },

  completeQuest(questId, stars) {
    if (!this.isQuestComplete(questId)) {
      this.questsCompleted.push(questId);
      this.starsEarned += stars;
    }
  },

  getProgress(questId, key) {
    if (!this.questProgress[questId]) return 0;
    return this.questProgress[questId][key] || 0;
  },

  setProgress(questId, key, value) {
    if (!this.questProgress[questId]) this.questProgress[questId] = {};
    this.questProgress[questId][key] = value;
  },

  incProgress(questId, key) {
    const current = this.getProgress(questId, key);
    this.setProgress(questId, key, current + 1);
    return current + 1;
  }
};

export default GameState;
