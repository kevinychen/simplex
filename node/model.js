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
function getSections(callback) {
    root.child('sections').once('value', function(sectionsSnapshot) {
        callback(false, sectionsSnapshot.val() || []);
    });
};
exports.getSections = getSections;

// teamname: "team1"
// callback(error, ["lev1", "lev2", ...])
exports.canView = function(teamname, callback) {
    root.child('teams/' + teamname + '/canView').once('value', function(canViewSnapshot) {
        getSections(function(err, sections) {
            var canViewIndex = canViewSnapshot.val() || 0;
            var canView = Array();
            for (var i = 0; i < sections.length; i++) {
                if (i <= canViewIndex) {
                    canView.push(sections[i]);
                }
            }
            callback(false, canView);
        });
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
function getPuzzle(puzzle, callback) {
    root.child('pages/' + puzzle).once('value', function(puzzleSnapshot) {
        callback(false, puzzleSnapshot.val());
    });
};
exports.getPuzzle = getPuzzle;

// teamname: "team1", puzzle: "puz1", answer: "answer"
// callback(error, {puzzle: [puzzle object], correct: true, message: "Good job!"})
exports.submitAnswer = function(teamname, puzzle, answer, callback) {
    getPuzzle(puzzle, function(error, puzzleObj) {
        if (!puzzleObj) {
            callback(false, {
                puzzle: puzzleObj,
                correct: false,
                message: "Invalid puzzle."
            });
        } else if (puzzleObj.answer !== answer) {
            callback(false, {
                puzzle: puzzleObj,
                correct: false,
                message: "Incorrect answer."
            });
        } else {
            // Correct answer!
            root.child('teams/' + teamname + '/solved/' + puzzle).set({
                time: Date.now()
            });
            // If is meta, update the sections that this team can view.
            if (puzzleObj.hasOwnProperty('unlocks')) {
                root.child('teams/' + teamname + '/canView').set(puzzleObj.unlocks);
            }
            callback(true, {
                puzzle: puzzleObj,
                correct: true,
                message: "Congratulations! That is correct!"
            });
        }
    });
};
