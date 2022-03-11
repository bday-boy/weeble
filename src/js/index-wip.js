const guessInfo = {
  studios: {
    name: 'studios',
    active: true,
    guessObj: undefined,
    progressObj: possibleStudios,
    fltr (studiosVal) {
      const guessStudios = new Set(studiosVal);
      const answerStudios = new Set(window.anime.studios);
      return setFilter(guessStudios, answerStudios, this.progressObj);
    },
    checkAnswer () {
      return setCompare(this.guessObj, this.name);
    },
    updateProgress () {
      updateProgressSet(this.guessObj, this.progressObj, this.name);
    },
    tooltipText () {
      const answerSet = new Set(window.anime.studios)
      const guessSet = new Set(this.guessObj);
      let answer = '';
      const incorrect = Array.from(setDif(guessSet, answerSet)).join(', ');
      const correct = Array.from(setIntersection(guessSet, answerSet)).join(', ');
      if (correct) {
        answer += `Correct studios: ${correct}`;
      }
      if (answer) {
        answer += '\n';
      }
      if (incorrect) {
        answer += `Incorrect studios: ${incorrect}`;
      }
      return answer;
    },
  },

  episodes: {
    name: 'episodes',
    active: true,
    threshold: 0,
    guessObj: undefined,
    progressObj: epsRange,
    fltr (episodesVal) {
      return numFilter(this.progressObj, episodesVal);
    },
    checkAnswer () {
      return numCompare(this.guessObj, this.name);
    },
    updateProgress () {
      const dif = this.guessObj - window.anime[this.name];
      updateNumRange(this.guessObj, dif, this.threshold, this.progressObj, this.name);
    },
    tooltipText () {},
  },

  year: {
    name: 'year',
    active: true,
    threshold: 0,
    guessObj: undefined,
    progressObj: yearRange,
    fltr (yearVal) {
      return numFilter(this.progressObj, yearVal);
    },
    checkAnswer () {
      return numCompare(this.guessObj, this.name);
    },
    updateProgress () {
      const dif = this.guessObj - window.anime[this.name];
      updateNumRange(this.guessObj, dif, this.threshold, this.progressObj, this.name);
    },
    tooltipText () {},
  },

  popularity: {
    name: 'popularity',
    active: true,
    threshold: 0,
    guessObj: undefined,
    progressObj: popRange,
    fltr (popularityVal) {
      return numFilter(this.progressObj, popularityVal);
    },
    checkAnswer () {
      return numCompare(this.guessObj, this.name);
    },
    updateProgress () {
      const dif = this.guessObj - window.anime[this.name];
      updateNumRange(this.guessObj, dif, this.threshold, this.progressObj, this.name);
    },
    tooltipText () {},
  },

  source: {
    name: 'source',
    active: true,
    guessObj: undefined,
    progressObj: sources,
    fltr (sourceVal) {
      return strFilter(this.progressObj, sourceVal);
    },
    checkAnswer () {
      return strCompare(this.guessObj, this.name);
    },
    updateProgress () {
      const status = (this.guessObj === window.anime[this.name]) ? 'correct' : 'incorrect';
      updateProgressGroup(this.guessObj, status, this.progressObj, this.name);
    },
    tooltipText () {},
  },

  format: {
    name: 'format',
    active: true,
    guessObj: undefined,
    progressObj: formats,
    fltr (formatVal) {
      return strFilter(this.progressObj, formatVal);
    },
    checkAnswer () {
      return strCompare(this.guessObj, this.name);
    },
    updateProgress () {
      const status = (this.guessObj === window.anime[this.name]) ? 'correct' : 'incorrect';
      updateProgressGroup(this.guessObj, status, this.progressObj, this.name);
    },
    tooltipText () {},
  },

  season: {
    name: 'season',
    active: true,
    guessObj: undefined,
    progressObj: seasons,
    fltr (seasonVal) {
      return strFilter(this.progressObj, seasonVal);
    },
    checkAnswer () {
      return strCompare(this.guessObj, this.name);
    },
    updateProgress () {
      const status = (this.guessObj === window.anime[this.name]) ? 'correct' : 'incorrect';
      updateProgressGroup(this.guessObj, status, this.progressObj, this.name);
    },
    tooltipText () {},
  }
};