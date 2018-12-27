/**
 * Created by ramvinoth on 14/7/16.
 */

/* ************************************************************************
 * Require Module
 * ***********************************************************************/

var SmsService = require("../services/sms-service.js")
var StubService = require("../services/stub-service.js");
var CodanStatusActions = require('../actions/statuses-action.js')
var Promise = require('bluebird');
var moment = require('moment');
var CodanCommandsActions = require('../actions/commands.js');
var CodanEntitesActions = require('../actions/entities.js');
var request = require('request');
var parser = require('xml2json');

/* ************************************************************************
 * Class Declaration
 * ***********************************************************************/

var SmsAction = function (app) {
    this.app = app;
    this.SmsService = new SmsService(app);
    this.stubService = new StubService(app);
    this.twilio=app.twilio
    this.twilioLokup=app.twilioLookup
    this.qconn = app.qconn;
    this.queue = app.queue;
    this.db = app.mongoDb;
    this.codanCommandsActions = new CodanCommandsActions(app);
    this.codanEntitesActions = new CodanEntitesActions(app);
    this.request = Promise.promisifyAll(request);
    this.codanStatusActions = new CodanStatusActions(app);


};
module.exports = SmsAction;



/* **********************************************************************
 * Operations
 * **********************************************************************/
//SmsAction.prototype.init = function () {
//    var self=this;
//    var msgObj=null
//    var sessionId=null;
//    self.qconn.on('ready', function () {
//        return new Promise(function (resolve, reject) {
//
//            self.queue.sub('twillioMessageHandler', function (bus, q) {
//                console.log("||||||||||||||||||||||||||||| Q Subcribed |||||||||||||||||||||||");
//                console.log(bus);
//                var createdTime = moment().format();
//                var createdTimeMillis = new Date(createdTime).getTime();
//                var smsObj = bus
//                bus.smsRecivedTime = createdTimeMillis
//                bus.status = 'PENDING'
//                bus.messageState = 'PENDING'
//                bus.messageDirection = 'RECEIVED'
//                bus.From = bus.From
//                bus.message = bus.Message;
//                var authenticate={
//                    password:self.app.conf.orbcomm.password,
//                    username:self.app.conf.orbcomm.username
//                }
//                self.codanEntitesActions.getUnitDetails(bus)
//                    .then(function(deviceData){
//                    console.log("||||||||||||||||||||||||||||| getUnitDetails |||||||||||||||||||||||");
//                    if(deviceData.status==true){
//                         bus.deviceId=deviceData.data.deviceId
//                         bus.sa=deviceData.data.selfAddress
//                        console.log("||||||||||||||||||||||||||||| UnitDetails |||||||||||||||||||||||");
//                        console.log(bus.deviceId);
//                        console.log(bus.sa);
//                        return self.codanEntitesActions.getUnitId(bus)
//                    }
//                    else{
//                        bus.deviceId='-'
//                        return self.codanEntitesActions.getUnitId(bus)
//                    }
//                    })
//                    .then(function(unitId){
//                         console.log("||||||||||||||||||||||||||||| Get UnitId |||||||||||||||||||||||");
//                        console.log(unitId);
//                     console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
//
//                    if(unitId.status==false){
//                        console.log(new Date(),"|||||||||||||||||||||||||||||||| Unit Id  NULL||||||||||||||||||||||||||||||||||||");
//
//                        var promise= self.twilio.sendMessage({
//                            //to: '+919488985812', // Any number Twilio can deliver to
//                            to: bus.From, // Any number Twilio can deliver to
//                            from: self.app.conf.twilio.phoneNo, // A number you bought from Twilio and can use for outbound communication
//                            body:'"Message not delivered to recipient" Due to incorrect details' // body of the SMS message
//                        });
//
//                        promise.then(function(call) {
//
//                            if(call){
//                                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Failed Msg Send ||||||||||||||||||||||||||||');
//
//                                console.log('Message success! MSG SID: '+call.sid);
//                                q.shift()
//                            }
//                        }, function(error) {
//                            console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                            console.log('Message failed!  Reason: '+error.message);
//                            console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                            q.shift()
//                        });
//
//                        resolve (self.SmsService.saveFailedSms(bus))
//                }
//                else{
//                    return self.SmsService.saveReceivedSms(bus)
//                }
//
//                }).then(function (result) {
//                    console.log("||||||||||||||||||||||||||||| Save RESULT |||||||||||||||||||||||");
//                     msgObj=result
//                    console.log(result);
//                    return self.codanCommandsActions.sendAuth(authenticate)
//                    //resolve(result)
//                }).then(function(authenticate){
//                    console.log(msgObj.From,'mobile No');
//                    var from=msgObj.From;
//                    from=from.split('');
//                    from.splice(0,1);
//                    from=from.join('')
//                    var cmds={
//                        sessionId:authenticate.sessionId,
//                        deviceId:msgObj.deviceId,
//                        mobile:from,
//                        sa:msgObj.sa
//                    }
//
//
//                    console.log(from,'From Number');
//                    cmds.messageBody=msgObj.Message
//                    console.log(cmds,'send SMS To Device');
//                    return self.codanCommandsActions.sendCmd(cmds)
//                }).then(function(sendRes){
//                    var updatedTime = moment().format();
//                    var updatedTimeMillis = new Date(updatedTime).getTime();
//                    sessionId=sendRes.sessionId
//                    var updateObj = {
//                        condition: {
//                            _id: msgObj._id
//                        },
//                        value: {
//                            $set: {
//                                sessionId: sendRes.sessionId ? sendRes.sessionId: '',
//                               conf_num:sendRes.conf_num ? sendRes.conf_num:'',
//                                orbcommSendTime:updatedTimeMillis,
//                                status:'SEND'
//                            }
//                        },
//                        options: {multi: false, upsert: true}
//                    };
//
//                    return self.SmsService.updateReceivedSms(updateObj)
//
//                }).then(function(updateObj){
//                    console.log("|||||||||||||||||||||||||||||||||||  SMS STATUS UPDATED TO SEND  ||||||||||||||||||||||||||");
//                    return self.codanCommandsActions.logout(sessionId)
//
//                }).then(function(final){
//                 console.log("|||||||||||||||||||||||||||||||||||  LOGED OUT  ||||||||||||||||||||||||||");
//                    var promise= self.twilio.sendMessage({
//                        //to: '+919488985812', // Any number Twilio can deliver to
//                        to: bus.From, // Any number Twilio can deliver to
//                        from: self.app.conf.twilio.phoneNo, // A number you bought from Twilio and can use for outbound communication
//                        body:'Message sent successfully' // body of the SMS message
//                    });
//                    promise.then(function(call) {
//
//                        if(call){
//                            console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Failed Msg Send ||||||||||||||||||||||||||||');
//
//                            console.log('Message success! MSG SID: '+call.sid);
//                            q.shift()
//                        }
//                    }, function(error) {
//                        console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                        console.log('Message failed!  Reason: '+error.message);
//                        console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                        q.shift()
//                    });
//
//                    resolve(final)
//
//                })
//
//            })
//        })
//    })
//};
//SmsAction.prototype.init = function (bus) {
//    var self=this;
//    var msgObj=null
//    var sessionId=null;
//
//    var requestObject = {}
//    var updateObj1 = {}
//    var updateValue = {}
//    var criteria1 = {
//        condition:{},
//        value:{$set:{}},
//        options:{multi:false,upsert:false}
//    };
//    var authenticates=null;
//    var orbcomm=null
//    self.qconn.on('ready', function () {
//    self.initQ();
//        return new Promise(function (resolve, reject) {
//            self.queue.sub('twillioMessageHandler', function (bus, q) {
//                      var buses={};
//                console.log("||||||||||||||||||||||||||||| Q Subcribed |||||||||||||||||||||||");
//                console.log(bus);
//                var createdTime = moment().format();
//                var requestObject ={}
//                var createdTimeMillis = new Date(createdTime).getTime();
//                var smsObj = bus
//               buses.response = bus
//                // bus.smsRecivedTime = createdTimeMillis
//                buses.createdTime = createdTimeMillis
//                buses.updatedTime = createdTimeMillis
//                buses.status = 'QUEUED'
//                buses.messageState = 1;
//                buses.messageDirection = 'RECEIVED'
//                buses.messageFrom  = 'SMS'
//                buses.isRead = false
//                buses.isAcked = false
//                buses.from = bus.From
//                buses.message = bus.Message;
//                // if(bus._id){
//                //
//                // }
//                var authenticate={
//                    password:self.app.conf.orbcomm.password,
//                    username:self.app.conf.orbcomm.username
//                }
//                self.SmsService.getUniqueId('correlation')
//                    .then(function (cor) {
//                    bus.corrId='CR'+cor.corrId;
//                    buses.corrId='CR'+cor.corrId;
//                    return self.codanEntitesActions.getUnitDetails(bus)
//                }).then(function(deviceData){
//                        console.log("||||||||||||||||||||||||||||| getUnitDetails |||||||||||||||||||||||");
//                        if(deviceData.status==true){
//                            bus.deviceId=deviceData.data.deviceId
//                            buses.deviceId=deviceData.data.deviceId
//                            bus.to=deviceData.data.deviceId
//                            buses.to=deviceData.data.deviceId
//                            bus.sa=deviceData.data.selfAddress
//                            buses.sa=deviceData.data.selfAddress
//                            bus.connectionState = "CONNECT"   // to get only connected radio
//                            // buses.connectionState = "CONNECT"   // to get only connected radio
//                            bus.state = "CONNECT"   // to get only connected radio
//                            console.log("||||||||||||||||||||||||||||| UnitDetails |||||||||||||||||||||||");
//                            console.log(bus.deviceId);
//                            console.log(bus.sa);
//                            return self.codanEntitesActions.getUnitId(bus)
//                        }
//                        else{
//                            bus.deviceId='-'
//                            bus.connectionState = "CONNECT"
//                            bus.state = "CONNECT"
//                            return self.codanEntitesActions.getUnitId(bus)
//                        }
//                    })
//                    .then(function(unitId){
//                        console.log("||||||||||||||||||||||||||||| Get UnitId |||||||||||||||||||||||");
//                        console.log(unitId);
//                        console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
//                        bus.communicatorId=unitId.data.communicatorId;
//                        buses.communicatorId=unitId.data.communicatorId;
//                        bus.esnNumber=unitId.data.esnNumber ? unitId.data.esnNumber :'-'
//                        buses.esnNumber=unitId.data.esnNumber ? unitId.data.esnNumber :'-'
//                        bus.accountId=unitId.data.accountId
//                        buses.accountId=unitId.data.accountId
//                        if(unitId.status==false){
//                            console.log(new Date(),"|||||||||||||||||||||||||||||||| Unit Id  NULL||||||||||||||||||||||||||||||||||||");
//
//                            var promise= self.twilio.sendMessage({
//                                //to: '+919488985812', // Any number Twilio can deliver to
//                                to: bus.From, // Any number Twilio can deliver to
//                                from: self.app.conf.twilio.phoneNo, // A number you bought from Twilio and can use for outbound communication
//                                body:'"Message not delivered to recipient" Due to incorrect details' // body of the SMS message
//                            });
//
//                            promise.then(function(call) {
//
//                                if(call){
//                                    console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Failed Msg Send ||||||||||||||||||||||||||||');
//
//                                    console.log('Message success! MSG SID: '+call.sid);
//                                    q.shift()
//                                }
//                            }, function(error) {
//                                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                                console.log('Message failed!  Reason: '+error.message);
//                                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                                q.shift()
//                            });
//
//                            resolve (self.SmsService.saveFailedSms(bus))
//                        }
//                        else{
//                            return self.SmsService.saveReceivedSms(buses)                                                             //ToDo Need puBnuB
//                        }
//
//                    }).then(function (result) {
//                        console.log("||||||||||||||||||||||||||||| Save RESULT |||||||||||||||||||||||");
//                        msgObj=result
//                        bus._id=result._id
//                        console.log(result);
//                        var entitiesUpdateObject = {
//                            updateObject : buses
//                        };
//                            self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
//                            return self.codanCommandsActions.sendAuth(authenticate)
//                            //resolve(result)
//                    })
//                    .then(function (authenticate) {
//                            authenticates=authenticate;
//                        var updatedTime = moment().format();
//                        var updatedTimeMillis = new Date(updatedTime).getTime();
//                            if(authenticate.status=='ERROR'){
//                                console.log("||||||||||||||||||||||||||||| ERROR IN SERVER |||||||||||||||||||||||");
//
//                                var updateObjs = {
//                                    condition: {
//                                        corrId: msgObj.corrId
//                                    },
//                                    value: {
//                                        $set: {
//                                            updatedTime:updatedTimeMillis,
//                                            status:'QUEUEING_ERROR',
//                                            messageState :8
//                                        }
//                                    },
//                                    options: {multi: false, upsert: true}
//                                };
//
//                                self.SmsService.updateReceivedSms(updateObjs);
//                                // self.codanCommandsActions.getScheduler(bus);
//                                q.shift();
//
//                        }
//                        else{
//                                var updateObj = {
//                                    condition: {
//                                        corrId: msgObj.corrId
//                                    },
//                                    value: {
//                                        $set: {
//                                            updatedTime:updatedTimeMillis,
//                                            status:'INITIATED',
//                                            messageState :2
//                                        }
//                                    },
//                                    options: {multi: false, upsert: true}
//                                };
//
//                            }
//                        var entitiesUpdateObject = {
//                            communicatorId:buses.communicatorId,
//                            messageDirection:'RECEIVED',
//                            messageFrom:'SMS',
//                            updateObject : updateObj['value']['$set']['messageState']
//                        };
//                        self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
//
//                        return self.SmsService.updateReceivedSms(updateObj)                                                     //ToDo Need puBnuB
//                    })
//                    .then(function(updateObj){
//                        if(authenticates.status!='ERROR') {
//                            requestObject["deviceId"] = buses.deviceId
//                            requestObject["corrId"] = buses.corrId;
//                            requestObject["messageCodeDirection"] = "SMS"
//                            console.log("|||||||||||||||||||||||||||||||||||  SMS STATUS UPDATED TO SEND  ||||||||||||||||||||||||||");
//                            return self.stubService.updateMessageCode(requestObject)
//                        }
//                    })
//                    .then(function(result) {
//                        if(authenticates.status!='ERROR') {
//                            if (result && result.status && result.status == "ERROR") {
//                                console.log("||||||||||||||||||||||||||||||||||| MESSAGE CODE NOT UPDATED IN ENTITIES ||||||||||||||||||||||||||");
//
//                                return result;
//                            }
//                            else if (result && result.status) {
//                                console.log("||||||||||||||||||||||||||||||||||| MESSAGE CODE UPDATED SUCCESSFULLY IN ENTITIES  ||||||||||||||||||||||||||");
//
//
//                                criteria1["condition"]["deviceId"] = buses.deviceId;
//                                criteria1["condition"]["corrId"] = buses.corrId;
//
//                                updateValue["messageCode"] = result.data.messageCode;
//                                buses.messageCode = result.data.messageCode
//
//                                criteria1["value"]["$set"] = updateValue;
//                                console.log("||||||||||||||||||||||||||||||||||| MESSAGE CODE UPDATED IN SMS MESSAGE ENTERED ||||||||||||||||||||||||||");
//
//                                return self.SmsService.updateReceivedSms1(criteria1)
//
//                            }
//                        }
//                    })
//
//
//                    .then(function(authenticate){
//                        if(authenticates.status!='ERROR'){
//                            console.log(msgObj.from,'mobile No');
//                            var from=msgObj.from;
//                            from=from.split('');
//                            from.splice(0,1);
//                            from=from.join('')
//                            var cmds={
//                                sessionId:authenticates.sessionId,
//                                deviceId:msgObj.deviceId,
//                                mobile:from,
//                                sa:msgObj.sa,
//                                messageCode: buses ? (buses.messageCode ? buses.messageCode:null ):null
//                            }
//
//
//                            console.log(from,'From Number');
//                            cmds.messageBody = bus.Message;
//                            console.log(cmds,'send SMS To Device');
//                            return self.codanCommandsActions.sendCmd(cmds)
//                        }
//
//                    }).then(function(sendRes){
//                        var updatedTime = moment().format();
//                        var updatedTimeMillis = new Date(updatedTime).getTime();
//                        if(authenticates.status!='ERROR') {
//                            if(sendRes.status=='ERROR'){
//                                console.log("||||||||||||||||||||||||||||| ERROR IN SERVER |||||||||||||||||||||||");
//                                console.log("||||||||||||||||||||||||||||| ERROR IN SERVER |||||||||||||||||||||||");
//
//                                var updateObjs = {
//                                    condition: {
//                                        corrId: msgObj.corrId
//                                    },
//                                    value: {
//                                        $set: {
//                                            updatedTime:updatedTimeMillis,
//                                            status:'SEND_ERROR',
//                                            messageState :9
//                                        }
//                                    },
//                                    options: {multi: false, upsert: true}
//                                };
//                                var entitiesUpdateObject = {
//                                    communicatorId:buses.communicatorId,
//                                    messageDirection:'RECEIVED',
//                                    messageFrom:'SMS',
//                                    updateObject : 9,
//                                    messageCode:buses ? (buses.messageCode ? buses.messageCode:null ):null
//
//                                };
//                                self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
//                                self.SmsService.updateReceivedSms(updateObjs);
//                                if(sendRes.sessionId){
//                                    // self.codanCommandsActions.getScheduler(bus)
//                                }
//                                q.shift();
//                            }
//                            else{
//
//                                sessionId=sendRes.sessionId
//                                orbcomm=sendRes
//                                requestObject["conf_num"]=sendRes.conf_num
//                                var updateObj = {
//                                    condition: {
//                                        corrId: msgObj.corrId
//                                    },
//                                    value: {
//                                        $set: {
//                                            sessionId: sendRes.sessionId ? sendRes.sessionId: '',
//                                            conf_num:sendRes.conf_num ? sendRes.conf_num:'',
//                                            // orbcommSendTime:updatedTimeMillis,
//                                            updatedTime:updatedTimeMillis,
//                                            status:'SENT',
//                                            messageState:3
//
//                                        }
//                                    },
//                                    options: {multi: false, upsert: true}
//                                };
//                                var entitiesUpdateObject = {
//                                    communicatorId:buses.communicatorId,
//                                    messageDirection:'RECEIVED',
//                                    messageFrom:'SMS',
//                                    updateObject : 3,
//                                    messageCode:buses ? (buses.messageCode ? buses.messageCode:null ):null
//
//                                };
//                                self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
//                                return self.SmsService.updateReceivedSms(updateObj)
//                            }
//
//                        }
//                                                                          //ToDo Need puBnuB
//                        })
//                    .then(function (res) {
//                        if(authenticates.status!='ERROR') {
//                            orbcomm.messageFrom='SMS';
//                            orbcomm.messageState='SENT'
//                            return self.codanCommandsActions.hashUpdate(orbcomm)
//                        }
//
//                    }).then(function(updateObj){
//                        if(authenticates.status!='ERROR') {
//                            console.log("|||||||||||||||||||||||||||||||||||  SMS STATUS UPDATED TO SEND  ||||||||||||||||||||||||||");
//                            return self.codanCommandsActions.logout(sessionId)
//                        }
//                    })
//
//
//                    .then(function(final){
//                        if(authenticates.status!='ERROR') {
//                            console.log("|||||||||||||||||||||||||||||||||||  LOGED OUT  ||||||||||||||||||||||||||");
//                            // var promise = self.twilio.sendMessage({
//                            //     //to: '+919488985812', // Any number Twilio can deliver to
//                            //     to: bus.From, // Any number Twilio can deliver to
//                            //     from: self.app.conf.twilio.phoneNo, // A number you bought from Twilio and can use for outbound communication
//                            //     body: 'Message sent successfully' // body of the SMS message
//                            // });
//                            // promise.then(function (call) {
//                            //
//                            //     if (call) {
//                            //         console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Failed Msg Send ||||||||||||||||||||||||||||');
//                            //
//                            //         console.log('Message success! MSG SID: ' + call.sid);
//                            //         q.shift()
//                            //     }
//                            // }, function (error) {
//                            //     console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                            //     console.log('Message failed!  Reason: ' + error.message);
//                            //     console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                                q.shift()
//                            // });
//
//                            resolve(final)
//                        }
//                        else{
//                            q.shift()
//
//                        }
//
//
//                    })
//
//            })
//        })
//    })
//};//todo 22/12/2016 redefine the code (not flow)
SmsAction.prototype.init = function (bus) {

    var self=this;
    var msgObj=null
    var authenticates=null;
    var orbcomm=null
    var temp =0;
    var temp1 =0;
    var queueShift = null;

    self.qconn.on('ready', function () {
        self.initQ();

        return new Promise(function (resolve, reject) {

            self.queue.sub('twillioMessageHandler', function (bus, q) {
                if(!bus.status && bus.status==false){
                    console.log(new Date(),'|||||||||||||||||||||||||||||||||| DUMMY MESSAGE FROM twillioMessageHandler |||||||||||||||||||');
                    q.shift()

                }else{
                    var buses={};

                    console.log("||||||||||||||||||||||||||||| Q Subcribed |||||||||||||||||||||||");
                    console.log(bus);
                    var createdTime = moment().format();
                    //var requestObject ={}
                    var createdTimeMillis = new Date(createdTime).getTime();
                    var smsObj = bus
                    buses.response = bus
                    // bus.smsRecivedTime = createdTimeMillis
                    buses.createdTime = createdTimeMillis
                    buses.updatedTime = createdTimeMillis
                    buses.status = 'QUEUED'
                    buses.messageState = 1;
                    buses.messageDirection = 'RECEIVED'
                    buses.messageFrom  = 'SMS'
                    buses.isRead = false
                    buses.isAcked = false
                    buses.from = bus.From
                    buses.message = bus.Message;


                    var authenticate={
                        password:self.app.conf.orbcomm.password,
                        username:self.app.conf.orbcomm.username
                    }
                    self.SmsService.getUniqueId('correlation')
                        .then(function (cor) {

                            bus.corrId='CR'+cor.corrId;
                            buses.corrId='CR'+cor.corrId;
                            return self.codanEntitesActions.getUnitDetails(bus)

                        })
                        .then(function(deviceData){
                            console.log("||||||||||||||||||||||||||||| getUnitDetails |||||||||||||||||||||||",deviceData);

                            if(deviceData.status){
                                if(bus.sa && deviceData.data.selfAddress && bus.sa!=deviceData.data.selfAddress){

                                    console.log(new Date(),"Self Address different")
                                    bus.deviceId='-'
                                    bus.connectionState = "CONNECT"
                                    bus.state = "CONNECT"
                                    return self.codanEntitesActions.getUnitId(bus)
                                }
                                else {
                                    console.log(new Date(),"||||||| Self address same |||||||||||")
                                     bus.deviceId = deviceData.data.deviceId
                                     buses.deviceId = deviceData.data.deviceId
                                     bus.to = deviceData.data.deviceId
                                     buses.to = deviceData.data.deviceId
                                     bus.sa = deviceData.data.selfAddress
                                     buses.sa = deviceData.data.selfAddress
                                     bus.connectionState = "CONNECT"   // to get only connected radio
                                     bus.state = "CONNECT"   // to get only connected radio
                                     console.log("||||||||||||||||||||||||||||| UnitDetails |||||||||||||||||||||||");
                                     console.log(bus.deviceId);
                                     console.log(bus.sa);
                                     return self.codanEntitesActions.getUnitId(bus)
                                }

                            }

                            else{
                                console.log(new Date(),"DeviceId missing")
                                bus.deviceId='-'
                                bus.connectionState = "CONNECT"
                                bus.state = "CONNECT"
                                return self.codanEntitesActions.getUnitId(bus)
                            }
                        })

                        .then(function(unitId){

                            console.log("||||||||||||||||||||||||||||| Get UnitId |||||||||||||||||||||||");
                            console.log(unitId);
                            console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");

                            bus.communicatorId=unitId ? (unitId.data ? (unitId.data.communicatorId?unitId.data.communicatorId :'-'):'-')  : '-';
                            bus.assetId=unitId ? (unitId.data ? (unitId.data.assetId?unitId.data.assetId :'-'):'-')  : '-';
                            buses.communicatorId=unitId ? (unitId.data ? (unitId.data.communicatorId?unitId.data.communicatorId :'-'):'-')  : '-';
                            buses.assetId=unitId ? (unitId.data ? (unitId.data.assetId?unitId.data.assetId :'-'):'-')  : '-';
                            bus.esnNumber=unitId ? (unitId.data ? (unitId.data.esnNumber?unitId.data.esnNumber :'-'):'-')  : '-';
                            buses.esnNumber=unitId ? (unitId.data ? (unitId.data.esnNumber?unitId.data.esnNumber :'-'):'-')  : '-';
                            bus.accountId=unitId ? (unitId.data ? (unitId.data.accountId?unitId.data.accountId :'-'):'-')  : '-';
                            buses.accountId=unitId ? (unitId.data ? (unitId.data.accountId?unitId.data.accountId :'-'):'-')  : '-';


                            if(unitId.status){
                                console.log(new Date(),"||||||||||| save received sms |||||||||||||")
                                return self.SmsService.saveReceivedSms(buses)                                                             //ToDo Need puBnuB
                            }
                            else{
                                temp =1;
                                console.log(new Date(),"|||||||||| save failed sms message entered ||||||||||||")
                                //queueShift = 1
                                q.shift();
                                return self.saveFailedSmsMessage(bus,q)
                            }

                        })
                        .then(function (result) {
                            if(temp ==1){
                                temp =0;
                                throw new  Promise.resolve(result);  // TODO SENT EMAIL

                            }
                            else{
                                return result;
                            }
                        })
                        .then(function (result) {

                            console.log("||||||||||||||||||||||||||||| Save RESULT |||||||||||||||||||||||");
                            msgObj=result;
                            bus._id=result._id
                            console.log(result);
                            var entitiesUpdateObject = {
                                updateObject : buses
                            };
                            return self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)

                            //resolve(result)
                        })
                        .then(function (result) {
                            if(result && result.status) {

                                console.log(new Date(),"||||||| login function entered ||||||||||||||||||||||")
                                return self.codanCommandsActions.sendAuth1(authenticate)
                            }
                            else{
                                return result;
                            }
                        })

                        .then(function (authenticate) {

                            var updatedTime = moment().format();
                            var updatedTimeMillis = new Date(updatedTime).getTime();

                            console.log(new Date(),"|||||||||| Authentication function output |||||||| ",authenticate)

                            if(authenticate && authenticate.status){
                                authenticates = authenticate.data;

                                console.log(new Date(),"||||||||||| save initiated function entered ||||||||||")
                                var updateObj = {
                                    condition: {
                                        corrId: msgObj.corrId
                                    },
                                    value: {
                                        $set: {
                                            updatedTime:updatedTimeMillis,
                                            status:'INITIATED',
                                            messageState :2
                                        }
                                    },
                                    options: {multi: false, upsert: true}
                                };
                                var entitiesUpdateObject = {
                                    communicatorId:buses.communicatorId,
                                    assetId:buses.assetId,
                                    messageDirection:'RECEIVED',
                                    messageFrom:'SMS',
                                    updateObject : updateObj['value']['$set']['messageState']
                                };
                                return self.updateCommunicatorStatusAndUpdateReceivedSms(entitiesUpdateObject,updateObj)


                            }
                            else{
                                console.log("||||||||||||||||||||||||||||| QUEUEING_ERROR IN SERVER |||||||||||||||||||||||");
                                temp1 = 1
                                var updateObjs = {
                                    condition: {
                                        corrId: msgObj.corrId
                                    },
                                    value: {
                                        $set: {
                                            updatedTime:updatedTimeMillis,
                                            status:'QUEUEING_ERROR',
                                            messageState :8
                                        }
                                    },
                                    options: {multi: false, upsert: true}
                                };

                                return self.SmsService.updateReceivedSms(updateObjs);
                                // self.codanCommandsActions.getScheduler(bus);
                            }//ToDo Need puBnuB
                        })
                        .then(function(result){
                            if(temp1==1){
                                temp1=0
                                q.shift();
                                //queueShift = 1
                                throw new  Promise.resolve(result);  // TODO SENT EMAIL

                            }else{
                                return result
                            }

                        })
                        .then(function(updateObj){
                            if(authenticates.status!='ERROR') {

                                console.log(new Date(),"||||| save command flow entered ||||||||||||||||")
                                return self.sendCmdFlow(buses,msgObj,bus,authenticates,q)

                            }
                            else{
                                return updateObj;
                            }
                        })
                        .then(function(final){
                            if(queueShift == 1) {
                                //    console.log("|||||||||||||||||||||||||||||||||||  LOGED OUT  ||||||||||||||||||||||||||");
                                q.shift()
                                resolve(final)
                            }
                            else{
                                q.shift();
                                resolve(final)

                            }



                        })
                        .catch(function(e){
                            console.log(new Date(),"catch in send sms message ",e)
                            reject(e)
                        })
                }


            })
        })
    })
};

