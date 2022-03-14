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

app.use(express.static(path.join(__dirname, 'static/')));

app
  .get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')))
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect();
      const result = await client.query('SELECT * FROM DailyAnime');
      const results = { 'results': (result) ? result.rows[0] : null};
      const jsonData = JSON.stringify(results);
      res.send(jsonData);
      client.release();
    } catch (err) {
      console.error(err);
      res.send({error: err});
    }
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
