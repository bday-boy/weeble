const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname));

app
  .get('/', (req, res) => res.sendFile(path.join(__dirname, 'src/index.html')))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
