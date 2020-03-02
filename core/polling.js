var pool = require("./pool");
const moment = require("moment");
var bcrypt = require("bcrypt");
const pollingSlot = require("./pollingSlot");
const pollingChit = require("./pollingChit");
const pollingBlock = require("./pollingBlock");

function Polling() {}


Polling.populateUserList=(meetingID) =>{
    
     return pool.query(`SELECT meetingID FROM meeting WHERE meetingID = ${meetingID}`).then(result =>{
        // if (err) {
        //     callback({ err: true, message: err }, null);
        // }
        // else {
            var i;
            var userList = [];
            console.log(result);
            for(i = 0; i <= result.length; i++)
            {
                userList. push(result[i]);
            }
            console.log("user list: " + userList);
            return userList;
        // }
    });
}

Polling.getMeetingLength=(meetingID) =>{

    return pool.query(`SELECT meetingLength FROM meeting WHERE meetingID = '${meetingID}'`).then(result =>{
        if (err) {
            callback({ err: true, message: err }, null);
        }
        else {
            return result;
        }
    });
}

Polling.buildChitList=(meetingID) =>
{
    
    var allChitList = [];

    return pool.query(`SELECT * FROM slot WHERE meetingID = ${meetingID}`).then(allSlots => {

        var i;
        
        for(i = 0; i <= allSlots.length; i++)
        {

            var tempSlot = new pollingSlot(allSlots[i]);
            var tempChitList = tempSlot.convertToChitList();

            var j;
            for(j = 0; j <= tempChitList.length; j++)
            {
                allChitList.push(tempChitList[j])
            }
        }
        return allChitList;
    })
   
}
    

Polling.buildGlobalChitList=(allSlots, usersList)=>
{
    bigChitList = []
    var i;
        for(i = 0; i <= usersList.length; i++)
        {
            tempChitList = []
            var j;
            for(j = 0; j <= allSlots.length; j++)
            {
                if(pollingChit.getUserID() == userList[i])
                {
                    tempChitList.append(allSlots[j])
                }
            bigChitList.append(tempChitList)
            }
        }

        return bigChitList
}

sortChits = (chitArray) =>
{
    var i;
    var j;
    for(i = 0; i <= chitArray.length; i++)
    {
        for(j = 0; j <= chitArray - i - 1; j++)
        {
            if(chitArray[j].getStartTime() > chitArray[j+1].getStartTime())
            {
                var temp = chitArray[j];
                chitArray[j] = chitArray[j+1];
                chitArray[j+1] = temp;
            }
            
        }
    }

    return chitArray;
}

Polling.buildGlobalBlockList = (globalChitList, meetingLength) =>
{
    var globalBlockList = [];
    var i;
    for(i = 0; i <= globalChitList.length; i++)
    {
        var tempBlockList = [];
        var sortedChitList = sortChits(globalChitList);
        var index = 0;
        var nextIndex = 1;
        while(nextIndex < sortedChitList.length)
        {
            var currentChit = sortedChitList[index];
            var miniSlotList = [];
            miniSlotList.push(currentChit);
            var blockLength = 1;
            var miniIndex = index;
            var miniNextIndex = nextIndex;
            while(blockLength != meetingLength && miniNextIndex < sortedChitList.length)
            {
                print(blockLength);
                if (sortedChitList[miniIndex].getDate() == sortedChitList[miniNextIndex].getDate())
                {
                    if(sortedChitList[miniIndex].getEndTime() == sortedChitList[miniNextIndex].getStartTime())
                    {
                        miniSlotList.push(sortedChitList[miniNextIndex]);
                        blockLength += 1;
                        miniIndex += 1;
                        miniNextIndex +=1;
                    }
                        
                    else
                    {
                        miniSlotList = [sortedChitList[miniNextIndex]];
                        miniIndex += 1;
                        miniNextIndex += 1;
                        blockLength = 1;
                    }
                }
                    
            }

            if(blockLength == meetingLength)
            {
                tempBlock = new pollingBlock(miniSlotList, meetingLength);
                tempBlockList.push(tempBlock);
            }
            index += 1;
            nextIndex += 1;
        }
            

        globalBlockList.push(tempBlockList);
    }
    return globalBlockList;
}

Polling.matchExists = (globalBlockList, currentBlockIndex, passedListCount) =>
{
    var listCount = passedListCount + 1;
    var currentBlock = globalBlockList[passedListCount][currentBlockIndex];
    
    var comparingListIndex;
    for(comparingListIndex = 0; comparingListIndex <= globalBlockList[listCount].length; comparingListIndex++)
    {
        var comparingBlock = globalBlockList[listCount][comparingListIndex]
        if(currentBlock.getDate() == comparingBlock.getDate() && currentBlock.getStartTime() == comparingBlock.getStartTime())
        {
            var match = true
            if(listCount < globalBlockList.length - 1)
            {
            match = matchExists(globalBlockList,comparingListIndex, listCount)
            }
            break;
        }
    }

    if(match == true)
    {
        return true;
    }
    else
    {
        return false;
    }

    
}



module.exports = Polling;