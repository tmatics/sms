/**
 * Created by ramvinoth on 14/7/16.
 */

var moment =require('moment');
var Promise = require('bluebird');
var CodanStatusActions = require('../actions/statuses-action.js');

/* ************************************************************************
 * Class Declaration
 * ***********************************************************************/

var SmsService = function (app) {
    this.app = app;
    this.db = app.mongoDb;
    this.objectId = app.mongoDb.ObjectId;
    this.codanStatusActions = new CodanStatusActions(app);
};

module.exports = SmsService;



/* ************************************************************************
 * Operation
 * ***********************************************************************/
SmsService.prototype.getUniqueId = function (input) {

    var self = this;
    var criteria = {};
    var criteria1 = {};
    criteria['condition'] = {type: input};
    criteria['options'] = {new: true};

    if (input == 'correlation') {
        criteria['value'] = {$inc: {corrId: 1}}
    }
    return new Promise(function(resolve,reject) {

        self.db.updateAsync('counters', criteria)
            .then(function (updateRes) {

                if (updateRes) {
                    criteria1['condition'] = {type: input};
                    return self.db.findOneAsync("counters", criteria1)
                }
                else{
                    reject("Couter value not determined");
                }

            })
            .then(function (countRes) {
                resolve(countRes)
            })
            .catch(function (e) {
                reject(e.message)
            })
    });
};


SmsService.prototype.saveSms= function (input) {
    var self=this;
    var resObj=null
    var createdTime = moment().format();
    var createdTimeMillis = new Date(createdTime).getTime();
    var saveObj={
        deviceId:input.messageFrom ? input.messageFrom : '',
        // From:input.messageFrom ? input.messageFrom : '',
        from:input.messageFrom ? input.messageFrom : '',
        messageId:input.messageId ? input.messageId : '',
        communicatorId:input.communicatorId ? input.communicatorId : '',
        accountId:input.accountId ? input.accountId : '',
        unitId:input.unitId ? input.unitId : '',

        messageDirection:"SENT",
        corrId:input.corrId,
        // smsTime:input.date ? input.date : '',
        messageFrom:'SMS',
        // date:input.date ? input.date : '',
        // toMobileNumber:input.toMobileNumber ? input.toMobileNumber : '',
        // To:input.toMobileNumber ? input.toMobileNumber : '',
        to:input.toMobileNumber ? input.toMobileNumber : '',
        // Message:input.message ? input.message : '',
        message:input.message ? input.message : '',
        assetId:input.assetId ? input.assetId : '',
        esnNumber:input.esnNumber ? input.esnNumber : '',
        sa:input.sa ? input.sa : '',
        status:'QUEUED',
        messageState:1,
        createdTime:createdTimeMillis,
        updatedTime:createdTimeMillis,
        country_code:input.country_code ? input.country_code : ''
    };
    return new Promise(function (resolve, reject) {
        self.db.saveAsync('message_status',saveObj).then(function(saveRes){
            console.log("||||||||||||||||||||||||||||||||||||||||||||| Send SMS Saved |||||||||||||||||||||||||||||||||||");
            console.log(saveObj);
            console.log("||||||||||||||||||||||||||||||||||||||||||||| Send SMS Save Result:" ,saveRes," |||||||||||||||||||||||||||||||||||");
            return saveRes
        }).then(function (saveRes) {
            resObj=saveRes
           return self.db.saveAsync('message_status_sms_history',saveObj)
        }).then(function (final) {
            console.log(saveObj.messageId,'Message Obj');
            resolve (saveObj)
        }).error(function(e){
            console.log(e);
        }).catch(function(e){
            console.log(e);
        })
    })


};

SmsService.prototype.saveFailedSms= function (saveObj) {
    var self=this;
    console.log('||||||||||||||||||||||||||||||||| ENTER For Faile Message Handler |||||||||||||||||||||||||||||||');
    return new Promise(function (resolve, reject) {
        self.db.saveAsync('failed_message',saveObj)
            .then(function(saveRes){
                console.log("|||||||||||||||||||||||||||||||||||||| SMS Failed and Save Successfully ||||||||||||||||||||||||||||");
                resolve(saveRes)

            }).catch(function(e){
            console.log('||||||||||||||||||||||||||||||||||||||| Catch In Failed Message Save |||||||||||||||||||||||||||||||||||||');
            console.log(e);
        })
    })
}

