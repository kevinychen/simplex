var Firebase = require('firebase');
var root = new Firebase('https://simplex.firebaseIO.com');
root.auth('VFB3L04HY1QgP4Idyh5iFd2hKcESbSPTayFliizO');

// map from team name to last submission time
var submissionTimeMap = Object();
const MIN_SUBMISSION_DELAY_TIME = 30000;  // milliseconds

// teamname: "team1"
// callback(error, [team object])
exports.getTeam = function(teamname, callback) {
    root.child('teams/' + teamname).once('value', function(teamSnapshot) {
        var team = teamSnapshot.val();
        if (!team) {
            callback(true);
        } else {
            team.name = teamname;
            callback(false, team);
        }
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

// callback(error, true)
function running(callback) {
    root.child('running').once('value', function(runningSnapshot) {
        callback(false, runningSnapshot.val());
    });
};
exports.running = running;

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
        // Make sure the team is not submitting too frequently
        var currentTime = Date.now();
        if (submissionTimeMap.hasOwnProperty(teamname) &&
            submissionTimeMap[teamname] > currentTime - MIN_SUBMISSION_DELAY_TIME) {
                callback(false, {
                    puzzle: puzzleObj,
                    correct: false,
                    message: "Too frequent submissions. Please wait."
                });
                return;
            } else {
                submissionTimeMap[teamname] = currentTime;
            }

        // Check that the contest is running
        running(function(error, isRunning) {
            if (!isRunning) {
                callback(false, {
                    puzzle: puzzleObj,
                    correct: false,
                    message: "The Hunt has ended."
                });
            } else if (!puzzleObj) {
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
                    time: currentTime
                });
                // If is meta, update the sections that this team can view.
                if (puzzleObj.hasOwnProperty('unlocks')) {
                    root.child('teams/' + teamname + '/canView').set(
                            puzzleObj.unlocks);
                }
                callback(true, {
                    puzzle: puzzleObj,
                    correct: true,
                    message: "Congratulations! That is correct!"
                });
            }
        });
    });
};
