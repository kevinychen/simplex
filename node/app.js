/**
 * Module dependencies.
 */

var config = require('./config');
var express = require('express');
var http = require('http');
var model = require('./model');
var passport = require('passport');
var path = require('path');
var routes = require('./routes');

var app = express();

app.set('port', config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: 'SIMPLEX'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(config.router);
app.use(app.router);

passport.use(config.strategy);
passport.serializeUser(function(user, done) { 
    done(null, user.name);
});
passport.deserializeUser(model.getTeam);

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.get('/', routes.home);
app.get('/register', routes.preregister);
app.post('/register', routes.register);
app.get('/login', routes.login);
app.post('/login', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login'
}));
app.get('/logout', routes.logout);

app.get('/rules', routes.rules);
app.get('/home', routes.home);
app.get('/section/:section', routes.section);
app.get('/puzzle/:section/:puzzle', routes.puzzle);
app.post('/puzzle/:section/:puzzle', routes.submit);

http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port " + app.get('port'));
});