SmsService.prototype.saveReceivedSms= function (saveObj) {
        var self=this;
    var input=null;
    console.log(saveObj);
    return new Promise(function (resolve, reject) {
        self.db.saveAsync('message_status',saveObj)
            .then(function(saveRes){
                 input=saveRes._id;
                 console.log("|||||||||||||||||||||||||||||||||||||| SMS Received and Save Successfully ||||||||||||||||||||||||||||");
                 return saveRes
        }).then(function(saveRes){
            delete saveRes['_id']
            console.log("|||||||||||||||||||||||||||||||||||||| SMS Received and Save END ||||||||||||||||||||||||||||");
            console.log(saveRes);
            return self.db.saveAsync('message_status_sms_history',saveObj)
        }).then(function(res){
            console.log("|||||||||||||||||||||||||||||||||||||| SMS History Saved Successfully ||||||||||||||||||||||||||||");
            res._id=input
            resolve(res)
        })

    })

}
SmsService.prototype.saveReceivedSmsRetry= function (saveObj) {
        var self=this;
    var input=null;
    console.log(saveObj);
    return new Promise(function (resolve, reject) {
        self.db.saveAsync('message_status_retry',saveObj)
            .then(function(saveRes){
                 input=saveRes._id;
                 console.log("|||||||||||||||||||||||||||||||||||||| SMS Received and Save Successfully ||||||||||||||||||||||||||||");
                 return saveRes
        }).then(function(res){
            console.log("|||||||||||||||||||||||||||||||||||||| SMS History Saved Successfully ||||||||||||||||||||||||||||");
            res._id=input
            resolve(res)
        })

    })

}

SmsService.prototype.updateReceivedSms= function (saveObj) {
        var self=this;
    var input=null;
    console.log(saveObj);
    console.log(saveObj.condition.corrId);
    var findObj={
        condition:{
            corrId:saveObj.condition.corrId
        },
        requiredFields : {
           _id:0
        }

    }
    return new Promise(function (resolve, reject) {
        self.db.updateAsync('message_status',saveObj).then(function(saveRes){
            console.log("|||||||||||||||||||||||||||||||||||||| SMS Received and Save Successfully in update ||||||||||||||||||||||||||||");
            return saveRes
        }).then(function(saveRes){
            console.log("|||||||||||||||||||||||||||||||||||||| SMS Received and Save END ||||||||||||||||||||||||||||");
            console.log(saveRes);
            return self.db.findOneAsync('message_status',findObj)
        }).then(function(res){
            console.log("|||||||||||||||||||||||||||||||||||||| SMS Received and Save: Find RES ||||||||||||||||||||||||||||");
            console.log(res);
            if(res && res._id){
                delete res._id
            }
            return self.db.saveAsync('message_status_sms_history',res)
        }).then(function(history){
            console.log("|||||||||||||||||||||||||||||||||||||| SMS History Saved Successfully ||||||||||||||||||||||||||||");
            console.log(history);
            resolve(history)
        })

    })

}
SmsService.prototype.updateReceivedSmsRetry= function (saveObj) {
        var self=this;
    var input=null;
    console.log(saveObj);

    return new Promise(function (resolve, reject) {
        self.db.updateAsync('message_status_retry',saveObj).then(function(saveRes){
            console.log("|||||||||||||||||||||||||||||||||||||| SMS Received and Save Successfully in update ||||||||||||||||||||||||||||");
            return saveRes
        }).then(function(history){
            console.log("|||||||||||||||||||||||||||||||||||||| SMS History Saved Successfully ||||||||||||||||||||||||||||");
            console.log(history);
            resolve(history)
        })

    })

}


SmsService.prototype.updateSendSms= function (saveObj,bus) {
        var self=this;
    var input=null;
    var collection='message_status'
    var collection1='message_status_sms_history'
    if(bus.type=='ACK'){
     collection='sms_ack_status' ;
        collection1="sms_ack_status_history"
    }
    console.log(saveObj);
    console.log(saveObj.condition.sid);
    var findObj={
        condition:{
         sid:saveObj.condition.sid
        },
        requiredFields : {
           _id:0
        }

    }
    return new Promise(function (resolve, reject) {
        self.db.updateAsync(collection,saveObj).then(function(saveRes){
            console.log("|||||||||||||||||||||||||||||||||||||| SMS Send and Save Successfully in update ||||||||||||||||||||||||||||");
            return saveRes
        }).then(function(saveRes){
            console.log("|||||||||||||||||||||||||||||||||||||| SMS SEND and Save END ||||||||||||||||||||||||||||");
            console.log(saveRes);
            return self.db.findOneAsync(collection,findObj)
        }).then(function(res){
            delete res['_id']
            console.log("|||||||||||||||||||||||||||||||||||||| SMS SEND and Save: Find RES ||||||||||||||||||||||||||||");
            console.log(res);
            res.messageDirection='SENT'
            return self.db.saveAsync(collection1,res)
        }).then(function(history){
            console.log("|||||||||||||||||||||||||||||||||||||| SMS SEND History Saved Successfully ||||||||||||||||||||||||||||");
            console.log(history);
            resolve(history)
        })

    })

}


