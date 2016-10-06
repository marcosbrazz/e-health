/**
 * Module dependencies.
 */
var watson = require('watson-developer-cloud');

var classifier_id; // TODO : ARMAZENAR NO BANCO DE DADOS PARA TEST:
					// 2a3230x98-nlc-4411

var fs = require('fs');

var routes = require('./routes');

var trainRoute = require('./routes/train');

var symptomsClassifier;

var express = require('express'), user = require('./routes/user'), http = require('http'), path = require('path');

var app = express();

var db;

var cloudant;

var dbCredentials = {
	dbName : 'my_sample_db'
};

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger = require('morgan');
var errorHandler = require('errorhandler');

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(logger('dev'));
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
	symptomsClassifier = watson
			.natural_language_classifier({
				"url" : "https://gateway.watsonplatform.net/natural-language-classifier/api",
				"password" : "m8Ly4pitTeJu",
				"username" : "21c0d031-c210-403e-9d45-08df161bfe44",
				"version" : 'v1'
			});

}

function initDBConnection() {

	if (process.env.VCAP_SERVICES) {
		var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
		// Pattern match to find the first instance of a Cloudant service in
		// VCAP_SERVICES. If you know your service key, you can access the
		// service credentials directly by using the vcapServices object.
		for ( var vcapService in vcapServices) {
			if (vcapService.match(/cloudant/i)) {
				dbCredentials.host = vcapServices[vcapService][0].credentials.host;
				dbCredentials.port = vcapServices[vcapService][0].credentials.port;
				dbCredentials.user = vcapServices[vcapService][0].credentials.username;
				dbCredentials.password = vcapServices[vcapService][0].credentials.password;
				dbCredentials.url = vcapServices[vcapService][0].credentials.url;

				cloudant = require('cloudant')(dbCredentials.url);

				// check if DB exists if not create
				cloudant.db.create(dbCredentials.dbName, function(err, res) {
					if (err) {
						console.log('could not create db ', err);
					}
				});

				db = cloudant.use(dbCredentials.dbName);
				break;
			}
		}
		if (db == null) {
			console
					.warn('Could not find Cloudant credentials in VCAP_SERVICES environment variable - data will be unavailable to the UI');
		}
	} else {
		console
				.warn('VCAP_SERVICES environment variable not set - data will be unavailable to the UI');
		// For running this app locally you can get your Cloudant credentials
		// from Bluemix (VCAP_SERVICES in "cf env" output or the Environment
		// Variables section for an app in the Bluemix console dashboard).
		// Alternately you could point to a local database here instead of a
		// Bluemix service.
		// dbCredentials.host = "REPLACE ME";
		// dbCredentials.port = REPLACE ME;
		// dbCredentials.user = "REPLACE ME";
		// dbCredentials.password = "REPLACE ME";
		// dbCredentials.url = "REPLACE ME";

		// cloudant = require('cloudant')(dbCredentials.url);

		// check if DB exists if not create
		// cloudant.db.create(dbCredentials.dbName, function (err, res) {
		// if (err) { console.log('could not create db ', err); }
		// });

		// db = cloudant.use(dbCredentials.dbName);
	}
}

// initDBConnection();
initSymptomsClassifier();

app.get('/', routes.index);
app.get('/train', trainRoute.train);

app.post('/api/train', function(request, response) {
	var result = "";
	console.log("Training requested");
	var params = {
		language : "en",
		name : "SymptomClassifier",
		training_data : fs.createReadStream("./IntercurrenceTraining.csv")
	};

	symptomsClassifier.create(params, function(err, response) {
		if (err) {
			console.error(JSON.stringify(err));
		} else {
			classifier_id = response.classifier_id;
			console.log(JSON.stringify(response));
		}
	});
	result = "Training done!  Check the logs for more detail.";
	response.write(result);
	response.end();
	return;
});

app.post('/api/intercurrence', function(request, response) {
	console.log("Posted intercurrence: " + request.intercurrence);
	symptomsClassifier.classify({
		text : request.intercurrence,
		classifier_id : process.env.CLASSIFIER_ID
	}, function(err, response) {
		if (err) {
			console.log('error:', err);
		} else {
			console.log(JSON.stringify(response, null, 2));
		}
		request.json(response);
	});

});

http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
	console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