SmsAction.prototype.saveFailedSmsMessage = function (bus,q) {

    var self= this;

    var sendSmsInput = {}
    return new Promise(function (resolve, reject) {

            console.log(new Date(),"|||||||||||||||||||||||||||||||| Unit Id  NULL||||||||||||||||||||||||||||||||||||",bus.from);


        sendSmsInput = {
            to: bus.From, // Any number Twilio can deliver to
            body: '"Message not delivered to recipient" Due to incorrect details'
        }
        self.twilioLokup.phoneNumbers(bus.From).get({type: 'carrier'})
            .then(function (Result){

                console.log(new Date(),"|||||||||| TWILIO LOOK UP OUTPUT ||||||||||||",Result)
                sendSmsInput["from"] = self.app.conf.twilio.phoneNo // A number you bought from Twilio and can use for outbound communication
                // Result.country_code = 'CA'
                if(Result.country_code=='CA' || Result.country_code=='US'){
                    console.log(new Date()," |||||||||| Result.country_code ||||||||||",Result.country_code)
                    sendSmsInput["from"]=self.app.conf.twilio.phoneNoUS
                }
                console.log(sendSmsInput,"sendSmsInputsendSmsInputsendSmsInputsendSmsInput")
                return self.twilio.sendMessage(sendSmsInput)
            })
            .then(function(call) {

                if(call){
                    console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Failed Msg Send ||||||||||||||||||||||||||||');

                    console.log('Message success! MSG SID: '+call.sid);
                    //q.shift()
                }
            },function(error) {
                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
                console.log('Message failed!  Reason: '+error.message);
                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
                //q.shift()
            });

            resolve (self.SmsService.saveFailedSms(bus))
        })

}
// SmsAction.prototype.saveFailedSmsMessage = function (bus,q) { // todo cmd by Ranjitha.V (17-05-2017)
//
//     var self= this;
//
//     return new Promise(function (resolve, reject) {
//
//             console.log(new Date(),"|||||||||||||||||||||||||||||||| Unit Id  NULL||||||||||||||||||||||||||||||||||||");
//
//
//             var promise= self.twilio.sendMessage({
//                 //to: '+919488985812', // Any number Twilio can deliver to
//                 to: bus.From, // Any number Twilio can deliver to
//                 from: self.app.conf.twilio.phoneNo, // A number you bought from Twilio and can use for outbound communication
//                 body:'"Message not delivered to recipient" Due to incorrect details' // body of the SMS message
//             });
//
//             promise.then(function(call) {
//
//                 if(call){
//                     console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Failed Msg Send ||||||||||||||||||||||||||||');
//
//                     console.log('Message success! MSG SID: '+call.sid);
//                     //q.shift()
//                 }
//             },function(error) {
//                 console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                 console.log('Message failed!  Reason: '+error.message);
//                 console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                 //q.shift()
//             });
//
//             resolve (self.SmsService.saveFailedSms(bus))
//         })
//
// }
SmsAction.prototype.sendCmdFlow = function (buses,msgObj,bus,authenticates,q) {



    var requestObject = {}
    var self =this;

    var criteria1 = {
        condition:{},
        value:{$set:{}},
        options:{multi:false,upsert:false}
    };


    var orbcomm =null;
    var sessionId =authenticates.sessionId;
    var updateValue = {}
    requestObject["deviceId"] = buses.deviceId
    requestObject["corrId"] = buses.corrId;
    requestObject["messageCodeDirection"] = "SMS"
    console.log("|||||||||||||||||||||||||||||||||||  SMS STATUS UPDATED TO SEND  ||||||||||||||||||||||||||");



    return new Promise(function (resolve, reject) {


        self.stubService.updateMessageCode1(requestObject)
             .then(function(result){

                 if (result && result.status) {
                     console.log("||||||||||||||||||||||||||||||||||| MESSAGE CODE UPDATED SUCCESSFULLY IN ENTITIES  ||||||||||||||||||||||||||",result);


                     criteria1["condition"]["deviceId"] = buses.deviceId;
                     criteria1["condition"]["corrId"] = buses.corrId;
                     updateValue["messageCode"] = result.data.data.messageCode;
                     buses.messageCode = result.data.data.messageCode

                     criteria1["value"]["$set"] = updateValue;
                     console.log("||||||||||||||||||||||||||||||||||| MESSAGE CODE UPDATED IN SMS MESSAGE ENTERED ||||||||||||||||||||||||||");

                     return self.SmsService.updateReceivedSms2(criteria1)

                 }
                 else{
                     console.log("||||||||||||||||||||||||||||||||||| MESSAGE CODE NOT UPDATED IN ENTITIES ||||||||||||||||||||||||||");
                     return result;
                 }


             })
             .then(function(result) {

                 if (result && result.status) {

                     console.log(msgObj.from,'mobile No');
                     var from=msgObj.from;
                     from=from.split('');
                     from.splice(0,1);
                     from=from.join('')
                     var cmds={
                         sessionId:authenticates.sessionId,
                         deviceId:msgObj.deviceId,
                         mobile:from,
                         sa:msgObj.sa,
                         messageCode: buses ? (buses.messageCode ? buses.messageCode:null ):null
                     }


                     console.log(from,'From Number');
                     cmds.messageBody = bus.Message;
                     console.log(cmds,'|||||||||||||| send SMS To Device |||||||||||||||||||||||');
                     return self.sendCmdToDevice(cmds,buses,msgObj,q)
                 }
                 else{
                    return result
                 }
             })
            .then(function(result) {
               if(result && result.orbcomm) {
                   orbcomm= result.orbcomm;
                   //sessionId= result.sessionId;
                   orbcomm.messageFrom = 'SMS';
                   orbcomm.messageState = 'SENT'
                   console.log(new Date(),"||||||| has update function entered |||||||||||||||")
                   return self.codanCommandsActions.hashUpdate(orbcomm)
               }
                else{
                  return result;
               }
            })
            .then(function(result) {
                console.log(new Date(),"||||||| logout function entered |||||||||||||||")

                return self.codanCommandsActions.logout(sessionId)
            })
            .then(function(result) {
                resolve(result)
            })
            .catch(function(e){
                reject(e)
            })






    })

}

