var pg = require('pg');
var connectionString = "postgres://dan:wak24pie@localhost/social_circuit";
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var session = require('express-session');

function createConnection(req, res, next) {
  pg.connect(connectionString, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      res.status(500).json({ success: false, data: err});
    }

    var query = client.query("insert into links (p1, p2) values (\
      (select id from players where email like ($1)),\
      (select id from players where email like ($2)));",
      [req.params.id, req.session.email], function(err, result) {
        done()
        if(err) {
          return console.error('error, running query', err);
        }

        pg.connect(connectionString, function(err, client, done) {
          // Handle connection errors
          if(err) {
            done();
            console.log(err);
            res.status(500).json({ success: false, data: err});
          }

          var query = client.query("insert into links (p1, p2) values (\
            (select id from players where email like ($1)),\
            (select id from players where email like ($2)));",
          [req.session.email, req.params.id], function(err, result) {
            done()
            if(err) {
              return console.error('error, running query', err);
            }
            next()
          });
        });

    });
  });
}

function checkConnection(req, res, next) {
  pg.connect(connectionString, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      res.status(500).json({ success: false, data: err});
    }

    var query = client.query("select players.email from (\
      select * from players\
      inner join links on players.id = links.p1\
    ) as first\
    inner join players on players.id = first.p2\
    where players.email like ($1);",
      [req.params.id], function(err, result) {
        done()
        if(err) {
          return console.error('error, running query', err);
        }


      if (result.rows.length === 0) {
        res.isLinked = false;
      } else {
        res.isLinked = true;
      }
      next()
    });
  });
}

function checkExist(req, res, next) {
  pg.connect(connectionString, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      res.status(500).json({ success: false, data: err});
    }

    var query = client.query("SELECT * FROM players WHERE email LIKE ($1);",
      [req.params.id], function(err, result) {
        done()
        if(err) {
          return console.error('error, running query', err);
        }

        if (result.rows.length === 0) {
          res.check = false;
        } else {
          res.check = true;
        }
        next()
    });
  });
}

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
module.exports.checkExist = checkExist;
module.exports.checkConnection = checkConnection;
module.exports.createConnection = createConnection;
