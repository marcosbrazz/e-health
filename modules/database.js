
var cloudantModule = require('cloudant');
var logger = require('./logmodule');

var dbCredentials = {
	dbName : 'e-health-db'
};

var cloudant;

var db;

function useFixedCredentials() {
	dbCredentials.url = "https://d112bb1b-6a30-43ae-82f1-6cab239170b3-bluemix:83da698df30dae2091fc5cd6e68612ff75ce7c13a27fe334d41ed720821cfe21@d112bb1b-6a30-43ae-82f1-6cab239170b3-bluemix.cloudant.com";
	dbCredentials.port = 443;
	dbCredentials.user = "d112bb1b-6a30-43ae-82f1-6cab239170b3-bluemix";
	dbCredentials.password = "83da698df30dae2091fc5cd6e68612ff75ce7c13a27fe334d41ed720821cfe21";
	dbCredentials.host = "d112bb1b-6a30-43ae-82f1-6cab239170b3-bluemix.cloudant.com";
}

function initDBConnection() {
	if (process.env.VCAP_SERVICES) {
		var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
		var database = vcapServices.cloudantNoSQLDB[0];
		dbCredentials.host = database.credentials.host;
		dbCredentials.port = database.credentials.port;
		dbCredentials.user = database.credentials.username;
		dbCredentials.password = database.credentials.password;
		dbCredentials.url = database.credentials.url;

		cloudant = cloudantModule(dbCredentials.url);

		// check if DB exists if not create
		cloudant.db.create(dbCredentials.dbName, function(err, res) {
			if (err) {
				logger.log('warn', 'could not create db ', err.message);
				 logger.log('debug', null, err);
			}
			else {
				logger.log('info', 'Database ' + dbCredentials.dbName + ' successfuly created.\n', res);
			}
		});

		db = cloudant.use(dbCredentials.dbName);
		if (db === null) {
			logger.log('warn', 'Could not find Cloudant credentials in VCAP_SERVICES environment variable - data will be unavailable to the UI');
		}
	} else {
		 logger.log('warn', 'VCAP_SERVICES environment variable not set - data will be unavailable to the UI');
		 
		 useFixedCredentials();
		
		 cloudant = cloudantModule(dbCredentials.url);

		// check if DB exists if not create
		 cloudant.db.create(dbCredentials.dbName, function (err, res) {
			 if (err) { 
				 logger.log('warn', 'could not create db ', err.message);
				 logger.log('debug', null, err);
			 }
			 else {
				 logger.log('info', 'Database ' + dbCredentials.dbName + ' successfuly created.\n', res);
			 }
		 });

		 db = cloudant.use(dbCredentials.dbName);
	}
}

initDBConnection();

module.exports = db;