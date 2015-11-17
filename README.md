# festivetoaster

Driftly by festivetoaster is a new social media app that let's you keep up with your friends latest activity so they don't...drift away. By pulling in the latest (and only the latest) activity across social media accounts (initially only fitBit, but pipeline of potential integrations includes Twitter, gitHub, Good Reads...and whatever else you want!), you're able to get an accurate picture of when your friends were last seen on the interwebs. They don't need to get back to your text/call/FB message, they just need to live their lives, and you'll know that they're out there, not dead.

The Driftly tech stack is built on Node with Express on the backend with a Postgres db (using Sequelize as the interface) and a Backbone front end (because Yoshi is a glutton for punishment).

server.js gets the server online

config.js creates the postgres tables using sequelize. It is configured to handle both local dev environment and the heroku deployed app. The only tables currently being used are User and AccountFitBit, but commented out basic tables exist for Facebook, Twitter, and gitHub if you decide to move in that direction.

**NOTE** We're using FB for auth (using passport), but not doing anything with FB posts as a form of social media to pull in. As such, we are only storing FB data in the User table, rather than having separate table for FB information. We will need to add you as admins to the existing FB app if you take over Driftly.

/config/middleware.js is the backend workhorse. It includes the FB auth, fitBit auth, and does all of the routing. Authentication is checked on relevant routes. While apiRoutes and apiController are referenced here, they are not actually used in the current implementation. The functions that would run in those files are handled either in middleware.js directly or in the userController.js.

/controller/userRoutes.js is currently just routing the /users path to the getUsers method inside of userController.

/controller/userController.js exists for its getUsers method, which produces an array of user objects pulling in data from across the social networks (just fitBit in the current implementation).

On the front end...
