/**
 * Created by ramvinoth on 15/7/16.
 */
//var moment =require('moment');
//
//var x=['f',1,5]
//var day = moment('Fri, 15 Jul 2016 04:45:21 +0000')
//var createdTimeMillis = new Date(day).getTime()
//console.log(x);
//x.push('6')
//console.log(x);

// var fr='+61476856445'
// fr=fr.split('')
// fr.splice(0,1)
// fr=fr.join('')
// console.log(fr);



// var x=[{y:'sasasas'}]
// console.log('654654654 \n jfjh');


var temp='01.99';

console.log(temp.split('.'));
if(temp.split('.')[1]=='99'){
    console.log('poda');
}

console.log('Un235'.toString().toUpperCase());

// var request = require('request');
// var options = {
//     url: 'https://AC4c0d0ea6548ce7c9a20866dac82c637e:6c04e8ad1c54f26ff5a12a42c3bd6d0b@api.twilio.com/2010-04-01/Accounts/AC4c0d0ea6548ce7c9a20866dac82c637e/SMS/Messages/SM53c9fb5641fa46afbb11c7ac4ab6469d',
//     // qs: '',
//     // url:'https://google.com',
//     // headers: {'content-type': 'application/x-www-form-urlencoded'},
//     // json: true
// };
// request.get(options,function (result) {
//         console.log('[', Date(), '] ||||||||||||||||||| twillioResponce Get |||||||||||||||||');
//
//         console.log(result);
//     })


var twilio = require('twilio');
var Twilio = require('twilio');

var LookupsClient = require('twilio').LookupsClient;
var client = new LookupsClient('AC4c0d0ea6548ce7c9a20866dac82c637e', '6c04e8ad1c54f26ff5a12a42c3bd6d0b');

// client.phoneNumbers('+919488985812').get({
//     type: 'carrier'
// }, function(error, number) {
//     // console.log(number.carrier.type);
//     console.log(number);
//
// });


// var promise= client.phoneNumbers('+1-613-555-0177').get({
//     type: 'carrier'
// });
//
// promise.then(function(call) {
//     console.log('Message success! MSG SID: '+typeof call.country_code);
//     if(call){
//         return call
//     }
// }, function(error) {
//     console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//     console.log('Message failed!  Reason: '+error.message);
//     console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//
//     if(error){
//         return error
//     }
// })

//
// var PricingClient = require('twilio').PricingClient;
// var client = new PricingClient('AC4c0d0ea6548ce7c9a20866dac82c637e', '6c04e8ad1c54f26ff5a12a42c3bd6d0b');
//
// client.phoneNumbers.countries("US").get(function(err, country) {
//     country.phoneNumberPrices.forEach(function(phonePrices){
//         console.log(phonePrices.numberType + " " + phonePrices.currentPrice + "\n");
//     });
// });



// Download the Node helper library from twilio.com/docs/node/install
// These vars are your accountSid and authToken from twilio.com/user/account
// var accountSid = 'AC4c0d0ea6548ce7c9a20866dac82c637e';
// var authToken = "6c04e8ad1c54f26ff5a12a42c3bd6d0b";
//
// var client = require('twilio')(accountSid, authToken);
//
// client.availablePhoneNumbers("US").local.list({
//     // areaCode: "510"
// }, function(err, data) {
//     var number = data.availablePhoneNumbers[0];
//     console.log(data.availablePhoneNumbers[0].capabilities);
//     // client.incomingPhoneNumbers.create({
//     //     phoneNumber: number.phone_number
//     // }, function(err, purchasedNumber) {
//     //     console.log(purchasedNumber.sid);
//     // });
// });

// var MonitorClient = require('twilio').MonitorClient;
// var client = new MonitorClient(accountSid, authToken);
//
// client.events.get("AE21f24380625e4aa4abec76e39b14458d", function(error, event) {
//     console.log(event);
// });
var Converter = require("csvtojson").Converter;

var fs=require("fs");
//CSV File Path or CSV String or Readable Stream Object
var csvFileName="/home/vino/Downloads/test.csv";

//new converter instance
var csvConverter=new Converter({});

//end_parsed will be emitted once parsing finished
csvConverter.on("end_parsed",function(jsonObj){
    console.log(jsonObj); //here is your result json object
});

//read from file

// var client = new Twilio.RestClient('AC4c0d0ea6548ce7c9a20866dac82c637e', "6c04e8ad1c54f26ff5a12a42c3bd6d0b");
//
//
// var promise= client.sendMessage({
//     to: '+919488985812', // Any number Twilio can deliver to
//     // to: req.toMobileNumber, // Any number Twilio can deliver to
//     from: "+1 7327163326", // A number you bought from Twilio and can use for outbound communication
//     body: 'Test SMS' // body of the SMS message
// });
//
// return promise.then(function(call) {
//     console.log('Message success! MSG SID: '+call.sid);
//     console.log(JSON.stringify(call));
//     if(call){
//         return call
//     }
// }, function(error) {
//     console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//     console.log('Message failed!  Reason: '+error.message);
//     console.log('|||||||||||||||||||||||||||||||||||||||||||||||||||| Twlio Error ||||||||||||||||||||||||||||');
//
//     if(error){
//         return error
//     }
// });



//
// var accountSid = 'AC4c0d0ea6548ce7c9a20866dac82c637e';
// var authToken = "6c04e8ad1c54f26ff5a12a42c3bd6d0b";
// var client = require('twilio')(accountSid, authToken);
//
// client.usage.records.daily.list(function(err, data) {
//     console.log(data,'000000000000000');
//
//     data.usageRecords.forEach(function(record) {
//         // console.log(record);
//     });
// });

var x= '+919488985812'
var from='+919488985812'
from=from.split('');
from.splice(0,1);
from=from.join('')
console.log(from);