import { copyToClipboard } from './utils/copy.js';
import { loadAnimeData } from './utils/load.js';
import { startTimer } from './utils/time.js';
import { applyFilter } from './filters.js'
import { checkAnswer } from './check-answer.js';
import { showStats, getGuesses, didDaily, firstVisit } from './storage.js';
import { suggestAnime } from './suggest.js';

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
  won: false,
  allAnime: {},
  possibleAnime: {},
  titles: {},
  filteredTitles: {},
  thresholds: {
    episodes: 5,
    year: 1,
  },
  guesses: {
    max: 7,
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

const replaceInput = function () {
  // replaces the text in the input with the clicked suggestion
  const newValue = this.querySelector('div').textContent;
  document.getElementById('anime-entry').value = newValue;
  bsElements.dropdown.hide();
};

const createAnimeLi = function (animeId, title) {
  const anime_info = weeble.allAnime[animeId];

  const div = document.createElement('div');
  div.classList.add('text-wrap');
  div.append(title);

  const small = document.createElement('small');
  small.textContent =
    `Studio(s): ${anime_info.studios.join(", ")}, ` +
    `Year: ${anime_info.year}, ` +
    `Episodes: ${anime_info.episodes}, ` +
    `Format: ${anime_info.format}, ` +
    `Source: ${anime_info.source}`;
  small.classList.add('text-wrap');

  const a = document.createElement('a');
  a.classList.add('dropdown-item');
  a.href = 'javascript:;';
  a.appendChild(div);
  a.appendChild(small);

  const li = document.createElement('li');
  li.id = animeId;
  li.appendChild(a);
  li.addEventListener('click', function () {
    replaceInput.call(this);
    document.getElementById('anime-entry').focus();
  });
  return li;
};

const updateDropdown = function (dropdown) {
  const { titles } = weeble.filteredTitles;
  const newChildren = [];

  Object.entries(titles).forEach((entry) => {
    const [title, animeId] = entry;
    if (!isNaN(animeId)) {
      const li = createAnimeLi(animeId, title);
      newChildren.push(li);
    }
  });

  dropdown.replaceChildren(...newChildren);
};

const filterAndSuggest = (dropdown, search) => {
  applyFilter(shouldFilter());
  updateDropdown(dropdown)
  suggestAnime(dropdown, search, weeble.filteredTitles);
};

const loadPage = function () {
  const weebleAbout = document.getElementById('weeble-about');
  const tdlrCheckbox = document.getElementById('tldr');
  const weebleSupport = document.getElementById('weeble-support');
  const weebleStats = document.getElementById('weeble-stats');
  const statsElements = document.querySelectorAll('[data-weeble=stat]');
  const scoresElement = document.getElementById('guess-scores');
  const weebleSettings = document.getElementById('weeble-settings');
  const highContrast = document.getElementById('high-contrast');
  const darkMode = document.getElementById('dark-mode');
  const applyFilters = document.getElementById('apply-filters');
  const copyAnilist = document.getElementById('anilist');
  const copyDiscord = document.getElementById('discord');
  const copyGeneral = document.getElementById('general');
  const resetTimers = document.querySelectorAll('[data-weeble=timer]');
  const dropdown = document.getElementById('anime-suggestions');
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
  showStats(statsElements, scoresElement);

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
  applyFilters.addEventListener('change', () => {
    filterAndSuggest(dropdown, userEntry.value);
  });

  const showCopyToast = (success) => (
    success ? bsElements.toasts.copySuccess.show() : bsElements.toasts.copyDanger.show()
  );

  copyAnilist.addEventListener('click', function () {
    copyToClipboard('anilist', weeble.won, weeble.anime.count).then((success) => {
      showCopyToast(success);
    });
  });

  copyDiscord.addEventListener('click', function () {
    copyToClipboard('discord', weeble.won, weeble.anime.count).then((success) => {
      showCopyToast(success);
    });
  });

  copyGeneral.addEventListener('click', function () {
    copyToClipboard('general', weeble.won, weeble.anime.count).then((success) => {
      showCopyToast(success);
    });
  });

  dropdownBtn.disabled = true;
  userEntry.disabled = true;
  guessBtn.disabled = true;

  startTimer(resetTimers);
};

const startGame = function () {
  const todayGuesses = getGuesses();
  todayGuesses.forEach((guessId) => {
    const animeTitle = weeble.allAnime[parseInt(guessId)].title;
    checkAnswer(animeTitle);
  });

  if (!didDaily()) {
    const dropdownBtn = document.getElementById('toggle-suggestions');
    const dropdown = document.getElementById('anime-suggestions');
    const userEntry = document.getElementById('anime-entry');
    const guessBtn = document.getElementById('guess-button');

    dropdownBtn.disabled = false;
    userEntry.disabled = false;
    guessBtn.disabled = false;

    userEntry.addEventListener('input', function () {
      suggestAnime(dropdown, userEntry.value, weeble.filteredTitles);
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
          filterAndSuggest(dropdown, '');
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
      filterAndSuggest(dropdown, '');
    });
    filterAndSuggest(dropdown, '');
  }
};

(function () {
  loadAnimeData.call(weeble).then(() => {
    startGame();

    if (firstVisit()) {
      bsElements.modals.about.show();
    }
  });
  loadPage();
})();