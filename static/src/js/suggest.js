import { htmlToElements } from './utils/dom.js';
import { lcs } from './utils/fuzzy-string.js';

const SHOW_MAX = 100;
const RATIO_THRESHOLD = 0.9;
const WIDTH_THRESHOLD = 3;

/**
 * Shows suggested anime based on the user's search input.
 * @param {HTMLElement} dropdown - ul element containing all li suggestions
 * @param {string} search - The user's text input
 * @param {Object} allTitles - Object containing actual titles and synonyms
 */
const showSuggestedAnime = function (dropdown, search, allTitles) {
  const searchLength = search.length;
  const idSet = new Set();
  const { titles, synonyms } = allTitles;
  const liNodes = [];
  let num_shown = 0;

  [titles, synonyms].forEach((titleGroup) => {
    Object.entries(titleGroup).forEach((entry) => {
      const [title, animeId] = entry;
      if (isNaN(animeId) || idSet.has(animeId)) {
        return;
      }
      const li = document.getElementById(animeId);
      // TODO: This is a band-aid solution, real solution should just make it
      // so there are no title collissions (see Berserk id=33 and id=21560)
      if (li === null) { return; }
      const { html, ratio, subsequenceWidth, ...compareData } = lcs(search, title);
      if (
        RATIO_THRESHOLD <= ratio
        && num_shown < SHOW_MAX
        && Math.abs(subsequenceWidth - searchLength) < WIDTH_THRESHOLD
      ) {
        const newChildren = htmlToElements(html);
        li.querySelector('div.text-wrap').replaceChildren(...newChildren);
        idSet.add(animeId);
        li.style.display = '';
        liNodes.push([li, compareData]);
        num_shown++;
      } else {
        li.style.display = 'none';
      }
    });
  });

  liNodes.sort((a, b) => a[1].firstMatch - b[1].firstMatch || b[1].longestSubstr - a[1].longestSubstr)
    .forEach(([li, _]) => dropdown.appendChild(li));
};

/**
 * Unhides all anime in the dropdown.
 * @param {HTMLElement} dropdown - ul element containing all li suggestions
 */
const showAllAnime = function (allTitles) {
  const { titles } = allTitles;
  Object.entries(titles).forEach((entry) => {
    const [title, animeId] = entry;
    if (isNaN(animeId)) {
      return;
    }
    const li = document.getElementById('' + animeId);
    const titleNode = document.createTextNode(title);
    li.querySelector('div.text-wrap').replaceChildren(titleNode);
    li.style.display = '';
  })
};

const suggestAnime = function (dropdown, search, allTitles) {
  if (search === '') {
    showAllAnime(allTitles);
  } else {
    showSuggestedAnime(dropdown, search, allTitles);
  }
}

export { suggestAnime };