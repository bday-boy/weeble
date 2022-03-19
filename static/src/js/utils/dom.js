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

export { createNewButton };