var partials = require('express-partials');
var bodyParser = require('body-parser');
var helpers = require('./helpers.js'); // our custom middleware
var passport = require('passport');
var session = require('express-session');
var FacebookStrategy = require('passport-facebook').Strategy;
var cookieParser = require('cookie-parser');
var db = require('./../config.js');
var FitbitClient = require('fitbit-client-oauth2');
var FACEBOOK_APP_ID = "1631022490495363";
var FACEBOOK_APP_SECRET = "94fb8b098c0b2ffcd7287f1a00dcd05a";

var partials = require('express-partials');

var serve = process.env.HOSTY || "http://localhost:8000/"

module.exports = function (app, express) {

  var userRouter = express.Router();
  var apiRouter = express.Router();

  app.set('views', __dirname + '/../../client/templates');
  app.set('view engine', 'ejs');
  app.use(partials());

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(express.static(__dirname + '/../../client'));
  app.use(cookieParser());
  app.use(session({ secret: 'saxaphone mongoose' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());

  //////////////////////////////
  //                          //
  //  FACEBOOK AUTH PORTION   //
  //                          //
  //////////////////////////////


  passport.serializeUser(function (user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function (id, done) {
    db.User.findOne({ where: {fbID: id} }).then(function(user) {
      done(null, user);
    });
  });

  passport.use(new FacebookStrategy({
    clientID: FACEBOOK_APP_ID,
    clientSecret: FACEBOOK_APP_SECRET,
    callbackURL: serve + "auth/facebook/callback"
  },
    function (accessToken, refreshToken, profile, done) {
      // To keep the example simple, the user's Facebook profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Facebook account with a user record in your database,
      // and return that user instead.
      db.User
        .findOrCreate({where: {
          username: profile.displayName,
          fbID: profile.id
        }})
        .then(function (user, created) {
          // console.log(user.get({
          //   plain: true
          // }));
          // console.log(created);
        });
      return done(null, profile);
    }
  ));

  app.get('/auth/facebook',
    passport.authenticate('facebook'),
    function (req, res) {
      // The request will be redirected to Facebook for authentication, so this
      // function will not be called.
    });

  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/signin' }),
    function (req, res) {
      // don't need to know who the user is right now, so not dealing with this
      // the issue we're struggling with is getting the user's id back to the front end
      var fbID = req.user.id;
      db.User.findOne({
        where: {
          fbID: fbID
        }
      })
      .then(function (user) {
        res.redirect('/dashboard');
      });
    });

  // app.get('/users', function (req, res) {
  //   res.send(JSON.stringify([{
  //     name: 'Jackson Sharf',
  //     steps: 500,
  //     date: Date.now() + 500},
  //     {
  //       name: 'Lucas Ruprecht',
  //       steps: 1000,
  //       date: Date.now() + 1000},
  //     {
  //       name: 'Yoshi Sushi',
  //       steps: 10,
  //       date: Date.now()}
  //     ]));
  // });

  //////////////////////////////
  //                          //
  //   FITBIT AUTH PORTION    //
  //                          //
  //////////////////////////////


  var client = new FitbitClient('22B2V3', '1fb7088fd54576f1025f23a88d03f371');
  var redirect_uri = serve + '/auth/fitbit/callback';
  var scope =  [ 'activity' ];
  
  app.get('/auth/fitbit', 
    function(req, res, next) {
      var authorization_uri = client.getAuthorizationUrl(redirect_uri, scope);
      res.redirect(authorization_uri);
  }); 

  app.get('/auth/fitbit/callback', ensureAuthenticated, function(req, res, next) {
    var code = req.query.code;
    client.getToken(code, redirect_uri)
    .then(function(token) {
      token = token.token;
      db.User.findOne({ where: {fbID: req.user.dataValues.fbID} })
      .then(function(user) {
          db.AccountFitBit.findOrCreate({
            where: {
              fitBitID: token.user_id} })
          .spread(function(account, created) {
              console.log('second account down is ' + JSON.stringify(account.dataValues));
                client.getTimeSeries({
                  access_token: token.access_token,
                  refresh_token: token.refresh_token})
                .then(function(results) {
                    var fitBitInfo = results['activities-steps'][0];
                    account.update({
                      latestSteps: fitBitInfo.value, 
                      latestStepsTimeStamp: fitBitInfo.dateTime,
                      fitBitAccessToken: token.access_token, 
                      fitBitRefreshToken: token.refresh_token,
                      UserId: user.id
                    })
                    .then(function(accountObj) {
                      // console.log('accountOBj.dataValues =', accountObj.dataValues);
                      // console.log('results: ', results);
                      res.redirect('/dashboard');
                    });
                  })
                // })
                .catch(function(err) {
                    console.log('error getting user data', err);
                    res.send(500, err);
                });
              });
            // });

          });
      })
    // })
    .catch(function(err) {
        console.log('error getting token');
        res.send(500, err);
    });
  });

  //////////////////////////////
  //                          //
  //    END FITBIT PORTION    //
  //                          //
  //////////////////////////////

  app.get('/',
    ensureAuthenticated,
    function (req, res) {
    res.render('index');
  });

  app.get('/dashboard',
    ensureAuthenticated,
    function (req, res) {
    res.render('index');
  });

  app.get('/logout', 
    function (req, res) {
    res.session = null;
    res.redirect('/signin');
  });

  app.get('/profile',
    ensureAuthenticated,
    function (req, res) {
    res.render('profile');
  });

  app.get('/connect',
    ensureAuthenticated,
    function (req, res) {
    res.render('index');
  });

  app.get('/signin', function (req, res) {
    res.render('signin');
  });

  app.use(express.static(__dirname + '/../../client'));

  app.get('/users', ensureAuthenticated, userRouter); 


  app.use('/api', apiRouter);
  app.use(helpers.errorLogger);
  app.use(helpers.errorHandler);

  // inject our routers into their respective route files
  require('../controllers/userRoutes.js')(userRouter);
  require('../controllers/apiRoutes.js')(apiRouter);

};


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/signin');
}


