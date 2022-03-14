const animeJson = require('./static/data/anime-database.json');
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
const insertQuery = `INSERT INTO DailyAnime
VALUES ($1,$2,Array[$3],$4,$5,$6,$7,Array[$8],$9,$10,$11)
ON CONFLICT (date)
DO UPDATE SET id = EXCLUDED.id, title = EXCLUDED.title,
studios = EXCLUDED.studios, popularity = EXCLUDED.popularity,
episodes = EXCLUDED.episodes, source = EXCLUDED.source,
picture = EXCLUDED.picture, synonyms = EXCLUDED.synonyms,
format = EXCLUDED.format, year = EXCLUDED.year`;

const formatArray = function (arr) {
  const newArr = []
  arr.forEach((el) => {
    newArr.push(`'${el.replaceAll("'", "''")}'`);
  });
  return newArr.join(', ');
};

const useAnime = function (animeInfo) {
  return 25000 < animeInfo.popularity;
};

const randomAnime = function (allAnimeObj) {
  const allAnimeObjs = Object.entries(allAnimeObj);
  const anime = allAnimeObjs[Math.floor(Math.random() * allAnimeObjs.length)];
  const [animeId, animeInfo] = anime;
  animeInfo.id = parseInt(animeId);
  return animeInfo;
};

(async function () {
  const validAnime = {};
  Object.entries(animeJson).forEach(([animeId, animeInfo]) => {
    if (useAnime(animeInfo)) {
      validAnime[animeId] = animeInfo;
    }
  });
  validAnime;
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM DailyAnime');
    result.rows.forEach((row) => {
      delete validAnime[row.id];
    });
    const newAnime = randomAnime(validAnime);
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    client.query(insertQuery, [
      newAnime.id,
      newAnime.title,
      formatArray(newAnime.studios),
      newAnime.popularity,
      newAnime.episodes,
      newAnime.source,
      newAnime.picture,
      formatArray(newAnime.synonyms),
      newAnime.format,
      newAnime.year,
      new Date()
    ]);
    client.release();
  } catch (err) {
    console.error(err);
  }
})().then(() => process.exit());
