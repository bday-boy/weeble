/**
 * Computes the levenshtein distance between two strings. An adjacent character
 * transposition (swapping two characters) counts as one operation.
 * @param {string} a - First comparison string.
 * @param {string} b - Second comparison string.
 * @returns {number} The levenshtein distance.
 */
const levenshtein = function (a, b) {
  const faster_min = Math.min;
  const a_len = a.length;
  const b_len = b.length;

  const dist = Array(a_len + 1).fill().map(() => Array(b_len + 1).fill(0));

  for (let i = 0; i < a_len + 1; i++) {
    dist[i][0] = i;
  }
  for (let j = 0; j < b_len + 1; j++) {
    dist[0][j] = j;
  }

  for (let i = 1; i < a_len + 1; i++) {
    for (let j = 1; j < b_len + 1; j++) {
      const cost = (a[i - 1] !== b[j - 1]);
      dist[i][j] = faster_min(
        dist[i - 1][j] + 1,
        dist[i][j - 1] + 1,
        dist[i - 1][j - 1] + cost
      );
      if (
        1 < i && 1 < j &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        dist[i][j] = faster_min(dist[i][j], dist[i - 2][j - 2] + 1);
      }
    }
  }

  return dist[a_len][b_len];
};

/**
 * Computes the table of the LCS algorithm.
 * @param {string} search - The user's entry to search for in the text.
 * @param {string} text - The text to compare with the search.
 * @returns {Array<Array<int>>} A 2-dimensional array of ints.
 */
const lcsTable = function (search, text) {
  const L = Array(search.length + 1).fill()
              .map(() => Array(text.length + 1).fill(0));

  for (let i = 1; i <= search.length; i++) {
    for (let j = 1; j <= text.length; j++) {
      if (search[i - 1] === text[j - 1]) {
        L[i][j] = L[i - 1][j - 1] + 1
      } else {
        const x = L[i][j - 1];
        const y = L[i - 1][j];
        L[i][j] = (y <= x) ? x : y;
      }
    }
  }

  return L;
};

/**
 * @typedef {Object} lcsBacktrack
 * @property {number} longest - The longest substring in the LCS.
 * @property {string} html - An HTML string where parts of the LCS are
 * surrounded by a <mark> tag.
 */

/**
 * Computes the indices of the subsequence found in the text.
 * @param {string} search - The user's entry to search for in the text.
 * @param {string} text - The text to compare with the search.
 * @param {Array<Array<int>>} L - A computed LCS table.
 * @returns {lcsBacktrack} The result from backtracking our LCS table.
 */
const lcsString = function (search, text, L) {
  const searchLength = search.length;
  const textLength = text.length;
  const strs = [];
  let i = searchLength;
  let j = textLength;
  let prev = false;
  let longest = 0;
  let r = 0;

  while (0 < i && 0 < j) {
    if (search[i - 1] === text[j - 1]) {
      if (!prev) {
        if (j < r) {
          strs.push(text.slice(j, r));
        }
        prev = true;
        r = j;
        if (longest < r - j) {
          longest = r - j;
        }
      }
      i--;
      j--;
    } else {
      if (prev) {
        if (j < r) {
          strs.push(`<mark>${text.slice(j, r)}</mark>`);
        }
        prev = false;
        r = j;
        if (longest < r - j) {
          longest = r - j;
        }
      }
      const iIncrease = (L[i - 1][j] >= L[i][j - 1]);
      i -= iIncrease;
      j -= !iIncrease;
    }
  }
  if (j < r) {
    strs.push(`<mark>${text.slice(j, r)}</mark>`);
  }
  if (j < textLength) {
    strs.push(text.slice(j, textLength));
  }

  const lcsObj = {
    longest,
    html: strs.join('')
  };

  return lcsObj;
};

/**
 * Compares the user's search to some text (likely possible search results).
 * Note that while the actual LCS algorithm is symmetrical, this function
 * requires order because we will be using indices from the text to highlight
 * the user's search.
 * @param {string} search - The user's entry to search for in the text
 * @param {string} text - The text to compare with the search
 * @returns {object} Various info about the LCS, including the length of the
 * LCS, the length of the longest substring, the earliest common character,
 * and the indices of the subsequences.
 */
const lcs = function (search, text) {
  if (!search || !text) {
    return {
      length: 0,
      longest_substring: 0,
      html: '',
      ratio: 1
    };
  }

  const L = lcsTable(search, text);
  const {
    longest,
    html
  } = lcsString(search, text, L);

  return {
    length: L[0][0],
    longest_substring: longest,
    html,
    ratio: L[0][0] / search.length
  };
};

export { levenshtein, lcs };