SmsAction.prototype.sendCmdToDevice = function (cmds,buses,msgObj,q) {



   var self =this;
    console.log("|||||||||||||||||||||||||||||||||||  SMS STATUS UPDATED TO SEND  ||||||||||||||||||||||||||");
    var sessionId=null;
    var orbcomm=null;
    var temp =0

    var requestObject = {}
    return new Promise(function (resolve, reject) {

        self.codanCommandsActions.sendCmd1(cmds)

            .then(function(sendRes){

                var updatedTime = moment().format();
                var updatedTimeMillis = new Date(updatedTime).getTime();


                console.log(new Date(),"|||||||||||||||||| send command output |||||||||||",sendRes)

                if(sendRes && sendRes.status){
                    console.log(new Date(),"||||||||||||||||||||||||||||| message state sent entered |||||||||||||||||||||||");

                    sessionId=sendRes.data.sessionId
                    orbcomm=sendRes.data
                    requestObject["conf_num"]=sendRes.data.conf_num
                    temp=1
                    var updateObj = {
                        condition: {
                            corrId: msgObj.corrId
                        },
                        value: {
                            $set: {
                                sessionId:sendRes ? (sendRes.data ? sendRes.data.sessionId: ''):"",
                                conf_num:sendRes ? (sendRes.data ? sendRes.data.conf_num: ''):"",
                                // orbcommSendTime:updatedTimeMillis,
                                updatedTime:updatedTimeMillis,
                                status:'SENT',
                                messageState:3

                            }
                        },
                        options: {multi: false, upsert: true}
                    };
                    var entitiesUpdateObject = {
                        communicatorId:buses.communicatorId,
                        assetId:buses.assetId,
                        messageDirection:'RECEIVED',
                        messageFrom:'SMS',
                        updateObject : 3,
                        messageCode:buses ? (buses.messageCode ? buses.messageCode:null ):null

                    };
                    //self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
                    //return self.SmsService.updateReceivedSms(updateObj)

                    return self.updateCommunicatorStatusAndUpdateReceivedSms(entitiesUpdateObject,updateObj)

                }
                else{
                    console.log(new Date(),"||||||||||||||||||||||||||||| SEND_ERROR IN SERVER |||||||||||||||||||||||");
                    //console.log("||||||||||||||||||||||||||||| ERROR IN SERVER |||||||||||||||||||||||");

                    var updateObjs = {
                        condition: {
                            corrId: msgObj.corrId
                        },
                        value: {
                            $set: {
                                updatedTime:updatedTimeMillis,
                                status:'SEND_ERROR',
                                messageState :9
                            }
                        },
                        options: {multi: false, upsert: true}
                    };
                    var entitiesUpdateObject = {
                        communicatorId:buses.communicatorId,
                        assetId:buses.assetId,
                        messageDirection:'RECEIVED',
                        messageFrom:'SMS',
                        updateObject : 9,
                        messageCode:buses ? (buses.messageCode ? buses.messageCode:null ):null

                    };
                    //self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
                    //self.SmsService.updateReceivedSms(updateObjs);

                    //if(sendRes.sessionId){
                    //         // self.codanCommandsActions.getScheduler(bus)
                    //}
                    q.shift();

                    return self.updateCommunicatorStatusAndUpdateReceivedSms(entitiesUpdateObject,updateObjs)
                }



            })
            .then(function(result) {
                //sessionId=sendRes.sessionId
                if(temp ==1){
                    result["orbcomm"] = orbcomm
                    result["sessionId"] = sessionId
                }

                resolve(result)
            })
            .catch(function(e) {
                console.log(new Date(),"catch in sendCmdToDevice :::::::",e)
                reject(e)

            })




    })

}
SmsAction.prototype.updateCommunicatorStatusAndUpdateReceivedSms = function (entitiesUpdateObject,updateObjs) {



   var self =this;

    console.log("||||||||||||||||||||||||||||||||||| updateCommunicatorStatusAndUpdateReceivedSms ||||||||||||||||||||||||||");

      return new Promise(function (resolve, reject) {

         self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
            .then(function(sendRes){
                return self.SmsService.updateReceivedSms(updateObjs);
             })
            .then(function(result) {
                resolve(result)
            })
            .catch(function(e) {
                console.log(new Date(),"catch in updateCommunicatorStatusAndUpdateReceivedSms :::::::",e)
                reject(e)

            })


      })

}


