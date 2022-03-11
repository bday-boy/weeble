const setFilter = function (A, strSet) {
  return isSubset(A, strSet);
};

const numFilter = function (rangeObj, value) {
  return (rangeObj.low <= value && value <= rangeObj.high);
};

const strFilter = function (strSet, value) {
  return (strSet.has(value));
};

const filters = {
  studios: (studioArr) => setFilter(new Set(studioArr), new Set(window.anime.studios)),
  episodes: (eps) => numFilter(epsRange, eps),
  popularity: (pop) => numFilter(popRange, pop),
  year: (yearVal) => numFilter(yearRange, yearVal),
  format: (formatVal) => strFilter(formats, formatVal),
  source: (sourceVal) => strFilter(sources, sourceVal),
  season: (seasonVal) => strFilter(seasons, seasonVal),
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
