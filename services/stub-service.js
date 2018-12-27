/**********************************************************************************
 *MODULES REQUIREMENT
 **********************************************************************************/


var Promise = require('bluebird');

/************************************************************************
 * Class Declaration
 * **********************************************************************/
var StubService = function (app) {

    this.app = app;
    this.conf = app.conf;
    this.serviceFactory = app.serviceFactory;
};
module.exports = StubService;



StubService.prototype.updateMessageCode = function(request){
    var self = this;
    console.log("Input from status ",request)

    return new Promise(function(resolve,reject){
        console.log(self.conf.modules.entities,"self.conf.modules.codanentities");
        self.serviceFactory.getServiceAsync(self.conf.modules.codanentities)
            .then(function(commandStub){
                //console.log(request,"Cmd Stub");
                commandStub.getV1UpdateMessageCode(request).then(function(response){
                    resolve(response.body)
                })
            })
            .catch(function(e){
                console.log(new Date() + " | Catch in getAuthenticateUrl " , e);
                reject(e)
            })
    });
}
StubService.prototype.updateMessageCode1 = function(request){
    var self = this;
    console.log("Input from status ",request)

    var responseObj ={}
    return new Promise(function(resolve,reject){
        console.log(self.conf.modules.entities,"self.conf.modules.codanentities");
        self.serviceFactory.getServiceAsync(self.conf.modules.codanentities)
            .then(function(commandStub){
                //console.log(request,"Cmd Stub");
                commandStub.getV1UpdateMessageCode(request)

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
            })
            .catch(function(e){
                console.log(new Date() + " | Catch in getAuthenticateUrl " , e);
                reject(e)
            })
    });
}
