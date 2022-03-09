(function () {
  const min = 1941;
  const max = 2022;
  const dif = (max - min);
  const midStart = 1985;
  const midEnd = 2011;
  const extraWidth = (midStart === midEnd) + 0;

  if (extraWidth) {
    document.getElementById('correct-text').textContent = midStart;
    document.getElementById('start-text').textContent = '';
    document.getElementById('end-text').textContent = '';
  } else {
    document.getElementById('start-text').textContent = midStart;
    document.getElementById('end-text').textContent = midEnd;
  }

  const start = document.getElementById('start-progress');
  const middle = document.getElementById('middle-progress');
  const end = document.getElementById('end-progress');

  start.setAttribute('aria-valuenow', `${midStart - min}`);
  start.style.width = `${((midStart - min) / dif) * 100 - extraWidth / 2}%`;

  middle.setAttribute('aria-valuenow', `${midEnd - midStart}`);
  middle.style.width = `${((midEnd - midStart) / dif) * 100 + extraWidth}%`;

  end.setAttribute('aria-valuenow', `${max - midEnd}`);
  end.style.width = `${((max - midEnd) / dif) * 100 - extraWidth / 2}%`;
})();