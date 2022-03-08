let suggestions = [];
let inputLen = 0;

const replaceInput = function() {
  /* replaces the text in the input with the clicked suggestion */
  const newValue = this.querySelector('div').textContent;
  document.getElementById('anime-entry').value = newValue;
  const dropdown = this.parentNode;
  while (dropdown.firstChild) {
    dropdown.removeChild(dropdown.firstChild);
  }
  dropdown.classList.remove('show');
};

const highlightText = function(text, index) {
  /* highlight just the part of the text the user has typed in */
  const leftSpan = document.createElement('span');
  leftSpan.textContent = text.slice(0, index);
  const highlight = document.createElement('mark');
  highlight.textContent = text.slice(index, index + inputLen);
  const rightSpan = document.createElement('span');
  rightSpan.textContent = text.slice(index + inputLen, text.length);
  
  /* wrap all text in a div */
  const div = document.createElement('div');
  div.appendChild(leftSpan);
  div.appendChild(highlight);
  div.appendChild(rightSpan);
  return div;
};

const createAnimeLi = function(animeId, title, index) {
  const anime_info = allAnime[animeId];
  const li = document.createElement('li');
  li.classList.add('dropdown-item');
  const div = highlightText(title, index);
  const small = document.createElement('small');
  small.textContent = `Studio(s): ${anime_info.studios.join(", ")}, Year: ${anime_info.year}, Director(s): ${anime_info.directors.join(", ")}, Episodes: ${anime_info.episodes}, Anilist popularity: ${anime_info.popularity}, Format: ${anime_info.format} Source: ${anime_info.source}`;
  small.classList.add('text-wrap');
  li.appendChild(div);
  li.appendChild(small);
  li.addEventListener('click', replaceInput);
  return li;
};

const createSuggestions = function(dropdown_element) {
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

const filterSuggestions = function(entry, input) {
  const [title, animeId] = entry;
  const foundIndex = title.toLowerCase().indexOf(input);
  if (foundIndex > -1) {
    suggestions.push([title, animeId, foundIndex])
  } else {
    return false;
  }
};

const suggestAnime = function(event) {
  const input = event.target.value.toLowerCase();
  const dropdown = document.getElementById('anime-suggestions');
  inputLen = input.length;
  while (dropdown.firstChild) {
    dropdown.removeChild(dropdown.firstChild);
  }
  if (allAnime === undefined || titlesArray === undefined || input === '') {
    suggestions = [];
  }
  else if (event.prevLen === undefined || event.prevLen < inputLen) {
    suggestions = [];
    titlesArray.filter((entry) => filterSuggestions(entry, input));
  }
  else {
    suggestions.filter((entry) => filterSuggestions(entry));
  }
  suggestions.sort((a, b) => a[2] > b[2]);
  createSuggestions(dropdown);
  if (!suggestions || suggestions.length === 0) {
    dropdown.classList.remove('show');
  } else {
    dropdown.classList.add('show');
  }
  event.prevLen = inputLen;
};
