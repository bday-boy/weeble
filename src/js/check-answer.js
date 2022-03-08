const newIcon = function(iconName, status) {
  /* create icon wrapper */
  const div = document.createElement('div');
  div.classList.add('icon-wrapper', status, 'd-flex', 'align-items-center', 'justify-content-center');

  /* create the icon */
  const i = document.createElement('i');
  i.classList.add('bi', `bi-${iconName}`);

  div.appendChild(i);
  return div;
}

const isSubset = function(A, B) {
  return (![...A].some((x) => !B.has(x)));
}

const setDif = function(A, B) {
  return new Set([...A].filter((x) => !B.has(x)));
}

const setIntersection = function(A, B) {
  return new Set([...A].filter((x) => B.has(x)));
}
