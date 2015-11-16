var Sequelize = require("sequelize");
var dbConfig = require('./dbConfig');
var match; 
if(process.env.DATABASE_URL) {
  match = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/) ;
} 
var sequelize;

if ( process.env.DATABASE_URL ) {
  sequelize = new Sequelize(match[5], match[1], match[2], {
    dialect:  'postgres',
    protocol: 'postgres',
    port:     match[4],
    host:     match[3],
    logging: false,
    dialectOptions: {
        ssl: true
    }
  });
} else {
  sequelize = new Sequelize('nowdb', dbConfig.username, dbConfig.password, {
    host: 'localhost',
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    }
  });
}

// we define the models we need using js--we don't need a schema file
var User = sequelize.define('User', {
  username: Sequelize.STRING,
  fbID: Sequelize.STRING/*,*/
  // name: Sequelize.STRING,
  // location: Sequelize.STRING
  //almost certainly will need to add more fields here as we build out
});

// var AccountFB = sequelize.define('AccountFB', {
//   FBname: Sequelize.STRING,
//   fbID: Sequelize.STRING,
//   latestActivityType: Sequelize.STRING,
//   latestActivityContent: Sequelize.STRING,
//   latestActivityTimeStamp: Sequelize.DATE
//   /*need more information about which FB events we're considering here and what the format that they come
//   through the API in. That's a significant chunk of work, so I'm leaving it for another task*/
// });

// puts a UserId column on each AccountFB instance
// gives `.setUser` method, available inside the .success callback after creating a new instance of AccountFB
// AccountFB.belongsTo(User);
// // enables bi-directional associations between Users and AccountFBs
// User.hasOne(AccountFB);

var AccountFitBit = sequelize.define('AccountFitBit', {
  fitBitID: Sequelize.STRING,
  fitBitAccessToken: Sequelize.STRING,
  fitBitRefreshToken: Sequelize.STRING,
  latestSteps: Sequelize.INTEGER,
  //need to see if .DATE works here or if we need to switch to string
  latestStepsTimeStamp: Sequelize.DATE
});

AccountFitBit.belongsTo(User);
User.hasOne(AccountFitBit);

var AccountTwitter = sequelize.define('AccountTwitter', {
  Twittername: Sequelize.STRING,
  TwitterID: Sequelize.STRING,
  latestActivityType: Sequelize.STRING,
  latestActivityContent: Sequelize.STRING,
  latestActivityTimeStamp: Sequelize.DATE
  //need to understand the data coming from Twitter better to complete this
});

AccountTwitter.belongsTo(User);
User.hasOne(AccountTwitter);

var AccountGitHub = sequelize.define('AccountGitHub', {
  GitHubname: Sequelize.STRING,
  GitHubID: Sequelize.STRING,
  latestActivityType: Sequelize.STRING,
  latestActivityContent: Sequelize.STRING,
  latestActivityTimeStamp: Sequelize.DATE
  //need to understand the data coming from GitHub better to complete this
});

AccountGitHub.belongsTo(User);
User.hasOne(AccountGitHub);





// creates all tables if they don't already exist. Pass in {force: true}
// to drop any existing user and message tables and make new ones.
sequelize.sync();


exports.User = User;
// exports.AccountFB = AccountFB;
exports.AccountFitBit = AccountFitBit;
exports.AccountTwitter = AccountTwitter;
exports.AccountGitHub = AccountGitHub;

