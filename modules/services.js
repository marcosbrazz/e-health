var logger = require('./logmodule');
var fs = require('fs');
var watson = require('./watson');
var db = require('./database');

var symptomsClassifier = watson.symptomsClassifier;
var watsonCredentials = watson.watsonCredentials;

module.exports.train = function(request, response) {
	var result = "";
	logger.log('verbose', "Training requested");
	var params = {
		language : "en",
		name : "SymptomClassifier",
		training_data : fs.createReadStream("./IntercurrenceTraining.csv")
	};

	symptomsClassifier.create(params, function(err, clazzResponse) {
		if (err) {
			logger.log('error', 'Error creating classifier', err);
			result = "Error on training. Check the logs.";
		} else {
			logger.log('debug', null, clazzResponse);
			result = "Training done! <p>Classifier ID: <b>" + clazzResponse.classifier_id + "</b></p>";
		}
		response.write(result);
		response.end();
	});
	return;
};

module.exports.getIntercurrences = function(request, response) {
	logger.log('debug', 'List intercurrences issued');
	var intercList = {data:[]};
	var i = 0;
	db.list(function(err, body) {
		if(!err) {
			var len = body.rows.length;
			logger.log('debug', 'total # of docs -> ' + len);
			if(len === 0) {
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
};

module.exports.postIntercurrences = function(request, response) {
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
};

function createResponseIntercurrence(document) {
	var responseIntercurrence = {
		patient: document.patient,
		intercurrence: document.intercurrence,
		timeOcurrence: document.timeOcurrence,
		severity: document.severity
	};
	return responseIntercurrence;
}