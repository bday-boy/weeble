const getGuessTitle = function (guessWrapper, location) {
  const a = guessWrapper.querySelector('a');
  if (location === 'anilist') {
    return `~!${a.href}!~\n`; /* TODO: Maybe just do title */
  } else if (location === 'discord') {
    return `||${a.textContent}||\n`;
  } else {
    return '';
  }
};

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
  return guessEmojis.join(' ');
};

const createCopyText = function (location) {
  const copyTexts = [];
  const guesses = Array.from(document.querySelectorAll('#guesses > div'));
  guesses.reverse();
  /* TODO: Add something here for which day of weeble/guess limit */
  copyTexts.push(`Weeble ${guesses.length}/10\n`);
  guesses.forEach((guessWrapper) => {
    if (location === 'discord') {
      copyTexts.push(getGuessEmojis(guessWrapper) + ' ');
      copyTexts.push(getGuessTitle(guessWrapper, location));
    } else {
      copyTexts.push(getGuessTitle(guessWrapper, location));
      copyTexts.push(getGuessEmojis(guessWrapper) + '\n');
    }
  });
  copyTexts.push('https://weeble.herokuapp.com/');
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

const copyToClipboard = function (location) {
  const copyText = createCopyText(location);
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

export default copyToClipboard;
