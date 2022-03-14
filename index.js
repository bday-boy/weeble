const express = require('express');
const app = express();
const path = require('path');
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
const PORT = process.env.PORT || 5000;
const dailyAnimeQuery = `SELECT DISTINCT ON ("date") *
FROM DailyAnime
ORDER BY "date" DESC;`;

app.use(express.static(path.join(__dirname, 'static/')));

app
  .get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')))
  .get('/daily', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query(dailyAnimeQuery);
      const dailyAnime = {};
      if (result && result.rows && result.rows.length > 0) {
        dailyAnime.daily = result.rows[0];
      } else {
        dailyAnime.daily = null;
      }
      const jsonData = JSON.stringify(dailyAnime);
      res.send(jsonData);
      client.release();
    } catch (err) {
      console.error(err);
      res.send({error: err});
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
