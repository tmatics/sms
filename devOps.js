/**
 * Created by ramvinoth on 14/7/16.
 */

var Twilio = require('twilio');
var Promise = require('bluebird');
var ENV = process.env.ENV ? process.env.ENV : 'dev';

/*******************************************************************************************
 * Required module
 ******************************************************************************************/
var conf = require('./conf/' + (ENV) + '.js');

var client = new Twilio.RestClient(conf.twilio.accountSid, conf.twilio.authToken);


var promise = client.makeCall({
    to:'+16515556667777', // a number to call
    from:'+16518889999', // a Twilio number you own
    url:'https://demo.twilio.com/welcome/voice' // A URL containing TwiML instructions for the call
});

client.sendMessage({

    to:'+16515556677', // Any number Twilio can deliver to
    from: '+14506667788', // A number you bought from Twilio and can use for outbound communication
    body: 'word to your mother.' // body of the SMS message

}, function(err, responseData) { //this function is executed when a response is received from Twilio

    if (!err) { // "err" is an error received during the request, if any

        // "responseData" is a JavaScript object containing data received from Twilio.
        // A sample response from sending an SMS message is here (click "JSON" to see how the data appears in JavaScript):
        // http://www.twilio.com/docs/api/rest/sending-sms#example-1

        console.log(responseData.from); // outputs "+14506667788"
        console.log(responseData.body); // outputs "word to your mother."

    }
});
