const setFilter = function (strSet, A) {
  return isSubset(A, strSet);
};

const numFilter = function (rangeObj, value) {
  return (rangeObj.low <= value && value <= rangeObj.high);
};

const strFilter = function (strSet, value) {
  return (strSet.has(value));
};

const filters = {
  studios: (studioArr) => setFilter(possibleStudios, new Set(studioArr)),
  episodes: (eps) => numFilter(epsRange, eps),
  popularity: (pop) => numFilter(popRange, pop),
  year: (yearVal) => numFilter(yearRange, yearVal),
  format: (formatVal) => strFilter(formats, formatVal),
  source: (sourceVal) => strFilter(sources, sourceVal),
  season: (seasonVal) => strFilter(seasons, seasonVal),
};

const filterAll = function () {
  filteredTitles = {};
  Object.entries(allAnime).forEach((entry) => {
    const [animeId, animeInfo] = entry;
    if (animeId === '11701') {
      const a = 1;
    }
    const ignore = Object.entries(filters).some(([key, fltr]) => !fltr(animeInfo[key]));
    if (!ignore) {
      const { title, synonyms } = animeInfo;
      const allTitles = Array.prototype.concat([title], synonyms);
      allTitles.forEach((title) => {
        filteredTitles[title] = animeId;
      });
    }
  });
  filteredTitles = Object.entries(filteredTitles);
};

(function () {
  document.getElementById('apply-filters').addEventListener('click', function () {
    if (this.checked) {
      filterAll();
    } else {
      filteredTitles = titlesArray;
    }
  });
})();
