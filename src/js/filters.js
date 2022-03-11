const setFilter = function (guessSet, knownSet, possibleSet) {
  return isSubset(guessSet, possibleSet) && isSubset(knownSet, guessSet);
};

const numFilter = function (rangeObj, value) {
  return (rangeObj.low <= value && value <= rangeObj.high);
};

const strFilter = function (strSet, value) {
  return (strSet.has(value));
};

const filters = {
  studios: (studioArr) => setFilter(new Set(studioArr), knownStudios, possibleStudios),
  episodes: (eps) => numFilter(epsRange, eps),
  year: (yearVal) => numFilter(yearRange, yearVal),
  format: (formatVal) => strFilter(formats, formatVal),
  source: (sourceVal) => strFilter(sources, sourceVal),
};

const filterAll = function () {
  filteredTitles = { titles: {}, synonyms: {} };
  Object.entries(allAnime).forEach((entry) => {
    const [animeId, animeInfo] = entry;
    const ignore = (
      Object.entries(filters).some(([key, fltr]) => !fltr(animeInfo[key]))
      || guessesHas(animeId)
    );
    if (!ignore) {
      const { title, synonyms } = animeInfo;
      filteredTitles.titles[title] = animeId;
      synonyms.forEach((title) => {
        filteredTitles.synonyms[title] = animeId;
      });
    }
  });
};

const filterGuesses = function () {
  filteredTitles = { titles: {}, synonyms: {} };
  Object.entries(allAnime).forEach((entry) => {
    const [animeId, animeInfo] = entry;
    const ignore = guessesHas(animeId);
    if (!ignore) {
      const { title, synonyms } = animeInfo;
      filteredTitles.titles[title] = animeId;
      synonyms.forEach((title) => {
        filteredTitles.synonyms[title] = animeId;
      });
    }
  });
};

const applyFilter = function () {
  if (shouldFilter()) {
    filterAll();
  } else {
    filterGuesses();
  }
};
