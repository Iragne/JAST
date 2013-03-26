var nconf = require('nconf');

 nconf.argv().env();

var file = nconf.get("conf-file");
nconf.file({ file:  file || 'config.json' });

 

 

var conf = nconf.get('conf');


module.exports = conf;


