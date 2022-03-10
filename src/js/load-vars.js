window.anime = undefined;
let allAnime = {};
let titlesObj = {};
let titlesArray = [];
let filteredTitles = [];
const thresholds = {
  episodes: 0,
  year: 0,
  popularity: 0,
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
const sources = new Set();
const formats = new Set();
const seasons = new Set();
const headers = new Headers();
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

(function () {
  headers.append('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  fetch('http://127.0.0.1:5500/data/anime-titles.json', fetchInit)
    .then((response) => response.json())
    .then((anime_json) => {
      titlesObj = anime_json;
      titlesArray = Object.entries(anime_json);
      filteredTitles = Object.entries(anime_json);
    })
    .catch((err) => console.log(err));
  fetch('http://127.0.0.1:5500/data/anime-database.json', fetchInit)
    .then((response) => response.json())
    .then((anime_json) => {
      allAnime = anime_json;
      Object.values(allAnime).forEach((anime) => {
        const { studios, popularity, episodes, source, format, season, year } = anime;
        if (popularity < popRange.min) {
          popRange.min = popularity;
        } else if (popularity > popRange.max) {
          popRange.max = popularity;
        }
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
        seasons.add(season);
        if (year < yearRange.min) {
          yearRange.min = year;
        } else if (year > yearRange.max) {
          yearRange.max = year;
        }
      });
      popRange.low = popRange.min;
      popRange.high = popRange.max;
      document.getElementById('pop-low').textContent = popRange.min;
      document.getElementById('pop-high').textContent = popRange.max;

      epsRange.low = epsRange.min;
      epsRange.high = epsRange.max;
      document.getElementById('eps-low').textContent = epsRange.min;
      document.getElementById('eps-high').textContent = epsRange.max;

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

      const seasonsGroup = document.getElementById('seasons');
      [...seasons].forEach((season) => {
        const seasonBtn = createNewButton(season);
        seasonsGroup.appendChild(seasonBtn);
      });

      yearRange.low = yearRange.min;
      yearRange.high = yearRange.max;
      document.getElementById('year-low').textContent = yearRange.min;
      document.getElementById('year-high').textContent = yearRange.max;

      window.anime = randomAnime();
    })
    .catch((err) => console.log(err));
}());
