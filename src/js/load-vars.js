let allAnime = {};
let titlesArray = [];
let titlesObj = {};
const headers = new Headers();
const fetchInit = {
  method: 'GET',
  headers: headers,
  mode: 'cors',
  cache: 'default',
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
      const animeEntry = document.getElementById('anime-entry');
      animeEntry.addEventListener('input', suggestAnime);
    })
    .catch((err) => console.log(err));
}());