//SmsAction.prototype.init = function (bus) { //todo 31/10/2016 append message code,before send the message to the device
//    var self=this;
//    var msgObj=null
//    var sessionId=null;
//
//    var requestObject = {}
//    var updateObj1 = {}
//    var updateValue = {}
//    var criteria1 = {
//        condition:{},
//        value:{$set:{}},
//        options:{multi:false,upsert:false}
//    };
//    var authenticates=null;
//    var orbcomm=null
//    self.qconn.on('ready', function () {
//    self.initQ();
//        return new Promise(function (resolve, reject) {
//            self.queue.sub('twillioMessageHandler', function (bus, q) {
//                      var buses={};
//                console.log("||||||||||||||||||||||||||||| Q Subcribed |||||||||||||||||||||||");
//                console.log(bus);
//                var createdTime = moment().format();
//                var requestObject ={}
//                var createdTimeMillis = new Date(createdTime).getTime();
//                var smsObj = bus
//               buses.response = bus
//                // bus.smsRecivedTime = createdTimeMillis
//                buses.createdTime = createdTimeMillis
//                buses.updatedTime = createdTimeMillis
//                buses.status = 'QUEUED'
//                buses.messageState = 1;
//                buses.messageDirection = 'RECEIVED'
//                buses.messageFrom  = 'SMS'
//                buses.isRead = false
//                buses.isAcked = false
//                buses.from = bus.From
//                buses.message = bus.Message;
//                // if(bus._id){
//                //
//                // }
//                var authenticate={
//                    password:self.app.conf.orbcomm.password,
//                    username:self.app.conf.orbcomm.username
//                }
//                self.SmsService.getUniqueId('correlation').then(function (cor) {
//                    bus.corrId='CR'+cor.corrId;
//                    buses.corrId='CR'+cor.corrId;
//                    return self.codanEntitesActions.getUnitDetails(bus)
//                }).then(function(deviceData){
//                        console.log("||||||||||||||||||||||||||||| getUnitDetails |||||||||||||||||||||||");
//                        if(deviceData.status==true){
//                            bus.deviceId=deviceData.data.deviceId
//                            buses.deviceId=deviceData.data.deviceId
//                            bus.to=deviceData.data.deviceId
//                            buses.to=deviceData.data.deviceId
//                            bus.sa=deviceData.data.selfAddress
//                            buses.sa=deviceData.data.selfAddress
//                            bus.connectionState = "CONNECT"   // to get only connected radio
//                            // buses.connectionState = "CONNECT"   // to get only connected radio
//                            bus.state = "CONNECT"   // to get only connected radio
//                            console.log("||||||||||||||||||||||||||||| UnitDetails |||||||||||||||||||||||");
//                            console.log(bus.deviceId);
//                            console.log(bus.sa);
//                            return self.codanEntitesActions.getUnitId(bus)
//                        }
//                        else{
//                            bus.deviceId='-'
//                            bus.connectionState = "CONNECT"
//                            bus.state = "CONNECT"
//                            return self.codanEntitesActions.getUnitId(bus)
//                        }
//                    })
//                    .then(function(unitId){
//                        console.log("||||||||||||||||||||||||||||| Get UnitId |||||||||||||||||||||||");
//                        console.log(unitId);
//                        console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
//                        bus.communicatorId=unitId.data.communicatorId;
//                        buses.communicatorId=unitId.data.communicatorId;
//                        bus.esnNumber=unitId.data.esnNumber ? unitId.data.esnNumber :'-'
//                        buses.esnNumber=unitId.data.esnNumber ? unitId.data.esnNumber :'-'
//                        bus.accountId=unitId.data.accountId
//                        buses.accountId=unitId.data.accountId
//                        if(unitId.status==false){
//                            console.log(new Date(),"|||||||||||||||||||||||||||||||| Unit Id  NULL||||||||||||||||||||||||||||||||||||");
//
//                            var promise= self.twilio.sendMessage({
//                                //to: '+919488985812', // Any number Twilio can deliver to
//                                to: bus.From, // Any number Twilio can deliver to
//                                from: self.app.conf.twilio.phoneNo, // A number you bought from Twilio and can use for outbound communication
//                                body:'"Message not delivered to recipient" Due to incorrect details' // body of the SMS message
//                            });
//
//                            promise.then(function(call) {
//
//                                if(call){
//                                    console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Failed Msg Send ||||||||||||||||||||||||||||');
//
//                                    console.log('Message success! MSG SID: '+call.sid);
//                                    q.shift()
//                                }
//                            }, function(error) {
//                                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                                console.log('Message failed!  Reason: '+error.message);
//                                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                                q.shift()
//                            });
//
//                            resolve (self.SmsService.saveFailedSms(bus))
//                        }
//                        else{
//                            return self.SmsService.saveReceivedSms(buses)                                                             //ToDo Need puBnuB
//                        }
//
//                    }).then(function (result) {
//                        console.log("||||||||||||||||||||||||||||| Save RESULT |||||||||||||||||||||||");
//                        msgObj=result
//                        bus._id=result._id
//                        console.log(result);
//                    var entitiesUpdateObject = {
//                        updateObject : buses
//                    };
//                        self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
//                        return self.codanCommandsActions.sendAuth(authenticate)
//                        //resolve(result)
//                    }).then(function (authenticate) {
//                        authenticates=authenticate;
//                    var updatedTime = moment().format();
//                    var updatedTimeMillis = new Date(updatedTime).getTime();
//                        if(authenticate.status=='ERROR'){
//                            console.log("||||||||||||||||||||||||||||| ERROR IN SERVER |||||||||||||||||||||||");
//
//                            var updateObjs = {
//                                condition: {
//                                    corrId: msgObj.corrId
//                                },
//                                value: {
//                                    $set: {
//                                        updatedTime:updatedTimeMillis,
//                                        status:'QUEUEING_ERROR',
//                                        messageState :8
//                                    }
//                                },
//                                options: {multi: false, upsert: true}
//                            };
//
//                            self.SmsService.updateReceivedSms(updateObjs);
//                            // self.codanCommandsActions.getScheduler(bus);
//                            q.shift();
//
//                        }
//                    else{
//                            var updateObj = {
//                                condition: {
//                                    corrId: msgObj.corrId
//                                },
//                                value: {
//                                    $set: {
//                                        updatedTime:updatedTimeMillis,
//                                        status:'INITIATED',
//                                        messageState :2
//                                    }
//                                },
//                                options: {multi: false, upsert: true}
//                            };
//
//                        }
//                    var entitiesUpdateObject = {
//                        communicatorId:buses.communicatorId,
//                        messageDirection:'RECEIVED',
//                        messageFrom:'SMS',
//                        updateObject : updateObj['value']['$set']['messageState']
//                    };
//                    self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
//
//                    return self.SmsService.updateReceivedSms(updateObj)                                                     //ToDo Need puBnuB
//                    }).then(function(authenticate){
//                    if(authenticates.status!='ERROR'){
//                        console.log(msgObj.from,'mobile No');
//                        var from=msgObj.from;
//                        from=from.split('');
//                        from.splice(0,1);
//                        from=from.join('')
//                        var cmds={
//                            sessionId:authenticates.sessionId,
//                            deviceId:msgObj.deviceId,
//                            mobile:from,
//                            sa:msgObj.sa
//                        }
//
//
//                        console.log(from,'From Number');
//                        cmds.messageBody = bus.Message;
//                        console.log(cmds,'send SMS To Device');
//                        return self.codanCommandsActions.sendCmd(cmds)
//                    }
//
//                    }).then(function(sendRes){
//                    var updatedTime = moment().format();
//                    var updatedTimeMillis = new Date(updatedTime).getTime();
//                    if(authenticates.status!='ERROR') {
//                        if(sendRes.status=='ERROR'){
//                            console.log("||||||||||||||||||||||||||||| ERROR IN SERVER |||||||||||||||||||||||");
//                            console.log("||||||||||||||||||||||||||||| ERROR IN SERVER |||||||||||||||||||||||");
//
//                            var updateObjs = {
//                                condition: {
//                                    corrId: msgObj.corrId
//                                },
//                                value: {
//                                    $set: {
//                                        updatedTime:updatedTimeMillis,
//                                        status:'SEND_ERROR',
//                                        messageState :9
//                                    }
//                                },
//                                options: {multi: false, upsert: true}
//                            };
//                            var entitiesUpdateObject = {
//                                communicatorId:buses.communicatorId,
//                                messageDirection:'RECEIVED',
//                                messageFrom:'SMS',
//                                updateObject : 9
//                            };
//                            self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
//                            self.SmsService.updateReceivedSms(updateObjs);
//                            if(sendRes.sessionId){
//                                // self.codanCommandsActions.getScheduler(bus)
//                            }
//                            q.shift();
//                        }
//                        else{
//
//                            sessionId=sendRes.sessionId
//                            orbcomm=sendRes
//                            requestObject["conf_num"]=sendRes.conf_num
//                            var updateObj = {
//                                condition: {
//                                    corrId: msgObj.corrId
//                                },
//                                value: {
//                                    $set: {
//                                        sessionId: sendRes.sessionId ? sendRes.sessionId: '',
//                                        conf_num:sendRes.conf_num ? sendRes.conf_num:'',
//                                        // orbcommSendTime:updatedTimeMillis,
//                                        updatedTime:updatedTimeMillis,
//                                        status:'SENT',
//                                        messageState:3
//                                    }
//                                },
//                                options: {multi: false, upsert: true}
//                            };
//                            var entitiesUpdateObject = {
//                                communicatorId:buses.communicatorId,
//                                messageDirection:'RECEIVED',
//                                messageFrom:'SMS',
//                                updateObject : 3
//                            };
//                            self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
//                            return self.SmsService.updateReceivedSms(updateObj)
//                        }
//
//                    }
//                                                                      //ToDo Need puBnuB
//                    }).then(function (res) {
//                    if(authenticates.status!='ERROR') {
//                        orbcomm.messageFrom='SMS';
//                        orbcomm.messageState='SENT'
//                        return self.codanCommandsActions.hashUpdate(orbcomm)
//                    }
//
//                }).then(function(updateObj){
//                    if(authenticates.status!='ERROR') {
//                        console.log("|||||||||||||||||||||||||||||||||||  SMS STATUS UPDATED TO SEND  ||||||||||||||||||||||||||");
//                        return self.codanCommandsActions.logout(sessionId)
//                    }
//                    })
//                    .then(function(updateObj){
//                        if(authenticates.status!='ERROR') {
//                            requestObject["deviceId"] = buses.deviceId
//                            requestObject["corrId"] = buses.corrId;
//                            requestObject["messageCodeDirection"] = "SMS"
//                            console.log("|||||||||||||||||||||||||||||||||||  SMS STATUS UPDATED TO SEND  ||||||||||||||||||||||||||");
//                            return self.stubService.updateMessageCode(requestObject)
//                        }
//                    })
//                    .then(function(result) {
//                        if(authenticates.status!='ERROR') {
//                            if (result && result.status && result.status == "ERROR") {
//                                console.log("||||||||||||||||||||||||||||||||||| MESSAGE CODE NOT UPDATED IN ENTITIES ||||||||||||||||||||||||||");
//
//                                return result;
//                            }
//                            else if (result && result.status) {
//                                console.log("||||||||||||||||||||||||||||||||||| MESSAGE CODE UPDATED SUCCESSFULLY IN ENTITIES  ||||||||||||||||||||||||||");
//
//
//                                criteria1["condition"]["conf_num"] = result.data.conf_num;
//                                criteria1["condition"]["deviceId"] = result.data.deviceId;
//
//                                updateValue["messageCode"] = result.data.messageCode;
//
//                                criteria1["value"]["$set"] = updateValue;
//                                console.log("||||||||||||||||||||||||||||||||||| MESSAGE CODE UPDATED IN SMS MESSAGE ENTERED ||||||||||||||||||||||||||");
//
//                                return self.SmsService.updateReceivedSms1(criteria1)
//
//                            }
//                        }
//                    })
//
//
//                    .then(function(final){
//                        if(authenticates.status!='ERROR') {
//                            console.log("|||||||||||||||||||||||||||||||||||  LOGED OUT  ||||||||||||||||||||||||||");
//                            var promise = self.twilio.sendMessage({
//                                //to: '+919488985812', // Any number Twilio can deliver to
//                                to: bus.From, // Any number Twilio can deliver to
//                                from: self.app.conf.twilio.phoneNo, // A number you bought from Twilio and can use for outbound communication
//                                body: 'Message sent successfully' // body of the SMS message
//                            });
//                            promise.then(function (call) {
//
//                                if (call) {
//                                    console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Failed Msg Send ||||||||||||||||||||||||||||');
//
//                                    console.log('Message success! MSG SID: ' + call.sid);
//                                    q.shift()
//                                }
//                            }, function (error) {
//                                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                                console.log('Message failed!  Reason: ' + error.message);
//                                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                                q.shift()
//                            });
//
//                            resolve(final)
//                        }
//
//                    })
//
//            })
//        })
//    })
//};


