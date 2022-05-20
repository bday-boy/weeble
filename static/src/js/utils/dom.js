/**
 * Creates a new Boostrap button with the given class
 * @param {string} text - The textContent for the button
 * @param {string} [btnClass] - A bootstrap button class
 * @returns {Element}
 */
const createNewButton = function (text, btnClass) {
  const small = document.createElement('small');
  small.textContent = text;

  const btn = document.createElement('button');
  btn.appendChild(small);
  btn.classList.add('btn', 'm-1', 'fs-6');
  if (btnClass) {
    btn.classList.add(btnClass);
  }
  btn.type = 'button';
  btn.id = text;
  return btn;
};

/**
 * Converts a string of HTML to document element.
 * @param {String} html - HTML representing a single element
 * @return {Element}
 */
const htmlToElement = function (html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

/**
 * Converts a string of HTML to a NodeList of document elements.
 * @param {String} html - HTML representing any number of sibling elements
 * @return {NodeList} 
 */
const htmlToElements = function (html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.childNodes;
};

export { createNewButton, htmlToElement, htmlToElements };