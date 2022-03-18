const getStat = (stat) => (localStorage.getItem(stat) || '0');
const getStatNumber = (stat) => parseInt(getStat(stat));
const setStat = (stat, newVal) => localStorage.setItem(stat, newVal);
const updateScores = (scores, numGuesses) => {
  if (numGuesses) {
    scores[numGuesses - 1]++;
  }
};

const createScoreLabel = function (score) {
  const scoreDiv = document.createElement('div');
  scoreDiv.classList.add('col-2', 'text-start');
  scoreDiv.textContent = score;
  return scoreDiv;
};

const createScoreProgressBar = function (width) {
  const progressBar = document.createElement('div');
  progressBar.classList.add('progress-bar', 'bg-success');
  progressBar.role = 'progressbar';
  progressBar.style.width = `${Math.max(1, width)}%`;
  progressBar.setAttribute('aria-valuenow', '' + width);
  progressBar.setAttribute('aria-valuemin', '0');
  progressBar.setAttribute('aria-valuemax', '100');

  const progress = document.createElement('div');
  progress.classList.add('progress', 'col-10', 'px-0');
  progress.appendChild(progressBar);
  return progress;
};

const createScoreRow = function (score, scoreMax) {
  const scoreDiv = createScoreLabel(score);
  const scoreBar = createScoreProgressBar((score / scoreMax) * 100);

  const scoreRow = document.createElement('div');
  scoreRow.classList.add('row', 'align-items-center', 'justify-content-center');
  scoreRow.appendChild(scoreDiv);
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
const getScoresArray = function (maxGuesses) {
  const scoresString = getStat('scores');
  const scoresArr = scoresString.split(':');
  scoresArr.forEach((v, i) => scoresArr[i] = parseInt(v));
  if (scoresArr.length < maxGuesses) {
    const extension = [];
    extension.length = maxGuesses - scoresArr.length;
    extension.fill(0);
    return scoresArr.concat(extension);
  } else {
    scoresArr.length = maxGuesses;
    return scoresArr;
  }
};

const updateStats = function (userWon, maxGuesses, numGuesses) {
  const played = getStatNumber('played') + 1;
  setStat('played', played);

  const wins = getStatNumber('wins') + userWon;
  setStat('wins', wins);

  setStat('win-percent', `${((wins / played) * 100).toFixed(0)}%`);

  const streakCurrent = userWon ? getStatNumber('streak-current') + 1 : 0;
  setStat('streak-current', streakCurrent);

  const streakMax = Math.max(streakCurrent, getStatNumber('streak-max'));
  setStat('streak-max', streakMax);

  const scores = getScoresArray(maxGuesses);
  updateScores(scores, numGuesses);
  setStat('scores', scores.join(':'));
};

const showScores = function (scoresElement, maxGuesses) {
  // get scores and wins from storage
  const scores = getScoresArray(maxGuesses);
  const scoreMax = Math.max(...scores);

  // append scores to scoresElement
  while (scoresElement.firstChild) {
    scoresElement.removeChild(scoresElement.firstChild);
  }
  scores.forEach((score) => {
    const scoreRow = createScoreRow(score, scoreMax);
    scoresElement.appendChild(scoreRow);
  });

  // set scores back in storage
  setStat('scores', scores.join(':'));
};

const showStat = function (statElement) {
  const stat = getStat(statElement.id);
  statElement.textContent = stat;
};

const debugStats = function () {
  setStat('played', 10);
  setStat('wins', 9);
  setStat('win-percent', '90%');
  setStat('streak-current', 2);
  setStat('streak-max', 5);
  setStat('scores', '0:1:2:0:0:4:2:0');
};
