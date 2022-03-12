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
  const anime_info = weeble.allAnime[animeId];

  const div = highlightText(title, index);
  div.classList.add('text-wrap');

  const small = document.createElement('small');
  small.textContent = `Studio(s): ${anime_info.studios.join(", ")}, Year: ${anime_info.year}, Episodes: ${anime_info.episodes}, Format: ${anime_info.format} Source: ${anime_info.source}`;
  small.classList.add('text-wrap');

  const a = document.createElement('a');
  a.classList.add('dropdown-item');
  a.href = 'javascript:;';
  a.appendChild(div);
  a.appendChild(small);

  const li = document.createElement('li');
  li.appendChild(a);
  li.addEventListener('click', replaceInput);
  return li;
};

const createSuggestions = function (dropdown_element) {
  suggestions.forEach((suggestion) => {
    const [title, animeId, index] = suggestion;
    const li = createAnimeLi(animeId, title, index);
    dropdown_element.appendChild(li);
  });
};

const addSuggestion = function (title, animeId, input, idSet) {
  const foundIndex = title.toLowerCase().indexOf(input);
  if (foundIndex > -1) {
    if (!idSet.has(animeId)) {
      idSet.add(animeId);
      suggestions.push([title, animeId, foundIndex]);
    }
  }
};

const filterAllTitles = function (input) {
  suggestions = [];
  const idSet = new Set();
  const { titles, synonyms } = weeble.filteredTitles;
  [titles, synonyms].forEach((titleGroup) => {
    Object.entries(titleGroup).forEach((entry) => {
      const [title, animeId] = entry;
      addSuggestion(title, animeId, input, idSet);
    });
  });
};

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
  if (weeble.allAnime === undefined || weeble.filteredTitles === undefined) {
    suggestions = [];
  }
  else {
    filterAllTitles(input);
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
    .then(() => filterAndSuggest())
    .then(() => fetchTags(weeble.anime.id))
    .then((tags) => {
      weeble.anime.tags = tags.sort((a, b) => a.rank < b.rank);
      weeble.anime.curTag = 0;
    })
    .then(() => loadPage())
    .then(() => {
      if (firstImpression()) {
        const modal = new bootstrap.Modal(document.getElementById('modal-intro'));
        modal.show();
      }
      firstImpression(null); // TODO: DELETE AFTER TESTING
    })
    .catch((error) => console.log(error));
  
  const tdlrCheckbox = document.getElementById('tldr');
  tdlrCheckbox.checked = false;
  tdlrCheckbox.addEventListener('change', function () {
    const tldr = this.checked;
    document.querySelectorAll('#modal-intro div[data-tldr=true]').forEach((section) => {
      if (tldr) {
        section.classList.add('d-none');
      } else {
        section.classList.remove('d-none');
      }
    });
  });

  document.getElementById('weeble-about').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('modal-intro'));
    modal.show();
  });
  
  document.getElementById('weeble-settings').addEventListener('click', () => {
    const modal = new bootstrap.Modal(document.getElementById('modal-settings'));
    modal.show();
  });

  document.getElementById('apply-filters').checked = true;
  document.getElementById('apply-filters').addEventListener('change', filterAndSuggest);

  document.getElementById('anime-entry').addEventListener('input', suggestAnime);
  document.getElementById('anime-entry').addEventListener('keydown', (e) => {
    if (e.key == 'ArrowDown') {
      const dropdown = document.getElementById('anime-suggestions');
      if (dropdown.firstChild) {
        dropdown.firstChild.firstChild.focus();
      }
    }
  });

  document.getElementById('guess-button').addEventListener('click', () => {
    const userEntry = document.getElementById('anime-entry');
    const guess = userEntry.value;
    userEntry.value = '';
    checkAnswer(guess);
    filterAndSuggest();
  });
})();
