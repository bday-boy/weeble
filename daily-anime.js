const { randomAnime } = require('./static/src/js/utils')
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
const insertQuery = 'INSERT INTO anime VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)';

const formatArray = function (arr) {
  const newArr = []
  arr.forEach((el) => {
    newArr.push(el.replaceAll("'", "''"));
  });
  return `ARRAY[${newArr.join(', ')}]`;
};

const useAnime = function (animeInfo) {
  return 25000 < animeInfo.popularity;
};

const randomAnime = function (animeObj) {
  const allAnimeObjs = Object.entries(animeObj);
  const randomAnime = allAnimeObjs[Math.floor(Math.random() * allAnimeObjs.length)];
  const [animeId, animeInfo] = randomAnime;
  animeInfo.id = parseInt(animeId);
  return animeInfo;
};

fetch('./static/data/anime-database.json')
  .then((res) => res.json())
  .then((animeJson) => {
    const validAnime = {};
    Object.entries(animeJson).forEach(([animeId, animeInfo]) => {
      if (useAnime(animeInfo)) {
        validAnime[animeId] = animeInfo;
      }
    });
    return validAnime;
  })
  .then((validAnime) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM DailyAnime');
      result.rows.forEach((row) => {
        delete validAnime[row.id];
      });
      const newAnime = randomAnime(validAnime);
      client.query(insertQuery, [
        newAnime.id,
        newAnime.title,
        formatArray(newAnime.studios),
        newAnime.popularity,
        newAnime.episdes,
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
      res.send("Error " + err);
    }
  })
  .catch((err) => console.log(err));
