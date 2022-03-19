/**
 * Gets the time when the next daily reset occurs as a JavaScript Date object.
 * @param {number} [resetTime=7] - The time in hours (0-23) when the reset
 * occurs (default is 7, or midnight MST)
 * @returns {Date} The next reset
 */
/* RENAME THIS TO getNextReset */
const getNextReset = function (resetTime = 7) {
  const today = new Date();
  today.setUTCHours(today.getUTCHours() - resetTime);
  today.setUTCDate(today.getUTCDate() + 1);
  today.setUTCHours(resetTime);
  return today;
};

const getDateToday = function () {
  const date = getNextReset();
  return date.toISOString().split('T')[0];
};

const startTimer = function (timerElements) {
  const nextRefresh = getNextReset();

  setInterval(function () {
    const now = new Date().getTime();
    const dif = nextRefresh - now;

    const hrs = Math.floor((dif % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const min = Math.floor((dif % (1000 * 60 * 60)) / (1000 * 60));
    const sec = Math.floor((dif % (1000 * 60)) / 1000);

    const hrsStr = String(hrs).padStart(2, '0');
    const minStr = String(min).padStart(2, '0');
    const secStr = String(sec).padStart(2, '0');

    const countdown = hrsStr + ':' + minStr + ':' + secStr;
    timerElements.forEach((timer) => {
      timer.textContent = countdown;
    });
  }, 1000);
};

export { getNextReset, getDateToday, startTimer };