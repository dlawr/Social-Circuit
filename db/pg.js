var pg = require('pg');
var connectionString = "postgres://dan:wak24pie@localhost/social_circuit";
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var session = require('express-session');

function loginUser(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;

  // find user by email entered at log in
  pg.connect(connectionString, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      res.status(500).json({ success: false, data: err});
    }

    var query = client.query("SELECT * FROM players WHERE email LIKE ($1);",
      [email], function(err, result) {
        done()
        if(err) {
          return console.error('error, running query', err);
        }

        if (result.rows.length == 0) {
          res.status(204).json({success: false, data: 'no account matches that password'})
        } else if (bcrypt.compareSync(password, result.rows[0].password_hash)) {
          res.rows = result.rows[0]
          next()
        }
    });
  });
}

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
module.exports.loginUser = loginUser;
