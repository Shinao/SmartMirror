//auth_token request example

var AgarioClient = require('../agario-client.js'); //Use next line in your scripts
//var AgarioClient = require('agario-client');     //Use this in your scripts

var account = new AgarioClient.Account();

//Login through facebook on http://agar.io/ and copy cookies c_user,datr,xs from http://www.facebook.com/ here
account.c_user = '1000xxxxxx795';
account.datr   = 'q0F5VlxxxxxxxxxxXEJDC';
account.xs     = '200:OPXxxxxxxxMw:2:1450787324:-1';

//Request token
account.requestFBToken(function(token, info) {
    if(token) {
        console.log('Got new token: ' + token);
        console.log('Now you can set it in client.auth_token and connect');
        console.log('Token will expire in ' + ( account.token_expire-(+new Date) ) + 'ms');
    }else{
        console.log('Failed to get token!');
        if(info.error) console.log('Request error: ' + info.error);
        if(info.res && info.res.statusCode) console.log('HTTP code: ' + info.res.statusCode);
        if(info.res && info.res.headers && info.res.headers.location) console.log('Redirect: ' + info.res.headers.location);
        if(info.data) console.log('HTML: ' + info.data);
    }
});
