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
  episodes: (eps) => numFilter(weeble.ranges.episodes, eps),
  year: (yearVal) => numFilter(weeble.ranges.year, yearVal),
  format: (formatVal) => strFilter(weeble.formats, formatVal),
  source: (sourceVal) => strFilter(weeble.sources, sourceVal),
};

const filterAll = function () {
  weeble.filteredTitles = { titles: {}, synonyms: {} };
  Object.entries(weeble.allAnime).forEach((entry) => {
    const [animeId, animeInfo] = entry;
    const ignore = (
      Object.entries(filters).some(([key, fltr]) => !fltr(animeInfo[key]))
      || weeble.guesses.has(animeId)
    );
    if (!ignore) {
      const { title, synonyms } = animeInfo;
      weeble.filteredTitles.titles[title] = animeId;
      synonyms.forEach((title) => {
        weeble.filteredTitles.synonyms[title] = animeId;
      });
    }
  });
};

const filterGuesses = function () {
  weeble.filteredTitles = { titles: {}, synonyms: {} };
  Object.entries(weeble.allAnime).forEach((entry) => {
    const [animeId, animeInfo] = entry;
    const ignore = weeble.guesses.has(animeId);
    if (!ignore) {
      const { title, synonyms } = animeInfo;
      weeble.filteredTitles.titles[title] = animeId;
      synonyms.forEach((title) => {
        weeble.filteredTitles.synonyms[title] = animeId;
      });
    }
  });
};

const applyFilter = function (shouldFilter) {
  if (shouldFilter) {
    filterAll();
  } else {
    filterGuesses();
  }
};

export default applyFilter;
