/**
 * Fetches the anime-database json and unpacks it into the weeble namespace.
 * Doesn't do any error handling because we want it to fail if there is an
 * error.
 * @returns {Promise} A promise that, once resolved, has set all anime data into
 * the weeble namespace.
 */
const fetchAllAnime = async function () {
  const anime_json = await (await fetch('/data/anime-database.json')).json();
  this.allAnime = anime_json;
  Object.entries(this.allAnime).forEach(([animeId, animeInfo]) => {
    const { studios, episodes, source, format, year } = animeInfo;
    if (episodes < this.ranges.episodes.min) {
      this.ranges.episodes.min = episodes;
    } else if (episodes > this.ranges.episodes.max) {
      this.ranges.episodes.max = episodes;
    }
    studios.forEach((studio) => {
      this.studios.possible.add(studio);
    });
    this.sources.add(source);
    this.formats.add(format);
    if (year < this.ranges.year.min) {
      this.ranges.year.min = year;
    } else if (year > this.ranges.year.max) {
      this.ranges.year.max = year;
    }

    if (25000 < animeInfo.popularity) {
      this.possibleAnime[animeId] = animeInfo;
    }
  });

  this.ranges.episodes.low = this.ranges.episodes.min;
  this.ranges.episodes.high = this.ranges.episodes.max;

  this.ranges.year.low = this.ranges.year.min;
  this.ranges.year.high = this.ranges.year.max;
};

/**
 * Fetches the anime titles json and puts it into the bound object. Doesn't
 * do any error handling because we want it to fail if there is an error.
 * @returns {Promise} A promise that, once resolved, has set all titles into
 * the weeble namespace.
 */
const fetchAnimeTitles = async function () {
  const anime_json = await (await fetch('/data/anime-titles.json')).json();
  const titles = anime_json.titles;
  const synonyms = anime_json.synonyms;
  this.titles = { ...synonyms, ...titles };
  this.filteredTitles = anime_json;
};

/**
 * Queries the server for the current daily anime and puts it in the bound
 * object.  Doesn't do any error handling because we want it to fail if there
 * is an error.
 * @returns {Promise} A promise that, once resolved, has set the daily anime.
 */
const fetchDailyAnime = async function () {
  const dailyAnime = await (await fetch('/daily')).json();
  if (!dailyAnime.daily) {
    throw 'Could not get daily anime.';
  }
  this.anime = dailyAnime.daily;
  this.anime.count = parseInt(dailyAnime.count.daily_count);
  const query = `
  query ($id: Int) {
    Media (id: $id, type: ANIME) {
      tags {
        name
        category
        rank
        isGeneralSpoiler
        isMediaSpoiler
        isAdult
      }
      genres
      hashtag
    }
  }
  `;
  const variables = {
    id: this.anime.id
  };
  const url = 'https://graphql.anilist.co';
  const headers = new Headers({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  });
  const fetchInit = {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      query: query,
      variables: variables
    }),
    mode: 'cors',
    cache: 'default',
  };
  const animeData = await (await fetch(url, fetchInit)).json();
  let { tags, genres } = animeData.data.Media;
  const hasSpoiler = (tag) => (tag.isGeneralSpoiler || tag.isMediaSpoiler);
  tags = tags.filter((tag) => !hasSpoiler(tag));
  this.anime.genres = genres;
  this.anime.curGenre = 0;
  this.anime.tags = tags.sort((a, b) => b.rank - a.rank);
  this.anime.curTag = 0;
};

/**
 * Removes all bootstrap placeholder items from the document.
 */
const removePlaceholders = function () {
  document.querySelectorAll('.placeholder').forEach((placeholder) => {
    placeholder.remove();
  });

  document.querySelectorAll('.placeholder-glow').forEach((placeholder) => {
    placeholder.classList.remove('placeholder-glow');
  });

  document.querySelectorAll('.progress-bar-striped.progress-bar-animated').forEach((progressBar) => {
    progressBar.classList.remove('progress-bar-striped', 'progress-bar-animated');
  });

  const { min: episodesMin, max: episodesMax } = this.ranges.episodes;
  document.getElementById('episodes-low').textContent = episodesMin;
  document.getElementById('episodes-high').textContent = episodesMax;

  const { min: yearMin, max: yearMax } = this.ranges.year;
  document.getElementById('year-low').textContent = yearMin;
  document.getElementById('year-high').textContent = yearMax;
};

/**
 * Loads anime data into whatever context is bound to this function.
 * @returns {Promise} A promise that, once resolved, has set all data into
 * whatever object was bound to this call.
 */
const loadAnimeData = function () {
  if (!this) {
    return Promise.reject('This function must be bound to a context.');
  }
  return Promise.all([
    fetchAllAnime.call(this),
    fetchAnimeTitles.call(this),
    fetchDailyAnime.call(this),
  ])
    .then(() => removePlaceholders.call(this))
    .catch((error) => {
      alert('Something went wrong when loading AniList data. Weeble cannot be played.');
      console.log(error);
    });
};

export { loadAnimeData };