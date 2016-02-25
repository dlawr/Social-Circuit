var pg = require('pg');
var connectionString = "postgres://dan:wak24pie@localhost/social_circuit";
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var session = require('express-session');


function createUser(req, res, next) {

}
