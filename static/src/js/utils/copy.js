import { constrainString } from './string.js';

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

const getGuessEmojis = function (guessWrapper) {
  const guessEmojis = [];
  guessWrapper.querySelectorAll('div > div.icon-wrapper').forEach((iconWrapper) => {
    guessEmojis.push(getIconEmoji(iconWrapper));
  });
  return guessEmojis.join('');
};

const getGuessTitle = function (guessWrapper, location) {
  const a = guessWrapper.querySelector('a');
  if (location === 'anilist') {
    return a.href; /* TODO: Maybe just do title */
  } else if (location === 'discord') {
    return `||${constrainString(a.textContent)}||\n`;
  } else {
    return '';
  }
};

const createCopyText = function (location, won) {
  const copyTexts = [];
  const guesses = Array.from(document.querySelectorAll('#guesses > div'));
  guesses.reverse();
  /* TODO: Add something here for which day of weeble/guess limit */
  copyTexts.push(`Weeble ${won ? guesses.length : 'X'}/7\n`);
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
  } else if (location === 'general') {
    guesses.forEach((guessWrapper) => {
      copyTexts.push(getGuessTitle(guessWrapper, location));
      copyTexts.push(getGuessEmojis(guessWrapper) + '\n');
    });
  }
  copyTexts.push('https://weeble.ninja/');
  return copyTexts.join('');
};

const copyFallbackFallback = function (copyText) {
  const copyTextarea = document.getElementById('copy-text');
  copyTextarea.value = copyText;
};

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

const copyToClipboard = function (location, won) {
  const copyText = createCopyText(location, won);
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
