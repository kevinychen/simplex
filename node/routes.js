var model = require('./model');

const INVALID_PUZZLE_URL = 'http://rlv.zcache.com/404_error_memory_file_not_found_jigsaw_puzzle-r81117e109ee742e6a06397f39b392e4b_ambtl_8byvr_512.jpg';

exports.preregister = function(req, res) {
    res.render('register.ejs', {message: ''});
};

exports.register = function(req, res) {
    var teamname = req.body.username;
    var password = req.body.password;
    if (!teamname.match(/^[A-Za-z][A-Za-z0-9_]*$/)) {
        res.render('register.ejs', {message: 'Invalid team name.'});
    } else if (password !== req.body.confirmpassword) {
        res.render('register.ejs', {message: 'Passwords do not match.'});
    } else {
        model.register(teamname, password, function(error, result) {
            res.render('register.ejs', {message: result.message});
        });
    }
};

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
    model.canView(req.user.name, function(error, canView) {
        // only take sections that this team can see
        res.render('home.ejs', {
            team: req.user,
            sections: canView
        });
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
            url: puzzle ? puzzle.url : INVALID_PUZZLE_URL,
            message: ''
        });
    });
};

exports.submit = function(req, res) {
    model.submitAnswer(req.user.name, req.params.puzzle,
            req.body.answer, function(error, result) {
        res.render('puzzle.ejs', {
            team: req.user,
            section: req.params.section,
            puzzle: req.params.puzzle,
            url: result.puzzle ? result.puzzle.url : INVALID_PUZZLE_URL,
            message: result.message
        });
    });
};
