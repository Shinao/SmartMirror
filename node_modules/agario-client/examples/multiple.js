//Example of multiple connections in one script
//This code is badly documented, please read basic.js in this folder if you don't understand this code

var AgarioClient = require('../agario-client.js'); //Use next line in your scripts
//var AgarioClient = require('agario-client');     //Use this in your scripts

function ExampleBot(bot_id) {
    this.bot_id      = bot_id;         //ID of bot for logging
    this.nickname    = 'agario-client';//default nickname
    this.verbose     = true;           //default logging enabled
    this.interval_id = 0;              //here we will store setInterval's ID

    this.server     = '';   //server address will be stored here
    this.server_key = '';   //server key will be stored here

    this.client       = new AgarioClient('Bot ' + this.bot_id); //create new client
    this.client.debug = 1; //lets set debug to 1
}

ExampleBot.prototype = {
    log: function(text) {
        if(this.verbose) {
            console.log(this.bot_id + ' says: ' + text);
        }
    },

    connect: function(server, key) {
        this.log('Connecting to ' + server + ' with key ' + key);
        this.server = server;
        this.server_key = key;
        this.client.connect(server, key);
        this.attachEvents();
    },

    attachEvents: function() {
        var bot = this;

        bot.client.on('connected', function() {
            bot.log('Connected, spawning');
            bot.client.spawn(bot.nickname);
            //we will search for target to eat every 100ms
            bot.interval_id = setInterval(function(){bot.recalculateTarget()}, 100);
        });

        bot.client.on('connectionError', function(e) {
            bot.log('Connection failed with reason: ' + e);
            bot.log('Server address set to: ' + bot.server + ' key ' + bot.server_key);
        });

        bot.client.on('myNewBall', function(ball_id) {
            bot.log('My new ball ' + ball_id);
        });

        bot.client.on('leaderBoardUpdate', function(old_highlights, highlights, old_names, names) {
            bot.log('Leaders on server: ' + names.join(', '));
        });

        bot.client.on('somebodyAteSomething', function(eater_ball, eaten_ball) {
            var ball = bot.client.balls[eater_ball];
            if(!ball) return; //if we don't know that ball, we don't care
            if(!ball.mine) return; //if it's not our ball, we don't care
            bot.client.log('I ate ' + eaten_ball + ', my new size is ' + ball.size);
        });

        bot.client.on('mineBallDestroy', function(ball_id, reason) { //when my ball destroyed
            if(reason.by) {
                bot.log(bot.client.balls[reason.by] + ' ate my ball');
            }

            if(reason.reason == 'merge') {
                bot.log('My ball ' + ball_id + ' merged with my other ball, now i have ' + bot.client.my_balls.length + ' balls');
            }else{
                bot.log('I lost my ball ' + ball_id + ', ' + bot.client.my_balls.length + ' balls left');
            }
        });

        bot.client.on('lostMyBalls', function() {
            bot.log('Lost all my balls, respawning');
            bot.client.spawn(bot.nickname);
        });

        bot.client.on('disconnect', function() {
            bot.log('Disconnected from server, bye!');
        });

        bot.client.on('reset', function() { //when client clears everything (connection lost?)
            clearInterval(bot.interval_id);
        });
    },

    getDistanceBetweenBalls: function(ball_1, ball_2) {
        return Math.sqrt( Math.pow( ball_1.x - ball_2.x, 2) + Math.pow( ball_2.y - ball_1.y, 2) );
    },

    recalculateTarget: function() {
        var bot = this;
        var candidate_ball = null;
        var candidate_distance = 0;
        var my_ball = bot.client.balls[ bot.client.my_balls[0] ];
        if(!my_ball) return;

        for(var ball_id in bot.client.balls) {
            var ball = bot.client.balls[ball_id];
            if(ball.virus) continue;
            if(!ball.visible) continue;
            if(ball.mine) continue;
            if(ball.size/my_ball.size > 0.5) continue;
            var distance = bot.getDistanceBetweenBalls(ball, my_ball);
            if(candidate_ball && distance > candidate_distance) continue;

            candidate_ball = ball;
            candidate_distance = bot.getDistanceBetweenBalls(ball, my_ball);
        }
        if(!candidate_ball) return;

        //bot.log('closest ' + candidate_ball + ', distance ' + candidate_distance);
        bot.client.moveTo(candidate_ball.x, candidate_ball.y);
    }
};

//you can do this in your code to use bot as lib
//module.exports = ExampleBot;

//launching bots below

//object of bots
var bots = {
    'Alpha'  : null,
    'Bravo'  : null,
    'Charlie': null
};

//searching party for bots in EU-London
console.log('Requesting party server');
AgarioClient.servers.createParty({region: 'EU-London'}, function(srv) {
    if(!srv.server) return console.log('Failed to request server (error=' + srv.error + ', error_source=' + srv.error_source + ')');
    console.log('Engaging bots to party http://agar.io/#' + srv.key + ' on IP ' + srv.server);

    for(var bot_id in bots) {
        bots[bot_id] = new ExampleBot(bot_id);
        bots[bot_id].connect('ws://' + srv.server, srv.key);
    }
});
