const guessesDiv = document.getElementById('guesses');
const tooltipTexts = {
  studios: (A, B) => {
    let answer = '';
    const incorrect = Array.from(setDif(A, B)).join(', ');
    const correct = Array.from(setIntersection(A, B)).join(', ');
    if (correct) {
      answer += `Correct studios: ${correct}`;
    }
    if (incorrect) {
      if (answer) {
        answer += '\n';
      }
      answer += `Incorrect studios: ${incorrect}`;
    }
    return answer;
  },
  episodes: (guess, dif, threshold) => {
    if (Math.abs(dif) < threshold) {
      return `The answer is within ${threshold} episodes of ${guess}!`;
    } else {
      return `The answer has at least ${thresholds.episodes + 1} ${dif < 0 ? 'more' : 'fewer'} episodes.`
    }
  },
  year: (guess, dif, threshold) => {
    if (dif === 0) {
      return `The answer was released in ${guess}!`;
    } else if (Math.abs(dif) <= threshold) {
      return `The answer was released at most ${thresholds.year} years ${dif < 0 ? 'after' : 'before'} your guess.`
    } else {
      return `The answer was released over ${thresholds.year} years ${dif < 0 ? 'after' : 'before'} your guess.`
    }
  },
  format: (formatType, status) => {
    if (status === 'correct') {
      return `The answer is also a(n) ${formatType}!`;
    } else {
      return `The answer is not a(n) ${formatType}!`;
    }
  },
  source: (sourceType, status) => {
    if (status === 'correct') {
      return `The answer's source is also ${sourceType}!`;
    } else {
      return `The answer's source is not ${sourceType}!`;
    }
  },
};
const progressCheckers = {
  studios (guessStudiosSet) {
    updateProgressSet(guessStudiosSet, possibleStudios, knownStudios, 'studios');
  },
  episodes (guessEpisodes, dif, threshold) {
    updateNumRange(guessEpisodes, dif, threshold, epsRange, 'episodes');
  },
  year (guessYear, dif, threshold) {
    updateNumRange(guessYear, dif, threshold, yearRange, 'year');
  },
  format (guessFormat, status) {
    updateProgressGroup(guessFormat, status, formats, 'formats');
  },
  source (guessSource, status) {
    updateProgressGroup(guessSource, status, sources, 'sources');
  },
};

const createIcon = function(iconName, status) {
  /* create icon wrapper */
  const div = document.createElement('div');
  div.classList.add('icon-wrapper', status, 'd-flex', 'align-items-center', 'justify-content-center');

  /* create the icon */
  const i = document.createElement('i');
  i.classList.add('bi', `bi-${iconName}`);

  div.appendChild(i);
  return div;
};

const addTooltip = function(element, text) {
  element.setAttribute('data-bs-toggle', 'tooltip');
  element.setAttribute('data-bs-html', 'true');
  element.title = text;
};

const textForSets = function(A, B) {
  const incorrect = Array.from(setDif(A, B)).join(', ')
  const correct = Array.from(setIntersection(A, B)).join(', ');
  if (correct) {
    const highlight = `<mark class="correct">${correct}</mark>`;
    return highlight + incorrect;
  }
  return incorrect;
};

const setCompare = function(iterable, animeKey) {
  let status;
  let icon;
  const guessSet = new Set(iterable);
  const answerSet = new Set(window.anime[animeKey]);
  /* TODO: Make this only be true when the studio sets are equal */
  if (isSubset(answerSet, guessSet)) {
    status = 'correct';
    icon = 'check2-circle';
  } else if (setIntersection(guessSet, answerSet).size > 0) {
    status = 'almost';
    icon = 'asterisk';
  } else {
    status = 'incorrect';
    icon = 'x-circle';
  }
  const statusNode = createIcon(icon, status);
  addTooltip(statusNode, tooltipTexts[animeKey](guessSet, answerSet));
  progressCheckers[animeKey](guessSet);
  return statusNode;
};

const numCompare = function(guessNum, animeKey) {
  let status;
  let icon;
  const answerValue = window.anime[animeKey];
  const dif = guessNum - answerValue;
  const threshold = thresholds[animeKey];
  if (guessNum === answerValue) {
    status = 'correct';
    icon = 'check2-circle';
  } else if (Math.abs(dif) <= threshold) {
    status = 'almost';
    icon = `chevron-${dif < 0 ? 'up' : 'down'}`;
  } else {
    status = 'incorrect';
    icon = `chevron-double-${dif < 0 ? 'up' : 'down'}`;
  }
  const statusNode = createIcon(icon, status);
  addTooltip(statusNode, tooltipTexts[animeKey](guessNum, dif, threshold));
  progressCheckers[animeKey](guessNum, dif, threshold);
  return statusNode;
};

const strCompare = function(guessStr, animeKey) {
  let status;
  let icon;
  const answerValue = window.anime[animeKey];
  if (guessStr === answerValue) {
    status = 'correct';
    icon = 'check2-circle';
  } else {
    status = 'incorrect';
    icon = 'x-circle';
  }
  const statusNode = createIcon(icon, status);
  addTooltip(statusNode, tooltipTexts[animeKey](guessStr, status));
  progressCheckers[animeKey](guessStr, status);
  return statusNode;
};

const checkAnswer = function(inputTitle) {
  if (!titlesObj.hasOwnProperty(inputTitle) || window.anime === undefined) {
    /* do something here to warn user it's not a valid anime */
    return false;
  }
  const animeId = titlesObj[inputTitle];
  guessesAdd(animeId);
  const inputAnime = allAnime[animeId];
  const { studios, episodes, year, format, source } = inputAnime;

  const guessWrapper = document.createElement('div');
  guessWrapper.classList.add('d-flex');
  guessWrapper.appendChild(setCompare(studios, 'studios'));
  guessWrapper.appendChild(numCompare(episodes, 'episodes'));
  guessWrapper.appendChild(numCompare(year, 'year'));
  guessWrapper.appendChild(strCompare(source, 'source'));
  guessWrapper.appendChild(strCompare(format, 'format'));

  const a = document.createElement('a');
  a.href = `https://anilist.co/anime/${animeId}/`
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.classList.add('mb-1', 'text-wrap', 'text-center');
  a.textContent = inputTitle;

  const div = document.createElement('div');
  div.classList.add('col-md-10', 'my-2', 'd-flex', 'flex-column', 'align-items-center', 'justify-content-center');
  div.appendChild(a);
  div.appendChild(guessWrapper);

  guessesDiv.prepend(div);
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  });

  if (window.anime.curTag < window.anime.tags.length) {
    const tag = window.anime.tags[window.anime.curTag++];
    const tagText = `${tag.name.toUpperCase()} (${tag.rank}%)`;
    const nextTag = createNewButton(tagText);
    nextTag.classList.remove('btn-primary');
    nextTag.classList.add('btn-success');
    document.getElementById('tags').appendChild(nextTag);
  }
};
