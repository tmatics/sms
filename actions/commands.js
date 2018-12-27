/**
 * Created by ramvinoth on 28/7/16.
 */
var _ =require("lodash");
var Promise = require('bluebird');

/***********************************************************************************
 * Class Declaration
 **********************************************************************************/
var CodanCommandsActions = function (app) {

    this.app = app;
    this.conf = app.conf;
    this.serviceFactory = app.serviceFactory;
};
module.exports = CodanCommandsActions;


/***********************************************************************************
 * Functions
 **********************************************************************************/


CodanCommandsActions.prototype.sendAuth = function(request){
    console.log("||||||||||||||||||||||||||||||||||||||authenticate|||||||||||||||||||||||||||");
    console.log(request);
    console.log("||||||||||||||||||||||||||||||||||||||authenticate|||||||||||||||||||||||||||");

    var self = this;
//var responseObj= {}
    return new Promise(function(resolve,reject){
        console.log(request,"Input");
        self.serviceFactory.getServiceAsync(self.conf.modules.commands)
            .then(function(statusStub){

                statusStub.getV1Authenticate(request)
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
}
CodanCommandsActions.prototype.sendAuth1 = function(request){
    console.log("||||||||||||||||||||||||||||||||||||||authenticate|||||||||||||||||||||||||||");
    console.log(request);
    console.log("||||||||||||||||||||||||||||||||||||||authenticate|||||||||||||||||||||||||||");

    var self = this;
var responseObj= {}
    return new Promise(function(resolve,reject){
        console.log(request,"Input");
        self.serviceFactory.getServiceAsync(self.conf.modules.commands)
            .then(function(statusStub){

                statusStub.getV1Authenticate(request)
                    .then(function(response){
                        if(response.body && response.body.status && response.body.status == "ERROR"){
                            console.log(new Date()," ||||||||| login failed")
                            responseObj["status"] =false
                            responseObj["data"] =response.body
                        }

                        else{
                            console.log(new Date()," ||||||||| login succeed |||||||||")

                            responseObj["status"] = true
                            responseObj["data"] =response.body
                        }
                        resolve(responseObj)
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
}
   CodanCommandsActions.prototype.sendCmd = function(request){
    console.log("||||||||||||||||||||||||||||||||||||||Send SMS to DEVICE|||||||||||||||||||||||||||");
    console.log(request);
    console.log("||||||||||||||||||||||||||||||||||||||END|||||||||||||||||||||||||||");

    var self = this;

    return new Promise(function(resolve,reject){
        console.log(request,"Input");
        self.serviceFactory.getServiceAsync(self.conf.modules.commands)
            .then(function(statusStub){

                statusStub.getV1SendMsg(request)
                    .then(function(response){
                        resolve(response.body)
                    })
                    .catch(function(e){
                        console.log(new Date() + " | Catch in actions.getV1SendMsg- function " , e);
                        resolve(e)
                    });
            }).catch(function(e){
                console.log("Catch in getV1SendMsg " , e);
                reject(e)
            })
    });
}
CodanCommandsActions.prototype.sendCmd1 = function(request){
    console.log("||||||||||||||||||||||||||||||||||||||Send SMS to DEVICE|||||||||||||||||||||||||||");
    console.log(request);
    console.log("||||||||||||||||||||||||||||||||||||||END|||||||||||||||||||||||||||");

    var self = this;
    var responseObj = {}

    return new Promise(function(resolve,reject){
        console.log(request,"Input");
        self.serviceFactory.getServiceAsync(self.conf.modules.commands)
            .then(function(statusStub){

                statusStub.getV1SendMsg(request)

                    .then(function(response){

                        if(response.body && response.body.status && response.body.status == "ERROR"){
                            console.log(new Date()," ||||||||| message code not updated")
                            responseObj["status"] =false
                            responseObj["data"] =response.body
                        }

                        else{
                            console.log(new Date()," ||||||||| message code updated")

                            responseObj["status"] = true
                            responseObj["data"] =response.body
                        }

                        resolve(responseObj)
                    })
                    .catch(function(e){
                        console.log(new Date() + " | Catch in actions.getV1SendMsg- function " , e);
                        resolve(e)
                    });
            }).catch(function(e){
                console.log("Catch in getV1SendMsg " , e);
                reject(e)
            })
    });
}
CodanCommandsActions.prototype.logout = function(request){
    console.log("||||||||||||||||||||||||||||||||||||||Send SMS to DEVICE and Loged Out|||||||||||||||||||||||||||");
    console.log(request);
    console.log("||||||||||||||||||||||||||||||||||||||END|||||||||||||||||||||||||||");

    var self = this;
    var req={
        sessionId:request
    }

    return new Promise(function(resolve,reject){
        console.log(req,"Input");
        self.serviceFactory.getServiceAsync(self.conf.modules.commands)
            .then(function(statusStub){

                statusStub.getV1Logout(req)
                    .then(function(response){
                        resolve(response.body)
                    })
                    .catch(function(e){
                        console.log(new Date() + " | Catch in actions.getV1SendMsg- function " , e);
                        resolve(e)
                    });
            }).catch(function(e){
                console.log("Catch in getV1SendMsg " , e);
                reject(e)
            })
    });
};
CodanCommandsActions.prototype.getScheduler = function(request){
    console.log("||||||||||||||||||||||||||||||||||||||Send Error SMS to DEVICE and Loged Out|||||||||||||||||||||||||||");
    console.log(request);
    console.log("||||||||||||||||||||||||||||||||||||||END|||||||||||||||||||||||||||");

    var self = this;
    var req={
        msgObj:request
    }

    return new Promise(function(resolve,reject){
        console.log(req,"Input");
        self.serviceFactory.getServiceAsync(self.conf.modules.commands)
            .then(function(statusStub){

                statusStub.getV1Scheduler(req)
                    .then(function(response){
                        resolve(response.body)
                    })
                    .catch(function(e){
                        console.log(new Date() + " | Catch in actions.getV1SendMsg- function " , e);
                        resolve(e)
                    });
            }).catch(function(e){
                console.log("Catch in getV1SendMsg " , e);
                reject(e)
            })
    });
};
CodanCommandsActions.prototype.hashUpdate = function(request){
    console.log("||||||||||||||||||||||||||||||||||||||Hash Table Updated|||||||||||||||||||||||||||");
    console.log(request);
    console.log("||||||||||||||||||||||||||||||||||||||END|||||||||||||||||||||||||||");

    var self = this;

    return new Promise(function(resolve,reject){
        self.serviceFactory.getServiceAsync(self.conf.modules.commands)
            .then(function(statusStub){
                console.log("||||||||||||||||||||||||||||||||||||||Command Stub Called|||||||||||||||||||||||||||");

                statusStub.getV1HashUpdate(request)
                    .then(function(response){
                        resolve(response.body)
                    })
                    .catch(function(e){
                        console.log(new Date() + " | Catch in actions.getV1SendMsg- function " , e);
                        resolve(e)
                    });
            }).catch(function(e){
                console.log("Catch in getV1SendMsg " , e);
                reject(e)
            })
    });
}