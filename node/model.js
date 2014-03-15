var fs = require('fs');
var Firebase = require('firebase');
var root = new Firebase('https://simplex.firebaseIO.com');
root.auth('VFB3L04HY1QgP4Idyh5iFd2hKcESbSPTayFliizO');

// map from team name to last submission time
var submissionTimeMap = Object();
const MIN_SUBMISSION_DELAY_TIME = 30000;  // milliseconds

function log(message) {
    fs.appendFile('simplex.log', message);
}

// teamname: "team1"
// password: "password"
// callback(error, {success: true, message: "Success!"})
exports.register = function(teamname, password, callback) {
    log("REGISTER time: " + Date.now() + ", team: " + teamname + ", result: ");
    root.child('teams').once('value', function(teamsSnapshot) {
        if (teamsSnapshot.hasChild(teamname)) {
            callback(true, {
                success: false,
                message: "That team name already exists."
            });
            log("DUPLICATE NAME\n");
        } else {
            teamsSnapshot.ref().child(teamname).set({password: password});
            callback(false, {success: true, message: "Success!"});
            log("SUCCESS\n");
        }
    });
};

// teamname: "team1"
// callback(error, ["member1", "member2", ...])
function getMembers(teamname, callback) {
    root.child('teams/' + teamname + '/members').once('value', function(membersSnapshot) {
        callback(false, membersSnapshot.val() || []);
    });
};
exports.getMembers = getMembers;

// teamname: "team1"
// members: ["member1", "member2", ...]
// callback(error, ["member1", "member2", ...])
exports.setMembers = function(teamname, members, callback) {
    root.child('teams/' + teamname + '/members').set(members);
    getMembers(teamname, callback);
};

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

// teamname: "team1", puzzle: "puz1"
// callback(error, true);
exports.solved = function(teamname, puzzle, callback) {
    root.child('teams/' + teamname + '/solved/').once('value', function(solvedSnapshot) {
        callback(false, solvedSnapshot.hasChild(puzzle));
    });
};

// teamname: "team1", puzzle: "puz1", answer: "answer"
// callback(error, {puzzle: [puzzle object], correct: true, message: "Good job!"})
exports.submitAnswer = function(teamname, puzzle, answer, callback) {
    var currentTime = Date.now();
    log("SUBMIT time: " + currentTime + ", team: " + teamname +
            ", puzzle: " + puzzle + ", answer: " + answer + ", result: ");
    getPuzzle(puzzle, function(error, puzzleObj) {
        // Make sure the team is not submitting too frequently
        if (submissionTimeMap.hasOwnProperty(teamname) &&
            submissionTimeMap[teamname] > currentTime - MIN_SUBMISSION_DELAY_TIME) {
                callback(false, {
                    puzzle: puzzleObj,
                    correct: false,
                    message: "Too frequent submissions. Please wait."
                });
                log("TOO FREQUENT SUBMISSION\n");
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
                log("HUNT HAS ENDED\n");
            } else if (!puzzleObj) {
                callback(false, {
                    puzzle: puzzleObj,
                    correct: false,
                    message: "Invalid puzzle."
                });
                log("INVALID PUZZLE\n");
            } else if (puzzleObj.answer !== answer) {
                callback(false, {
                    puzzle: puzzleObj,
                    correct: false,
                    message: "Incorrect answer."
                });
                log("INCORRECT\n");
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
                log("CORRECT!\n");
            }
        });
    });
};
