
module.exports = {

    api: {
        host: '0.0.0.0',
        port: '8642',
        routes: {
            cors: true
        }
    },

    database: {
        api: 'mongodb',
        host: '10.0.0.46',
        port: '56421',
        schema :'messages_new_prod',
        auth: false,
        username: '',
        password: ''
    },
    queue: {
        host: '10.0.0.46',
        port: '23231',
        login: 'guest',
        password: 'guest',
        vhost: '/'
    },
    log: {

        logglyEnabled: true,
        logglyOptions: // To Configure Loggly Transport
            {
                level: "info",
                inputToken: "e6d0f173-1486-44d0-8528-a9a437daf82a",
                subdomain: "stestmar2t"
            },
        logEnabled: true,
        logOptions: {
            level: 'warn',
            colorize: true
        }
    },
    twilio:{
        accountSid:"AC4c0d0ea6548ce7c9a20866dac82c637e",
        authToken:"6c04e8ad1c54f26ff5a12a42c3bd6d0b",
        phoneNo:"+1 7327163326",
        phoneNoUS:"+1 7327163326",
        queryUrl:'https://AC4c0d0ea6548ce7c9a20866dac82c637e:6c04e8ad1c54f26ff5a12a42c3bd6d0b@api.twilio.com/2010-04-01/Accounts/AC4c0d0ea6548ce7c9a20866dac82c637e/SMS/Messages/'

    },


    orbcomm:{
        username : 'codanprod',
        password : 'codanprod1'
    },
    modules : {
        trips : "Trips",
        maintenance : "Maintenance",
        users : "Users",
        vehicleStatus : "Status",
        pushify : "Pushify",
        entities:"Entities",
        promotions : "Promotions",
        drivers:"Drivers",
        notification:"Notification",
        webmessage:"Webmessage",
        codanstatus:"Codanstatus",
        codanentities:"Codanentities",
        commands:"Commands"
    },

    services : {
        serviceRegistry: {
            host: "10.0.0.66",
            port: 8500
        },
        servicePort: 8642
    }

};

