/**
 * Created by ramvinoth on 18/7/16.
 */
var _ =require("lodash");
var Promise = require('bluebird');

/***********************************************************************************
 * Class Declaration
 **********************************************************************************/
var CodanStatusActions = function (app) {

    this.app = app;
    this.conf = app.conf;
    this.serviceFactory = app.serviceFactory;
};
module.exports = CodanStatusActions;


/***********************************************************************************
 * Functions
 **********************************************************************************/


CodanStatusActions.prototype.codanStatus = function(request){
    console.log("||||||||||||||||||||||||||||||||||||||To Codan Statuses|||||||||||||||||||||||||||");
    console.log(request);
    console.log("||||||||||||||||||||||||||||||||||||||To Codan Statuses|||||||||||||||||||||||||||");

    var self = this;

    return new Promise(function(resolve,reject){
        console.log(request,"Input");
        self.serviceFactory.getServiceAsync(self.conf.modules.codanstatus)
            .then(function(statusStub){

                statusStub.putV1UpdateLastMessage(request)
                    .then(function(response){
                        resolve(response.body)
                    })
                    .catch(function(e){
                        console.log(new Date() + " | Catch in actions.sendMessageList- function " , e);
                        resolve(e)
                    });
            }).catch(function(e){
                console.log("Catch in putV1UpdateLastMessage " , e);
                reject(e)
            })
    });

};
CodanStatusActions.prototype.updateincommunicatorstatus = function(request){
    console.log("||||||||||||||||||||||||||||||||||||||To Codan Statuses|||||||||||||||||||||||||||");
    console.log(request);
    console.log("||||||||||||||||||||||||||||||||||||||To Codan Statuses|||||||||||||||||||||||||||");

    var self = this;

    return new Promise(function(resolve,reject){
        console.log(request,"Input");
        self.serviceFactory.getServiceAsync(self.conf.modules.codanstatus)
            .then(function(statusStub){

                statusStub.putUpdateincommunicatorstatus(request)
                    .then(function(response){
                        resolve(response.body)
                    })
                    .catch(function(e){
                        console.log(new Date() + " | Catch in actions.sendMessageList- function " , e);
                        resolve(e)
                    });
            }).catch(function(e){
                console.log("Catch in putV1UpdateLastMessage " , e);
                reject(e)
            })
    });

};
