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
 * @param {String} html - HTML representing a single element
 * @return {Element}
 */
const htmlToElement = function (html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
};

/**
 * @param {String} html - HTML representing any number of sibling elements
 * @return {NodeList} 
 */
const htmlToElements = function (html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.childNodes;
};

/**
 * @param {String} html - HTML representing any number of sibling elements
 * @return {NodeList} 
 */
const htmlToDocFragment = function (html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content;
};

export { createNewButton, htmlToElement, htmlToElements, htmlToDocFragment };