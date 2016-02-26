var pg = require('pg');
var connectionString = "postgres://dan:wak24pie@localhost/social_circuit";
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var session = require('express-session');

function createSecure(email, password, callback) {
  // hash password user enters at sign up
  bcrypt.genSalt(function (err, salt) {
    bcrypt.hash(password, salt, function (err, hash) {
      // this callback saves the user to our database with the hashed password
      callback(email, hash)
    });
  });
};

function createUser(req, res, next) {
  console.log(req.body);
  createSecure(req.body.email, req.body.password, saveUser);

  function saveUser(email, hash) {
    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }

      var query = client.query("INSERT INTO players (email, password_hash) VALUES ($1, $2);",
        [email, hash], function(err, result) {
          done()
          if(err) {
            return console.error('error, running query', err);
          }
          next()
      });
    });
  }
}

module.exports.createUser = createUser;
