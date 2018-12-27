var conf = {};
/*******************************************************************************************
 * Environmental Arguments
 ******************************************************************************************/

var ENV = process.env.ENV ? process.env.ENV : 'dev';
var confFile = require('./conf/' + (ENV) + '.js');
// var serviceClientEnv = confFile ? confFile.env.serviceClient : 'dev';
var branch = confFile ? (confFile.env ? (confFile.env.branch ? confFile.env.branch : "master") : "master" ): 'master';

var file = __dirname+'/swagger.json';
var path = __dirname;
var repoTeamName = "client_microservice_" + ENV;

conf['ENV'] = ENV;
conf['file'] = file;
conf['path'] = path;
conf['repoTeamName'] = repoTeamName;
conf['branch'] = branch;

var BuildClient = require("tbuild-client");
new BuildClient(conf);