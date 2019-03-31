// init project
var express = require('express');
var app = express();

var ECT = require('ect');
var ectRenderer = ECT({ ext : '.ect' });
app.set('view engine', 'ect');
app.engine('ect', ectRenderer.render);

var request = require('request');
var underscore = require('underscore');

function processJokes(data) {
  var filtered = underscore.filter(data.data.children, function (d) {
    var text = d.data.title + d.data.selftext;
    return text.length <= 140 && !text.includes('discord');
  });
  var topFive = underscore.sortBy(filtered, function (j) {
    return j.data.score;
  }).reverse().slice(0, 10);

  return underscore.map(topFive, function (d) {
    return underscore.pick(d.data, 'title', 'selftext', 'score', 'url');
  });
}

app.get('/', function (req, res){
  console.log("Status: OK");
  res.send("Status: OK");
});

app.get('/risque', function (req, res){
  request('https://www.reddit.com/r/jokes.json?limit=100', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      res.render('index', { jokes: processJokes(JSON.parse(body))});
    }
  });
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
