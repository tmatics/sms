/***********************************************************************************
 *MODULES REQUIREMENT START HERE BY RT-TEAM
 **********************************************************************************/
var SmsServices = require("../actions/sms-action.js");
var Promise = require('bluebird');

var ApiRoutes = function (app) {

    this.app = app;
    this.conf = app.conf;
    this.db = app.mongoDb;
    this.objectId = app.mongoDb.ObjectId;
    this.SmsAction=new SmsServices(app);
    this.SmsAction.init()
};
module.exports = ApiRoutes;

/***********************************************************************************
 *PROTOTYPES START HERE BY RT-TEAM
 **********************************************************************************/

ApiRoutes.prototype.init = function () {

    var self = this;
    var app = self.app;

    console.log(self.app.twilio.accountSid);
    console.log(self.app.twilio.authToken);
    /**************************************************************************************
     *         SAMPLE ENDPOINT
     * ************************************************************************************/
    app.server.route({
        method: 'GET',
        path:'/',
        handler: function (request, reply) {
                return reply({'test':'Ok'});
        }
    });
    app.server.route({
        method: 'POST',
        path:'/v1/sendsms',
        handler: function (request, reply) {
            request.body=request.body ?request.body : request.payload;
            console.log("|||||||||||||||||||||| send sms ")
            self.SmsAction.sendSms(request.body).then(function(result){
                return reply(result);
            })

        }
    });
    app.server.route({
        method: 'POST',
        path:'/v1/admin',
        handler: function (request, reply) {
            request.body=request.body ?request.body : request.payload;
            console.log("|||||||||||||||||||||| Posted Data ")
            console.log(request.body);

        }
    });

    app.server.route({
        method: 'get',
        path:'/test/ack/dummy',
        handler: function (request, reply) {
            var request = {ToCountry: 'AU', ToState: '', SmsMessageSid: 'SM4d217dbc999bdd0493f36c2f6ec0171c', NumMedia: '0', ToCity: '', FromZip: '', SmsSid: 'SM4d217dbc999bdd0493f36c2f6ec0171c', FromState: 'Karnataka', SmsStatus: 'received', FromCity: '', Body: 'UN39 122235 ACK TESTING GOING ON .. ', FromCountry: 'IN', To: '+61476856445', ToZip: '', NumSegments: '1', MessageSid: 'SM4d217dbc999bdd0493f36c2f6ec0171c', AccountSid: 'AC4c0d0ea6548ce7c9a20866dac82c637e', From: '+919886648037', ApiVersion: '2010-04-01', Message: 'ACK TESTING GOING ON .. ', deviceId: 'UN39', sa: '122235'}
            self.SmsAction.dummyTest(request).
                then(function(result){
                return reply(result);
            })

        }
    });
    app.server.route({
        method: 'GET',
        path:'/receivesms',
        handler: function (request, reply) {
            //request.body=request.body ?request.body : request.payload;


            console.log("|||||||||||||||||received message entered||||||||||||||||||",request.query)
            self.SmsAction.receivedSms1(request.query).then(function(result){
                return reply(result);
            })

        }
    });
    app.server.route({
        method: 'GET',
        path:'/v1/list/sms/message',
        handler: function (request, reply) {
            var req=request.query;
            if(req.sa){
                self.SmsAction.getListSmsMessages(req)
                    .then(function(result){
                        reply(result)
                    })
                    .error(function(e){
                        console.log("ERROR HANDLER " + e);
                        reply(e)
                    })
                    .catch(function(e){
                        console.log("CATCH IN " + e);
                        reply(e.message)
                    })
            }
            else{
                console.log('ingathan varuthu list call');
                var results={};
                self.SmsAction.getListSmsMessagesIteration(req).then(function (result) {
                    results.status=true;
                    results.data=result
                    reply (results)
                })

            }
        }

    });
    app.server.route({
        method: 'GET',
        path:'/v1/update/ack/sms/message',
        handler: function (request, reply) {
            var req=request.query;
            self.SmsAction.updateAckedForSendSmsMessage(req)
                .then(function(result){
                    reply(result)
                })
                .error(function(e){
                    console.log("ERROR HANDLER " + e);
                    reply(e)
                })
                .catch(function(e){
                    console.log("CATCH IN " + e);
                    reply(e.message)
                })
        }

    });
    app.server.route({
        method: 'GET',
        path:'/v1/list/sms/message/count',
        handler: function (request, reply) {
            var req=request.query;
            self.SmsAction.listSmsMessageCount(req)
                .then(function(result){
                    reply(result)
                })
                .error(function(e){
                    console.log("ERROR HANDLER " + e);
                    reply(e)
                })
                .catch(function(e){
                    console.log("CATCH IN " + e);
                    reply(e.message)
                })
        }

    });

    app.server.route({
        method: 'GET',
        path:'/v1/move/sms/message',
        handler: function (request, reply) {
            var req=request.query;
            self.SmsAction.moveSmsMessages(req)
                .then(function(result){
                    reply(result)
                })
                .error(function(e){
                    console.log("ERROR HANDLER " + e);
                    reply(e)
                })
                .catch(function(e){
                    console.log("CATCH IN " + e);
                    reply(e.message)
                })
        }

    });
    app.server.route({
        method: 'GET',
        path:'/v1/send/ack/sms',
        handler: function (request, reply) {
            var req=request.query;
            self.SmsAction.ackSmsMessages(req.data)
                .then(function(result){
                    reply(result)
                })
                .error(function(e){
                    console.log("ERROR HANDLER " + e);
                    reply(e)
                })
                .catch(function(e){
                    console.log("CATCH IN " + e);
                    reply(e.message)
                })
        }

    });
};



