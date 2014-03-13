var model = require('./model');

exports.login = function(req, res) {
    res.render('login.ejs');
};

exports.logout = function(req, res) {
    req.session.regenerate(function() {
        req.logout();
        res.redirect('/login');
    });
};

exports.rules = function(req, res) {
    res.render('rules.ejs');
};

// The following functions all assume the team is logged in

exports.home = function(req, res) {
    model.getSections(function(error, sections) {
        res.render('home.ejs', {team: req.user, sections: sections});
    });
};

exports.section = function(req, res) {
    model.getPuzzles(req.params.section, function(error, puzzles) {
        res.render('section.ejs', {
            team: req.user,
            section: req.params.section,
            puzzles: puzzles
        });
    });
};

exports.puzzle = function(req, res) {
    model.getPuzzle(req.params.puzzle, function(error, puzzle) {
        res.render('puzzle.ejs', {
            team: req.user,
            section: req.params.section,
            puzzle: req.params.puzzle,
            url: puzzle.url,
            message: ''
        });
    });
};

exports.submit = function(req, res) {
    model.submitAnswer(req.params.puzzle, req.body.answer, function(error, result) {
        res.render('puzzle.ejs', {
            team: req.user,
            section: req.params.section,
            puzzle: req.params.puzzle,
            url: result.puzzle.url,
            message: result.message
        });
    });
};
