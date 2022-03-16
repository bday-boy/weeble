const isSubset = (A, B) => (![...A].some((x) => !B.has(x)));
const setDif = (A, B) => new Set([...A].filter((x) => !B.has(x)));
const setIntersection = (A, B) => new Set([...A].filter((x) => B.has(x)));

const endText = (won) => (won ? 'You win!' : 'Better luck tomorrow!');

const randomAnime = function (allAnimeObj) {
  const allAnimeObjs = Object.entries(allAnimeObj);
  const anime = allAnimeObjs[Math.floor(Math.random() * allAnimeObjs.length)];
  const [animeId, animeInfo] = anime;
  animeInfo.id = parseInt(animeId);
  return animeInfo;
};

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

const getDateToday = function () {
  const date = new Date();
  return date.toISOString().split('T')[0];
};

const getNextRefresh = function () {
  const today = new Date();
  today.setUTCHours(today.getUTCHours() - 7);
  today.setUTCDate(today.getUTCDate() + 1);
  today.setUTCHours(6, 59, 59, 999);
  return today;
};

const startTimer = function (timerElements) {
  const nextRefresh = getNextRefresh();

  setInterval(function () {
    const now = new Date().getTime();
    const dif = nextRefresh - now;

    const hrs = Math.floor((dif % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const min = Math.floor((dif % (1000 * 60 * 60)) / (1000 * 60));
    const sec = Math.floor((dif % (1000 * 60)) / 1000);

    const hrsStr = String(hrs).padStart(2, '0');
    const minStr = String(min).padStart(2, '0');
    const secStr = String(sec).padStart(2, '0');

    const countdown = hrsStr + ':' + minStr + ':' + secStr;
    timerElements.forEach((timer) => {
      timer.textContent = countdown;
    });
  }, 1000);
};

const levenshtein = function (s, t) {
  if (s === t) {
    return 0;
  }
  const n = s.length, m = t.length;
  if (n === 0 || m === 0) {
    return n + m;
  }
  const p = new Array(n);
  let x = 0, y, a, b, c, d, g, h, k;
  for (y = 0; y < n;) {
    p[y] = ++y;
  }

  for (; (x + 3) < m; x += 4) {
    const e1 = t.charCodeAt(x);
    const e2 = t.charCodeAt(x + 1);
    const e3 = t.charCodeAt(x + 2);
    const e4 = t.charCodeAt(x + 3);
    c = x;
    b = x + 1;
    d = x + 2;
    g = x + 3;
    h = x + 4;
    for (y = 0; y < n; y++) {
      k = s.charCodeAt(y);
      a = p[y];
      if (a < c || b < c) {
        c = (a > b ? b + 1 : a + 1);
      }
      else {
        if (e1 !== k) {
          c++;
        }
      }

      if (c < b || d < b) {
        b = (c > d ? d + 1 : c + 1);
      }
      else {
        if (e2 !== k) {
          b++;
        }
      }

      if (b < d || g < d) {
        d = (b > g ? g + 1 : b + 1);
      }
      else {
        if (e3 !== k) {
          d++;
        }
      }

      if (d < g || h < g) {
        g = (d > h ? h + 1 : d + 1);
      }
      else {
        if (e4 !== k) {
          g++;
        }
      }
      p[y] = h = g;
      g = d;
      d = b;
      b = c;
      c = a;
    }
  }

  for (; x < m;) {
    const e = t.charCodeAt(x);
    c = x;
    d = ++x;
    for (y = 0; y < n; y++) {
      a = p[y];
      if (a < c || d < c) {
        d = (a > d ? d + 1 : a + 1);
      }
      else {
        if (e !== s.charCodeAt(y)) {
          d = c + 1;
        }
        else {
          d = c;
        }
      }
      p[y] = d;
      c = a;
    }
    h = d;
  }

  return h;
}
