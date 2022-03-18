const checkDif = (dif, threshold, low, high) => (
  Math.abs(dif) <= threshold || (high - low) <= threshold * 2
);

const guessTooltips = {
  studios: (A, B) => {
    let answer = '';
    const incorrect = Array.from(setDif(A, B)).join(', ');
    const correct = Array.from(setIntersection(A, B)).join(', ');
    if (correct) {
      answer += `Correct studios: ${correct}`;
    }
    if (incorrect) {
      answer += (answer ? '\n' : '') + `Incorrect studios: ${incorrect}`;
    }
    return answer;
  },
  episodes: (guess, dif, threshold) => {
      const { low, high } = weeble.ranges.episodes;
    if (checkDif(dif, threshold, low, high)) {
      if (threshold === 0) {
        return `The answer has ${low} episodes!`;
      } else {
        return `The answer has between ${low} and ${high} episodes!`;
      }
    } else {
      return `The answer has ${dif < 0 ? 'more' : 'fewer'} than ${guess} episodes.`;
    }
  },
  year: (guess, dif, threshold) => {
    const { low, high } = weeble.ranges.year;
    if (checkDif(dif, threshold, low, high)) {
      if (threshold === 0) {
        return `The answer was released in ${low}!`;
      } else {
        return `The answer was released between ${low} and ${high}!`;
      }
    } else {
      return `The answer was released ${dif < 0 ? 'after' : 'before'} ${guess}!`;
    }
  },
  format: (formatType, status) => {
    const correct = (status === 'bg-success' ? ' ' : ' not ');
    switch (formatType) {
      case 'TV':
        return `The answer was${correct}released as a TV show!`;
      case 'MOVIE':
        return `The answer was${correct}released as a movie!`;
      case 'TV_SHORT':
        return `The answer was${correct}released as a TV short!`;
      case 'OVA':
      case 'ONA':
        return `The answer was${correct}released as an ${formatType}!`;
      default:
        return `The answer was${correct}released as a ${formatType}!`;
    }
  },
  source: (sourceType, status) => {
    const correct = (status === 'bg-success' ? ' ' : ' not ');
    switch (sourceType) {
      case 'ORIGINAL':
        return `The answer is${correct}an anime original!`;
      case 'OTHER':
        return `The answer's source is not other.`;
      case 'LIVE_ACTION':
        return `The answer is${correct}live action!`;
      case 'MULTIMEDIA_PROJECT':
        return `The answer is${correct}a multimedia project!`;
      default:
        return `The answer is${correct}based on a ${sourceType.toLowerCase().replaceAll('_', ' ')}!`;
    }
  },
};

const correctTooltips = {
  studios: () => {
    const studios = weeble.anime.studios;
    const numStudios = studios.length;
    if (numStudios === 1) {
      return `${weeble.anime.title} was made by ${studios[0]}!`;
    } else if (numStudios === 2) {
      return `${weeble.anime.title} was made by ${studios[0]} and ${studios[1]}!`;
    } else {
      return `${weeble.anime.title} was made by ${studios.slice(0, numStudios - 1).join(', ')} and ${studios[numStudios - 1]}!`;
    }
  },
  episodes: () => {
    return `${weeble.anime.title} has ${weeble.anime.episodes} episode${(weeble.anime.episodes === 1) ? '' : 's'}!`;
  },
  year: () => {
    return `${weeble.anime.title} was released in ${weeble.anime.year}!`;
  },
  format: () => {
    const format = weeble.anime.format;
    switch (format) {
      case 'TV':
        return `${weeble.anime.title} was released as a TV show!`;
      case 'MOVIE':
        return `${weeble.anime.title} was released as a movie!`;
      case 'TV_SHORT':
        return `${weeble.anime.title} was released as a TV short!`;
      case 'OVA':
      case 'ONA':
        return `${weeble.anime.title} was released as an ${format}!`;
      default:
        return `${weeble.anime.title} was released as a ${format}!`;
    }
  },
  source: () => {
    const source = weeble.anime.source;
    switch (source) {
      case 'ORIGINAL':
        return `${weeble.anime.title} is an anime original!`;
      case 'OTHER':
        return `${weeble.anime.title}'s source is not a category on Anilist.`;
      case 'LIVE_ACTION':
        return `${weeble.anime.title} is live action!`;
      case 'MULTIMEDIA_PROJECT':
        return `${weeble.anime.title} is a multimedia project!`;
      default:
        return `${weeble.anime.title} is based on a ${source.toLowerCase().replaceAll('_', ' ')}!`;
    }
  },
};

