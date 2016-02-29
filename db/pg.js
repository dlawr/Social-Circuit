var pg = require('pg');
if (process.env.ENVIRONMENT === 'production') {
  var connectionString = DATABASE_URL;
} else {
  var connectionString = "postgres://dan:wak24pie@localhost/social_circuit";
}
var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(10);
var session = require('express-session');

function firstDegreeConnections(req, res, next) {
  if(!req.session.user) {
    next();
  } else {
    pg.connect(connectionString, function(err, client, done) {
      // Handle connection errors
      if(err) {
        done();
        console.log(err);
        return res.status(500).json({ success: false, data: err});
      }

      var query = client.query("select players.email from links\
       inner join players on links.p2 = players.id\
       where links.p1 = ($1);",
      [req.session.user.id], function(err, result) {
        done()
        if(err) {
          return console.error('error, running query', err);
        }
        res.firstDegreeConnections = result.rows;
        next();
      });
    });
  }
}

function deleteConnection(req, res, next) {
  console.log('deleteConnection start-----------------------------');
  console.log('info',req.body.friend_id, req.session.user.email);
  pg.connect(connectionString, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      res.status(500).json({ success: false, data: err});
    }
    var query = client.query("delete from links where\
      p1 = (select id from players where email like ($1))\
      and p2 = (select id from players where email like ($2));",
      [req.body.friend_id, req.session.user.email], function(err, result) {
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

          var query = client.query("delete from links where\
            p1 = (select id from players where email like ($1))\
            and p2 = (select id from players where email like ($2));",
          [req.session.user.email, req.body.friend_id], function(err, result) {
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

function selectRandomUser(id1) {
  console.log('select random user beginning');
  pg.connect(connectionString, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      // return res.status(500).json({ success: false, data: err});
    }

    var query = client.query("select id from players;",
      function(err, result) {
        done()
        if(err) {
          return console.error('error, running query', err);
        }
        var selection = Math.floor(Math.random() * result.rows.length);
        console.log(result.rows[selection].id, 'select random user end');
        var id2 = result.rows[selection].id;
        console.log(id1,id2,'add random connection beginning');
        pg.connect(connectionString, function(err, client, done) {
          // Handle connection errors
          if(err) {
            done();
            console.log(err);
            res.status(500).json({ success: false, data: err});
          }
          console.log('first instert', id1, id2);
          var query = client.query("insert into links (p1, p2) values (($1),($2));",
            [id1, id2], function(err, result) {
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

                var query = client.query("insert into links (p1, p2) values (($1),($2));",
                  [id2, id1], function(err, result) {
                    done()
                    if(err) {
                      return console.error('error, running query', err);
                    }
                    console.log(id1,id2,'add random connection');
                  });
                });

              });
            });
    });
  });
}

function createConnection(req, res, next) {
  console.log('createConnection start', req.body);
  console.log('info',req.body.friend_id, req.session.user.email);
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
      [req.body.friend_id, req.session.user.email], function(err, result) {
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
          [req.session.user.email, req.body.friend_id], function(err, result) {
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
  if(!req.session.user) {
    next();
  }
  pg.connect(connectionString, function(err, client, done) {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      res.status(500).json({ success: false, data: err});
    }
    console.log(req.session, req.session.user.email, req.params.id,'before query');
    var query = client.query("select players.email from (\
      select * from players\
      inner join links on players.id = links.p1\
      where players.email like ($1)\
    ) as first\
    inner join players on players.id = first.p2\
    where players.email like ($2);",
      [req.session.user.email, req.params.id], function(err, result) {
        done()
        if(err) {
          return console.error('error, running query', err);
        }

      console.log(result.rows,'check connection');
      if (result.rows.length === 0) {
        res.linkStuff = {
          isLinked: false,
          nextStep: 'connect',
          label: 'link'
        };
      } else {
        res.linkStuff = {
          isLinked: true,
          nextStep: '/connect?_method=DELETE',
          label: 'unlink'
        };
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

      var query = client.query("INSERT INTO players (email, password_hash) VALUES ($1, $2) returning id;",
        [email, hash], function(err, result) {
          console.log(result.rows);
          done()
          if(err) {
            return console.error('error, running query', err);
          }
          selectRandomUser(result.rows[0].id);
          next();
      });
    });
  }
}

module.exports.createUser = createUser;
module.exports.loginUser = loginUser;
module.exports.checkExist = checkExist;
module.exports.checkConnection = checkConnection;
module.exports.createConnection = createConnection;
module.exports.selectRandomUser = selectRandomUser;
module.exports.deleteConnection = deleteConnection;
module.exports.firstDegreeConnections = firstDegreeConnections;
