/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  ______     ______     ______   __  __     __     ______
  /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
  \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
  \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
  \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


  This is a sample Slack bot built with Botkit.

  This bot demonstrates many of the core features of Botkit:

  * Connect to Slack using the real time API
  * Receive messages based on "spoken" patterns
  * Reply to messages
  * Use the conversation system to ask questions
  * Use the built in storage system to store and retrieve information
  for a user.

  # RUN THE BOT:

  Create a new app via the Slack Developer site:

  -> http://api.slack.com

  Get a Botkit Studio token from Botkit.ai:

  -> https://studio.botkit.ai/

  Run your bot from the command line:

  clientId=<MY SLACK TOKEN> clientSecret=<my client secret> PORT=<3000> studio_token=<MY BOTKIT STUDIO TOKEN> node bot.js

  # USE THE BOT:

  Navigate to the built-in login page:

  https://<myhost.com>/login

  This will authenticate you with Slack.

  If successful, your bot will come online and greet you.


  # EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

  -> http://howdy.ai/botkit

  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
var env = require('node-env-file');
try {
  env(__dirname + '/.env');
} catch (err) {
  console.log('Warning: .env file not found hope environment is set some other way');
}

// var environment = process.env.NODE_ENV;

if (!process.env.clientId || !process.env.clientSecret || !process.env.PORT) {
  console.log('Error: Specify clientId clientSecret and PORT in environment');
  usage_tip();
  process.exit(1);
}

var Botkit = require('botkit');
var debug = require('debug')('botkit:main');

var bot_options = {
  clientId: process.env.clientId,
  clientSecret: process.env.clientSecret,
  clientSigningSecret: process.env.clientSigningSecret,
  clientVerificationToken: process.env.clientVerificationToken,
  debug: true,
  scopes: ['bot', 'commands'],
  studio_token: process.env.studio_token,
  studio_command_uri: process.env.studio_command_uri
};

// Use a mongo database if specified, otherwise store in a JSON file local to the app.
// Mongo is automatically configured when deploying to Heroku
if (process.env.MONGO_URI) {
  var mongoStorage = require('botkit-storage-mongo')({mongoUri: process.env.MONGO_URI});
  bot_options.storage = mongoStorage;
} else if (process.env.REDIS_URL) {
  var redis_config = {url: process.env.REDIS_URL};
  var redisStorage = require('botkit-storage-redis')(redis_config);
  bot_options.storage = redisStorage;
} else {
  bot_options.json_file_store = __dirname + '/.data/db/'; // store user data in a simple JSON format
}


// Create the Botkit controller, which controls all instances of the bot.
var controller = Botkit.slackbot(bot_options);

controller.startTicking();

// Set up an Express-powered webserver to expose oauth and webhook endpoints
var webserver = require(__dirname + '/components/express_webserver.js')(controller);

// Set up a simple storage backend for keeping a record of customers
// who sign up for the app via the oauth
require(__dirname + '/components/user_registration.js')(controller);

// Send an onboarding message when a new team joins
require(__dirname + '/components/onboarding.js')(controller);

// no longer necessary since slack now supports the always on event bots
// // Set up a system to manage connections to Slack's RTM api
// // This will eventually be removed when Slack fixes support for bot presence
// var rtm_manager = require(__dirname + '/components/rtm_manager.js')(controller);
//
// // Reconnect all pre-registered bots
// rtm_manager.reconnect();

// enable advanced botkit studio metrics
require('botkit-studio-metrics')(controller);

// Enable Dashbot.io plugin
require(__dirname + '/components/plugin_dashbot.js')(controller);
// Enable Dashbot.io plugin
require(__dirname + '/components/plugin_mixpanel.js')(controller);


var normalizedPath = require("path").join(__dirname, "skills");
require("fs").readdirSync(normalizedPath).forEach(function(file) {
  require("./skills/" + file)(controller);
});



// This captures and evaluates any message sent to the bot as a DM
// or sent to the bot in the form "@bot message" and passes it to
// Botkit Studio to evaluate for trigger words and patterns.
// If a trigger is matched, the conversation will automatically fire!
// You can tie into the execution of the script using the functions
// controller.studio.before, controller.studio.after and controller.studio.validate
if (process.env.studio_token) {
  controller.on('direct_message,direct_mention,mention', function(bot, message) {
    controller.storage.teams.get(message.team, function(err, team_data) {
      if(!team_data.paused) {
        controller.studio.runTrigger(bot, message.text, message.user, message.channel).then(function(convo) {
          if (!convo) {
            // no trigger was matched
            // If you want your bot to respond to every message,
            // define a 'fallback' script in Botkit Studio
            // and uncomment the line below.
            // controller.studio.run(bot, 'fallback', message.user, message.channel);
          } else {
            // set variables here that are needed for EVERY script
            // use controller.studio.before('script') to set variables specific to a script
            convo.setVar('current_time', new Date());
          }
        }).catch(function(err) {
          bot.reply(message, 'I experienced an error with a request to Botkit Studio: ' + err);
          debug('Botkit Studio: ', err);
        });
      } else {
        debug('Botkit Studio: has been paused by dashbot');
      }
    });
  });
} else {
  console.log('~~~~~~~~~~');
  console.log('NOTE: Botkit Studio functionality has not been enabled');
  console.log('To enable, pass in a studio_token parameter with a token from https://studio.botkit.ai/');
}




function usage_tip() {
  console.log('~~~~~~~~~~');
  console.log('Botkit Starter Kit');
  console.log('Execute your bot application like this:');
  console.log('clientId=<MY SLACK CLIENT ID> clientSecret=<MY CLIENT SECRET> PORT=3000 studio_token=<MY BOTKIT STUDIO TOKEN> node bot.js');
  console.log('Get Slack app credentials here: https://api.slack.com/apps')
  console.log('Get a Botkit Studio token here: https://studio.botkit.ai/')
  console.log('~~~~~~~~~~');
}
