let anime;
let animeTitles;
let animeTitleToId;
let suggestions = [];
const headers = new Headers();
const fetchInit = {
  method: 'GET',
  headers: headers,
  mode: 'cors',
  cache: 'default',
};

const replaceInput = function() {
  const newValue = this.querySelector('div').textContent;
  document.getElementById('anime-entry').value = newValue;
  const dropdown = this.parentNode;
  while (dropdown.firstChild) {
    dropdown.removeChild(dropdown.firstChild);
  }
};

const createAnimeLi = function(animeId) {
  const anime_info = anime[animeId];
  const li = document.createElement('li');
  li.classList.add('dropdown-item');
  const div = document.createElement('div');
  div.textContent = anime_info.title;
  const small = document.createElement('small');
  small.textContent = `Studio(s): ${anime_info.studios.join(", ")}, Year: ${anime_info.year}, Director(s): ${anime_info.directors.join(", ")}, Episodes: ${anime_info.episodes}, Anilist score: ${anime_info.averageScore}`;
  li.appendChild(div);
  li.appendChild(small);
  li.addEventListener('click', replaceInput);
  return li;
};

const createSuggestions = function(suggestions_array, dropdown_element) {
  const idSet = new Set();
  suggestions_array.forEach((suggestion) => {
    const animeId = animeTitleToId[suggestion];
    idSet.add(animeId);
  })
  Array.from(idSet).forEach((animeId) => {
    const li = createAnimeLi(animeId);
    dropdown_element.appendChild(li);
  });
};

const suggestAnime = function(event) {
  const input = event.target.value;
  const dropdown = document.getElementById('anime-suggestions');
  while (dropdown.firstChild) {
    dropdown.removeChild(dropdown.firstChild);
  }
  if (anime === undefined || animeTitles === undefined || input === '') {
    suggestions = [];
    dropdown.classList.remove('show');
  }
  else if (event.prevLen === undefined || event.prevLen < input.length) {
    suggestions = animeTitles.filter((title) => title.toLowerCase().indexOf(input) > -1);
  }
  else {
    suggestions = suggestions.filter((title) => title.toLowerCase().indexOf(input) > -1);
  }
  createSuggestions(suggestions, dropdown);
  dropdown.classList.add('show');
  event.prevLen = input.length;
};

(function() {
  headers.append('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  fetch('http://127.0.0.1:5500/data/anime-titles.json', fetchInit)
    .then((response) => response.json())
    .then((anime_json) => {
      animeTitleToId = anime_json
      animeTitles = Object.keys(anime_json);
    })
    .catch((err) => console.log(err));
  fetch('http://127.0.0.1:5500/data/anime-database.json', fetchInit)
    .then((response) => response.json())
    .then((anime_json) => {
      anime = anime_json;
      const animeEntry = document.getElementById('anime-entry');
      animeEntry.addEventListener('input', suggestAnime);
      // animeEntry.addEventListener('paste', suggestAnime);
    })
    .catch((err) => console.log(err));
}());
