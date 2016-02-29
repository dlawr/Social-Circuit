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
var methodOverride = require('method-override');

var app = express();

app.use(methodOverride('_method'));
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
  saveUninitialized: true,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}))

app.get('/', function(req, res) {

  console.log(req.session.user);
  res.render('home.html.ejs', { user: req.session.user});
});

app.post('/', db.createUser, function(req, res) {
  res.redirect(301,'/');
});

app.post('/login', db.loginUser, function(req, res) {
  req.session.user = res.rows
  // when you redirect you must force a save due to asynchronisity
  // https://github.com/expressjs/session/issues/167 **
  // "modern web browsers ignore the body of the response and so start loading
  // the destination page well before we finished sending the response to the client."

  req.session.save(function() {
    res.redirect(301,'/' + res.rows.email);
  });
});

app.get('/:id', db.checkExist, db.checkConnection, db.firstDegreeConnections, function(req, res) {
  if (!(req.session)) {
    console.log('--------------------------------------not session');
    res.send('you must be logged in to view this page');
  } else {
    console.log('firstDegreeConnections', res.firstDegreeConnections);
    console.log(res.linkStuff.isLinked,'linked');
    if (res.check) {
      if (!!(req.session.user)) {
        if(req.session.user.email === req.params.id) {
          res.render('userPage.html.ejs', {
            linkStuff: res.linkStuff,
            user: req.params.id,
            firstDegreeConnections: res.firstDegreeConnections
          });
          // res.send('this is your page');
        } else {
          res.render('userPage.html.ejs', {
            linkStuff: res.linkStuff,
            user: req.params.id,
            firstDegreeConnections: res.firstDegreeConnections
          });
          // res.send(req.params.id);
        }
      } else {
        res.send(req.params.id);
      }
    } else {
      res.send('no such user exists');
    }
  }
});

app.post('/connect', db.createConnection, function(req, res) {
  res.redirect(301, '/');
});

app.delete('/connect', db.deleteConnection, function(req, res) {
  res.redirect(301, '/');
});

app.delete('/logout', function(req, res) {
  req.session.destroy(function(err) {
    res.redirect('/')
  });
});



var port = 3000;
var server = app.listen(port)
