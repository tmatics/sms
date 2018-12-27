/**
 * Created by vinoth on 12/26/17.
 */

/*******************************************************************************************
 * Environmental Arguments
 ******************************************************************************************/
var ENV = process.env.ENV ? process.env.ENV : 'dev';

/*******************************************************************************************
 * Required module
 ******************************************************************************************/
var conf = require('./conf/' + (ENV) + '.js');
/*******************************************************************************************
 * Required libs
 ******************************************************************************************/
var Hapi = require('hapi');
var Good = require('good');
var Twilio = require('twilio');
var Promise = require('bluebird');

var client = new Twilio.RestClient(conf.twilio.accountSid, conf.twilio.authToken);

/*******************************************************************************************
 * HTTP Server Startup
 ******************************************************************************************/

var app = {};

app['conf'] = conf;
app.twilio=client

try {

    var server = new Hapi.Server();
    server.connection(app.conf.api);
    server.register({
        register: Good,
        options: {
            reporters: [{
                reporter: require('good-console'),
                events: {
                    response: '*',
                    log: '*'
                }
            }]
        }
    }, function(err) {
        if (err) {
            throw err; // something bad happened loading the plugin
        }

    });
    server.start(function() {
        console.log("Hapi server started @ " + server.info.uri);
    });
    app.server = server;
}
catch (err) {
    console.log('Error @ HTTP Server Initialization : ' + err);
}

/*******************************************************************************************
 * Queue Initialization
 ******************************************************************************************/

var tode = require('tode');
var queue = tode.Q;
var qconn = {};
try {
    qconn = queue.connect(conf['queue']);
    app.qconn = qconn;
    app.queue = queue
}
catch (err) {
    console.log('Error @ Queue initialization : ' + err);
}
//require("console-stamp")(console, {pattern: "dd/mm/yyyy HH:MM:ss"});


/********************************************************************************************
 tlogger Initialisation
 *******************************************************************************************/
//var Tlogger = require('tlogger');
//var tlogger = new Tlogger(conf['log']);
//app.tlogger = tlogger.init();


/*******************************************************************************************
 * Database Initialization
 ******************************************************************************************/
var mongoDb = require('tdatadriver').mongo;
try {
    mongoDb.connect(conf.database);
    app['mongoDb'] = mongoDb;
    app.mongoDb = Promise.promisifyAll(app.mongoDb);
}
catch (err) {
    console.log('Error @ Database Connection Initialization : ' + err);
}

/*******************************************************************************************
 * Global Exception Handler
 ******************************************************************************************/
process.on('uncaughtException', function (err) {
    console.log('Exception handled @ [' + MODULE + '] uncaughtException' + err.stack);
});

/****************************************************************************************
 * Service Factory Initialization
 * **************************************************************************************/

var ServiceFactory = require("service-factory-"+ENV);
app.serviceFactory = Promise.promisifyAll(new ServiceFactory(conf.services));
/****************************************************************************************
 * Routes Initialization
 * **************************************************************************************/

var SmsServices = require("./actions/sms-action.js");
var SmsAction=new SmsServices(app);
SmsAction.retryMessages()