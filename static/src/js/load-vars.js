weeble = {
  anime: undefined,
  allAnime: {},
  possibleAnime: {},
  titles: {},
  filteredTitles: {},
  thresholds: {
    episodes: 5,
    year: 1,
  },
  guesses: {
    set: new Set(),
    has: function (animeId) {
      return this.set.has(parseInt(animeId));
    },
    add: function (animeId) {
      return this.set.add(parseInt(animeId));
    }
  },
  studios: {
    possible: new Set(),
    known: new Set()
  },
  sources: new Set(),
  formats: new Set(),
  ranges: {
    year: {
      min: 1000000,
      max: 0,
      low: 1000000,
      high: 0,
    },
    episodes: {
      min: 1000000,
      max: 0,
      low: 1000000,
      high: 0,
    },
  },
};
const useAnime = function (anime) {
  return 25000 < anime.popularity;
};
const fetchAllAnime = function () {
  return fetch('/data/anime-database.json')
    .then((response) => response.json())
    .then((anime_json) => {
      weeble.allAnime = anime_json;
      Object.entries(weeble.allAnime).forEach(([animeId, animeInfo]) => {
        const { studios, episodes, source, format, year } = animeInfo;
        if (episodes < weeble.ranges.episodes.min) {
          weeble.ranges.episodes.min = episodes;
        } else if (episodes > weeble.ranges.episodes.max) {
          weeble.ranges.episodes.max = episodes;
        }
        studios.forEach((studio) => {
          weeble.studios.possible.add(studio);
        });
        weeble.sources.add(source);
        weeble.formats.add(format);
        if (year < weeble.ranges.year.min) {
          weeble.ranges.year.min = year;
        } else if (year > weeble.ranges.year.max) {
          weeble.ranges.year.max = year;
        }

        if (useAnime(animeInfo)) {
          weeble.possibleAnime[animeId] = animeInfo;
        }
      });

      weeble.ranges.episodes.low = weeble.ranges.episodes.min;
      weeble.ranges.episodes.high = weeble.ranges.episodes.max;

      weeble.ranges.year.low = weeble.ranges.year.min;
      weeble.ranges.year.high = weeble.ranges.year.max;
    })
    .catch((err) => console.log(err));
};
const fetchDailyAnime = function () {
  return fetch('/daily')
    .then((response) => response.json())
    .then((dailyAnime) => {
      if (dailyAnime.daily) {
        weeble.anime = dailyAnime.daily;
      } else {
        weeble.anime = randomAnime(weeble.possibleAnime);
      }
    })
    .catch(() => weeble.anime = randomAnime(weeble.possibleAnime));
};
const fetchAnimeTitles = function () {
  return fetch('/data/anime-titles.json')
    .then((response) => response.json())
    .then((anime_json) => {
      const titles = anime_json.titles;
      const synonyms = anime_json.synonyms;
      weeble.titles = {...synonyms, ...titles};
      weeble.filteredTitles = anime_json;
    })
    .catch((err) => console.log(err));
};
const fetchTags = function (animeId) {
  const query = `
  query ($id: Int) {
    Media (id: $id, type: ANIME) {
      tags {
        name
        category
        rank
        isGeneralSpoiler
        isMediaSpoiler
        isAdult
      }
    }
  }
  `;
  const variables = {
    id: animeId
  };
  const url = 'https://graphql.anilist.co';
  const headers = new Headers({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  });
  const fetchInit = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      query: query,
      variables: variables
    }),
    mode: 'cors',
    cache: 'default',
  };
  return fetch(url, fetchInit)
    .then((response) => {
      return response.json()
        .then((json) => (response.ok ? json : Promise.reject(json)));
    })
    .then((data) => {
      const tags = data.data.Media.tags;
      const hasSpoiler = (tag) => (tag.isGeneralSpoiler || tag.isMediaSpoiler);
      const nonSpoilerTags = tags.filter((tag) => !hasSpoiler(tag));
      return nonSpoilerTags;
    })
    .catch((error) => console.log(error));
};
const removePlaceholders = function () {
  document.querySelectorAll('.placeholder').forEach((placeholder) => {
    placeholder.remove();
  });

  document.querySelectorAll('.placeholder-glow').forEach((placeholder) => {
    placeholder.classList.remove('placeholder-glow');
  });

  document.querySelectorAll('.progress-bar-striped.progress-bar-animated').forEach((progressBar) => {
    progressBar.classList.remove('progress-bar-striped', 'progress-bar-animated');
  });

  const { min: episodesMin, max: episodesMax } = weeble.ranges.episodes;
  document.getElementById('episodes-low').textContent = episodesMin;
  document.getElementById('episodes-high').textContent = episodesMax;

  const { min: yearMin, max: yearMax } = weeble.ranges.year;
  document.getElementById('year-low').textContent = yearMin;
  document.getElementById('year-high').textContent = yearMax;
};
