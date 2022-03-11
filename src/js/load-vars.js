window.anime = undefined;
let allAnime = {};
let possibleAnimeAnswers = {};
let titlesObj = {};
let filteredTitles = {};
const thresholds = {
  episodes: 15,
  year: 5,
};
const yearRange = {
  min: 1000000,
  max: 0,
  low: 1000000,
  high: 0,
};
const epsRange = {
  min: 1000000,
  max: 0,
  low: 1000000,
  high: 0,
};
const popRange = {
  min: 1000000,
  max: 0,
  low: 1000000,
  high: 0,
};
const possibleStudios = new Set();
const knownStudios = new Set();
const sources = new Set();
const formats = new Set();
const guesses = new Set();
const guessesAdd = (animeId) => guesses.add(parseInt(animeId));
const guessesHas = (animeId) => guesses.has(parseInt(animeId));
const headers = new Headers({
  'Access-Control-Allow-Origin': 'http://127.0.0.1:5500'
});
const fetchInit = {
  method: 'GET',
  headers: headers,
  mode: 'cors',
  cache: 'default',
};
const filterToggle = document.getElementById('apply-filters');
const shouldFilter = () => filterToggle.checked;
const createNewButton = function (text) {
  const small = document.createElement('small');
  small.textContent = text;

  const btn = document.createElement('button');
  btn.appendChild(small);
  btn.classList.add('btn', 'btn-primary', 'm-1', 'fs-6');
  btn.type = 'button';
  btn.id = text;
  return btn;
};
const useAnime = function (anime) {
  return 25000 < anime.popularity;
};
const loadTitles = function () {
  return fetch('http://127.0.0.1:5500/data/anime-titles.json', fetchInit)
    .then((response) => response.json())
    .then((anime_json) => {
      const titles = anime_json.titles;
      const synonyms = anime_json.synonyms;
      titlesObj = {...synonyms, ...titles};
      filteredTitles = anime_json;
    })
    .catch((err) => console.log(err));
};
const loadAnime = function () {
  return fetch('http://127.0.0.1:5500/data/anime-database.json', fetchInit)
    .then((response) => response.json())
    .then((anime_json) => {
      allAnime = anime_json;
      Object.entries(allAnime).forEach(([animeId, animeInfo]) => {
        const { studios, episodes, source, format, year } = animeInfo;
        if (episodes < epsRange.min) {
          epsRange.min = episodes;
        } else if (episodes > epsRange.max) {
          epsRange.max = episodes;
        }
        studios.forEach((studio) => {
          possibleStudios.add(studio);
        })
        sources.add(source);
        formats.add(format);
        if (year < yearRange.min) {
          yearRange.min = year;
        } else if (year > yearRange.max) {
          yearRange.max = year;
        }

        if (useAnime(animeInfo)) {
          possibleAnimeAnswers[animeId] = animeInfo;
        }
      });

      epsRange.low = epsRange.min;
      epsRange.high = epsRange.max;
      document.getElementById('episodes-low').textContent = epsRange.min;
      document.getElementById('episodes-high').textContent = epsRange.max;

      const sourcesGroup = document.getElementById('sources');
      [...sources].forEach((source) => {
        const sourceBtn = createNewButton(source);
        sourcesGroup.appendChild(sourceBtn);
      });

      const formatsGroup = document.getElementById('formats');
      [...formats].forEach((format) => {
        const formatBtn = createNewButton(format);
        formatsGroup.appendChild(formatBtn);
      });

      yearRange.low = yearRange.min;
      yearRange.high = yearRange.max;
      document.getElementById('year-low').textContent = yearRange.min;
      document.getElementById('year-high').textContent = yearRange.max;

      window.anime = randomAnime();
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
