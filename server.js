var express = require('express');
var morgan = require('morgan');
var path = require('path');


var app = express();

app.get('/', function(req, res) {
  res.send('hit--------------/');
});

app.get('/:id')


var port = 3000;
var server = app.listen(port)
