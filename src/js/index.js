let suggestions = [];
let inputLen = 0;

const replaceInput = function () {
  /* replaces the text in the input with the clicked suggestion */
  const newValue = this.querySelector('div').textContent;
  document.getElementById('anime-entry').value = newValue;
  const dropdown = this.parentNode;
  while (dropdown.firstChild) {
    dropdown.removeChild(dropdown.firstChild);
  }
  dropdown.classList.remove('show');
};

const highlightText = function (text, index) {
  /* highlight just the part of the text the user has typed in */
  const leftSpan = document.createElement('span');
  leftSpan.textContent = text.slice(0, index);
  const highlight = document.createElement('mark');
  highlight.textContent = text.slice(index, index + inputLen);
  const rightSpan = document.createElement('span');
  rightSpan.textContent = text.slice(index + inputLen);

  /* wrap all text in a div */
  const div = document.createElement('div');
  div.appendChild(leftSpan);
  div.appendChild(highlight);
  div.appendChild(rightSpan);
  return div;
};

const createAnimeLi = function (animeId, title, index) {
  const anime_info = allAnime[animeId];

  const div = highlightText(title, index);
  div.classList.add('text-wrap');

  const small = document.createElement('small');
  small.textContent = `Studio(s): ${anime_info.studios.join(", ")}, Year: ${anime_info.year}, Episodes: ${anime_info.episodes}, Anilist popularity: ${anime_info.popularity}, Format: ${anime_info.format} Source: ${anime_info.source}`;
  small.classList.add('text-wrap');

  const a = document.createElement('a');
  a.classList.add('dropdown-item');
  a.appendChild(div);
  a.appendChild(small);

  const li = document.createElement('li');
  li.appendChild(a);
  li.addEventListener('click', replaceInput);
  return li;
};

const createSuggestions = function (dropdown_element) {
  const idSet = new Set();
  suggestions.forEach((suggestion) => {
    const [title, animeId, index] = suggestion;
    if (!idSet.has(animeId)) {
      idSet.add(animeId);
      const li = createAnimeLi(animeId, title, index);
      dropdown_element.appendChild(li);
    }
  });
};

const filterSuggestions = function (arr, input) {
  const suggestions = [];
  arr.forEach((entry) => {
    const [title, animeId] = entry;
    const foundIndex = title.toLowerCase().indexOf(input);
    if (foundIndex > -1) {
      suggestions.push([title, animeId, foundIndex])
    }
  });
  return suggestions;
}

const toggleDropdown = function (dropdown, hide) {
  if (hide) {
    dropdown.classList.remove('show');
  } else {
    dropdown.classList.add('show');
  }
};

const suggestAnime = function () {
  const animeEntry = document.getElementById('anime-entry');
  const input = animeEntry.value.toLowerCase();
  const dropdown = document.getElementById('anime-suggestions');
  inputLen = input.length;
  while (dropdown.firstChild) {
    dropdown.removeChild(dropdown.firstChild);
  }
  if (allAnime === undefined || filteredTitles === undefined) {
    suggestions = [];
  }
  else if (animeEntry.prevLen === undefined || inputLen <= animeEntry.prevLen) {
    suggestions = filterSuggestions(filteredTitles, input);
  }
  else {
    suggestions = filterSuggestions(suggestions, input);
  }

  /* this makes searches with earlier matches show up sooner */
  if (input === '') {
    suggestions.sort((a, b) => a[0].toLowerCase().localeCompare(b[0].toLowerCase()));
  } else {
    suggestions.sort((a, b) => a[2] > b[2]);
  }
  createSuggestions(dropdown);
  animeEntry.prevLen = inputLen;
};

const filterAndSuggest = () => {
  applyFilter();
  suggestAnime();
};

(function () {
  loadAnime()
    .then(() => loadTitles())
    .then(() => suggestAnime())
    .catch((error) => console.log(error));
  document.getElementById('apply-filters').checked = false;
  document.getElementById('apply-filters').addEventListener('click', filterAndSuggest);
  document.getElementById('anime-entry').addEventListener('input', suggestAnime);
  document.getElementById('guess-button').addEventListener('click', () => {
    const userEntry = document.getElementById('anime-entry');
    const guess = userEntry.value;
    checkAnswer(guess);
    filterAndSuggest();
    userEntry.value = '';
  });
})();
