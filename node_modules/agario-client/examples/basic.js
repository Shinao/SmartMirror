//this is an example of API usage
var http = require('http');
var AgarioClient = require('../agario-client.js'); //Use next line in your scripts
//var AgarioClient = require('agario-client'); //Use this in your scripts

var region = 'EU-London'; //server region to request
var client = new AgarioClient('worker'); //create new client and call it "worker" (not nickname)
var interval_id = 0; //here we will store setInterval's ID

client.debug = 1; //setting debug to 1 (available 0-5)
client.auth_token = ''; //you can put here your auth token to authorize client. Check in README.md how to get it

//here adding custom properties/events example shown
AgarioClient.prototype.addFriend = function(ball_id) { //adding client.addFriend(ball_id) function
    var ball = client.balls[ball_id];
    ball.is_friend = true; //set ball.is_friend to true
    ball.on('destroy', function() { //when this friend will be destroyed
        client.emit('friendLost', ball); //emit friendEaten event
    });
    client.emit('friendAdded', ball_id); //emit friendAdded event
};

AgarioClient.Ball.prototype.isMyFriend = function() { //adding ball.isMyFriend() function
    return this.is_friend == true; //if ball is_friend is true, then true will be returned
};

client.on('ballAppear', function(ball_id) { //when we meet somebody
    var ball = client.balls[ball_id];
    if(ball.mine) return; //this is my ball
    if(ball.isMyFriend()) return; //this ball is already a friend
    if(ball.name == 'agario-client') { //if ball have name 'agario-client'
        client.addFriend(ball_id); //add it to friends
    }
});

client.on('friendLost', function(friend) { //on friendLost event
    client.log('I lost my friend: ' + friend);
});

client.on('friendAdded', function(friend_id) { //on friendEaten event
    var friend = client.balls[friend_id];
    client.log('Found new friend: ' + friend + '!');
});
//end of adding custom properties/events example

client.on('leaderBoardUpdate', function(old_highlights, highlights, old_names, names) { //when we receive leaders list.
    client.log('leaders on server: ' + names.join(', '));
});

client.on('mineBallDestroy', function(ball_id, reason) { //when my ball destroyed
    if(reason.by) {
        client.log(client.balls[reason.by] + ' ate my ball');
    }

    if(reason.reason == 'merge') {
        client.log('my ball ' + ball_id + ' merged with my other ball, now i have ' + client.my_balls.length + ' balls');
    }else{
        client.log('i lost my ball ' + ball_id + ', ' + client.my_balls.length + ' balls left');
    }
});

client.on('myNewBall', function(ball_id) { //when i got new ball
    client.log('my new ball ' + ball_id + ', total ' + client.my_balls.length);
});

client.on('lostMyBalls', function() { //when i lost all my balls
    client.log('lost all my balls, respawning');
    client.spawn('agario-client'); //spawning new ball with nickname "agario-client"
});

client.on('somebodyAteSomething', function(eater_ball, eaten_ball) { //when some ball ate some ball
    var ball = client.balls[eater_ball]; //get eater ball
    if(!ball) return; //if we don't know than ball, we don't care
    if(!ball.mine) return; //if it's not our ball, we don't care
    client.log('I ate ' + eaten_ball + ', my new size is ' + ball.size);
});

client.on('experienceUpdate', function(level, current_exp, need_exp) { //if facebook key used and server sent exp info
    client.log('Experience update: Current level is ' + level + ' and experience is ' + current_exp + '/' + need_exp);
});

client.on('connected', function() { //when we connected to server
    client.log('spawning');
    client.spawn('agario-client'); //spawning new ball
    interval_id = setInterval(recalculateTarget, 100); //we will search for target to eat every 100ms
});

client.on('connectionError', function(e) {
    client.log('Connection failed with reason: ' + e);
    client.log('Server address set to: ' + client.server + ' please check if this is correct and working address');
});

client.on('reset', function() { //when client clears everything (connection lost?)
    clearInterval(interval_id);
});

function recalculateTarget() { //this is all our example logic
    var candidate_ball = null; //first we don't have candidate to eat
    var candidate_distance = 0;
    var my_ball = client.balls[ client.my_balls[0] ]; //we get our first ball. We don't care if there more then one, its just example.
    if(!my_ball) return; //if our ball not spawned yet then we abort. We will come back here in 100ms later

    for(var ball_id in client.balls) { //we go through all balls we know about
        var ball = client.balls[ball_id];
        if(ball.virus) continue; //if ball is a virus (green non edible thing) then we skip it
        if(!ball.visible) continue; //if ball is not on our screen (field of view) then we skip it
        if(ball.mine) continue; //if ball is our ball - then we skip it
        if(ball.isMyFriend()) continue; //this is my friend, ignore him (implemented by custom property)
        if(ball.size/my_ball.size > 0.5) continue; //if ball is bigger than 50% of our size - then we skip it
        var distance = getDistanceBetweenBalls(ball, my_ball); //we calculate distances between our ball and candidate
        if(candidate_ball && distance > candidate_distance) continue; //if we do have some candidate and distance to it smaller, than distance to this ball, we skip it

        candidate_ball = ball; //we found new candidate and we record him
        candidate_distance = getDistanceBetweenBalls(ball, my_ball); //we record distance to him to compare it with other balls
    }
    if(!candidate_ball) return; //if we didn't find any candidate, we abort. We will come back here in 100ms later

    client.log('closest ' + candidate_ball + ', distance ' + candidate_distance);
    client.moveTo(candidate_ball.x, candidate_ball.y); //we send move command to move to food's coordinates
}

function getDistanceBetweenBalls(ball_1, ball_2) { //this calculates distance between 2 balls
    return Math.sqrt( Math.pow( ball_1.x - ball_2.x, 2) + Math.pow( ball_2.y - ball_1.y, 2) );
}

console.log('Requesting server in region ' + region);
AgarioClient.servers.getFFAServer({region: region}, function(srv) { //requesting FFA server
    if(!srv.server) return console.log('Failed to request server (error=' + srv.error + ', error_source=' + srv.error_source + ')');
    console.log('Connecting to ' + srv.server + ' with key ' + srv.key);
    client.connect('ws://' + srv.server, srv.key); //do not forget to add ws://
});
