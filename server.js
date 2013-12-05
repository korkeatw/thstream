#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var fs      = require('fs');
// additional modules
var http	= require('http')
var io      = require('socket.io');
var twit    = require('twit');

var tw = new twit({
      consumer_key : 'A7u5zIZlXQHOG9pCCA9eiQ'
    , consumer_secret : 'K0Bk9bqe6Y2jXE4UFXaFQnHF2qv5c4utixsXjItPI'
    , access_token : '14424153-4idEAHdhlLaeSX6Uxwu0umrKojPgols5eCBhcSNhY'
    , access_token_secret : '4R8JQb5KeLI9zScoAWuHWsjMp0kJMRdDEhTu9diMMGs'
})

var stream = tw.stream('statuses/sample')

/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 3000;

        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        };
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           // disconnect stream
           console.log('Stop Twitter Stream')
		   stream.stop()
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
        self.initSocketIO().addSocketIOEvents();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.server.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

    /**
     * Inital Socket.io 
     */
    self.initSocketIO = function() {
        self.server = http.createServer(self.app);
        self.sio = io.listen(self.server);
        self.sio.enable('browser client etag');
        self.sio.enable('browser client gzip');
        self.sio.set('log level', 1);
        self.sio.set('transports', [
            'xhr-polling'
        ]);
        return this;
    }

    self.addSocketIOEvents = function() {
        self.sio.sockets.on('connection', function(socket) {
			stream.start()
			
			stream.on('connect', function() {
				socket.emit('connected', 'Connected')
			})
			
			stream.on('disconnect', function() {
				stream.stop()
				socket.emit('disconnect', 'Disconnected')
			})
			
			stream.on('tweet', function(tweet) {
    			if (tweet.lang == 'th') {
        			socket.emit('tweet', tweet)
    			}
			})
			
			socket.on('disconnect', function() {
				stream.stop()
				socket.emit('disconnect', 'Disconnected')
			})
        })
    }

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

