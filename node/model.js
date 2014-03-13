var Firebase = require('firebase');
var root = new Firebase('https://simplex.firebaseIO.com');

// teamname: "team1"
// callback(error, [team object])
exports.getTeam = function(teamname, callback) {
    root.child('teams/' + teamname).once('value', function(teamSnapshot) {
        var team = teamSnapshot.val();
        team.name = teamname;
        callback(false, team);
    });
};

// callback(error, ["sec1", "sec2", ...])
exports.getSections = function(callback) {
    root.child('sections').once('value', function(sectionsSnapshot) {
        callback(false, sectionsSnapshot.val() || []);
    });
};

// section: "sec1"
// callback(error, ["puz1", "puz2", ...])
exports.getPuzzles = function(section, callback) {
    root.child('puzzles/' + section).once('value', function(puzzlesSnapshot) {
        callback(false, puzzlesSnapshot.val() || []);
    });
};

// puzzle: "puz1"
// callback(error, [puzzle object])
exports.getPuzzle = function(puzzle, callback) {
    root.child('pages/' + puzzle).once('value', function(puzzleSnapshot) {
        callback(false, puzzleSnapshot.val());
    });
};

// puzzle: "puz1", answer: "answer"
// callback(error, {puzzle: [puzzle object], correct: true, message: "Good job!"})
exports.submitAnswer = function(puzzle, answer, callback) {
    // TODO check the answer and update database if correct
    root.child('pages/' + puzzle).once('value', function(puzzleSnapshot) {
        callback(false, {
            puzzle: puzzleSnapshot.val(),
            correct: true,
            message: "Good job!"
        })
    });
};
