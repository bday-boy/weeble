import { constrainString } from './string.js';

/**
 * Creates a square emoji based on the color of the given iconWrapper element.
 * @param {HTMLElement} iconWrapper 
 * @returns {string} The square emoji.
 */
const getIconEmoji = function (iconWrapper) {
  if (iconWrapper.classList.contains('bg-success')) {
    if (document.body.classList.contains('high-contrast')) {
      return String.fromCodePoint(0x1F7E6);
    } else {
      return String.fromCodePoint(0x1F7E9);
    }
  } else if (iconWrapper.classList.contains('bg-warning')) {
    return String.fromCodePoint(0x1F7E8);
  } else {
    return String.fromCodePoint(0x1F7E5);
  }
};

/**
 * Creates a string of emojis based on the colors of the given guessWrapper's
 * success markers.
 * @param {HTMLElement} guessWrapper 
 * @returns {string} A string of all found emojis.
 */
const getGuessEmojis = function (guessWrapper) {
  const guessEmojis = [];
  guessWrapper.querySelectorAll('div > div.icon-wrapper').forEach((iconWrapper) => {
    guessEmojis.push(getIconEmoji(iconWrapper));
  });
  return guessEmojis.join('');
};

/**
 * Returns the text used for the given location.
 * @param {HTMLElement} guessWrapper 
 * @param {string} location 
 * @returns {string} The title as formatted for the given copy location.
 */
const getGuessTitle = function (guessWrapper, location) {
  const a = guessWrapper.querySelector('a');
  if (location === 'anilist') {
    return a.href;
  } else if (location === 'discord') {
    return `||${constrainString(a.textContent)}||\n`;
  } else {
    return '';
  }
};

/**
 * Creates the copyable text for the user's daily guesses.
 * @param {string} location 
 * @param {boolean} won 
 * @param {number} dailyCount 
 * @returns {string} The full copyable text for the user's daily.
 */
const createCopyText = function (location, won, dailyCount) {
  const copyTexts = [];
  const guesses = Array.from(document.querySelectorAll('#guesses > div'));
  guesses.reverse();
  // TODO: Add something here for which day of weeble/guess limit
  copyTexts.push(`Weeble ${dailyCount || -1} ${won ? guesses.length : 'X'}/7\n`);
  if (location === 'anilist') {
    const guessEmojis = [];
    const guessAnime = [];
    guesses.forEach((guessWrapper) => {
      guessEmojis.push(getGuessEmojis(guessWrapper));
      guessAnime.push(getGuessTitle(guessWrapper, location));
    });
    copyTexts.push(`${guessEmojis.join('\n')}\n~!\n${guessAnime.join('\n')}\n!~\n`);
  } else if (location === 'discord') {
    guesses.forEach((guessWrapper) => {
      copyTexts.push(getGuessEmojis(guessWrapper) + ' ');
      copyTexts.push(getGuessTitle(guessWrapper, location));
    });
  } else {
    guesses.forEach((guessWrapper) => {
      copyTexts.push(getGuessTitle(guessWrapper, location));
      copyTexts.push(getGuessEmojis(guessWrapper) + '\n');
    });
  }
  copyTexts.push('https://weeble.ninja/');
  return copyTexts.join('');
};

/**
 * If all attempts to send the text to the user's clipboard fail, they will at
 * least have a textarea where they can select the text for copying.
 * @param {string} copyText 
 */
const copyFallbackFallback = function (copyText) {
  const copyTextarea = document.getElementById('copy-text');
  copyTextarea.value = copyText;
};

/**
 * Uses an outdated method of copying to the clipboard. Only happens if the
 * modern method fails.
 * @param {string} copyText 
 * @returns {boolean} Whether or not the copying was successful.
 */
const copyFallback = function (copyText) {
  const copier = document.createElement('textarea');
  copier.value = copyText;

  // Avoid scrolling to bottom
  copier.style.top = "0";
  copier.style.left = "0";
  copier.style.position = "fixed";

  document.body.appendChild(copier);
  copier.focus();
  copier.select();

  let successful = false;
  try {
    successful = document.execCommand('copy');
  } catch (err) {
    successful = false;
  }

  document.body.removeChild(copier);
  return successful;
};

/**
 * Creates copy text for the user's daily and returns a promise that tries to
 * copy it to their clipboard.
 * @param {string} location 
 * @param {boolean} won 
 * @param {number} dailyCount 
 * @returns {Promise} A Promise that copies text to the user's clipboard.
 */
const copyToClipboard = function (location, won, dailyCount) {
  const copyText = createCopyText(location, won, dailyCount);
  copyFallbackFallback(copyText);
  if (!navigator.clipboard) {
    return new Promise((res, rej) => {
      try {
        res(copyFallback(copyText));
      } catch (err) {
        rej(err);
      }
    });
  } else {
    return navigator.clipboard.writeText(copyText)
      .then(() => true)
      .catch(() => copyFallback(copyText));
  }
};

export { copyToClipboard };