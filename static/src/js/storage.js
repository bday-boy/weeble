import { getDateToday } from './utils/time.js';

const defaultScores = JSON.stringify({
  played: 0,
  wins: 0,
  'win-percent': '0%',
  'streak-current': 0,
  'streak-max': 0,
  scores: []
});
const defaultGuesses = JSON.stringify({
  guesses: []
});
const setItemObj = (key, obj) => localStorage.setItem(key, JSON.stringify(obj));
const getItemObj = (key, defaultObj) => JSON.parse(localStorage.getItem(key) || defaultObj);

const createScoreIndexLabel = function (scoreIndex) {
  const scoreDiv = document.createElement('div');
  scoreDiv.classList.add('col-1', 'text-start', 'score-label', 'px-1');
  scoreDiv.textContent = scoreIndex;
  return scoreDiv;
};

const createScoreProgressBar = function (score, scoreMax) {
  const minWidth = 5;
  const width = minWidth + ((score / scoreMax) * (100 - minWidth));
  const progressBar = document.createElement('div');
  progressBar.classList.add('progress-bar', 'bg-success');
  progressBar.role = 'progressbar';
  progressBar.style.width = `${width}%`;
  progressBar.setAttribute('aria-valuenow', '' + width);
  progressBar.setAttribute('aria-valuemin', '0');
  progressBar.setAttribute('aria-valuemax', '100');

  const textWrapper = document.createElement('div');
  textWrapper.classList.add('floating-text-wrapper', 'text-left', 'text-end', 'mr-1');
  textWrapper.textContent = score;

  const scoreText = document.createElement('div');
  scoreText.classList.add('position-relative');
  scoreText.appendChild(textWrapper);

  const progress = document.createElement('div');
  progress.classList.add('progress', 'col-9', 'px-0');
  progress.appendChild(progressBar);
  progress.appendChild(scoreText);
  return progress;
};

const createScoreRow = function (score, scoreMax, scoreIndex) {
  const scoreIndexDiv = createScoreIndexLabel(scoreIndex);
  const scoreBar = createScoreProgressBar(score, scoreMax);

  const scoreRow = document.createElement('div');
  scoreRow.classList.add('row', 'align-items-center', 'justify-content-center', 'my-1');
  scoreRow.appendChild(scoreIndexDiv);
  scoreRow.appendChild(scoreBar);
  return scoreRow;
};

/**
 * Takes in the max number of guesses and returns an array of the user's
 * existing scores.
 * @param {number} maxGuesses - Max number of allowed guesses, will be the
 * length of the new array
 * @returns {string} String of colon-separated scores
 */
const fixScores = function (scores, maxGuesses, numGuesses) {
  scores.forEach((score, index) => {
    const parsedVal = parseInt(score);
    if (!isNaN(parsedVal) && 0 <= score) {
      scores[index] = parseInt(score);
    } else {
      scores[index] = 0;
    }
  });
  if (scores.length < maxGuesses) {
    const extension = [];
    extension.length = maxGuesses - scores.length;
    extension.fill(0);
    scores.push(...extension);
  } else {
    scores.length = maxGuesses;
  }
  if (numGuesses) {
    scores[numGuesses - 1]++;
  }
  return scores;
};

const updateStats = function (userWon, maxGuesses, numGuesses) {
  const {
    played,
    wins,
    'streak-current': streakCurrent,
    'streak-max': streakMax,
    scores
  } = getItemObj('stats', defaultScores);

  setItemObj('stats', {
    played: played + 1,
    wins: wins + userWon,
    'win-percent': `${(((wins + userWon) / (played + 1)) * 100).toFixed(0)}%`,
    'streak-current': userWon ? streakCurrent + 1 : 0,
    'streak-max': Math.max(streakMax, userWon ? streakCurrent + 1 : 0),
    scores: fixScores(scores, maxGuesses, numGuesses)
  });
};

const showStats = function (statElements, scoresElement) {
  const stats = getItemObj('stats', defaultScores);
  statElements.forEach((statElement) => {
    const stat = stats[statElement.id];
    statElement.textContent = stat;
  });

  // get scores and wins from storage
  const { scores } = stats;
  const scoreMax = Math.max(...scores);

  // append scores to scoresElement
  while (scoresElement.firstChild) {
    scoresElement.removeChild(scoresElement.firstChild);
  }
  scores.forEach((score, index) => {
    const scoreRow = createScoreRow(score, scoreMax, index + 1);
    scoresElement.appendChild(scoreRow);
  });
};

const addGuess = function (guess) {
  const todaysDate = getDateToday();
  const todaysEntry = getItemObj(todaysDate, defaultGuesses);
  if (!todaysEntry.guesses.includes(guess)) {
    todaysEntry.guesses.push(guess);
    setItemObj(todaysDate, todaysEntry);
  }
};

const getGuesses = function () {
  const todaysDate = getDateToday();
  const todaysEntry = getItemObj(todaysDate, defaultGuesses);
  return todaysEntry.guesses;
};

const didDaily = function (won) {
  const todaysDate = getDateToday();
  const todaysEntry = getItemObj(todaysDate, defaultGuesses);

  if (won !== undefined) {
    todaysEntry.won = won;
    setItemObj(todaysDate, todaysEntry);
  }

  return todaysEntry.won !== undefined;
};

const firstVisit = function () {
  const hasVisited = localStorage.getItem('hasVisited');
  if (hasVisited !== 'yes') {
    localStorage.setItem('hasVisited', 'yes');
  }
  return (hasVisited !== 'yes');
};

export { updateStats, showStats, addGuess, getGuesses, didDaily, firstVisit };