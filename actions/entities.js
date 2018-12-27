/**
 * Created by Ramvinoth on 08-08-2016.
 */
/**********************************************************************************
 *MODULES REQUIREMENT
 **********************************************************************************/



/***********************************************************************************
 * Class Declaration
 **********************************************************************************/
var EntityActions = function (app) {

    this.app = app;
    this.conf = app.conf;
    this.serviceFactory = app.serviceFactory;
};
module.exports = EntityActions;

/***********************************************************************************
 * Functions
 **********************************************************************************/

EntityActions.prototype.getUnitId = function(request) {
    console.log('|||||||||||||||||||||||||||||||||||||||||| GET UNIT Id|||||||||||||||||||||||||||||');
    console.log(request);
    var self = this;
    var req={deviceId:request.deviceId,
    Sa:request.sa,
        connectionState:"CONNECT",
        state:"CONNECT"
    }
    return new Promise(function(resolve,reject){
        console.log(req, self.serviceFactory.getServiceAsync(self.conf.modules.codanentities));

        self.serviceFactory.getServiceAsync(self.conf.modules.codanentities)
            .then(function(entityStub){
                entityStub.getV1UnitId(req)
                    .then(function(response){
                        console.log(response.body,'UnitId');
                        resolve(response.body)
                    })
            })
            .catch(function(e){
                console.log(new Date() + " | Catch in getV1UnitId " , e);
                reject(e)
            })
    });
};

EntityActions.prototype.getUnitDetails = function(request) {
    console.log('|||||||||||||||||||||||||||||||||||||||||| GET Device Id|||||||||||||||||||||||||||||',request.deviceId);

    var self = this;
    var req={unitId:request.deviceId
    
    }
    return new Promise(function(resolve,reject){
        console.log(req, self.serviceFactory.getServiceAsync(self.conf.modules.codanentities));

        self.serviceFactory.getServiceAsync(self.conf.modules.codanentities)
            .then(function(entityStub){
                entityStub.getV1GetUnitDetails(req)
                    .then(function(response){
                        console.log('|||||||||||||||||||||||||||||||||||||||||| codanentities Result|||||||||||||||||||||||||||||');
                        console.log(response.body);
                        console.log('|||||||||||||||||||||||||||||||||||||||||| codanentities Result End|||||||||||||||||||||||||||||');
                        resolve(response.body)
                    })
            })
            .catch(function(e){
                console.log(new Date() + " | Catch in getV1UnitId " , e);
                reject(e)
            })
    });
};