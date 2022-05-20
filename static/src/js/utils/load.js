/**
 * Selects a random anime from the given object.
 * @param {Object} allAnimeObj - Object with all anime in it
 * @returns {Object} A random anime from the object of all anime
 */
const randomAnime = function (allAnimeObj) {
  const allAnimeObjs = Object.entries(allAnimeObj);
  const anime = allAnimeObjs[Math.floor(Math.random() * allAnimeObjs.length)];
  return anime[1];
};

/**
 * Fetches the anime-database json and unpacks it into the weeble namespace.
 * @returns {Promise} A promise that, once resolved, has set all anime data into
 * the weeble namespace.
 */
const fetchAllAnime = function () {
  return fetch('/data/anime-database.json')
    .then((response) => response.json())
    .then((anime_json) => {
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
    })
    .catch((err) => console.log(err));
};

/**
 * Queries the server for the current daily anime and puts it in the bound
 * object.
 * @returns {Promise} A promise that, once resolved, has set the daily anime.
 */
const fetchDailyAnime = function () {
  return fetch('/daily')
    .then((response) => response.json())
    .then((dailyAnime) => {
      if (dailyAnime.daily) {
        this.anime = dailyAnime.daily;
        this.anime.count = parseInt(dailyAnime.count.daily_count);
      } else {
        this.anime = randomAnime(this.possibleAnime);
        this.anime.count = -1;
      }
    })
    .catch(() => this.anime = randomAnime(this.possibleAnime));
};

/**
 * Fetches the anime titles json and puts it into the bound object.
 * @returns {Promise} A promise that, once resolved, has set all titles into
 * the weeble namespace.
 */
const fetchAnimeTitles = function () {
  return fetch('/data/anime-titles.json')
    .then((response) => response.json())
    .then((anime_json) => {
      const titles = anime_json.titles;
      const synonyms = anime_json.synonyms;
      this.titles = { ...synonyms, ...titles };
      this.filteredTitles = anime_json;
    })
    .catch((err) => console.log(err));
};

/**
 * Given the AniList ID of an anime, returns a promise that resolves into an
 * array of all non-spoiler tags for that anime.
 * @returns {Promise<Array.<Object>} A promise that resolves into an array of
 * tags.
 */
const fetchAnswerData = function () {
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
  return fetch(url, fetchInit)
    .then((response) => {
      return response.json()
        .then((json) => (response.ok ? json : Promise.reject(json)));
    })
    .then((data) => {
      const { tags, genres } = data.data.Media;
      const hasSpoiler = (tag) => (tag.isGeneralSpoiler || tag.isMediaSpoiler);
      const nonSpoilerTags = tags.filter((tag) => !hasSpoiler(tag));
      return { tags: nonSpoilerTags, genres };
    })
    .then((answerInfo) => {
      const { tags, genres } = answerInfo;
      this.anime.genres = genres;
      this.anime.curGenre = 0;
      this.anime.tags = tags.sort((a, b) => b.rank - a.rank);
      this.anime.curTag = 0;
    })
    .catch((error) => console.log(error));
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
  return fetchAllAnime.call(this)
    .then(() => fetchDailyAnime.call(this))
    .then(() => fetchAnimeTitles.call(this))
    .then(() => fetchAnswerData.call(this))
    .then(() => removePlaceholders.call(this))
    .catch((error) => console.log(error));
};

export { loadAnimeData };