var pool = require('./pool');
var bcrypt = require('bcrypt');


function Join() { };

Join.prototype = {
    find: function (res, user = null, callback) {
        var meetingList = [];
        var pendingList = [];
        // to find list of meeting
        pool.query("select * from meeting", function (err, result) {
            for (let index = 0; index < result.length; index++) {
                var element = result[index];
                if (element) {
                    for (var i = 0; i < element.invitees.split(',').length; i++) {
                        if (element.invitees.split(',')[i] == user.username) {
                            meetingList.push({ meetingID: element.meetingID, invitationfrom: element.invitationfrom })
                        }
                    }
                }
            }

            syaHello()
        })
        function syaHello() {
            // to filter meeting list and to generate pending meeting request 
            if (meetingList.length > 0) {
                for (let a = 0; a < meetingList.length; a++) {
                    pool.query(`select * from slot where userID=${user.id} and meetingID=${meetingList[a].meetingID}`, function (err, result) {
                        if (err) {
                            return res.send(err)
                        }
                        else {
                            if (result.length == 0) {
                                pendingList.push(meetingList[a])
                                if (a + 1 == meetingList.length) {
                                    return callback(pendingList)
                                }
                            }
                            else {
                                if (a + 1 == meetingList.length) {
                                    return callback(pendingList)
                                }
                            }
                        }
                    })
                }

            }
            else {
                return callback(meetingList)
            }

        }

    },
    create: function (body, callback) {
        // to save data in database
        let sql = `INSERT INTO meeting SET ?`;
        pool.query(sql, body, function (err, result) {
            if (err) throw err;

            callback(result.insertId);
        });
    },
    accptMeetingList: function (res, user = null, callback) {
        var meetingList = [];
        var accepMeetingList = [];
        pool.query("select * from meeting", function (err, result) {
            for (let index = 0; index < result.length; index++) {
                var element = result[index];
                if (element) {
                    for (var i = 0; i < element.invitees.split(',').length; i++) {
                        if (element.invitees.split(',')[i] == user.username) {
                            meetingList.push({ meetingID: element.meetingID, invitationfrom: element.invitationfrom })
                        }
                    }
                }
            }
            findAcceptMeetingList()
        })
        // to find list of meeting that user has accepted
        function findAcceptMeetingList() {
            if (meetingList.length > 0) {
                for (let i = 0; i < meetingList.length; i++) {
                    pool.query(`select * from slot where userID=${user.id} and meetingID=${meetingList[i].meetingID}`, function (err, result) {
                        if (err) {
                            return res.send(err)
                        }
                        else {
                            if (result.length > 0) {
                                var d = (new Date(result[0].date)).toLocaleDateString()
                                accepMeetingList.push({ ...result[0], ...meetingList[i], date: d })
                                if (i + 1 == meetingList.length) {
                                    return callback(accepMeetingList)
                                }
                            }
                            else {
                                if (i + 1 == meetingList.length) {
                                    return callback(accepMeetingList)
                                }
                            }
                        }
                    })

                }
            }
            else {
                return callback(accepMeetingList)
            }
        }

    },
    // to list of candidate that has accepted meeting request
    accptMeetingListAsAdmin: function (res, user = null, callback) {
        var meetingList = [];
        pool.query(`select * from meeting where invitationfrom='${user.fullname}'`, function (err, result) {
            if (result.length > 0) {
                for (let index = 0; index < result.length; index++) {
                    var element = result[index];
                    pool.query("select day,date,timeStart,timeEnd,userID,meetingID,fullname,username from slot join users on slot.userID=users.id where meetingID=" + element.meetingID + "", function (err, record) {
                        if (record.length > 1) {
                            meetingList.push(...record)
                            if (index + 1 == result.length) {
                                return callback(meetingList)
                            }
                        }
                        else {
                            if (index + 1 == result.length) {
                                return callback(meetingList)
                            }
                        }
                    })

                }
            }
            else {
                callback(meetingList)
            }
        })


    }
}
module.exports = Join;