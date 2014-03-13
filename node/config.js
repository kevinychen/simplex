var model = require('./model');
var LocalStrategy = require('passport-local').Strategy;

// Server listens to this port
exports.port = 8080;

// Router for handling security/permissions
exports.router = function(req, res, next) {
    if (req.user) {
        // TODO check if this team has access to this file
        next();
    } else {
        // TODO check if public has access to this file
        next();
    }
};

// Strategy for session authentication
exports.strategy = new LocalStrategy(function(teamname, password, callback) {
    model.getTeam(teamname, function(err, team) {
        if (err || team.password != password) {
            callback(null, false);
        } else {
            callback(null, team);
        }
    });
});

