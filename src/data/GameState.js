const SAVE_KEY = 'tinyquest_save';

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

  save() {
    try {
      const data = {
        playerName: this.playerName,
        playerHero: this.playerHero,
        playerColor: this.playerColor,
        questsCompleted: this.questsCompleted,
        starsEarned: this.starsEarned,
        questProgress: this.questProgress,
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      // localStorage unavailable (private browsing, storage full, etc.)
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw);
      this.playerName = data.playerName ?? 'Hero';
      this.playerHero = data.playerHero ?? 'knight';
      this.playerColor = data.playerColor ?? 0xE53935;
      this.questsCompleted = data.questsCompleted ?? [];
      this.starsEarned = data.starsEarned ?? 0;
      this.questProgress = data.questProgress ?? {};
      return true;
    } catch (e) {
      return false;
    }
  },

  hasSave() {
    try {
      return localStorage.getItem(SAVE_KEY) !== null;
    } catch (e) {
      return false;
    }
  },

  clearSave() {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (e) {
      // ignore
    }
  },

  isQuestComplete(questId) {
    return this.questsCompleted.includes(questId);
  },

  completeQuest(questId, stars) {
    if (!this.isQuestComplete(questId)) {
      this.questsCompleted.push(questId);
      this.starsEarned += stars;
      this.save();
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
