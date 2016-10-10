
var logger = require('./logmodule');

var watson = require('watson-developer-cloud');

var watsonCredentials = {};

var symptomsClassifier;

function useFixedCredentials() {
	watsonCredentials.url = "https://gateway.watsonplatform.net/natural-language-classifier/api";
	watsonCredentials.username = "21c0d031-c210-403e-9d45-08df161bfe44";
	watsonCredentials.password =  "m8Ly4pitTeJu";
	watsonCredentials.classifier_id = "2a3230x98-nlc-4411";
}

function initSymptomsClassifier() {
	logger.log('verbose', "CLASSIFIER: " + watsonCredentials.classifier_id);
	if(process.env.VCAP_SERVICES) {
		var vcapServices = JSON.parse(process.env.VCAP_SERVICES);
		var nlc = vcapServices.natural_language_classifier[0];
		watsonCredentials.url = nlc.credentials.url;
		watsonCredentials.username = nlc.credentials.username;
		watsonCredentials.password = nlc.credentials.password;
		watsonCredentials.classifier_id = process.env.CLASSIFIER_ID;
	}
	else {
		useFixedCredentials();
	}
	symptomsClassifier = watson
			.natural_language_classifier({
				"url" : watsonCredentials.url,
				"username" : watsonCredentials.username,
				"password" : watsonCredentials.password,
				"version" : 'v1'
			});

}

initSymptomsClassifier();

exports.symptomsClassifier = symptomsClassifier;
exports.watsonCredentials = watsonCredentials;