SmsAction.prototype.receivedSms1 = function (bus) {
    var self=this;
    var msgObj=null
    var sessionId=null;
    var orbcomm=null

    var requestObject = {}
    var updateObj1 = {}
    var updateValue = {}
    var criteria1 = {
        condition:{},
        value:{$set:{}},
        options:{multi:false,upsert:false}
    };
    var authenticates=null;

    console.log("|||||||||||||||||||| received sms message entered ||||||||||||||||||||||",bus)
    //self.qconn.on('ready', function () {
        self.initQ();
        return new Promise(function (resolve, reject) {
            //self.queue.sub('twillioMessageHandler', function (bus, q) {
                var buses={};
                console.log("||||||||||||||||||||||||||||| Q Subcribed |||||||||||||||||||||||");
                console.log(bus);
                var createdTime = moment().format();
                var requestObject ={}
                var createdTimeMillis = new Date(createdTime).getTime();
                var smsObj = bus
                buses.response = bus
                // bus.smsRecivedTime = createdTimeMillis
                buses.createdTime = createdTimeMillis
                buses.updatedTime = createdTimeMillis
                buses.status = 'QUEUED'
                buses.messageState = 1;
                buses.messageDirection = 'RECEIVED'
                buses.messageFrom  = 'SMS'
                buses.isRead = false
                buses.isAcked = false
                buses.from = bus.From
                buses.message = bus.Message;
                // if(bus._id){
                //
                // }
                var authenticate={
                    password:self.app.conf.orbcomm.password,
                    username:self.app.conf.orbcomm.username
                }
                self.SmsService.getUniqueId('correlation').then(function (cor) {
                    bus.corrId='CR'+cor.corrId;
                    buses.corrId='CR'+cor.corrId;
                    return self.codanEntitesActions.getUnitDetails(bus)
                }).then(function(deviceData){
                    console.log("||||||||||||||||||||||||||||| getUnitDetails |||||||||||||||||||||||");
                    if(deviceData.status==true){
                        bus.deviceId=deviceData.data.deviceId
                        buses.deviceId=deviceData.data.deviceId
                        bus.to=deviceData.data.deviceId
                        buses.to=deviceData.data.deviceId
                        bus.sa=deviceData.data.selfAddress
                        buses.sa=deviceData.data.selfAddress
                        bus.connectionState = "CONNECT"   // to get only connected radio
                        // buses.connectionState = "CONNECT"   // to get only connected radio
                        bus.state = "CONNECT"   // to get only connected radio
                        console.log("||||||||||||||||||||||||||||| UnitDetails |||||||||||||||||||||||");
                        console.log(bus.deviceId);
                        console.log(bus.sa);
                        return self.codanEntitesActions.getUnitId(bus)
                    }
                    else{
                        bus.deviceId='-'
                        bus.connectionState = "CONNECT"
                        bus.state = "CONNECT"
                        return self.codanEntitesActions.getUnitId(bus)
                    }
                })
                    .then(function(unitId){
                        console.log("||||||||||||||||||||||||||||| Get UnitId |||||||||||||||||||||||");
                        console.log(unitId);
                        console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
                        bus.communicatorId=unitId.data.communicatorId;
                        buses.communicatorId=unitId.data.communicatorId;
                        bus.esnNumber=unitId.data.esnNumber ? unitId.data.esnNumber :'-'
                        buses.esnNumber=unitId.data.esnNumber ? unitId.data.esnNumber :'-'
                        bus.accountId=unitId.data.accountId
                        buses.accountId=unitId.data.accountId
                        if(unitId.status==false){
                            console.log(new Date(),"|||||||||||||||||||||||||||||||| Unit Id  NULL||||||||||||||||||||||||||||||||||||");

                            var promise= self.twilio.sendMessage({
                                //to: '+919488985812', // Any number Twilio can deliver to
                                to: bus.From, // Any number Twilio can deliver to
                                from: self.app.conf.twilio.phoneNo, // A number you bought from Twilio and can use for outbound communication
                                body:'"Message not delivered to recipient" Due to incorrect details' // body of the SMS message
                            });

                            promise.then(function(call) {

                                if(call){
                                    console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Failed Msg Send ||||||||||||||||||||||||||||');

                                    console.log('Message success! MSG SID: '+call.sid);
                                    //q.shift()
                                }
                            }, function(error) {
                                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
                                console.log('Message failed!  Reason: '+error.message);
                                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
                                //q.shift()
                            });

                            resolve (self.SmsService.saveFailedSms(bus))
                        }
                        else{
                            return self.SmsService.saveReceivedSms(buses)                                                             //ToDo Need puBnuB
                        }

                    }).then(function (result) {
                        console.log("||||||||||||||||||||||||||||| Save RESULT |||||||||||||||||||||||");
                        msgObj=result
                        bus._id=result._id
                        console.log(result);
                        var entitiesUpdateObject = {
                            updateObject : buses
                        };
                        self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
                        return self.codanCommandsActions.sendAuth(authenticate)
                        //resolve(result)
                    })
                    .then(function (authenticate) {
                        authenticates=authenticate;
                        var updatedTime = moment().format();
                        var updatedTimeMillis = new Date(updatedTime).getTime();
                        if(authenticate.status=='ERROR'){
                            console.log("||||||||||||||||||||||||||||| ERROR IN SERVER |||||||||||||||||||||||");

                            var updateObjs = {
                                condition: {
                                    corrId: msgObj.corrId
                                },
                                value: {
                                    $set: {
                                        updatedTime:updatedTimeMillis,
                                        status:'QUEUEING_ERROR',
                                        messageState :8
                                    }
                                },
                                options: {multi: false, upsert: true}
                            };

                            self.SmsService.updateReceivedSms(updateObjs);
                            // self.codanCommandsActions.getScheduler(bus);
                            //q.shift();

                        }
                        else{
                            var updateObj = {
                                condition: {
                                    corrId: msgObj.corrId
                                },
                                value: {
                                    $set: {
                                        updatedTime:updatedTimeMillis,
                                        status:'INITIATED',
                                        messageState :2
                                    }
                                },
                                options: {multi: false, upsert: true}
                            };

                        }
                        var entitiesUpdateObject = {
                            communicatorId:buses.communicatorId,
                            messageDirection:'RECEIVED',
                            messageFrom:'SMS',
                            updateObject : updateObj['value']['$set']['messageState']
                        };
                        self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)

                        return self.SmsService.updateReceivedSms(updateObj)                                                     //ToDo Need puBnuB
                    })
                    .then(function(updateObj){
                        if(authenticates.status!='ERROR') {
                            requestObject["deviceId"] = buses.deviceId
                            requestObject["corrId"] = buses.corrId;
                            requestObject["messageCodeDirection"] = "SMS"
                            console.log("|||||||||||||||||||||||||||||||||||  SMS STATUS UPDATED TO SEND  ||||||||||||||||||||||||||");
                            return self.stubService.updateMessageCode(requestObject)
                        }
                    })
                    .then(function(result) {
                        if(authenticates.status!='ERROR') {
                            if (result && result.status && result.status == "ERROR") {
                                console.log("||||||||||||||||||||||||||||||||||| MESSAGE CODE NOT UPDATED IN ENTITIES ||||||||||||||||||||||||||");

                                return result;
                            }
                            else if (result && result.status) {
                                console.log("||||||||||||||||||||||||||||||||||| MESSAGE CODE UPDATED SUCCESSFULLY IN ENTITIES  ||||||||||||||||||||||||||");


                                criteria1["condition"]["deviceId"] = buses.deviceId;
                                criteria1["condition"]["corrId"] = buses.corrId;

                                updateValue["messageCode"] = result.data.messageCode;
                                buses.messageCode = result.data.messageCode

                                criteria1["value"]["$set"] = updateValue;
                                console.log("||||||||||||||||||||||||||||||||||| MESSAGE CODE UPDATED IN SMS MESSAGE ENTERED ||||||||||||||||||||||||||");

                                return self.SmsService.updateReceivedSms1(criteria1)

                            }
                        }
                    })


                    .then(function(authenticate){
                        if(authenticates.status!='ERROR'){
                            console.log(msgObj.from,'mobile No');
                            var from=msgObj.from;
                            from=from.split('');
                            from.splice(0,1);
                            from=from.join('')
                            var cmds={
                                sessionId:authenticates.sessionId,
                                deviceId:msgObj.deviceId,
                                mobile:from,
                                sa:msgObj.sa,
                                messageCode: buses ? (buses.messageCode ? buses.messageCode:null ):null
                            }


                            console.log(from,'From Number');
                            cmds.messageBody = bus.Message;
                            console.log(cmds,'send SMS To Device');
                            return self.codanCommandsActions.sendCmd(cmds)
                        }

                    }).then(function(sendRes){
                        var updatedTime = moment().format();
                        var updatedTimeMillis = new Date(updatedTime).getTime();
                        if(authenticates.status!='ERROR') {
                            if(sendRes.status=='ERROR'){
                                console.log("||||||||||||||||||||||||||||| ERROR IN SERVER |||||||||||||||||||||||");
                                console.log("||||||||||||||||||||||||||||| ERROR IN SERVER |||||||||||||||||||||||");

                                var updateObjs = {
                                    condition: {
                                        corrId: msgObj.corrId
                                    },
                                    value: {
                                        $set: {
                                            updatedTime:updatedTimeMillis,
                                            status:'SEND_ERROR',
                                            messageState :9
                                        }
                                    },
                                    options: {multi: false, upsert: true}
                                };
                                var entitiesUpdateObject = {
                                    communicatorId:buses.communicatorId,
                                    messageDirection:'RECEIVED',
                                    messageFrom:'SMS',
                                    updateObject : 9,
                                    messageCode:buses ? (buses.messageCode ? buses.messageCode:null ):null

                                };
                                self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
                                self.SmsService.updateReceivedSms(updateObjs);
                                if(sendRes.sessionId){
                                    // self.codanCommandsActions.getScheduler(bus)
                                }
                                //q.shift();
                            }
                            else{

                                sessionId=sendRes.sessionId
                                orbcomm=sendRes
                                requestObject["conf_num"]=sendRes.conf_num
                                var updateObj = {
                                    condition: {
                                        corrId: msgObj.corrId
                                    },
                                    value: {
                                        $set: {
                                            sessionId: sendRes.sessionId ? sendRes.sessionId: '',
                                            conf_num:sendRes.conf_num ? sendRes.conf_num:'',
                                            // orbcommSendTime:updatedTimeMillis,
                                            updatedTime:updatedTimeMillis,
                                            status:'SENT',
                                            messageState:3

                                        }
                                    },
                                    options: {multi: false, upsert: true}
                                };
                                var entitiesUpdateObject = {
                                    communicatorId:buses.communicatorId,
                                    messageDirection:'RECEIVED',
                                    messageFrom:'SMS',
                                    updateObject : 3,
                                    messageCode:buses ? (buses.messageCode ? buses.messageCode:null ):null

                                };
                                self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
                                return self.SmsService.updateReceivedSms(updateObj)
                            }

                        }
                        //ToDo Need puBnuB
                    })
                    .then(function (res) {
                        if(authenticates.status!='ERROR') {
                            orbcomm.messageFrom='SMS';
                            orbcomm.messageState='SENT'
                            return self.codanCommandsActions.hashUpdate(orbcomm)
                        }

                    }).then(function(updateObj){
                        if(authenticates.status!='ERROR') {
                            console.log("|||||||||||||||||||||||||||||||||||  SMS STATUS UPDATED TO SEND  ||||||||||||||||||||||||||");
                            return self.codanCommandsActions.logout(sessionId)
                        }
                    })


                    .then(function(final){
                        if(authenticates.status!='ERROR') {
                            console.log("|||||||||||||||||||||||||||||||||||  LOGED OUT  ||||||||||||||||||||||||||");
                            var promise = self.twilio.sendMessage({
                                //to: '+919488985812', // Any number Twilio can deliver to
                                to: bus.From, // Any number Twilio can deliver to
                                from: self.app.conf.twilio.phoneNo, // A number you bought from Twilio and can use for outbound communication
                                body: 'Message sent successfully' // body of the SMS message
                            });
                            promise.then(function (call) {

                                if (call) {
                                    console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Failed Msg Send ||||||||||||||||||||||||||||');

                                    console.log('Message success! MSG SID: ' + call.sid);
                                    //q.shift()
                                }
                            }, function (error) {
                                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
                                console.log('Message failed!  Reason: ' + error.message);
                                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
                                //q.shift()
                            });

                            resolve(final)
                        }

                    })

            //})
        })
    //})
};

SmsAction.prototype.initQ = function () {
   var self = this;
   var twilioRes=null
   var update=null;
    var messageState=null
    var temp0=null

    console.log('[', Date(), '] ||||||||||||||||||| Q - twillioResponceHandler Entered');
   self.queue.sub('twillioResponceHandler', function (bus, q) {
   // q.shift()
       if(!bus.status && bus.status==false){
           console.log(new Date(),'|||||||||||||||||||||||||||||||||| DUMMY MESSAGE FROM twillioResponceHandler |||||||||||||||||||');
           q.shift()

       }else{
           var updatedTime = moment().format();
           var updatedTimeMillis = new Date(updatedTime).getTime();
           console.log('[', Date(), '] ||||||||||||||||||| Q - twillioResponceHandler subcribed')
           console.log(self.app.twilio.accountSid);
           console.log(self.app.twilio.authToken);
           console.log(bus)
           var queryUrl=self.app.conf.twilio.queryUrl+bus.sid;
           var options = {
               url: 'https://'+self.app.twilio.accountSid+':'+self.app.twilio.authToken+'@api.twilio.com/2010-04-01/Accounts/'+self.app.twilio.accountSid+'/SMS/Messages/'+bus.sid,
               qs: '',
               headers: {'content-type': 'application/x-www-form-urlencoded'},
               json: true
           };
           self.request.getAsync(options)
               .then(function (result) {
                   console.log('[', Date(), '] ||||||||||||||||||| twillioResponce Get |||||||||||||||||');

                   console.log(result.body);
                   return result.body
// xml to json
               })
               .then(function (results) {
                   var xml = results;
                   var json = parser.toJson(xml); //returns a string containing the JSON structure by default
                   var x=JSON.parse(json)
                   var Json = x
                   console.log(Json);
                   if(Json.TwilioResponse.SMSMessage.Status=='sent'){
                       Json.TwilioResponse.SMSMessage.Status='submitted'
                   }
                   var res={
                       status:Json.TwilioResponse.SMSMessage.Status,
                       Sid:Json.TwilioResponse.SMSMessage.Sid

                   }
                   twilioRes=res;
                   messageState=null
                   if(res.status=='submitted'){
                       messageState=4;
                   }
                   if(res.status=='pending'){
                       messageState=5;
                   }
                   if(res.status=='delivered'){
                       messageState=6;
                   }
                   if(res.status=='read'){
                       messageState=7;
                   }
                   if(res.status=='undelivered'){
                       messageState=11;
                   }
                   if(res.status=='failed'){
                       messageState=13;
                   }
                   var updateObj = {
                       condition: {
                           sid: bus.sid
                       },
                       value: {
                           $set: {
                               updatedTime:updatedTimeMillis,
                               status:res.status.toUpperCase(),
                               messageState:messageState
                           }
                       },
                       options: {multi: false, upsert: true}
                   };

                   if(bus.ackFor=='delivered'){
                       updateObj['value']['$set']['delivered_messageState']=messageState
                   }
                   if(bus.ackFor=='read'){
                       updateObj['value']['$set']['read_messageState']=messageState
                   }
                   update=updateObj
                   return updateObj
               }).then(function (updateObj) {
               return self.db.updateAsync('sms_message_hash',updateObj)
           }).then(function (res) {
               return self.SmsService.getOneDetails1('message_status',update)
           }).then(function (updates) {

               temp0=updates
               console.log(bus.status.toLowerCase(),"Hash table Updated ||||||||||||||||||||", update,twilioRes.status.toLowerCase());
               console.log(updates.data.messageState,'|||||||||||||',messageState);
               console.log(updates.status,'|||||||||||||');

               if( twilioRes.status.toLowerCase() !=bus.status.toLowerCase()){
                   console.log("||||||||||||||||||||||| TRUE FOR ACK |||||||||||||||||||||");
                   return self.SmsService.updateSendSms(update,bus)
               }else{
                   console.log("||||||||||||||||||||||| false FOR ACK |||||||||||||||||||||");

                   return updates

               }

           }).then(function (res) {
               var collectionName='message_status';
               var findObj= {
                   condition: {
                       sid: bus.sid
                   }
               }
               // var entitiesUpdateObject = {
               //     communicatorId:buses.communicatorId,
               //     messageFrom:'SMS',
               //     updateObject : 'SENT'
               // };
               // self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
               // if( (temp0.data.messageState != messageState))
               return self.SmsService.getOneDetails1(collectionName,findObj)
               // else
               //     return res
           }).then(function (finRes) {
               var entitiesUpdateObject = {
                   communicatorId:finRes.data.communicatorId,
                   assetId:finRes.data.assetId,
                   messageFrom:'SMS',
                   messageDirection:'SENT',
                   updateObject : messageState
               };
               // if( (temp0.data.messageState != messageState))
               return self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
               // else
               //     return res

           }).then(function (finalRes) {
               if(twilioRes.status=='received' || twilioRes.status=='delivered' || twilioRes.status=='failed' || twilioRes.status=='undelivered'){
                   var removeObj={
                       condition:{
                           sid:bus.sid
                       }
                   }
                   console.log('[', Date(), '] |||||||||||||||||||||||||||||| Status check Finished ||||||||||||||||||||||||||');
                   return self.SmsService.deleteHash(removeObj)
               }
               else
                   return finalRes

           }).then(function (res) {
               q.shift()
           })
       }

   })

}


