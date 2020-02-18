var pool = require("./pool");


function Polling(){
    this.populateUserList = function(){
        pool.query(`select userID from slot where meetingID='2'`, function(err,result){
        
        var userList = [];
    
        for(var index in result)
        {
            userList.push(result[index].userID);
        }
    
        console.log(userList);
        
    })
    return userList;
}
        
    }

//     createSlotList()
//     {
//         pool.query(`select * from slot where meetingID='2' and status='ACCEPTED'`, function(err,result){
        
//         // console.log(result)
//     });
// }


//get meeting length
// pool.query(`select meetingLength from meeting where meetingID='2'`, function(err,result){
        
//     var meetingLength = result.length;
// })


module.exports = Polling;