// Rather than allocating each table over and over for each function call, we
// really only need to do it once
const MAX_LEN_TITLE = 200;
const L = Array(MAX_LEN_TITLE).fill().map(() => Array(MAX_LEN_TITLE).fill(0));
const D = Array(MAX_LEN_TITLE).fill().map(() => Array(MAX_LEN_TITLE).fill(0));

// Initialize Levenshtein distance matrix
for (let i = 0; i < MAX_LEN_TITLE; i++) {
  D[i][0] = i;
}
for (let j = 0; j < MAX_LEN_TITLE; j++) {
  D[0][j] = j;
}

// Cache Math.min in a variable to (probably) make it faster. Honestly idk if
// this even is faster, but it's a way to speed things up in Python
const fasterMin = Math.min;

const markString = function (indices, str) {
  indices.unshift(0);
  indices.push(str.length);
  const numIndices = indices.length;
  const strs = [];
  let arrIndex = 0;
  while (arrIndex < numIndices - 1) {
    const strStart = indices[arrIndex];
    const strEnd = indices[arrIndex + 1];
    if (arrIndex % 2 === 0) {
      strs.push(str.slice(strStart, strEnd));
    } else {
      strs.push(`<mark>${str.slice(strStart, strEnd)}</mark>`);
    }
    arrIndex++;
  }
  return strs.join('');
};

/**
 * Computes the levenshtein distance between two strings. An adjacent character
 * transposition (swapping two characters) counts as one operation.
 * @param {string} a - First comparison string.
 * @param {string} b - Second comparison string.
 * @returns {number} The levenshtein distance.
 */
const levenshtein = function (a, b) {
  const a_len = a.length;
  const b_len = b.length;

  for (let i = 1; i < a_len + 1; i++) {
    for (let j = 1; j < b_len + 1; j++) {
      const cost = (a[i - 1] !== b[j - 1]);
      D[i][j] = fasterMin(
        D[i - 1][j] + 1,
        D[i][j - 1] + 1,
        D[i - 1][j - 1] + cost
      );
      if (
        1 < i && 1 < j &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        D[i][j] = fasterMin(D[i][j], D[i - 2][j - 2] + 1);
      }
    }
  }

  return D[a_len][b_len];
};

/**
 * Computes the table of the LCS algorithm.
 * @param {string} search - The user's entry to search for in the text.
 * @param {string} text - The text to compare with the search.
 * @returns {number} The length of the LCS.
 */
const lcsTable = function (search, text) {
  // Keep lengths in variables so we don't do attribute lookup each loop
  const searchLength = search.length;
  const textLength = text.length;

  for (let i = 1; i <= searchLength; i++) {
    for (let j = 1; j <= textLength; j++) {
      if (search[i - 1] === text[j - 1]) {
        L[i][j] = L[i - 1][j - 1] + 1
      } else {
        const x = L[i][j - 1];
        const y = L[i - 1][j];
        L[i][j] = (y <= x) ? x : y;
      }
    }
  }

  return L[searchLength][textLength];
};

/**
 * Computes the indices of the subsequence found in the text.
 * @param {string} search - The user's entry to search for in the text.
 * @param {string} text - The text to compare with the search.
 * @returns {Object} The result from backtracking our LCS table.
 */
const lcsString = function (search, text) {
  const textLength = text.length;
  const indices = [];
  let i = search.length;
  let j = textLength;
  let longestSubstr = 0;

  while (0 < i && 0 < j) {
    if (L[i - 1][j] === L[i][j]) {
      i--;
    } else if (L[i][j - 1] === L[i][j]) {
      j--;
    } else {
      const right = j;
      i--;
      j--;
      while (0 < i && 0 < j && L[i][j - 1] !== L[i][j] && L[i - 1][j] !== L[i][j]) {
        i--;
        j--;
      }
      const left = j;
      indices.push(right, left);
      if (longestSubstr < right - left) longestSubstr = right - left;
    }
  }

  return {
    firstMatch: 0 < indices.length ? indices[0] : -1,
    longestSubstr,
    subsequenceCount: Math.floor(indices.length / 2),
    html: markString(indices.reverse(), text)
  };
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
  const length = lcsTable(search, text.toLocaleLowerCase());
  const sequenceDataObj = lcsString(search, text);

  return {
    ...sequenceDataObj,
    length,
    ratio: length / search.length
  };
};

/**
 * First searches the text for an exact match, and if no exact match is
 * found, does an LCS search on the text instead.
 * @param {string} search - The user's entry to search for in the text
 * @param {string} text - The text to compare with the search
 * @returns {object} Various info about the LCS, including the length of the
 * LCS, the length of the longest substring, the earliest common character,
 * and the indices of the subsequences.
 */
const fuzzySearch = function (search, text) {
  if (!search || !text) {
    return {
      length: NaN,
      firstMatch: NaN,
      longestSubstr: NaN,
      subsequenceCount: NaN,
      html: '',
      ratio: NaN
    };
  }

  const matchStart = text.toLocaleLowerCase().indexOf(search);
  if (matchStart === -1) {
    return lcs(search, text);
  } else {
    const searchLength = search.length;
    const matchEnd = matchStart + searchLength;
    return {
      length: searchLength,
      firstMatch: matchStart,
      longestSubstr: searchLength,
      subsequenceCount: 1,
      html: markString([matchStart, matchEnd], text),
      ratio: 1
    }
  }
};

export { levenshtein, fuzzySearch };