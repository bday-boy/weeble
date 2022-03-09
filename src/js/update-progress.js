const updateProgressGroup = function(val, status, type, valSet) {
  if (status === 'correct') {
    valSet.delete(val);
    [...valSet].forEach((elm) => {
      document.getElementById(elm).disabled = true;
    });
    document.getElementById(val).classList.add('btn-success');
  } else {
    document.getElementById(val).disabled = true;
    valSet.delete(val);
  }
};

const updateSources = function(source, status) {
  updateProgressGroup(source, status, 'sources', sources);
};

const updateFormats = function(format, status) {
  updateProgressGroup(format, status, 'formats', formats);
};

/**
 * Uses a progress object and type to update a progress bar.
 * @param {Object} progressObj - The object used to track progress
 * @param {string} type - A string used to find the elements on the page
 */
const updateProgressBar = function(progressObj, type) {
  const min = progressObj.min;
  const max = progressObj.max;
  const total = (max - min);
  const low = progressObj.low;
  const high = progressObj.high;
  const extraWidth = (low === high) * 3;

  document.getElementById(`${type}-low`).textContent = low;
  document.getElementById(`${type}-high`).textContent = high;

  const start = document.getElementById(`${type}-progress-left`);
  const middle = document.getElementById(`${type}-progress-middle`);
  const end = document.getElementById(`${type}-progress-right`);

  start.setAttribute('aria-valuenow', `${low - min}`);
  start.style.width = `${((low - min) / total) * 100 - extraWidth / 2}%`;

  middle.setAttribute('aria-valuenow', `${high - low}`);
  middle.style.width = `${((high - low) / total) * 100 + extraWidth}%`;

  end.setAttribute('aria-valuenow', `${max - high}`);
  end.style.width = `${((max - high) / total) * 100 - extraWidth / 2}%`;
};

const updateYear = function() {
  updateProgressBar(yearRange, 'year');
};

const updateEps = function() {
  updateProgressBar(epsRange, 'eps');
};

/**
 * Updates the year range object. Dif is negative when the answer was released
 * after the user's guess.
 * @param {number} newVal - The year of the user's guess
 * @param {number} dif - The year of the user's guess minus the actual year
 */
const updateNumRange = function(newVal, dif, threshold, obj) {
  const withinThreshold = (Math.abs(dif) <= threshold);
  if (dif === 0) {
    obj.low = newVal;
    obj.high = newVal;
  } else if (withinThreshold) {
    if (dif < 0) {
      obj.low = Math.max(obj.low, newVal + 1);
      obj.high = Math.min(obj.high, newVal + threshold);
    } else {
      obj.low = Math.max(obj.low, newVal - threshold);
      obj.high = Math.min(obj.high, newVal - 1);
    }
  } else {
    if (dif < 0) {
      obj.low = Math.max(obj.low, newVal + 1);
    } else {
      obj.high = Math.min(obj.high, newVal - 1);
    }
  }
};

const updateYearRange = function(year, dif, threshold) {
  updateNumRange(year, dif, threshold, yearRange)
  updateYear();
};

const updateEpsRange = function(numEps, dif, threshold) {
  updateNumRange(numEps, dif, threshold, epsRange)
  updateEps();
};
