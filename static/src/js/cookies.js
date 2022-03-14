/**
 * Returns whether or not the user has completed the daily challenge. If
 * userWon is a truthy value, the cookie will be set to indicate that the user
 * has won.
 * @param {boolean} [winOrLose] - True if the user won the daily, false if they
 * lost, and undefined if just checking for whether or not they've finished
 * @returns {boolean} Whether or not the user has already finished the daily
 */
const didDaily = function (winOrLose) {
  const cookie = '_didDaily';

  const getCookie = () => {
    const cookieFinder = new RegExp(`(?:^|; )${encodeURIComponent(cookie)}=([^;]*)`);
    const result = cookieFinder.exec(document.cookie);
    return result ? decodeURIComponent(result[1]) : null;
  };

  const setCookie = () => {
    const newCookie = `${encodeURIComponent(cookie)}=${encodeURIComponent(winOrLose)}; expires=${getNextDay()}; path=/`;
    return (document.cookie = newCookie);
  };

  if (winOrLose !== undefined) {
    setCookie();
  }
  
  return Boolean(getCookie());
};
