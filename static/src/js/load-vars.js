bsElements = {
  modals: {
    about: new bootstrap.Modal(document.getElementById('modal-about')),
    support: new bootstrap.Modal(document.getElementById('modal-support')),
    stats: new bootstrap.Modal(document.getElementById('modal-stats')),
    settings: new bootstrap.Modal(document.getElementById('modal-settings')),
    end: new bootstrap.Modal(document.getElementById('modal-end')),
  },
  toasts: {
    copySuccess: new bootstrap.Toast(document.getElementById('copy-success'), {
      delay: 3000
    }),
    copyFailure: new bootstrap.Toast(document.getElementById('copy-danger'), {
      delay: 3000
    }),
  },
  dropdown: new bootstrap.Dropdown(document.querySelector('.dropdown-toggle'))
};

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
    max: 8,
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

const randomAnime = function (allAnimeObj) {
  const allAnimeObjs = Object.entries(allAnimeObj);
  const anime = allAnimeObjs[Math.floor(Math.random() * allAnimeObjs.length)];
  return anime[1];
};

/**
 * Fetches the anime-database json and unpacks it into the weeble namespace.
 * @returns {Promise} A promise that, once resolved, has set all anime data into
 * the weeble namespace.
 */
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

        if (25000 < animeInfo.popularity) {
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

/**
 * Queries the server for the current daily anime.
 * @returns {Promise} A promise that, once resolved, has set the daily anime.
 */
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

/**
 * 
 * @returns {Promise} A promise that, once resolved, has set all titles into
 * the weeble namespace.
 */
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

/**
 * Given the AniList ID of an anime, returns a promise that resolves into an
 * array of all non-spoiler tags for that anime.
 * @param {number} animeId - AniList ID of the anime to fetch tags for
 * @returns {Promise<Array.<Object>} A promise that resolves into an array of tags
 */
const fetchAnswerData = function (animeId) {
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
      genres
      hashtag
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
      const { tags, genres } = data.data.Media;
      const hasSpoiler = (tag) => (tag.isGeneralSpoiler || tag.isMediaSpoiler);
      const nonSpoilerTags = tags.filter((tag) => !hasSpoiler(tag));
      return { tags: nonSpoilerTags, genres };
    })
    .catch((error) => console.log(error));
};

/**
 * Removes all bootstrap placeholder items from the document.
 */
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