SmsService.prototype.deleteHash= function (removeObj) {
    var self = this;
    var input = null;
    console.log("Hash table record Removed Entered",removeObj);
    return new Promise(function (resolve, reject) {
       resolve (self.db.removeAsync('sms_message_hash', removeObj))
    })
}
SmsService.prototype.updateReceivedSms1= function (saveObj) {
    var self=this;
    var input=null;
    console.log(saveObj);

    var criteria1 = {
        condition:{}
    }



    return new Promise(function (resolve, reject) {
        self.db.updateAsync('message_status',saveObj)
            .then(function(saveRes){
            console.log("|||||||||||||||||||||||||||||||||||||| SMS Received and Save Successfully in update ||||||||||||||||||||||||||||");
            return saveRes;
        }).then(function(history){
            console.log("|||||||||||||||||||||||||||||||||||||| SMS History Saved Successfully ||||||||||||||||||||||||||||");
            console.log(history);
            resolve(history)
        })

    })

}
SmsService.prototype.updateReceivedSms2= function (saveObj) {
    var self=this;
    var input=null;
    console.log(saveObj);

    var responseObject ={}



    return new Promise(function (resolve, reject) {

        self.db.updateAsync('message_status',saveObj)
            .then(function(saveRes){
                console.log("|||||||||||||||||||||||||||||||||||||| SMS Received and Save Successfully in update ||||||||||||||||||||||||||||");
                if(saveRes){
                    responseObject["status"] = true
                    responseObject["data"] = saveRes
                    responseObject["message"] = "updated successfully"
                }
                else{
                    responseObject["status"] = false
                    responseObject["data"] = saveRes
                    responseObject["message"] = "not updated"
                }
                return responseObject;
            })
            .then(function(history){
                console.log("|||||||||||||||||||||||||||||||||||||| SMS History Saved Successfully ||||||||||||||||||||||||||||");
                console.log(history);
                resolve(history)
            })

     })

}

SmsService.prototype.updateSms= function (twilio,saveObj) {
    var self=this;
    if(twilio.date_updated){
        var createdTime = moment(twilio.date_updated);
        var updateTime = new Date(createdTime).getTime();
    }else{
        var createdTime = moment();
        var updateTime = new Date(createdTime).getTime();
    }


    if(twilio.status==400){
        var updateObj = {
            condition : {
                messageId:saveObj.messageId
            },
            value : {
                $set:{
                    status:twilio.status ? twilio.status : "-",
                    messageState:9,
                    communicatorId:saveObj.communicatorId ? saveObj.communicatorId : "-",
                    accountId:saveObj.accountId ? saveObj.accountId : "-",
                    updateTime:updateTime

                }
            },
            options : {multi : false, upsert : true}
        };
    }
    else {
        var updateObj = {
            condition: {
                messageId: saveObj.messageId
            },
            value: {
                $set: {
                    account_sid: twilio.account_sid ? twilio.account_sid : '',
                    status: 'SENT',
                    messageState: 3,
                    messageBody: twilio.body ? twilio.body : '',
                    sid: twilio.sid ? twilio.sid : "",
                    updateTime: updateTime,
                    communicatorId:saveObj.communicatorId ? saveObj.communicatorId : "-",
                    accountId:saveObj.accountId ? saveObj.accountId : "-",
                    twilioApiVersion: twilio.api_version ? twilio.api_version : ""

                }
            },
            options: {multi: false, upsert: true}
        };
        var hash={
            status:twilio.status ? twilio.status : "-",
            sid: twilio.sid ? twilio.sid : "",
            communicatorId:saveObj.communicatorId ? saveObj.communicatorId : "-",
        }
    }
    var findObj={
        condition :{
            messageId: saveObj.messageId ? saveObj.messageId:'-',
        }
    }
    return new Promise(function (resolve, reject) {
        console.log("Update Obj |||||||||||||||||||||||||||||", updateObj);
        self.db.updateAsync('message_status',updateObj)
            .then(function(upRes){
            console.log("||||||||||||||||||||||||||||||||||||||||||||| Send SMS Updated |||||||||||||||||||||||||||||||||||");
            console.log(upRes);
            console.log("||||||||||||||||||||||||||||||||||||||||||||| Send SMS Updated |||||||||||||||||||||||||||||||||||");
            console.log(twilio);
            console.log("||||||||||||||||||||||||||||||||||||||||||||| Send SMS Updated Result:" ,upRes," |||||||||||||||||||||||||||||||||||");
            return twilio
        }).then(function (res) {
        if(res.status=='400' || res.status==400){
        return res
        }else{
            return self.db.saveAsync('sms_message_hash',hash)
        }

        }).then(function (res) {
            console.log("|||||||||||||||||||||||||||||||||||||| SMS SEND and Save END ||||||||||||||||||||||||||||");
          
            console.log('33333333333333333333333333',findObj);
            return self.db.findOneAsync('message_status',findObj)
        }).then(function(res){
            delete res['_id']
            console.log("|||||||||||||||||||||||||||||||||||||| SMS SEND and Save: Find RES ||||||||||||||||||||||||||||");
            console.log(res);
            return self.db.saveAsync('message_status_sms_history',res)
        }).then(function(res){
            var input={
               lastSendSmsId: twilio.messageId,
                deviceId:saveObj.deviceId ? saveObj.deviceId : '-'
            }
           return input
        }).then(function(statusRes){
            resolve(statusRes)
        })
    })


}

