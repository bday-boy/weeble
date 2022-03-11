const updateProgressSet = function (valArr, possibleSet, knownSet, type) {
  const correctStudios = new Set(window.anime[type]);
  valArr.forEach((val) => {
    if (!correctStudios.has(val)) {
      possibleSet.delete(val);
    }
  });
  [...setIntersection(correctStudios, new Set(valArr))].forEach((elm) => {
    knownSet.add(elm);
  });
};

const updateProgressGroup = function (val, status, set, type) {
  const rootGroup = document.getElementById(type);
  if (status === 'correct') {
    set.delete(val);
    [...set].forEach((val) => {
      const btn = rootGroup.querySelector(`#${val}`);
      btn.classList.add('btn-secondary', 'd-none', 'd-md-inline-block');
      btn.classList.remove('btn-primary');
      btn.disabled = true;
    });
    set.clear();
    set.add(val);
    rootGroup.querySelector(`#${val}`).classList.add('btn-success');
  } else {
    const btn = rootGroup.querySelector(`#${val}`);
    btn.classList.add('btn-secondary', 'd-none', 'd-md-inline-block');
    btn.classList.remove('btn-primary');
    btn.disabled = true;
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

  const { min, max, low, high } = obj;
  const total = (max - min);

  document.getElementById(`${key}-low`).textContent = low;
  document.getElementById(`${key}-high`).textContent = high;

  const start = document.getElementById(`${key}-progress-left`);
  const middle = document.getElementById(`${key}-progress-middle`);
  const end = document.getElementById(`${key}-progress-right`);

  start.setAttribute('aria-valuenow', `${low - min}`);
  start.style.width = `${((low - min) / total) * 100}%`;

  middle.setAttribute('aria-valuenow', `${high - low}`);
  middle.style.width = `${((high - low) / total) * 100}%`;

  end.setAttribute('aria-valuenow', `${max - high}`);
  end.style.width = `${((max - high) / total) * 100 }%`;
};
