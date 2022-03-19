const getProgressbarWidths = function (obj) {
  const { min, max, low, high } = obj;
  let total = (max - min);

  let left = (low - min) / total;
  let middle = (high - low) / total;
  let right = (max - high) / total;

  if (left < 0.02) {
    left = 0;
  }
  if (middle < 0.03) {
    middle = 0.03;
  }
  if (right < 0.02) {
    right = 0;
  }
  
  total = (left + middle + right);
  left = left * (100 / total);
  middle = middle * (100 / total);
  right = right * (100 / total);

  return { left, middle, right };
};

const setProgressbarWidths = function (obj, key) {
  const { left: lw, middle: mw, right: rw } = getProgressbarWidths(obj);

  const start = document.getElementById(`${key}-progress-left`);
  const middle = document.getElementById(`${key}-progress-middle`);
  const end = document.getElementById(`${key}-progress-right`);

  start.setAttribute('aria-valuenow', `${lw}`);
  start.style.width = `${lw}%`;

  middle.setAttribute('aria-valuenow', `${mw}`);
  middle.style.width = `${mw}%`;

  end.setAttribute('aria-valuenow', `${rw}`);
  end.style.width = `${rw}%`;
};

const updateProgressSet = function (guessSet, possibleSet, knownSet, type) {
  const correctSet = new Set(weeble.anime[type]);
  guessSet.forEach((val) => {
    if (!correctSet.has(val)) {
      possibleSet.delete(val);
    }
  });
  [...setIntersection(correctSet, new Set(guessSet))].forEach((elm) => {
    knownSet.add(elm);
  });
};

const updateProgressGroup = function (val, status, set, type) {
  const progressGroup = document.getElementById(type);
  const btn = createNewButton(val);
  if (status === 'bg-success') {
    set.delete(val);
    progressGroup.querySelectorAll('.btn-secondary').forEach((incorrectBtn) => {
      incorrectBtn.parentNode.removeChild(incorrectBtn);
    });
    set.clear();
    set.add(val);
    if (!document.getElementById(val)) {
      btn.classList.add('btn-success');
      progressGroup.appendChild(btn);
    }
  } else {
    btn.classList.add('btn-secondary');
    progressGroup.appendChild(btn);
    set.delete(val);
  }
};

/**
 * Updates the year range object. Dif is negative when the answer was released
 * after the user's guess.
 * @param {number} newVal - The value of the user's guess
 * @param {number} dif - The value of the user's guess minus the answer's value
 */
const updateNumRange = function (newVal, dif, threshold, obj, key) {
  const withinThreshold = (Math.abs(dif) <= threshold);
  if (obj.high - obj.low <= threshold * 2) {
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

  const { low, high } = obj;
  document.getElementById(`${key}-low`).textContent = low;
  document.getElementById(`${key}-high`).textContent = high;

  setProgressbarWidths(obj, key);

  if (withinThreshold && threshold === 0) {
    const leftNum = document.getElementById(`${key}-low`);
    if (leftNum) {
      leftNum.textContent = '';
    }
  }
};

const updateNumRangeCorrect = function (newVal, obj, key) {
  obj.low = obj.high = newVal;

  document.getElementById(`${key}-low`).textContent = '';
  document.getElementById(`${key}-high`).textContent = obj.high;

  setProgressbarWidths(obj, key);
};
