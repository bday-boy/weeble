import { didDaily } from './utils/cookies.js';
import { copyToClipboard } from './utils/copy.js';
import { loadAnimeData } from './utils/load.js';
import { getDateToday, startTimer } from './utils/time.js';
import { applyFilter } from './filters.js'
import { checkAnswer } from './check-answer.js';
import { updateStats, showStats } from './scores.js';

window.bsElements = {
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

window.weeble = {
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

const filterToggle = document.getElementById('apply-filters');
const shouldFilter = () => filterToggle.checked;
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
  li.addEventListener('click', function () {
    replaceInput.call(this);
    document.getElementById('anime-entry').focus();
  });
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
  } else {
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
  applyFilter(shouldFilter());
  suggestAnime();
};

const loadPage = function () {
  const weebleAbout = document.getElementById('weeble-about');
  const tdlrCheckbox = document.getElementById('tldr');
  const weebleSupport = document.getElementById('weeble-support');
  const weebleStats = document.getElementById('weeble-stats');
  const statsElement = document.querySelectorAll('#stats [data-weeble=stat]');
  const scoresElement = document.getElementById('guess-scores');
  const weebleSettings = document.getElementById('weeble-settings');
  const highContrast = document.getElementById('high-contrast');
  const darkMode = document.getElementById('dark-mode');
  const applyFilters = document.getElementById('apply-filters');
  const copyAnilist = document.getElementById('anilist');
  const copyDiscord = document.getElementById('discord');
  const copyGeneral = document.getElementById('general');
  const resetTimers = document.querySelectorAll('[data-weeble=timer]');
  const dropdownBtn = document.getElementById('toggle-suggestions');
  const userEntry = document.getElementById('anime-entry');
  const guessBtn = document.getElementById('guess-button');

  weebleAbout.addEventListener('click', () => {
    const aboutModal = document.getElementById('modal-about');
    aboutModal.removeAttribute('data-bs-backdrop');
    bsElements.modals.about.show();
  });

  tdlrCheckbox.checked = false;
  tdlrCheckbox.addEventListener('change', function () {
    const tldr = this.checked;
    document.querySelectorAll('#modal-about [data-weeble=tldr]').forEach((section) => {
      if (tldr) {
        section.classList.add('d-none');
      } else {
        section.classList.remove('d-none');
      }
    });
  });

  weebleSupport.addEventListener('click', () => {
    bsElements.modals.support.show();
  });

  weebleStats.addEventListener('click', function () {
    bsElements.modals.stats.show();
  });
  showStats(statsElement, scoresElement);

  weebleSettings.addEventListener('click', function () {
    bsElements.modals.settings.show();
  });

  if (darkMode.checked) {
    document.body.classList.remove('light-mode');
  } else {
    document.body.classList.add('light-mode');
  }
  darkMode.addEventListener('change', function () {
    if (this.checked) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  });

  if (highContrast.checked) {
    document.body.classList.add('high-contrast');
  } else {
    document.body.classList.remove('high-contrast');
  }
  highContrast.addEventListener('change', function () {
    if (this.checked) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  });

  applyFilters.checked = true;
  applyFilters.addEventListener('change', filterAndSuggest);

  const showCopyModal = (success) => (
    success ? bsElements.toasts.copySuccess.show() : bsElements.toasts.copyDanger.show()
  );

  copyAnilist.addEventListener('click', function () {
    copyToClipboard('anilist').then((success) => {
      showCopyModal(success);
    });
  });

  copyDiscord.addEventListener('click', function () {
    copyToClipboard('discord').then((success) => {
      showCopyModal(success);
    });
  });

  copyGeneral.addEventListener('click', function () {
    copyToClipboard('general').then((success) => {
      showCopyModal(success);
    });
  });

  dropdownBtn.disabled = true;
  userEntry.disabled = true;
  guessBtn.disabled = true;

  startTimer(resetTimers);
};

const startGame = function () {
  const dropdownBtn = document.getElementById('toggle-suggestions');
  const dropdown = document.getElementById('anime-suggestions');
  const userEntry = document.getElementById('anime-entry');
  const guessBtn = document.getElementById('guess-button');

  const done = didDaily();
  if (done) {
    const todayGuesses = window.localStorage.getItem(getDateToday());
    todayGuesses.split(':').forEach((guessId) => {
      const animeTitle = weeble.allAnime[parseInt(guessId)].title;
      checkAnswer(animeTitle);
    });
  } else {
    dropdownBtn.disabled = false;
    userEntry.disabled = false;
    guessBtn.disabled = false;

    userEntry.addEventListener('input', function () {
      suggestAnime();
      bsElements.dropdown.show();
      this.focus();
    });
    userEntry.addEventListener('keydown', (e) => {
      if (e.defaultPrevented) {
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
        case 'Down':
          if (dropdown.firstChild) {
            dropdown.firstChild.firstChild.focus();
          }
          break;
        case 'Enter':
          const guess = userEntry.value;
          userEntry.value = '';
          checkAnswer(guess);
          filterAndSuggest();
          break;
        default:
          return;
      }

      e.preventDefault();
    });

    guessBtn.addEventListener('click', () => {
      const guess = userEntry.value;
      userEntry.value = '';
      checkAnswer(guess);
      filterAndSuggest();
    });
  }
};

(function () {
  loadAnimeData.call(weeble).then(() => {
    filterAndSuggest();
    startGame();

    if (firstImpression()) {
      bsElements.modals.about.show();
    }
  });
  loadPage();
})();

// document.cookie = '_didDaily=true; max-age=0'
