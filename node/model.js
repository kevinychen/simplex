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