SmsService.prototype.getEntityList1= function(collectionName,input){
    var self = this;

var responseObject ={};
        console.log(input,"criteria")
        console.log(collectionName,"collectionName")
        return new Promise(function (resolve, reject) {
            self.db.findAsync(collectionName, input)

                .then(function (result) {
                    if(result){
                        responseObject["status"] = true;
                        responseObject["message"] = "DATA AVAILABLE";
                        responseObject["data"] = result;
                        console.log(input,"INPUT");
                        if(input && input.limit){
                            responseObject["limit"] = Number(input.limit);
                        }
                        if(input && input.pageNo) {
                            responseObject["pageNo"] = Number(input.pageNo);
                        }
                        if(input && input.skip) {
                            responseObject["skip"] = Number(input.skip);
                        }

                        return responseObject;
                    }
                    else{
                        responseObject["status"] = false;
                        responseObject["message"] = "NO DATA";
                        responseObject["data"] = result;
                        return responseObject;
                    }
                })
                .then(function (result) {
                    console.log(result,"****************************************");

                    resolve(result)
                })

                .error(function (e) {
                    reject(e.message)
                })
                .catch(function (e) {
                    reject(e.message)
                })

        })

};

SmsService.prototype.getSmsList = function (collectionName,input) {
    var self = this;
    console.log(input,"criteria")
    console.log(collectionName,"collectionName")
    return new Promise(function (resolve, reject) {
        self.db.findAsync(collectionName, input)
            .then(function (result) {
                if(result){
                resolve (result[0])
                }
                else{
                resolve({status:false})
                }
            })
    })
}

SmsService.prototype.getSmsLists = function (collectionName,input) {
    var self = this;
    console.log(input,"criteria")
    console.log(collectionName,"collectionName")
    return new Promise(function (resolve, reject) {
        self.db.findAsync(collectionName, input)
            .then(function (result) {
                if(result){
                resolve (result)
                }
                else{
                resolve({status:false})
                }
            })
    })
}

SmsService.prototype.checkCount = function (input,collectionName) {
    var self = this;
    console.log("input",input,collectionName)
    return new Promise(function (resolve, reject) {
        self.db.countAsync(collectionName, input)
            .then(function (statusResult) {
                resolve(statusResult);
            })
            .catch(function (statusErr) {
                reject(statusErr)
            })
    })
};