const guessProgress = {
  studios(guessStudiosSet) {
    updateProgressSet(guessStudiosSet, weeble.studios.possible, weeble.studios.known, 'studios');
  },
  episodes(guessEpisodes, dif, threshold) {
    updateNumRange(guessEpisodes, dif, threshold, weeble.ranges.episodes, 'episodes');
  },
  year(guessYear, dif, threshold) {
    updateNumRange(guessYear, dif, threshold, weeble.ranges.year, 'year');
  },
  format(guessFormat, status) {
    updateProgressGroup(guessFormat, status, weeble.formats, 'formats');
  },
  source(guessSource, status) {
    updateProgressGroup(guessSource, status, weeble.sources, 'sources');
  },
};

const correctProgress = {
  studios() {
    const correctStudios = new Set(weeble.anime.studios);
    updateProgressSet(correctStudios, weeble.studios.possible, correctStudios, 'studios');
  },
  episodes() {
    const correctEpisodes = weeble.anime.episodes;
    updateNumRangeCorrect(correctEpisodes, weeble.ranges.episodes, 'episodes');
  },
  year() {
    const correctYear = weeble.anime.year;
    updateNumRangeCorrect(correctYear, weeble.ranges.year, 'year');
  },
  format() {
    const correctFormat = weeble.anime.format;
    updateProgressGroup(correctFormat, 'bg-success', weeble.formats, 'formats');
  },
  source() {
    const correctSource = weeble.anime.source;
    updateProgressGroup(correctSource, 'bg-success', weeble.sources, 'sources');
  },
};

const createAnimeLink = function (animeId, animeTitle) {
  const a = document.createElement('a');
  a.classList.add('mb-1', 'text-wrap', 'text-center');
  a.href = `https://anilist.co/anime/${animeId}/`
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.textContent = animeTitle;
  return a;
};

const createIcon = function (iconName, status) {
  /* create icon wrapper */
  const div = document.createElement('div');
  div.classList.add('icon-wrapper', status, 'd-flex', 'align-items-center', 'justify-content-center');

  /* create the icon */
  const i = document.createElement('i');
  i.classList.add('bi', `bi-${iconName}`);

  div.appendChild(i);
  return div;
};

const addTooltip = function (element, text) {
  element.setAttribute('data-bs-toggle', 'tooltip');
  element.setAttribute('data-bs-html', 'true');
  element.title = text;
};

const setCompare = function (guessIter, animeKey) {
  let icon;
  let status;
  const guessSet = new Set(guessIter);
  const answerSet = new Set(weeble.anime[animeKey]);
  /* TODO: Make this only be true when the studio sets are equal */
  if (isSubset(answerSet, guessSet)) {
    icon = 'check2-circle';
    status = 'bg-success';
  } else if (setIntersection(guessSet, answerSet).size > 0) {
    icon = 'asterisk';
    status = 'bg-warning';
  } else {
    icon = 'x-circle';
    status = 'bg-danger';
  }
  const statusNode = createIcon(icon, status);
  guessProgress[animeKey](guessSet);
  addTooltip(statusNode, guessTooltips[animeKey](guessSet, answerSet));
  return statusNode;
};

const numCompare = function (guessNum, animeKey) {
  let icon;
  let status;
  const answerValue = weeble.anime[animeKey];
  const dif = guessNum - answerValue;
  const threshold = weeble.thresholds[animeKey];
  const { low, high } = weeble.ranges[animeKey];
  if (checkDif(dif, threshold, low, high)) {
    icon = `chevron-contract`;
    status = 'bg-warning';
  } else {
    icon = `chevron-${dif < 0 ? 'up' : 'down'}`;
    status = 'bg-danger';
  }
  const statusNode = createIcon(icon, status);
  guessProgress[animeKey](guessNum, dif, threshold);
  addTooltip(statusNode, guessTooltips[animeKey](guessNum, dif, threshold));
  return statusNode;
};

const strCompare = function (guessStr, animeKey) {
  let icon;
  let status;
  const answerValue = weeble.anime[animeKey];
  if (guessStr === answerValue) {
    icon = 'check2-circle';
    status = 'bg-success';
  } else {
    icon = 'x-circle';
    status = 'bg-danger';
  }
  const statusNode = createIcon(icon, status);
  guessProgress[animeKey](guessStr, status);
  addTooltip(statusNode, guessTooltips[animeKey](guessStr, status));
  return statusNode;
};

const showEndModal = function (modalTitle) {
  document.getElementById('game-end-title').textContent = modalTitle;

  const a = createAnimeLink(weeble.anime.id, weeble.anime.title);
  document.getElementById('answer-title').appendChild(a);

  const img = document.getElementById('answer-image');
  img.src = weeble.anime.picture;
  img.alt = weeble.anime.title;

  setTimeout(() => bsElements.modals.end.show(), 1000);
};

