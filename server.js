const express = require('express');
const app = express();

const ECT = require('ect');
const ectRenderer = ECT({ ext : '.ect' });

app.set('view engine', 'ect');
app.engine('ect', ectRenderer.render);

const axios = require('axios');
const lodash = require('lodash');

function processJokes(jokes) {
  const filtered = jokes.filter((d) => {
    const text = d.data.title + d.data.selftext;
    return text.length <= 140 && !text.includes('discord');
  });

  const bestJokes = lodash.sortBy(filtered, (j) => j.data.score).reverse().slice(0, 10);
  return bestJokes.map((d) => {
    const joke = lodash.pick(d.data, 'title', 'selftext', 'score', 'url');
    joke.encodedTitle = encodeURIComponent(joke.title);
    joke.encodedSelftext = encodeURIComponent(joke.selftext);
    return joke;
  });
}

app.get('/', (req, res) => {
  console.log("Status: OK");
  res.send("Status: OK");
});

app.get('/risque', async (req, res) => {
  const sources = [
    axios.get('https://www.reddit.com/r/jokes.json?limit=100', {reponseType: 'json'}),
    axios.get('https://www.reddit.com/r/dadjokes.json?limit=100', {reponseType: 'json'}),
    axios.get('https://www.reddit.com/r/darkjokes.json?limit=100', {reponseType: 'json'})
  ];

  try {
    const responses = await Promise.all(sources);
    const allJokes = responses.reduce((acc, jokes) => acc.concat(jokes.data.data.children), []);
    res.render('index', { jokes: processJokes(allJokes)});
  } catch (err) {
    res.status(500).send(err);
  }
});

const listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