SmsService.prototype.getOneDetails1 = function(collectionName,input){

    var self = this;
    var responseObject = {}

    return new Promise(function (resolve, reject) {

        if(input) {


            self.db.findOneAsync(collectionName, input)
                .then(function (result) {
                    console.log(result,"result")
                    if(result){

                        responseObject["data"]= result;
                        responseObject["status"]= true;
                        responseObject["message"] = "DATA AVAILABLE";
                        return responseObject;
                    }
                    else{
                        console.log("NO DATA")
                        responseObject["data"]= 0;
                        responseObject["status"]= false;
                        responseObject["message"] = "NO DATA";
                        return responseObject;
                    }


                })
                .then(function (result) {
                    resolve(result)
                })

                .catch(function (e) {
                    reject(e.message)
                })
        }
        else{
            resolve(null);
        }

    })

};
SmsService.prototype.updateData=function (updateObj,findObj,dbName,dbHistory) {
    var self=this;
    return new Promise(function (resolve, reject) {
        self.db.updateAsync(dbName,updateObj).then(function(updateres){
            console.log("||||||||||||||||||||||||||||||||||||||||||||| SMS state Saved |||||||||||||||||||||||||||||||||||");
            console.log(updateres);
            console.log("||||||||||||||||||||||||||||||||||||||||||||| SMS Result:" ,updateres," |||||||||||||||||||||||||||||||||||");
            // resolve(updateres)
        }).then(function (upRes) {
            return self.db.findOneAsync(dbName,findObj)
        }).then(function (findRes) {
            delete findRes['_id']
            console.log("||||||||||||||||||||||||||||||||||||||||||||| SMS History Saved |||||||||||||||||||||||||||||||||||");

            return self.db.saveAsync(dbHistory,findRes)
        }).then(function (result) {
            console.log("||||||||||||||||||||||||||||||||||||||||||||| SMS History Saved |||||||||||||||||||||||||||||||||||");
            var res={
                status:true
            }
            
            resolve (res)
        }).error(function(e){
            console.log(e);
            var res={
                status:false,
                error:e
            }
            resolve(res)
        }).catch(function(e){
            console.log(e);
        })
    })

};
SmsService.prototype.updateEntities = function(collectionName,input){
    var self = this;
    var responseObject = {}
    if(input) {

        return new Promise(function (resolve, reject) {
            //criteria["updatedTime"]=new Date().getTime()

            self.db.updateAsync(collectionName, input)
                .then(function (result) {
                    if(result){
                        console.log(new Date(),"|||||||||||UPDATED SUCCESSFULLY |||||||||||||||||")
                        responseObject ["data"] = 1;
                        responseObject["status"] = true ;
                        responseObject["message"] = "UPDATED SUCCESSFULLY" ;
                        return responseObject;
                    }
                    else{
                        console.log(new Date(),"||||||||||| NOT UPDATED ||||||||||||||||")

                        responseObject ["data"] = 0;
                        responseObject["status"] = false ;
                        responseObject["message"] = "ERROR IN UPDATING" ;
                        return responseObject;

                    }
                })
                .then(function (result) {
                    resolve(result)

                })
                .error(function (e) {
                    console.log("Update Error",e);
                    reject(e)
                })
                .catch(function (e) {
                    console.log("Catch Error",e);
                    reject(e)
                })

        })
    }
};

SmsService.prototype.createEntities = function(collectionName,input) {

    var self = this;
    var responseObject = {};
    if(input) {
        var criteria = input
        criteria.createdTime = new Date().getTime()
        criteria.updatedTime = new Date().getTime()
        console.log("create===================",collectionName)
        console.log("create===================",criteria)

        return new Promise(function (resolve, reject) {

            self.db.saveAsync(collectionName, criteria)
                .then(function (result) {
                    if(result){

                        console.log(new Date(),"| data saved successfully")

                        responseObject["data"]= result;
                        responseObject["status"]= true;
                        responseObject["message"] = "SAVED SUCCESSFULLY";
                        return responseObject;
                    }
                    else{
                        console.log(new Date(),"| data not saved")

                        responseObject["data"]= 0;
                        responseObject["status"]= false;
                        responseObject["message"] = "NOT SAVED";
                        return responseObject;
                    }

                })
                .then(function (result) {
                    resolve(result)

                })
                .error(function (e) {
                    reject(e.message)
                })
                .catch(function (e) {
                    reject(e.message)
                })

        })
    }
};
// SmsService.prototype.updateData=function (updateObj,findObj,dbName,dbHistory) {
//     var self=this;
//     return new Promise(function (resolve, reject) {
//         self.db.updateAsync(dbName,updateObj).then(function(updateres){
//             console.log("||||||||||||||||||||||||||||||||||||||||||||| Secure key file state Saved |||||||||||||||||||||||||||||||||||");
//             console.log(updateres);
//             console.log("||||||||||||||||||||||||||||||||||||||||||||| Secure key file Result:" ,updateres," |||||||||||||||||||||||||||||||||||");
//             resolve(updateres)
//         }).then(function (upRes) {
//             return self.db.findOneAsync(dbName,findObj)
//         }).then(function (findRes) {
//             delete findRes['_id']
//             console.log("||||||||||||||||||||||||||||||||||||||||||||| Secure key file History Saved |||||||||||||||||||||||||||||||||||");
//
//             return self.db.saveAsync(dbHistory,findRes)
//         }).then(function (result) {
//             console.log("||||||||||||||||||||||||||||||||||||||||||||| Secure key file History Saved |||||||||||||||||||||||||||||||||||");
//             resolve(result)
//         }).error(function(e){
//             console.log(e);
//         }).catch(function(e){
//             console.log(e);
//         })
//     })
//
// };