const endGame = function (won) {
  didDaily(won);
};

const addGenre = function (numGenres) {
  let genreCount = 0;
  const addAllTags = (numGenres === undefined || numGenres === null);
  const genresElement = document.getElementById('genres');
  while (weeble.anime.curGenre < weeble.anime.genres.length && (addAllTags || genreCount < numGenres)) {
    const genre = weeble.anime.genres[weeble.anime.curGenre++];
    const genreText = genre.toUpperCase();
    const nextGenre = createNewButton(genreText);
    nextGenre.classList.add('btn-success');
    genresElement.appendChild(nextGenre);
    genreCount++;
  }
};

const addAllGenres = function () {
  addGenre();
};

const addTag = function (numTags) {
  let tagCount = 0;
  const addAllTags = (numTags === undefined || numTags === null);
  const tagsElement = document.getElementById('tags');
  while (weeble.anime.curTag < weeble.anime.tags.length && (addAllTags || tagCount < numTags)) {
    const tag = weeble.anime.tags[weeble.anime.curTag++];
    const tagText = `${tag.name.toUpperCase()} (${tag.rank}%)`;
    const nextTag = createNewButton(tagText);
    nextTag.classList.add('btn-success');
    tagsElement.appendChild(nextTag);
    tagCount++;
  }
};

const addAllTags = function () {
  addTag();
};

const handleCorrectAnswer = function () {
  const guessesDiv = document.getElementById('guesses');
  const guessWrapper = document.createElement('div');
  guessWrapper.classList.add('d-flex');

  Object.entries(correctTooltips).forEach(([key, textFunc]) => {
    const statusNode = createIcon('check2-circle', 'bg-success');
    addTooltip(statusNode, textFunc());
    guessWrapper.appendChild(statusNode);
    correctProgress[key]();
  });

  const a = createAnimeLink(weeble.anime.id, weeble.anime.title);

  const div = document.createElement('div');
  div.classList.add('col-md-10', 'my-2', 'd-flex', 'flex-column', 'align-items-center', 'justify-content-center');
  div.appendChild(a);
  div.appendChild(guessWrapper);

  guessesDiv.prepend(div);
  const tooltipTriggerList = [].slice.call(div.querySelectorAll('[data-bs-toggle="tooltip"]'))
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  if (!didDaily()) {
    window.localStorage.setItem(getDateToday(), Array.from(weeble.guesses.set).join(':'));
    updateStats(true, weeble.guesses.max, weeble.guesses.set.size);
  }

  addAllTags();
  addAllGenres();
  showEndModal(endText(true));
  endGame(true);
};

const checkAnswer = function (inputTitle) {
  if (!weeble.titles.hasOwnProperty(inputTitle) || weeble.anime === undefined) {
    /* do something here to warn user it's not a valid anime */
    return false;
  }
  const guessesDiv = document.getElementById('guesses');
  const animeId = weeble.titles[inputTitle];
  weeble.guesses.add(animeId);
  if (animeId === weeble.anime.id) {
    handleCorrectAnswer();
    return;
  }
  const inputAnime = weeble.allAnime[animeId];
  const { studios, episodes, year, format, source } = inputAnime;

  const guessWrapper = document.createElement('div');
  guessWrapper.classList.add('d-flex');
  guessWrapper.appendChild(setCompare(studios, 'studios'));
  guessWrapper.appendChild(numCompare(episodes, 'episodes'));
  guessWrapper.appendChild(numCompare(year, 'year'));
  guessWrapper.appendChild(strCompare(source, 'source'));
  guessWrapper.appendChild(strCompare(format, 'format'));

  const a = createAnimeLink(animeId, inputTitle);

  const div = document.createElement('div');
  div.classList.add('col-md-10', 'my-2', 'd-flex', 'flex-column', 'align-items-center', 'justify-content-center');
  div.appendChild(a);
  div.appendChild(guessWrapper);

  guessesDiv.prepend(div);
  const tooltipTriggerList = [].slice.call(div.querySelectorAll('[data-bs-toggle="tooltip"]'))
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  });

  addTag(1);
  addGenre(1);

  if (weeble.guesses.set.size >= weeble.guesses.max) {
    if (!didDaily()) {
      window.localStorage.setItem(getDateToday(), Array.from(weeble.guesses.set).join(':'));
      updateStats(true, weeble.guesses.max);
    }
    addAllTags();
    addAllGenres();
    showEndModal(endText(false));
    endGame(false);
    const dropdownBtn = document.getElementById('toggle-suggestions');
    const userEntry = document.getElementById('anime-entry');
    const guessBtn = document.getElementById('guess-button');
    dropdownBtn.disabled = true;
    userEntry.disabled = true;
    guessBtn.disabled = true;
  }
};
