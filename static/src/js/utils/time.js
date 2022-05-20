/**
 * Gets the time when the next daily reset occurs as a JavaScript Date object.
 * @param {number} [resetTime=7] - The time in hours (0-23) when the reset
 * occurs (default is 7, or midnight MST)
 * @returns {Date} The next reset
 */
const getNextReset = function (resetTime = 7) {
  const today = new Date();
  today.setUTCHours(today.getUTCHours() - resetTime, 0, 0, 0);
  today.setUTCDate(today.getUTCDate() + 1);
  today.setUTCHours(resetTime);
  return today;
};

/**
 * Gets today's date in YYYY-MM-DD format.
 * @returns {string} Today's date in YYYY-MM-DD format
 */
const getDateToday = function () {
  const date = getNextReset();
  return date.toISOString().split('T')[0];
};

/**
 * Sets the textContent of all given elements to be the current time in
 * HH:MM:SS format each second.
 * @param {Array<HTMLElement>} timerElements 
 */
const startTimer = function (timerElements) {
  const nextRefresh = getNextReset().getTime();

  setInterval(function () {
    const now = new Date().getTime();
    const milliseconds = nextRefresh - now;

    const sec = Math.floor(milliseconds / 1000);
    const min = Math.floor(sec / 60);
    const hrs = Math.floor(min / 60);

    const secStr = String(sec % 60).padStart(2, '0');
    const minStr = String(min % 60).padStart(2, '0');
    const hrsStr = String(hrs % 24).padStart(2, '0');

    const countdown = `${hrsStr}:${minStr}:${secStr}`;
    timerElements.forEach((timer) => {
      timer.textContent = countdown;
    });
  }, 1000);
};

export { getNextReset, getDateToday, startTimer };