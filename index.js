const express = require('express');
const PORT = process.env.PORT || 5000;

app.set('views', __dirname + '/src');
app.engine('html', require('ejs').renderFile);

express()
  .get('/', (req, res) => res.render('src/index.html'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));
