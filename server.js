var express = require('express');
var morgan = require('morgan');
var path = require('path');
var ejs = require('ejs');
var db = require('./db/pg');
var pg = require('pg');
var bodyParser = require('body-parser');
var session = require('express-session');
var pgSession = require('connect-pg-simple')(session);
var connectionString = "postgres://dan:wak24pie@localhost/social_circuit";


var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


app.use(session({
  store: new pgSession({
    pg : pg,
    conString : connectionString,
    tableName : 'session'
  }),
  secret: 'sooosecrett', // something we maybe want to save with dotenv *hint hint*
  resave: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}))

app.get('/', function(req, res) {
  res.render('home.html.ejs');
});

app.post('/', db.createUser, function(req, res) {
  res.send('hit post /new');
});

app.post('/login', db.loginUser, function(req, res) {
  res.send('hit post /new');
});


app.get('/:id', function(req, res) {

});


var port = 3000;
var server = app.listen(port)
