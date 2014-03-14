var model = require('./model');
var LocalStrategy = require('passport-local').Strategy;

// Server listens to this port
exports.port = 8080;

// Router for handling security/permissions
exports.router = function(req, res, next) {
    var parts = req.url.split('/');
    var page = parts[1];
    if (req.user) {
        var privatePages = ['section', 'puzzle'];
        if (privatePages.indexOf(page) != -1) {
            var section = parts[2];
            model.canView(req.user.name, function(error, canView) {
                if (canView.indexOf(section) != -1) {
                    next();
                } else {
                    res.type('txt').send('401 Not authorized');
                }
            });
        } else {
            next();
        }
    } else {
        var publicURLs = ['register', 'login', 'logout', 'rules'];
        if (publicURLs.indexOf(page) != -1) {
            next();
        } else {
            res.redirect('/login');
        }
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