//SmsAction.prototype.dummyTest = function (bus) {
//    var self=this;
//    var msgObj=null
//    var sessionId=null;
//
//    var requestObject = {}
//    var updateObj1 = {}
//    var updateValue = {}
//    var criteria1 = {
//        condition:{},
//        value:{$set:{}},
//        options:{multi:false,upsert:false}
//    };
//    self.qconn.on('ready', function () {
//        return new Promise(function (resolve, reject) {
//
//            self.queue.sub('twillioMessageHandler', function (bus, q) {
//                console.log("||||||||||||||||||||||||||||| Q Subcribed |||||||||||||||||||||||");
//                console.log(bus);
//                var createdTime = moment().format();
//                var requestObject ={}
//                var createdTimeMillis = new Date(createdTime).getTime();
//                var smsObj = bus
//                bus.smsRecivedTime = createdTimeMillis
//                bus.status = 'PENDING'
//                bus.messageState = 'PENDING'
//                bus.messageDirection = 'RECEIVED'
//                bus.isRead = false
//                bus.isAcked = false
//                bus.From = bus.From
//                bus.message = bus.Message;
//                var authenticate={
//                    password:self.app.conf.orbcomm.password,
//                    username:self.app.conf.orbcomm.username
//                }
//                self.codanEntitesActions.getUnitDetails(bus)
//                    .then(function(deviceData){
//                        console.log("||||||||||||||||||||||||||||| getUnitDetails |||||||||||||||||||||||");
//                        if(deviceData.status==true){
//                            bus.deviceId=deviceData.data.deviceId
//                            bus.sa=deviceData.data.selfAddress
//                            console.log("||||||||||||||||||||||||||||| UnitDetails |||||||||||||||||||||||");
//                            console.log(bus.deviceId);
//                            console.log(bus.sa);
//                            return self.codanEntitesActions.getUnitId(bus)
//                        }
//                        else{
//                            bus.deviceId='-'
//                            return self.codanEntitesActions.getUnitId(bus)
//                        }
//                    })
//                    .then(function(unitId){
//                        console.log("||||||||||||||||||||||||||||| Get UnitId |||||||||||||||||||||||");
//                        console.log(unitId);
//                        console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
//
//                        if(unitId.status==false){
//                            console.log(new Date(),"|||||||||||||||||||||||||||||||| Unit Id  NULL||||||||||||||||||||||||||||||||||||");
//
//                            var promise= self.twilio.sendMessage({
//                                //to: '+919488985812', // Any number Twilio can deliver to
//                                to: bus.From, // Any number Twilio can deliver to
//                                from: self.app.conf.twilio.phoneNo, // A number you bought from Twilio and can use for outbound communication
//                                body:'"Message not delivered to recipient" Due to incorrect details' // body of the SMS message
//                            });
//
//                            promise.then(function(call) {
//
//                                if(call){
//                                    console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Failed Msg Send ||||||||||||||||||||||||||||');
//
//                                    console.log('Message success! MSG SID: '+call.sid);
//                                    q.shift()
//                                }
//                            }, function(error) {
//                                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                                console.log('Message failed!  Reason: '+error.message);
//                                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                                q.shift()
//                            });
//
//                            resolve (self.SmsService.saveFailedSms(bus))
//                        }
//                        else{
//                            return self.SmsService.saveReceivedSms(bus)
//                        }
//
//                    }).then(function (result) {
//                        console.log("||||||||||||||||||||||||||||| Save RESULT |||||||||||||||||||||||");
//                        msgObj=result
//                        console.log(result);
//                        return self.codanCommandsActions.sendAuth(authenticate)
//                        //resolve(result)
//                    }).then(function(authenticate){
//                        console.log(msgObj.From,'mobile No');
//                        var from=msgObj.From;
//                        from=from.split('');
//                        from.splice(0,1);
//                        from=from.join('')
//                        var cmds={
//                            sessionId:authenticate.sessionId,
//                            deviceId:msgObj.deviceId,
//                            mobile:from,
//                            sa:msgObj.sa
//                        }
//
//
//                        console.log(from,'From Number');
//                        cmds.messageBody = msgObj.Message;
//                        console.log(cmds,'send SMS To Device');
//                        return self.codanCommandsActions.sendCmd(cmds)
//                    }).then(function(sendRes){
//                        var updatedTime = moment().format();
//                        var updatedTimeMillis = new Date(updatedTime).getTime();
//                        sessionId=sendRes.sessionId
//                        requestObject["conf_num"]=sendRes.conf_num
//                        var updateObj = {
//                            condition: {
//                                _id: msgObj._id
//                            },
//                            value: {
//                                $set: {
//                                    sessionId: sendRes.sessionId ? sendRes.sessionId: '',
//                                    conf_num:sendRes.conf_num ? sendRes.conf_num:'',
//                                    orbcommSendTime:updatedTimeMillis,
//                                    status:'SEND'
//                                }
//                            },
//                            options: {multi: false, upsert: true}
//                        };
//
//                        return self.SmsService.updateReceivedSms(updateObj)
//
//                    }).then(function(updateObj){
//                        console.log("|||||||||||||||||||||||||||||||||||  SMS STATUS UPDATED TO SEND  ||||||||||||||||||||||||||");
//                        return self.codanCommandsActions.logout(sessionId)
//
//                    })
//                    .then(function(updateObj){
//                        requestObject["deviceId"] = bus.deviceId
//                        requestObject["messageCodeDirection"] = "SMS"
//                        console.log("|||||||||||||||||||||||||||||||||||  SMS STATUS UPDATED TO SEND  ||||||||||||||||||||||||||");
//                        return self.stubService.updateMessageCode(requestObject)
//                    })
//                    .then(function(result) {
//
//
//                        if (result && result.status && result.status == "ERROR") {
//                            console.log("||||||||||||||||||||||||||||||||||| MESSAGE CODE NOT UPDATED IN ENTITIES ||||||||||||||||||||||||||");
//
//                            return result;
//                        }
//                        else if (result && result.status) {
//                            console.log("||||||||||||||||||||||||||||||||||| MESSAGE CODE UPDATED SUCCESSFULLY IN ENTITIES  ||||||||||||||||||||||||||");
//
//
//                            criteria1["condition"]["conf_num"] = result.data.conf_num;
//                            criteria1["condition"]["deviceId"] = result.data.deviceId;
//
//                            updateValue["messageCode"] = result.data.messageCode;
//
//                            criteria1["value"]["$set"] = updateValue;
//                            console.log("||||||||||||||||||||||||||||||||||| MESSAGE CODE UPDATED IN SMS MESSAGE ENTERED ||||||||||||||||||||||||||");
//
//                            return self.SmsService.updateReceivedSms1(criteria1)
//
//                        }
//                    }).then(function(final){
//                        console.log("|||||||||||||||||||||||||||||||||||  LOGED OUT  ||||||||||||||||||||||||||");
//                    console.log(final);
//
//                    var promise= self.twilio.sendMessage({
//                            //to: '+919488985812', // Any number Twilio can deliver to
//                            to: bus.From, // Any number Twilio can deliver to
//                            from: self.app.conf.twilio.phoneNo, // A number you bought from Twilio and can use for outbound communication
//                            body:'Message sent successfully' // body of the SMS message
//                        });
//                        promise.then(function(call) {
//
//                            if(call){
//                                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Failed Msg Send ||||||||||||||||||||||||||||');
//
//                                console.log('Message success! MSG SID: '+call.sid);
//                                q.shift()
//                            }
//                        }, function(error) {
//                            console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                            console.log('Message failed!  Reason: '+error.message);
//                            console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//                            q.shift()
//                        });
//
//                        resolve(final)
//
//                    })
//
//            })
//        })
//    })
//};

SmsAction.prototype.sendSms = function (req) {
    var self =this;
    var saveRes=null;
    var saveRes1=null;
    var res1=null;
    var saveResponce=null
    // console.log(req,"22222222222222222222",req.messageFrom);
    return new Promise(function (resolve, reject) {
        self.SmsService.getUniqueId('correlation')
            .then(function (cor) {
                console.log('|||||||||||||||||||||||||||||||||||| CORRID:', cor, '||||||||||||||||||||||||');
                req.corrId='CR'+cor.corrId;
                var bus={
                    deviceId:req.messageFrom,
                    sa:req.sa

                }
                return self.codanEntitesActions.getUnitId(bus)
          
        }).then(function (result) {

            res1=result
            console.log(res1);
            var promises= self.twilioLokup.phoneNumbers(req.toMobileNumber).get({
                type: 'carrier'
            });

            return promises.then(function(call) {
                if(call){
                    console.log('::::::::::::::::::::::::::: GET CUNTRY FUNCTION ENTERED |||||||||||||||');
                    console.log('Message success! Country : '+call.country_code);
                        req.country_code=call.country_code
                    return call
                }
            }, function(error) {
                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
                console.log('Message failed!  Reason: '+error.message);
                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');

                if(error){
                    return error
                }
            })
        })
        .then(function(result){
                saveRes=res1;
                saveRes1=res1;
               req.esnNumber= res1.data.esnNumber  ? res1.data.esnNumber :'-'             //ToDo Need puBnuB
               req.communicatorId= res1.data.communicatorId  ? res1.data.communicatorId :'-'
               req.accountId= res1.data.accountId  ? res1.data.accountId :'-'
               req.unitId= res1.data.unitId  ? res1.data.unitId :'-'
               req.assetId= res1.data.assetId  ? res1.data.assetId :'-'

                       //ToDo Need puBnuB

                    console.log("|||||||||||||||||||||||||||| req |||||||||||||||| ",req)
                return self.SmsService.saveSms(req)

        }).then(function (result) {
                saveResponce=result
                saveResponce.communicatorId=saveRes.data.communicatorId
                saveResponce.assetId=saveRes.data.assetId
                var bus={
                deviceId:req.messageFrom,
                sa:req.sa

                }
                var entitiesUpdateObject = {
                    updateObject : saveResponce
                };
                // self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
                return self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
            
        })
            .then(function (unitRes) {
                unitRes=saveRes;
                var updatedTime = moment().format();
                var updatedTimeMillis = new Date(updatedTime).getTime();
                console.log('SAVE SMS |||||||||||||||||||||||||||||||||||||||||||');
                console.log(saveResponce);
                if(unitRes.status=='true' || unitRes.status==true){
                    var updateObj = {
                        condition: {
                            // messageId: saveResponce.messageId,
                            corrId: req.corrId
                        },
                        value: {
                            $set: {
                                updatedTime:updatedTimeMillis,
                                status:'INITIATED',
                                messageState :2
                            }
                        },
                        options: {multi: false, upsert: true}
                    };
                    var entitiesUpdateObject = {
                        communicatorId:saveRes1.data.communicatorId,
                        assetId:saveRes1.data.assetId,
                        messageDirection:'SENT',
                        messageFrom:'SMS',
                        updateObject : updateObj['value']['$set']['messageState']
                    };
                    self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
                    return self.SmsService.updateReceivedSms(updateObj)                     //ToDo Need puBnuB
                }else{
                    var updateObj = {
                        condition: {
                            // messageId: saveResponce.messageId,
                            _id: saveResponce._id
                        },
                        value: {
                            $set: {
                                updatedTime:updatedTimeMillis,
                                status:'QUEUEING_ERROR',
                                messageState :8
                            }
                        },
                        options: {multi: false, upsert: true}
                    };
                    var entitiesUpdateObject = {
                        communicatorId:saveRes1.data.communicatorId,
                        assetId:saveRes1.data.assetId,
                        messageDirection:'SENT',
                        messageFrom:'SMS',
                        updateObject : updateObj['value']['$set']['messageState']
                    };
                    self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)

                    self.SmsService.updateReceivedSms(updateObj)
                    var results={
                    status:false,
                    message:'Message Send Failed'
                    }
                    resolve(results)
                }

            
        }).then(function(unitRes){
            saveResponce.accountId=saveRes.data.accountId;
            saveResponce.communicatorId=saveRes.data.communicatorId;
            saveResponce.assetId=saveRes1.data.assetId
            var tempFrom=self.app.conf.twilio.phoneNo
            if(saveRes.status==true && unitRes.status!=false){
               var temp=saveRes.data.unitId.split('')
                temp[0]='C';
                temp[1]='C';
                if(req.country_code=='CA' || req.country_code=='US'){
                     tempFrom=self.app.conf.twilio.phoneNoUS
                }

                var promise= self.twilio.sendMessage({
                    //to: '+919488985812', // Any number Twilio can deliver to
                    to: req.toMobileNumber, // Any number Twilio can deliver to
                    from: tempFrom, // A number you bought from Twilio and can use for outbound communication
                    body: req.message+'\n -To Reply Enter ' +' '+ temp.join('') + ':' +req.sa+ ' your_message' // body of the SMS message
                });

                return promise.then(function(call) {
                    console.log('Message success! MSG SID: '+call.sid);
                    if(call){
                        return call
                    }
                }, function(error) {
                    console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
                    console.log('Message failed!  Reason: '+error.message);
                    console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');

                    if(error){
                        return error
                    }
                });
            }
            else{
                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Unit Id Not Registered  ||||||||||||||||||||||||||||');

                return ({status:false})
            }
        


        }).then(function(twilioRes){
            console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Res Received  ||||||||||||||||||||||||||||');
            if(twilioRes.status==400){
                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Err Res Received  ||||||||||||||||||||||||||||');
                console.log(twilioRes);
                var entitiesUpdateObject = {
                    communicatorId:saveRes1.data.communicatorId,
                    assetId:saveRes1.data.assetId,
                    messageDirection:'SENT',
                    messageFrom:'SMS',
                    updateObject : 9
                };
                self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
                 self.SmsService.updateSms(twilioRes,saveResponce)                           //ToDo Need puBnuB
                resolve(twilioRes)
            }
            else if(twilioRes.status!=false){
                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Res ||||||||||||||||||||||||||||');
                console.log(twilioRes);
                console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Res End ||||||||||||||||||||||||||||');
                console.log(saveResponce);
                var entitiesUpdateObject = {
                    communicatorId:saveRes1.data.communicatorId,
                    assetId:saveRes1.data.assetId,
                    messageDirection:'SENT',
                    messageFrom:'SMS',
                    updateObject : 3
                };
                self.codanStatusActions.updateincommunicatorstatus(entitiesUpdateObject)
                return self.SmsService.updateSms(twilioRes,saveResponce)                          //ToDo Need puBnuB

            }
            else{
            var results={
            status:false,
            message:'Sent error'
            }
            return results
            }

        }).then(function(updateRes){
            resolve(updateRes)
        }).error(function(e){
            console.error(e);
            resolve(e)
        })

    })

};
SmsAction.prototype.getSmsListStatus = function () {
    var self = this;
    console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||| SMS List For status Update :SEND Entered |||||||||||||||||||||||||||||||||||||||||||||||||||||||");
    var condition={
        messageDirection: "SEND",
        sa:'ALL',
        status:{$nin:['received','delivered','failed','undelivered']},
        requiredFields:{sid:1,status:1}
    }
    return new Promise(function (resolve, reject) {
        self.getListSmsMessage(condition).then(function (result) {
        resolve (result)            
        })
    })
};



