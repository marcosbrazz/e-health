
const logger = require('winston');
logger.level = process.env.LOG_LEVEL || 'debug';

var watson = require('watson-developer-cloud');

var watsonCredentials = {};

var fs = require('fs');

var routes = require('./routes');

var trainRoute = require('./routes/train');

var listIntercurrencesRoute = require('./routes/list_intercurrences');

var symptomsClassifier;

var express = require('express'), user = require('./routes/user'), http = require('http'), path = require('path');

var app = express();

var db;

var cloudant;

var dbCredentials = {
	dbName : 'e-health-db'
};

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var errorHandler = require('errorhandler');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(bodyParser.urlencoded({
	extended : true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/style', express.static(path.join(__dirname, '/views/style')));
// app.use('/scripts', express.static(path.join(__dirname, '/scripts')));

// development only
if ('development' == app.get('env')) {
	app.use(errorHandler());
}

function initSymptomsClassifier() {
	if(process.env.VCAP_SERVICES) {
		var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
		var nlc = vcapServices.natural_language_classifier[0];
		watsonCredentials.url = nlc.credentials.url;
		watsonCredentials.username = nlc.credentials.username;
		watsonCredentials.password = nlc.credentials.password;
		watsonCredentials.classifier_id = process.env.CLASSIFIER_ID;
	}
	else {
		watsonCredentials.url = "https://gateway.watsonplatform.net/natural-language-classifier/api";
		watsonCredentials.username = "21c0d031-c210-403e-9d45-08df161bfe44";
		watsonCredentials.password =  "m8Ly4pitTeJu";
		watsonCredentials.classifier_id = "2a3230x98-nlc-4411";
	}
	symptomsClassifier = watson
			.natural_language_classifier({
				"url" : watsonCredentials.url,
				"username" : watsonCredentials.username,
				"password" : watsonCredentials.password,
				"version" : 'v1'
			});

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

		cloudant = require('cloudant')(dbCredentials.url);

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
		 dbCredentials.url = "https://d112bb1b-6a30-43ae-82f1-6cab239170b3-bluemix:83da698df30dae2091fc5cd6e68612ff75ce7c13a27fe334d41ed720821cfe21@d112bb1b-6a30-43ae-82f1-6cab239170b3-bluemix.cloudant.com";
		 dbCredentials.port = 443;
		 dbCredentials.user = "d112bb1b-6a30-43ae-82f1-6cab239170b3-bluemix";
		 dbCredentials.password = "83da698df30dae2091fc5cd6e68612ff75ce7c13a27fe334d41ed720821cfe21";
		 dbCredentials.host = "d112bb1b-6a30-43ae-82f1-6cab239170b3-bluemix.cloudant.com";
		
		 cloudant = require('cloudant')(dbCredentials.url);

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
initSymptomsClassifier();

app.get('/', routes.index);
app.get('/train', trainRoute.train);
app.get('/intercurrences', listIntercurrencesRoute.list_intercurrences);

app.post('/api/train', function(request, response) {
	var result = "";
	logger.log('verbose', "Training requested");
	var params = {
		language : "en",
		name : "SymptomClassifier",
		training_data : fs.createReadStream("./IntercurrenceTraining.csv")
	};

	symptomsClassifier.create(params, function(err, response) {
		if (err) {
			logger.log('error', 'Error creating classifier', err);
		} else {
			logger.log('debug', null, response);
			classifier_id = response.classifier_id;
		}
	});
	result = "Training done!  Check the logs for more detail.";
	response.write(result);
	response.end();
	return;
});

app.post('/api/intercurrence', function(request, response) {
	logger.log('verbose', "Posted intercurrence: " + request.body.intercurrence);
	logger.log('verbose', "CLASSIFIER: : " + watsonCredentials.classifier_id);
	var intercRegister = {
		intercurrence: request.body.intercurrence,
		patient: "patient name", //TODO: SEND PATIENT NAME
		timeOcurrence: new Date().getTime() 
	};
	symptomsClassifier.classify({
		text : intercRegister.intercurrence,
		classifier_id : watsonCredentials.classifier_id
	}, function(err, result) {
		if (err) {
			logger.log('error', 'Error classifying intercurrence:', err);
		} else {
			logger.log('debug', 'Classifying API result', result);
			intercRegister.severity = result.top_class; 
			
			// save it
			db.insert(intercRegister, null, function(err, doc) {
				if(err) {
					logger.log('error', "Error when inserting: " + JSON.stringify(intercRegister), err);
					// TODO: abort operation and send user msg
				}
				else {
					logger.log('debug', "Intercurrence inserted: ", intercRegister);
				}
			});
		}
		
		response.json(result);
		response.end();
	});	

});

app.get('/api/intercurrence', function(request, response) {
	logger.log('debug', 'List intercurrences issued');
	var intercList = {data:[]};
	var i = 0;
	db.list(function(err, body) {
		if(!err) {
			var len = body.rows.length;
			logger.log('debug', 'total # of docs -> ' + len);
			if(len == 0) {
				// TODO Inform user there is no records
				logger.log('verbose', 'There is no intercurrences found');
				response.json(intercList);
				response.end();
			}
			else {
				body.rows.forEach(function(document) {
					db.get(document.id, {revs_info: true}, function(err, doc) {
						if(!err) {
							var responseInterc =  createResponseIntercurrence(doc);
							intercList.data.push(responseInterc);
						}
						else {
							//TODO: could not retrieve document #
							logger.log('error', 'Erro on getting doc ' + document.id, err);
						}
						i++;
						if(i >= len) {
							response.json(intercList);
							logger.log('verbose', 'ending response');
							response.end();
						}
					});
				});
			}
		}
		else {
			// TODO Send user error msg
			logger.log('error', 'Erro on listing docs', err);
		}
	});
	
});

function createResponseIntercurrence(document) {
	var responseIntercurrence = {
		patient: document.patient,
		intercurrence: document.intercurrence,
		timeOcurrence: document.timeOcurrence,
		severity: document.severity
	};
	return responseIntercurrence;
}

http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
	logger.log('info', 'Express server listening on port ' + app.get('port'));
});

module.exports = app;
