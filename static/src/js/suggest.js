import { htmlToElements } from './utils/dom.js';
import { lcs } from './utils/fuzzy-string.js';

const SHOW_MAX = 100;
const THRESHOLD = 0.75;

/**
 * Shows suggested anime based on the user's search input.
 * @param {HTMLElement} dropdown - ul element containing all li suggestions
 * @param {string} search - The user's text input
 * @param {Object} allTitles - Object containing actual titles and synonyms
 */
const showSuggestedAnime = function (dropdown, search, allTitles) {
  const idSet = new Set();
  const { titles, synonyms } = allTitles;
  let num_shown = 0;

  [titles, synonyms].forEach((titleGroup) => {
    Object.entries(titleGroup).forEach((entry) => {
      const [title, animeId] = entry;
      if (isNaN(animeId) || idSet.has(animeId)) {
        return;
      }
      const li = document.getElementById(animeId);
      const { html, ratio } = lcs(search, title);
      if (THRESHOLD <= ratio && num_shown < SHOW_MAX && !isNaN(animeId)) {
        const newChildren = htmlToElements(html);
        li.setAttribute('data-ratio', ratio);
        li.querySelector('div.text-wrap').replaceChildren(...newChildren);
        idSet.add(animeId);
        li.style.display = '';
        num_shown++;
      } else if (idSet.has(animeId)) {
        return;
      } else {
        li.style.display = 'none';
      }
    });
  });

  Array.from(dropdown.querySelectorAll('li:not([style*="display:none"]):not([style*="display: none"])'))
    .sort((a, b) => a.dataset.ratio < b.dataset.ratio)
    .forEach((li) => dropdown.appendChild(li));
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