SmsAction.prototype.getListSmsMessagesIteration =function(input) {
    var self=this;
    var resultArray=[];
    return new Promise(function (resolve, reject) {
        Promise.each(input.communicatorId, function (onecommunicatorId, index, length) {
            if(onecommunicatorId.lastSmsMessageTime != ""){
                return self.getListSmsMessages(onecommunicatorId)
                    .then(function (resultObj) {
                        console.log('resultObj  Index',index);
                        if (resultObj) {
                        resultObj.SA=onecommunicatorId.selfAddresses
                            resultArray.push(resultObj);
                            return resultObj;
                        }
                        else {
                            return resultObj;
                        }
                    })
            }
            else{
            return onecommunicatorId
            }


        }).then(function (result) {
            resolve (resultArray)
        })
    })

}
SmsAction.prototype.getListSmsMessage =function(input) {
    var self = this;
    var criteria = {
        condition: {},
        sort: {},
        pagination: {},
        requiredFields: {}
    };
    var collectionName = "sms_message_hash";
    return new Promise(function (resolve, reject) {
        self.SmsService.getSmsLists(collectionName, criteria).
            then(function (results) {
            resolve(results)

        })
    })
}
SmsAction.prototype.getListSmsMessages =function(input) {
    var self =this;
    var criteria = {
        condition : {},
        sort :{},
        pagination :{},
        requiredFields : {}
    };
    var responseObject = {};
    var collectionName = "message_status";
    return new Promise(function (resolve, reject) {

if(input.sa){
    if(input) {
        if (input && input.deviceId) {
            criteria["condition"]["deviceId"] = input.deviceId;
        }
        if (input && input.unitId) {
            criteria["condition"]["unitId"] = input.unitId;
        }
        if (input && input.communicatorId) {
            criteria["condition"]["communicatorId"] = input.communicatorId;
        }
        if (input && input.sa && input.sa!='ALL') {
            criteria["condition"]["sa"] = input.sa;
        }
        if (input && input.messageDirection) {
            criteria["condition"]["messageDirection"] = input.messageDirection;
        }
        if (input && input.limit) {
            criteria["pagination"]["limit"] = Number(input.limit);
        }
        if (input && input._id) {
            criteria["condition"]["_id"] = {$gte: ObjectId((input._id).toString())};
        }
        if (input && input.skip) {
            criteria["pagination"]["skip"] = Number(input.skip);
        }
        if (input && input.status) {
            criteria["condition"]["status"] = input.status;
        }
        if (input && input.requiredFields) {
            criteria["requiredFields"] = input.requiredFields;
        }

        if (input && input.sortOrder && input.sortField) {
            if (input.sortOrder == 'desc') {
                criteria['sort'][input.sortField] = -1
            }
            else {
                criteria['sort'][input.sortField] = 1
            }
        }
        else {
            criteria["sort"]["_id"] = -1
        }


        if(input && input!={} && input!=null && input!='null' && input!="") {

            if (( input.pageNo && input.pageNo != '' && input.pageNo != null && input.pageNo != 'null') && (input.limit && input.limit != '' && input.limit != null && input.limit != 'null')) {
                criteria['limit'] = Number(input.limit);
                //criteria['pageNo'] = Number(input.pageNo);
                criteria['skip'] = ( Number(input.pageNo) - 1 ) * Number(input.limit);
            }
            else{

                if (input.limit && input.limit != '' && input.limit != null && input.limit != 'null') {
                    criteria ['limit'] = Number(input.limit);
                    criteria ['skip'] = 0;
                }
                else if (input.pageNo && input.pageNo != '' && input.pageNo != null && input.pageNo != 'null') {
                    criteria ['skip'] = ( Number(input.pageNo) - 1 ) * 10;
                    criteria ['limit'] = 10;
                }
                else {
                    criteria ['skip'] = 0;
                    criteria ['limit'] = 10;
                }
            }
        }

        console.log("|||||||||||||||||| COUNT CRITERIA ||||||||||||",criteria)
        console.log("|||||||||||||||||| COUNT COLLECTION NAME ||||||||||||",collectionName)

        self.SmsService.checkCount( criteria,collectionName)
            .then(function (result) {
                if(result){
                    responseObject ["count"] = result ;
                    return self.SmsService.getEntityList1(collectionName, criteria)
                }
                else{
                    responseObject ["count"] = result ;
                    responseObject["status"] = false;
                    responseObject["message"] = "NO DATA";
                    responseObject["data"] = 0;
                    return responseObject;
                }


            })
            .then(function (result) {
                if(result){
                    result.count = responseObject.count;
                    console.log("||||||||||||||||||||| IF FINAL RESULT ||||||||||||||",result)

                    return result;
                }
                else{
                    console.log("||||||||||||||||||||| ELSE FINAL RESULT ||||||||||||||",result)

                    return result;
                }


            })
            .then(function (result) {
                console.log("||||||||||||||||||||| FINAL RESULT ||||||||||||||",result)
                resolve(result)
            })
            .catch(function (e) {
                reject(e.message)
            })

    }
}
else{
    console.log('sms else kulla varuthu');
    if (input && input.communicatorId) {
        criteria["condition"]["communicatorId"] = input.communicatorId;
       }
    criteria["sort"]["_id"] = -1;
    criteria["pagination"]["limit"] = 1;
   self.SmsService.getSmsList(collectionName, criteria).then(function (results) {
    resolve (results)
    
   })

}


    })

};

SmsAction.prototype.updateAckedForSendSmsMessage = function (input) {

    var self = this;
    var responseObject={};
    var updateValue={};

    var criteria = {
        condition:{},
        value:{$set:{}},
        options:{multi:false,upsert:false}
    };


    return new Promise(function (resolve, reject) {

        if(input && input.deviceId && input.messageCode && input.responseCode && input.conf_num )


            if(input.responseCode == '0'){
                updateValue["messageState"] =  "DELIVERED";
                updateValue["isRead"] = true
                updateValue["isAcked"] = true
            }
            else if(input.responseCode == '1'){
                updateValue["messageState"] =  "DELIVERED";
                updateValue["isRead"] = false
                updateValue["isAcked"] = false
            }
            else if(input.responseCode == '2'){
                updateValue["messageState"] =  "FAILED";
                updateValue["isRead"] = false
                updateValue["isAcked"] = true
            }
        //criteria["deviceId"] = input.deviceId;
        ////criteria["messageDirection"] = input.messageDirection;
        //criteria["corrId"] =input.corrId;

        criteria["condition"] ["deviceId"] = input.deviceId;
        criteria["condition"]["conf_num"] =input.conf_num;
        criteria["condition"]["messageCode"] = input.messageCode;
        //criteria["condition"]["isAcked"] = false;


        //updateValue["messageCode"] = input.messageCode;
        //updateValue["isRead"] = true;

        criteria["value"]["$set"] = updateValue;

        self.SmsService.updateReceivedSms1(criteria)
            .then(function(result){
                console.log(result,"updateEntities result");
                if(result) {
                    responseObject ["status"] = true;
                    responseObject ["message"] = "UPDATED SUCCESSFULLY";
                    return responseObject
                }
                else {
                    responseObject ["status"] = false;
                    responseObject ["message"] = "NOT UPDATED";
                    return responseObject
                }

            })
            .then(function(result){
                resolve(result);
            })
            .catch(function(e){
                reject(e);
            })

    })

};



SmsAction.prototype.listSmsMessageCount =function(inputObj){

    var self = this;
    var criteria={
        condition:{}
    };
    var responseObject = {};
    var responseObject1 = {};
    var collectionName = "message_status";

    //console.log("INPUT FOR updateMessages",inputObj);

    criteria["condition"]["messageDirection"] = "SEND";
    return new Promise(function (resolve, reject) {

        if(inputObj && inputObj.accountsArray) {

            criteria["condition"]["accountId"] = {$in:inputObj.accountsArray};


            self.SmsService.checkCount(criteria, collectionName)
                .then(function (sendMessageCount) {
                    responseObject["sendSmsMessageCount"] = sendMessageCount;
                    criteria["condition"]["messageDirection"] = "RECEIVED";
                    return self.SmsService.checkCount(criteria, collectionName)

                })
                .then(function (result) {
                    responseObject["receivedSmsMessageCount"] = result;
                    return responseObject;
                })

                .then(function (result) {
                    responseObject["totalSmsMessageCount"] = responseObject.sendSmsMessageCount + responseObject.receivedSmsMessageCount
                    return responseObject;
                })
                .then(function (result) {

                    responseObject1["status"] = true
                    responseObject1["message"] = "DATA AVAILABLE"
                    responseObject1["data"] = responseObject
                    resolve(responseObject1)
                })
                .catch(function (e) {
                    reject(e.message)
                })
        }
        else{
            responseObject1["status"] = false
            responseObject1["message"] = "ACCOUNTS ARRAY MISSING"
            responseObject1["data"] = 0
            resolve(responseObject1)

        }


    })

};
//})
//.then(function(updateObj){
//    requestObject["deviceId"] = bus.deviceId
//    requestObject["messageCodeDirection"] = "SMS"
//    console.log("|||||||||||||||||||||||||||||||||||  SMS STATUS UPDATED TO SEND  ||||||||||||||||||||||||||");
//    return self.stubService.updateMessageCode(requestObject)
//})
//    .then(function(updateObj) {
//
//        if (result && result.status && result.status == "ERROR") {
//            return result;
//        }
//        else if (result && result.status) {
//            criteria1["condition"]["messageCode"] = result.data.messageCode;
//            //updateObj["messageCode"]= result.data.messageCode;
//            updateValue["conf_num"] = result.data.conf_num;
//
//            criteria1["condition"]["deviceId"] = result.data.deviceId;
//            criteria1["value"]["$set"] = updateValue;
//            return self.updateReceivedSms(criteria1)
//
//        }
//    })
//    .then(function(final){


SmsAction.prototype.moveSmsMessages = function (input) {

    var self = this;

    var responseObject = {};
    var collectionName = "message_status";
    var errResponse = {
        status: false,
        message: ""
    };

    var updateCriteria = {
        condition: {},
        value: {
            $set: {}
        },
        options: {
            multi: true,
            upsert: false
        }
    };
    return new Promise(function (resolve, reject) {
        if(input && input.communicatorId && input.accountId) {
            if (input.communicatorId) {
                updateCriteria['condition']['communicatorId'] = {$in: input.communicatorId}

            }
            if (input.accountId) {
                updateCriteria['value']['$set']['accountId'] = input.accountId ? input.accountId : null
            }
            self.SmsService.updateEntities(collectionName,updateCriteria)
                .then(function (result) {
                    resolve(result);
                })
        }
        else
        {
            console.log(new Date(),"INPUT PARAMETER (communicatorId or accountId) MISSING in MOVE ACCOUNT")
            responseObject ["status"] = false
            responseObject ["data"] = 0
            responseObject ["message"] = "INPUT PARAMETER MISSING"
            resolve(responseObject);
        }
    })

};

