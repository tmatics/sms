var ENV =

  "development";
//    "client-templates";
//    "production";


/* ***********************************************************
 * Node Module Requirements
 * ***********************************************************/

var _ = require("underscore");


/* ***********************************************************
 * Conf - Properties - Options
 * ***********************************************************/
var env_conf = require('./conf/conf-' + ENV + '.js');


/* ***********************************************************
 * Conf
 * ***********************************************************/
var conf = {};
conf = _.extend(env_conf);

module.exports = conf;


