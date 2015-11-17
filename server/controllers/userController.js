// var User = require('./userModel.js'); //find correct path
var db = require('./../config.js');
var api = require('./apiController.js');



module.exports = {
  getProfile: function (req, res) {
  },

  getUsers: function (req, res) {
    var userArray = [];
    console.log('hitting getUsers');
    db.User.findAll()
    .then(function (allUsers) {
      db.sequelize.Promise.each(allUsers, function (user) {
        return db.AccountFitBit.findOne({
          where: { UserId: user.id }
        })
        .then(function (fitBitAccount) {
          if ( fitBitAccount ) {
            userArray.push({
              userID: user.id,
              name: user.username,
              steps: fitBitAccount.latestSteps,
              stepsDate: fitBitAccount.latestStepsTimeStamp
            });
          }
          console.log('user array is equal to ' + userArray);
        })
        // .catch( function(err) {
        //   console.error(err);
        // });
      })
    .then(function () {
      console.log('userArray is ' + userArray);
      res.send( JSON.stringify(userArray) );
    })
    .catch( function (err) {
      console.error(err);
    });
  });
  },

  newTile: function () {

  }


};