SmsAction.prototype.ackSmsMessages = function (input) {

    var self = this;

    var responseObject = {};
    var data;
    var collectionName = "message_status";
    var collectionName1 = "sms_ack_status";
    var collectionName2 = "sms_ack_status_history";
    var hashTable='sms_message_hash';
    var errResponse = {
        status: false,
        message: ""
    };

    var criteria = {
        condition: {},
        value: {
            $set: {}
        },
        options: {
            multi: true,
            upsert: false
        }
    };
    var saveObj = {

    };
    var twilioRes;
    var updateObj = {
        condition: {},
        value: {
            $set: {}
        },
        options: {
            multi: true,
            upsert: false
        }
    };
    var updateValue={};

    return new Promise(function (resolve, reject) {
        if(input) {
            if (input.conf_num) {
                criteria['condition']['conf_num'] = input.conf_num
                saveObj['conf_num']=input.conf_num
            }
            if (input.corrId) {
                criteria['condition']['corrId'] = input.corrId
                saveObj['corrId']=input.corrId
            }
            if (input.deviceId) {
                criteria['condition']['deviceId'] = input.deviceId
                saveObj['deviceId']=input.deviceId
            }
            if (input.messageCode) {
                criteria['condition']['messageCode']= input.messageCode ? input.messageCode : null
                saveObj['messageCode']=input.messageCode ? input.messageCode : null
            }
            self.SmsService.getOneDetails1(collectionName,criteria)
                .then(function (result) {
                    data=result
                    input.communicatorId=result.data.communicatorId
                    input.corrId=result.data.corrId
                    saveObj['corrId']=result.data.corrId
                    if(result.status==true){
                        saveObj['communicatorId']=result.data.communicatorId;
                        saveObj['messageCode']=result.data.messageCode
                        criteria['condition']['corrId']=result.data.corrId
                        saveObj["accountId"]=result.data.accountId
                        if(input.messageState==6 || input.messageState=='6'){
                            saveObj["delivered_messageState"]=2
                            saveObj["ackFor"]='smsDelivered'
                            saveObj["deliveredTime"]=new Date().getTime()
                            saveObj["read_messageState"]=null
                            updateObj['value']['$set']['delivered_messageState']=3
                            data.messageStates='sent'

                        }
                        if(input.messageState==7 || input.messageState=='7'){
                            saveObj["read_messageState"]=2;
                            saveObj["ackFor"]='smsRead'
                            saveObj["readTime"]=new Date().getTime()
                            updateObj['value']['$set']['read_messageState']=3
                            data.messageStates='read'

                        }
                        return self.SmsService.createEntities(collectionName1,saveObj)
                    }
                    else{
                        return result;
                    }

                }).then(function (inputRes) {
                if(inputRes.status==true){
                    return self.SmsService.createEntities(collectionName2,saveObj) 
                }
                else{
                    return inputRes   
                }
                
            }).then(function (inputRes) {
                if(inputRes.status==true){
                    return self.sendSmsMessages(data)
                }
                else{
                    return inputRes
                } 

            }).then(function (inputRes) {
                if(inputRes.status==true){  
                    twilioRes=inputRes.data
                    // criteria.condition.ackfor
                    if(input.messageState==6 || input.messageState=='6'){
                        updateObj['value']['$set']['deliveredStateUpdatedTime']=new Date().getTime()
                        criteria.condition['ackFor']='smsDelivered'
                    }
                    if(input.messageState==7 || input.messageState=='7'){
                        updateObj['value']['$set']['readStateUpdatedTime']=new Date().getTime()
                        criteria.condition['ackFor']='smsRead'
                    }

                    updateObj.condition=criteria.condition
                    var historyObj= {
                        condition:updateObj.condition
                    }


                    updateObj['value']['$set']['updatedTime']=new Date().getTime()
                    updateObj['value']['$set']['sid']=twilioRes.sid
                    return self.SmsService.updateData(updateObj,historyObj,collectionName1,collectionName2)
                }
                else{
                    return inputRes
                }

            }).then(function (inputRes) {
                console.log('inga varutha ..............................');
                console.log(inputRes);

                console.log(twilioRes.status, twilioRes.sid, input.communicatorId);

                if(inputRes.status==true){
                    console.log(twilioRes.status, twilioRes.sid, input.communicatorId);
                    var hash={
                        status:twilioRes.status ? twilioRes.status : "-",
                        sid: twilioRes.sid ? twilioRes.sid : "",
                        communicatorId:input.communicatorId ? input.communicatorId : "-",
                        type:'ACK'
                    }
                    if(input.messageState==6 || input.messageState=='6')
                        hash.ackFor='delivered'
                    else
                        hash.ackFor='read'
                    return self.SmsService.createEntities(hashTable,hash)
               }
                else{
                    return inputRes
                }

            }).then(function (oneData) {
                twilioRes=null
                resolve (oneData)
            })
        }
        else
        {
            console.log(new Date(),"INPUT PARAMETER (communicatorId or accountId) MISSING in MOVE ACCOUNT")
            responseObject ["status"] = false
            responseObject ["data"] = 0
            responseObject ["message"] = "INPUT PARAMETER MISSING"
            resolve(responseObject);
        }
    })

};

SmsAction.prototype.sendSmsMessages = function (input) {
    var self = this;

    var responseObject = {};
    var collectionName = "message_status";
    var errResponse = {
        status: false,
        message: ""
    };
    var successResponse = {
        status: true,
        data:null,
        message: null
    };

    var sendSmsInput ={}
    var colonTemp =0
    return new Promise(function (resolve, reject) {

        var tempVar =input.data.response.Body.split(" ")
        if(tempVar[0].indexOf(":") != -1){
            colonTemp =1;
        }

        var rawMessage=input.data.response.Body.replace(/[ ;:]/, " ").split(' ')

        sendSmsInput = {
            to: input.data.from // Any number Twilio can deliver to
        }
        if(colonTemp){
            console.log(new Date(),"|||| Response sent with : ||||||||||||")
            sendSmsInput["body"] = 'Message to '+rawMessage[0] + ':' + rawMessage[1] + ' has been '+ input.messageStates + ' '// body of the SMS message
        }else{
            console.log(new Date(),"|||| Response sent with space ||||||||||||")

            sendSmsInput["body"] = 'Message to '+rawMessage[0] + ' ' + rawMessage[1] + ' has been '+ input.messageStates + ' '// body of the SMS message

        }
        self.twilioLokup.phoneNumbers(input.data.from).get({type: 'carrier'})
            .then(function (Result){

                console.log(new Date(),"|||||||||| TWILIO LOOK UP OUTPUT ||||||||||||",Result)
                sendSmsInput["from"] = self.app.conf.twilio.phoneNo // A number you bought from Twilio and can use for outbound communication

                if(Result.country_code=='CA' || Result.country_code=='US'){
                    console.log(new Date()," |||||||||| Result.country_code ||||||||||",Result.country_code)
                    sendSmsInput["from"]=self.app.conf.twilio.phoneNoUS
                }
                console.log(sendSmsInput,"sendSmsInputsendSmsInputsendSmsInputsendSmsInput")
                return self.twilio.sendMessage(sendSmsInput)
            }).then(function(call) {

                if (call) {
                    console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| ack Msg Send ||||||||||||||||||||||||||||');
                    successResponse.data=call
                    console.log('Message success! MSG SID: ' + call.sid);
                    resolve (successResponse)
                }
                else{
                    resolve (errResponse)
                }
            })
        })



}
SmsAction.prototype.retryMessages = function () {
    var self = this;
    self.qconn.on('ready', function () {
        console.log('Q connected');

            self.queue.sub('retryMessageHandler', function (bus, q) {
                self.retryMessageProcessor(bus).then(function (res) {
                    console.log('res for retry message :'+ bus.msgId+'DeviceId : '+ bus.deviceId);
                    console.log(res);
                    if(res.status){
                        q.shift()
                    }
                })
            })
        })




}



SmsAction.prototype.retryMessageProcessor =function(inputObj) {

    var self = this;
    var authenticates=null
    var authenticate={
        password:self.app.conf.orbcomm.password,
        username:self.app.conf.orbcomm.username
    }
    var sessionId=null;
    var orbcomm=null;
    var sendResTemp=null;
    var updatedTime = moment().format();
    var updatedTimeMillis = new Date(updatedTime).getTime();
    return new Promise(function (resolve, reject) {
        console.log(new Date()+':::::::|||||||||||||||||||||||||||||||||||||||||||||::::::::');
        console.log('retryMessageProcessor  : Entered');
        console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
        self.SmsService.saveReceivedSmsRetry(inputObj).then(function (updateRes) {

           return self.codanCommandsActions.sendAuth(authenticate)
        }).then(function (auth) {
            console.log(new Date()+':::::::|||||||||||||||||||||||||||||||||||||||||||||::::::::');
            console.log('retryMessageProcessor  : authenticates');
            console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
            if(auth.status!='ERROR'){
                inputObj.sessionId=auth.sessionId,
                   authenticates= auth;
                    console.log(inputObj,'send SMS To Device');
                return self.codanCommandsActions.sendCmd(inputObj)
            }

        }).then(function (sendRes) {
            sendResTemp=sendRes
            console.log(new Date()+':::::::|||||||||||||||||||||||||||||||||||||||||||||::::::::');
            console.log('retryMessageProcessor  : sendCmd');
            console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
            if(authenticates.status!='ERROR') {
                if(sendRes.status=='ERROR'){
                    console.log("||||||||||||||||||||||||||||| ERROR IN SERVER |||||||||||||||||||||||");
                    console.log("||||||||||||||||||||||||||||| ERROR IN SERVER |||||||||||||||||||||||");

                    var updateObjs = {
                        condition: {
                            conf_num: inputObj.conf_num
                        },
                        value: {
                            $set: {
                                updatedTime:updatedTimeMillis,
                                status:'SEND_ERROR',
                                messageState :9
                            }
                        },
                        options: {multi: false, upsert: true}
                    };

                    self.SmsService.updateReceivedSmsRetry(updateObjs);
                    if(sendRes.sessionId){
                        // self.codanCommandsActions.getScheduler(bus)
                    }
                    //q.shift();
                }
                else{

                    sessionId=sendRes.sessionId
                    orbcomm=sendRes
                    var updateObj = {
                        condition: {
                            conf_num: inputObj.conf_num
                        },
                        value: {
                            $set: {
                                sessionId: sendRes.sessionId ? sendRes.sessionId: '',
                                conf_num:sendRes.conf_num ? sendRes.conf_num:'',
                                // orbcommSendTime:updatedTimeMillis,
                                updatedTime:updatedTimeMillis,
                                status:'SENT',
                                messageState:3

                            }
                        },
                        options: {multi: false, upsert: true}
                    };
                 return self.SmsService.updateReceivedSmsRetry(updateObj)
                }

            }
            //ToDo Need puBnuB
        }).then(function (res) {
            if(sendResTemp.status!='ERROR') {
                var updateObj = {
                    condition: {
                        conf_num: inputObj.conf_num
                    },
                    value: {
                        $set: {
                            sessionId: sendResTemp.sessionId ? sendResTemp.sessionId : '',
                            conf_num: sendResTemp.conf_num ? sendResTemp.conf_num : '',
                            // orbcommSendTime:updatedTimeMillis,
                            updatedTime: updatedTimeMillis,

                        }
                    },
                    options: {multi: false, upsert: false}
                };
                return self.SmsService.updateReceivedSms2(updateObj)
            }
        })
            .then(function (res) {
                console.log(new Date()+':::::::|||||||||||||||||||||||||||||||||||||||||||||::::::::');
                console.log('Update Conf_Num Res  :',res);
                console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
                if(authenticates.status!='ERROR') {
                    if(inputObj.mobile){
                        orbcomm.messageFrom='SMS';

                    }else{
                        orbcomm.messageFrom='WEB'
                    }
                    orbcomm.messageState='SENT'
                    return self.codanCommandsActions.hashUpdate(orbcomm)
                }

            }).then(function (res) {
            resolve (res)
        })

        })

}



// SmsAction.prototype.sendSmsMessages = function (input) { //todo cmd by Ranjitha.V  (17-05-2017)
//     var self = this;
//
//     var responseObject = {};
//     var collectionName = "message_status";
//     var errResponse = {
//         status: false,
//         message: ""
//     };
//     var successResponse = {
//         status: true,
//         data:null,
//         message: null
//     };
//
//     var sendSmsInput ={}
//     return new Promise(function (resolve, reject) {
//         var rawMessage=input.data.response.Body.replace(/[ ;:]/, " ").split(' ')
//
//
//
//         var promise= self.twilio.sendMessage({
//             //to: '+919488985812', // Any number Twilio can deliver to
//             to: input.data.from, // Any number Twilio can deliver to
//             from: self.app.conf.twilio.phoneNo, // A number you bought from Twilio and can use for outbound communication
//             body:'Message to '+rawMessage[0] + ' ' + rawMessage[1] + ' has been '+ input.messageStates + ' '// body of the SMS message
//         });
//
//         promise.then(function(call) {
//
//             if (call) {
//                 console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| ack Msg Send ||||||||||||||||||||||||||||');
//                 successResponse.data=call
//                 console.log('Message success! MSG SID: ' + call.sid);
//                 resolve (successResponse)
//             }
//             else{
//                 resolve (errResponse)
//             }
//         })
//     })
//
//
//
// }

