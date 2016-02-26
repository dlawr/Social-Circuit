var express = require('express');
var morgan = require('morgan');
var path = require('path');
var ejs = require('ejs');
var db = require('./db/pg');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.render('home.html.ejs');
});

app.post('/', db.createUser, function(req, res) {
  res.send('hit post /new');
})



app.get('/:id', function(req, res) {

})


var port = 3000;
var server = app.listen(port)
