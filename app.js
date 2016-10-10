
// Modules
var logger = require('./modules/logmodule');
var services = require('./modules/services');

var routes = require('./routes');
var trainRoute = require('./routes/train');
var listIntercurrencesRoute = require('./routes/list_intercurrences');
var menuRoute = require('./routes/menu');

var express = require('express'), http = require('http'), path = require('path');
var app = express();


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

// development only
if ('development' == app.get('env')) {
	app.use(errorHandler());
}

// Routes
app.get('/', routes.index);
app.get('/train', trainRoute.train);
app.get('/intercurrences', listIntercurrencesRoute.list_intercurrences);
app.get('/menu', menuRoute.menu);

// Services
app.post('/api/train', services.train);
app.post('/api/intercurrence', services.postIntercurrences);
app.get('/api/intercurrence', services.getIntercurrences);


http.createServer(app).listen(app.get('port'), '0.0.0.0', function() {
	logger.log('info', 'Express server listening on port ' + app.get('port'));
});

module.exports = app;
