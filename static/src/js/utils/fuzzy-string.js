/**
 * Computes the levenshtein distance between two strings. An adjacent character
 * transposition (swapping two characters) counts as one operation.
 * @param {string} a - First comparison string
 * @param {string} b - Second comparison string
 * @returns {number} The levenshtein distance
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
 * Computes the table of the LCS algorithm. Note that the table is comptuted
 * in reverse order because constructing the subsequence from it is more
 * convenient that way.
 * @param {string} search - The user's entry to search for in the text
 * @param {string} text - The text to compare with the search
 * @returns {Array<Array<int>>} A 2-dimensional array of ints.
 */
const lcs_table = function (search, text) {
    const L = Array(search.length + 1).fill().map(() => Array(text.length + 1).fill(0));

    for (let i = search.length - 1; i >= 0; i--) {
        for (let j = text.length - 1; j >= 0; j--) {
            if (search[i] === text[j]) {
                L[i][j] = L[i + 1][j + 1] + 1
            } else {
                const x = L[i][j + 1];
                const y = L[i + 1][j];
                L[i][j] = (y <= x) ? x : y;
            }
        }
    }

    return L;
};

/**
 * Computes the indices of the subsequence found in the text.
 * @param {string} search - The user's entry to search for in the text
 * @param {string} text - The text to compare with the search
 * @param {Array<Array<int>>} L - A computed LCS table.
 */
const lcs_indices = function (search, text, L) {
    const search_len = search.length;
    const text_len = text.length;
    const indices = [];
    let i = 0;
    let j = 0;
    let prev = false;
    let longest = 0;
    let cur = 0;
    let l = 0;
    let r = 0;

    while (i < search_len && j < text_len) {
        if (search[i] === text[j]) {
            if (!prev) {
                l = j;
                prev = true;
            }
            i++;
            j++;
        } else {
            if (prev) {
                indices.push([l, j]);
                prev = false;
            }
            const inc_i = (L[i + 1][j] >= L[i][j + 1]);
            i += inc_i;
            j += !inc_i;
        }
    }
    if (prev) {
        indices.push([l, j]);
    }

    return {
        longest,
        indices
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
    const L = lcs_table(search, text);
    const {
        longest,
        indices
    } = lcs_indices(search, text, L);

    return {
        length: L[0][0],
        longest_substring: longest,
        first_common_char: indices.length > 0 ? indices[0] : -1,
        indices,
        ratio: longest / text.length
    };
};

export { levenshtein, lcs };