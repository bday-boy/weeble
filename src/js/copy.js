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

const getIconEmoji = function (iconWrapper, location) {
  if (iconWrapper.classList.contains('bg-success')) {
    if (document.body.classList.contains('high-contrast')) {
      return location === 'discord' ? ':green_square:' : String.fromCodePoint(0x1F7E6);
    } else {
      return location === 'discord' ? ':blue_square:' : String.fromCodePoint(0x1F7E9);
    }
  } else if (iconWrapper.classList.contains('bg-warning')) {
    return location === 'discord' ? ':yellow_square:' : String.fromCodePoint(0x1F7E8);
  } else {
    return location === 'discord' ? ':red_square:' : String.fromCodePoint(0x1F7E5);
  }
};

const getGuessEmojis = function (guessWrapper, location) {
  const guessEmojis = [];
  guessWrapper.querySelectorAll('div > div.icon-wrapper').forEach((iconWrapper) => {
    guessEmojis.push(getIconEmoji(iconWrapper, location));
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
      copyTexts.push(getGuessEmojis(guessWrapper, location) + ' ');
      copyTexts.push(getGuessTitle(guessWrapper, location));
    } else {
      copyTexts.push(getGuessTitle(guessWrapper, location));
      copyTexts.push(getGuessEmojis(guessWrapper, location) + '\n');
    }
  });
  copyTexts.push('http://127.0.0.1:5500/src/');
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

const copyToClipboard = function (copyText, copyButton) {
  const copyPopover = (success) => {
    const title = success ? 'Copied to clipboard!' : 'Could not copy to clipboard.';
    const content = success ? "You're good to go!" : 'Try copying from the textbox below.';
    const popover = new bootstrap.Popover(copyButton, {
      title,
      content,
      placement: 'top',
      trigger: 'focus'
    });
    popover.show();
  };

  /* TODO: Replace with popups, not alerts */
  if (!navigator.clipboard) {
    copyPopover(copyFallback(copyText));
  } else {
    navigator.clipboard.writeText(copyText)
      .then(() => copyPopover(true))
      .catch(() => copyPopover(copyFallback(copyText)));
  }
  copyFallbackFallback(copyText);
};
