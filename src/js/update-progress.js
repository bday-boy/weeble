const updateProgressSet = function (valArr, type, valSet) {
  const correctStudios = new Set(window.anime[type]);
  valArr.forEach((val) => {
    if (!correctStudios.has(val)) {
      valSet.delete(val);
    }
  });
};

const updateStudios = function (studios) {
  updateProgressSet(studios, 'studios', possibleStudios);
};

const updateProgressGroup = function (val, status, type, valSet) {
  const rootGroup = document.getElementById(type);
  if (status === 'correct') {
    valSet.delete(val);
    [...valSet].forEach((val) => {
      const btn = rootGroup.querySelector(`#${val}`);
      btn.classList.add('btn-secondary', 'd-none', 'd-md-inline-block');
      btn.classList.remove('btn-primary');
      btn.disabled = true;
    });
    valSet.clear();
    valSet.add(val);
    rootGroup.querySelector(`#${val}`).classList.add('btn-success');
  } else {
    const btn = rootGroup.querySelector(`#${val}`);
    btn.classList.add('btn-secondary', 'd-none', 'd-md-inline-block');
    btn.classList.remove('btn-primary');
    btn.disabled = true;
    valSet.delete(val);
  }
};

const updateSources = function (source, status) {
  updateProgressGroup(source, status, 'sources', sources);
};

const updateFormats = function (format, status) {
  updateProgressGroup(format, status, 'formats', formats);
};

const updateSeasons = function (season, status) {
  updateProgressGroup(season, status, 'seasons', seasons);
};

/**
 * Uses a progress object and type to update a progress bar.
 * @param {Object} progressObj - The object used to track progress
 * @param {string} type - A string used to find the elements on the page
 */
const updateProgressBar = function (progressObj, type) {
  const min = progressObj.min;
  const max = progressObj.max;
  const total = (max - min);
  const low = progressObj.low;
  const high = progressObj.high;

  document.getElementById(`${type}-low`).textContent = low;
  document.getElementById(`${type}-high`).textContent = high;

  const start = document.getElementById(`${type}-progress-left`);
  const middle = document.getElementById(`${type}-progress-middle`);
  const end = document.getElementById(`${type}-progress-right`);

  start.setAttribute('aria-valuenow', `${low - min}`);
  start.style.width = `${((low - min) / total) * 100}%`;

  middle.setAttribute('aria-valuenow', `${high - low}`);
  middle.style.width = `${((high - low) / total) * 100}%`;

  end.setAttribute('aria-valuenow', `${max - high}`);
  end.style.width = `${((max - high) / total) * 100 }%`;
};

/**
 * Updates the year range object. Dif is negative when the answer was released
 * after the user's guess.
 * @param {number} newVal - The value of the user's guess
 * @param {number} dif - The value of the user's guess minus the answer's value
 */
const updateNumRange = function (newVal, dif, threshold, obj, key) {
  const withinThreshold = (Math.abs(dif) <= threshold);
  if (obj.high - obj.low === threshold * 2) {
    return;
  }
  if (withinThreshold) {
    obj.low = Math.max(obj.min, newVal - threshold);
    obj.high = Math.min(obj.max, newVal + threshold);
  } else {
    if (dif < 0) {
      obj.low = Math.max(obj.low, newVal + 1);
    } else {
      obj.high = Math.min(obj.high, newVal - 1);
    }
  }
};

const updatePopRange = function (popularity, dif, threshold) {
  updateNumRange(popularity, dif, threshold, popRange, 'popularity');
  updateProgressBar(popRange, 'popularity');
};

const updateEpsRange = function (numEps, dif, threshold) {
  updateNumRange(numEps, dif, threshold, epsRange, 'episodes');
  updateProgressBar(epsRange, 'episodes');
};

const updateYearRange = function (year, dif, threshold) {
  updateNumRange(year, dif, threshold, yearRange, 'year');
  updateProgressBar(yearRange, 'year');
};
