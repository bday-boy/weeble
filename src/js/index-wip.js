const guessInfo = {
  studios: {
    active: true,
    name: 'studios',
    obj: possibleStudios,
    fltr (studioArr) {
      const guessStudios = new Set(studioArr);
      const answerStudios = new Set(window.anime.studios);
      return setFilter(guessStudios, answerStudios, this.obj);
    },
    checkAnswer (guess) {
      return setCompare(guess, this.name);
    },
    updateProgress (guessStudiosSet) {
      updateProgressSet(guessStudiosSet, this.obj, this.name);
    },
    tooltipText () {},
  },

  episodes: {
    active: true,
    name: 'episodes',
    obj: epsRange,
    fltr (eps) {
      return numFilter(this.obj, eps);
    },
    checkAnswer (guess) {
      return numCompare(guess, this.name);
    },
    updateProgress (guessEpisodes, dif, threshold) {
      updateNumRange(guessEpisodes, dif, threshold, this.obj, this.name);
    },
    tooltipText () {},
  },

  year: {
    active: true,
    name: 'year',
    obj: yearRange,
    fltr (yearVal) {
      return numFilter(this.obj, yearVal);
    },
    checkAnswer (guess) {
      return numCompare(guess, this.name);
    },
    updateProgress (guessYear, dif, threshold) {
      updateNumRange(guessYear, dif, threshold, this.obj, this.name);
    },
    tooltipText () {},
  },

  popularity: {
    active: true,
    name: 'popularity',
    obj: popRange,
    fltr (pop) {
      return numFilter(this.obj, pop);
    },
    checkAnswer (guess) {
      return numCompare(guess, this.name);
    },
    updateProgress (guessPopularity, dif, threshold) {
      updateNumRange(guessPopularity, dif, threshold, this.obj, this.name);
    },
    tooltipText () {},
  },

  source: {
    active: true,
    name: 'source',
    obj: sources,
    fltr (sourceVal) {
      return strFilter(this.obj, sourceVal);
    },
    checkAnswer (guess) {
      return strCompare(guess, this.name);
    },
    updateProgress (guessSource, status) {
      updateProgressGroup(guessSource, status, this.obj, this.name);
    },
    tooltipText () {},
  },

  format: {
    active: true,
    name: 'format',
    obj: formats,
    fltr (formatVal) {
      return strFilter(this.obj, formatVal);
    },
    checkAnswer (guess) {
      return strCompare(guess, this.name);
    },
    updateProgress (guessFormat, status) {
      updateProgressGroup(guessFormat, status, this.obj, this.name);
    },
    tooltipText () {},
  },

  season: {
    active: true,
    name: 'season',
    obj: seasons,
    fltr (seasonVal) {
      return strFilter(this.obj, seasonVal);
    },
    checkAnswer (guess) {
      return strCompare(guess, this.name);
    },
    updateProgress (guessSeason, status) {
      updateProgressGroup(guessSeason, status, this.obj, this.name);
    },
    tooltipText () {},
  }
};