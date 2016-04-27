var https = require('https');
var EventEmitter = require('events').EventEmitter;
var WebSocket    = require('ws');

var agar_client_id = '677505792353827'; //hardcoded in client

function Account(name) { //TODO doc vars
    this.name           = name; //debug name
    this.token          = null; //token after requestFBToken()
    this.token_expire   = 0;    //timestamp after requestFBToken()
    this.token_provider = 1;    //provider ID after requester
    this.c_user         = null; //cookie from www.facebook.com
    this.datr           = null; //cookie from www.facebook.com
    this.xs             = null; //cookie from www.facebook.com
    this.agent          = null; //connection agent
    this.debug          = 1;
    this.server         = 'wss://web-live-v3-0.agario.miniclippt.com/ws'; //TODO doc

    this.ws    = null;
}

Account.prototype.log = function(text) {
    if(this.name) {
        console.log('Account(' + this.name + '): ' + text);
    } else {
        console.log('Account: ' + text);
    }
};

//request token from facebook
Account.prototype.requestFBToken = function(cb) {
    var account = this;

    if(this.debug >= 1) {
        if(!this.c_user) this.log('[warning] You did not specified Account.c_user');
        if(!this.datr)   this.log('[warning] You did not specified Account.datr');
        if(!this.xs)     this.log('[warning] You did not specified Account.xs');
    }

    var ret = {
        error: null,
        res: null,
        data: null
    };

    var c_user = this.c_user;
    var datr = this.datr;
    var xs = this.xs;

    //Some users don't decode their cookies, so let's try do it here
    var find_hex = /\%[0-9A-F]{2}/i; //Trying to resolve issue #158, using RegEx to find if the string really contains encoded data
    if(c_user && c_user.match(find_hex)) c_user = decodeURIComponent(c_user);
    if(datr && datr.match(find_hex)) datr = decodeURIComponent(datr);
    if(xs && xs.match(find_hex)) xs = decodeURIComponent(xs);

    var cookies = 'c_user=' + encodeURIComponent(c_user) + ';' +
        'datr=' + encodeURIComponent(datr) + ';' +
        'xs=' + encodeURIComponent(xs) + ';';

    var options = {
        host: 'www.facebook.com',
        path: '/dialog/oauth?client_id=' + agar_client_id + '&redirect_uri=https://agar.io&scope=public_profile,%20email&response_type=token',
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0',
            'Cookie': cookies
        },
        agent: this.agent || null
    };

    var req = https.request(options, function(res) {
        var data = '';
        ret.res = res;

        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            data += chunk;
        });
        res.on('end', function() {
            ret.data = data;

            if(res && res.headers && res.headers.location) {
                res.headers.location.replace(/access_token=([a-zA-Z0-9-_]*)&/, function(_, parsed_token) {
                    if(parsed_token) {
                        account.token = parsed_token;
                        account.token_provider = 1;
                    }
                });
                res.headers.location.replace(/expires_in=([0-9]*)/, function(_, expire) {
                    if(expire) {
                        account.token_expire = (+new Date) + expire*1000;
                    }
                });
            }

            if(cb) cb(account.token, ret);
        });
    });

    req.on('error', function(e) {
        ret.error = e;
        if(cb) cb(null, ret);
    });

    req.end();
};

module.exports = Account;



//The code below is reserved for future usage, just in case.
/*
Account.prototype.connect = function() { //TODO doc, event
    if(this.ws && this.ws.readyState != WebSocket.CLOSED) {
        if(this.debug >= 1 && this.ws.readyState == WebSocket.CONNECTING)
            this.log('[warning] connect() called while connecting, ignoring');

        if(this.debug >= 1 && this.ws.readyState == WebSocket.OPEN)
            this.log('[warning] connect() called while connected already, ignoring');

        if(this.debug >= 1 && this.ws.readyState == WebSocket.CLOSING)
            this.log('[warning] connect() called while disconnecting, ignoring');

        return false;
    }

    if(!this.token) {
        if(this.debug >= 1)
            this.log('[warning] connect() called without `client.token` set, ignoring');

        return false;
    }

    if(this.debug >= 1)
        this.log('Connecting...');

    var headers = {
        'Origin': 'http://agar.io'
    };

    this.ws            = new WebSocket(this.server, null, {headers: headers, agent: this.agent});
    this.ws.binaryType = "arraybuffer";
    this.ws.onopen     = this.onConnect.bind(this);
    this.ws.onmessage  = this.onMessage.bind(this);
    this.ws.onclose    = this.onDisconnect.bind(this);
    this.ws.onerror    = this.onError.bind(this);

    return true;
};

Account.prototype.onConnect = function() { //TODO doc, event
    if(this.debug >= 1)
        this.log('Connected');
};

Account.prototype.onMessage = function() { //TODO doc, event
    if(this.debug >= 3)
        this.log('Received packet');
};

Account.prototype.onDisconnect = function() { //TODO doc, event
    if(this.debug >= 1)
        this.log('Disconnected');
};

Account.prototype.onError = function(e) { //TODO doc, event
    // http://www.w3.org/TR/2011/WD-websockets-20110419/
    // if(this.ws.readyState == WebSocket.CLOSING) {
    if(this.debug >= 1)
        this.log('Connection error: ' + e);
};

//TODO debug level check before log

*/

//For future investigations
/*initial packet:
{
    "device": {
    "platform": 5, //3=facebook, 4=miniclip, 5=default/other
        "version": "1.3.3", //hardcoded as `Ob.VERSION` in agario.js
        "width": 0,
        "height": 0
},
    "realm": 2, //2 = facebook, 3 = google
    "authToken": "CAAJoMB...TI2E2B"
}


convert packet to binary:
    Rc.encapsulateMessage = function(a, b) {
        var c = new qe;
        c.set_type(a);
        switch (c.get_type()) {
            case 30:
                c.set_pingField(B.__cast(b, te));
                break;
            case 31:
                c.set_pongField(B.__cast(b, ue));
                break;
            case 70:
                c.set_softPurchaseRequestField(B.__cast(b, we));
                null;
                break;
            case 20:
                c.set_disconnectField(B.__cast(b, of));
                null;
                break;
            case 10:
                c.set_loginRequestField(B.__cast(b, PacketToSend));
                break;
            case 80:
                c.set_updateUserSettingsField(B.__cast(b, xe));
                break;
            case 42:
                c.set_activateBoostRequestField(B.__cast(b, me));
                break;
            case 62:
                c.set_gameOverField(B.__cast(b, qf));
                break;
            default:
                null
        }
        return Rc.packageMessage(c)
    };


readFromSlice: function(a, b) {
    for (var c = 0, d = 0, e = 0, f = 0; a.buf.totlen - a.buf.pos > b;) {
        var n = q.read__TYPE_UINT32(a);
        switch (n >> 3) {
            case 1:
                if (0 != c) throw new k(new C("Bad data format: Device.platform cannot be set twice."));
                ++c;
                this.set_platform(q.read__TYPE_ENUM(a));
                break;
            case 2:
                if (0 != d) throw new k(new C("Bad data format: Device.version cannot be set twice."));
                ++d;
                this.set_version(q.read__TYPE_STRING(a));
                break;
            case 3:
                if (0 != e) throw new k(new C("Bad data format: Device.width cannot be set twice."));
                ++e;
                this.set_width(q.read__TYPE_UINT32(a));
                break;
            case 4:
                if (0 != f) throw new k(new C("Bad data format: Device.height cannot be set twice."));
                ++f;
                this.set_height(q.read__TYPE_UINT32(a));
                break;
            default:
                y.prototype.readUnknown.call(this, a, n)
        }
    }
},*/
