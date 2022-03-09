let allAnime = {};
let titlesArray = [];
let titlesObj = {};
const thresholds = {
  episodes: 20,
  year: 10,
  popularity: 10000,
};
const yearRange = {
  min: 10000,
  max: 0,
  low: 10000,
  high: 0,
};
const epsRange = {
  min: 10000,
  max: 0,
  low: 10000,
  high: 0,
};
const sources = new Set();
const formats = new Set();
const headers = new Headers();
const fetchInit = {
  method: 'GET',
  headers: headers,
  mode: 'cors',
  cache: 'default',
};
const createNewButton = function(text) {
  const btn = document.createElement('button');
  btn.classList.add('btn', 'btn-primary', 'm-2');
  btn.textContent = text;
  btn.type = 'button';
  btn.id = text;
  return btn;
};

(function() {
  headers.append('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  fetch('http://127.0.0.1:5500/data/anime-titles.json', fetchInit)
    .then((response) => response.json())
    .then((anime_json) => {
        titlesArray = Object.entries(anime_json);
        titlesObj = anime_json;
    })
    .catch((err) => console.log(err));
  fetch('http://127.0.0.1:5500/data/anime-database.json', fetchInit)
    .then((response) => response.json())
    .then((anime_json) => {
      allAnime = anime_json;
      Object.values(allAnime).forEach((anime) => {
        const { episodes, source, format, year } = anime;
        if (episodes < epsRange.min) {
          epsRange.min = episodes;
        } else if (episodes > epsRange.max) {
          epsRange.max = episodes;
        }
        sources.add(source);
        formats.add(format);
        if (year < yearRange.min) {
          yearRange.min = year;
        } else if (year > yearRange.max) {
          yearRange.max = year;
        }
      });
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

      yearRange.low = yearRange.min;
      yearRange.high = yearRange.max;
      document.getElementById('year-low').textContent = yearRange.min;
      document.getElementById('year-high').textContent = yearRange.max;
    })
    .catch((err) => console.log(err));
}());
